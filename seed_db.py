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
from patients.models import Patient
from medicines.models import Medicine
from appointments.models import Appointment
from billing.models import Bill

def seed_data():
    print("Seeding database...")

    # 1. Create Departments
    dept_names = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics']
    depts = {}
    for name in dept_names:
        dept, _ = Department.objects.get_or_create(name=name, description=f"{name} Department")
        depts[name] = dept

    # 2. Create Medicines (10)
    medicines = [
        ('Paracetamol', 'Used to treat fever and mild to moderate pain (headache, period pain, toothache). It works by blocking pain signals in the brain.', '500mg'),
        ('Amoxicillin', 'A broad-spectrum antibiotic used to treat bacterial infections like chest infections (pneumonia), dental abscesses, and UTIs.', '250mg'),
        ('Metformin', 'Primary medication for Type 2 Diabetes. It helps lower blood sugar levels by improving the way your body handles insulin.', '500mg'),
        ('Atorvastatin', 'Used to lower cholesterol if you’ve been diagnosed with high blood cholesterol. It also helps prevent heart disease and stroke.', '20mg'),
        ('Omeprazole', 'Reduces the amount of acid your stomach makes. Used for heartburn, acid reflux, and stomach ulcers.', '20mg'),
        ('Lisinopril', 'An ACE inhibitor used to treat high blood pressure (hypertension) and heart failure. It helps relax your blood vessels.', '10mg'),
        ('Amlodipine', 'Used to treat high blood pressure and chest pain (angina). It belongs to a group of medicines called calcium channel blockers.', '5mg'),
        ('Azithromycin', 'An antibiotic used to treat various bacterial infections, including respiratory infections, skin infections, and ear infections.', '500mg'),
        ('Ibuprofen', 'A non-steroidal anti-inflammatory drug (NSAID). Used for pain relief from arthritis, swelling, and menstrual cramps.', '400mg'),
        ('Cetirizine', 'An antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, and sneezing.', '10mg'),
    ]
    for name, desc, unit in medicines:
        m, created = Medicine.objects.get_or_create(name=name, defaults={'description': desc, 'unit': unit})
        if not created:
            m.description = desc
            m.unit = unit
            m.save()

    # 3. Create Doctors (4)
    doctor_data = [
        ('dr_smith', 'Smith', 'John', 'Cardiology', 'Cardiologist', '10'),
        ('dr_doe', 'Doe', 'Jane', 'Neurology', 'Neurologist', '8'),
        ('dr_brown', 'Brown', 'Charlie', 'Orthopedics', 'Surgeon', '12'),
        ('dr_wilson', 'Wilson', 'Sarah', 'Pediatrics', 'Pediatrician', '5'),
    ]
    for username, last, first, dept_name, spec, exp in doctor_data:
        user, created = User.objects.get_or_create(
            username=username,
            email=f"{username}@hms.com",
            first_name=first,
            last_name=last,
            role='DOCTOR'
        )
        if created:
            user.set_password('pass123')
            user.save()
        
        Doctor.objects.get_or_create(
            user=user,
            department=depts[dept_name],
            specialization=spec,
            phone_number=f"01700{exp}0000",
            experience=int(exp),
            availability_status=True
        )

    # 4. Create Patients (5)
    patient_data = [
        ('patient1', 'Hasan', 'Rakib', 25, 'M', 'A+', 'Dhaka'),
        ('patient2', 'Islam', 'Nadia', 30, 'F', 'B+', 'Chittagong'),
        ('patient3', 'Ahmed', 'Sabbir', 45, 'M', 'O+', 'Sylhet'),
        ('patient4', 'Khatun', 'Fatema', 22, 'F', 'AB+', 'Rajshahi'),
        ('patient5', 'Rahman', 'Arif', 50, 'M', 'O-', 'Khulna'),
    ]
    for username, last, first, age, gen, bg, addr in patient_data:
        user, created = User.objects.get_or_create(
            username=username,
            email=f"{username}@gmail.com",
            first_name=first,
            last_name=last,
            role='PATIENT'
        )
        if created:
            user.set_password('pass123')
            user.save()

        p, _ = Patient.objects.get_or_create(
            user=user,
            age=age,
            gender=gen,
            blood_group=bg,
            address=addr,
            phone_number=f"01800{age}0000"
        )
        
        # Create an example bill for each patient
        Bill.objects.get_or_create(
            patient=p,
            amount=500.00 + (age * 10),
            payment_status='UNPAID'
        )

    print("Success: Database seeded with 10 medicines, 4 doctors, and 5 patients!")

if __name__ == '__main__':
    seed_data()
