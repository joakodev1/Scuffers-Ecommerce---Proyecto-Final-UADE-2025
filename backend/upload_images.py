"""
Correr desde la carpeta backend/:
    python manage.py shell -c "exec(open('upload_images.py', encoding='utf-8').read())"
 
Sube las imagenes locales de media/products/ a Cloudinary
y actualiza los campos imagen, imagen_hover, imagen_3, imagen_4
de cada producto.
"""
 
from pathlib import Path
from shop.models import Producto
import cloudinary.uploader
 
PRODUCT_IMAGE_MAP = {
    1:  "camiseta1",
    2:  "camiseta2",
    3:  "camiseta3",
    4:  "camiseta4",
    5:  "camiseta5",
    6:  "remera1",
    7:  "remera2",
    8:  "remera3",
    9:  "remera4",
    10: "remera5",
    11: "polo1",
    12: "polo2",
    13: "polo3",
    14: "pantalon1",
    15: "pantalon2",
    16: "pantalon3",
    17: "pantalon4",
    18: "pantalon5",
    19: "campera1",
    20: "campera2",
    21: "campera3",
    22: "campera4",
    24: "campera6",
    25: "chaqueta1",
    26: "chaqueta2",
    27: "gorra1",
    28: "gorra2",
    29: "gorra3",
    30: "gorra4",
    31: "gorra5",
    32: "gorro1",
}
 
MEDIA_DIR = Path("C:/Users/notjo/Documents/Scuffers-Ecommerce---Proyecto-Final-UADE-2025/backend/media/products")
 
def find_file(prefix, suffix):
    pattern = f"{prefix}{suffix}"
    for f in MEDIA_DIR.iterdir():
        name = f.stem
        if name == pattern or name.startswith(pattern):
            return f
    return None
 
updated = 0
skipped = 0
 
for product_id, prefix in PRODUCT_IMAGE_MAP.items():
    try:
        producto = Producto.objects.get(id=product_id)
    except Producto.DoesNotExist:
        print(f"Producto ID {product_id} no existe en la DB, saltando...")
        skipped += 1
        continue
 
    changed = False
 
    for suffix, field_name in [("a", "imagen"), ("b", "imagen_hover"), ("c", "imagen_3"), ("d", "imagen_4")]:
        file_path = find_file(prefix, suffix)
        if not file_path:
            continue
 
        print(f"  Subiendo {file_path.name} -> {producto.nombre} [{field_name}]...")
        try:
            result = cloudinary.uploader.upload(
                str(file_path),
                folder="products",
                public_id=f"{prefix}{suffix}",
                overwrite=True,
                resource_type="image",
            )
            # Guardamos solo el public_id (ej: "products/camiseta1a")
            setattr(producto, field_name, result["public_id"])
            changed = True
            print(f"     OK: {result['public_id']}")
        except Exception as e:
            print(f"     Error subiendo {file_path.name}: {e}")
 
    if changed:
        producto.save()
        updated += 1
        print(f"  Guardado: {producto.nombre}\n")
    else:
        skipped += 1
 
print(f"\n{'='*50}")
print(f"Productos actualizados: {updated}")
print(f"Productos sin cambios:  {skipped}")
print(f"{'='*50}")
 