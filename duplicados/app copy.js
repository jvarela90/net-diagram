/**
 * Network Diagram Creator Pro - Main Application
 * Archivo principal de la aplicación
 */

class NetworkDiagramApp {
    constructor() {
        this.version = '2.0';
        this.initialized = false;
        this.modules = {};
        
        // Estado global de la aplicación
        this.state = {
            devices: [],
            connections: [],
            selectedDevice: null,
            connectionMode: false,
            currentLayer: 'core',
            currentZoom: 1,
            layerVisibility: {
                isp: true, wan: true, core: true, distribution: true,
                access: true, dmz: true, user: true, iot: true
            },
            counters: {
                device: 0,
                connection: 0
            }
        };

        // Configuración
        this.config = {
            autoSave: true,
            autoSaveInterval: 30000, // 30 segundos
            maxZoom: 3,
            minZoom: 0.25,
            canvasSize: { width: 3000, height: 2000 }
        };
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        if (this.initialized) return;

        try {
            console.log(`🚀 Iniciando Network Diagram Creator Pro v${this.version}`);
            
            // Inicializar módulos en orden específico
            await this.initializeModules();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Inicializar UI
            this.initializeUI();
            
            // Configurar auto-guardado
            if (this.config.autoSave) {
                this.setupAutoSave();
            }
            
            this.initialized = true;
            
            // Notificar inicialización completada
            Notifications.show('¡Network Diagram Creator Pro iniciado correctamente!', 'success');
            this.setStatus('Sistema listo - Selecciona dispositivos para comenzar');
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            Notifications.show('Error al inicializar la aplicación', 'error');
        }
    }

    /**
     * Inicializa todos los módulos de la aplicación
     */
    async initializeModules() {
        // Orden de inicialización importante
        const modules = [
            'Helpers',
            'Validators', 
            'Notifications',
            'CanvasManager',
            'LayerManager',
            'InterfaceManager',        // Nuevo módulo
            'DeviceManager',
            'ConnectionManager',
            'SmartConnectionManager', // Nuevo módulo
            'CableLabelGenerator',    // Nuevo módulo
            'Modal',
            'Sidebar',
            'Toolbar',
            'FileManager',
            'NetworkTemplates',
            'Monitoring'
        ];

        for (const moduleName of modules) {
            try {
                if (window[moduleName] && typeof window[moduleName].init === 'function') {
                    await window[moduleName].init(this);
                    this.modules[moduleName] = window[moduleName];
                    console.log(`✓ Módulo ${moduleName} inicializado`);
                }
            } catch (error) {
                console.error(`❌ Error inicializando módulo ${moduleName}:`, error);
            }
        }
    }

    /**
     * Configura eventos globales de la aplicación
     */
    setupGlobalEvents() {
        // Eventos de teclado
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // Eventos de ventana
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Eventos de visibilidad (para pausar operaciones cuando la página no está visible)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Prevenir menú contextual por defecto en el canvas
        document.getElementById('canvas-container').addEventListener('contextmenu', e => e.preventDefault());
    }

