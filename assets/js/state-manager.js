/**
 * StateManager - Gestión centralizada del estado de la aplicación
 * Implementa un patrón de estado reactivo para coordinar todos los módulos
 */

class StateManager {
    constructor() {
        this.state = {
            // Estado de inicialización
            initialized: false,
            loading: false,
            loadingProgress: 0,
            error: null,
            
            // Estado de la aplicación
            currentLayer: 'core',
            selectedDevices: [],
            selectedConnections: [],
            
            // Estado del canvas
            canvas: {
                zoom: 1,
                panX: 0,
                panY: 0,
                width: 800,
                height: 600,
                gridVisible: true,
                snapToGrid: true
            },
            
            // Estado de datos
            devices: new Map(),
            connections: new Map(),
            layers: new Map(),
            
            // Estado de la interfaz
            ui: {
                sidebarCollapsed: false,
                toolbarVisible: true,
                propertiesPanelVisible: false,
                activeToolbarTool: 'select',
                theme: 'light'
            },
            
            // Estado del proyecto
            project: {
                name: 'Nuevo Proyecto',
                lastSaved: null,
                hasUnsavedChanges: false,
                autoSave: true
            },
            
            // Configuración
            config: {
                autoSave: true,
                autoSaveInterval: 30000,
                maxZoom: 3,
                minZoom: 0.25,
                gridSize: 20,
                snapTolerance: 10
            },
            
            // Métricas de rendimiento
            performance: {
                fps: 60,
                deviceCount: 0,
                connectionCount: 0,
                renderTime: 0,
                memoryUsage: 0
            }
        };
        
        this.listeners = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.initialized = false;
        
        // Configurar persistencia automática
        this.setupAutoPersistence();
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('🔧 Inicializando StateManager...');
        
        try {
            // Cargar estado persistido si existe
            await this.loadPersistedState();
            
            // Configurar observers
            this.setupStateObservers();
            
            // Marcar como inicializado
            this.initialized = true;
            this.setState({ initialized: true });
            
            console.log('✅ StateManager inicializado');
        } catch (error) {
            console.error('❌ Error inicializando StateManager:', error);
            throw error;
        }
    }

    // Métodos principales de estado
    setState(updates) {
        if (typeof updates !== 'object' || updates === null) {
            console.warn('⚠️ setState: updates debe ser un objeto');
            return;
        }

        const prevState = this.deepClone(this.state);
        
        // Aplicar actualizaciones de forma inmutable
        this.state = this.deepMerge(this.state, updates);
        
        // Agregar al historial si es un cambio significativo
        if (this.isSignificantChange(prevState, this.state)) {
            this.addToHistory(prevState);
        }
        
        // Notificar cambios
        this.notifyListeners(prevState, this.state);
        
        // Marcar cambios sin guardar
        if (this.initialized && !updates.project?.hasUnsavedChanges) {
            this.state.project.hasUnsavedChanges = true;
        }
        
        // Log de cambios (solo en desarrollo)
        if (this.isDebugMode()) {
            console.log('🔄 Estado actualizado:', {
                updates,
                newState: this.state
            });
        }
    }

    getState() {
        return this.deepClone(this.state);
    }

    getPartialState(...keys) {
        const partial = {};
        for (const key of keys) {
            if (key in this.state) {
                partial[key] = this.deepClone(this.state[key]);
            }
        }
        return partial;
    }

    // Suscripción a cambios
    subscribe(key, callback, options = {}) {
        if (typeof callback !== 'function') {
            console.warn('⚠️ subscribe: callback debe ser una función');
            return null;
        }

        const id = this.generateId();
        const subscription = {
            id,
            key,
            callback,
            once: options.once || false,
            immediate: options.immediate || false
        };

        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push(subscription);

        // Ejecutar inmediatamente si se solicita
        if (subscription.immediate && key in this.state) {
            callback(this.state[key], undefined);
        }

        // Retornar función de desuscripción
        return () => this.unsubscribe(key, id);
    }

