/**
 * Device Manager - Gestión de dispositivos
 */

const DeviceManager = {
    app: null,
    draggedDeviceType: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },

    /**
     * Inicializa el gestor de dispositivos
     */
    init(app) {
        this.app = app;
        this.setupEventListeners();
        console.log('✓ DeviceManager inicializado');
    },

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        const workspace = document.getElementById('canvas-container');
        
        // Eventos de drag & drop
        workspace.addEventListener('dragover', this.handleDragOver.bind(this));
        workspace.addEventListener('drop', this.handleDrop.bind(this));
        workspace.addEventListener('click', this.handleWorkspaceClick.bind(this));
        
        // Event listeners para dispositivos se configuran dinámicamente en render()
    },

    /**
     * Crea un nuevo dispositivo
     */
    create(type, x, y, customData = {}) {
        const device = {
            id: this.app.getNextDeviceId(),
            type: type,
            x: Math.max(0, Math.min(x, 2800)),
            y: Math.max(0, Math.min(y, 1800)),
            layer: this.app.state.currentLayer,
            name: this.generateDeviceName(type),
            ...this.getDefaultProperties(type),
            ...customData
        };

        this.app.addDevice(device);
        this.render(device);
        
        this.app.setStatus(`Dispositivo ${device.name} agregado a ${device.layer} layer`);
        Notifications.show(`Dispositivo ${device.name} creado`, 'success');
        
        return device;
    },

    /**
     * Renderiza un dispositivo en el canvas
     */
    render(device) {
        const deviceElement = document.createElement('div');
        deviceElement.className = `device-on-canvas status-${device.status} layer-${device.layer}`;
        deviceElement.id = device.id;
        deviceElement.style.left = device.x + 'px';
        deviceElement.style.top = device.y + 'px';

        // Aplicar visibilidad de capa
        if (!this.app.state.layerVisibility[device.layer]) {
            deviceElement.style.display = 'none';
        }

        const iconClass = `${device.type}-icon`;
        const iconText = this.getDeviceIcon(device.type);

        deviceElement.innerHTML = `
            <div class="device-header">
                <div class="device-icon ${iconClass}">${iconText}</div>
                <div class="device-status-indicator status-${device.status}"></div>
            </div>
            <div class="device-label">${device.name}</div>
            <div class="device-details">
                ${device.ip || 'Sin IP'}<br>
                ${device.layer.toUpperCase()}
            </div>
            <div class="device-metrics">
                CPU: ${device.cpu}% | RAM: ${device.memory}%
            </div>
        `;

        // Configurar event listeners
        this.setupDeviceEventListeners(deviceElement, device);

        document.getElementById('canvas-container').appendChild(deviceElement);
    },

    /**
     * Configura event listeners para un dispositivo específico
     */
    setupDeviceEventListeners(element, device) {
        element.addEventListener('mousedown', (e) => this.handleDeviceMouseDown(e, device));
        element.addEventListener('click', (e) => this.handleDeviceClick(e, device));
        element.addEventListener('contextmenu', (e) => this.handleDeviceRightClick(e, device));
        element.addEventListener('mouseenter', (e) => this.showDeviceTooltip(e, device));
        element.addEventListener('mouseleave', this.hideTooltip);
    },

    /**
     * Actualiza la visualización de un dispositivo
     */
    updateRender(device) {
        const deviceElement = document.getElementById(device.id);
        if (!deviceElement) return;

        deviceElement.className = `device-on-canvas status-${device.status} layer-${device.layer}`;
        
        const iconText = this.getDeviceIcon(device.type);
        deviceElement.innerHTML = `
            <div class="device-header">
                <div class="device-icon ${device.type}-icon">${iconText}</div>
                <div class="device-status-indicator status-${device.status}"></div>
            </div>
            <div class="device-label">${device.name}</div>
            <div class="device-details">
                ${device.ip || 'Sin IP'}<br>
                ${device.layer.toUpperCase()}
            </div>
            <div class="device-metrics">
                CPU: ${device.cpu}% | RAM: ${device.memory}%
            </div>
        `;

        // Reconfigurar event listeners
        this.setupDeviceEventListeners(deviceElement, device);
    },

    /**
     * Elimina un dispositivo
     */
    delete(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return;

        // Eliminar conexiones relacionadas
        const relatedConnections = this.app.state.connections.filter(c => 
            c.device1 === deviceId || c.device2 === deviceId
        );

        relatedConnections.forEach(connection => {
            ConnectionManager.delete(connection.id);
        });

        // Eliminar elemento del DOM
        const deviceElement = document.getElementById(deviceId);
        if (deviceElement) deviceElement.remove();

        // Eliminar del estado
        this.app.removeDevice(deviceId);

        Notifications.show(`Dispositivo ${device.name} eliminado`, 'info');
        this.app.setStatus('Dispositivo eliminado exitosamente');
    },

    /**
     * Elimina el dispositivo seleccionado
     */
    deleteSelected() {
        if (!this.app.state.selectedDevice) return;
        
        const deviceName = this.app.state.selectedDevice.name;
        if (confirm(`¿Estás seguro de que quieres eliminar ${deviceName}?`)) {
            this.delete(this.app.state.selectedDevice.id);
            this.clearSelection();
            Modal.closeProperties();
        }
    },

    /**
     * Selecciona un dispositivo
     */
    select(device) {
        this.clearSelection();
        this.app.setState({ selectedDevice: device });
        document.getElementById(device.id).classList.add('selected');
        this.app.setStatus(`${device.name} seleccionado | Tipo: ${device.type} | Capa: ${device.layer}`);
    },

    /**
     * Limpia la selección actual
     */
    clearSelection() {
        document.querySelectorAll('.device-on-canvas.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.app.setState({ selectedDevice: null });
    },

    /**
     * Maneja el inicio del arrastre de dispositivo
     */
    handleDeviceMouseDown(e, device) {
        if (e.button === 0) {
            this.isDragging = true;
            this.select(device);
            
            const rect = e.currentTarget.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;

            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            
            e.preventDefault();
        }
    },

    /**
     * Maneja el movimiento del mouse durante el arrastre
     */
    handleMouseMove(e) {
        if (this.isDragging && this.app.state.selectedDevice) {
            const workspace = document.getElementById('canvas-container');
            const rect = workspace.getBoundingClientRect();
            
            const newX = (e.clientX - rect.left - this.dragOffset.x) / this.app.state.currentZoom;
            const newY = (e.clientY - rect.top - this.dragOffset.y) / this.app.state.currentZoom;
            
            this.app.state.selectedDevice.x = Math.max(0, Math.min(newX, 2800));
            this.app.state.selectedDevice.y = Math.max(0, Math.min(newY, 1800));
            
            const deviceElement = document.getElementById(this.app.state.selectedDevice.id);
            deviceElement.style.left = this.app.state.selectedDevice.x + 'px';
            deviceElement.style.top = this.app.state.selectedDevice.y + 'px';
            
            ConnectionManager.updateAll();
        }
    },

    /**
     * Maneja el fin del arrastre
     */
    handleMouseUp() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    },

    /**
     * Maneja el click en un dispositivo
     */
    handleDeviceClick(e, device) {
        if (this.app.state.connectionMode) {
            ConnectionManager.handleDeviceClick(device);
        } else {
            this.select(device);
        }
        e.stopPropagation();
    },

    /**
     * Maneja el click derecho en un dispositivo
     */
    handleDeviceRightClick(e, device) {
        e.preventDefault();
        this.select(device);
        Modal.openProperties(device);
    },

    /**
     * Maneja el drag over en el workspace
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    },

    /**
     * Maneja el drop en el workspace
     */
    handleDrop(e) {
        e.preventDefault();
        if (this.draggedDeviceType) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / this.app.state.currentZoom;
            const y = (e.clientY - rect.top) / this.app.state.currentZoom;
            
            this.create(this.draggedDeviceType, x, y);
            this.draggedDeviceType = null;
        }
    },

    /**
     * Maneja el click en el workspace
     */
    handleWorkspaceClick(e) {
        if (!this.app.state.connectionMode) {
            this.clearSelection();
        }
    },

    /**
     * Configura el tipo de dispositivo siendo arrastrado
     */
    setDraggedDeviceType(type) {
        this.draggedDeviceType = type;
    },

    /**
     * Genera un nombre para el dispositivo
     */
    generateDeviceName(type) {
        const prefixes = {
            'core-router': 'CR',
            'edge-router': 'ER', 
            'router': 'R',
            'l3-switch': 'L3SW',
            'switch': 'SW',
            'hub': 'HUB',
            'firewall': 'FW',
            'ips': 'IPS',
            'waf': 'WAF',
            'loadbalancer': 'LB',
            'vpn': 'VPN',
            'modem': 'MDM',
            'ap': 'AP',
            'controller': 'WLC',
            'server': 'SRV',
            'web-server': 'WEB',
            'db-server': 'DB',
            'dns-server': 'DNS',
            'mail-server': 'MAIL',
            'pc': 'PC',
            'notebook': 'LAP',
            'printer': 'PRT',
            'phone': 'IP',
            'nas': 'NAS',
            'san': 'SAN',
            'iot-device': 'IOT',
            'sensor': 'SNS',
            'camera': 'CAM'
        };
        
        const prefix = prefixes[type] || 'DEV';
        const counter = this.app.state.counters.device + 1;
        return `${prefix}-${String(counter).padStart(3, '0')}`;
    },

    /**
     * Obtiene las propiedades por defecto de un dispositivo
     */
    getDefaultProperties(type) {
        return {
            model: '',
            brand: '',
            serial: '',
            ip: '',
            subnet: '',
            gateway: '',
            dns: '',
            mac: '',
            vlan: '',
            location: '',
            description: '',
            notes: '',
            status: 'up',
            cpu: Math.floor(Math.random() * 50) + 10,
            memory: Math.floor(Math.random() * 60) + 20,
            bandwidth: Math.floor(Math.random() * 40) + 10,
            temperature: Math.floor(Math.random() * 30) + 25,
            uptime: '99.' + Math.floor(Math.random() * 9) + '%',
            ports: this.getDefaultPorts(type),
            snmp: 'public',
            backup: 'none',
            firmware: '',
            warranty: '',
            purchase: '',
            cost: 0,
            alerts: ''
        };
    },

    /**
     * Obtiene los puertos por defecto según el tipo de dispositivo
     */
    getDefaultPorts(type) {
        const defaultPorts = {
            'router': '22, 23, 80, 443',
            'switch': '22, 23, 80, 443',
            'firewall': '22, 80, 443',
            'server': '22, 80, 443',
            'web-server': '80, 443',
            'db-server': '3306, 5432',
            'dns-server': '53',
            'mail-server': '25, 110, 143, 993, 995',
            'pc': '3389',
            'printer': '9100, 631'
        };
        return defaultPorts[type] || '';
    },

    /**
     * Obtiene el icono de un dispositivo
     */
    getDeviceIcon(type) {
        const icons = {
            'core-router': 'CR', 'edge-router': 'ER', 'router': 'R',
            'l3-switch': 'L3', 'switch': 'SW', 'hub': 'H',
            'firewall': 'FW', 'ips': 'IPS', 'waf': 'WAF',
            'loadbalancer': 'LB', 'vpn': 'VPN', 'modem': 'M',
            'ap': 'AP', 'controller': 'WC', 'server': 'SV',
            'web-server': 'WS', 'db-server': 'DB', 'dns-server': 'DNS',
            'mail-server': 'MS', 'pc': 'PC', 'notebook': 'NB',
            'printer': 'PR', 'phone': 'PH', 'nas': 'NAS',
            'san': 'SAN', 'iot-device': 'IoT', 'sensor': 'SN',
            'camera': 'CAM'
        };
        return icons[type] || 'D';
    },

    /**
     * Muestra tooltip del dispositivo
     */
    showDeviceTooltip(e, device) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip visible';
        tooltip.innerHTML = `
            <strong>${device.name}</strong><br>
            Tipo: ${device.type}<br>
            IP: ${device.ip || 'Sin IP'}<br>
            Estado: ${device.status}<br>
            CPU: ${device.cpu}%<br>
            RAM: ${device.memory}%<br>
            Capa: ${device.layer}
        `;
        
        tooltip.style.position = 'fixed';
        tooltip.style.left = e.pageX + 10 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
        tooltip.style.background = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        e.target.tooltipElement = tooltip;
    },

    /**
     * Oculta tooltip
     */
    hideTooltip(e) {
        if (e.target.tooltipElement) {
            e.target.tooltipElement.remove();
            e.target.tooltipElement = null;
        }
    },

    /**
     * Organiza los dispositivos automáticamente
     */
    autoArrange() {
        if (this.app.state.devices.length === 0) {
            Notifications.show('No hay dispositivos para organizar', 'warning');
            return;
        }

        // Agrupar dispositivos por capa
        const layerGroups = {};
        this.app.state.devices.forEach(device => {
            if (!layerGroups[device.layer]) {
                layerGroups[device.layer] = [];
            }
            layerGroups[device.layer].push(device);
        });

        // Definir posiciones de capas
        const layerPositions = {
            'isp': { y: 50 },
            'wan': { y: 200 },
            'core': { y: 350 },
            'distribution': { y: 500 },
            'access': { y: 650 },
            'dmz': { y: 800 },
            'user': { y: 950 },
            'iot': { y: 1100 }
        };

        // Organizar dispositivos
        Object.keys(layerGroups).forEach(layer => {
            const layerDevices = layerGroups[layer];
            const layerY = layerPositions[layer]?.y || 300;
            const spacing = Math.min(200, 2400 / Math.max(layerDevices.length, 1));
            const startX = (2400 - (layerDevices.length - 1) * spacing) / 2;

            layerDevices.forEach((device, index) => {
                device.x = startX + index * spacing;
                device.y = layerY;
                
                const deviceElement = document.getElementById(device.id);
                if (deviceElement) {
                    deviceElement.style.left = device.x + 'px';
                    deviceElement.style.top = device.y + 'px';
                }
            });
        });

        ConnectionManager.updateAll();
        this.app.setStatus('Dispositivos organizados automáticamente por capas');
        Notifications.show('Topología organizada exitosamente', 'success');
    }
};

// Exportar para uso global
window.DeviceManager = DeviceManager;