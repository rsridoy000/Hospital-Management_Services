from django.db import models
from doctors.models import Doctor
from patients.models import Patient

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    serial_number = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.serial_number:
            # Count existing appointments for this doctor on the same date
            existing_count = Appointment.objects.filter(
                doctor=self.doctor,
                appointment_date__date=self.appointment_date.date()
            ).count()
            self.serial_number = existing_count + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Appt {self.id} - Patient: {self.patient.user.last_name} with Dr. {self.doctor.user.last_name} (Serial: {self.serial_number})"
