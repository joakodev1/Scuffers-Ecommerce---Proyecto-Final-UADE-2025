from decimal import Decimal
import json
import mercadopago

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.core.mail import send_mail
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, status, serializers
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    IsAdminUser,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import (
    Producto,
    Carrito,
    ItemCarrito,
    Cliente,
    NewsletterSubscriber,
    Pedido,
    OrderItem,
    Payment,
)
from .serializers import (
    ProductoSerializer,
    CarritoSerializer,
    RegisterSerializer,
    UserSerializer,
    ClienteAddressSerializer,
    PedidoDetailSerializer,
)

# ============================
# SERIALIZER ADMIN PRODUCTO
# ============================
class AdminProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = (
            "id",
            "nombre",
            "slug",
            "precio",
            "categoria",
            "tag",
            "activo",
        )


# ---------- HELPER JWT ----------
def get_tokens_for_user(user: User):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ---------- PRODUCTOS ----------
class ProductListView(generics.ListAPIView):
    serializer_class = ProductoSerializer
    throttle_classes = []

    def get_queryset(self):
        queryset = Producto.objects.filter(activo=True).order_by("-id")

        category = self.request.query_params.get("cat")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(categoria=category)

        if search:
            queryset = queryset.filter(nombre__icontains=search)

        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Producto.objects.filter(activo=True)
    serializer_class = ProductoSerializer
    lookup_field = "slug"


# ---------- AUTH ----------
class RegisterView(generics.CreateAPIView):
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

        if user is None and username_input:
            user = authenticate(
                request,
                username=username_input,
                password=password,
            )

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
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        )


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


# ---------- HELPERS INTERNOS (CARRITO) ----------
def get_or_create_cliente_y_carrito(user: User) -> Carrito:
    try:
        cliente = user.cliente
    except Cliente.DoesNotExist:
        cliente = Cliente.objects.create(user=user)

    carrito = cliente.get_or_create_carrito()
    return carrito


# ---------- CARRITO DEL USUARIO LOGUEADO ----------
class MyCartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        carrito = get_or_create_cliente_y_carrito(request.user)
        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- CARRITO: AGREGAR ITEM ----------
class CartAddItemView(APIView):
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

        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        if quantity < 1:
            quantity = 1

        size = request.data.get("size") or request.data.get("talle") or None
        if size == "":
            size = None

        producto = get_object_or_404(Producto, slug=product_slug, activo=True)

        item, created = ItemCarrito.objects.get_or_create(
            carrito=carrito,
            producto=producto,
            talle=size,
            defaults={"cantidad": quantity},
        )

        if not created:
            item.cantidad += quantity
            item.save()

        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- CARRITO: REMOVER ITEM ----------
class CartRemoveItemView(APIView):
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

        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        if quantity < 1:
            quantity = 1

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

        if item.cantidad > quantity:
            item.cantidad -= quantity
            item.save()
        else:
            item.delete()

        serializer = CarritoSerializer(carrito)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------- CONTACTO ----------