    /**
     * Carga datos iniciales necesarios para la aplicación
     */
    async loadInitialData() {
        try {
            // Intentar cargar auto-guardado si existe
            const autoSaveData = this.loadAutoSave();
            if (autoSaveData) {
                await this.loadDiagramData(autoSaveData);
                Notifications.show('Sesión anterior restaurada', 'info');
            }
            
            // Cargar configuraciones por defecto si no hay datos
            if (this.state.devices.length === 0) {
                // Cargar plantilla de ejemplo si está habilitada
                // await NetworkTemplates.load('basic-enterprise');
            }
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    /**
     * Inicializa la interfaz de usuario
     */
    initializeUI() {
        // Inicializar componentes UI
        Sidebar.render();
        Toolbar.render();
        Modal.init();
        
        // Configurar estado inicial
        LayerManager.setCurrentLayer(this.state.currentLayer);
        CanvasManager.setZoom(this.state.currentZoom);
        
        // Actualizar estadísticas
        this.updateStats();
    }

    /**
     * Configura el sistema de auto-guardado
     */
    setupAutoSave() {
        setInterval(() => {
            if (this.state.devices.length > 0 || this.state.connections.length > 0) {
                this.autoSave();
            }
        }, this.config.autoSaveInterval);
    }

    /**
     * Maneja atajos de teclado globales
     */
    handleKeyboard(e) {
        // Solo procesar si no estamos en un input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    this.newDiagram();
                    break;
                case 's':
                    e.preventDefault();
                    FileManager.saveDiagram();
                    break;
                case 'o':
                    e.preventDefault();
                    document.getElementById('file-input').click();
                    break;
                case '=':
                case '+':
                    e.preventDefault();
                    CanvasManager.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    CanvasManager.zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    CanvasManager.resetZoom();
                    break;
            }
        } else {
            switch(e.key) {
                case 'Escape':
                    this.handleEscape();
                    break;
                case 'Delete':
                    if (this.state.selectedDevice) {
                        DeviceManager.deleteSelected();
                    }
                    break;
                case 'c':
                    ConnectionManager.toggleMode();
                    break;
            }
        }
    }

    /**
     * Maneja la tecla Escape
     */
    handleEscape() {
        if (this.state.connectionMode) {
            ConnectionManager.toggleMode();
        }
        DeviceManager.clearSelection();
        Modal.closeAll();
    }

