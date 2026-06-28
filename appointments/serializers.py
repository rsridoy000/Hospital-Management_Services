from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source='doctor.user.last_name')
    patient_name = serializers.ReadOnlyField(source='patient.user.last_name')

    class Meta:
        model = Appointment
        fields = ('id', 'patient', 'patient_name', 'doctor', 'doctor_name', 
                  'appointment_date', 'status', 'serial_number', 'created_at')
        read_only_fields = ('serial_number', 'created_at')
