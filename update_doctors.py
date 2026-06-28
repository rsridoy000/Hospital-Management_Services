import os
import django
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_management.settings')
django.setup()

from accounts.models import User
from departments.models import Department
from doctors.models import Doctor

def update_seed_data():
    print("Updating Doctor fees and emergency status...")
    
    # 3. Update Doctors (4)
    # Dr Smith (Cardiology) - Emergency, Fee: 1200
    smith = Doctor.objects.get(user__username='dr_smith')
    smith.is_emergency = True
    smith.consultation_fee = 1200.00
    smith.save()

    # Dr Doe (Neurology) - Fee: 1000
    doe = Doctor.objects.get(user__username='dr_doe')
    doe.consultation_fee = 1000.00
    doe.save()

    # Dr Brown (Orthopedics) - Fee: 800
    brown = Doctor.objects.get(user__username='dr_brown')
    brown.consultation_fee = 800.00
    brown.save()

    # Dr Wilson (Pediatrics) - Fee: 600
    wilson = Doctor.objects.get(user__username='dr_wilson')
    wilson.consultation_fee = 600.00
    wilson.save()

    print("Success: Doctor fees and emergency status updated!")

if __name__ == '__main__':
    update_seed_data()
