from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def login_view(request):
    return render(request, 'login.html')

def register_view(request):
    return render(request, 'register.html')

def dashboard_view(request):
    return render(request, 'dashboard.html')

def doctor_list_view(request):
    return render(request, 'doctors.html')

def appointment_list_view(request):
    return render(request, 'appointments.html')

def billing_view(request):
    return render(request, 'billing.html')
