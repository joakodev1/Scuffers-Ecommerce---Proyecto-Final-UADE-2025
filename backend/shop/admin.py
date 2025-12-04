# shop/admin.py
from django.contrib import admin
from .models import (
    Cliente,
    Carrito,
    ItemCarrito,
    NewsletterSubscriber,
    Producto,
    Pedido,
    OrderItem,
    Payment,
)


# ==========================
# CLIENTE / CARRITO / ITEMS
# ==========================
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "telefono", "fecha_creacion")
    search_fields = ("user__username", "user__email")


@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "creado", "actualizado")


@admin.register(ItemCarrito)
class ItemCarritoAdmin(admin.ModelAdmin):
    list_display = ("id", "carrito", "producto", "talle", "cantidad")


# ==========================
# NEWSLETTER
# ==========================
@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "created_at")
    search_fields = ("email",)


# ==========================
# PRODUCTOS
# ==========================
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "precio", "stock", "categoria", "activo")
    list_filter = ("categoria", "activo")
    search_fields = ("nombre", "slug", "tag")
    ordering = ("-id",)  # último creado primero


# ==========================
# PEDIDOS + ÍTEMS
# ==========================
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "producto",
        "nombre_producto",
        "talle",
        "cantidad",
        "precio_unitario",
        "subtotal",
    )


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cliente",
        "estado",
        "total_final",
        "mp_status",
        "creado",
    )
    list_filter = ("estado", "mp_status", "creado")
    search_fields = ("id", "cliente__user__username", "cliente__user__email")
    inlines = [OrderItemInline]

    # campos que NO se deben editar a mano
    readonly_fields = (
        "total_productos",
        "mp_payment_id",
        "mp_merchant_order_id",
        "creado",
        "actualizado",
    )

    fieldsets = (
        ("Datos del cliente", {
            "fields": ("cliente", "email", "nombre", "telefono"),
        }),
        ("Dirección de envío", {
            "fields": ("direccion", "ciudad", "provincia", "codigo_postal", "observaciones"),
        }),
        ("Estado y montos", {
            # 👇 acá va 'estado' y es editable
            "fields": ("estado", "total_productos", "costo_envio", "total_final"),
        }),
        ("Mercado Pago", {
            "fields": ("mp_status", "mp_payment_id", "mp_merchant_order_id"),
        }),
        ("Tiempos", {
            "fields": ("creado", "actualizado"),
        }),
    )

    # ========= ACCIONES =========
    actions = ["marcar_como_pagado"]

    def marcar_como_pagado(self, request, queryset):
        """
        Marca los pedidos seleccionados como PAGADOS y mp_status=approved.
        """
        # Si tu modelo tiene constante ESTADO_PAGADO, la usamos
        try:
            nuevo_estado = Pedido.ESTADO_PAGADO
        except AttributeError:
            # fallback: value de la choice en BD
            nuevo_estado = "paid"

        actualizados = queryset.update(estado=nuevo_estado, mp_status="approved")
        self.message_user(
            request,
            f"{actualizados} pedido(s) marcados como PAGADOS manualmente."
        )

    marcar_como_pagado.short_description = "Marcar como PAGADO (MP aprobado)"


# ==========================
# PAYMENTS
# ==========================
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "pedido",
        "proveedor",
        "status",
        "mp_payment_id",
        "creado",
    )
    list_filter = ("status", "proveedor")
    search_fields = ("pedido__id", "mp_payment_id")