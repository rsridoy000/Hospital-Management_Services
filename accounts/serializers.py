from rest_framework import serializers
from .models import User
from patients.models import Patient

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'date_joined')
        read_only_fields = ('date_joined',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Fields for Patient profile
    age = serializers.IntegerField(required=False)
    gender = serializers.CharField(max_length=1, required=False)
    blood_group = serializers.CharField(max_length=5, required=False)
    address = serializers.CharField(required=False)
    phone_number = serializers.CharField(max_length=15, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role', 
                  'age', 'gender', 'blood_group', 'address', 'phone_number')

    def validate_role(self, value):
        if value not in [User.Role.PATIENT, User.Role.DOCTOR]:
            raise serializers.ValidationError("You can only register as a Patient or a Doctor.")
        return value

    def create(self, validated_data):
        patient_data = {
            'age': validated_data.pop('age', 0),
            'gender': validated_data.pop('gender', 'O'),
            'blood_group': validated_data.pop('blood_group', 'O+'),
            'address': validated_data.pop('address', 'Not Specified'),
            'phone_number': validated_data.pop('phone_number', '000'),
        }
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', User.Role.PATIENT)
        )
        
        # Create Patient profile automatically if role is PATIENT
        if user.role == User.Role.PATIENT:
            Patient.objects.create(user=user, **patient_data)
            
        return user
