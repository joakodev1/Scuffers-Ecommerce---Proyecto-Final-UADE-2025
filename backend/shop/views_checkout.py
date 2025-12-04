# shop/views_checkout.py

from decimal import Decimal

from django.conf import settings
from django.core.mail import send_mail
import mercadopago

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Cliente, Pedido, OrderItem, Payment


# ============================
# SERIALIZERS PARA PEDIDOS
# ============================
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "nombre_producto",
            "talle",
            "cantidad",
            "precio_unitario",
            "subtotal",
        )


class PedidoListSerializer(serializers.ModelSerializer):
    # Texto lindo del estado: "Pendiente", "Pagado", etc.
    estado_label = serializers.CharField(
        source="get_estado_display", read_only=True
    )
    # Usamos la property del modelo (es_pagado = estado == "paid")
    es_pagado = serializers.BooleanField(read_only=True)

    class Meta:
        model = Pedido
        fields = (
            "id",
            "estado",
            "estado_label",
            "es_pagado",
            "total_final",
            "creado",
            "mp_status",
        )


class PedidoDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    estado_label = serializers.CharField(
        source="get_estado_display", read_only=True
    )
    es_pagado = serializers.BooleanField(read_only=True)

    class Meta:
        model = Pedido
        fields = (
            "id",
            "estado",
            "estado_label",
            "es_pagado",
            "total_productos",
            "costo_envio",
            "total_final",
            "creado",
            "mp_status",
            "mp_payment_id",
            "direccion",
            "ciudad",
            "provincia",
            "codigo_postal",
            "observaciones",
            "items",
        )


