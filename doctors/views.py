from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Doctor
from .serializers import DoctorSerializer
from accounts.permissions import IsAdmin

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'availability_status', 'specialization']
    search_fields = ['user__first_name', 'user__last_name', 'specialization']

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        """ডাক্তার নিজের প্রোফাইল দেখতে ও আপডেট করতে পারবেন"""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found for this user.'}, status=404)

        if request.method == 'PATCH':
            serializer = DoctorSerializer(doctor, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # Update user-level fields if provided
                user = request.user
                updated = False
                if 'first_name' in request.data:
                    user.first_name = request.data['first_name']
                    updated = True
                if 'last_name' in request.data:
                    user.last_name = request.data['last_name']
                    updated = True
                if updated:
                    user.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)

        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='availability')
    def availability(self, request, pk=None):
        doctor = self.get_object()
        # Only the doctor themselves or an admin/receptionist can update
        if request.user != doctor.user and request.user.role not in ['ADMIN', 'RECEPTIONIST']:
            return Response({'error': 'Permission denied'}, status=403)

        status_val = request.data.get('availability_status')
        if status_val is not None:
            doctor.availability_status = status_val
            doctor.save()
            return Response({'status': 'availability updated', 'availability_status': doctor.availability_status})
        return Response({'error': 'availability_status field is required'}, status=400)

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
