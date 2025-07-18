/**
 * Interface Manager - Gestión de interfaces de dispositivos
 */

const InterfaceManager = {
    app: null,
    interfaceTypes: {
        'fastethernet': {
            name: 'FastEthernet',
            speed: '100 Mbps',
            connector: 'RJ45',
            media: ['utp'],
            icon: 'Fe',
            color: '#27ae60'
        },
        'gigabitethernet': {
            name: 'GigabitEthernet',
            speed: '1 Gbps',
            connector: 'RJ45',
            media: ['utp', 'fiber'],
            icon: 'Ge',
            color: '#3498db'
        },
        'tengigabitethernet': {
            name: '10GigabitEthernet',
            speed: '10 Gbps',
            connector: 'SFP+',
            media: ['fiber'],
            icon: '10G',
            color: '#e74c3c'
        },
        'serial': {
            name: 'Serial',
            speed: '2 Mbps',
            connector: 'DB-60',
            media: ['serial'],
            icon: 'S',
            color: '#9b59b6'
        },
        'fiber': {
            name: 'Fiber Optic',
            speed: '1 Gbps',
            connector: 'LC/SC',
            media: ['fiber'],
            icon: 'Fo',
            color: '#f39c12'
        },
        'wireless': {
            name: 'Wireless',
            speed: '300 Mbps',
            connector: 'Antenna',
            media: ['wireless'],
            icon: 'Wl',
            color: '#1abc9c'
        },
        'console': {
            name: 'Console',
            speed: '9600 bps',
            connector: 'RJ45',
            media: ['console'],
            icon: 'Co',
            color: '#34495e'
        }
    },

    /**
     * Inicializa el gestor de interfaces
     */
    init(app) {
        this.app = app;
        this.setupDefaultInterfaces();
        console.log('✓ InterfaceManager inicializado');
    },

    /**
     * Configura las interfaces por defecto para cada tipo de dispositivo
     */
    setupDefaultInterfaces() {
        this.defaultInterfaces = {
            'switch': [
                { type: 'fastethernet', count: 24, prefix: 'Fa0/' },
                { type: 'gigabitethernet', count: 2, prefix: 'Gi0/' },
                { type: 'fiber', count: 2, prefix: 'Fo0/' }
            ],
            'l3-switch': [
                { type: 'fastethernet', count: 24, prefix: 'Fa0/' },
                { type: 'gigabitethernet', count: 4, prefix: 'Gi0/' },
                { type: 'fiber', count: 4, prefix: 'Fo0/' }
            ],
            'router': [
                { type: 'gigabitethernet', count: 4, prefix: 'Gi0/' },
                { type: 'serial', count: 2, prefix: 'S0/' },
                { type: 'console', count: 1, prefix: 'Con0/' }
            ],
            'core-router': [
                { type: 'tengigabitethernet', count: 8, prefix: '10Gi0/' },
                { type: 'gigabitethernet', count: 8, prefix: 'Gi0/' },
                { type: 'serial', count: 4, prefix: 'S0/' },
                { type: 'console', count: 1, prefix: 'Con0/' }
            ],
            'edge-router': [
                { type: 'gigabitethernet', count: 8, prefix: 'Gi0/' },
                { type: 'serial', count: 4, prefix: 'S0/' },
                { type: 'console', count: 1, prefix: 'Con0/' }
            ],
            'firewall': [
                { type: 'gigabitethernet', count: 6, prefix: 'Gi0/' },
                { type: 'console', count: 1, prefix: 'Con0/' }
            ],
            'server': [
                { type: 'gigabitethernet', count: 2, prefix: 'eth' },
                { type: 'wireless', count: 1, prefix: 'wlan' }
            ],
            'pc': [
                { type: 'gigabitethernet', count: 1, prefix: 'eth' },
                { type: 'wireless', count: 1, prefix: 'wlan' }
            ],
            'notebook': [
                { type: 'gigabitethernet', count: 1, prefix: 'eth' },
                { type: 'wireless', count: 1, prefix: 'wlan' }
            ],
            'ap': [
                { type: 'fastethernet', count: 1, prefix: 'Fa0/' },
                { type: 'wireless', count: 4, prefix: 'Wlan' }
            ],
            'printer': [
                { type: 'fastethernet', count: 1, prefix: 'eth' },
                { type: 'wireless', count: 1, prefix: 'wlan' }
            ]
        };
    },

    /**
     * Inicializa las interfaces de un dispositivo
     */
    initializeDeviceInterfaces(device) {
        if (!device.interfaces) {
            device.interfaces = [];
        }

        const defaultConfig = this.defaultInterfaces[device.type];
        if (defaultConfig) {
            defaultConfig.forEach(config => {
                for (let i = 0; i < config.count; i++) {
                    const interfaceId = this.generateInterfaceId();
                    const interface_ = {
                        id: interfaceId,
                        name: `${config.prefix}${i}`,
                        type: config.type,
                        status: 'up',
                        connected: false,
                        connectionId: null,
                        speed: this.interfaceTypes[config.type].speed,
                        duplex: 'full',
                        description: '',
                        vlan: config.type === 'fastethernet' || config.type === 'gigabitethernet' ? 1 : null
                    };
                    device.interfaces.push(interface_);
                }
            });
        }

        return device.interfaces;
    },

    /**
     * Genera un ID único para interfaces
     */
    generateInterfaceId() {
        return 'int_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Añade una nueva interfaz a un dispositivo
     */
    addInterface(deviceId, interfaceType) {
        const device = this.app.getDevice(deviceId);
        if (!device) return null;

        if (!this.interfaceTypes[interfaceType]) {
            Notifications.error('Tipo de interfaz no válido');
            return null;
        }

        const interfaceTypeConfig = this.interfaceTypes[interfaceType];
        const existingInterfaces = device.interfaces.filter(i => i.type === interfaceType);
        const nextIndex = existingInterfaces.length;

        // Determinar prefijo según el tipo de dispositivo
        let prefix = this.getInterfacePrefix(device.type, interfaceType);
        
        const interface_ = {
            id: this.generateInterfaceId(),
            name: `${prefix}${nextIndex}`,
            type: interfaceType,
            status: 'down',
            connected: false,
            connectionId: null,
            speed: interfaceTypeConfig.speed,
            duplex: 'full',
            description: '',
            vlan: interfaceType === 'fastethernet' || interfaceType === 'gigabitethernet' ? 1 : null
        };

        device.interfaces.push(interface_);
        
        Notifications.success(`Interfaz ${interface_.name} agregada a ${device.name}`);
        this.updateDeviceInterfaceDisplay(device);
        
        return interface_;
    },

    /**
     * Obtiene el prefijo de interfaz según el dispositivo y tipo
     */
    getInterfacePrefix(deviceType, interfaceType) {
        const prefixMap = {
            'switch': {
                'fastethernet': 'Fa0/',
                'gigabitethernet': 'Gi0/',
                'fiber': 'Fo0/'
            },
            'router': {
                'gigabitethernet': 'Gi0/',
                'serial': 'S0/',
                'console': 'Con0/'
            },
            'pc': {
                'gigabitethernet': 'eth',
                'wireless': 'wlan'
            },
            'server': {
                'gigabitethernet': 'eth',
                'wireless': 'wlan'
            }
        };

        return prefixMap[deviceType]?.[interfaceType] || 
               this.defaultInterfaces[deviceType]?.find(c => c.type === interfaceType)?.prefix || 
               interfaceType.substring(0, 2) + '0/';
    },

    /**
     * Elimina una interfaz de un dispositivo
     */
    removeInterface(deviceId, interfaceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return false;

        const interfaceIndex = device.interfaces.findIndex(i => i.id === interfaceId);
        if (interfaceIndex === -1) return false;

        const interface_ = device.interfaces[interfaceIndex];
        
        // Verificar si la interfaz está conectada
        if (interface_.connected) {
            Notifications.warning(`No se puede eliminar ${interface_.name}: está conectada`);
            return false;
        }

        device.interfaces.splice(interfaceIndex, 1);
        
        Notifications.info(`Interfaz ${interface_.name} eliminada de ${device.name}`);
        this.updateDeviceInterfaceDisplay(device);
        
        return true;
    },

    /**
     * Obtiene las interfaces disponibles para conexión de un dispositivo
     */
    getAvailableInterfaces(deviceId, requiredType = null) {
        const device = this.app.getDevice(deviceId);
        if (!device || !device.interfaces) return [];

        return device.interfaces.filter(interface_ => {
            // Debe estar desconectada
            if (interface_.connected) return false;
            
            // Debe estar activa
            if (interface_.status === 'down') return false;
            
            // Si se especifica un tipo, debe coincidir o ser compatible
            if (requiredType && !this.areInterfacesCompatible(interface_.type, requiredType)) {
                return false;
            }
            
            return true;
        });
    },

    /**
     * Verifica si dos tipos de interfaces son compatibles
     */
    areInterfacesCompatible(type1, type2) {
        // Mismos tipos son compatibles
        if (type1 === type2) return true;

        // FastEthernet y GigabitEthernet pueden conectarse con UTP
        const ethernetTypes = ['fastethernet', 'gigabitethernet'];
        if (ethernetTypes.includes(type1) && ethernetTypes.includes(type2)) {
            return true;
        }

        // Fiber optic y GigabitEthernet pueden conectarse
        if ((type1 === 'fiber' && type2 === 'gigabitethernet') ||
            (type1 === 'gigabitethernet' && type2 === 'fiber')) {
            return true;
        }

        return false;
    },

    /**
     * Obtiene el medio de conexión compatible entre dos interfaces
     */
    getCompatibleMedia(interface1Type, interface2Type) {
        const type1Config = this.interfaceTypes[interface1Type];
        const type2Config = this.interfaceTypes[interface2Type];
        
        if (!type1Config || !type2Config) return null;

        // Encontrar medios comunes
        const commonMedia = type1Config.media.filter(media => 
            type2Config.media.includes(media)
        );

        if (commonMedia.length === 0) return null;

        // Priorizar ciertos medios
        const mediaPriority = ['fiber', 'utp', 'wireless', 'serial', 'console'];
        
        for (const media of mediaPriority) {
            if (commonMedia.includes(media)) {
                return media;
            }
        }

        return commonMedia[0];
    },

    /**
     * Conecta dos interfaces
     */
    connectInterfaces(device1Id, interface1Id, device2Id, interface2Id) {
        const device1 = this.app.getDevice(device1Id);
        const device2 = this.app.getDevice(device2Id);
        
        if (!device1 || !device2) return null;

        const interface1 = device1.interfaces.find(i => i.id === interface1Id);
        const interface2 = device2.interfaces.find(i => i.id === interface2Id);
        
        if (!interface1 || !interface2) return null;

        // Verificar compatibilidad
        if (!this.areInterfacesCompatible(interface1.type, interface2.type)) {
            Notifications.error(`Interfaces ${interface1.name} y ${interface2.name} no son compatibles`);
            return null;
        }

        // Verificar que estén disponibles
        if (interface1.connected || interface2.connected) {
            Notifications.error('Una de las interfaces ya está conectada');
            return null;
        }

        // Obtener medio compatible
        const media = this.getCompatibleMedia(interface1.type, interface2.type);
        if (!media) {
            Notifications.error('No hay medio de conexión compatible');
            return null;
        }

        // Crear conexión
        const connection = ConnectionManager.create(device1, device2, media);
        if (!connection) return null;

        // Marcar interfaces como conectadas
        interface1.connected = true;
        interface1.connectionId = connection.id;
        interface1.status = 'up';
        
        interface2.connected = true;
        interface2.connectionId = connection.id;
        interface2.status = 'up';

        // Añadir información de interfaces a la conexión
        connection.interface1 = {
            deviceId: device1Id,
            interfaceId: interface1Id,
            name: interface1.name,
            type: interface1.type
        };
        
        connection.interface2 = {
            deviceId: device2Id,
            interfaceId: interface2Id,
            name: interface2.name,
            type: interface2.type
        };

        this.updateDeviceInterfaceDisplay(device1);
        this.updateDeviceInterfaceDisplay(device2);

        Notifications.success(`${device1.name}:${interface1.name} conectado a ${device2.name}:${interface2.name} vía ${media}`);
        
        return connection;
    },

    /**
     * Desconecta interfaces
     */
    disconnectInterfaces(connectionId) {
        const connection = this.app.getConnection(connectionId);
        if (!connection) return false;

        if (connection.interface1 && connection.interface2) {
            const device1 = this.app.getDevice(connection.interface1.deviceId);
            const device2 = this.app.getDevice(connection.interface2.deviceId);
            
            if (device1) {
                const interface1 = device1.interfaces.find(i => i.id === connection.interface1.interfaceId);
                if (interface1) {
                    interface1.connected = false;
                    interface1.connectionId = null;
                    interface1.status = 'down';
                }
                this.updateDeviceInterfaceDisplay(device1);
            }
            
            if (device2) {
                const interface2 = device2.interfaces.find(i => i.id === connection.interface2.interfaceId);
                if (interface2) {
                    interface2.connected = false;
                    interface2.connectionId = null;
                    interface2.status = 'down';
                }
                this.updateDeviceInterfaceDisplay(device2);
            }
        }

        return true;
    },

    /**
     * Abre el modal de gestión de interfaces
     */
    openInterfaceManager(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return;

        if (!device.interfaces) {
            this.initializeDeviceInterfaces(device);
        }

        this.showInterfaceModal(device);
    },

    /**
     * Muestra el modal de interfaces
     */
    showInterfaceModal(device) {
        const modal = this.createInterfaceModal(device);
        document.body.appendChild(modal);
        
        // Mostrar modal
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Crea el modal de gestión de interfaces
     */
    createInterfaceModal(device) {
        const modal = document.createElement('div');
        modal.className = 'interface-modal modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Gestión de Interfaces - ${device.name}</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="interface-toolbar">
                        <button class="btn btn-primary" onclick="InterfaceManager.showAddInterfaceDialog('${device.id}')">
                            ➕ Agregar Interfaz
                        </button>
                        <button class="btn btn-secondary" onclick="InterfaceManager.refreshInterfaceList('${device.id}')">
                            🔄 Actualizar
                        </button>
                    </div>
                    
                    <div class="interfaces-list" id="interfaces-list-${device.id}">
                        ${this.generateInterfacesList(device)}
                    </div>
                </div>
            </div>
        `;

        // Agregar estilos
        this.addInterfaceModalStyles();
        
        return modal;
    },

    /**
     * Genera la lista de interfaces HTML
     */
    generateInterfacesList(device) {
        if (!device.interfaces || device.interfaces.length === 0) {
            return '<p>No hay interfaces configuradas</p>';
        }

        return `
            <table class="interfaces-table">
                <thead>
                    <tr>
                        <th>Interfaz</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Velocidad</th>
                        <th>Conectada a</th>
                        <th>VLAN</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${device.interfaces.map(interface_ => this.generateInterfaceRow(device, interface_)).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Genera una fila de interfaz
     */
    generateInterfaceRow(device, interface_) {
        const typeConfig = this.interfaceTypes[interface_.type];
        const statusIcon = interface_.status === 'up' ? '🟢' : '🔴';
        const connectedTo = this.getConnectedDeviceName(interface_.connectionId);
        
        return `
            <tr class="interface-row" data-interface-id="${interface_.id}">
                <td>
                    <span class="interface-icon" style="background: ${typeConfig.color}">${typeConfig.icon}</span>
                    ${interface_.name}
                </td>
                <td>${typeConfig.name}</td>
                <td>${statusIcon} ${interface_.status}</td>
                <td>${interface_.speed}</td>
                <td>${connectedTo}</td>
                <td>${interface_.vlan || '-'}</td>
                <td>
                    <button class="btn-small" onclick="InterfaceManager.editInterface('${device.id}', '${interface_.id}')" title="Editar">
                        ✏️
                    </button>
                    ${!interface_.connected ? `
                        <button class="btn-small btn-danger" onclick="InterfaceManager.removeInterface('${device.id}', '${interface_.id}')" title="Eliminar">
                            🗑️
                        </button>
                    ` : `
                        <button class="btn-small btn-warning" onclick="InterfaceManager.disconnectInterface('${interface_.connectionId}')" title="Desconectar">
                            🔌
                        </button>
                    `}
                </td>
            </tr>
        `;
    },

    /**
     * Obtiene el nombre del dispositivo conectado
     */
    getConnectedDeviceName(connectionId) {
        if (!connectionId) return '-';
        
        const connection = this.app.getConnection(connectionId);
        if (!connection) return 'Desconocido';
        
        // Implementar lógica para obtener el nombre del otro dispositivo
        return 'Conectado';
    },

    /**
     * Muestra el diálogo para agregar interfaz
     */
    showAddInterfaceDialog(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return;

        const availableTypes = this.getAvailableInterfaceTypes(device.type);
        
        const options = availableTypes.map(type => {
            const config = this.interfaceTypes[type];
            return `<option value="${type}">${config.name} (${config.speed})</option>`;
        }).join('');

        Notifications.prompt(
            `<strong>Agregar Interfaz a ${device.name}</strong><br>
             <select id="interface-type-select" style="width: 100%; margin-top: 10px;">
                ${options}
             </select>`,
            '',
            (value) => {
                const select = document.getElementById('interface-type-select');
                if (select) {
                    this.addInterface(deviceId, select.value);
                    this.refreshInterfaceList(deviceId);
                }
            }
        );
    },

    /**
     * Obtiene los tipos de interfaces disponibles para un dispositivo
     */
    getAvailableInterfaceTypes(deviceType) {
        // Tipos base que se pueden agregar a cualquier dispositivo
        const baseTypes = ['fastethernet', 'gigabitethernet', 'wireless'];
        
        // Tipos específicos por dispositivo
        const specificTypes = {
            'router': ['serial', 'tengigabitethernet', 'fiber'],
            'core-router': ['tengigabitethernet', 'fiber'],
            'switch': ['fiber', 'tengigabitethernet'],
            'l3-switch': ['fiber', 'tengigabitethernet'],
            'server': ['tengigabitethernet', 'fiber'],
            'firewall': ['fiber']
        };

        return [...baseTypes, ...(specificTypes[deviceType] || [])];
    },

    /**
     * Actualiza la lista de interfaces
     */
    refreshInterfaceList(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return;

        const listContainer = document.getElementById(`interfaces-list-${deviceId}`);
        if (listContainer) {
            listContainer.innerHTML = this.generateInterfacesList(device);
        }
    },

    /**
     * Actualiza la visualización de interfaces en el dispositivo
     */
    updateDeviceInterfaceDisplay(device) {
        // Actualizar indicadores visuales en el dispositivo del canvas
        const deviceElement = document.getElementById(device.id);
        if (!deviceElement) return;

        const connectedCount = device.interfaces.filter(i => i.connected).length;
        const totalCount = device.interfaces.length;

        // Agregar o actualizar indicador de interfaces
        let indicator = deviceElement.querySelector('.interface-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'interface-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #3498db;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 8px;
                font-weight: bold;
            `;
            deviceElement.appendChild(indicator);
        }

        indicator.textContent = `${connectedCount}/${totalCount}`;
        indicator.style.background = connectedCount > 0 ? '#27ae60' : '#95a5a6';
    },

    /**
     * Añade estilos para el modal de interfaces
     */
    addInterfaceModalStyles() {
        if (document.getElementById('interface-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'interface-modal-styles';
        style.textContent = `
            .interface-modal .modal-content {
                width: 90%;
                max-width: 900px;
            }
            
            .interface-toolbar {
                margin-bottom: 20px;
                display: flex;
                gap: 10px;
            }
            
            .interfaces-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
            }
            
            .interfaces-table th,
            .interfaces-table td {
                padding: 8px 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .interfaces-table th {
                background: #f8f9fa;
                font-weight: bold;
            }
            
            .interface-icon {
                display: inline-block;
                width: 20px;
                height: 20px;
                line-height: 20px;
                text-align: center;
                color: white;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                margin-right: 8px;
            }
            
            .btn-small {
                padding: 4px 8px;
                font-size: 12px;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 4px;
            }
            
            .btn-danger {
                background: #e74c3c;
                color: white;
            }
            
            .btn-warning {
                background: #f39c12;
                color: white;
            }
            
            .interface-indicator {
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
};

// Exportar para uso global
window.InterfaceManager = InterfaceManager;