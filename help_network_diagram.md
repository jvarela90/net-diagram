# 📖 Guía de Usuario - Network Diagram Creator Pro

## 📚 Índice de Contenidos

1. [🚀 Primeros Pasos](#-primeros-pasos)
2. [🎨 Interfaz de Usuario](#-interfaz-de-usuario)
3. [📱 Gestión de Dispositivos](#-gestión-de-dispositivos)
4. [🔗 Crear Conexiones](#-crear-conexiones)
5. [🔌 Configurar Interfaces](#-configurar-interfaces)
6. [🏗️ Sistema de Capas](#️-sistema-de-capas)
7. [📋 Trabajar con Plantillas](#-trabajar-con-plantillas)
8. [📝 Sistema de Anotaciones](#-sistema-de-anotaciones)
9. [🔍 Búsqueda Avanzada](#-búsqueda-avanzada)
10. [📊 Estadísticas y Análisis](#-estadísticas-y-análisis)
11. [💾 Guardar y Cargar](#-guardar-y-cargar)
12. [⌨️ Atajos de Teclado Completos](#️-atajos-de-teclado-completos)
13. [🔧 Solución de Problemas](#-solución-de-problemas)
14. [💡 Tips y Mejores Prácticas](#-tips-y-mejores-prácticas)
15. [❓ Preguntas Frecuentes](#-preguntas-frecuentes)

---

## 🚀 Primeros Pasos

### ¡Bienvenido a Network Diagram Creator Pro!

Esta guía te ayudará a dominar todas las funcionalidades de la aplicación más completa para crear diagramas de red profesionales.

### 🎯 Tu Primer Diagrama en 5 Minutos

**Paso 1: Familiarízate con la Interfaz**
```
┌─────────────────────────────────────────────────────────────┐
│ 🌐 Network Diagram Creator Pro            [🌙] [📊] [❓]    │
├─────────────────────────────────────────────────────────────┤
│ Sidebar   │              Canvas Principal                   │
│           │                                                 │
│ 📱 Disp.  │     Aquí arrastras y conectas dispositivos     │
│ 📋 Plant. │                                                 │
│ 🏗️ Capas  │                                                 │
│ 🏷️ Etiq.  │                                                 │
│           │                                                 │
├─────────────────────────────────────────────────────────────┤
│ Status: Listo | Dispositivos: 0 | Conexiones: 0 | 100%     │
└─────────────────────────────────────────────────────────────┘
```

**Paso 2: Crear tu Primera Red**
1. **Arrastra un Router** desde "🔧 INFRAESTRUCTURA DE RED" al canvas
2. **Arrastra un Switch L2** desde la misma sección
3. **Arrastra 2-3 PCs** desde "💻 DISPOSITIVOS FINALES"
4. **Click en "🔗 Conectar"** en la barra de herramientas
5. **Conecta Router → Switch → PCs** seleccionando cada par
6. **¡Felicitaciones!** Tu primera red está completa

**Paso 3: Configurar Propiedades**
1. **Click derecho** en el Router → "Propiedades"
2. **Pestaña "🌐 Red"**: Asigna IP `192.168.1.1`
3. **Pestaña "🔌 Interfaces"**: Revisa las interfaces automáticas
4. **Guarda** los cambios

---

## 🎨 Interfaz de Usuario

### 📋 Barra de Herramientas Principal

```
┌─────────────────────────────────────────────────────────────┐
│ [📄 Nuevo] [💾 Guardar] [📁 Cargar] │ [🔗 Conectar] [UTP ▼] │
├─────────────────────────────────────────────────────────────┤
│ [📋 Copiar] [📄 Pegar] [👥 Duplicar] │ [🎯 Auto-organizar]   │
├─────────────────────────────────────────────────────────────┤
│ [📝 Notas] [🔍 Buscar...] [❌] │ [📊 Stats] [📸 Exportar]  │
└─────────────────────────────────────────────────────────────┘
```

### 🎛️ Controles de Zoom
- **🔍-** Alejar vista
- **100%** Nivel de zoom actual
- **🔍+** Acercar vista  
- **🎯** Resetear zoom a 100%

### 📍 Indicadores de Estado
- **📍 Core Layer**: Capa actual activa
- **Dispositivos: X**: Contador de dispositivos
- **Conexiones: X**: Contador de conexiones
- **Status**: Estado de la aplicación

---

## 📱 Gestión de Dispositivos

### 🔧 Tipos de Dispositivos Disponibles

#### **🔧 Infraestructura de Red**
| Dispositivo | Icono | Uso Principal | Interfaces por Defecto |
|-------------|-------|---------------|------------------------|
| **Core Router** | CR | Núcleo de la red | GigE, Serial |
| **Edge Router** | ER | Conexión WAN | GigE x2, Serial |
| **Router** | R | Enrutamiento general | GigE x2, Serial |
| **Switch L3** | L3 | Capa 3 switching | GigE x4, VLAN1 |
| **Switch L2** | SW | Capa 2 switching | FastE x24, GigE x1 |
| **Hub** | H | Concentrador | Ethernet x8 |

#### **🛡️ Seguridad**
| Dispositivo | Icono | Función | Interfaces Típicas |
|-------------|-------|---------|-------------------|
| **Firewall** | FW | Filtrado de tráfico | Outside, Inside, DMZ |
| **IPS** | IPS | Prevención de intrusos | Management, Monitor |
| **WAF** | WAF | Firewall de aplicaciones | WAN, LAN |
| **Load Balancer** | LB | Balanceo de carga | Public, Private |
| **VPN Gateway** | VPN | Conexiones seguras | WAN, LAN, Tunnel |

#### **📡 Inalámbrico**
| Dispositivo | Icono | Propósito | Configuración |
|-------------|-------|-----------|---------------|
| **Access Point** | AP | WiFi coverage | Ethernet, WLAN |
| **WiFi Controller** | WC | Gestión centralizada | Management, APs |
| **Módem** | M | Conexión ISP | WAN, LAN |

#### **🖥️ Servidores**
| Servidor | Icono | Servicios | Puertos Comunes |
|----------|-------|-----------|-----------------|
| **Servidor Web** | WS | HTTP/HTTPS | 80, 443 |
| **Servidor BD** | DB | Base de datos | 3306, 5432 |
| **Servidor DNS** | DNS | Resolución nombres | 53 |
| **Servidor Mail** | MS | Correo electrónico | 25, 110, 143 |
| **Servidor Genérico** | SV | Servicios varios | 22, 80, 443 |

### 📝 Agregar Dispositivos

**Método 1: Drag & Drop (Recomendado)**
1. **Busca** el dispositivo en el sidebar
2. **Arrastra** desde el icono al canvas
3. **Suelta** en la posición deseada
4. El dispositivo se crea **automáticamente** con:
   - Nombre auto-generado (ej: `SW-001`)
   - Interfaces por defecto según el tipo
   - Estado "UP" para interfaces activas
   - IP sin configurar

**Método 2: Plantillas**
1. Ve a la pestaña "📋 Plantillas"
2. Selecciona una plantilla predefinida
3. Confirma la carga
4. Dispositivos creados automáticamente con conexiones

### ✏️ Editar Dispositivos

**Abrir Propiedades:**
- **Click derecho** → "Propiedades"
- **Doble click** en el dispositivo
- Seleccionar dispositivo + **Enter**

**Pestañas Disponibles:**
- **📋 General**: Información básica
- **🌐 Red**: Configuración de red
- **🔌 Interfaces**: Gestión de puertos  
- **📊 Monitoreo**: Métricas de rendimiento
- **⚙️ Avanzado**: Configuración avanzada

---

## 🔗 Crear Conexiones

### 🔌 Tipos de Conexiones

| Tipo | Color | Velocidad | Uso Típico |
|------|-------|-----------|------------|
| **UTP** | 🟢 Verde | 1 Gbps | LAN empresarial |
| **Fibra Óptica** | 🟠 Naranja | 10 Gbps | Backbone, uplinks |
| **Serial** | 🟣 Violeta | 2 Mbps | WAN legacy |
| **Coaxial** | ⚪ Gris | 100 Mbps | Cable broadband |
| **Inalámbrico** | 🔵 Azul | 300 Mbps | WiFi, enlaces PtP |

### 📋 Proceso de Conexión

**Paso a Paso:**
1. **Activar Modo Conexión**
   - Click en "🔗 Conectar"
   - Tecla `C`
   - El botón cambia a "❌ Cancelar"

2. **Seleccionar Tipo de Cable**
   - Dropdown junto al botón conectar
   - Elige según velocidad necesaria

3. **Crear la Conexión**
   ```
   Dispositivo A → Click → Dispositivo B → Click
   ```
   - Línea aparece automáticamente
   - Etiqueta de ancho de banda incluida

4. **Finalizar**
   - Click en "❌ Cancelar" o tecla `Escape`
   - Modo conexión se desactiva

### ✅ Validación de Conexiones

La aplicación **automáticamente verifica**:
- ✅ Dispositivos válidos seleccionados
- ✅ No conectar dispositivo consigo mismo
- ✅ Interfaces disponibles
- ✅ Compatibilidad de tipos

### 🔧 Modificar Conexiones

**Para cambiar una conexión existente:**
1. **Selecciona** la línea de conexión
2. **Delete** para eliminar
3. **Crea nueva** conexión del tipo deseado

**Para cambiar el tipo:**
1. **Eliminar** conexión actual
2. **Cambiar** tipo en el dropdown
3. **Reconectar** dispositivos

---

## 🔌 Configurar Interfaces

### 📋 Gestión de Interfaces Avanzada

**Acceso:**
1. **Click derecho** en dispositivo → "Propiedades"
2. **Pestaña "🔌 Interfaces"**
3. **Tabla completa** de interfaces disponibles

### 🆕 Agregar Nueva Interfaz

**Botón "➕ Agregar Interfaz":**

```
┌─────────────────────────────────────┐
│ 🔌 Agregar Nueva Interfaz           │
├─────────────────────────────────────┤
│ Nombre: [FastEthernet0/5          ] │
│ Tipo:   [Ethernet            ▼   ] │
│ Estado: [🟢 Activo (Up)       ▼   ] │
│ IP:     [192.168.1.10           ] │
│ VLAN:   [100                   ] │
│ Velocidad: [1 Gbps            ▼   ] │
│ Descripción: [Puerto de usuario  ] │
├─────────────────────────────────────┤
│           [Cancelar] [💾 Guardar]   │
└─────────────────────────────────────┘
```

### ✏️ Editar Interfaz Existente

**Click en botón "✏️" de la interfaz:**
- **Modal completo** con todos los campos
- **Validación automática** de datos
- **Aplicación inmediata** de cambios

### 🎨 Estados Visuales en el Canvas

En cada dispositivo verás **hasta 4 interfaces** principales:

```
┌─────────────────┐
│ [SW] 🟢         │  ← Estado del dispositivo
│   SW-001        │
│  192.168.1.1    │
│     CORE        │
├─────────────────┤
│ [F1][F2][F24][G1] │  ← Interfaces: F=FastE, G=GigE
└─────────────────┘     Verde=UP+IP, Gris=DOWN
```

**Códigos de Color:**
- 🟢 **Verde**: Interfaz UP con IP configurada
- 🔵 **Azul**: Interfaz UP sin IP
- ⚪ **Gris**: Interfaz DOWN o deshabilitada

### 🔧 Tipos de Interfaces Soportadas

| Tipo | Descripción | Velocidades Típicas |
|------|-------------|-------------------|
| **Ethernet** | Cobre estándar | 10M, 100M, 1G |
| **Fiber** | Fibra óptica | 1G, 10G, 40G, 100G |
| **Serial** | Conexiones WAN | 56K, T1, E1 |
| **Wireless** | Enlaces inalámbricos | 11M, 54M, 300M |
| **VLAN** | Interfaces lógicas | Según interfaz física |
| **Loopback** | Interfaces virtuales | N/A |

---

## 🏗️ Sistema de Capas

### 📊 Jerarquía de Capas de Red

La aplicación implementa el **modelo jerárquico de Cisco**:

```
🌍 ISP Layer      ← Proveedores de Internet
    ↓
🌐 WAN Layer      ← Enlaces WAN, MPLS
    ↓  
⚡ Core Layer     ← Backbone de alta velocidad
    ↓
📊 Distribution   ← Agregación y políticas
    ↓
🔌 Access Layer   ← Conexión de usuarios finales
    ↓
🛡️ DMZ Layer     ← Servicios públicos
👥 User Layer     ← Dispositivos de usuario
🌐 IoT Layer      ← Internet de las cosas
```

### 🎨 Colores por Capa

Cada capa tiene un **color de fondo distintivo** (80% transparencia):

| Capa | Color | Hexadecimal | Uso |
|------|-------|-------------|-----|
| 🌍 **ISP** | Violeta | `#8e44ad` | Routers ISP |
| 🌐 **WAN** | Rojo | `#e74c3c` | Enlaces WAN |
| ⚡ **Core** | Azul | `#3498db` | Core switches/routers |
| 📊 **Distribution** | Verde | `#2ecc71` | Distribution switches |
| 🔌 **Access** | Naranja | `#f39c12` | Access switches |
| 🛡️ **DMZ** | Naranja oscuro | `#e67e22` | Servidores públicos |
| 👥 **User** | Púrpura | `#9b59b6` | PCs, laptops |
| 🌐 **IoT** | Turquesa | `#1abc9c` | Sensores, IoT |

### 🎛️ Gestión de Capas

**Panel de Capas (Pestaña "🏗️ Capas"):**

```
┌─────────────────────────────────────┐
│ 🏗️ Gestión de Capas                │
├─────────────────────────────────────┤
│ 🌍 ISP Layer      [●●●●●●○] ✓     │
│ 🌐 WAN Layer      [●●●●●●○] ✓     │  
│ ⚡ Core Layer     [●●●●●●●] ✓ ← Activo
│ 📊 Distribution   [●●●●●●○] ✓     │
│ 🔌 Access Layer   [●●●●●●○] ✓     │
│ 🛡️ DMZ Layer     [●●●●●●○] ✓     │
│ 👥 User Layer     [●●●●●●○] ✓     │
│ 🌐 IoT Layer      [●●●●●●○] ✓     │
├─────────────────────────────────────┤
│ Capa Actual: [Core Layer      ▼  ] │
│ Los nuevos dispositivos se añadirán │
│ a esta capa                         │
└─────────────────────────────────────┘
```

**Controles:**
- **Toggle Switch**: Mostrar/ocultar capa
- **Capa Activa**: Resaltada en azul
- **Dropdown**: Cambiar capa actual para nuevos dispositivos

### 🎯 Auto-Organización por Capas

**Botón "🎯 Auto-organizar":**
1. **Agrupa** dispositivos por capa
2. **Posiciona** jerárquicamente de arriba (ISP) hacia abajo (User)
3. **Calcula** espaciado automático
4. **Actualiza** todas las conexiones

**Resultado típico:**
```
ISP Layer:      [ISP Router]
                     │
WAN Layer:      [Edge Router]
                     │
Core Layer:     [Core-1] ═══ [Core-2]
                   │             │
Distribution:   [Dist-1]     [Dist-2]
                   │             │
Access Layer:   [Acc-1]      [Acc-2]
                   │             │
User Layer:     [PC-1]       [PC-2]
```

---

## 📋 Trabajar con Plantillas

### 🏗️ Plantillas Predefinidas

#### **🏢 Red Empresarial Básica**
- **Componentes**: 1 Router, 2 Switches, 4 PCs
- **Topología**: Jerárquica simple
- **Uso**: Oficinas pequeñas, laboratorios

#### **🛡️ Red con DMZ**
- **Componentes**: Firewall, 2 Switches, Servidores web/mail, PCs
- **Topología**: DMZ segmentada
- **Uso**: Empresas con servicios públicos

#### **🏫 Red de Campus**
- **Componentes**: Core redundante, Distribution, Access, dispositivos finales
- **Topología**: 3 capas jerárquicas
- **Uso**: Universidades, grandes empresas

#### **🏭 Data Center**
- **Componentes**: Core, L3 switches, servidores múltiples, almacenamiento
- **Topología**: Alta disponibilidad
- **Uso**: Centros de datos, infraestructura crítica

### 🔄 Modo Plantillas Múltiples

**Activar Modo Combinación:**
1. **Click en "🔄 Activar Modo Múltiple"** 
2. El botón cambia a rojo "Desactivar Modo Múltiple"
3. **Aparece** botón "✅ Aplicar Plantillas Seleccionadas"

**Seleccionar Plantillas:**
- **Click** en cada plantilla deseada
- Fondo cambia a **verde** para indicar selección
- **Contador** muestra "X plantillas seleccionadas"

**Aplicar Combinación:**
- **Click en "✅ Aplicar"**
- Plantillas se **ubican con offset** automático
- **No se solapan** entre sí
- **Mantiene** dispositivos existentes

**Ejemplo de Uso:**
```
Seleccionar: [Red Básica] + [DMZ] + [IoT]
Resultado: Red completa con segmentación y IoT
```

### 💾 Plantillas Personalizadas

**Crear Plantilla Personalizada:**
1. **Diseña** tu red ideal
2. **Click en "💾 Plantilla"** en toolbar
3. **Introduce** nombre descriptivo
4. **Confirma** guardado

**Gestionar Plantillas:**
- **Aparecen** en la pestaña plantillas con icono 👤
- **Botón X** para eliminar individualmente
- **Persistencia** en LocalStorage del navegador

**Uso de Plantilla Personalizada:**
- **Click normal**: Carga única (reemplaza diagrama actual)
- **Modo múltiple**: Se combina con otras plantillas

---

## 📝 Sistema de Anotaciones

### 🎯 ¿Qué son las Anotaciones?

Las **anotaciones** son **notas amarillas** que puedes colocar en cualquier lugar del diagrama para:
- 📝 **Documentar** configuraciones especiales
- ⚠️ **Marcar** áreas que requieren atención
- 📋 **Explicar** decisiones de diseño
- 🔍 **Detallar** información técnica

### ✏️ Crear Anotaciones

**Método 1: Modo Anotaciones**
1. **Click en "📝 Notas"** o tecla `A`
2. El botón se pone **amarillo** (modo activo)
3. **Click en cualquier lugar** del canvas
4. **Escribe** el texto de la nota
5. **Confirma** con Enter

**Método 2: Atajo Rápido**
1. **Doble-click** en espacio vacío del canvas
2. Si modo anotaciones está activo, crea nota directamente

### 🎨 Apariencia de Anotaciones

```
┌─────────────────────────┐
│ Esta es una anotación   │ ← Fondo amarillo
│ con información técnica │   Texto negro
│ sobre la configuración  │   Borde dorado
│                     [×] │ ← Botón eliminar
└─────────────────────────┘
```

**Características:**
- **Fondo amarillo** semitransparente
- **Borde dorado** para visibilidad
- **Texto negro** legible
- **Botón X** para eliminar
- **Arrastrables** para reposicionar

### 🔧 Gestionar Anotaciones

**Mover Anotación:**
- **Arrastra** desde cualquier parte de la nota
- **Posicionamiento libre** en el canvas
- **Actualización automática** de posición

**Eliminar Anotación:**
- **Click en X** en la esquina superior derecha
- **Confirmación** automática
- **Sin recuperación** (cuidado)

**Salir del Modo Anotaciones:**
- **Click en "📝 Notas"** de nuevo
- **Tecla `A`** para toggle
- **Escape** cancela modo actual

### 💡 Mejores Prácticas

**Para Documentación Técnica:**
```
🔧 VLAN 100 - Usuarios
📊 Core redundante - STP activo  
⚠️ Revisar ancho de banda mensualmente
🔍 DMZ - Firewall rules aplicadas
```

**Para Planificación:**
```
📅 Actualizar firmware Q2-2024
💰 Budget aprobado - $50K
👥 Capacitación equipo - Marzo
📈 Escalabilidad: +200 usuarios
```

---

## 🔍 Búsqueda Avanzada

### 🎯 Búsqueda en Tiempo Real

**Activar Búsqueda:**
- **Campo de búsqueda** en la barra de herramientas
- **Atajo `Ctrl+F`** enfoca automáticamente
- **Búsqueda instantánea** mientras escribes

### 🔎 Criterios de Búsqueda

La búsqueda incluye **todos estos campos**:

| Campo | Ejemplo | Descripción |
|-------|---------|-------------|
| **Nombre** | `SW-001` | Nombre del dispositivo |
| **Tipo** | `router` | Tipo de equipo |
| **Dirección IP** | `192.168` | IP completa o parcial |
| **Descripción** | `core` | Descripción personalizada |
| **Ubicación** | `sala-1` | Ubicación física |
| **Marca** | `cisco` | Fabricante |
| **Modelo** | `2960` | Modelo específico |

### ✨ Comportamiento de Búsqueda

**Mientras escribes:**
1. **Filtrado instantáneo** de dispositivos
2. **Resaltado dorado** de coincidencias
3. **Animación de pulso** para identificación
4. **Contador** de resultados encontrados

**Ejemplo visual:**
```
Búsqueda: "router"

┌─────────────────┐ ← RESALTADO DORADO
│ [R] 🟢 ✨       │   Animación de pulso  
│   R-001         │ ← COINCIDENCIA
│  192.168.1.1    │
│     CORE        │
└─────────────────┘

Resultado: "3 dispositivos encontrados"
```

### 🎯 Navegación Automática

**Al encontrar resultados:**
- **Scroll automático** al primer resultado
- **Centro en pantalla** del dispositivo
- **Zoom óptimo** para visibilidad
- **Mantiene selección** hasta nueva búsqueda

### 🧹 Limpiar Búsqueda

**Métodos:**
- **Click en "❌"** junto al campo de búsqueda
- **Borrar texto** manualmente
- **Escape** limpia y sale del campo
- **Función `clearSearch()`** programática

### 💡 Tips de Búsqueda Efectiva

**Búsquedas Útiles:**
```
"192.168.1"     → Encuentra dispositivos en subnet específica
"core"          → Localiza equipos de core
"down"          → Encuentra dispositivos inactivos
"cisco"         → Filtra por fabricante
"server"        → Muestra solo servidores
"wifi"          → Equipos inalámbricos
```

**Patrones Avanzados:**
- **Números parciales**: `"192"` encuentra todas las IPs que empiecen con 192
- **Términos técnicos**: `"switch"` incluye L2, L3, managed
- **Estados**: `"up"`, `"down"` para filtrar por estado

---

## 📊 Estadísticas y Análisis

### 📈 Panel de Estadísticas

**Acceso:**
- **Click en "📊 Stats"** en la barra de herramientas
- **Modal completo** con análisis detallado
- **Actualización en tiempo real**

### 📋 Métricas Básicas

```
┌─────────────────────────────────────┐
│ 📊 Estadísticas del Diagrama        │
├─────────────────────────────────────┤
│  [12]    [8]     [3]     [15]      │
│Dispositivos Conexiones Capas Tipos  │
│                                     │
│  [5]      [48]                     │
│Anotaciones Interfaces              │
└─────────────────────────────────────┘
```

### 🔍 Análisis Cualitativo

**Evaluación Automática:**

#### **📈 Complejidad de Red**
- **Baja**: < 10 dispositivos
- **Media**: 10-20 dispositivos  
- **Alta**: > 20 dispositivos

#### **🔄 Redundancia**
- **Alta**: 2+ dispositivos core, múltiples rutas
- **Media**: 1 dispositivo core, algunas rutas alternativas
- **Baja**: Puntos únicos de falla

#### **🛡️ Seguridad**
- **Alta**: 2+ dispositivos de seguridad (FW, IPS, WAF)
- **Media**: 1 dispositivo de seguridad
- **Baja**: Sin dispositivos de seguridad explícitos

#### **📊 Escalabilidad**
- **Alta**: 3+ capas, distribución balanceada
- **Media**: 2-3 capas
- **Baja**: 1 capa o desbalanceada

### 💡 Interpretación de Resultados

**Red Ideal (Ejemplo):**
```
📊 Estadísticas del Diagrama
├─ Dispositivos: 25
├─ Conexiones: 32  
├─ Capas Activas: 5
├─ Tipos de Dispositivos: 12
├─ Anotaciones: 8
└─ Interfaces Totales: 95

📈 Análisis de Calidad:
├─ Complejidad: Alta ✅
├─ Redundancia: Alta ✅ 
├─ Seguridad: Alta ✅
└─ Escalabilidad: Alta ✅

✨ Esta red muestra excelente diseño profesional
```

**Red que Necesita Mejoras:**
```
📊 Estadísticas del Diagrama  
├─ Dispositivos: 8
├─ Conexiones: 6
├─ Capas Activas: 2
└─ Interfaces Totales: 16

⚠️ Áreas de Mejora:
├─ Redundancia: Baja - Agregar dispositivos core
├─ Seguridad: Baja - Incluir firewall
└─ Escalabilidad: Media - Implementar más capas
```

### 📊 Usos del Análisis

**Para Diseño:**
- **Validar arquitectura** antes de implementación
- **Identificar puntos débiles** de la topología
- **Planificar mejoras** futuras

**Para Documentación:**
- **Estadísticas** para presentaciones
- **Métricas** para auditorías
- **Análisis** para presupuestos

**Para Aprendizaje:**
- **Comparar** diferentes diseños
- **Entender** mejores prácticas
- **Evaluar** decisiones arquitecturales

---

## 💾 Guardar y Cargar

### 💾 Guardado Manual

**Guardar Diagrama:**
1. **Click en "💾 Guardar"** o `Ctrl+S`
2. **Archivo JSON** se descarga automáticamente
3. **Nombre formato**: `network_diagram_complete_YYYY-MM-DD.json`
4. **Incluye**: Dispositivos, conexiones, anotaciones, plantillas personalizadas

**Contenido del Archivo:**
```json
{
  "version": "2.2",
  "metadata": {
    "createdAt": "2024-01-15T10:30:00Z",
    "title": "Network Diagram",
    "description": "Created with Network Diagram Creator Pro"
  },
  "settings": {
    "currentLayer": "core",
    "layerVisibility": {...},
    "zoom": 1.0
  },
  "devices": [...],
  "connections": [...],
  "annotations": [...],
  "customTemplates": [...]
}
```

### 📁 Cargar Diagrama

**Cargar Archivo:**
1. **Click en "📁 Cargar"** o `Ctrl+O`
2. **Selecciona** archivo `.json`
3. **Confirmación** si hay trabajo no guardado
4. **Carga completa** con todos los elementos

**Proceso de Carga:**
```
Cargando diagrama...
├─ ✅ Limpiando canvas actual
├─ ✅ Validando formato JSON  
├─ ✅ Restaurando configuración
├─ ✅ Creando dispositivos (12)
├─ ✅ Recreando conexiones (8)
├─ ✅ Agregando anotaciones (5)
├─ ✅ Cargando plantillas personalizadas (2)
└─ ✅ Actualizando estadísticas

✨ Diagrama cargado exitosamente
```

### 🔄 Guardado Automático

**Características:**
- **Intervalo**: Cada 30 segundos
- **Almacenamiento**: LocalStorage del navegador
- **Indicador**: Toast discreto "💾 Guardado automático"
- **Recuperación**: Al abrir la aplicación

**Configuración del Auto-save:**
```javascript
// En la aplicación
autoSaveEnabled = true;        // Activo por defecto
autoSaveInterval = 30000;      // 30 segundos
maxAutoSaveHistory = 5;        // Mantiene 5 versiones
```

**Recuperación Automática:**
```
💾 Auto-save detectado
├─ Última modificación: hace 2 minutos
├─ Dispositivos: 8
├─ Conexiones: 12
└─ ¿Restaurar trabajo anterior? [Sí] [No]
```

### 📸 Exportar como Imagen

**Exportación PNG:**
1. **Click en "📸 Exportar"**
2. **Generación automática** de imagen de alta calidad
3. **Resolución**: 3000x2000 px
4. **Incluye**: Dispositivos visibles, conexiones, grid de fondo
5. **Descarga**: `network_diagram_complete_YYYY-MM-DD.png`

**Características de Exportación:**
- **Fondo blanco** profesional
- **Grid sutil** para referencia
- **Colores precisos** de dispositivos y conexiones
- **Etiquetas legibles** en conexiones
- **Iconos claros** y bien definidos
- **Metadata** en la esquina (título, fecha, estadísticas)

### 🔒 Seguridad y Privacidad

**Datos Locales:**
- ✅ **Sin servidor**: Todo funciona offline
- ✅ **Privacidad total**: Datos nunca salen del navegador
- ✅ **Control completo**: Tú decides qué guardar y compartir

**Recomendaciones:**
- **Backup regular** de archivos JSON importantes
- **Versionado manual** para proyectos grandes
- **Nombres descriptivos** para fácil identificación

---

## ⌨️ Atajos de Teclado Completos

### 📂 Gestión de Archivos

| Combinación | Función | Descripción |
|-------------|---------|-------------|
| `Ctrl+N` | Nuevo diagrama | Limpia el canvas para empezar de cero |
| `Ctrl+S` | Guardar diagrama | Descarga archivo JSON con todo el proyecto |
| `Ctrl+O` | Abrir diagrama | Carga archivo JSON existente |

### ✂️ Edición

| Combinación | Función | Descripción |
|-------------|---------|-------------|
| `Ctrl+C` | Copiar dispositivo | Copia el dispositivo seleccionado al portapapeles |
| `Ctrl+V` | Pegar dispositivo | Pega dispositivo con offset automático |
| `Ctrl+D` | Duplicar dispositivo | Copia y pega en una sola operación |
| `Delete` | Eliminar | Elimina dispositivo/conexión seleccionado |
| `Ctrl+Z` | Deshacer | *Próximamente* |
| `Ctrl+Y` | Rehacer | *Próximamente* |

### 🔍 Navegación y Vista

| Combinación | Función | Descripción |
|-------------|---------|-------------|
| `Ctrl+F` | Buscar | Enfoca el campo de búsqueda |
| `Ctrl++` | Zoom In | Acerca la vista (máx 300%) |
| `Ctrl+-` | Zoom Out | Aleja la vista (mín 25%) |
| `Ctrl+0` | Zoom Normal | Restaura zoom al 100% |
| `Ctrl+1` | Zoom Ajustar | Ajusta diagrama completo en pantalla |

### 🛠️ Herramientas y Modos

| Tecla | Función | Descripción |
|-------|---------|-------------|
| `C` | Modo Conexión | Activa/desactiva modo para conectar dispositivos |
| `A` | Modo Anotaciones | Activa/desactiva modo para agregar notas |
| `V` | Modo Selección | Modo por defecto para seleccionar |
| `H` | Ocultar/Mostrar | Alterna visibilidad de elementos |

### 🎯 Selección y Navegación

| Tecla | Función | Descripción |
|-------|---------|-------------|
| `Tab` | Siguiente dispositivo | Navega al próximo dispositivo |
| `Shift+Tab` | Dispositivo anterior | Navega al dispositivo previo |
| `Enter` | Propiedades | Abre modal de propiedades del seleccionado |
| `Space` | Centrar | Centra la vista en el dispositivo seleccionado |

### 🚫 Cancelación y Escape

| Tecla | Función | Descripción |
|-------|---------|-------------|
| `Escape` | Cancelar todo | Sale de cualquier modo activo |
| | | Cierra modales abiertos |
| | | Limpia selecciones |
| | | Cancela búsquedas |

### 🆘 Ayuda y Información

| Tecla | Función | Descripción |
|-------|---------|-------------|
| `F1` | Ayuda completa | Muestra esta guía de ayuda |
| `F2` | Estadísticas | Abre panel de estadísticas |
| `F11` | Pantalla completa | Modo inmersivo del navegador |

### 🏃‍♂️ Flujos de Trabajo Rápidos

**Crear Red Básica:**
```
Ctrl+N → Arrastrar Router → C → Click Router → Click Switch → Escape
```

**Duplicar y Conectar:**
```
Click dispositivo → Ctrl+D → C → Conectar original con copia → Escape
```

**Buscar y Centrar:**
```
Ctrl+F → Escribir → Enter → Space
```

**Guardar Rápido:**
```
Ctrl+S → [Archivo descargado automáticamente]
```

**Modo Documentación:**
```
A → Click en canvas → Escribir nota → A (salir del modo)
```

---

## 🔧 Solución de Problemas

### ❌ Problemas Comunes y Soluciones

#### **🚫 "No puedo conectar dos dispositivos"**

**Síntomas:**
- Click en dispositivos no crea conexión
- Mensaje de error o no hay respuesta

**Soluciones:**
1. ✅ **Verificar modo conexión activo**
   - El botón "🔗 Conectar" debe mostrar "❌ Cancelar"
   - Activar con botón o tecla `C`

2. ✅ **Seleccionar dispositivos diferentes**
   - No se puede conectar un dispositivo consigo mismo
   - Click en dispositivo A, luego en dispositivo B

3. ✅ **Verificar que sean dispositivos válidos**
   - No anotaciones u otros elementos
   - Solo dispositivos de red reales

#### **🔍 "La búsqueda no encuentra nada"**

**Síntomas:**
- Campo de búsqueda no resalta dispositivos
- Contador muestra "0 dispositivos encontrados"

**Soluciones:**
1. ✅ **Revisar términos de búsqueda**
   - Usar términos exactos o parciales
   - Probar con: nombre, tipo, IP

2. ✅ **Verificar capas visibles**
   - Dispositivo puede estar en capa oculta
   - Activar todas las capas temporalmente

3. ✅ **Limpiar búsqueda anterior**
   - Click en "❌" o tecla `Escape`
   - Escribir nuevos términos

#### **📱 "Los dispositivos aparecen sin interfaces"**

**Síntomas:**
- Modal de propiedades muestra tabla vacía
- No hay interfaces en la vista del canvas

**Soluciones:**
1. ✅ **Dispositivo recién creado**
   - Interfaces se generan automáticamente
   - Verificar en pestaña "🔌 Interfaces"

2. ✅ **Archivo cargado de versión anterior**
   - Click en "➕ Agregar Interfaz"
   - Crear manualmente las necesarias

3. ✅ **Regenerar interfaces por defecto**
   - Cambiar tipo de dispositivo temporalmente
   - Volver al tipo original (regenera interfaces)

#### **🎨 "Los colores de las capas no cambian"**

**Síntomas:**
- Dispositivos mantienen color verde
- Cambio de capa no afecta apariencia

**Soluciones:**
1. ✅ **Guardar propiedades**
   - Después de cambiar capa, click "💾 Guardar"
   - El color se aplica inmediatamente

2. ✅ **Refrescar visual**
   - `F5` para recargar página
   - Cargar diagrama guardado

3. ✅ **Verificar CSS**
   - Asegurar que el navegador soporta CSS moderno
   - Probar en Chrome/Firefox actualizados

### 🔄 Problemas de Rendimiento

#### **🐌 "La aplicación está lenta con muchos dispositivos"**

**Optimizaciones:**
1. ✅ **Limitar dispositivos visibles**
   - Ocultar capas no necesarias
   - Usar zoom para ver solo áreas relevantes

2. ✅ **Reducir anotaciones**
   - Muchas anotaciones pueden afectar rendimiento
   - Agrupar información en menos notas

3. ✅ **Cerrar otras pestañas del navegador**
   - Liberar memoria RAM
   - Dedicar recursos a la aplicación

#### **💾 "El guardado automático no funciona"**

**Verificaciones:**
1. ✅ **LocalStorage disponible**
   - Navegador no en modo privado/incógnito
   - Espacio suficiente en el navegador

2. ✅ **Permisos del navegador**
   - Permitir almacenamiento local
   - No bloquear JavaScript

3. ✅ **Tamaño del diagrama**
   - Diagramas muy grandes pueden fallar
   - Guardar manualmente con `Ctrl+S`

### 🔌 Problemas de Interfaz

#### **📱 "Modal de interfaces no se abre"**

**Soluciones:**
1. ✅ **Popup blocker**
   - Verificar configuración del navegador
   - Permitir popups para la aplicación

2. ✅ **JavaScript habilitado**
   - Confirmar que JS no está bloqueado
   - Revisar extensiones de seguridad

3. ✅ **Recargar aplicación**
   - `F5` para refrescar
   - `Ctrl+F5` para forzar recarga

#### **🖱️ "Los dispositivos no se pueden arrastrar"**

**Soluciones:**
1. ✅ **Salir de otros modos**
   - Tecla `Escape` para cancelar modos activos
   - Verificar que no esté en modo conexión

2. ✅ **Click en área válida**
   - Arrastrar desde el cuerpo del dispositivo
   - No desde botones o interfaces

3. ✅ **Reiniciar modo arrastrar**
   - Click fuera del dispositivo
   - Volver a seleccionar y arrastrar

### 🌐 Problemas de Navegador

#### **💻 Navegadores Recomendados**

| Navegador | Versión Mínima | Estado | Notas |
|-----------|----------------|--------|-------|
| **Chrome** | 80+ | ✅ Óptimo | Mejor rendimiento |
| **Firefox** | 75+ | ✅ Bueno | Funcionalidad completa |
| **Safari** | 13+ | ✅ Bueno | Solo macOS/iOS |
| **Edge** | 80+ | ✅ Bueno | Basado en Chromium |
| **IE** | Cualquiera | ❌ No soportado | Usar Edge |

#### **📱 Compatibilidad Mobile**

**Pantallas Pequeñas:**
- ✅ **Tablet (1024px+)**: Experiencia completa
- ⚠️ **Phone (480px+)**: Funcionalidad limitada
- ❌ **< 480px**: No recomendado

**Controles Táctiles:**
- ✅ Arrastrar dispositivos
- ✅ Zoom con gestos
- ⚠️ Click derecho = press largo
- ❌ Algunos atajos de teclado

---

## 💡 Tips y Mejores Prácticas

### 🎯 Diseño Eficiente de Redes

#### **📊 Planificación Inicial**

**Antes de empezar:**
1. 📋 **Define el alcance**
   - ¿Cuántos usuarios?
   - ¿Qué servicios se necesitan?
   - ¿Presupuesto disponible?

2. 🏗️ **Elige la arquitectura**
   - **1 Capa**: Redes muy pequeñas (< 25 usuarios)
   - **2 Capas**: Oficinas medianas (25-100 usuarios)
   - **3 Capas**: Empresas grandes (100+ usuarios)

3. 📐 **Usa plantillas como base**
   - Empieza con plantilla similar a tus necesidades
   - Modifica según requerimientos específicos

#### **🔧 Convenciones de Nombres**

**Dispositivos de Red:**
```
[Tipo]-[Ubicación]-[Número]
SW-PISO1-001        (Switch Piso 1, número 1)
RT-CORE-001         (Router Core, número 1)  
FW-DMZ-001          (Firewall DMZ, número 1)
AP-SALA-CONF        (Access Point Sala Conferencias)
```

**Direccionamiento IP:**
```
10.0.0.0/8          → Red corporativa principal
├─ 10.1.0.0/16      → Sitio principal
│  ├─ 10.1.1.0/24   → VLAN 1 - Administración
│  ├─ 10.1.10.0/24  → VLAN 10 - Usuarios
│  └─ 10.1.100.0/24 → VLAN 100 - Servidores
└─ 10.2.0.0/16      → Sitio sucursal
```

#### **🎨 Organización Visual**

**Colores por Función:**
- 🔵 **Azul**: Equipos de red (routers, switches)
- 🟢 **Verde**: Dispositivos finales (PCs, phones)
- 🟡 **Amarillo**: Servidores y almacenamiento
- 🔴 **Rojo**: Seguridad (firewalls, IPS)
- 🟣 **Púrpura**: Wireless (APs, controllers)

**Disposición Lógica:**
```
Internet ← ISP ← WAN ← Core ← Distribution ← Access ← Users
   ↑        ↑      ↑     ↑         ↑            ↑       ↑
Externo   Borde  Enlace Núcleo   Agregación   Acceso  Finales
```

### 📝 Documentación Profesional

#### **📋 Información Esencial por Dispositivo**

**Router/Switch:**
```
📋 General:
├─ Nombre: RT-CORE-001
├─ Modelo: Cisco ISR 4331
├─ Serie: FCZ2048B123
└─ Ubicación: Rack A1, U42

🌐 Red:
├─ IP Mgmt: 10.1.1.1/24
├─ Gateway: 10.1.1.254
├─ VLAN: 1 (Management)
└─ SNMP: RO_Community_2024

⚙️ Avanzado:
├─ IOS Version: 15.6(3)M2
├─ Backup: Diario → TFTP
├─ Warranty: 2027-12-31
└─ Costo: $2,850 USD
```

**Servidor:**
```
📋 General:
├─ Nombre: SRV-WEB-001
├─ Función: Servidor Web Principal
├─ OS: Ubuntu 22.04 LTS
└─ Ubicación: DC-Rack-B, U15-16

🌐 Red:
├─ IP Primaria: 10.1.100.10/24
├─ IP Secundaria: 10.1.100.11/24
├─ Gateway: 10.1.100.1
└─ DNS: 8.8.8.8, 8.8.4.4

📊 Specs:
├─ CPU: Intel Xeon 2.4GHz x4
├─ RAM: 32GB DDR4
├─ Storage: 2TB SSD RAID1
└─ Network: 2x 1Gbps NIC
```

#### **📝 Uso Efectivo de Anotaciones**

**Tipos de Anotaciones Útiles:**

1. **🔧 Técnicas**
```
VLAN 10: Usuarios administrativos
STP Root: SW-CORE-001 (Prioridad 4096)
HSRP: 10.1.1.1 (Virtual), Activo: RT-001
Link Aggregation: 2x 1Gbps LAG
```

2. **⚠️ Alertas y Tareas**
```
❗ Actualizar firmware antes de Q2-2024
❗ Cable dañado - reemplazar urgente
❗ Puerto 24 intermitente - monitorear
❗ Backup configuration pendiente
```

3. **📊 Métricas y Monitoring**
```
Utilización promedio: 45%
Picos de tráfico: 8:00 AM, 2:00 PM
Uptime actual: 99.9% (último mes)
Latencia promedio: <5ms
```

4. **💰 Costos y Presupuesto**
```
Costo implementación: $15,000
ROI esperado: 24 meses
Mantenimiento anual: $2,400
Próxima renovación: 2027
```

### 🚀 Flujos de Trabajo Eficientes

#### **⚡ Creación Rápida de Diagramas**

**Flujo Básico (5 minutos):**
1. **Plantilla base** (30s)
   - Seleccionar plantilla similar
   - Aplicar al canvas

2. **Personalización rápida** (2m)
   - Cambiar nombres de dispositivos
   - Ajustar IPs principales
   - Agregar dispositivos faltantes

3. **Conexiones específicas** (1.5m)
   - Eliminar conexiones innecesarias
   - Agregar enlaces requeridos
   - Ajustar tipos de medio

4. **Documentación mínima** (1m)
   - 2-3 anotaciones clave
   - Verificar capas correctas
   - Guardar proyecto

**Flujo Avanzado (30 minutos):**
1. **Análisis y planificación** (5m)
2. **Creación de arquitectura** (10m)
3. **Configuración detallada** (10m)
4. **Documentación completa** (5m)

#### **🔄 Trabajo Colaborativo**

**Preparar para Compartir:**
1. **Nombres descriptivos**
   - Usar convenciones consistentes
   - Incluir propósito del dispositivo

2. **Documentación completa**
   - Anotaciones explicativas
   - Información de contacto en notas

3. **Versioning manual**
   ```
   red_empresa_v1.0_inicial.json
   red_empresa_v1.1_revision_juan.json
   red_empresa_v2.0_final_aprobado.json
   ```

4. **Exportar múltiples formatos**
   - JSON para edición
   - PNG para presentaciones
   - Documentación PDF complementaria

### 🎯 Optimización de Rendimiento

#### **📱 Diagramas Grandes (50+ dispositivos)**

**Técnicas de Optimización:**
1. **División por capas**
   - Trabajar una capa a la vez
   - Ocultar capas no relevantes

2. **Uso de zoom inteligente**
   - Zoom out para vista general
   - Zoom in para trabajo detallado

3. **Anotaciones agrupadas**
   - Una nota por área en lugar de múltiples
   - Links a documentación externa

4. **Separación de diagramas**
   ```
   red_logica_general.json      → Vista de alto nivel
   red_fisica_datacenter.json   → Detalles del DC
   red_access_piso1.json        → Capa acceso específica
   ```

#### **💾 Gestión de Archivos**

**Estructura Recomendada:**
```
Proyectos/
├─ Cliente_ABC/
│  ├─ Versiones/
│  │  ├─ red_abc_v1.0.json
│  │  ├─ red_abc_v1.1.json
│  │  └─ red_abc_v2.0_FINAL.json
│  ├─ Exportaciones/
│  │  ├─ red_abc_presentacion.png
│  │  └─ red_abc_implementacion.png
│  └─ Documentacion/
│     ├─ especificaciones.md
│     └─ configuraciones/
└─ Plantillas_Personalizadas/
   ├─ oficina_pequena.json
   └─ sucursal_tipo.json
```

**Backup Automático:**
1. **Usar guardado automático local**
2. **Export manual regular** (diario/semanal)
3. **Almacenar en múltiples ubicaciones**
   - Disco local
   - Cloud storage (Dropbox, Google Drive)
   - Network share empresarial

---

## ❓ Preguntas Frecuentes

### 🔧 Funcionalidad General

#### **❓ ¿Necesito instalar algo para usar la aplicación?**

**Respuesta:** No. Network Diagram Creator Pro es una aplicación web que funciona completamente en tu navegador. Solo necesitas:
- Navegador moderno (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript habilitado
- Conexión a internet para descargar inicialmente (luego funciona offline)

#### **❓ ¿Mis datos están seguros? ¿Se envían a algún servidor?**

**Respuesta:** Absolutamente seguros. La aplicación funciona 100% en tu navegador local:
- ✅ **Sin servidor**: No hay backend, todo es local
- ✅ **Sin transmisión**: Tus datos nunca salen de tu computadora
- ✅ **Sin registro**: No necesitas crear cuentas ni proporcionar información personal
- ✅ **Control total**: Tú decides qué guardar, exportar o compartir

#### **❓ ¿Puedo usar la aplicación sin conexión a internet?**

**Respuesta:** Sí, una vez cargada la primera vez:
- ✅ **Funcionalidad completa** offline
- ✅ **Guardado local** en LocalStorage
- ✅ **Exportación** de archivos
- ❌ **Recarga de página** requiere conexión inicial

### 📱 Dispositivos y Compatibilidad

#### **❓ ¿Funciona en tablets y móviles?**

**Respuesta:** Funcionalmente sí, pero la experiencia es limitada:
- ✅ **Tablets (1024px+)**: Experiencia completa y recomendada
- ⚠️ **Phones grandes (480px+)**: Funcionalidad básica
- ❌ **Phones pequeños (<480px)**: No recomendado

**Limitaciones móviles:**
- Sidebar más estrecho
- Algunos atajos de teclado no disponibles
- Precisión de arrastrar reducida
- Modal de propiedades puede ser incómodo

#### **❓ ¿Qué navegador funciona mejor?**

**Ranking de rendimiento:**
1. 🥇 **Google Chrome** - Mejor rendimiento y compatibilidad
2. 🥈 **Mozilla Firefox** - Funcionalidad completa, buen rendimiento  
3. 🥉 **Microsoft Edge** - Basado en Chromium, muy bueno
4. 🏅 **Safari** - Bueno en Mac, algunas limitaciones menores

❌ **Internet Explorer**: No soportado, usar Edge

### 🔗 Conectividad y Redes

#### **❓ ¿Puedo conectar cualquier dispositivo con cualquier otro?**

**Respuesta:** Sí, la aplicación no impone restricciones técnicas reales de compatibilidad. Sin embargo, se recomienda seguir mejores prácticas:

**Conexiones Típicas:**
- Router ↔ Router ✅
- Router ↔ Switch ✅  
- Switch ↔ PC/Server ✅
- Firewall ↔ Switch ✅

**Conexiones Inusuales (pero permitidas):**
- PC ↔ PC (direct connection)
- Router ↔ Printer (management)
- Server ↔ Storage (SAN)

#### **❓ ¿Cómo represento enlaces redundantes?**

**Métodos recomendados:**
1. **Múltiples líneas** entre dispositivos
2. **Anotaciones** explicando el tipo de redundancia
3. **Colores diferentes** para primary/backup
4. **Plantilla de campus** como ejemplo

**Ejemplo de Documentación:**
```
🔄 HSRP Configurado
├─ Primary: RT-001 (10.1.1.1)
├─ Secondary: RT-002 (10.1.1.2)
└─ Virtual IP: 10.1.1.1
```

### 💾 Archivos y Datos

#### **❓ ¿Puedo importar diagramas de Visio, Lucidchart u otras herramientas?**

**Respuesta:** Actualmente no hay importación directa de otros formatos. Alternativas:
- ✅ **Recrear usando plantillas** como base
- ✅ **Copiar/pegar información** de configuraciones
- ✅ **Usar screenshots** como referencia mientras recreas
- 🔄 **Importación futura**: Considerada para versiones próximas

#### **❓ ¿Cómo hago backup de mis diagramas?**

**Estrategia de Backup Recomendada:**
1. **Guardado manual regular** (`Ctrl+S`)
2. **Múltiples ubicaciones**:
   - Carpeta local en PC
   - Cloud storage (Google Drive, Dropbox)
   - Network share empresarial
3. **Naming convention**:
   ```
   proyecto_nombre_vX.Y_fecha.json
   oficina_madrid_v2.1_20240115.json
   ```
4. **Guardar also as PNG** para documentación

#### **❓ ¿El guardado automático reemplaza el guardado manual?**

**Respuesta:** No, son complementarios:

**Guardado Automático:**
- ✅ **Recovery** en caso de cierre accidental
- ✅ **LocalStorage** del navegador
- ✅ **Última sesión** solamente
- ❌ **No es backup permanente**

**Guardado Manual:**
- ✅ **Archivo permanente** en tu sistema
- ✅ **Control de versiones** manual
- ✅ **Compartible** con otros
- ✅ **Backup duradero**

### 🎨 Personalización y Diseño

#### **❓ ¿Puedo cambiar los colores de los dispositivos?**

**Respuesta:** Los colores están predefinidos por tipo de dispositivo y capa, pero hay flexibilidad:

**Colores Automáticos:**
- **Por tipo**: Router (rojo), Switch (verde), etc.
- **Por capa**: Core (azul), Access (naranja), etc.
- **Por estado**: UP (verde), DOWN (rojo), Warning (amarillo)

**Personalización:**
- ✅ **Cambiar capa** del dispositivo (cambia color de fondo)
- ✅ **Anotaciones coloridas** para distinguir áreas
- ✅ **Conexiones por tipo** (colores diferentes)
- 🔄 **Temas personalizables**: Considerado para futuras versiones

#### **❓ ¿Puedo agregar mi propio logo o marca?**

**Actualmente:**
- ❌ **Logo personalizable** no implementado
- ✅ **Anotaciones** pueden simular watermarks
- ✅ **Export PNG** permite edición externa

**Workaround:**
1. Exportar PNG del diagrama
2. Usar editor de imágenes (Photoshop, GIMP)
3. Agregar logo/marca
4. Usar para presentaciones

### 🔧 Problemas Técnicos

#### **❓ ¿Qué hago si la aplicación se "congela" o no responde?**

**Pasos de troubleshooting:**
1. **Esperar 10 segundos** - Puede estar procesando
2. **Tecla Escape** - Cancela operaciones activas
3. **Refrescar página** (`F5`) - Mantiene auto-save
4. **Limpiar cache** (`Ctrl+F5`) - Fuerza recarga completa
5. **Reiniciar navegador** - Libera memoria
6. **Verificar otros recursos** - Cerrar tabs innecesarias

**Prevención:**
- ✅ **Diagramas < 100 dispositivos** recomendado
- ✅ **Guardado manual frecuente**
- ✅ **Cerrar modales** no utilizados
- ✅ **Usar zoom** en lugar de scroll extenso

#### **❓ ¿Por qué algunos atajos de teclado no funcionan?**

**Causas Comunes:**
1. **Foco en campo de texto** - Click fuera del campo
2. **Modal abierto** - Cerrar modal primero
3. **Navegador bloquea** - Configurar excepciones
4. **Extensiones interfieren** - Deshabilitar temporalmente

**Verificación:**
- ✅ **Click en área del canvas** antes de usar atajos
- ✅ **Cerrar modales** abiertos
- ✅ **Verificar no estar en modo edición** de texto
- ✅ **Probar en modo incógnito** del navegador

### 🚀 Características Futuras

#### **❓ ¿Habrá modo colaborativo en tiempo real?**

**Respuesta:** Está en el roadmap para la versión 3.0:
- 🔄 **Colaboración en tiempo real** considerada
- 🔄 **Comentarios** en dispositivos/conexiones
- 🔄 **Control de versiones** automático
- 🔄 **Roles y permisos** (editor, viewer)

**Mientras tanto:**
- ✅ **Compartir archivos JSON** por email/slack
- ✅ **Export PNG** para reviews
- ✅ **Documentación en anotaciones** para contexto

#### **❓ ¿Se pueden importar configuraciones reales de equipos?**

**Roadmap futuro (versión 2.3-3.0):**
- 🔄 **SNMP integration** para auto-discovery
- 🔄 **SSH/Telnet** para obtener configuraciones
- 🔄 **API integration** con herramientas de monitoreo
- 🔄 **Network scanning** (Nmap integration)

**Actualmente:**
- ✅ **Manual input** de toda información
- ✅ **Copy/paste** desde configuraciones existentes
- ✅ **Templates** basados en equipos reales

---

<div align="center">

## 🎉 ¡Felicidades!

**Has completado la guía completa de Network Diagram Creator Pro**

Con esta información, estás listo para crear diagramas de red profesionales de nivel empresarial.

### 📚 Recursos Adicionales

- 📖 [README.md](README.md) - Información general del proyecto
- 🐛 [Reportar Problemas](https://github.com/tu-usuario/network-diagram-creator/issues)
- 💡 [Solicitar Features](https://github.com/tu-usuario/network-diagram-creator/issues)
- 💬 [Comunidad y Discusiones](https://github.com/tu-usuario/network-diagram-creator/discussions)

### ⭐ ¿Te Resultó Útil?

Si esta guía te ayudó, considera:
- ⭐ **Dar una estrella** al proyecto en GitHub
- 📢 **Compartir** con colegas de IT/Networking
- 🐛 **Reportar bugs** que encuentres
- 💡 **Sugerir mejoras** para futuras versiones

---

**¡Feliz diagramado! 🌐✨**

</div>