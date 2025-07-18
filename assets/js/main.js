/**
 * main.js - Sistema de integración principal para Network Diagram Creator
 * Conecta todos los módulos y maneja la inicialización de la aplicación
 */

// Estado global de la aplicación
window.NetworkDiagram = {
    initialized: false,
    config: null,
    layerManager: null,
    deviceManager: null,
    connectionManager: null,
    canvasManager: null,
    fileManager: null,
    components: {},
    currentProject: {
        name: 'Nuevo Proyecto',
        devices: [],
        connections: [],
        settings: {}
    }
};

/**
 * Clase principal de la aplicación
 */
class NetworkDiagramApp {
    constructor() {
        this.config = null;
        this.managers = {};
        this.isInitialized = false;
        this.canvas = null;
        this.ctx = null;
        this.selectedDevice = null;
        this.connectionMode = false;
        this.currentTool = 'select';
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.devices = new Map();
        this.connections = [];
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🚀 Inicializando Network Diagram Creator...');
            
            // 1. Cargar configuración
            await this.loadConfig();
            
            // 2. Inicializar canvas
            this.initializeCanvas();
            
            // 3. Inicializar managers
            this.initializeManagers();
            
            // 4. Crear interfaz de usuario
            this.createUserInterface();
            
            // 5. Configurar event listeners
            this.setupEventListeners();
            
            // 6. Cargar bibliotecas de dispositivos
            this.loadDeviceLibrary();
            
            // 7. Marcar como inicializado
            this.isInitialized = true;
            window.NetworkDiagram.initialized = true;
            
            console.log('✅ Aplicación inicializada correctamente');
            
            // Mostrar notificación de éxito
            this.showNotification('Aplicación cargada correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.showNotification('Error al inicializar la aplicación: ' + error.message, 'error');
        }
    }

    /**
     * Carga la configuración desde el archivo JSON
     */
    async loadConfig() {
        try {
            // Si ya existe configuración cargada, usarla
            if (window.defaultConfigs) {
                this.config = window.defaultConfigs;
                return;
            }

            // Intentar cargar desde archivo
            const response = await fetch('./data/default-configs.json');
            if (response.ok) {
                this.config = await response.json();
            } else {
                // Configuración de respaldo
                this.config = this.getDefaultConfig();
                console.warn('⚠️ Usando configuración por defecto');
            }
            
            window.NetworkDiagram.config = this.config;
            
        } catch (error) {
            console.warn('⚠️ No se pudo cargar configuración externa, usando configuración por defecto');
            this.config = this.getDefaultConfig();
        }
    }

    /**
     * Configuración por defecto en caso de que no se pueda cargar el archivo
     */
    getDefaultConfig() {
        return {
            deviceTypes: {
                router: {
                    name: "Router",
                    icon: "RT",
                    category: "network",
                    color: "#FF6B6B",
                    properties: {
                        ip: "",
                        mask: "255.255.255.0",
                        description: "",
                        status: "active"
                    }
                },
                switch: {
                    name: "Switch",
                    icon: "SW",
                    category: "network",
                    color: "#4ECDC4",
                    properties: {
                        ip: "",
                        mask: "255.255.255.0",
                        description: "",
                        status: "active"
                    }
                },
                firewall: {
                    name: "Firewall",
                    icon: "FW",
                    category: "security",
                    color: "#FF9FF3",
                    properties: {
                        ip: "",
                        mask: "255.255.255.0",
                        description: "",
                        status: "active"
                    }
                },
                server: {
                    name: "Servidor",
                    icon: "SV",
                    category: "compute",
                    color: "#45B7D1",
                    properties: {
                        ip: "",
                        mask: "255.255.255.0",
                        description: "",
                        status: "active"
                    }
                },
                workstation: {
                    name: "PC",
                    icon: "PC",
                    category: "endpoint",
                    color: "#54A0FF",
                    properties: {
                        ip: "",
                        mask: "255.255.255.0",
                        description: "",
                        status: "active"
                    }
                }
            },
            connectionTypes: {
                ethernet: {
                    name: "Ethernet",
                    color: "#2D3748",
                    style: "solid",
                    width: 2
                },
                fiber: {
                    name: "Fibra Óptica",
                    color: "#FF6B6B",
                    style: "solid",
                    width: 3
                },
                wireless: {
                    name: "Inalámbrico",
                    color: "#9B59B6",
                    style: "dotted",
                    width: 2
                }
            },
            layers: {
                "Core": {
                    name: "Core",
                    description: "Núcleo de la red",
                    color: "#45B7D1",
                    order: 2,
                    yPosition: 250
                },
                "Distribution": {
                    name: "Distribution",
                    description: "Capa de distribución",
                    color: "#96CEB4",
                    order: 3,
                    yPosition: 350
                },
                "Access": {
                    name: "Access",
                    description: "Capa de acceso",
                    color: "#FECA57",
                    order: 4,
                    yPosition: 450
                },
                "User": {
                    name: "User",
                    description: "Dispositivos de usuario",
                    color: "#54A0FF",
                    order: 6,
                    yPosition: 650
                }
            }
        };
    }

