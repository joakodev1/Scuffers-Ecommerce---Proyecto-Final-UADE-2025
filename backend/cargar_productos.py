import os
import django
 
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scuffers_api.settings")
django.setup()
 
import cloudinary.uploader
from shop.models import Producto
from django.utils.text import slugify
 
# ---------------------------
# DATOS DE PRODUCTOS
# ---------------------------
productos_data = [
    # REMERAS MANGA LARGA (camiseta) - categoria: tees
    {"nombre": "Remera Manga Larga Negra",     "precio": 18500, "categoria": "tees",        "tag": "new",  "stock": 20, "prefijo": "camiseta1"},
    {"nombre": "Remera Manga Larga Gris",      "precio": 18500, "categoria": "tees",        "tag": "",     "stock": 15, "prefijo": "camiseta2"},
    {"nombre": "Remera Manga Larga Blanca",    "precio": 19000, "categoria": "tees",        "tag": "",     "stock": 18, "prefijo": "camiseta3"},
    {"nombre": "Remera Manga Larga Oversize",  "precio": 20000, "categoria": "tees",        "tag": "sale", "stock": 10, "prefijo": "camiseta4"},
    {"nombre": "Remera Manga Larga Rayada",    "precio": 19500, "categoria": "tees",        "tag": "",     "stock": 12, "prefijo": "camiseta5"},
 
    # REMERAS - categoria: tees
    {"nombre": "Remera Básica Negra",          "precio": 15000, "categoria": "tees",        "tag": "",     "stock": 25, "prefijo": "remera1"},
    {"nombre": "Remera Básica Blanca",         "precio": 15000, "categoria": "tees",        "tag": "new",  "stock": 25, "prefijo": "remera2"},
    {"nombre": "Remera Estampada",             "precio": 16500, "categoria": "tees",        "tag": "",     "stock": 20, "prefijo": "remera3"},
    {"nombre": "Remera Oversized",             "precio": 17000, "categoria": "tees",        "tag": "sale", "stock": 15, "prefijo": "remera4"},
    {"nombre": "Remera Tie Dye",               "precio": 17500, "categoria": "tees",        "tag": "",     "stock": 10, "prefijo": "remera5"},
 
    # POLOS - categoria: tees
    {"nombre": "Polo Classic Negro",           "precio": 22000, "categoria": "tees",        "tag": "",     "stock": 15, "prefijo": "polo1"},
    {"nombre": "Polo Classic Blanco",          "precio": 22000, "categoria": "tees",        "tag": "new",  "stock": 15, "prefijo": "polo2"},
    {"nombre": "Polo Rayado",                  "precio": 23500, "categoria": "tees",        "tag": "",     "stock": 10, "prefijo": "polo3"},
 
    # PANTALONES - categoria: pants
    {"nombre": "Pantalón Cargo Negro",         "precio": 35000, "categoria": "pants",       "tag": "new",  "stock": 12, "prefijo": "pantalon1"},
    {"nombre": "Pantalón Cargo Beige",         "precio": 35000, "categoria": "pants",       "tag": "",     "stock": 10, "prefijo": "pantalon2"},
    {"nombre": "Pantalón Jogger Gris",         "precio": 30000, "categoria": "pants",       "tag": "",     "stock": 15, "prefijo": "pantalon3"},
    {"nombre": "Pantalón Jogger Negro",        "precio": 30000, "categoria": "pants",       "tag": "sale", "stock": 12, "prefijo": "pantalon4"},
    {"nombre": "Pantalón Wide Leg",            "precio": 38000, "categoria": "pants",       "tag": "",     "stock": 8,  "prefijo": "pantalon5"},
 
    # CAMPERAS - categoria: hoodies
    {"nombre": "Campera Bomber Negra",         "precio": 55000, "categoria": "hoodies",     "tag": "new",  "stock": 8,  "prefijo": "campera1"},
    {"nombre": "Campera Bomber Gris",          "precio": 55000, "categoria": "hoodies",     "tag": "",     "stock": 8,  "prefijo": "campera2"},
    {"nombre": "Campera Hoodie Negra",         "precio": 48000, "categoria": "hoodies",     "tag": "",     "stock": 10, "prefijo": "campera3"},
    {"nombre": "Campera Hoodie Gris",          "precio": 48000, "categoria": "hoodies",     "tag": "sale", "stock": 10, "prefijo": "campera4"},
    {"nombre": "Campera Cortaviento",          "precio": 52000, "categoria": "hoodies",     "tag": "",     "stock": 6,  "prefijo": "campera5"},
    {"nombre": "Campera Puffer",               "precio": 65000, "categoria": "hoodies",     "tag": "new",  "stock": 5,  "prefijo": "campera6"},
 
    # CHAQUETAS - categoria: hoodies
    {"nombre": "Chaqueta Denim Negra",         "precio": 58000, "categoria": "hoodies",     "tag": "",     "stock": 6,  "prefijo": "chaqueta1"},
    {"nombre": "Chaqueta Denim Azul",          "precio": 58000, "categoria": "hoodies",     "tag": "new",  "stock": 6,  "prefijo": "chaqueta2"},
 
    # GORRAS - categoria: accessories
    {"nombre": "Gorra Snapback Negra",         "precio": 12000, "categoria": "accessories", "tag": "",     "stock": 20, "prefijo": "gorra1"},
    {"nombre": "Gorra Snapback Blanca",        "precio": 12000, "categoria": "accessories", "tag": "new",  "stock": 20, "prefijo": "gorra2"},
    {"nombre": "Gorra Dad Hat Beige",          "precio": 11000, "categoria": "accessories", "tag": "",     "stock": 15, "prefijo": "gorra3"},
    {"nombre": "Gorra Dad Hat Negra",          "precio": 11000, "categoria": "accessories", "tag": "sale", "stock": 15, "prefijo": "gorra4"},
    {"nombre": "Gorra 5 Panel",                "precio": 10000, "categoria": "accessories", "tag": "",     "stock": 12, "prefijo": "gorra5"},
 
    # GORRO - categoria: accessories
    {"nombre": "Gorro Beanie Negro",           "precio": 9000,  "categoria": "accessories", "tag": "",     "stock": 20, "prefijo": "gorro1"},
]
 
