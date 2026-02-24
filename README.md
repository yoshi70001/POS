# 🍬 Sistema POS para Ventas de Dulces

Sistema POS (Punto de Venta) desarrollado con Node.js, Express, EJS y SQLite, optimizado para dispositivos móviles.

## ✨ Características

- 📱 **Interfaz Mobile-First**: Diseño responsivo optimizado para tablets y móviles
- 💰 **Control de Caja**: Apertura y cierre de caja con control de efectivo
- 🛒 **Sistema de Ventas**: Carrito de compras, cálculo automático de vuelto
- 📦 **Gestión de Productos**: CRUD completo, control de stock
- 📊 **Reportes**: Dashboard con métricas de ventas e inventario
- 🔐 **Autenticación**: Sistema de usuarios con roles (Admin/Vendedor)
- ⚠️ **Alertas de Stock**: Notificaciones de productos con stock bajo

## 🚀 Instalación

### Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o copiar el proyecto**
   ```bash
   cd e:\Jumavi\POS
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor**
   ```bash
   npm start
   ```
   
   O para desarrollo con auto-reload:
   ```bash
   npm run dev
   ```

4. **Acceder al sistema**
   
   Abrir el navegador en: `http://localhost:3000`

## 👤 Credenciales por Defecto

```
Usuario: admin
Contraseña: admin123
```

**⚠️ Importante**: Cambiar la contraseña del administrador en producción.

## 📖 Uso del Sistema

### 1. Iniciar Sesión
- Ingrese con las credenciales de administrador o vendedor

### 2. Abrir Caja (Inicio del Turno)
- Click en "Caja" → "Abrir Caja"
- Ingrese el monto inicial de efectivo
- El sistema le permitirá comenzar a vender

### 3. Registrar Ventas
- Vaya a la sección "POS"
- Busque productos usando el buscador
- Click en "+" para agregar al carrito
- Ajuste cantidades con los botones +/- 
- Ingrese el monto recibido del cliente
- El sistema calcula el vuelto automáticamente
- Click en "Procesar Venta" para confirmar

### 4. Cerrar Caja (Fin del Turno)
- Click en "Caja" → "Cerrar Caja"
- El sistema muestra:
  - Monto de apertura
  - Total de ventas del turno
  - Total esperado en caja
- Cuente el efectivo real e ingréselo
- El sistema calcula diferencias automáticamente
- Agregue notas si es necesario

### 5. Gestión de Productos (Solo Admin)
- Vaya a "Productos"
- Click en "+ Nuevo Producto" para crear
- Click en "✏️" para editar
- Los productos con stock bajo se muestran con alerta

### 6. Ver Reportes
- Dashboard principal muestra:
  - Ventas del día
  - Productos más vendidos
  - Alertas de stock bajo
  - Estado de caja

## 🎯 Funcionalidades Principales

### Sistema de Ventas (POS)
- Búsqueda rápida de productos
- Carrito de compras interactivo
- Cálculo automático de totales
- Cálculo de vuelto en tiempo real
- Validación de stock antes de vender
- Confirmación de venta con resumen

### Control de Caja
- Registro de monto de apertura
- Seguimiento de ventas por turno
- Cierre con conteo de efectivo
- Cálculo automático de diferencias
- Historial de turnos de caja

### Inventario
- Alertas de stock bajo
- Stock mínimo configurable
- Actualización automática al vender
- Historial de movimientos

### Reportes
- Ventas diarias
- Productos más vendidos
- Resumen de inventario
- Historial de cajas

## 📱 Navegación Móvil

En dispositivos móviles, la navegación se encuentra en la parte inferior:
- 🛒 **POS**: Pantalla de ventas
- 📦 **Productos**: Gestión de inventario
- 📊 **Reportes**: Dashboard y estadísticas
- 💰 **Caja**: Apertura y cierre de caja

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite
- **Vistas**: EJS (Embedded JavaScript)
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Autenticación**: express-session + bcryptjs
- **Fechas**: Moment.js

## 📁 Estructura del Proyecto

```
POS/
├── database/
│   ├── db.js              # Configuración de SQLite
│   └── schema.sql         # Esquema de base de datos
├── models/                # Modelos de datos
│   ├── user.js
│   ├── product.js
│   ├── sale.js
│   ├── cashRegister.js
│   └── inventory.js
├── routes/                # Rutas de Express
│   ├── auth.js
│   ├── products.js
│   ├── sales.js
│   ├── cashRegister.js
│   └── reports.js
├── views/                 # Vistas EJS
│   ├── layouts/
│   ├── auth/
│   ├── products/
│   ├── sales/
│   ├── cash-register/
│   └── reports/
├── public/                # Archivos estáticos
│   ├── css/
│   └── js/
├── server.js              # Servidor principal
├── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
PORT=3000
SESSION_SECRET=pos-secreto-cambiar-en-produccion
NODE_ENV=development
```

### Cambiar Contraseña de Admin

El sistema crea un usuario admin por defecto. Para cambiar la contraseña:

1. Iniciar sesión como admin
2. Editar el usuario desde la base de datos o implementar la función de cambio de contraseña

## 📝 Notas Importantes

- La base de datos SQLite se crea automáticamente en `pos.db`
- Los archivos de base de datos están en `.gitignore`
- El sistema es totalmente independiente (no requiere instalación de servidor de base de datos)
- Las sesiones duran 24 horas por defecto

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifique que Node.js esté instalado: `node --version`
- Asegúrese de haber instalado las dependencias: `npm install`
- Verifique que el puerto 3000 esté disponible

### Error de conexión a base de datos
- Elimine el archivo `pos.db` y reinicie el servidor
- El sistema recreará la base de datos automáticamente

### Los estilos no cargan
- Verifique que la carpeta `public/` exista
- Asegúrese de que los archivos CSS estén en `public/css/`

## 📄 Licencia

Este proyecto es de uso personal para el negocio de venta de dulces.

## 👨‍💻 Desarrollado para

Jumavi - Ventas de Dulces

---

**¡Disfruta usando tu sistema POS! 🍬**