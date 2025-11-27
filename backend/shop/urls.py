# shop/urls.py
from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    MyCartView,
    CartAddItemView,
    CartRemoveItemView,
    RegisterView,
    LoginView,
    MeView,
    CustomTokenRefreshView,
    ContactView,
    NewsletterSubscribeView,
)

urlpatterns = [
    # Productos
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),
    # Auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="auth-refresh"),

    # Carrito
    path("cart/my/", MyCartView.as_view(), name="cart-my"),
    path("cart/add/", CartAddItemView.as_view(), name="cart-add"),
    path("cart/remove/", CartRemoveItemView.as_view(), name="cart-remove"),

    # Contacto + newsletter
    path("contact/", ContactView.as_view(), name="contact"),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="newsletter-subscribe"),
]