    /**
     * Maneja el evento antes de cerrar la ventana
     */
    handleBeforeUnload(e) {
        if (this.hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = '¿Estás seguro de que quieres salir? Hay cambios sin guardar.';
            return e.returnValue;
        }
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    handleResize() {
        // Reajustar canvas si es necesario
        CanvasManager.handleResize();
    }

    /**
     * Maneja cambios de visibilidad de la página
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pausar animaciones y polling cuando la página no está visible
            Monitoring.pause();
        } else {
            // Reanudar cuando vuelve a estar visible
            Monitoring.resume();
        }
    }

    /**
     * Crea un nuevo diagrama
     */
    async newDiagram() {
        if (this.hasUnsavedChanges()) {
            const confirmed = await this.confirmAction('¿Crear nuevo diagrama? Se perderán los cambios no guardados.');
            if (!confirmed) return;
        }

        this.clearDiagram();
        Notifications.show('Nuevo diagrama creado', 'info');
        this.setStatus('Nuevo diagrama - Listo para comenzar');
    }

    /**
     * Limpia el diagrama actual
     */
    clearDiagram() {
        // Limpiar dispositivos
        this.state.devices.forEach(device => {
            const element = document.getElementById(device.id);
            if (element) element.remove();
        });

        // Limpiar conexiones
        this.state.connections.forEach(connection => {
            const element = document.getElementById(connection.id);
            const label = document.getElementById(`label_${connection.id}`);
            if (element) element.remove();
            if (label) label.remove();
        });

        // Resetear estado
        this.state.devices = [];
        this.state.connections = [];
        this.state.selectedDevice = null;
        this.state.connectionMode = false;
        this.state.counters = { device: 0, connection: 0 };

        // Actualizar UI
        this.updateStats();
        DeviceManager.clearSelection();
        ConnectionManager.reset();
    }

    /**
     * Carga datos de diagrama
     */
    async loadDiagramData(data) {
        try {
            this.clearDiagram();

            if (data.settings) {
                this.state.currentLayer = data.settings.currentLayer || 'core';
                this.state.layerVisibility = data.settings.layerVisibility || this.state.layerVisibility;
                this.state.currentZoom = data.settings.zoom || 1;
            }

            if (data.devices) {
                this.state.devices = data.devices;
                this.state.counters.device = Math.max(...data.devices.map(d => parseInt(d.id.split('_')[1]))) || 0;
                
                // Renderizar dispositivos
                data.devices.forEach(device => {
                    DeviceManager.render(device);
                });
            }

            if (data.connections) {
                this.state.connections = data.connections;
                this.state.counters.connection = Math.max(...data.connections.map(c => parseInt(c.id.split('_')[1]))) || 0;
                
                // Renderizar conexiones
                data.connections.forEach(connection => {
                    ConnectionManager.render(connection);
                });
            }

            // Actualizar UI
            LayerManager.setCurrentLayer(this.state.currentLayer);
            CanvasManager.setZoom(this.state.currentZoom);
            this.updateStats();

        } catch (error) {
            console.error('Error cargando datos del diagrama:', error);
            throw error;
        }
    }

    /**
     * Actualiza las estadísticas mostradas en la UI
     */
    updateStats() {
        document.getElementById('device-count').textContent = this.state.devices.length;
        document.getElementById('connection-count').textContent = this.state.connections.length;
        
        // Actualizar monitoreo si está activo
        if (Monitoring.isEnabled()) {
            Monitoring.updateStats();
        }
    }

    /**
     * Establece el texto de estado
     */
    setStatus(message) {
        document.getElementById('status-text').textContent = message;
    }

    /**
     * Auto-guardado
     */
    autoSave() {
        try {
            const saveData = {
                timestamp: new Date().toISOString(),
                devices: this.state.devices,
                connections: this.state.connections,
                settings: {
                    currentLayer: this.state.currentLayer,
                    layerVisibility: this.state.layerVisibility,
                    zoom: this.state.currentZoom
                }
            };
            localStorage.setItem('networkDiagramAutoSave', JSON.stringify(saveData));
        } catch (e) {
            console.warn('Auto-guardado no disponible:', e);
        }
    }

    /**
     * Carga auto-guardado
     */
    loadAutoSave() {
        try {
            const saved = localStorage.getItem('networkDiagramAutoSave');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Error cargando auto-guardado:', e);
            return null;
        }
    }

    /**
     * Verifica si hay cambios sin guardar
     */
    hasUnsavedChanges() {
        // Implementar lógica para detectar cambios
        return this.state.devices.length > 0 || this.state.connections.length > 0;
    }

    /**
     * Muestra un diálogo de confirmación
     */
    async confirmAction(message) {
        return new Promise(resolve => {
            resolve(confirm(message));
        });
    }

    /**
     * Obtiene el estado actual de la aplicación
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Actualiza el estado de la aplicación
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateStats();
    }

    /**
     * Obtiene un dispositivo por ID
     */
    getDevice(id) {
        return this.state.devices.find(d => d.id === id);
    }

    /**
     * Obtiene una conexión por ID
     */
    getConnection(id) {
        return this.state.connections.find(c => c.id === id);
    }

    /**
     * Añade un dispositivo al estado
     */
    addDevice(device) {
        this.state.devices.push(device);
        this.updateStats();
        
        if (this.config.autoSave) {
            setTimeout(() => this.autoSave(), 1000);
        }
    }

    /**
     * Elimina un dispositivo del estado
     */
    removeDevice(deviceId) {
        this.state.devices = this.state.devices.filter(d => d.id !== deviceId);
        
        // Eliminar conexiones relacionadas
        this.state.connections = this.state.connections.filter(c => 
            c.device1 !== deviceId && c.device2 !== deviceId
        );
        
        this.updateStats();
    }

    /**
     * Añade una conexión al estado
     */
    addConnection(connection) {
        this.state.connections.push(connection);
        this.updateStats();
        
        if (this.config.autoSave) {
            setTimeout(() => this.autoSave(), 500);
        }
    }

    /**
     * Elimina una conexión del estado
     */
    removeConnection(connectionId) {
        this.state.connections = this.state.connections.filter(c => c.id !== connectionId);
        this.updateStats();
    }

    /**
     * Genera el siguiente ID para dispositivos
     */
    getNextDeviceId() {
        return `device_${++this.state.counters.device}`;
    }

    /**
     * Genera el siguiente ID para conexiones
     */
    getNextConnectionId() {
        return `connection_${++this.state.counters.connection}`;
    }
}

// Instancia global de la aplicación
const App = new NetworkDiagramApp();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exportar para uso global
window.App = App;