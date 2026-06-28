import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_management.settings')
django.setup()

from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from django.contrib.auth import get_user_model

User = get_user_model()

# Get patient1
p_user = User.objects.filter(username='patient1').first()
patient = Patient.objects.get(user=p_user)

# Get dr_smith
d_user = User.objects.filter(username='dr_smith').first()
doctor = Doctor.objects.get(user=d_user)

# Create a pending appointment for tomorrow
appt_date = timezone.now() + timedelta(days=1)
appt = Appointment.objects.create(
    patient=patient,
    doctor=doctor,
    appointment_date=appt_date,
    status='PENDING'
)

print(f"Created pending appointment ID {appt.id} for {patient.user.first_name} with Dr. {doctor.user.last_name}")
