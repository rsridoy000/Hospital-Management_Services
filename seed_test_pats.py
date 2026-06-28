import os
import django
from django.utils import timezone
from datetime import timedelta

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_management.settings')
django.setup()

from accounts.models import User
from doctors.models import Doctor
from patients.models import Patient
from appointments.models import Appointment

def seed_test_patients():
    print("Creating 3 Test Patients and sending bookings to Dr. Smith...")
    
    smith = Doctor.objects.get(user__username='dr_smith')
    
    for i in range(1, 4):
        username = f"test_p{i}"
        user, created = User.objects.get_or_create(
            username=username,
            email=f"{username}@test.com",
            role='PATIENT'
        )
        if created:
            user.set_password('pass123')
            user.save()
            # Create Patient Profile
            Patient.objects.get_or_create(
                user=user, age=20+i, gender='M' if i%2==0 else 'F', phone_number=f"+88019000000{i}"
            )
            print(f"Created: {username}")

        # Send a Pending Booking to Dr. Smith
        pat = Patient.objects.get(user=user)
        Appointment.objects.create(
            patient=pat, doctor=smith,
            appointment_date=timezone.now() + timedelta(days=i),
            status='PENDING'
        )
        print(f"Sent booking for {username} to Dr. Smith")

if __name__ == '__main__':
    seed_test_patients()
