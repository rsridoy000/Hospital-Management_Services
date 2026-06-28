from django.db import models
from django.conf import settings
from departments.models import Department

class Doctor(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='doctors')
    specialization = models.CharField(max_length=100)
    education = models.CharField(max_length=255, default="MBBS")
    position = models.CharField(max_length=100, default="Senior Consultant")
    phone_number = models.CharField(max_length=15)
    experience = models.PositiveIntegerField(help_text="Years of experience", default=5)
    availability_status = models.BooleanField(default=True)
    available_hours = models.CharField(max_length=100, default="9:00 AM - 5:00 PM")
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    is_emergency = models.BooleanField(default=False)

    def __str__(self):
        return f"Dr. {self.user.last_name} - {self.specialization}"
