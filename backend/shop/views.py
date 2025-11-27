# shop/views.py
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from django.core.mail import send_mail
from django.conf import settings

from .models import (
    Producto,
    Carrito,
    ItemCarrito,
    Cliente,
    NewsletterSubscriber,   # 👈 IMPORTANTE
)
from .serializers import (
    ProductoSerializer,
    CarritoSerializer,
    RegisterSerializer,
    UserSerializer,
)


# ---------- HELPER JWT ----------

def get_tokens_for_user(user: User):
    """
    Genera access + refresh para un usuario usando SimpleJWT.
    """
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ---------- PRODUCTOS ----------

class ProductListView(generics.ListAPIView):
    """
    Devuelve la lista de productos activos.
    Soporta filtros por:
      - ?cat=hoodies
      - ?search=hoodie
    """
    serializer_class = ProductoSerializer
    throttle_classes = []  # 👈 desactiva rate limit para esta vista

    def get_queryset(self):
        queryset = Producto.objects.filter(activo=True).order_by("-creado")

        category = self.request.query_params.get("cat")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(categoria=category)

        if search:
            queryset = queryset.filter(nombre__icontains=search)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """
    Devuelve el detalle de un producto por slug.
    """
    queryset = Producto.objects.filter(activo=True)
    serializer_class = ProductoSerializer
    lookup_field = "slug"      # 👈 clave: usamos el slug, no el id

# ---------- AUTH ----------

