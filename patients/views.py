from rest_framework import viewsets, permissions
from .models import Patient
from .serializers import PatientSerializer
from accounts.permissions import IsAdminOrReceptionist

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    def get_permissions(self):
        # Allow any authenticated user to access 'list' and 'retrieve'
        # get_queryset will handle the actual data filtering
        if self.action in ['create', 'destroy']:
            return [IsAdminOrReceptionist()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Patient.objects.none()
        if user.role == 'PATIENT':
            return Patient.objects.filter(user=user)
        # Admins or Receptionists can see all
        return Patient.objects.all()