    unsubscribe(key, id) {
        if (!this.listeners.has(key)) return false;
        
        const callbacks = this.listeners.get(key);
        const index = callbacks.findIndex(sub => sub.id === id);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
            if (callbacks.length === 0) {
                this.listeners.delete(key);
            }
            return true;
        }
        
        return false;
    }

    // Métodos específicos para dispositivos
    addDevice(device) {
        if (!device.id) {
            device.id = this.generateId('device');
        }
        
        const devices = new Map(this.state.devices);
        devices.set(device.id, device);
        
        this.setState({
            devices,
            performance: {
                ...this.state.performance,
                deviceCount: devices.size
            }
        });
        
        return device.id;
    }

    updateDevice(deviceId, updates) {
        const devices = new Map(this.state.devices);
        const device = devices.get(deviceId);
        
        if (!device) {
            console.warn(`⚠️ Dispositivo ${deviceId} no encontrado`);
            return false;
        }
        
        devices.set(deviceId, { ...device, ...updates });
        this.setState({ devices });
        return true;
    }

    removeDevice(deviceId) {
        const devices = new Map(this.state.devices);
        const connections = new Map(this.state.connections);
        
        // Eliminar dispositivo
        if (!devices.delete(deviceId)) {
            console.warn(`⚠️ Dispositivo ${deviceId} no encontrado`);
            return false;
        }
        
        // Eliminar conexiones relacionadas
        for (const [connId, conn] of connections) {
            if (conn.sourceId === deviceId || conn.targetId === deviceId) {
                connections.delete(connId);
            }
        }
        
        this.setState({
            devices,
            connections,
            performance: {
                ...this.state.performance,
                deviceCount: devices.size,
                connectionCount: connections.size
            }
        });
        
        return true;
    }

    // Métodos específicos para conexiones
    addConnection(connection) {
        if (!connection.id) {
            connection.id = this.generateId('connection');
        }
        
        const connections = new Map(this.state.connections);
        connections.set(connection.id, connection);
        
        this.setState({
            connections,
            performance: {
                ...this.state.performance,
                connectionCount: connections.size
            }
        });
        
        return connection.id;
    }

    updateConnection(connectionId, updates) {
        const connections = new Map(this.state.connections);
        const connection = connections.get(connectionId);
        
        if (!connection) {
            console.warn(`⚠️ Conexión ${connectionId} no encontrada`);
            return false;
        }
        
        connections.set(connectionId, { ...connection, ...updates });
        this.setState({ connections });
        return true;
    }

    removeConnection(connectionId) {
        const connections = new Map(this.state.connections);
        
        if (!connections.delete(connectionId)) {
            console.warn(`⚠️ Conexión ${connectionId} no encontrada`);
            return false;
        }
        
        this.setState({
            connections,
            performance: {
                ...this.state.performance,
                connectionCount: connections.size
            }
        });
        
        return true;
    }

    // Métodos de selección
    selectDevice(deviceId, multiSelect = false) {
        let selectedDevices;
        
        if (multiSelect) {
            selectedDevices = [...this.state.selectedDevices];
            const index = selectedDevices.indexOf(deviceId);
            if (index === -1) {
                selectedDevices.push(deviceId);
            } else {
                selectedDevices.splice(index, 1);
            }
        } else {
            selectedDevices = [deviceId];
        }
        
        this.setState({ selectedDevices });
    }

    clearSelection() {
        this.setState({
            selectedDevices: [],
            selectedConnections: []
        });
    }

    // Historial y deshacer/rehacer
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const previousState = this.history[this.historyIndex];
            this.state = this.deepClone(previousState);
            this.notifyListeners(this.state, previousState);
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextState = this.history[this.historyIndex];
            this.state = this.deepClone(nextState);
            this.notifyListeners(this.state, nextState);
            return true;
        }
        return false;
    }

    addToHistory(state) {
        // Eliminar entradas futuras si estamos en el medio del historial
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Agregar nuevo estado
        this.history.push(this.deepClone(state));
        this.historyIndex++;
        
        // Mantener tamaño máximo del historial
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    // Persistencia
    async saveState() {
        try {
            const stateToSave = {
                ...this.state,
                _timestamp: Date.now(),
                _version: '1.0'
            };
            
            localStorage.setItem('network-diagram-state', JSON.stringify(stateToSave));
            
            this.setState({
                project: {
                    ...this.state.project,
                    lastSaved: new Date().toISOString(),
                    hasUnsavedChanges: false
                }
            });
            
            console.log('💾 Estado guardado');
            return true;
        } catch (error) {
            console.error('❌ Error guardando estado:', error);
            return false;
        }
    }

    async loadPersistedState() {
        try {
            const savedState = localStorage.getItem('network-diagram-state');
            if (!savedState) return;
            
            const parsedState = JSON.parse(savedState);
            
            // Validar versión
            if (parsedState._version !== '1.0') {
                console.warn('⚠️ Versión de estado incompatible, usando estado por defecto');
                return;
            }
            
            // Restaurar Maps
            if (parsedState.devices && Array.isArray(parsedState.devices)) {
                parsedState.devices = new Map(parsedState.devices);
            }
            if (parsedState.connections && Array.isArray(parsedState.connections)) {
                parsedState.connections = new Map(parsedState.connections);
            }
            if (parsedState.layers && Array.isArray(parsedState.layers)) {
                parsedState.layers = new Map(parsedState.layers);
            }
            
            // Merge con estado por defecto
            this.state = this.deepMerge(this.state, parsedState);
            
            console.log('📂 Estado cargado desde localStorage');
        } catch (error) {
            console.warn('⚠️ Error cargando estado guardado:', error);
        }
    }

    setupAutoPersistence() {
        // Auto-guardar cuando hay cambios significativos
        setInterval(() => {
            if (this.state.project.hasUnsavedChanges && this.state.config.autoSave) {
                this.saveState();
            }
        }, this.state.config.autoSaveInterval);
    }

    setupStateObservers() {
        // Observer para cambios de rendimiento
        this.subscribe('performance', (perf) => {
            if (perf.fps < 30) {
                console.warn(`⚠️ FPS bajo detectado: ${perf.fps}`);
            }
        });

        // Observer para límites de dispositivos
        this.subscribe('devices', (devices) => {
            if (devices.size > 1000) {
                console.warn('⚠️ Número alto de dispositivos, rendimiento puede verse afectado');
            }
        });
    }

    // Métodos de utilidad
    notifyListeners(prevState, newState) {
        for (const [key, subscriptions] of this.listeners) {
            if (this.hasChanged(prevState, newState, key)) {
                const currentValue = this.getNestedValue(newState, key);
                const previousValue = this.getNestedValue(prevState, key);
                
                // Notificar a todos los suscriptores
                subscriptions.forEach((subscription, index) => {
                    try {
                        subscription.callback(currentValue, previousValue);
                        
                        // Eliminar suscripciones de una sola vez
                        if (subscription.once) {
                            subscriptions.splice(index, 1);
                        }
                    } catch (error) {
                        console.error(`❌ Error en callback de ${key}:`, error);
                    }
                });
                
                // Limpiar array vacío
                if (subscriptions.length === 0) {
                    this.listeners.delete(key);
                }
            }
        }
    }

    hasChanged(prevState, newState, key) {
        const prevValue = this.getNestedValue(prevState, key);
        const newValue = this.getNestedValue(newState, key);
        return !this.deepEqual(prevValue, newValue);
    }

    getNestedValue(obj, path) {
        if (typeof path === 'string') {
            return path.split('.').reduce((current, key) => 
                current && current[key] !== undefined ? current[key] : undefined, obj);
        }
        return obj[path];
    }

    isSignificantChange(prevState, newState) {
        // Ignorar cambios en métricas de rendimiento para el historial
        const ignoredKeys = ['performance', 'loadingProgress', 'error'];
        
        for (const key of Object.keys(newState)) {
            if (!ignoredKeys.includes(key) && this.hasChanged(prevState, newState, key)) {
                return true;
            }
        }
        return false;
    }

    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Map) return new Map(Array.from(obj, ([k, v]) => [k, this.deepClone(v)]));
        if (obj instanceof Set) return new Set(Array.from(obj, v => this.deepClone(v)));
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    deepMerge(target, source) {
        const result = this.deepClone(target);
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] instanceof Map) {
                    result[key] = new Map(source[key]);
                } else if (source[key] instanceof Set) {
                    result[key] = new Set(source[key]);
                } else if (Array.isArray(source[key])) {
                    result[key] = [...source[key]];
                } else if (typeof source[key] === 'object' && source[key] !== null) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    deepEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (typeof a !== typeof b) return false;
        
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) return false;
            for (const [key, value] of a) {
                if (!b.has(key) || !this.deepEqual(value, b.get(key))) return false;
            }
            return true;
        }
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        
        if (typeof a === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            
            for (const key of keysA) {
                if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        
        return false;
    }

    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    isDebugMode() {
        return localStorage.getItem('debug-mode') === 'true' || 
               window.location.search.includes('debug=true');
    }

    // Métodos públicos para estadísticas y debugging
    getStats() {
        return {
            devices: this.state.devices.size,
            connections: this.state.connections.size,
            listeners: Array.from(this.listeners.entries()).map(([key, subs]) => ({
                key,
                count: subs.length
            })),
            historySize: this.history.length,
            historyIndex: this.historyIndex,
            memoryUsage: this.state.performance.memoryUsage
        };
    }

    exportState() {
        return {
            state: this.getState(),
            stats: this.getStats(),
            timestamp: new Date().toISOString()
        };
    }

    reset() {
        const defaultState = new StateManager().state;
        this.state = defaultState;
        this.history = [];
        this.historyIndex = -1;
        this.listeners.clear();
        
        console.log('🔄 Estado reseteado');
    }

    // Métodos específicos para canvas
    updateCanvasTransform(transform) {
        this.setState({
            canvas: {
                ...this.state.canvas,
                ...transform
            }
        });
    }

    setCanvasSize(width, height) {
        this.setState({
            canvas: {
                ...this.state.canvas,
                width,
                height
            }
        });
    }

    // Métodos específicos para capas
    setCurrentLayer(layerId) {
        if (!this.state.layers.has(layerId)) {
            console.warn(`⚠️ Capa ${layerId} no existe`);
            return false;
        }
        
        this.setState({ currentLayer: layerId });
        return true;
    }

    addLayer(layer) {
        const layers = new Map(this.state.layers);
        layers.set(layer.id, layer);
        this.setState({ layers });
    }

    updateLayer(layerId, updates) {
        const layers = new Map(this.state.layers);
        const layer = layers.get(layerId);
        
        if (!layer) {
            console.warn(`⚠️ Capa ${layerId} no encontrada`);
            return false;
        }
        
        layers.set(layerId, { ...layer, ...updates });
        this.setState({ layers });
        return true;
    }

    // Métodos para configuración
    updateConfig(configUpdates) {
        this.setState({
            config: {
                ...this.state.config,
                ...configUpdates
            }
        });
    }

    // Métodos para UI
    updateUI(uiUpdates) {
        this.setState({
            ui: {
                ...this.state.ui,
                ...uiUpdates
            }
        });
    }

    // Métodos para métricas de rendimiento
    updatePerformance(perfUpdates) {
        this.setState({
            performance: {
                ...this.state.performance,
                ...perfUpdates,
                timestamp: Date.now()
            }
        });
    }

    // Método para validar estado
    validateState() {
        const errors = [];
        
        // Validar dispositivos
        for (const [id, device] of this.state.devices) {
            if (!device.type || !device.x || !device.y) {
                errors.push(`Dispositivo ${id} tiene propiedades inválidas`);
            }
        }
        
        // Validar conexiones
        for (const [id, connection] of this.state.connections) {
            if (!this.state.devices.has(connection.sourceId) || 
                !this.state.devices.has(connection.targetId)) {
                errors.push(`Conexión ${id} referencia dispositivos inexistentes`);
            }
        }
        
        return errors;
    }
}

// Crear instancia global
window.StateManager = new StateManager();