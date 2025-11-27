from django.contrib import admin
from .models import Cliente, Producto, Carrito, ItemCarrito, NewsletterSubscriber


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria", "precio", "activo", "tag")
    list_filter = ("categoria", "activo", "tag")
    search_fields = ("nombre", "slug")


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "created_at")
    search_fields = ("email",)


admin.site.register(Cliente)
admin.site.register(Carrito)
admin.site.register(ItemCarrito)