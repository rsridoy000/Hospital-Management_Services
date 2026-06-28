from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView, web_login, web_logout

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('web-login/', web_login, name='web_login'),
    path('web-logout/', web_logout, name='web_logout'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]
