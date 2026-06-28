"""
Seed script: adds 7 demo doctors and 20 demo medicines to the database.
Run with: python seed_demo.py
"""
import os, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_management.settings')
django.setup()

from accounts.models import User
from doctors.models import Doctor
from departments.models import Department
from medicines.models import Medicine

print("=" * 55)
print("  Seeding Demo Data...")
print("=" * 55)

# ── 1. Ensure departments exist ────────────────────────────────────────────────
dept_data = [
    {"name": "Cardiology",       "code": "CARD"},
    {"name": "Neurology",        "code": "NEUR"},
    {"name": "Orthopedics",      "code": "ORTH"},
    {"name": "Pediatrics",       "code": "PEDI"},
    {"name": "Dermatology",      "code": "DERM"},
    {"name": "General Medicine", "code": "GENM"},
    {"name": "Gynecology",       "code": "GYNE"},
]
depts = {}
for d in dept_data:
    obj, created = Department.objects.get_or_create(code=d["code"], defaults={"name": d["name"]})
    depts[d["code"]] = obj
    print(f"  [Dept] {obj.name} {'(created)' if created else '(exists)'}")

print()

# ── 2. Create 7 demo doctors ───────────────────────────────────────────────────
doctors_data = [
    {
        "username": "dr_rahman",
        "first_name": "Abdur",
        "last_name": "Rahman",
        "email": "dr.rahman@hospital.demo",
        "specialization": "Cardiologist",
        "dept_code": "CARD",
        "fee": 800,
        "education": "MBBS, MD (Cardiology) - BSMMU",
        "available_hours": "Sat-Thu: 10AM-2PM",
        "position": "Senior Consultant",
        "experience": 12,
        "phone_number": "01711000001",
    },
    {
        "username": "dr_sultana",
        "first_name": "Nasrin",
        "last_name": "Sultana",
        "email": "dr.sultana@hospital.demo",
        "specialization": "Neurologist",
        "dept_code": "NEUR",
        "fee": 900,
        "education": "MBBS, MD (Neurology) - DMCH",
        "available_hours": "Sun-Thu: 9AM-1PM",
        "position": "Associate Professor",
        "experience": 10,
        "phone_number": "01711000002",
    },
    {
        "username": "dr_hossain",
        "first_name": "Kamal",
        "last_name": "Hossain",
        "email": "dr.hossain@hospital.demo",
        "specialization": "Orthopedic Surgeon",
        "dept_code": "ORTH",
        "fee": 1000,
        "education": "MBBS, MS (Orthopedics) - SSMC",
        "available_hours": "Mon-Fri: 3PM-7PM",
        "position": "Senior Consultant",
        "experience": 15,
        "phone_number": "01711000003",
    },
    {
        "username": "dr_begum",
        "first_name": "Farida",
        "last_name": "Begum",
        "email": "dr.begum@hospital.demo",
        "specialization": "Pediatrician",
        "dept_code": "PEDI",
        "fee": 600,
        "education": "MBBS, DCH (Pediatrics) - BICH",
        "available_hours": "Sat-Wed: 11AM-3PM",
        "position": "Consultant",
        "experience": 8,
        "phone_number": "01711000004",
    },
    {
        "username": "dr_khan",
        "first_name": "Iftekhar",
        "last_name": "Khan",
        "email": "dr.khan@hospital.demo",
        "specialization": "Dermatologist",
        "dept_code": "DERM",
        "fee": 700,
        "education": "MBBS, DDV (Dermatology) - SKMC",
        "available_hours": "Sun-Thu: 4PM-8PM",
        "position": "Consultant",
        "experience": 7,
        "phone_number": "01711000005",
    },
    {
        "username": "dr_ahmed",
        "first_name": "Tariqul",
        "last_name": "Ahmed",
        "email": "dr.ahmed@hospital.demo",
        "specialization": "General Physician",
        "dept_code": "GENM",
        "fee": 500,
        "education": "MBBS, FCPS (Medicine) - BSMMU",
        "available_hours": "Daily: 8AM-12PM",
        "position": "Senior Consultant",
        "experience": 20,
        "phone_number": "01711000006",
    },
    {
        "username": "dr_islam",
        "first_name": "Shahnaz",
        "last_name": "Islam",
        "email": "dr.islam@hospital.demo",
        "specialization": "Gynecologist",
        "dept_code": "GYNE",
        "fee": 850,
        "education": "MBBS, FCPS (Gynecology) - MMCH",
        "available_hours": "Sat-Thu: 2PM-6PM",
        "position": "Associate Consultant",
        "experience": 9,
        "phone_number": "01711000007",
    },
]

