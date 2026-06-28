from rest_framework import serializers
from .models import Prescription, PrescriptionMedicine

class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.ReadOnlyField(source='medicine.name')

    class Meta:
        model = PrescriptionMedicine
        fields = ('id', 'medicine', 'medicine_name', 'dosage', 'duration')

class PrescriptionSerializer(serializers.ModelSerializer):
    medicines = PrescriptionMedicineSerializer(many=True, required=False)
    doctor_name = serializers.ReadOnlyField(source='appointment.doctor.user.last_name')
    patient_name = serializers.ReadOnlyField(source='appointment.patient.user.last_name')

    class Meta:
        model = Prescription
        fields = ('id', 'appointment', 'doctor_name', 'patient_name', 'diagnosis', 'notes', 'medicines', 'created_at')

    def create(self, validated_data):
        medicines_data = self.context.get('view').request.data.get('medicines')
        prescription = Prescription.objects.create(**validated_data)
        if medicines_data:
            for med_data in medicines_data:
                PrescriptionMedicine.objects.create(prescription=prescription, **med_data)
        return prescription
