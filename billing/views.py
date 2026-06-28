from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Bill
from .serializers import BillSerializer
from accounts.permissions import IsAdminOrReceptionist

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Allow patients to pay their OWN bills
        if request.user.role == 'PATIENT':
            if instance.patient.user != request.user:
                return Response({'error': 'Permission denied'}, status=403)
            
            if 'paid' in request.data and request.data['paid'] is True:
                instance.payment_status = 'PAID'
                instance.save()
                return Response({'status': 'bill marked as paid'})
            return Response({'error': 'Patients can only perform payment'}, status=400)

        # Handle 'paid' flag for Admin/Receptionist as well
        if 'paid' in request.data and request.data['paid'] is True:
            instance.payment_status = 'PAID'
            instance.save()
            return Response({'status': 'bill marked as paid'})

        # Admin/Receptionist can do any partial update
        return super().partial_update(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Bill.objects.none()
        if user.role == 'PATIENT':
            return Bill.objects.filter(patient__user=user)
        return Bill.objects.all()

    def get_permissions(self):
        # Allow Authenticated for partial_update now, but check ownership inside the method
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminOrReceptionist()]
        return [permissions.IsAuthenticated()]