class RegisterView(generics.CreateAPIView):
    """
    Crea un nuevo usuario.
    La signal se encarga de crear Cliente y Carrito.
    Devuelve también tokens como el login.
    """
    permission_classes = [AllowAny]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data

        return Response(
            {
                "user": user_data,
                "access": tokens["access"],
                "refresh": tokens["refresh"],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Login flexible:

    - Si viene "email", busca el usuario por email y usa su username internamente.
    - Si viene "username", lo usa directo.
    - Frontend puede mandar solo { email, password } sin problema.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        username_input = (request.data.get("username") or "").strip()
        password = (request.data.get("password") or "").strip()

        if not password:
            return Response(
                {"detail": "La contraseña es obligatoria."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None

        # 1) Si vino email, busco el usuario por email y autentico con su username real
        if email:
            try:
                u = User.objects.get(email=email)
                user = authenticate(
                    request,
                    username=u.username,
                    password=password,
                )
            except User.DoesNotExist:
                user = None

        # 2) Si no vino email o falló, pruebo con username si lo mandaron
        if user is None and username_input:
            user = authenticate(
                request,
                username=username_input,
                password=password,
            )

        # 3) Si sigue siendo None -> credenciales inválidas
        if user is None:
            return Response(
                {"detail": "Credenciales inválidas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tokens = get_tokens_for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "access": tokens["access"],
            "refresh": tokens["refresh"],
        }
        return Response(data, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    Devuelve los datos del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CustomTokenRefreshView(TokenRefreshView):
    """
    /api/auth/refresh/ para refrescar el access token.
    """
    permission_classes = [AllowAny]


# ---------- HELPERS INTERNOS (CARRITO) ----------

def get_or_create_cliente_y_carrito(user: User) -> Carrito:
    """
    Devuelve el carrito asociado al usuario.
    Si no existe Cliente o Carrito (por alguna razón),
    los crea sobre la marcha para no romper el flujo.
    """
    try:
        cliente = user.cliente
    except Cliente.DoesNotExist:
        cliente = Cliente.objects.create(user=user)

    carrito = cliente.get_or_create_carrito()
    return carrito


# ---------- CARRITO DEL USUARIO LOGUEADO ----------

class MyCartView(APIView):
    """
    Devuelve el carrito del usuario logueado.
    Endpoint: GET /api/cart/my/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        carrito = get_or_create_cliente_y_carrito(request.user)
        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- CARRITO: AGREGAR ITEM ----------

class CartAddItemView(APIView):
    """
    Agrega un ítem al carrito.
    Espera:
    {
      "product_slug": "moss-jacket",
      "quantity": 1,
      "size": "M"   # opcional
    }

    Endpoint: POST /api/cart/add/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        carrito = get_or_create_cliente_y_carrito(user)

        product_slug = request.data.get("product_slug")
        if not product_slug:
            return Response(
                {"detail": "Falta el campo 'product_slug'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # cantidad
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        if quantity < 1:
            quantity = 1

        # talle (size/talle)
        size = request.data.get("size") or request.data.get("talle") or None
        if size == "":
            size = None

        producto = get_object_or_404(Producto, slug=product_slug, activo=True)

        # Buscar si ya existe item con ese producto y talle
        item, created = ItemCarrito.objects.get_or_create(
            carrito=carrito,
            producto=producto,
            talle=size,               # 👈 campo del modelo
            defaults={"cantidad": quantity},
        )

        if not created:
            item.cantidad += quantity
            item.save()

        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- CARRITO: REMOVER ITEM ----------

class CartRemoveItemView(APIView):
    """
    Resta cantidad o elimina un ítem del carrito.
    Espera el mismo body que CartAddItemView.

    Endpoint: POST /api/cart/remove/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        carrito = get_or_create_cliente_y_carrito(user)

        product_slug = request.data.get("product_slug")
        if not product_slug:
            return Response(
                {"detail": "Falta el campo 'product_slug'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # cantidad
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        if quantity < 1:
            quantity = 1

        # talle (size/talle)
        size = request.data.get("size") or request.data.get("talle") or None
        if size == "":
            size = None

        try:
            item = ItemCarrito.objects.get(
                carrito=carrito,
                producto__slug=product_slug,
                talle=size,
            )
        except ItemCarrito.DoesNotExist:
            return Response(
                {"detail": "Ese producto con ese talle no está en el carrito."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restar o eliminar
        if item.cantidad > quantity:
            item.cantidad -= quantity
            item.save()
        else:
            item.delete()

        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ---------- CONTACTO (FORMULARIO WEB) ----------

class ContactView(APIView):
    """
    Recibe el formulario de contacto y envía un correo al mail de la tienda.
    No requiere autenticación.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").strip()
        message = (request.data.get("message") or "").strip()

        if not name or not email or not message:
            return Response(
                {"detail": "Faltan datos: nombre, email o mensaje."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = f"Nuevo mensaje de contacto de {name}"
        body = (
            f"Nombre: {name}\n"
            f"Email: {email}\n\n"
            f"Mensaje:\n{message}"
        )

        try:
            send_mail(
                subject,
                body,
                settings.EMAIL_HOST_USER,
                [settings.EMAIL_HOST_USER],
                fail_silently=False,
            )
        except Exception as e:
            # Si Gmail falla, devolvemos 500 controlado
            return Response(
                {"detail": f"No se pudo enviar el correo: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "Mensaje enviado correctamente."},
            status=status.HTTP_200_OK,
        )


# ---------- NEWSLETTER ----------

class NewsletterSubscribeView(APIView):
    """
    Recibe un email y lo suscribe al newsletter.
    - Guarda el mail en la base de datos (si no existía).
    - Envía un mail de bienvenida al suscriptor.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()

        if not email:
            return Response(
                {"detail": "El email es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Guardar si no existe
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email
        )

        subject = "¡Gracias por suscribirte a los drops de Scuffers!"
        body = (
            "¡Hey!\n\n"
            "Te suscribiste al newsletter de Scuffers.\n"
            "Vas a recibir primero los nuevos drops, restocks y promos exclusivas.\n\n"
            "Nada de spam, solo streetwear.\n\n"
            "Scuffers."
        )

        try:
            send_mail(
                subject,
                body,
                settings.EMAIL_HOST_USER,  # desde tu mail de tienda
                [email],                   # al suscriptor
                fail_silently=False,
            )
        except Exception as e:
            # El mail puede fallar, pero el email ya quedó guardado.
            return Response(
                {
                    "detail": (
                        "Te suscribimos, pero hubo un problema al enviar "
                        "el mail de bienvenida."
                    ),
                    "error": str(e),
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {"detail": "Suscripción exitosa. Revisá tu mail 😉"},
            status=status.HTTP_200_OK,
        )