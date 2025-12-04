Scuffers – E-Commerce | Proyecto Final UADE 2025

Scuffers es una plataforma de comercio electrónico desarrollada como proyecto final para la carrera de Administración / Desarrollo Web.
El sistema incluye un backend en Django REST Framework y un frontend en React + Vite + Tailwind, con integración de pagos mediante Mercado Pago.
El objetivo del proyecto es simular el flujo completo de una tienda de ropa real: autenticación, manejo de carrito, generación de pedidos y procesamiento de pagos.

🚀 Tecnologías principales
Backend (Django + DRF)

Python 3.12

Django 5

Django REST Framework

MySQL (Railway)

Autenticación con JWT (SimpleJWT)

Integración de pagos con Mercado Pago

Webhooks de Mercado Pago (para actualizar el estado del pedido)

Gestión de categorías, productos, stock y carrito

Endpoints REST para: productos, usuarios, carrito, checkout y pedidos

Deploy en Railway

Frontend (React)

React + Vite

TailwindCSS

React Router DOM

Axios

Context API para Auth y Cart

Animaciones con Framer Motion

Formulario Contact + Newsletter

Páginas protegidas (My Account, My Orders, Order Detail)

Deploy en Vercel

📦 Características del proyecto
🛍️ Catálogo de productos

Listado completo (Shop All)

Filtros por categorías

Vista de detalle con imágenes, stock y descripción

URL dinámicas con slugs

🛒 Carrito de compras

Carrito persistente asociado al usuario autenticado

Agregar, quitar y actualizar cantidades

Precio total en tiempo real

🔐 Autenticación

Registro

Login con JWT

/auth/me para recuperar el usuario actual

Asociación automática del Cliente → User

💳 Checkout + Mercado Pago

Creación de pedido a partir del carrito

Generación de Preferencia de Pago vía API

Redirección segura a Mercado Pago

Manejo de estados: pending, paid, cancelled

Actualización automática mediante Webhook

Vista de resultados: success / failure / pending

📦 Pedidos

Página "My Orders" con listado

"Order Detail" con estado del pago y envío

Solo se muestran pedidos con estado paid en el admin

💬 Contacto

Formulario con validaciones

Envío al backend (ContactView)

Guardado del mensaje

📰 Newsletter

Suscripción por email

Guardado en base de datos