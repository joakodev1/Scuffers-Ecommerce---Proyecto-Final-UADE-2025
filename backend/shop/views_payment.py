# shop/views_payment.py

import mercadopago
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Pedido, OrderItem, Cliente


class MercadoPagoCreatePreference(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        user = request.user

        # buscar cliente + pedido
        try:
            cliente = Cliente.objects.get(user=user)
            pedido = Pedido.objects.get(id=order_id, cliente=cliente)
        except (Cliente.DoesNotExist, Pedido.DoesNotExist):
            return Response(
                {"detail": "Pedido no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # SDK MP
        sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

        # ITEMS → desde OrderItem
        order_items = OrderItem.objects.filter(pedido=pedido)

        items = []
        for item in order_items:
            items.append({
                "title": item.nombre_producto,
                "quantity": item.cantidad,
                "unit_price": float(item.precio_unitario),
                "currency_id": "ARS",
            })

        # Preferencia MP
        preference_data = {
            "items": items,
            "back_urls": {
                "success": "http://localhost:5173/payment-success",
                "pending": "http://localhost:5173/payment-pending",
                "failure": "http://localhost:5173/payment-failure",
            },
            "auto_return": "approved",
            "external_reference": str(pedido.id),
        }

        preference = sdk.preference().create(preference_data)

        return Response({
            "preference_id": preference["response"]["id"],
            "init_point": preference["response"]["init_point"],
            "sandbox_init_point": preference["response"]["sandbox_init_point"],
        })