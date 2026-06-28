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
from prescriptions.models import Prescription, PrescriptionMedicine
from medicines.models import Medicine
from billing.models import Bill

def seed_demo_history():
    print("Preparing Demo History for Patient1...")
    
    p_user = User.objects.get(username='patient1')
    patient = Patient.objects.get(user=p_user)
    
    docs = Doctor.objects.all()
    if not docs:
        print("No doctors found. Run seed_db.py first.")
        return

    # 1. Create a Cancelled Appointment
    Appointment.objects.create(
        patient=patient, doctor=docs[0],
        appointment_date=timezone.now() - timedelta(days=2),
        status='CANCELLED'
    )
    
    # 2. Create a Completed Appointment (Visit)
    appt_done = Appointment.objects.create(
        patient=patient, doctor=docs[1],
        appointment_date=timezone.now() - timedelta(days=5),
        status='COMPLETED'
    )
    
    # 3. Create a Prescription for the Completed Visit
    pres = Prescription.objects.create(
        appointment=appt_done,
        diagnosis="Common Flu & Fever",
        notes="Rest for 3 days. Drink warm water."
    )
    
    # Add medicines to prescription
    meds = Medicine.objects.all()[:2]
    if meds:
        PrescriptionMedicine.objects.create(prescription=pres, medicine=meds[0], dosage="1+0+1", duration="5 days")
        PrescriptionMedicine.objects.create(prescription=pres, medicine=meds[1], dosage="0+0+1", duration="3 days")

    # 4. Create Unpaid and Paid Bills
    Bill.objects.get_or_create(patient=patient, amount=1200.00, payment_status='UNPAID')
    Bill.objects.get_or_create(patient=patient, amount=450.00, payment_status='PAID')

    print("Success: patient1 now has 1 cancelled, 1 completed visit, 1 prescription, and 2 bills!")

if __name__ == '__main__':
    seed_demo_history()
