# shop/urls.py
from django.urls import path

# Vistas ADMIN
from .views_admin import (
    AdminProductListCreateView,
    AdminProductDetailView,
    AdminOrdersListView,
    AdminOrderDetailView,
)

# Vistas principales (PÚBLICO / USER)
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
    MeShippingAddressView,
    CreateOrderView,
    MyOrdersView,
)

from .views import HealthCheckView

# Vistas de checkout (flujo viejo / MercadoPago)
from .views_checkout import (
    CreateOrderFromCartView,
    ConfirmShippingView,
    MercadoPagoCreatePreferenceView,
    MercadoPagoFeedbackView,
    MyOrdersListView,
    MyOrderDetailView,
    MercadoPagoWebhookView,
)

urlpatterns = [
    # --------------------
    # Productos (público)
    # --------------------
    path("products/", ProductListView.as_view(), name="product-list"),
    path("products/<slug:slug>/", ProductDetailView.as_view(), name="product-detail"),

    # --------------------
    # Autenticación
    # --------------------
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="auth-refresh"),

    # --------------------
    # Carrito
    # --------------------
    path("cart/my/", MyCartView.as_view(), name="cart-my"),
    path("cart/add/", CartAddItemView.as_view(), name="cart-add"),
    path("cart/remove/", CartRemoveItemView.as_view(), name="cart-remove"),

    # --------------------
    # Contacto + Newsletter
    # --------------------
    path("contact/", ContactView.as_view(), name="contact"),
    path(
        "newsletter/subscribe/",
        NewsletterSubscribeView.as_view(),
        name="newsletter-subscribe",
    ),

    # --------------------
    # Checkout (flujo viejo con views_checkout)
    # --------------------
    # 1) Crear pedido
    path(
        "checkout/create-order/",
        CreateOrderFromCartView.as_view(),
        name="checkout-create-order",
    ),
    path(
        "checkout/order/create/",
        CreateOrderFromCartView.as_view(),
        name="checkout-order-create",
    ),

    # 2) Confirmar datos de envío
    path(
        "checkout/confirm-shipping/",
        ConfirmShippingView.as_view(),
        name="checkout-confirm-shipping",
    ),
    path(
        "checkout/order/confirm-shipping/",
        ConfirmShippingView.as_view(),
        name="checkout-order-confirm-shipping",
    ),

    # 3) Crear preferencia de Mercado Pago
    path(
        "checkout/mp/<int:order_id>/",
        MercadoPagoCreatePreferenceView.as_view(),
        name="checkout-mp-create-preference",
    ),
    path(
        "checkout/mercadopago/preference/<int:order_id>/",
        MercadoPagoCreatePreferenceView.as_view(),
        name="checkout-mp-preference-legacy",
    ),

    # 4) Feedback de Mercado Pago
    path(
        "checkout/mp/feedback/",
        MercadoPagoFeedbackView.as_view(),
        name="checkout-mp-feedback",
    ),

    # --------------------
    # Mis pedidos (usuario) - FLUJO VIEJO (views_checkout)
    # --------------------
    path(
        "orders/",
        MyOrdersListView.as_view(),
        name="my-orders-list",
    ),
    path(
        "orders/<int:order_id>/",
        MyOrderDetailView.as_view(),
        name="my-orders-detail",
    ),

    # --------------------
    # Mis pedidos / crear pedido - FLUJO NUEVO (views.py)
    # --------------------
    path(
        "orders/my/",
        MyOrdersView.as_view(),
        name="orders-my",
    ),
    path(
        "orders/create/",
        CreateOrderView.as_view(),
        name="orders-create",
    ),

    # --------------------
    # Mi dirección (perfil Cliente)
    # --------------------
    path(
        "me/address/",
        MeShippingAddressView.as_view(),
        name="me-shipping-address",
    ),

    # --------------------
    # Admin interno - Productos
    # --------------------
    path(
        "admin/products/",
        AdminProductListCreateView.as_view(),
        name="admin-products",
    ),
    path(
        "admin/products/<int:pk>/",
        AdminProductDetailView.as_view(),
        name="admin-products-detail",
    ),

    # --------------------
    # Admin interno - Pedidos
    # --------------------
    path("admin/orders/", AdminOrdersListView.as_view(), name="admin-orders-list"),
    path(
        "admin/orders/<int:pk>/",
        AdminOrderDetailView.as_view(),
        name="admin-orders-detail",
    ),

    # --------------------
    # Webhook Mercado Pago
    # --------------------
    path("mp/webhook/", MercadoPagoWebhookView.as_view(), name="mp-webhook"),


    path("health/", HealthCheckView.as_view(), name="health-check"),
    
]