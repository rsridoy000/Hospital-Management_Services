from rest_framework import serializers
from .models import Doctor
from accounts.serializers import UserSerializer

class DoctorSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    department_name = serializers.ReadOnlyField(source='department.name')
    department_code = serializers.ReadOnlyField(source='department.code')

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'user_details', 'department', 'department_name', 'department_code',
                  'specialization', 'education', 'position', 'phone_number', 
                  'experience', 'availability_status', 'available_hours', 
                  'consultation_fee', 'is_emergency')
