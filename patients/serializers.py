from rest_framework import serializers
from .models import Patient
from accounts.serializers import UserSerializer

class PatientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = Patient
        fields = ('id', 'user', 'user_details', 'age', 'gender', 'blood_group', 'address', 'phone_number')
