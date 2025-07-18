/**
 * Smart Connection Manager - Sistema inteligente de conexiones
 * Similar a Packet Tracer, solo permite conexiones válidas entre interfaces compatibles
 */

const SmartConnectionManager = {
    app: null,
    connectionMode: false,
    selectedInterface: null,
    hoveredInterface: null,
    compatibleInterfaces: [],

    /**
     * Inicializa el gestor de conexiones inteligentes
     */
    init(app) {
        this.app = app;
        this.setupConnectionModeUI();
        console.log('✓ SmartConnectionManager inicializado');
    },

    /**
     * Configura la UI para el modo de conexión
     */
    setupConnectionModeUI() {
        this.addConnectionStyles();
        this.setupInterfaceHighlighting();
    },

    /**
     * Activa el modo de conexión inteligente
     */
    activateConnectionMode() {
        this.connectionMode = true;
        this.selectedInterface = null;
        this.compatibleInterfaces = [];
        
        // Actualizar UI
        document.body.classList.add('connection-mode');
        this.app.setStatus('Modo conexión activo - Selecciona la primera interfaz');
        
        // Mostrar todas las interfaces disponibles
        this.highlightAvailableInterfaces();
        
        Notifications.info('Selecciona la primera interfaz para conectar');
    },

    /**
     * Desactiva el modo de conexión
     */
    deactivateConnectionMode() {
        this.connectionMode = false;
        this.selectedInterface = null;
        this.compatibleInterfaces = [];
        this.hoveredInterface = null;
        
        // Limpiar UI
        document.body.classList.remove('connection-mode');
        this.clearInterfaceHighlights();
        
        this.app.setStatus('Modo conexión desactivado');
    },

    /**
     * Maneja el click en una interfaz
     */
    handleInterfaceClick(deviceId, interfaceId) {
        if (!this.connectionMode) return;

        const device = this.app.getDevice(deviceId);
        if (!device) return;

        const interface_ = device.interfaces.find(i => i.id === interfaceId);
        if (!interface_) return;

        // Verificar que la interfaz esté disponible
        if (interface_.connected) {
            Notifications.warning(`La interfaz ${interface_.name} ya está conectada`);
            return;
        }

        if (interface_.status === 'down') {
            Notifications.warning(`La interfaz ${interface_.name} está inactiva`);
            return;
        }

        if (!this.selectedInterface) {
            // Primera interfaz seleccionada
            this.selectFirstInterface(device, interface_);
        } else {
            // Segunda interfaz seleccionada
            this.attemptConnection(device, interface_);
        }
    },

    /**
     * Selecciona la primera interfaz
     */
    selectFirstInterface(device, interface_) {
        this.selectedInterface = {
            device: device,
            interface: interface_
        };

        // Destacar la interfaz seleccionada
        this.highlightSelectedInterface(device.id, interface_.id);

        // Encontrar interfaces compatibles
        this.findCompatibleInterfaces(interface_);

        // Actualizar estado
        this.app.setStatus(`${device.name}:${interface_.name} seleccionada - Selecciona la interfaz destino`);
        
        Notifications.info(`Interfaz ${interface_.name} seleccionada. Elige una interfaz compatible para conectar.`);
    },

    /**
     * Intenta realizar la conexión
     */
    attemptConnection(targetDevice, targetInterface) {
        const sourceDevice = this.selectedInterface.device;
        const sourceInterface = this.selectedInterface.interface;

        // Verificar compatibilidad
        if (!this.areInterfacesCompatible(sourceInterface, targetInterface)) {
            const reason = this.getIncompatibilityReason(sourceInterface, targetInterface);
            Notifications.error(`Conexión no válida: ${reason}`);
            return;
        }

        // Verificar que no sea el mismo dispositivo y misma interfaz
        if (sourceDevice.id === targetDevice.id && sourceInterface.id === targetInterface.id) {
            Notifications.error('No puedes conectar una interfaz consigo misma');
            return;
        }

        // Realizar la conexión
        const connection = InterfaceManager.connectInterfaces(
            sourceDevice.id, sourceInterface.id,
            targetDevice.id, targetInterface.id
        );

        if (connection) {
            // Éxito
            this.onConnectionSuccess(connection);
        } else {
            Notifications.error('No se pudo crear la conexión');
        }

        // Limpiar selección
        this.clearSelection();
    },

    /**
     * Encuentra interfaces compatibles con la seleccionada
     */
    findCompatibleInterfaces(selectedInterface) {
        this.compatibleInterfaces = [];

        this.app.state.devices.forEach(device => {
            if (!device.interfaces) return;

            device.interfaces.forEach(interface_ => {
                // Saltar si es la misma interfaz
                if (device.id === this.selectedInterface.device.id && 
                    interface_.id === selectedInterface.id) return;

                // Verificar disponibilidad y compatibilidad
                if (!interface_.connected && 
                    interface_.status === 'up' && 
                    this.areInterfacesCompatible(selectedInterface, interface_)) {
                    
                    this.compatibleInterfaces.push({
                        deviceId: device.id,
                        interfaceId: interface_.id,
                        device: device,
                        interface: interface_
                    });
                }
            });
        });

        // Destacar interfaces compatibles
        this.highlightCompatibleInterfaces();
    },

    /**
     * Verifica si dos interfaces son compatibles
     */
    areInterfacesCompatible(interface1, interface2) {
        // No se puede conectar a sí misma
        if (interface1.id === interface2.id) return false;

        // Verificar compatibilidad de tipos
        return InterfaceManager.areInterfacesCompatible(interface1.type, interface2.type);
    },

    /**
     * Obtiene la razón de incompatibilidad
     */
    getIncompatibilityReason(interface1, interface2) {
        const type1Config = InterfaceManager.interfaceTypes[interface1.type];
        const type2Config = InterfaceManager.interfaceTypes[interface2.type];

        if (!type1Config || !type2Config) {
            return 'Tipo de interfaz no válido';
        }

        // Verificar medios compatibles
        const commonMedia = type1Config.media.filter(media => 
            type2Config.media.includes(media)
        );

        if (commonMedia.length === 0) {
            return `${type1Config.name} (${type1Config.media.join('/')}) no es compatible con ${type2Config.name} (${type2Config.media.join('/')})`;
        }

        // Si hay medios comunes pero no son compatibles por otras razones
        return `Las interfaces ${interface1.name} y ${interface2.name} no son compatibles`;
    },

    /**
     * Maneja el éxito de una conexión
     */
    onConnectionSuccess(connection) {
        const device1Name = this.selectedInterface.device.name;
        const interface1Name = this.selectedInterface.interface.name;
        const device2Name = connection.interface2 ? 
            this.app.getDevice(connection.interface2.deviceId)?.name : 'Dispositivo';
        const interface2Name = connection.interface2?.name || 'Interfaz';

        Notifications.success(
            `Conexión establecida: ${device1Name}:${interface1Name} ↔ ${device2Name}:${interface2Name}`,
            5000,
            [{
                text: 'Ver detalles',
                primary: true,
                callback: () => this.showConnectionDetails(connection.id)
            }]
        );

        // Actualizar visualización
        this.updateConnectionVisualization(connection);
    },

    /**
     * Limpia la selección actual
     */
    clearSelection() {
        this.selectedInterface = null;
        this.compatibleInterfaces = [];
        this.clearInterfaceHighlights();
        
        if (this.connectionMode) {
            this.app.setStatus('Modo conexión activo - Selecciona la primera interfaz');
        }
    },

    /**
     * Destaca las interfaces disponibles
     */
    highlightAvailableInterfaces() {
        this.app.state.devices.forEach(device => {
            if (!device.interfaces) return;

            device.interfaces.forEach(interface_ => {
                if (!interface_.connected && interface_.status === 'up') {
                    this.addInterfaceHighlight(device.id, interface_.id, 'available');
                }
            });
        });
    },

    /**
     * Destaca las interfaces compatibles
     */
    highlightCompatibleInterfaces() {
        // Limpiar destacados anteriores
        this.clearInterfaceHighlights();

        // Destacar interfaz seleccionada
        if (this.selectedInterface) {
            this.addInterfaceHighlight(
                this.selectedInterface.device.id, 
                this.selectedInterface.interface.id, 
                'selected'
            );
        }

        // Destacar interfaces compatibles
        this.compatibleInterfaces.forEach(item => {
            this.addInterfaceHighlight(item.deviceId, item.interfaceId, 'compatible');
        });

        // Destacar interfaces no compatibles como no disponibles
        this.app.state.devices.forEach(device => {
            if (!device.interfaces) return;

            device.interfaces.forEach(interface_ => {
                if (!interface_.connected && interface_.status === 'up') {
                    const isCompatible = this.compatibleInterfaces.some(item => 
                        item.deviceId === device.id && item.interfaceId === interface_.id
                    );
                    
                    const isSelected = this.selectedInterface && 
                        this.selectedInterface.device.id === device.id && 
                        this.selectedInterface.interface.id === interface_.id;

                    if (!isCompatible && !isSelected) {
                        this.addInterfaceHighlight(device.id, interface_.id, 'incompatible');
                    }
                }
            });
        });
    },

    /**
     * Añade destacado a una interfaz
     */
    addInterfaceHighlight(deviceId, interfaceId, type) {
        const deviceElement = document.getElementById(deviceId);
        if (!deviceElement) return;

        // Crear indicador de interfaz si no existe
        let interfaceIndicator = deviceElement.querySelector(`[data-interface-id="${interfaceId}"]`);
        
        if (!interfaceIndicator) {
            interfaceIndicator = this.createInterfaceIndicator(deviceId, interfaceId);
            deviceElement.appendChild(interfaceIndicator);
        }

        // Aplicar clase de destacado
        interfaceIndicator.className = `interface-indicator interface-${type}`;
        
        // Agregar evento de click
        interfaceIndicator.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleInterfaceClick(deviceId, interfaceId);
        });

        // Agregar eventos de hover para mostrar información
        interfaceIndicator.addEventListener('mouseenter', (e) => {
            this.showInterfaceTooltip(e, deviceId, interfaceId);
        });

        interfaceIndicator.addEventListener('mouseleave', () => {
            this.hideInterfaceTooltip();
        });
    },

    /**
     * Crea un indicador visual de interfaz
     */
    createInterfaceIndicator(deviceId, interfaceId) {
        const device = this.app.getDevice(deviceId);
        const interface_ = device.interfaces.find(i => i.id === interfaceId);
        const typeConfig = InterfaceManager.interfaceTypes[interface_.type];

        const indicator = document.createElement('div');
        indicator.className = 'interface-indicator';
        indicator.dataset.interfaceId = interfaceId;
        indicator.dataset.deviceId = deviceId;
        indicator.title = `${interface_.name} (${typeConfig.name})`;
        
        // Posicionamiento basado en el índice de la interfaz
        const interfaceIndex = device.interfaces.indexOf(interface_);
        const angle = (interfaceIndex * 45) % 360; // Distribuir alrededor del dispositivo
        const radius = 45;
        
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        
        indicator.style.cssText = `
            position: absolute;
            left: ${50 + x}px;
            top: ${40 + y}px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 20;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            font-weight: bold;
            color: white;
            transform: translate(-50%, -50%);
        `;

        indicator.textContent = typeConfig.icon;
        
        return indicator;
    },

    /**
     * Limpia todos los destacados de interfaces
     */
    clearInterfaceHighlights() {
        document.querySelectorAll('.interface-indicator').forEach(indicator => {
            indicator.remove();
        });
    },

    /**
     * Muestra tooltip de interfaz
     */
    showInterfaceTooltip(event, deviceId, interfaceId) {
        const device = this.app.getDevice(deviceId);
        const interface_ = device.interfaces.find(i => i.id === interfaceId);
        const typeConfig = InterfaceManager.interfaceTypes[interface_.type];

        let compatibilityInfo = '';
        if (this.selectedInterface && this.selectedInterface.interface.id !== interfaceId) {
            const isCompatible = this.areInterfacesCompatible(this.selectedInterface.interface, interface_);
            compatibilityInfo = `<br><strong>${isCompatible ? '✅ Compatible' : '❌ No compatible'}</strong>`;
            
            if (isCompatible) {
                const media = InterfaceManager.getCompatibleMedia(
                    this.selectedInterface.interface.type, 
                    interface_.type
                );
                compatibilityInfo += `<br>Medio: ${media}`;
            }
        }

        const tooltip = document.createElement('div');
        tooltip.id = 'interface-tooltip';
        tooltip.className = 'interface-tooltip';
        tooltip.innerHTML = `
            <strong>${device.name}</strong><br>
            <strong>${interface_.name}</strong><br>
            Tipo: ${typeConfig.name}<br>
            Velocidad: ${typeConfig.speed}<br>
            Estado: ${interface_.status}<br>
            Conectada: ${interface_.connected ? 'Sí' : 'No'}
            ${compatibilityInfo}
        `;

        tooltip.style.cssText = `
            position: fixed;
            left: ${event.pageX + 10}px;
            top: ${event.pageY + 10}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 3000;
            max-width: 250px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(tooltip);
    },

    /**
     * Oculta tooltip de interfaz
     */
    hideInterfaceTooltip() {
        const tooltip = document.getElementById('interface-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },

    /**
     * Muestra detalles de una conexión
     */
    showConnectionDetails(connectionId) {
        const connection = this.app.getConnection(connectionId);
        if (!connection) return;

        const device1 = this.app.getDevice(connection.interface1.deviceId);
        const device2 = this.app.getDevice(connection.interface2.deviceId);

        const modal = document.createElement('div');
        modal.className = 'modal connection-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalles de Conexión</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="connection-info">
                        <h4>Dispositivos Conectados</h4>
                        <div class="device-connection-info">
                            <div class="device-side">
                                <strong>${device1.name}</strong><br>
                                Interfaz: ${connection.interface1.name}<br>
                                Tipo: ${InterfaceManager.interfaceTypes[connection.interface1.type].name}<br>
                                IP: ${device1.ip || 'No configurada'}
                            </div>
                            <div class="connection-middle">
                                <div class="connection-line-visual"></div>
                                <div class="connection-type">${connection.type.toUpperCase()}</div>
                                <div class="connection-bandwidth">${connection.bandwidth}</div>
                            </div>
                            <div class="device-side">
                                <strong>${device2.name}</strong><br>
                                Interfaz: ${connection.interface2.name}<br>
                                Tipo: ${InterfaceManager.interfaceTypes[connection.interface2.type].name}<br>
                                IP: ${device2.ip || 'No configurada'}
                            </div>
                        </div>
                        
                        <h4>Información Técnica</h4>
                        <table class="connection-details-table">
                            <tr><td>Estado:</td><td>${connection.status}</td></tr>
                            <tr><td>Medio:</td><td>${connection.type}</td></tr>
                            <tr><td>Ancho de banda:</td><td>${connection.bandwidth}</td></tr>
                            <tr><td>Creada:</td><td>${new Date().toLocaleString()}</td></tr>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Actualiza la visualización de la conexión
     */
    updateConnectionVisualization(connection) {
        // Actualizar la línea de conexión para mostrar las interfaces específicas
        const line = document.getElementById(connection.id);
        if (line) {
            line.style.strokeWidth = '6';
            
            // Agregar animación de flujo de datos
            line.style.strokeDasharray = '10,5';
            line.style.animation = 'dataFlow 2s linear infinite';
        }

        // Actualizar etiqueta con información de interfaces
        const label = document.getElementById(`label_${connection.id}`);
        if (label) {
            label.innerHTML = `
                <div style="text-align: center; font-size: 9px; line-height: 1.2;">
                    <div>${connection.interface1.name} ↔ ${connection.interface2.name}</div>
                    <div style="color: #666;">${connection.bandwidth}</div>
                </div>
            `;
        }
    },

    /**
     * Añade estilos CSS para el sistema de conexiones
     */
    addConnectionStyles() {
        if (document.getElementById('smart-connection-styles')) return;

        const style = document.createElement('style');
        style.id = 'smart-connection-styles';
        style.textContent = `
            .connection-mode .device-on-canvas {
                cursor: default;
            }
            
            .interface-indicator {
                transition: all 0.2s ease;
            }
            
            .interface-available {
                background: #95a5a6;
                box-shadow: 0 0 8px rgba(149, 165, 166, 0.6);
            }
            
            .interface-compatible {
                background: #27ae60;
                box-shadow: 0 0 12px rgba(39, 174, 96, 0.8);
                animation: compatiblePulse 1.5s infinite;
            }
            
            .interface-selected {
                background: #3498db;
                box-shadow: 0 0 15px rgba(52, 152, 219, 1);
                animation: selectedPulse 1s infinite;
            }
            
            .interface-incompatible {
                background: #e74c3c;
                opacity: 0.5;
            }
            
            @keyframes compatiblePulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
            }
            
            @keyframes selectedPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.3); }
            }
            
            @keyframes dataFlow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 15; }
            }
            
            .interface-tooltip {
                pointer-events: none;
                line-height: 1.4;
            }
            
            .connection-details-modal .device-connection-info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .connection-details-modal .device-side {
                flex: 1;
                text-align: center;
                padding: 10px;
            }
            
            .connection-details-modal .connection-middle {
                flex: 0 0 150px;
                text-align: center;
                position: relative;
            }
            
            .connection-line-visual {
                height: 4px;
                background: linear-gradient(90deg, #3498db, #27ae60);
                margin: 10px 0;
                border-radius: 2px;
                position: relative;
            }
            
            .connection-line-visual::after {
                content: '';
                position: absolute;
                top: 50%;
                right: -5px;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid #27ae60;
                border-top: 4px solid transparent;
                border-bottom: 4px solid transparent;
            }
            
            .connection-type {
                font-weight: bold;
                color: #2c3e50;
                font-size: 12px;
            }
            
            .connection-bandwidth {
                font-size: 11px;
                color: #7f8c8d;
            }
            
            .connection-details-table {
                width: 100%;
                margin-top: 15px;
                border-collapse: collapse;
            }
            
            .connection-details-table td {
                padding: 8px 12px;
                border-bottom: 1px solid #eee;
            }
            
            .connection-details-table td:first-child {
                font-weight: bold;
                width: 30%;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Configura el destacado de interfaces
     */
    setupInterfaceHighlighting() {
        // Agregar eventos para mostrar/ocultar interfaces al pasar el mouse por dispositivos
        document.addEventListener('mouseover', (e) => {
            if (!this.connectionMode) return;
            
            const deviceElement = e.target.closest('.device-on-canvas');
            if (deviceElement) {
                this.showDeviceInterfaces(deviceElement.id);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (!this.connectionMode) return;
            
            if (!e.relatedTarget || !e.relatedTarget.closest('.device-on-canvas')) {
                // Solo ocultar si no estamos sobre otro dispositivo
                this.hideTemporaryInterfaces();
            }
        });
    },

    /**
     * Muestra las interfaces de un dispositivo temporalmente
     */
    showDeviceInterfaces(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device || !device.interfaces) return;

        // Limpiar interfaces temporales anteriores
        this.hideTemporaryInterfaces();

        device.interfaces.forEach(interface_ => {
            if (!interface_.connected && interface_.status === 'up') {
                const existing = document.querySelector(`[data-interface-id="${interface_.id}"]`);
                if (!existing) {
                    this.addInterfaceHighlight(deviceId, interface_.id, 'available');
                }
            }
        });
    },

    /**
     * Oculta interfaces temporales
     */
    hideTemporaryInterfaces() {
        if (this.selectedInterface) {
            // Si hay una interfaz seleccionada, mantener el estado actual
            this.highlightCompatibleInterfaces();
        } else {
            // Si no hay selección, mostrar solo las disponibles
            this.clearInterfaceHighlights();
            this.highlightAvailableInterfaces();
        }
    },

    /**
     * Obtiene estadísticas de conexiones inteligentes
     */
    getConnectionStats() {
        const totalInterfaces = this.app.state.devices.reduce((total, device) => {
            return total + (device.interfaces ? device.interfaces.length : 0);
        }, 0);

        const connectedInterfaces = this.app.state.devices.reduce((total, device) => {
            if (!device.interfaces) return total;
            return total + device.interfaces.filter(i => i.connected).length;
        }, 0);

        const availableInterfaces = this.app.state.devices.reduce((total, device) => {
            if (!device.interfaces) return total;
            return total + device.interfaces.filter(i => !i.connected && i.status === 'up').length;
        }, 0);

        return {
            totalInterfaces,
            connectedInterfaces,
            availableInterfaces,
            utilizationPercent: totalInterfaces > 0 ? Math.round((connectedInterfaces / totalInterfaces) * 100) : 0
        };
    }
};

// Exportar para uso global
window.SmartConnectionManager = SmartConnectionManager;