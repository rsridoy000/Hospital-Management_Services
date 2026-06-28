from rest_framework import viewsets, permissions
from .models import Prescription
from .serializers import PrescriptionSerializer
from accounts.permissions import IsDoctor

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Prescription.objects.filter(appointment__patient__user=user)
        elif user.role == 'DOCTOR':
            return Prescription.objects.filter(appointment__doctor__user=user)
        return Prescription.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [IsDoctor()]
        return [permissions.IsAuthenticated()]