MEDIA_DIR = os.path.join(os.path.dirname(__file__), "media", "products")
 
def subir_imagen(ruta_local, public_id):
    """Sube una imagen a Cloudinary y devuelve el public_id."""
    resultado = cloudinary.uploader.upload(
        ruta_local,
        public_id=public_id,
        folder="products",
        overwrite=True,
        resource_type="image",
    )
    return resultado["public_id"]
 
def get_imagen_path(prefijo, letra):
    """Devuelve la ruta local de la imagen limpia (sin códigos raros)."""
    nombre = f"{prefijo}{letra}.webp"
    ruta = os.path.join(MEDIA_DIR, nombre)
    if os.path.exists(ruta):
        return ruta
    return None
 
print("=" * 50)
print("Cargando productos y subiendo imágenes a Cloudinary")
print("=" * 50)
 
creados = 0
errores = 0
 
for data in productos_data:
    prefijo = data["prefijo"]
    nombre  = data["nombre"]
 
    # Generar slug único
    slug_base = slugify(nombre)
    slug = slug_base
    contador = 1
    while Producto.objects.filter(slug=slug).exists():
        slug = f"{slug_base}-{contador}"
        contador += 1
 
    print(f"\n→ Creando: {nombre}")
 
    # Subir imágenes
    imagenes = {}
    for letra, campo in [("a", "imagen"), ("b", "imagen_hover"), ("c", "imagen_3"), ("d", "imagen_4")]:
        ruta = get_imagen_path(prefijo, letra)
        if ruta:
            try:
                public_id = subir_imagen(ruta, f"{prefijo}{letra}")
                imagenes[campo] = public_id
                print(f"  ✓ {campo}: subida")
            except Exception as e:
                print(f"  ⚠ Error subiendo {campo}: {e}")
                errores += 1
        else:
            print(f"  - {campo}: no encontrada ({prefijo}{letra}.webp)")
 
    # Crear producto
    try:
        producto = Producto(
            nombre=nombre,
            slug=slug,
            precio=data["precio"],
            descripcion=f"{nombre} - Scuffers",
            stock=data["stock"],
            categoria=data["categoria"],
            tag=data["tag"],
            activo=True,
        )
        for campo, public_id in imagenes.items():
            setattr(producto, campo, public_id)
 
        producto.save()
        creados += 1
        print(f"  ✓ Producto guardado (id={producto.id})")
    except Exception as e:
        print(f"  ✗ Error guardando producto: {e}")
        errores += 1
 
print("\n" + "=" * 50)
print(f"✅ Productos creados: {creados}")
print(f"⚠  Errores: {errores}")
print("=" * 50)