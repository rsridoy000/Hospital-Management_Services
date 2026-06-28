from rest_framework import serializers
from .models import Bill

class BillSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.user.get_full_name')

    class Meta:
        model = Bill
        fields = ('id', 'patient', 'patient_name', 'amount', 'payment_status', 'created_at')
        read_only_fields = ('created_at',)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bill amount must be greater than zero.")
        return value
