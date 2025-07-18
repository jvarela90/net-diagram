/**
 * Layer Manager - Gestión del sistema de capas de red
 */

const LayerManager = {
    app: null,
    layers: [
        { id: 'isp', name: 'ISP Layer', icon: '🌍', description: 'Proveedor de servicios de Internet', color: '#8e44ad' },
        { id: 'wan', name: 'WAN Layer', icon: '🌐', description: 'Red de área amplia', color: '#e74c3c' },
        { id: 'core', name: 'Core Layer', icon: '⚡', description: 'Núcleo de la red', color: '#3498db' },
        { id: 'distribution', name: 'Distribution Layer', icon: '📊', description: 'Capa de distribución', color: '#2ecc71' },
        { id: 'access', name: 'Access Layer', icon: '🔌', description: 'Capa de acceso', color: '#f39c12' },
        { id: 'dmz', name: 'DMZ Layer', icon: '🛡️', description: 'Zona desmilitarizada', color: '#e67e22' },
        { id: 'user', name: 'User Layer', icon: '👥', description: 'Dispositivos de usuario', color: '#9b59b6' },
        { id: 'iot', name: 'IoT Layer', icon: '🌐', description: 'Internet de las cosas', color: '#1abc9c' }
    ],

    /**
     * Inicializa el gestor de capas
     */
    init(app) {
        this.app = app;
        this.setupLayerBackgrounds();
        console.log('✓ LayerManager inicializado');
    },

    /**
     * Configura los fondos de las capas
     */
    setupLayerBackgrounds() {
        const style = document.createElement('style');
        style.textContent = this.layers.map(layer => `
            .layer-${layer.id} {
                background-color: ${this.hexToRgba(layer.color, 0.1)};
            }
        `).join('\n');
        document.head.appendChild(style);
    },

    /**
     * Convierte hex a rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Establece la capa actual
     */
    setCurrentLayer(layerId) {
        if (!this.isValidLayer(layerId)) {
            console.warn(`Capa inválida: ${layerId}`);
            return;
        }

        this.app.setState({ currentLayer: layerId });
        this.updateLayerIndicator(layerId);
        this.updateLayerSelector(layerId);
        
        const layer = this.getLayer(layerId);
        this.app.setStatus(`Capa actual: ${layer.name}`);
        
        // Notificar cambio de capa
        this.dispatchLayerChange(layerId);
    },

    /**
     * Obtiene información de una capa
     */
    getLayer(layerId) {
        return this.layers.find(layer => layer.id === layerId);
    },

    /**
     * Verifica si una capa es válida
     */
    isValidLayer(layerId) {
        return this.layers.some(layer => layer.id === layerId);
    },

    /**
     * Alterna la visibilidad de una capa
     */
    toggleVisibility(layerId, visible) {
        if (!this.isValidLayer(layerId)) return;

        this.app.state.layerVisibility[layerId] = visible;
        
        // Actualizar visibilidad de dispositivos
        this.updateDeviceVisibility(layerId, visible);
        
        // Actualizar visibilidad de conexiones
        ConnectionManager.updateVisibility();
        
        const layer = this.getLayer(layerId);
        const status = visible ? 'visible' : 'oculta';
        Notifications.info(`Capa ${layer.name} ${status}`);
    },

    /**
     * Actualiza la visibilidad de dispositivos en una capa
     */
    updateDeviceVisibility(layerId, visible) {
        this.app.state.devices.forEach(device => {
            if (device.layer === layerId) {
                const element = document.getElementById(device.id);
                if (element) {
                    element.style.display = visible ? 'block' : 'none';
                }
            }
        });
    },

    /**
     * Actualiza el indicador de capa actual
     */
    updateLayerIndicator(layerId) {
        const indicator = document.getElementById('layer-indicator');
        if (indicator) {
            const layer = this.getLayer(layerId);
            indicator.textContent = `${layer.icon} ${layer.name}`;
        }
    },

    /**
     * Actualiza el selector de capa
     */
    updateLayerSelector(layerId) {
        const selector = document.getElementById('current-layer');
        if (selector) {
            selector.value = layerId;
        }
    },

    /**
     * Obtiene estadísticas por capa
     */
    getLayerStats() {
        const stats = {};
        
        this.layers.forEach(layer => {
            const deviceCount = this.app.state.devices.filter(d => d.layer === layer.id).length;
            const connectionCount = this.getLayerConnections(layer.id).length;
            
            stats[layer.id] = {
                name: layer.name,
                devices: deviceCount,
                connections: connectionCount,
                visible: this.app.state.layerVisibility[layer.id]
            };
        });
        
        return stats;
    },

    /**
     * Obtiene conexiones que involucran una capa específica
     */
    getLayerConnections(layerId) {
        return this.app.state.connections.filter(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            return (device1 && device1.layer === layerId) || 
                   (device2 && device2.layer === layerId);
        });
    },

    /**
     * Mueve un dispositivo a otra capa
     */
    moveDeviceToLayer(deviceId, targetLayerId) {
        if (!this.isValidLayer(targetLayerId)) return false;

        const device = this.app.getDevice(deviceId);
        if (!device) return false;

        const oldLayer = device.layer;
        device.layer = targetLayerId;

        // Actualizar visualización
        DeviceManager.updateRender(device);

        // Actualizar visibilidad si la nueva capa está oculta
        if (!this.app.state.layerVisibility[targetLayerId]) {
            const element = document.getElementById(deviceId);
            if (element) element.style.display = 'none';
        }

        const targetLayer = this.getLayer(targetLayerId);
        Notifications.success(`${device.name} movido a ${targetLayer.name}`);
        
        return true;
    },

    /**
     * Organiza dispositivos por capas automáticamente
     */
    autoOrganizeByLayers() {
        const layerPositions = this.getLayerPositions();
        const layerGroups = this.groupDevicesByLayer();

        Object.keys(layerGroups).forEach(layerId => {
            const devices = layerGroups[layerId];
            const position = layerPositions[layerId];
            
            if (devices.length > 0 && position) {
                this.arrangeDevicesInLayer(devices, position);
            }
        });

        ConnectionManager.updateAll();
        Notifications.success('Dispositivos organizados por capas');
    },

    /**
     * Obtiene las posiciones Y de cada capa
     */
    getLayerPositions() {
        return {
            'isp': { y: 50, spacing: 200 },
            'wan': { y: 200, spacing: 200 },
            'core': { y: 350, spacing: 200 },
            'distribution': { y: 500, spacing: 200 },
            'access': { y: 650, spacing: 200 },
            'dmz': { y: 800, spacing: 200 },
            'user': { y: 950, spacing: 200 },
            'iot': { y: 1100, spacing: 200 }
        };
    },

    /**
     * Agrupa dispositivos por capa
     */
    groupDevicesByLayer() {
        const groups = {};
        
        this.app.state.devices.forEach(device => {
            if (!groups[device.layer]) {
                groups[device.layer] = [];
            }
            groups[device.layer].push(device);
        });
        
        return groups;
    },

    /**
     * Organiza dispositivos dentro de una capa
     */
    arrangeDevicesInLayer(devices, position) {
        const spacing = Math.min(position.spacing, 2400 / Math.max(devices.length, 1));
        const startX = (2400 - (devices.length - 1) * spacing) / 2;

        devices.forEach((device, index) => {
            device.x = Math.max(50, startX + index * spacing);
            device.y = position.y;
            
            const deviceElement = document.getElementById(device.id);
            if (deviceElement) {
                deviceElement.style.left = device.x + 'px';
                deviceElement.style.top = device.y + 'px';
            }
        });
    },

    /**
     * Valida la jerarquía de capas
     */
    validateLayerHierarchy() {
        const issues = [];
        const stats = this.getLayerStats();

        // Verificar que las capas críticas tengan dispositivos
        const criticalLayers = ['core', 'distribution', 'access'];
        criticalLayers.forEach(layerId => {
            if (stats[layerId].devices === 0 && this.app.state.devices.length > 5) {
                const layer = this.getLayer(layerId);
                issues.push(`Capa ${layer.name} está vacía en una red compleja`);
            }
        });

        // Verificar redundancia en core
        if (stats.core.devices === 1) {
            issues.push('Capa Core tiene un solo dispositivo (falta redundancia)');
        }

        // Verificar conexiones entre capas
        const interLayerConnections = this.getInterLayerConnections();
        if (interLayerConnections.length === 0 && this.app.state.devices.length > 2) {
            issues.push('No hay conexiones entre diferentes capas');
        }

        return issues;
    },

    /**
     * Obtiene conexiones entre diferentes capas
     */
    getInterLayerConnections() {
        return this.app.state.connections.filter(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            return device1 && device2 && device1.layer !== device2.layer;
        });
    },

    /**
     * Muestra/oculta todas las capas
     */
    toggleAllLayers(visible) {
        this.layers.forEach(layer => {
            this.toggleVisibility(layer.id, visible);
        });
        
        const action = visible ? 'mostradas' : 'ocultadas';
        Notifications.info(`Todas las capas ${action}`);
    },

    /**
     * Muestra solo una capa específica
     */
    showOnlyLayer(layerId) {
        this.layers.forEach(layer => {
            this.toggleVisibility(layer.id, layer.id === layerId);
        });
        
        const layer = this.getLayer(layerId);
        Notifications.info(`Mostrando solo la capa ${layer.name}`);
    },

    /**
     * Obtiene dispositivos de una capa específica
     */
    getDevicesInLayer(layerId) {
        return this.app.state.devices.filter(device => device.layer === layerId);
    },

    /**
     * Calcula métricas de una capa
     */
    getLayerMetrics(layerId) {
        const devices = this.getDevicesInLayer(layerId);
        const connections = this.getLayerConnections(layerId);
        
        const deviceTypes = {};
        devices.forEach(device => {
            deviceTypes[device.type] = (deviceTypes[device.type] || 0) + 1;
        });

        const statusCounts = {
            up: devices.filter(d => d.status === 'up').length,
            down: devices.filter(d => d.status === 'down').length,
            warning: devices.filter(d => d.status === 'warning').length
        };

        return {
            deviceCount: devices.length,
            connectionCount: connections.length,
            deviceTypes,
            statusCounts,
            coverage: this.calculateLayerCoverage(layerId)
        };
    },

    /**
     * Calcula la cobertura de una capa
     */
    calculateLayerCoverage(layerId) {
        const devices = this.getDevicesInLayer(layerId);
        if (devices.length === 0) return 0;

        // Calcular área ocupada por dispositivos
        let minX = Infinity, minY = Infinity;