# -----------------------------------------
# 1) CREAR PEDIDO A PARTIR DEL CARRITO
# -----------------------------------------
class CreateOrderFromCartView(APIView):
    """
    Toma el carrito del usuario autenticado,
    crea un Pedido + OrderItems y vacía el carrito.

    OJO: el pedido arranca como 'pending'.
    Solo lo consideramos "real" (para listados, métricas, etc.)
    cuando pasa a 'paid'.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # Cliente asociado al usuario
        try:
            cliente = Cliente.objects.get(user=user)
        except Cliente.DoesNotExist:
            return Response(
                {"detail": "El usuario no tiene Cliente asociado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        carrito = cliente.get_or_create_carrito()
        items = carrito.items.select_related("producto")

        if not items.exists():
            return Response(
                {"detail": "El carrito está vacío."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # calcular total de productos
        total_productos = Decimal("0.00")
        for item in items:
            total_productos += item.producto.precio * item.cantidad

        # crear Pedido (estado = pending, todavía NO pagado)
        pedido = Pedido.objects.create(
            cliente=cliente,
            estado="pending",
            email=user.email or "",
            nombre=user.first_name or user.username,
            telefono=cliente.telefono or "",
            total_productos=total_productos,
            costo_envio=Decimal("0.00"),
            total_final=total_productos,
        )

        # crear OrderItems
        bulk_items = []
        for item in items:
            subtotal = item.producto.precio * item.cantidad
            bulk_items.append(
                OrderItem(
                    pedido=pedido,
                    producto=item.producto,
                    nombre_producto=item.producto.nombre,
                    talle=item.talle,
                    cantidad=item.cantidad,
                    precio_unitario=item.producto.precio,
                    subtotal=subtotal,
                )
            )
        OrderItem.objects.bulk_create(bulk_items)

        # vaciar carrito
        items.delete()

        return Response(
            {
                "id": pedido.id,
                "estado": pedido.estado,
                "total_productos": str(pedido.total_productos),
                "costo_envio": str(pedido.costo_envio),
                "total_final": str(pedido.total_final),
            },
            status=status.HTTP_201_CREATED,
        )


# -----------------------------------------
# 2) CONFIRMAR DATOS DE ENVÍO
# -----------------------------------------
class ConfirmShippingView(APIView):
    """
    Guarda dirección + costo de envío dentro del Pedido.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        order_id = data.get("order_id")
        if not order_id:
            return Response(
                {"detail": "Falta 'order_id'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # nos aseguramos que el pedido sea de este cliente
        try:
            cliente = Cliente.objects.get(user=user)
            pedido = Pedido.objects.get(id=order_id, cliente=cliente)
        except (Cliente.DoesNotExist, Pedido.DoesNotExist):
            return Response(
                {"detail": "Pedido no encontrado para este usuario."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # datos de envío
        pedido.direccion = data.get("direccion", "")
        pedido.ciudad = data.get("ciudad", "")
        pedido.provincia = data.get("provincia", "")
        pedido.codigo_postal = data.get("codigo_postal", "")
        pedido.observaciones = data.get("observaciones", "")

        costo_envio_raw = data.get("costo_envio", "0")
        try:
            costo_envio = Decimal(str(costo_envio_raw))
        except Exception:
            costo_envio = Decimal("0.00")

        pedido.costo_envio = costo_envio
        pedido.total_final = pedido.total_productos + pedido.costo_envio
        pedido.save()

        return Response(
            {
                "id": pedido.id,
                "total_productos": str(pedido.total_productos),
                "costo_envio": str(pedido.costo_envio),
                "total_final": str(pedido.total_final),
            },
            status=status.HTTP_200_OK,
        )


# -----------------------------------------
# 3) CREAR PREFERENCIA EN MERCADO PAGO (PRODUCCIÓN)
# -----------------------------------------
class MercadoPagoCreatePreferenceView(APIView):
    """
    Crea una preferencia de pago en Mercado Pago (PRODUCCIÓN)
    para un Pedido del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        order_id = kwargs.get("order_id")
        if not order_id:
            return Response(
                {"detail": "Falta 'order_id' en la URL."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # 1) Validar pedido del usuario
            try:
                cliente = Cliente.objects.get(user=user)
                pedido = Pedido.objects.get(id=order_id, cliente=cliente)
            except (Cliente.DoesNotExist, Pedido.DoesNotExist):
                return Response(
                    {"detail": "Pedido no encontrado para este usuario."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # 🚫 Si ya está pagado, no dejamos generar otra preferencia
            if pedido.estado == "paid":
                return Response(
                    {"detail": "Este pedido ya fue pagado."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 2) Cargar ítems
            order_items = OrderItem.objects.filter(pedido=pedido)
            if not order_items.exists():
                return Response(
                    {"detail": "El pedido no tiene ítems."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            mp_items = [
                {
                    "title": item.nombre_producto,
                    "quantity": int(item.cantidad),
                    "currency_id": "ARS",
                    "unit_price": float(item.precio_unitario),
                }
                for item in order_items
            ]

            # 3) Cargar access token de producción
            access_token = getattr(settings, "MP_ACCESS_TOKEN", None)
            if not access_token:
                return Response(
                    {"detail": "MP_ACCESS_TOKEN no está configurado en el servidor."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            sdk = mercadopago.SDK(access_token)

            # 4) Origen del FRONT (localhost en dev)
            frontend_origin = "http://localhost:5173"

            # 5) Datos de preferencia (checkout REAL)
            preference_data = {
                "items": mp_items,
                "external_reference": str(pedido.id),
                "payer": {
                    "name": pedido.nombre,
                    "email": pedido.email,
                },
                "back_urls": {
                    "success": f"{frontend_origin}/checkout/success",
                    "failure": f"{frontend_origin}/checkout/failure",
                    "pending": f"{frontend_origin}/checkout/pending",
                },
                # "auto_return": "approved",
            }

            # 6) Crear preferencia
            result = sdk.preference().create(preference_data)
            mp_status = result.get("status")
            mp_response = result.get("response", {}) or {}

            print("=== MP PREFERENCE RESULT ===")
            print("status:", mp_status)
            print("response:", mp_response)

            if mp_status not in (200, 201):
                return Response(
                    {
                        "detail": mp_response.get(
                            "message", "Mercado Pago devolvió un error."
                        ),
                        "mp_status": mp_status,
                        "mp_error": mp_response,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {
                    "preference_id": mp_response.get("id"),
                    "init_point": mp_response.get("init_point"),
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {
                    "detail": "Error interno al crear la preferencia.",
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# -----------------------------------------
# 4) FEEDBACK DE MERCADO PAGO (REDIRECCIÓN)
# -----------------------------------------
class MercadoPagoFeedbackView(APIView):
    """
    Recibe los query params cuando MP redirige al front.
    Actualiza el pedido y el registro de Payment.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        params = request.query_params

        payment_id = params.get("payment_id") or params.get("collection_id")
        payment_status = params.get("status") or params.get("collection_status")
        external_reference = params.get("external_reference")  # ID del Pedido
        merchant_order_id = params.get("merchant_order_id") or params.get(
            "merchant_order"
        )
        preference_id = params.get("preference_id")  # a veces viene

        print("=== FEEDBACK MP ===")
        print(params)

        if not external_reference:
            return Response(
                {
                    "detail": "No vino external_reference (id del pedido).",
                    "params": params,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Buscar Pedido
        try:
            pedido = Pedido.objects.get(id=external_reference)
        except Pedido.DoesNotExist:
            return Response(
                {
                    "detail": "Pedido no encontrado.",
                    "external_reference": external_reference,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Mapear estado MP -> estado interno
        if payment_status in ("approved", "accredited"):
            pedido.estado = "paid"
        elif payment_status in ("pending", "in_process"):
            pedido.estado = "pending"
        elif payment_status in ("rejected", "cancelled", "refunded", "charged_back"):
            pedido.estado = "cancelled"
        # si viene algo raro, dejamos el estado como está

        # Guardar datos en el Pedido
        pedido.mp_payment_id = payment_id or ""
        pedido.mp_status = payment_status or ""
        pedido.mp_merchant_order_id = merchant_order_id or ""
        pedido.save()

        # 🔐 Crear / actualizar registro Payment
        payment_obj, _created = Payment.objects.get_or_create(
            pedido=pedido,
            defaults={"proveedor": "MERCADO_PAGO"},
        )

        payment_obj.proveedor = "MERCADO_PAGO"
        payment_obj.mp_payment_id = payment_id or payment_obj.mp_payment_id
        payment_obj.mp_preference_id = preference_id or payment_obj.mp_preference_id
        payment_obj.status = payment_status or payment_obj.status
        payment_obj.raw_response = params.dict()
        payment_obj.save()

        return Response(
            {
                "ok": True,
                "pedido_id": pedido.id,
                "estado": pedido.estado,
                "payment_id": payment_id,
                "payment_status": payment_status,
            },
            status=status.HTTP_200_OK,
        )


# -----------------------------------------
# 4.1) WEBHOOK DE MERCADO PAGO (SERVER TO SERVER)
# -----------------------------------------
class MercadoPagoWebhookView(APIView):
    """
    Webhook de Mercado Pago (server to server).

    - Recibe notificaciones de tipo "payment".
    - Consulta el pago en la API de MP usando data.id.
    - Usa external_reference para encontrar el Pedido.
    - Actualiza el estado del Pedido y del Payment.
    - Si el pago queda APROBADO y el pedido no estaba pagado antes,
      envía un mail de confirmación.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data

        # MP suele mandar {"type": "payment", "data": {"id": "123456"}}
        mp_type = data.get("type")
        payment_id = data.get("data", {}).get("id")

        # Si no viene data.id, no podemos hacer nada
        if not payment_id:
            return Response(
                {"detail": "No vino 'data.id' (id del pago)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Si viene otro tipo de evento (ej: "plan", "subscription"), lo ignoramos
        if mp_type and mp_type != "payment":
            return Response({"detail": "event ignored"}, status=status.HTTP_200_OK)

        # Access token de producción
        access_token = getattr(settings, "MP_ACCESS_TOKEN", None)
        if not access_token:
            return Response(
                {"detail": "MP_ACCESS_TOKEN no está configurado."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        sdk = mercadopago.SDK(access_token)

        try:
            payment_info = sdk.payment().get(payment_id)
        except Exception as e:
            return Response(
                {
                    "detail": "Error al consultar el pago en Mercado Pago.",
                    "error_type": type(e).__name__,
                    "error_message": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        resp = payment_info.get("response", {}) or {}

        # estado en MP: approved, rejected, pending, in_process, etc.
        mp_status = resp.get("status")
        external_ref = resp.get("external_reference")  # id del Pedido que mandamos

        if not external_ref:
            return Response(
                {"detail": "El pago no tiene external_reference."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Buscar el Pedido asociado a ese external_reference
        try:
            pedido = Pedido.objects.get(id=external_ref)
        except Pedido.DoesNotExist:
            return Response(
                {
                    "detail": "Pedido no encontrado para external_reference.",
                    "external_reference": external_ref,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        estado_anterior = pedido.estado  # para ver si pasó a paid

        # Actualizamos campos de MP en el Pedido
        pedido.mp_payment_id = str(payment_id)
        if mp_status:
            pedido.mp_status = mp_status

        # Mapear estado MP -> estado interno del Pedido
        if mp_status in ("approved", "accredited"):
            pedido.estado = "paid"
        elif mp_status in ("pending", "in_process"):
            pedido.estado = "pending"
        elif mp_status in ("rejected", "cancelled", "refunded", "charged_back"):
            pedido.estado = "cancelled"
        # Si viene algo raro, dejamos el estado como estaba

        pedido.save()

        # Crear / actualizar registro Payment asociado
        payment_obj, _created = Payment.objects.get_or_create(
            pedido=pedido,
            defaults={"proveedor": "MERCADO_PAGO"},
        )

        payment_obj.proveedor = "MERCADO_PAGO"
        payment_obj.mp_payment_id = str(payment_id)
        payment_obj.mp_preference_id = resp.get("preference_id") or payment_obj.mp_preference_id
        if mp_status:
            payment_obj.status = mp_status
        payment_obj.raw_response = resp
        payment_obj.save()

        # 🚀 Notificación SOLO cuando pasa a pagado
        if estado_anterior != "paid" and pedido.estado == "paid":
            self._send_confirmation_email(pedido)

        return Response(
            {
                "detail": "Webhook procesado OK.",
                "pedido_id": pedido.id,
                "estado": pedido.estado,
                "mp_status": mp_status,
            },
            status=status.HTTP_200_OK,
        )

    def _send_confirmation_email(self, pedido: Pedido):
        """
        Envía un mail de confirmación de compra al cliente
        cuando el pago queda aprobado.
        """
        email = pedido.email or (
            pedido.cliente.user.email
            if getattr(pedido, "cliente", None)
            and getattr(pedido.cliente, "user", None)
            and pedido.cliente.user.email
            else ""
        )
        if not email:
            return  # no hay mail, no rompemos nada

        nombre = (
            pedido.nombre
            or (pedido.cliente.user.first_name if getattr(pedido.cliente, "user", None) else "")
            or (pedido.cliente.user.username if getattr(pedido.cliente, "user", None) else "")
        )

        subject = f"Confirmación de compra #{pedido.id} - Scuffers"
        message = (
            f"Hola {nombre},\n\n"
            f"Tu pago de la orden #{pedido.id} fue aprobado correctamente.\n\n"
            f"Total abonado: ${pedido.total_final}\n\n"
            "En breve vamos a preparar tu pedido y te avisaremos cuando salga a envío.\n\n"
            "Gracias por comprar en Scuffers.\n"
            "El equipo de Scuffers."
        )

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@scuffers.com")

        try:
            send_mail(
                subject,
                message,
                from_email,
                [email],
                fail_silently=True,
            )
        except Exception:
            # no queremos romper el webhook si falla el mail
            pass

# -----------------------------------------
# 5) MIS PEDIDOS - LISTA
# -----------------------------------------
class MyOrdersListView(APIView):
    """
    Devuelve SOLO los pedidos PAGADOS del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        try:
            cliente = Cliente.objects.get(user=user)
        except Cliente.DoesNotExist:
            return Response(
                {"detail": "El usuario no tiene cliente asociado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pedidos = (
            Pedido.objects
            .filter(cliente=cliente, estado="paid")
            .order_by("-creado")
        )

        serializer = PedidoListSerializer(pedidos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------------------------
# 6) MIS PEDIDOS - DETALLE
# -----------------------------------------
class MyOrderDetailView(APIView):
    """
    Devuelve el detalle de un pedido PAGADO del usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id, *args, **kwargs):
        user = request.user

        try:
            cliente = Cliente.objects.get(user=user)
        except Cliente.DoesNotExist:
            return Response(
                {"detail": "El usuario no tiene cliente asociado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            pedido = (
                Pedido.objects
                .select_related("cliente")
                .prefetch_related("items__producto")
                .get(id=order_id, cliente=cliente, estado="paid")
            )
        except Pedido.DoesNotExist:
            return Response(
                {"detail": "Pedido no encontrado para este usuario o no está pagado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PedidoDetailSerializer(pedido)
        return Response(serializer.data, status=status.HTTP_200_OK)