class ContactView(APIView):
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

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or getattr(
            settings, "EMAIL_HOST_USER", None
        )
        to_email = [getattr(settings, "EMAIL_HOST_USER", None) or email]

        if not from_email or not to_email[0]:
            return Response(
                {
                    "detail": "El servidor de correo no está configurado correctamente."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            send_mail(
                subject,
                body,
                from_email,
                to_email,
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"detail": f"No se pudo enviar el correo: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"detail": "Mensaje enviado correctamente."},
            status=status.HTTP_200_OK,
        )

class NewsletterSubscribeView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()

        if not email:
            return Response(
                {"detail": "El email es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or getattr(
            settings, "EMAIL_HOST_USER", None
        )

        try:
            if from_email:
                send_mail(
                    subject,
                    body,
                    from_email,
                    [email],
                    fail_silently=False,
                )
            else:
                # si no hay mail configurado, igual devuelvo success
                # pero aviso
                return Response(
                    {
                        "detail": "Suscripción exitosa, pero el mail de bienvenida no se pudo enviar por un problema de configuración.",
                    },
                    status=status.HTTP_200_OK,
                )
        except Exception as e:
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


# ============================
# ADMIN: CRUD de Productos
# ============================
class AdminProductListCreateView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        productos = Producto.objects.all().order_by("-id")
        serializer = AdminProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = AdminProductoSerializer(data=request.data)
        if serializer.is_valid():
            producto = serializer.save()
            return Response(
                AdminProductoSerializer(producto).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProductDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return Producto.objects.get(pk=pk)
        except Producto.DoesNotExist:
            return None

    def get(self, request, pk, *args, **kwargs):
        producto = self.get_object(pk)
        if not producto:
            return Response(
                {"detail": "Producto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminProductoSerializer(producto)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk, *args, **kwargs):
        producto = self.get_object(pk)
        if not producto:
            return Response(
                {"detail": "Producto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminProductoSerializer(producto, data=request.data)
        if serializer.is_valid():
            producto = serializer.save()
            return Response(
                AdminProductoSerializer(producto).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk, *args, **kwargs):
        producto = self.get_object(pk)
        if not producto:
            return Response(
                {"detail": "Producto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminProductoSerializer(
            producto, data=request.data, partial=True
        )
        if serializer.is_valid():
            producto = serializer.save()
            return Response(
                AdminProductoSerializer(producto).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        producto = self.get_object(pk)
        if not producto:
            return Response(
                {"detail": "Producto no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        producto.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============================
# MI DIRECCIÓN (perfil Cliente)
# ============================
class MeShippingAddressView(generics.RetrieveUpdateAPIView):
    serializer_class = ClienteAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cliente, _ = Cliente.objects.get_or_create(user=self.request.user)
        return cliente


# ============================
# PEDIDOS: CREAR Y MIS PEDIDOS
# ============================
class CreateOrderView(APIView):
    """
    Crea el Pedido a partir del carrito y lo deja en estado pending.
    El pago se hace luego vía Mercado Pago.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            cliente = user.cliente
        except Cliente.DoesNotExist:
            return Response(
                {"detail": "No hay perfil de cliente para este usuario."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        carrito = get_or_create_cliente_y_carrito(user)
        items = carrito.items.all()
        if not items.exists():
            return Response(
                {"detail": "El carrito está vacío."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data or {}

        direccion = data.get("direccion") or cliente.direccion
        ciudad = data.get("ciudad") or getattr(cliente, "ciudad", "")
        provincia = data.get("provincia") or getattr(cliente, "provincia", "")
        codigo_postal = data.get("codigo_postal") or getattr(
            cliente, "codigo_postal", ""
        )
        telefono = data.get("telefono") or cliente.telefono
        observaciones = data.get("observaciones", "")

        if not direccion or not ciudad or not provincia or not codigo_postal:
            return Response(
                {
                    "detail": (
                        "Faltan datos de envío (dirección, ciudad, provincia, "
                        "código postal)."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        pedido = Pedido.objects.create(
            cliente=cliente,
            estado=Pedido.ESTADO_PENDIENTE,
            email=user.email or "",
            nombre=user.get_full_name() or user.username,
            telefono=telefono or "",
            direccion=direccion,
            ciudad=ciudad,
            provincia=provincia,
            codigo_postal=codigo_postal,
            observaciones=observaciones,
        )

        total_productos = Decimal("0.00")

        for item in items:
            precio_unitario = item.producto.precio
            subtotal = precio_unitario * item.cantidad

            OrderItem.objects.create(
                pedido=pedido,
                producto=item.producto,
                nombre_producto=item.producto.nombre,
                talle=item.talle,
                cantidad=item.cantidad,
                precio_unitario=precio_unitario,
                subtotal=subtotal,
            )

            total_productos += subtotal

        pedido.total_productos = total_productos
        pedido.total_final = pedido.total_productos + pedido.costo_envio
        pedido.save()

        carrito.items.all().delete()

        return Response(
            {
                "detail": "Pedido creado correctamente.",
                "pedido_id": pedido.id,
                "total": str(pedido.total_final),
            },
            status=status.HTTP_201_CREATED,
        )


class MyOrdersView(APIView):
    """
    Mis pedidos. Filtra por ?status=pending|paid|all
    - default: pending
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cliente = request.user.cliente
        except Cliente.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)

        status_filter = request.query_params.get("status", "pending")

        qs = Pedido.objects.filter(cliente=cliente)

        if status_filter == "pending":
            qs = qs.filter(estado=Pedido.ESTADO_PENDIENTE)
        elif status_filter == "paid":
            qs = qs.filter(estado=Pedido.ESTADO_PAGADO)
        elif status_filter == "all":
            pass
        else:
            qs = qs.filter(estado=Pedido.ESTADO_PENDIENTE)

        pedidos = qs.order_by("-creado")
        serializer = PedidoDetailSerializer(pedidos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ============================
# MERCADO PAGO
# ============================

class CreatePreferenceView(APIView):
    """
    Crea una preferencia de Mercado Pago para un pedido.
    El front le pasa { "pedido_id": <id> }.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        pedido_id = request.data.get("pedido_id")
        if not pedido_id:
            return Response(
                {"detail": "Falta 'pedido_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pedido = get_object_or_404(
            Pedido,
            id=pedido_id,
            cliente=request.user.cliente,
        )

        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

        preference_data = {
            "items": [
                {
                    "title": f"Pedido #{pedido.id}",
                    "quantity": 1,
                    "unit_price": float(pedido.total_final),
                    "currency_id": "ARS",
                }
            ],
            "back_urls": {
                "success": settings.MP_SUCCESS_URL,
                "pending": settings.MP_PENDING_URL,
                "failure": settings.MP_FAILURE_URL,
            },
            "auto_return": "approved",
            "external_reference": str(pedido.id),
        }

        pref = sdk.preference().create(preference_data)
        pref_resp = pref["response"]

        Payment.objects.update_or_create(
            pedido=pedido,
            defaults={
                "mp_preference_id": pref_resp["id"],
                "status": Payment.STATUS_PENDING,
                "raw_response": pref_resp,
            },
        )

        return Response(
            {"init_point": pref_resp["init_point"]},
            status=status.HTTP_200_OK,
        )


@csrf_exempt
def mercadopago_webhook(request):
    """
    Webhook que llama Mercado Pago cuando cambia el estado de un pago.
    Configuralo en el panel de MP.
    """
    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return HttpResponse(status=400)

    if data.get("type") != "payment":
        return HttpResponse(status=200)

    payment_id = data.get("data", {}).get("id")
    if not payment_id:
        return HttpResponse(status=200)

    sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)
    mp_payment = sdk.payment().get(payment_id)
    body = mp_payment.get("response", {})

    pedido_id = body.get("external_reference")
    status_mp = body.get("status")

    if not pedido_id:
        return HttpResponse(status=200)

    try:
        pedido = Pedido.objects.get(id=pedido_id)
    except Pedido.DoesNotExist:
        return HttpResponse(status=200)

    pedido.mp_payment_id = str(payment_id)
    pedido.mp_status = status_mp

    if status_mp == "approved":
        pedido.estado = Pedido.ESTADO_PAGADO
    elif status_mp in ("rejected", "cancelled"):
        pedido.estado = Pedido.ESTADO_CANCELADO
    else:
        pedido.estado = Pedido.ESTADO_PENDIENTE

    pedido.save()

    payment_obj, created = Payment.objects.get_or_create(
        pedido=pedido,
        defaults={
            "mp_payment_id": str(payment_id),
            "status": Payment.STATUS_PENDING,
        },
    )

    payment_obj.mp_payment_id = str(payment_id)
    payment_obj.raw_response = body

    mapping = {
        "approved": Payment.STATUS_APPROVED,
        "rejected": Payment.STATUS_REJECTED,
        "in_process": Payment.STATUS_IN_PROCESS,
        "pending": Payment.STATUS_PENDING,
    }
    payment_obj.status = mapping.get(status_mp, Payment.STATUS_PENDING)
    payment_obj.save()

    return HttpResponse(status=200)


# Opcional: vista para cuando vuelve del checkout (success URL)
def mp_success_view(request):
    """
    Si querés manejar algo cuando vuelve del checkout (opcional).
    Podés simplemente redirigir al front.
    """
    return redirect(settings.FRONTEND_SUCCESS_URL)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"}, status=200)