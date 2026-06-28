from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import AppointmentSerializer
from accounts.permissions import IsAdminOrReceptionist, IsDoctor, IsPatient

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['doctor', 'patient', 'status', 'appointment_date']
    ordering_fields = ['appointment_date', 'created_at']

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Appointment.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Role-based status change logic could be added here
        appointment.status = new_status
        appointment.save()
        return Response({'status': f'Appointment {new_status.lower()} successfully'})

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Appointment.objects.filter(patient__user=user)
        elif user.role == 'DOCTOR':
            return Appointment.objects.filter(doctor__user=user)
        return Appointment.objects.all()

    def get_permissions(self):
        return [permissions.IsAuthenticated()]