    /**
     * Inicializa el canvas principal
     */
    initializeCanvas() {
        this.canvas = document.getElementById('main-canvas');
        if (!this.canvas) {
            // Crear canvas si no existe
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'main-canvas';
            this.canvas.width = 2000;
            this.canvas.height = 1500;
            
            const container = document.querySelector('.canvas-container') || document.querySelector('.main-content');
            if (container) {
                container.appendChild(this.canvas);
            } else {
                document.body.appendChild(this.canvas);
            }
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Configurar canvas responsive
        this.resizeCanvas();
        
        // Limpiar canvas
        this.clearCanvas();
        
        console.log('✅ Canvas inicializado');
    }

    /**
     * Inicializa todos los managers
     */
    initializeManagers() {
        try {
            // Layer Manager
            if (window.LayerManager) {
                this.managers.layerManager = new LayerManager();
                window.NetworkDiagram.layerManager = this.managers.layerManager;
                console.log('✅ LayerManager inicializado');
            } else {
                console.warn('⚠️ LayerManager no disponible, creando implementación básica');
                this.managers.layerManager = this.createBasicLayerManager();
            }

            // Device Manager básico
            this.managers.deviceManager = this.createDeviceManager();
            
            // Connection Manager básico
            this.managers.connectionManager = this.createConnectionManager();
            
            console.log('✅ Managers inicializados');
            
        } catch (error) {
            console.error('❌ Error inicializando managers:', error);
        }
    }

    /**
     * Crea un DeviceManager básico
     */
    createDeviceManager() {
        return {
            devices: new Map(),
            
            createDevice: (type, x, y, properties = {}) => {
                const deviceConfig = this.config.deviceTypes[type];
                if (!deviceConfig) {
                    throw new Error(`Tipo de dispositivo ${type} no encontrado`);
                }

                const device = {
                    id: 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: type,
                    name: properties.name || `${deviceConfig.name}-${this.devices.size + 1}`,
                    x: x,
                    y: y,
                    width: 80,
                    height: 60,
                    properties: { ...deviceConfig.properties, ...properties },
                    config: deviceConfig
                };

                this.devices.set(device.id, device);
                this.renderDevice(device);
                
                return device;
            },
            
            removeDevice: (deviceId) => {
                this.devices.delete(deviceId);
                this.redrawCanvas();
            },
            
            getDevice: (deviceId) => {
                return this.devices.get(deviceId);
            },
            
            getAllDevices: () => {
                return Array.from(this.devices.values());
            }
        };
    }

    /**
     * Crea un ConnectionManager básico
     */
    createConnectionManager() {
        return {
            connections: [],
            
            createConnection: (device1Id, device2Id, type = 'ethernet') => {
                const device1 = this.devices.get(device1Id);
                const device2 = this.devices.get(device2Id);
                
                if (!device1 || !device2) {
                    throw new Error('Dispositivos no encontrados');
                }

                const connection = {
                    id: 'conn_' + Date.now(),
                    device1: device1Id,
                    device2: device2Id,
                    type: type,
                    properties: {}
                };

                this.connections.push(connection);
                this.redrawCanvas();
                
                return connection;
            },
            
            removeConnection: (connectionId) => {
                this.connections = this.connections.filter(c => c.id !== connectionId);
                this.redrawCanvas();
            }
        };
    }

    /**
     * Crea un LayerManager básico si no está disponible
     */
    createBasicLayerManager() {
        return {
            layers: new Map(),
            deviceLayers: new Map(),
            
            init: () => {
                Object.entries(this.config.layers).forEach(([name, config]) => {
                    this.layers.set(name, {
                        ...config,
                        devices: new Set(),
                        visible: true
                    });
                });
            },
            
            assignDeviceToLayer: (deviceId, layerName) => {
                if (this.layers.has(layerName)) {
                    this.deviceLayers.set(deviceId, layerName);
                    this.layers.get(layerName).devices.add(deviceId);
                    return true;
                }
                return false;
            },
            
            getDeviceLayer: (deviceId) => {
                return this.deviceLayers.get(deviceId);
            }
        };
    }

    /**
     * Crea la interfaz de usuario
     */
    createUserInterface() {
        // Verificar si ya existe la estructura
        if (!document.querySelector('.sidebar')) {
            this.createSidebarStructure();
        }
        
        // Crear controles de zoom si no existen
        if (!document.querySelector('.zoom-controls')) {
            this.createZoomControls();
        }
        
        console.log('✅ Interfaz de usuario creada');
    }

    /**
     * Crea la estructura del sidebar
     */
    createSidebarStructure() {
        const sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        
        sidebar.innerHTML = `
            <div class="sidebar-section">
                <div class="sidebar-title">
                    <span>Dispositivos</span>
                </div>
                <div class="device-library" id="device-library">
                    <!-- Los dispositivos se cargarán aquí -->
                </div>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-title">
                    <span>Capas</span>
                </div>
                <div class="layer-panel" id="layer-panel">
                    <!-- Las capas se cargarán aquí -->
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
    }

    /**
     * Carga la biblioteca de dispositivos
     */
    loadDeviceLibrary() {
        const container = document.getElementById('device-library');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.config.deviceTypes).forEach(([type, config]) => {
            const deviceElement = document.createElement('div');
            deviceElement.className = 'device-item';
            deviceElement.dataset.deviceType = type;
            deviceElement.draggable = true;
            
            deviceElement.innerHTML = `
                <div class="device-icon" style="background-color: ${config.color}">
                    ${config.icon}
                </div>
                <div class="device-name">${config.name}</div>
            `;

            // Event listeners para drag and drop
            deviceElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/device-type', type);
            });

            deviceElement.addEventListener('click', () => {
                this.selectDeviceType(type);
            });

            container.appendChild(deviceElement);
        });

        console.log('✅ Biblioteca de dispositivos cargada');
    }

    /**
     * Crea controles de zoom
     */
    createZoomControls() {
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        
        zoomControls.innerHTML = `
            <button class="zoom-btn" id="zoom-in" title="Acercar">+</button>
            <div class="zoom-level" id="zoom-level">100%</div>
            <button class="zoom-btn" id="zoom-out" title="Alejar">-</button>
            <button class="zoom-btn" id="zoom-fit" title="Ajustar">⌂</button>
        `;
        
        document.body.appendChild(zoomControls);
        
        // Event listeners para zoom
        document.getElementById('zoom-in').addEventListener('click', () => this.setZoom(this.zoom * 1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.setZoom(this.zoom / 1.2));
        document.getElementById('zoom-fit').addEventListener('click', () => this.fitToCanvas());
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        this.canvas.addEventListener('drop', (e) => this.handleCanvasDrop(e));

        // Toolbar events
        this.setupToolbarEvents();
        
        // Window events
        window.addEventListener('resize', () => this.resizeCanvas());
        
        console.log('✅ Event listeners configurados');
    }

    /**
     * Configura eventos de la toolbar
     */
    setupToolbarEvents() {
        // Herramientas básicas
        const tools = ['select', 'connect', 'pan'];
        tools.forEach(tool => {
            const btn = document.querySelector(`[data-tool="${tool}"]`);
            if (btn) {
                btn.addEventListener('click', () => this.setTool(tool));
            }
        });

        // Botón conectar (fallback)
        const connectBtn = document.getElementById('btn-connect') || 
                          document.querySelector('.btn-connect') ||
                          document.querySelector('[data-action="connect"]');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                this.connectionMode = !this.connectionMode;
                connectBtn.classList.toggle('active', this.connectionMode);
                this.canvas.style.cursor = this.connectionMode ? 'crosshair' : 'default';
            });
        }

        // Otros botones de la toolbar
        this.setupToolbarButtons();
    }

    /**
     * Configura botones adicionales de la toolbar
     */
    setupToolbarButtons() {
        const buttons = {
            'nuevo': () => this.newProject(),
            'guardar': () => this.saveProject(),
            'cargar': () => this.loadProject(),
            'exportar': () => this.exportProject(),
            'limpiar': () => this.clearCanvas(),
            'auto-organizar': () => this.autoOrganize(),
            'validar': () => this.validateTopology()
        };

        Object.entries(buttons).forEach(([action, handler]) => {
            const btn = document.querySelector(`[data-action="${action}"]`) ||
                      document.getElementById(`btn-${action}`) ||
                      document.querySelector(`.btn-${action}`);
            
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }

    /**
     * Maneja clics en el canvas
     */
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom - this.panX;
        const y = (e.clientY - rect.top) / this.zoom - this.panY;

        const clickedDevice = this.getDeviceAt(x, y);

        if (this.connectionMode && clickedDevice) {
            this.handleConnectionMode(clickedDevice);
        } else if (clickedDevice) {
            this.selectDevice(clickedDevice);
        } else {
            this.selectedDevice = null;
            this.redrawCanvas();
        }
    }

    /**
     * Maneja movimiento del mouse en el canvas
     */
    handleCanvasMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom - this.panX;
        const y = (e.clientY - rect.top) / this.zoom - this.panY;

        const hoveredDevice = this.getDeviceAt(x, y);
        this.canvas.style.cursor = hoveredDevice ? 'pointer' : 'default';

        // Tooltip básico
        if (hoveredDevice) {
            this.canvas.title = `${hoveredDevice.name} (${hoveredDevice.type})`;
        } else {
            this.canvas.title = '';
        }
    }

    /**
     * Maneja drop en el canvas
     */
    handleCanvasDrop(e) {
        e.preventDefault();
        
        const deviceType = e.dataTransfer.getData('text/device-type');
        if (!deviceType) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom - this.panX;
        const y = (e.clientY - rect.top) / this.zoom - this.panY;

        this.createDeviceAt(deviceType, x, y);
    }

    /**
     * Crea un dispositivo en las coordenadas especificadas
     */
    createDeviceAt(type, x, y) {
        try {
            const device = this.managers.deviceManager.createDevice(type, x, y);
            
            // Asignar a capa por defecto
            if (this.managers.layerManager) {
                this.managers.layerManager.assignDeviceToLayer(device.id, 'Access');
            }
            
            this.showNotification(`Dispositivo ${device.name} creado`, 'success');
            
        } catch (error) {
            console.error('Error creando dispositivo:', error);
            this.showNotification('Error creando dispositivo: ' + error.message, 'error');
        }
    }

    /**
     * Obtiene el dispositivo en las coordenadas especificadas
     */
    getDeviceAt(x, y) {
        for (const device of this.devices.values()) {
            if (x >= device.x && x <= device.x + device.width &&
                y >= device.y && y <= device.y + device.height) {
                return device;
            }
        }
        return null;
    }

    /**
     * Renderiza un dispositivo en el canvas
     */
    renderDevice(device) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.panX, this.panY);

        // Fondo del dispositivo
        ctx.fillStyle = device.config.color;
        ctx.fillRect(device.x, device.y, device.width, device.height);

        // Borde
        ctx.strokeStyle = device === this.selectedDevice ? '#007bff' : '#666';
        ctx.lineWidth = device === this.selectedDevice ? 3 : 1;
        ctx.strokeRect(device.x, device.y, device.width, device.height);

        // Icono
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(device.config.icon, device.x + device.width/2, device.y + 25);

        // Nombre
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(device.name, device.x + device.width/2, device.y + device.height - 5);

        // Estado
        const statusColor = device.properties.status === 'active' ? '#28a745' : '#dc3545';
        ctx.fillStyle = statusColor;
        ctx.beginPath();
        ctx.arc(device.x + device.width - 8, device.y + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Redibuja todo el canvas
     */
    redrawCanvas() {
        this.clearCanvas();
        
        // Dibujar grid
        this.drawGrid();
        
        // Dibujar conexiones
        this.drawConnections();
        
        // Dibujar dispositivos
        for (const device of this.devices.values()) {
            this.renderDevice(device);
        }
    }

    /**
     * Limpia el canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Dibuja el grid de fondo
     */
    drawGrid() {
        const ctx = this.ctx;
        const gridSize = 20 * this.zoom;
        
        ctx.save();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    /**
     * Dibuja todas las conexiones
     */
    drawConnections() {
        this.connections.forEach(connection => {
            this.drawConnection(connection);
        });
    }

    /**
     * Dibuja una conexión específica
     */
    drawConnection(connection) {
        const device1 = this.devices.get(connection.device1);
        const device2 = this.devices.get(connection.device2);
        
        if (!device1 || !device2) return;

        const ctx = this.ctx;
        const connectionConfig = this.config.connectionTypes[connection.type];
        
        ctx.save();
        ctx.scale(this.zoom, this.zoom);
        ctx.translate(this.panX, this.panY);

        ctx.strokeStyle = connectionConfig.color;
        ctx.lineWidth = connectionConfig.width;
        
        if (connectionConfig.style === 'dotted') {
            ctx.setLineDash([5, 5]);
        } else if (connectionConfig.style === 'dashed') {
            ctx.setLineDash([10, 5]);
        }

        ctx.beginPath();
        ctx.moveTo(device1.x + device1.width/2, device1.y + device1.height/2);
        ctx.lineTo(device2.x + device2.width/2, device2.y + device2.height/2);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Ajusta el tamaño del canvas
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
            this.redrawCanvas();
        }
    }

    /**
     * Establece el nivel de zoom
     */
    setZoom(newZoom) {
        this.zoom = Math.max(0.1, Math.min(3, newZoom));
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        }
        this.redrawCanvas();
    }

    /**
     * Ajusta el zoom para mostrar todo el contenido
     */
    fitToCanvas() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.setZoom(1);
    }

    /**
     * Muestra una notificación
     */
    showNotification(message, type = 'info') {
        // Crear contenedor si no existe
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Event listener para cerrar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Añadir al contenedor
        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Métodos para acciones de la toolbar
     */
    newProject() {
        if (confirm('¿Crear nuevo proyecto? Se perderán los cambios no guardados.')) {
            this.devices.clear();
            this.connections = [];
            this.clearCanvas();
            this.showNotification('Nuevo proyecto creado', 'success');
        }
    }

    saveProject() {
        const project = {
            name: window.NetworkDiagram.currentProject.name,
            devices: Array.from(this.devices.values()),
            connections: this.connections,
            settings: {
                zoom: this.zoom,
                panX: this.panX,
                panY: this.panY
            }
        };

        const dataStr = JSON.stringify(project, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = project.name + '.json';
        link.click();
        
        this.showNotification('Proyecto guardado', 'success');
    }

    loadProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const project = JSON.parse(e.target.result);
                        this.loadProjectData(project);
                        this.showNotification('Proyecto cargado correctamente', 'success');
                    } catch (error) {
                        this.showNotification('Error cargando proyecto: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadProjectData(project) {
        // Limpiar proyecto actual
        this.devices.clear();
        this.connections = [];

        // Cargar dispositivos
        if (project.devices) {
            project.devices.forEach(deviceData => {
                this.devices.set(deviceData.id, deviceData);
            });
        }

        // Cargar conexiones
        if (project.connections) {
            this.connections = project.connections;
        }

        // Aplicar configuraciones
        if (project.settings) {
            this.zoom = project.settings.zoom || 1;
            this.panX = project.settings.panX || 0;
            this.panY = project.settings.panY || 0;
        }

        // Actualizar nombre del proyecto
        if (project.name) {
            window.NetworkDiagram.currentProject.name = project.name;
        }

        // Redibujar
        this.redrawCanvas();
    }

    exportProject() {
        // Crear un canvas temporal para exportación
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // Calcular bounds de todos los dispositivos
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        for (const device of this.devices.values()) {
            minX = Math.min(minX, device.x);
            minY = Math.min(minY, device.y);
            maxX = Math.max(maxX, device.x + device.width);
            maxY = Math.max(maxY, device.y + device.height);
        }

        // Añadir padding
        const padding = 50;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        // Configurar canvas de exportación
        exportCanvas.width = maxX - minX;
        exportCanvas.height = maxY - minY;

        // Fondo blanco
        exportCtx.fillStyle = 'white';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Dibujar grid
        this.drawGridOnContext(exportCtx, exportCanvas.width, exportCanvas.height, minX, minY);

        // Dibujar conexiones
        this.connections.forEach(connection => {
            this.drawConnectionOnContext(exportCtx, connection, minX, minY);
        });

        // Dibujar dispositivos
        for (const device of this.devices.values()) {
            this.renderDeviceOnContext(exportCtx, device, minX, minY);
        }

        // Crear enlace de descarga
        exportCanvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = (window.NetworkDiagram.currentProject.name || 'diagrama') + '.png';
            link.click();
            URL.revokeObjectURL(url);
        });

        this.showNotification('Diagrama exportado como imagen', 'success');
    }

    drawGridOnContext(ctx, width, height, offsetX, offsetY) {
        const gridSize = 20;
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    renderDeviceOnContext(ctx, device, offsetX, offsetY) {
        const x = device.x - offsetX;
        const y = device.y - offsetY;

        // Fondo del dispositivo
        ctx.fillStyle = device.config.color;
        ctx.fillRect(x, y, device.width, device.height);

        // Borde
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, device.width, device.height);

        // Icono
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(device.config.icon, x + device.width/2, y + 25);

        // Nombre
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.fillText(device.name, x + device.width/2, y + device.height - 5);

        // Estado
        const statusColor = device.properties.status === 'active' ? '#28a745' : '#dc3545';
        ctx.fillStyle = statusColor;
        ctx.beginPath();
        ctx.arc(x + device.width - 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawConnectionOnContext(ctx, connection, offsetX, offsetY) {
        const device1 = this.devices.get(connection.device1);
        const device2 = this.devices.get(connection.device2);
        
        if (!device1 || !device2) return;

        const connectionConfig = this.config.connectionTypes[connection.type];
        
        ctx.strokeStyle = connectionConfig.color;
        ctx.lineWidth = connectionConfig.width;
        
        if (connectionConfig.style === 'dotted') {
            ctx.setLineDash([5, 5]);
        } else if (connectionConfig.style === 'dashed') {
            ctx.setLineDash([10, 5]);
        } else {
            ctx.setLineDash([]);
        }

        const x1 = device1.x + device1.width/2 - offsetX;
        const y1 = device1.y + device1.height/2 - offsetY;
        const x2 = device2.x + device2.width/2 - offsetX;
        const y2 = device2.y + device2.height/2 - offsetY;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }

    autoOrganize() {
        if (this.managers.layerManager && this.managers.layerManager.autoOrganizeByLayers) {
            this.managers.layerManager.autoOrganizeByLayers();
            this.showNotification('Dispositivos organizados por capas', 'success');
        } else {
            // Organización básica
            let y = 100;
            let x = 100;
            const spacing = 120;
            let devicesInRow = 0;
            const maxDevicesPerRow = 6;

            for (const device of this.devices.values()) {
                device.x = x;
                device.y = y;
                
                x += spacing;
                devicesInRow++;
                
                if (devicesInRow >= maxDevicesPerRow) {
                    x = 100;
                    y += spacing;
                    devicesInRow = 0;
                }
            }
            
            this.redrawCanvas();
            this.showNotification('Dispositivos organizados automáticamente', 'success');
        }
    }

    validateTopology() {
        const issues = [];
        
        // Validar dispositivos sin conexiones
        for (const device of this.devices.values()) {
            const hasConnections = this.connections.some(conn => 
                conn.device1 === device.id || conn.device2 === device.id
            );
            
            if (!hasConnections) {
                issues.push({
                    type: 'isolated_device',
                    message: `Dispositivo ${device.name} no tiene conexiones`,
                    severity: 'warning'
                });
            }
        }

        // Validar conexiones duplicadas
        const connectionPairs = new Set();
        this.connections.forEach(conn => {
            const pair = [conn.device1, conn.device2].sort().join('-');
            if (connectionPairs.has(pair)) {
                issues.push({
                    type: 'duplicate_connection',
                    message: 'Conexión duplicada detectada',
                    severity: 'warning'
                });
            }
            connectionPairs.add(pair);
        });

        // Mostrar resultados
        if (issues.length === 0) {
            this.showNotification('Topología validada correctamente', 'success');
        } else {
            const warningCount = issues.filter(i => i.severity === 'warning').length;
            const errorCount = issues.filter(i => i.severity === 'error').length;
            
            let message = `Validación completada: ${warningCount} advertencias, ${errorCount} errores`;
            this.showNotification(message, errorCount > 0 ? 'error' : 'warning');
            
            // Log detallado en consola
            console.log('Problemas de topología encontrados:', issues);
        }
    }

    selectDevice(device) {
        this.selectedDevice = device;
        this.redrawCanvas();
        
        // Mostrar propiedades básicas
        console.log('Dispositivo seleccionado:', device);
    }

    selectDeviceType(type) {
        console.log('Tipo de dispositivo seleccionado:', type);
        // Aquí se podría implementar la lógica para el modo de colocación
    }

    setTool(tool) {
        this.currentTool = tool;
        
        // Actualizar UI de herramientas
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Configurar cursor
        switch(tool) {
            case 'connect':
                this.canvas.style.cursor = 'crosshair';
                this.connectionMode = true;
                break;
            case 'pan':
                this.canvas.style.cursor = 'move';
                this.connectionMode = false;
                break;
            default:
                this.canvas.style.cursor = 'default';
                this.connectionMode = false;
        }
    }

    handleConnectionMode(device) {
        if (!this.selectedDevice) {
            this.selectedDevice = device;
            this.showNotification('Selecciona el segundo dispositivo para conectar', 'info');
        } else if (this.selectedDevice.id !== device.id) {
            // Crear conexión
            try {
                this.managers.connectionManager.createConnection(
                    this.selectedDevice.id, 
                    device.id, 
                    'ethernet'
                );
                this.showNotification(
                    `Conexión creada entre ${this.selectedDevice.name} y ${device.name}`, 
                    'success'
                );
                this.selectedDevice = null;
                this.connectionMode = false;
                this.setTool('select');
            } catch (error) {
                this.showNotification('Error creando conexión: ' + error.message, 'error');
            }
        }
    }

    /**
     * Método de utilidad para debugging
     */
    getDebugInfo() {
        return {
            initialized: this.isInitialized,
            devices: this.devices.size,
            connections: this.connections.length,
            zoom: this.zoom,
            selectedDevice: this.selectedDevice?.id,
            connectionMode: this.connectionMode,
            currentTool: this.currentTool
        };
    }
}

// Función de inicialización global
window.initializeNetworkDiagram = function() {
    // Verificar si ya está inicializado
    if (window.NetworkDiagram.initialized) {
        console.log('📋 Aplicación ya inicializada');
        return;
    }

    // Crear y inicializar la aplicación
    window.networkDiagramApp = new NetworkDiagramApp();
    window.networkDiagramApp.init().catch(error => {
        console.error('Error crítico en la inicialización:', error);
        alert('Error al cargar la aplicación. Revisa la consola para más detalles.');
    });
};

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM cargado, inicializando Network Diagram Creator...');
    
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        window.initializeNetworkDiagram();
    }, 100);
});

// Inicialización inmediata si el DOM ya está listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🎯 DOM ya está listo, inicializando inmediatamente...');
    setTimeout(() => {
        window.initializeNetworkDiagram();
    }, 100);
}

// Exportar para uso global
window.NetworkDiagramApp = NetworkDiagramApp;