# 🛍️ Proyecto Final – Scuffers E-Commerce

**Scuffers E-Commerce** es un proyecto integral desarrollado como trabajo final universitario.  
Consiste en una plataforma completa de comercio electrónico para una marca de indumentaria streetwear, con frontend moderno en **React** y backend robusto en **Django REST Framework**, incluyendo:

- Autenticación JWT
- Carrito persistente por usuario
- Catálogo de productos con imágenes
- Detalle, filtros, búsqueda
- Formulario de contacto con envío real de emails (SMTP Gmail)
- Base de datos en MySQL
- Variables de entorno para garantizar seguridad

---

## 📌 **Tecnologías principales**

### 🔹 Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animaciones)
- React Router DOM
- Lucide Icons

### 🔹 Backend
- Python 3.13
- Django 5
- Django REST Framework
- SimpleJWT (Auth)
- MySQL
- python-dotenv
- SMTP Gmail (contraseña de aplicación)

---

## 📂 **Estructura del proyecto**

ProyectoFinal/
│── README.md
│── .gitignore
│
├── backend/
│ ├── scuffers_api/ # Proyecto Django
│ ├── shop/ # App principal (productos, carrito, contacto, auth)
│ ├── media/ # Imágenes subidas desde el admin
│ └── .env # Variables de entorno (ignorado por git)
│
└── frontend/
├── src/ # Componentes React
├── public/
└── .env # URL de la API


## 🔐 **Seguridad**

El proyecto incorpora las buenas prácticas solicitadas:

- ✔ Variables sensibles (DB, SMTP, JWT, SECRET_KEY) aisladas en `.env`
- ✔ `.gitignore` configurado para impedir exponer credenciales
- ✔ Autenticación segura vía JWT
- ✔ Contraseña de aplicación de Gmail con 2FA habilitado  
- ✔ CORS restringido al origen del frontend

---

## ⚙️ **Instalación y configuración (Backend + Django)**

### 1️⃣ Crear entorno virtual

cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

2️⃣ Instalar dependencias
pip install -r requirements.txt

3️⃣ Configurar base de datos MySQL
CREATE DATABASE scuffers_api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'scuffers_user'@'localhost' IDENTIFIED BY 'Scuffers123!';
GRANT ALL PRIVILEGES ON scuffers_api_db.* TO 'scuffers_user'@'localhost';
FLUSH PRIVILEGES;

4️⃣ Crear archivo .env (en carpeta /backend)
SECRET_KEY=django-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=scuffers_api_db
DB_USER=scuffers_user
DB_PASSWORD=Scuffers123!
DB_HOST=127.0.0.1
DB_PORT=3306

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=scuffersuade@gmail.com
EMAIL_HOST_PASSWORD=kimkhdhwcjdijsxg

FRONTEND_ORIGIN=http://localhost:5173

5️⃣ Migraciones y superusuario
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

El backend queda funcionando en:
➡ http://127.0.0.1:8000

⚙️ Instalación y configuración (Frontend + React)

1️⃣ Instalar dependencias
cd frontend
npm install

2️⃣ Crear archivo .env
VITE_API_URL=http://127.0.0.1:8000/api

3️⃣ Iniciar servidor frontend
npm run dev

Frontend disponible en:
➡ http://localhost:5173




🧩 Arquitectura del Backend

🛒 Modelos principales

Producto

Carrito

ItemCarrito

Cliente (opcional según autenticación)

Contacto (no persistente, pero enviado por mail)

🔐 Autenticación

Implementada con SimpleJWT

Tokens:

Access Token → 4 horas

Refresh Token → 7 días

✉️ Contact Form

Endpoint:
POST /api/contact/

Flujo:

El frontend envía nombre, email, asunto y mensaje.

Django arma el email.

Se envía a través de SMTP Gmail usando una contraseña de aplicación.

Respuesta JSON {"success": true}.



🛍️ Arquitectura del Frontend

Características principales

Catálogo con filtros, search y categorías

Página de producto con galería de imágenes

Hover con segunda imagen tipo e-commerce real

Carrito persistente usando contexto global

Autenticación guardada en localStorage

UI moderna con:

Tailwind

Animaciones Framer Motion

Diseño mobile-first

✔️ Requerimientos del Trabajo Práctico – Cumplidos
Requisito	Estado
Frontend SPA en React	✔
Backend en Django	✔
Base de datos MySQL	✔
Autenticación JWT	✔
CRUD de productos	✔
Carrito de compras	✔
Persistencia por usuario	✔
Envío de emails (Contacto)	✔
Manejo de .env y seguridad	✔
Catálogo filtrable	✔
Conexión API REST + Frontend	✔
Diseño responsive	✔
Buenas prácticas de código	✔



🧪 Testing básico del Contacto

python manage.py shell

from django.core.mail import send_mail

send_mail(
    "Test",
    "Mensaje de prueba",
    "scuffersuade@gmail.com",
    ["scuffersuade@gmail.com"]
)

📈 Posibles mejoras futuras

Integración con MercadoPago / Stripe

Sistema de órdenes y comprobantes

Panel administrativo avanzado

Historial de compras

Reseñas de productos

Wishlists

Optimización de imágenes

Deploy con Docker / Railway / Vercel

👤 Autor

Joaquin Carricondo
UADE – Proyecto Final 2025
Scuffers E-Commerce
