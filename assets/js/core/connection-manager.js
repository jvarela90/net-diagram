/**
 * Connection Manager - Gestión de conexiones entre dispositivos
 */

const ConnectionManager = {
    app: null,
    connectionStart: null,

    /**
     * Inicializa el gestor de conexiones
     */
    init(app) {
        this.app = app;
        this.setupConnectionStyles();
        console.log('✓ ConnectionManager inicializado');
    },

    /**
     * Configura los estilos de conexión
     */
    setupConnectionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .utp-line { stroke: #27ae60; stroke-width: 4; }
            .fiber-line { stroke: #f39c12; stroke-width: 4; }
            .serial-line { stroke: #9b59b6; stroke-width: 4; }
            .coaxial-line { stroke: #34495e; stroke-width: 4; }
            .wireless-line { stroke: #3498db; stroke-width: 4; stroke-dasharray: 5,5; }
        `;
        document.head.appendChild(style);
    },

    /**
     * Alterna el modo de conexión
     */
    toggleMode() {
        const newMode = !this.app.state.connectionMode;
        this.app.setState({ connectionMode: newMode });
        
        const btn = document.getElementById('connect-btn');
        if (!btn) return;
        
        if (newMode) {
            btn.textContent = '❌ Cancelar';
            btn.classList.add('active');
            this.app.setStatus('Modo conexión activado - Selecciona dos dispositivos');
        } else {
            btn.textContent = '🔗 Conectar';
            btn.classList.remove('active');
            DeviceManager.clearSelection();
            this.connectionStart = null;
            this.app.setStatus('Modo conexión desactivado');
        }
    },

    /**
     * Maneja el click en un dispositivo durante el modo conexión
     */
    handleDeviceClick(device) {
        if (!this.connectionStart) {
            this.connectionStart = device;
            document.getElementById(device.id).classList.add('selected');
            this.app.setStatus(`Conectando desde ${device.name} - Selecciona el dispositivo destino`);
        } else if (this.connectionStart.id !== device.id) {
            this.create(this.connectionStart, device);
            DeviceManager.clearSelection();
            this.connectionStart = null;
            this.app.setStatus('Conexión creada exitosamente');
        }
    },

    /**
     * Crea una nueva conexión
     */
    create(device1, device2, customType = null) {
        // Verificar que no exista ya una conexión entre estos dispositivos
        const existingConnection = this.app.state.connections.find(c => 
            (c.device1 === device1.id && c.device2 === device2.id) ||
            (c.device1 === device2.id && c.device2 === device1.id)
        );

        if (existingConnection) {
            Notifications.show('Ya existe una conexión entre estos dispositivos', 'warning');
            return null;
        }

        const connectionType = customType || this.getSelectedConnectionType();
        const connection = {
            id: this.app.getNextConnectionId(),
            device1: device1.id,
            device2: device2.id,
            type: connectionType,
            bandwidth: this.getConnectionBandwidth(connectionType),
            status: 'up',
            description: ''
        };

        this.app.addConnection(connection);
        this.render(connection);
        
        Notifications.show(`Conexión ${connectionType} creada entre ${device1.name} y ${device2.name}`, 'success');
        return connection;
    },

    /**
     * Crea una conexión por IDs de dispositivos
     */
    createById(device1Id, device2Id, type = 'utp') {
        const device1 = this.app.getDevice(device1Id);
        const device2 = this.app.getDevice(device2Id);
        
        if (device1 && device2) {
            return this.create(device1, device2, type);
        }
        return null;
    },

    /**
     * Renderiza una conexión en el canvas
     */
    render(connection) {
        const device1 = this.app.getDevice(connection.device1);
        const device2 = this.app.getDevice(connection.device2);
        
        if (!device1 || !device2) return;

        const svg = document.getElementById('connection-svg');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        line.id = connection.id;
        line.classList.add(`${connection.type}-line`);
        
        const device1Center = this.getDeviceCenter(device1);
        const device2Center = this.getDeviceCenter(device2);
        
        line.setAttribute('x1', device1Center.x);
        line.setAttribute('y1', device1Center.y);
        line.setAttribute('x2', device2Center.x);
        line.setAttribute('y2', device2Center.y);
        
        // Configurar estilo de línea según estado
        line.setAttribute('stroke-dasharray', connection.status === 'down' ? '10,5' : 'none');
        line.setAttribute('opacity', connection.status === 'down' ? '0.5' : '1');
        
        // Event listeners para la conexión
        line.addEventListener('click', (e) => this.handleConnectionClick(e, connection));
        line.addEventListener('contextmenu', (e) => this.handleConnectionRightClick(e, connection));
        line.style.cursor = 'pointer';
        
        svg.appendChild(line);

        // Añadir etiqueta de conexión
        this.renderConnectionLabel(connection, device1Center, device2Center);
    },

    /**
     * Renderiza la etiqueta de una conexión
     */
    renderConnectionLabel(connection, device1Center, device2Center) {
        const label = document.createElement('div');
        label.className = 'connection-label';
        label.id = `label_${connection.id}`;
        label.textContent = connection.bandwidth;
        
        const midX = (device1Center.x + device2Center.x) / 2;
        const midY = (device1Center.y + device2Center.y) / 2;
        
        label.style.position = 'absolute';
        label.style.left = midX + 'px';
        label.style.top = midY + 'px';
        label.style.background = 'rgba(255, 255, 255, 0.9)';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '3px';
        label.style.fontSize = '10px';
        label.style.pointerEvents = 'none';
        label.style.zIndex = '15';
        
        document.getElementById('canvas-container').appendChild(label);
    },

    /**
     * Elimina una conexión
     */
    delete(connectionId) {
        const connection = this.app.getConnection(connectionId);
        if (!connection) return;

        // Eliminar elementos del DOM
        const connectionElement = document.getElementById(connectionId);
        const labelElement = document.getElementById(`label_${connectionId}`);
        
        if (connectionElement) connectionElement.remove();
        if (labelElement) labelElement.remove();

        // Eliminar del estado
        this.app.removeConnection(connectionId);

        const device1 = this.app.getDevice(connection.device1);
        const device2 = this.app.getDevice(connection.device2);
        const device1Name = device1 ? device1.name : 'Dispositivo desconocido';
        const device2Name = device2 ? device2.name : 'Dispositivo desconocido';

        Notifications.show(`Conexión eliminada entre ${device1Name} y ${device2Name}`, 'info');
    },

    /**
     * Actualiza todas las conexiones (útil cuando se mueven dispositivos)
     */
    updateAll() {
        this.app.state.connections.forEach(connection => {
            this.updateConnection(connection);
        });
    },

    /**
     * Actualiza una conexión específica
     */
    updateConnection(connection) {
        const device1 = this.app.getDevice(connection.device1);
        const device2 = this.app.getDevice(connection.device2);
        
        if (!device1 || !device2) return;

        const line = document.getElementById(connection.id);
        const label = document.getElementById(`label_${connection.id}`);
        
        if (line) {
            const device1Center = this.getDeviceCenter(device1);
            const device2Center = this.getDeviceCenter(device2);
            
            line.setAttribute('x1', device1Center.x);
            line.setAttribute('y1', device1Center.y);
            line.setAttribute('x2', device2Center.x);
            line.setAttribute('y2', device2Center.y);
            
            if (label) {
                const midX = (device1Center.x + device2Center.x) / 2;
                const midY = (device1Center.y + device2Center.y) / 2;
                label.style.left = midX + 'px';
                label.style.top = midY + 'px';
            }
        }
    },

    /**
     * Actualiza la visibilidad de conexiones según las capas
     */
    updateVisibility() {
        this.app.state.connections.forEach(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            
            if (device1 && device2) {
                const visible1 = this.app.state.layerVisibility[device1.layer];
                const visible2 = this.app.state.layerVisibility[device2.layer];
                const connectionVisible = visible1 && visible2;
                
                const line = document.getElementById(connection.id);
                const label = document.getElementById(`label_${connection.id}`);
                
                if (line) line.style.display = connectionVisible ? 'block' : 'none';
                if (label) label.style.display = connectionVisible ? 'block' : 'none';
            }
        });
    },

    /**
     * Obtiene el centro de un dispositivo
     */
    getDeviceCenter(device) {
        return {
            x: device.x + 50, // Asumiendo que el dispositivo tiene 100px de ancho
            y: device.y + 40  // Punto medio vertical
        };
    },

    /**
     * Obtiene el tipo de conexión seleccionado en el toolbar
     */
    getSelectedConnectionType() {
        const connectionTypeSelect = document.getElementById('connection-type');
        return connectionTypeSelect ? connectionTypeSelect.value : 'utp';
    },

    /**
     * Obtiene el ancho de banda según el tipo de conexión
     */
    getConnectionBandwidth(type) {
        const bandwidths = {
            'utp': '1 Gbps',
            'fiber': '10 Gbps',
            'serial': '2 Mbps',
            'coaxial': '100 Mbps',
            'wireless': '300 Mbps'
        };
        return bandwidths[type] || '1 Gbps';
    },

    /**
     * Maneja el click en una conexión
     */
    handleConnectionClick(e, connection) {
        e.stopPropagation();
        this.selectConnection(connection);
    },

    /**
     * Maneja el click derecho en una conexión
     */
    handleConnectionRightClick(e, connection) {
        e.preventDefault();
        e.stopPropagation();
        
        this.selectConnection(connection);
        this.showConnectionContextMenu(e, connection);
    },

    /**
     * Selecciona una conexión
     */
    selectConnection(connection) {
        // Deseleccionar conexiones anteriores
        document.querySelectorAll('.connection-selected').forEach(el => {
            el.classList.remove('connection-selected');
        });

        // Seleccionar la nueva conexión
        const line = document.getElementById(connection.id);
        if (line) {
            line.classList.add('connection-selected');
            line.setAttribute('stroke-width', '6');
        }

        const device1 = this.app.getDevice(connection.device1);
        const device2 = this.app.getDevice(connection.device2);
        const device1Name = device1 ? device1.name : 'Desconocido';
        const device2Name = device2 ? device2.name : 'Desconocido';

        this.app.setStatus(`Conexión seleccionada: ${device1Name} ↔ ${device2Name} (${connection.type})`);
    },

    /**
     * Muestra el menú contextual de una conexión
     */
    showConnectionContextMenu(e, connection) {
        const device1 = this.app.getDevice(connection.device1);
        const device2 = this.app.getDevice(connection.device2);
        const device1Name = device1 ? device1.name : 'Desconocido';
        const device2Name = device2 ? device2.name : 'Desconocido';

        const options = [
            {
                text: `${device1Name} ↔ ${device2Name}`,
                disabled: true
            },
            {
                text: `Tipo: ${connection.type}`,
                disabled: true
            },
            {
                text: `Ancho de banda: ${connection.bandwidth}`,
                disabled: true
            },
            { text: '---' },
            {
                text: 'Editar propiedades',
                action: () => this.editConnectionProperties(connection)
            },
            {
                text: 'Cambiar estado',
                submenu: [
                    { text: 'Activo', action: () => this.setConnectionStatus(connection, 'up') },
                    { text: 'Inactivo', action: () => this.setConnectionStatus(connection, 'down') },
                    { text: 'Advertencia', action: () => this.setConnectionStatus(connection, 'warning') }
                ]
            },
            { text: '---' },
            {
                text: 'Eliminar conexión',
                action: () => this.confirmDeleteConnection(connection),
                style: 'color: #e74c3c'
            }
        ];

        // Implementar menú contextual simple
        this.showSimpleContextMenu(e, options);
    },

    /**
     * Muestra un menú contextual simple
     */
    showSimpleContextMenu(e, options) {
        const menu = document.createElement('div');
        menu.style.position = 'fixed';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.style.background = 'white';
        menu.style.border = '1px solid #ccc';
        menu.style.borderRadius = '4px';
        menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        menu.style.zIndex = '2000';
        menu.style.minWidth = '200px';

        options.forEach(option => {
            if (option.text === '---') {
                const divider = document.createElement('div');
                divider.style.height = '1px';
                divider.style.background = '#eee';
                divider.style.margin = '4px 0';
                menu.appendChild(divider);
            } else {
                const item = document.createElement('div');
                item.textContent = option.text;
                item.style.padding = '8px 12px';
                item.style.cursor = option.disabled ? 'default' : 'pointer';
                item.style.color = option.disabled ? '#999' : '#333';
                
                if (option.style) {
                    item.style.cssText += option.style;
                }

                if (!option.disabled && option.action) {
                    item.addEventListener('click', () => {
                        option.action();
                        document.body.removeChild(menu);
                    });
                    
                    item.addEventListener('mouseenter', () => {
                        if (!option.disabled) {
                            item.style.background = '#f0f0f0';
                        }
                    });
                    
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'transparent';
                    });
                }

                menu.appendChild(item);
            }
        });

        document.body.appendChild(menu);

        // Cerrar menú al hacer click fuera
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                if (menu.parentNode) {
                    document.body.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    },

    /**
     * Confirma y elimina una conexión
     */
    confirmDeleteConnection(connection) {
        const device1 = this.app.getDevice(connection.device1);
        const device2 = this.app.getDevice(connection.device2);
        const device1Name = device1 ? device1.name : 'Desconocido';
        const device2Name = device2 ? device2.name : 'Desconocido';

        if (confirm(`¿Eliminar la conexión entre ${device1Name} y ${device2Name}?`)) {
            this.delete(connection.id);
        }
    },

    /**
     * Establece el estado de una conexión
     */
    setConnectionStatus(connection, status) {
        connection.status = status;
        
        const line = document.getElementById(connection.id);
        if (line) {
            line.setAttribute('stroke-dasharray', status === 'down' ? '10,5' : 'none');
            line.setAttribute('opacity', status === 'down' ? '0.5' : '1');
        }

        const statusText = status === 'up' ? 'activa' : status === 'down' ? 'inactiva' : 'con advertencia';
        Notifications.show(`Conexión marcada como ${statusText}`, 'info');
    },

    /**
     * Edita las propiedades de una conexión
     */
    editConnectionProperties(connection) {
        // Implementar modal de propiedades de conexión
        const newBandwidth = prompt('Ancho de banda:', connection.bandwidth);
        if (newBandwidth !== null) {
            connection.bandwidth = newBandwidth;
            
            const label = document.getElementById(`label_${connection.id}`);
            if (label) {
                label.textContent = newBandwidth;
            }
            
            Notifications.show('Propiedades de conexión actualizadas', 'success');
        }
    },

    /**
     * Resetea el estado del gestor de conexiones
     */
    reset() {
        this.connectionStart = null;
        this.app.setState({ connectionMode: false });
        
        const btn = document.getElementById('connect-btn');
        if (btn) {
            btn.textContent = '🔗 Conectar';
            btn.classList.remove('active');
        }
    },

    /**
     * Valida las conexiones de la topología
     */
    validateTopology() {
        const issues = [];
        
        // Verificar dispositivos aislados
        const connectedDevices = new Set();
        this.app.state.connections.forEach(conn => {
            connectedDevices.add(conn.device1);
            connectedDevices.add(conn.device2);
        });
        
        const isolatedDevices = this.app.state.devices.filter(device => 
            !connectedDevices.has(device.id)
        );
        
        if (isolatedDevices.length > 0) {
            issues.push(`Dispositivos aislados: ${isolatedDevices.map(d => d.name).join(', ')}`);
        }

        // Verificar redundancia en capa core
        const coreDevices = this.app.state.devices.filter(d => d.layer === 'core');
        if (coreDevices.length > 1) {
            // Verificar si los dispositivos core están interconectados
            const coreConnections = this.app.state.connections.filter(conn => {
                const dev1 = this.app.getDevice(conn.device1);
                const dev2 = this.app.getDevice(conn.device2);
                return dev1 && dev2 && dev1.layer === 'core' && dev2.layer === 'core';
            });
            
            if (coreConnections.length === 0) {
                issues.push('Los dispositivos de capa Core no están interconectados (falta redundancia)');
            }
        }

        // Verificar conexiones inactivas
        const downConnections = this.app.state.connections.filter(c => c.status === 'down');
        if (downConnections.length > 0) {
            issues.push(`${downConnections.length} conexión(es) inactiva(s) detectada(s)`);
        }

        return issues;
    },

    /**
     * Obtiene estadísticas de conexiones
     */
    getStats() {
        const total = this.app.state.connections.length;
        const active = this.app.state.connections.filter(c => c.status === 'up').length;
        const inactive = this.app.state.connections.filter(c => c.status === 'down').length;
        const warning = this.app.state.connections.filter(c => c.status === 'warning').length;

        const typeStats = {};
        this.app.state.connections.forEach(c => {
            typeStats[c.type] = (typeStats[c.type] || 0) + 1;
        });

        return {
            total,
            active,
            inactive,
            warning,
            typeStats
        };
    }
};

// Exportar para uso global
window.ConnectionManager = ConnectionManager;