for d in doctors_data:
    user, u_created = User.objects.get_or_create(
        username=d["username"],
        defaults={
            "first_name": d["first_name"],
            "last_name": d["last_name"],
            "email": d["email"],
            "role": "DOCTOR",
        }
    )
    if u_created:
        user.set_password("Doctor@1234")
        user.save()

    doctor, d_created = Doctor.objects.get_or_create(
        user=user,
        defaults={
            "specialization": d["specialization"],
            "department": depts[d["dept_code"]],
            "consultation_fee": d["fee"],
            "education": d["education"],
            "available_hours": d["available_hours"],
            "position": d["position"],
            "experience": d["experience"],
            "phone_number": d["phone_number"],
            "is_emergency": False,
            "availability_status": True,
        }
    )
    print(f"  [Doctor] Dr. {user.first_name} {user.last_name} ({d['specialization']}) {'(created)' if d_created else '(exists)'}")

print()

# ── 3. Create 20 demo medicines ────────────────────────────────────────────────
medicines_data = [
    {"name": "Paracetamol 500mg",         "description": "Analgesic & antipyretic for fever and pain.", "unit": "Tablet"},
    {"name": "Amoxicillin 250mg",          "description": "Broad-spectrum antibiotic for bacterial infections.", "unit": "Capsule"},
    {"name": "Metformin 500mg",            "description": "Oral antidiabetic for Type 2 diabetes.", "unit": "Tablet"},
    {"name": "Atorvastatin 10mg",          "description": "Statin for lowering LDL cholesterol.", "unit": "Tablet"},
    {"name": "Omeprazole 20mg",            "description": "Proton pump inhibitor for acid reflux.", "unit": "Capsule"},
    {"name": "Amlodipine 5mg",             "description": "Calcium channel blocker for hypertension.", "unit": "Tablet"},
    {"name": "Azithromycin 500mg",         "description": "Macrolide antibiotic for respiratory infections.", "unit": "Tablet"},
    {"name": "Diclofenac 50mg",            "description": "NSAID for pain, inflammation and fever.", "unit": "Tablet"},
    {"name": "Ranitidine 150mg",           "description": "H2 blocker for gastric acid reduction.", "unit": "Tablet"},
    {"name": "Cetirizine 10mg",            "description": "Antihistamine for allergy and hay fever.", "unit": "Tablet"},
    {"name": "Ciprofloxacin 500mg",        "description": "Fluoroquinolone antibiotic for UTI and GI infections.", "unit": "Tablet"},
    {"name": "Losartan 50mg",              "description": "ARB for hypertension and kidney protection.", "unit": "Tablet"},
    {"name": "Dexamethasone 0.5mg",        "description": "Corticosteroid for inflammation and allergies.", "unit": "Tablet"},
    {"name": "Salbutamol Inhaler 100mcg",  "description": "Bronchodilator for asthma and COPD.", "unit": "Inhaler"},
    {"name": "Calcium + Vitamin D3 500mg", "description": "Supplement for bone health.", "unit": "Tablet"},
    {"name": "Insulin Glargine 100U/ml",   "description": "Long-acting insulin for diabetes.", "unit": "Vial"},
    {"name": "Fluconazole 150mg",          "description": "Antifungal for candida infections.", "unit": "Capsule"},
    {"name": "Metronidazole 400mg",        "description": "Antiprotozoal for gut infections.", "unit": "Tablet"},
    {"name": "Vitamin B-Complex",          "description": "Essential B vitamins for nerve health.", "unit": "Tablet"},
    {"name": "Ibuprofen 400mg",            "description": "NSAID for pain and inflammation.", "unit": "Tablet"},
]

for m in medicines_data:
    obj, created = Medicine.objects.get_or_create(
        name=m["name"],
        defaults={"description": m["description"], "unit": m["unit"]}
    )
    print(f"  [Medicine] {obj.name} {'(created)' if created else '(exists)'}")

print()
print("=" * 55)
print("  ✅ Done! 7 doctors and 20 medicines seeded.")
print("  Doctor login password: Doctor@1234")
print("=" * 55)
