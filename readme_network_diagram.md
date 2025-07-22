# 🌐 Network Diagram Creator Pro

![Version](https://img.shields.io/badge/version-2.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

**Una aplicación web profesional para crear diagramas de red interactivos y documentados.** Diseñada para ingenieros de redes, administradores de sistemas y estudiantes que necesitan visualizar topologías de red de manera clara y profesional.

## ✨ Características Principales

### 🎨 **Interfaz de Usuario Avanzada**
- **Sidebar con scroll completo** - Acceso a todos los tipos de dispositivos
- **Sistema de capas jerárquico** - Organización por ISP, WAN, Core, Distribution, Access, DMZ, User, IoT
- **Minimapa interactivo** - Navegación rápida por diagramas grandes
- **Zoom avanzado** (25% - 300%) con controles intuitivos
- **Notificaciones no intrusivas** y tooltips informativos

### 📱 **Dispositivos de Red Completos**
- **25+ tipos de dispositivos** profesionales:
  - 🔧 **Infraestructura**: Core Router, Edge Router, L3/L2 Switches, Hubs
  - 🛡️ **Seguridad**: Firewall, IPS, WAF, VPN Gateway, Load Balancer
  - 📡 **Inalámbrico**: Access Points, WiFi Controllers, Módems
  - 🖥️ **Servidores**: Web, Base de Datos, DNS, Mail, Genéricos
  - 💻 **Dispositivos Finales**: PCs, Laptops, Impresoras, Teléfonos IP
  - 💾 **Almacenamiento**: NAS, SAN
  - 🌐 **IoT**: Dispositivos IoT, Sensores, Cámaras IP

### 🔌 **Gestión Avanzada de Interfaces**
- **Configuración completa por dispositivo**:
  - Estados: Activo (UP) / Inactivo (DOWN)
  - Tipos: Ethernet, Fibra, Serial, Inalámbrico, VLAN, Loopback
  - Configuración: IP, VLAN, Velocidad, Descripción
- **Interfaces específicas** según tipo de dispositivo
- **Modal profesional** para creación/edición
- **Visualización en tiempo real** en cada dispositivo

### 🔗 **Sistema de Conexiones Inteligente**
- **5 tipos de conexiones**:
  - 🟢 **UTP** (Verde) - 1 Gbps
  - 🟠 **Fibra Óptica** (Naranja) - 10 Gbps  
  - 🟣 **Serial** (Violeta) - 2 Mbps
  - ⚪ **Coaxial** (Gris) - 100 Mbps
  - 🔵 **Inalámbrico** (Azul) - 300 Mbps
- **Etiquetas de ancho de banda** automáticas
- **Z-index optimizado** (conexiones detrás de dispositivos)

### 📋 **Plantillas Profesionales**
- **10+ plantillas predefinidas**:
  - 🏢 Red Empresarial Básica
  - 🛡️ Red con DMZ
  - 🏫 Red de Campus (3 capas)
  - 🏭 Data Center con redundancia
  - ⭐ Topología Estrella
  - 🕸️ Red Mesh
  - 🌐 Red IoT
  - ☁️ Red Híbrida (Cloud)
  - 📶 Empresa Inalámbrica
  - 🏢 Oficina Pequeña
- **Modo combinación múltiple** - Aplicar varias plantillas simultáneamente
- **Plantillas personalizadas** - Guarda tus propios diseños

### 📝 **Sistema de Documentación**
- **Anotaciones interactivas** - Notas arrastrables en el diagrama
- **Generación automática de documentación** técnica
- **Propiedades avanzadas** por dispositivo:
  - 📋 General: Nombre, modelo, marca, serie, ubicación
  - 🌐 Red: IP, máscara, gateway, DNS, MAC, VLAN
  - 🔌 Interfaces: Gestión completa de puertos
  - 📊 Monitoreo: CPU, RAM, temperatura, alertas
  - ⚙️ Avanzado: SNMP, backup, firmware, garantía, costos

### 🔍 **Herramientas Avanzadas**
- **Búsqueda inteligente** en tiempo real (por nombre, IP, tipo)
- **Copiar/Pegar/Duplicar** dispositivos con propiedades
- **Estadísticas completas** de la red:
  - Métricas: Dispositivos, conexiones, interfaces
  - Análisis: Complejidad, redundancia, seguridad, escalabilidad
- **Validación de topología** automática
- **Auto-organización** por capas

### 💾 **Gestión de Archivos**
- **Guardado automático** cada 30 segundos
- **Exportación profesional** a imagen PNG de alta calidad
- **Formato JSON** para intercambio de datos
- **Plantillas personalizadas** persistentes

## 🚀 Instalación y Uso

### Opción 1: Uso Directo
1. **Descarga** el archivo `network_diagram_creator_v3.html`
2. **Abre** el archivo en cualquier navegador moderno
3. **¡Listo!** - No requiere instalación ni servidor

### Opción 2: Servidor Local
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js
npx http-server

# Abre http://localhost:8000
```

### Requisitos del Sistema
- ✅ **Navegadores compatibles**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- ✅ **JavaScript** habilitado
- ✅ **Resolución mínima**: 1024x768 (recomendado: 1920x1080)
- ✅ **RAM**: 512MB disponibles para el navegador

## 📖 Guía de Inicio Rápido

### 1. **Crear tu Primera Red**
```
1. Arrastra un "Router" desde el sidebar al canvas
2. Arrastra un "Switch L2" debajo del router
3. Agrega algunos "PCs" conectados al switch
4. Click en "🔗 Conectar" en la barra de herramientas
5. Selecciona dispositivos para conectarlos
6. ¡Tu primera red está lista!
```

### 2. **Usar Plantillas**
```
1. Ve a la pestaña "📋 Plantillas" en el sidebar
2. Click en "Red Empresarial Básica"
3. Confirma la carga de la plantilla
4. ¡Red completa en segundos!
```

### 3. **Configurar Dispositivos**
```
1. Click derecho en cualquier dispositivo
2. Selecciona "Propiedades"
3. Configura IP, interfaces, monitoreo
4. Guarda los cambios
```

## ⌨️ Atajos de Teclado

| Función | Atajo | Descripción |
|---------|-------|-------------|
| **Archivo** | | |
| Nuevo diagrama | `Ctrl+N` | Crear diagrama en blanco |
| Guardar | `Ctrl+S` | Descargar como JSON |
| Abrir | `Ctrl+O` | Cargar diagrama existente |
| **Edición** | | |
| Copiar | `Ctrl+C` | Copiar dispositivo seleccionado |
| Pegar | `Ctrl+V` | Pegar dispositivo |
| Duplicar | `Ctrl+D` | Duplicar dispositivo |
| Eliminar | `Delete` | Eliminar seleccionado |
| **Navegación** | | |
| Buscar | `Ctrl+F` | Buscar dispositivos |
| Zoom In | `Ctrl++` | Acercar vista |
| Zoom Out | `Ctrl+-` | Alejar vista |
| Zoom Normal | `Ctrl+0` | Restablecer zoom |
| **Modos** | | |
| Conexión | `C` | Activar modo conexión |
| Anotaciones | `A` | Activar modo notas |
| **Otros** | | |
| Ayuda | `F1` | Mostrar ayuda completa |
| Cancelar | `Escape` | Cancelar acciones activas |

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Gráficos**: SVG nativo, Canvas API
- **Almacenamiento**: LocalStorage API
- **Diseño**: CSS Grid, Flexbox, CSS Custom Properties
- **Arquitectura**: Componentes modulares, Event-driven
- **Compatibilidad**: Responsive design, Cross-browser

## 📊 Casos de Uso

### 🏢 **Empresarial**
- Documentación de infraestructura IT
- Planificación de upgrades de red
- Diagramas para auditorías de seguridad
- Presentaciones técnicas a gerencia

### 🎓 **Educativo**  
- Enseñanza de conceptos de redes
- Laboratorios virtuales de networking
- Proyectos estudiantiles de diseño de red
- Certificaciones (CCNA, Network+)

### 🔧 **Técnico**
- Troubleshooting de problemas de red
- Diseño de nuevas implementaciones
- Documentación de cambios
- Análisis de rendimiento

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### 📝 **Código de Conducta**
- Usa comentarios claros en español
- Sigue las convenciones de nomenclatura existentes
- Prueba en múltiples navegadores
- Documenta nuevas funcionalidades

## 🐛 Reportar Problemas

Usa GitHub Issues para reportar bugs o solicitar features:

1. **Busca** issues existentes primero
2. **Describe** el problema claramente
3. **Incluye** pasos para reproducir
4. **Adjunta** screenshots si es posible

## 📈 Roadmap

### Versión 2.3 (Próxima)
- [ ] Exportación a PDF con múltiples páginas
- [ ] Integración con herramientas de monitoreo (SNMP)
- [ ] Modo colaborativo en tiempo real
- [ ] Templates de normas internacionales (ISO/IEC)

### Versión 3.0 (Futuro)
- [ ] Backend opcional para persistencia
- [ ] API REST para integraciones
- [ ] Modo oscuro completo  
- [ ] Soporte para diagramas 3D
- [ ] Mobile app complementaria

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para detalles.

```
MIT License - Libre para uso comercial y personal
- ✅ Uso comercial
- ✅ Modificación  
- ✅ Distribución
- ✅ Uso privado
```

## 👨‍💻 Autor

**Tu Nombre** - [GitHub](https://github.com/tu-usuario) - [Email](mailto:tu-email@ejemplo.com)

## 🙏 Agradecimientos

- Iconografía inspirada en estándares de la industria
- Paleta de colores basada en mejores prácticas de UI/UX
- Funcionalidades solicitadas por la comunidad de networking
- Feedback valioso de usuarios beta

---

<div align="center">

**⭐ Si este proyecto te resulta útil, ¡dale una estrella! ⭐**

[🐛 Reportar Bug](https://github.com/tu-usuario/network-diagram-creator/issues) • [💡 Solicitar Feature](https://github.com/tu-usuario/network-diagram-creator/issues) • [📖 Documentación Completa](ayuda.md)

</div>