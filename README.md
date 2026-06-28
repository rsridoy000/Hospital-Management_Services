# 🏥 CareSync — Hospital Management System

A premium, role-based hospital management web application built with **Django** and **Django REST Framework**.

---

## 🚀 How to Run (Easiest Way)

> **Just double-click `run_project.bat`** — it does everything automatically!

The script will:
1. ✅ Check if Python is installed
2. ✅ Create a virtual environment (`venv`)
3. ✅ Install all required packages
4. ✅ Set up the `.env` config file
5. ✅ Run database migrations
6. ✅ Create an admin account
7. ✅ Start the server and open the browser

---

## 📋 Requirements

- **Python 3.10 or higher** — [Download here](https://www.python.org/downloads/)
  - ⚠️ During installation, check **"Add Python to PATH"**
- **Internet connection** (only for first run, to install packages)

---

## 🔑 Default Login Accounts

| Role         | Username   | Password     |
|--------------|------------|--------------|
| Admin        | `admin`    | `admin123`   |
| Doctor       | `dr_smith` | `doctor123`  |
| Receptionist | `recep1`   | `recep123`   |
| Patient      | `patient1` | `patient123` |

---

## 🌐 Access the App

After running `run_project.bat`, open your browser and go to:

```
http://127.0.0.1:8000
```

---

## 🗂️ Project Structure

```
Hospital Management/
│
├── run_project.bat          ← Double-click to run everything
├── requirements.txt         ← Python package list
├── manage.py                ← Django management tool
├── .env                     ← Environment config (auto-created)
├── .env.example             ← Config template
├── db.sqlite3               ← SQLite database (auto-created)
│
├── accounts/                ← User authentication & roles
├── doctors/                 ← Doctor profiles & management
├── patients/                ← Patient records
├── appointments/            ← Appointment booking system
├── prescriptions/           ← Prescription management
├── billing/                 ← Billing & payment
├── medicines/               ← Medicine database
├── departments/             ← Hospital departments
│
├── templates/               ← HTML templates (dashboard, login, etc.)
│   ├── dashboard.html       ← Main role-based dashboard
│   ├── login.html           ← Login page
│   └── register.html        ← Registration page
│
└── static/css/base.css      ← Global CSS styles
```

---

## 👥 User Roles

| Role           | Capabilities |
|----------------|--------------|
| **Admin**      | Full access — manage all users, doctors, departments |
| **Doctor**     | Manage appointments, issue & update prescriptions, edit own profile |
| **Receptionist** | Book appointments, manage patients, generate bills |
| **Patient**    | View doctors, book appointments, view prescriptions & bills |

---

## 🛠️ Manual Setup (Alternative)

If `run_project.bat` doesn't work, run these commands manually:

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate it
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# 3. Install packages
pip install -r requirements.txt

# 4. Create .env file
copy .env.example .env

# 5. Run migrations
python manage.py migrate

# 6. Start server
python manage.py runserver
```

Then open: http://127.0.0.1:8000

---

## 📡 API Documentation

Once the server is running, visit:
```
http://127.0.0.1:8000/api/schema/swagger-ui/
```

---

## ⚙️ Tech Stack

- **Backend:** Django 5 + Django REST Framework
- **Auth:** JWT (SimpleJWT) + Session Auth
- **Database:** SQLite (default) / PostgreSQL (production)
- **Frontend:** Vanilla HTML/CSS/JavaScript (glassmorphism UI)
- **API Docs:** drf-spectacular (Swagger UI)
