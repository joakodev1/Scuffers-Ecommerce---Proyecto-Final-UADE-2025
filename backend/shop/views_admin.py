# shop/views_admin.py

from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView  # 👈 LO QUE FALTABA
from django.db.models import ProtectedError
from django.db import IntegrityError

from .models import Producto, Pedido, OrderItem
from .serializers import ProductoSerializer


# ============================
# Permiso: sólo staff
# ============================
class IsStaffUser(permissions.IsAdminUser):
    """
    Permite acceso sólo a usuarios con is_staff = True.
    """
    pass


# ============================
# Vistas admin de productos
# ============================
class AdminProductListCreateView(generics.ListCreateAPIView):
    """
    GET /api/admin/products/   -> lista de productos (con image_url, images, etc.)
    POST /api/admin/products/  -> crear producto (acepta FormData con imágenes)
    """
    queryset = Producto.objects.all().order_by("id")
    serializer_class = ProductoSerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser]  # acepta multipart/form-data


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/products/<id>/
    PATCH  /api/admin/products/<id>/
    DELETE /api/admin/products/<id>/
    """
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsStaffUser]
    parser_classes = [MultiPartParser, FormParser]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (ProtectedError, IntegrityError) as e:
            return Response(
                {
                    "detail": (
                        "No se puede eliminar este producto porque está "
                        "asociado a pedidos o carritos. "
                        "Si querés, marcá el producto como inactivo."
                    ),
                    "error": str(e),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# ============================
# Serializers ADMIN de pedidos
# ============================
class AdminOrderItemSerializer(serializers.ModelSerializer):
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


class AdminPedidoListSerializer(serializers.ModelSerializer):
    # Texto lindo del estado: "Pendiente", "Pagado", etc.
    estado_label = serializers.CharField(
        source="get_estado_display", read_only=True
    )

    class Meta:
        model = Pedido
        fields = (
            "id",
            "estado",
            "estado_label",
            "total_final",
            "creado",
            "nombre",
            "email",
            "mp_status",
        )


class AdminPedidoDetailSerializer(serializers.ModelSerializer):
    estado_label = serializers.CharField(
        source="get_estado_display", read_only=True
    )
    items = AdminOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = (
            "id",
            "estado",
            "estado_label",
            "email",
            "nombre",
            "telefono",
            "direccion",
            "ciudad",
            "provincia",
            "codigo_postal",
            "observaciones",
            "total_productos",
            "costo_envio",
            "total_final",
            "mp_status",
            "mp_payment_id",
            "mp_merchant_order_id",
            "creado",
            "actualizado",
            "items",
        )


# ============================
# Vistas ADMIN de pedidos
# ============================
class AdminOrdersListView(APIView):
    """
    GET /api/admin/orders/ -> lista de pedidos PAGADOS (para dashboard admin).
    """
    permission_classes = [IsStaffUser]

    def get(self, request, *args, **kwargs):
        # Solo pedidos pagados
        pedidos = (
            Pedido.objects
            .filter(estado=Pedido.ESTADO_PAGADO)
            .order_by("-creado")
        )

        serializer = AdminPedidoListSerializer(pedidos, many=True)
        return Response(serializer.data)


class AdminOrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/admin/orders/<id>/ -> detalle completo del pedido PAGADO.
    """
    serializer_class = AdminPedidoDetailSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        # Sólo pedidos pagados, con relaciones optimizadas
        return (
            Pedido.objects
            .filter(estado=Pedido.ESTADO_PAGADO)
            .select_related("cliente")
            .prefetch_related("items__producto")
            .order_by("-creado")
        )