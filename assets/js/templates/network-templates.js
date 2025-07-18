/**
 * Network Templates - Plantillas predefinidas de topologías de red
 */

const NetworkTemplates = {
    app: null,
    templates: {},

    /**
     * Inicializa el sistema de plantillas
     */
    init(app) {
        this.app = app;
        this.loadTemplates();
        console.log('✓ NetworkTemplates inicializado');
    },

    /**
     * Carga todas las plantillas disponibles
     */
    loadTemplates() {
        this.templates = {
            'basic-enterprise': {
                name: 'Red Empresarial Básica',
                description: 'Topología básica empresarial con router, switch y PCs',
                icon: '🏢',
                devices: ['1 Router', '2 Switches', '4 PCs'],
                difficulty: 'Básico',
                category: 'Empresarial'
            },
            'dmz-network': {
                name: 'Red con DMZ',
                description: 'Red empresarial con zona desmilitarizada para servicios públicos',
                icon: '🛡️',
                devices: ['1 Firewall', '2 Switches', '2 Servidores'],
                difficulty: 'Intermedio',
                category: 'Seguridad'
            },
            'campus-network': {
                name: 'Red de Campus',
                description: 'Red jerárquica para campus universitario o corporativo',
                icon: '🏫',
                devices: ['Core', 'Distribución', 'Acceso'],
                difficulty: 'Avanzado',
                category: 'Empresarial'
            },
            'datacenter': {
                name: 'Data Center',
                description: 'Infraestructura de centro de datos con redundancia',
                icon: '🏭',
                devices: ['Core Switches', 'Servidores', 'Storage'],
                difficulty: 'Avanzado',
                category: 'Empresarial'
            },
            'star-topology': {
                name: 'Topología Estrella',
                description: 'Topología en estrella simple con switch central',
                icon: '⭐',
                devices: ['1 Switch', '6 PCs'],
                difficulty: 'Básico',
                category: 'Educativa'
            },
            'mesh-network': {
                name: 'Red Mesh',
                description: 'Red mallada con múltiples rutas de redundancia',
                icon: '🕸️',
                devices: ['4 Routers', 'Múltiples enlaces'],
                difficulty: 'Avanzado',
                category: 'Redundancia'
            },
            'iot-network': {
                name: 'Red IoT',
                description: 'Infraestructura para dispositivos IoT',
                icon: '🌐',
                devices: ['Gateway IoT', 'Sensores', 'Cámaras'],
                difficulty: 'Intermedio',
                category: 'IoT'
            },
            'hybrid-cloud': {
                name: 'Red Híbrida',
                description: 'Conexión on-premise con servicios en la nube',
                icon: '☁️',
                devices: ['VPN Gateway', 'Firewall', 'Cloud Connect'],
                difficulty: 'Avanzado',
                category: 'Cloud'
            },
            'soho-network': {
                name: 'Red SOHO',
                description: 'Red para oficina pequeña/hogar',
                icon: '🏠',
                devices: ['1 Router', '1 Switch', '3 PCs', '1 Impresora'],
                difficulty: 'Básico',
                category: 'SOHO'
            },
            'wireless-network': {
                name: 'Red Inalámbrica',
                description: 'Infraestructura WiFi empresarial',
                icon: '📡',
                devices: ['Controlador WiFi', 'Access Points', 'Dispositivos móviles'],
                difficulty: 'Intermedio',
                category: 'Wireless'
            }
        };
    },

    /**
     * Carga una plantilla específica
     */
    load(templateId) {
        if (!this.templates[templateId]) {
            Notifications.error(`Plantilla "${templateId}" no encontrada`);
            return;
        }

        if (this.app.state.devices.length > 0) {
            Modal.confirm(
                '¿Cargar plantilla? Se perderán los cambios actuales.',
                () => this.applyTemplate(templateId)
            );
        } else {
            this.applyTemplate(templateId);
        }
    },

    /**
     * Aplica una plantilla al diagrama actual
     */
    applyTemplate(templateId) {
        // Limpiar diagrama actual
        this.app.clearDiagram();

        // Aplicar plantilla específica
        switch (templateId) {
            case 'basic-enterprise':
                this.createBasicEnterprise();
                break;
            case 'dmz-network':
                this.createDMZNetwork();
                break;
            case 'campus-network':
                this.createCampusNetwork();
                break;
            case 'datacenter':
                this.createDatacenter();
                break;
            case 'star-topology':
                this.createStarTopology();
                break;
            case 'mesh-network':
                this.createMeshNetwork();
                break;
            case 'iot-network':
                this.createIoTNetwork();
                break;
            case 'hybrid-cloud':
                this.createHybridCloud();
                break;
            case 'soho-network':
                this.createSOHONetwork();
                break;
            case 'wireless-network':
                this.createWirelessNetwork();
                break;
            default:
                Notifications.error('Plantilla no implementada');
                return;
        }

        // Organizar automáticamente y ajustar vista
        setTimeout(() => {
            DeviceManager.autoArrange();
            CanvasManager.fitToContent();
        }, 500);

        const template = this.templates[templateId];
        Notifications.success(`Plantilla "${template.name}" aplicada exitosamente`);
        this.app.setStatus(`Plantilla ${template.name} cargada`);
    },

    /**
     * Crea red empresarial básica
     */
    createBasicEnterprise() {
        // Router principal
        const router = DeviceManager.create('router', 400, 200, {
            name: 'Router-Main',
            ip: '192.168.1.1',
            layer: 'core'
        });

        // Switches de distribución
        const switch1 = DeviceManager.create('switch', 200, 350, {
            name: 'SW-Dept1',
            ip: '192.168.1.10',
            layer: 'access'
        });

        const switch2 = DeviceManager.create('switch', 600, 350, {
            name: 'SW-Dept2',
            ip: '192.168.1.11',
            layer: 'access'
        });

        // PCs
        const pc1 = DeviceManager.create('pc', 100, 500, {
            name: 'PC-Admin',
            ip: '192.168.1.100',
            layer: 'user'
        });

        const pc2 = DeviceManager.create('pc', 300, 500, {
            name: 'PC-User1',
            ip: '192.168.1.101',
            layer: 'user'
        });

        const pc3 = DeviceManager.create('pc', 500, 500, {
            name: 'PC-User2',
            ip: '192.168.1.102',
            layer: 'user'
        });

        const pc4 = DeviceManager.create('pc', 700, 500, {
            name: 'PC-Guest',
            ip: '192.168.1.103',
            layer: 'user'
        });

        // Crear conexiones después de que se inicialicen las interfaces
        setTimeout(() => {
            this.createConnections([
                [router.id, switch1.id, 'utp'],
                [router.id, switch2.id, 'utp'],
                [switch1.id, pc1.id, 'utp'],
                [switch1.id, pc2.id, 'utp'],
                [switch2.id, pc3.id, 'utp'],
                [switch2.id, pc4.id, 'utp']
            ]);
        }, 100);
    },

    /**
     * Crea red con DMZ
     */
    createDMZNetwork() {
        // Firewall principal
        const firewall = DeviceManager.create('firewall', 400, 200, {
            name: 'FW-Main',
            ip: '192.168.1.1',
            layer: 'core'
        });

        // Switch DMZ
        const switchDMZ = DeviceManager.create('switch', 200, 350, {
            name: 'SW-DMZ',
            ip: '192.168.2.1',
            layer: 'dmz'
        });

        // Switch LAN
        const switchLAN = DeviceManager.create('switch', 600, 350, {
            name: 'SW-LAN',
            ip: '192.168.1.10',
            layer: 'access'
        });

        // Servidores en DMZ
        const webServer = DeviceManager.create('web-server', 150, 500, {
            name: 'WEB-Server',
            ip: '192.168.2.10',
            layer: 'dmz'
        });

        const mailServer = DeviceManager.create('mail-server', 250, 500, {
            name: 'MAIL-Server',
            ip: '192.168.2.11',
            layer: 'dmz'
        });

        // Dispositivos LAN
        const pc1 = DeviceManager.create('pc', 550, 500, {
            name: 'PC-Admin',
            ip: '192.168.1.100',
            layer: 'user'
        });

        const pc2 = DeviceManager.create('pc', 650, 500, {
            name: 'PC-User',
            ip: '192.168.1.101',
            layer: 'user'
        });

        setTimeout(() => {
            this.createConnections([
                [firewall.id, switchDMZ.id, 'utp'],
                [firewall.id, switchLAN.id, 'utp'],
                [switchDMZ.id, webServer.id, 'utp'],
                [switchDMZ.id, mailServer.id, 'utp'],
                [switchLAN.id, pc1.id, 'utp'],
                [switchLAN.id, pc2.id, 'utp']
            ]);
        }, 100);
    },

    /**
     * Crea red de campus jerárquica
     */
    createCampusNetwork() {
        // Core Layer
        const coreRouter1 = DeviceManager.create('core-router', 350, 100, {
            name: 'Core-R1',
            ip: '10.0.0.1',
            layer: 'core'
        });

        const coreRouter2 = DeviceManager.create('core-router', 450, 100, {
            name: 'Core-R2',
            ip: '10.0.0.2',
            layer: 'core'
        });

        // Distribution Layer
        const distSwitch1 = DeviceManager.create('l3-switch', 200, 250, {
            name: 'Dist-SW1',
            ip: '10.0.1.1',
            layer: 'distribution'
        });

        const distSwitch2 = DeviceManager.create('l3-switch', 600, 250, {
            name: 'Dist-SW2',
            ip: '10.0.1.2',
            layer: 'distribution'
        });

        // Access Layer
        const accessSwitches = [];
        for (let i = 0; i < 4; i++) {
            const x = 100 + i * 200;
            const sw = DeviceManager.create('switch', x, 400, {
                name: `Access-SW${i + 1}`,
                ip: `10.0.2.${i + 1}`,
                layer: 'access'
            });
            accessSwitches.push(sw);
        }

        // End devices
        const endDevices = [];
        for (let i = 0; i < 8; i++) {
            const x = 50 + i * 100;
            const device = DeviceManager.create('pc', x, 550, {
                name: `PC-${i + 1}`,
                ip: `10.0.10.${i + 1}`,
                layer: 'user'
            });
            endDevices.push(device);
        }

        setTimeout(() => {
            const connections = [
                // Core redundancy
                [coreRouter1.id, coreRouter2.id, 'fiber'],
                
                // Core to Distribution
                [coreRouter1.id, distSwitch1.id, 'fiber'],
                [coreRouter1.id, distSwitch2.id, 'fiber'],
                [coreRouter2.id, distSwitch1.id, 'fiber'],
                [coreRouter2.id, distSwitch2.id, 'fiber'],
                
                // Distribution to Access
                [distSwitch1.id, accessSwitches[0].id, 'utp'],
                [distSwitch1.id, accessSwitches[1].id, 'utp'],
                [distSwitch2.id, accessSwitches[2].id, 'utp'],
                [distSwitch2.id, accessSwitches[3].id, 'utp']
            ];

            // Access to End devices
            accessSwitches.forEach((sw, swIndex) => {
                const deviceStart = swIndex * 2;
                for (let i = 0; i < 2 && deviceStart + i < endDevices.length; i++) {
                    connections.push([sw.id, endDevices[deviceStart + i].id, 'utp']);
                }
            });

            this.createConnections(connections);
        }, 100);
    },

    /**
     * Crea topología estrella simple
     */
    createStarTopology() {
        // Switch central
        const centralSwitch = DeviceManager.create('switch', 400, 300, {
            name: 'Central-SW',
            ip: '192.168.1.1',
            layer: 'access'
        });

        // PCs en círculo alrededor del switch
        const devices = [];
        const radius = 150;
        const angleStep = (2 * Math.PI) / 6;

        for (let i = 0; i < 6; i++) {
            const angle = i * angleStep;
            const x = 400 + Math.cos(angle) * radius;
            const y = 300 + Math.sin(angle) * radius;
            
            const pc = DeviceManager.create('pc', x, y, {
                name: `PC-${i + 1}`,
                ip: `192.168.1.${100 + i}`,
                layer: 'user'
            });
            devices.push(pc);
        }

        setTimeout(() => {
            const connections = devices.map(device => 
                [centralSwitch.id, device.id, 'utp']
            );
            this.createConnections(connections);
        }, 100);
    },

    /**
     * Crea red IoT
     */
    createIoTNetwork() {
        // Gateway principal
        const gateway = DeviceManager.create('router', 400, 200, {
            name: 'IoT-Gateway',
            ip: '192.168.1.1',
            layer: 'core'
        });

        // Switch para dispositivos cableados
        const switch1 = DeviceManager.create('switch', 200, 350, {
            name: 'IoT-Switch',
            ip: '192.168.1.10',
            layer: 'access'
        });

        // Access Point para dispositivos inalámbricos
        const ap = DeviceManager.create('ap', 600, 350, {
            name: 'IoT-AP',
            ip: '192.168.1.20',
            layer: 'access'
        });

        // Dispositivos IoT
        const sensor1 = DeviceManager.create('sensor', 100, 500, {
            name: 'Temp-Sensor',
            ip: '192.168.1.100',
            layer: 'iot'
        });

        const sensor2 = DeviceManager.create('sensor', 300, 500, {
            name: 'Motion-Sensor',
            ip: '192.168.1.101',
            layer: 'iot'
        });

        const camera1 = DeviceManager.create('camera', 500, 500, {
            name: 'Security-Cam1',
            ip: '192.168.1.110',
            layer: 'iot'
        });

        const camera2 = DeviceManager.create('camera', 700, 500, {
            name: 'Security-Cam2',
            ip: '192.168.1.111',
            layer: 'iot'
        });

        setTimeout(() => {
            this.createConnections([
                [gateway.id, switch1.id, 'utp'],
                [gateway.id, ap.id, 'utp'],
                [switch1.id, sensor1.id, 'utp'],
                [switch1.id, camera1.id, 'utp'],
                [ap.id, sensor2.id, 'wireless'],
                [ap.id, camera2.id, 'wireless']
            ]);
        }, 100);
    },

    /**
     * Crea red SOHO (Small Office/Home Office)
     */
    createSOHONetwork() {
        // Router/Modem combo
        const router = DeviceManager.create('router', 300, 200, {
            name: 'Home-Router',
            ip: '192.168.0.1',
            layer: 'core'
        });

        // Switch para más puertos
        const switch1 = DeviceManager.create('switch', 300, 350, {
            name: 'Home-Switch',
            ip: '192.168.0.10',
            layer: 'access'
        });

        // Dispositivos finales
        const pc1 = DeviceManager.create('pc', 150, 500, {
            name: 'Desktop-PC',
            ip: '192.168.0.100',
            layer: 'user'
        });

        const laptop = DeviceManager.create('notebook', 300, 500, {
            name: 'Laptop',
            ip: '192.168.0.101',
            layer: 'user'
        });

        const printer = DeviceManager.create('printer', 450, 500, {
            name: 'Home-Printer',
            ip: '192.168.0.102',
            layer: 'user'
        });

        setTimeout(() => {
            this.createConnections([
                [router.id, switch1.id, 'utp'],
                [switch1.id, pc1.id, 'utp'],
                [switch1.id, laptop.id, 'utp'],
                [switch1.id, printer.id, 'utp']
            ]);
        }, 100);
    },

    /**
     * Crea red mesh redundante
     */
    createMeshNetwork() {
        // 4 routers en topología mesh
        const routers = [];
        const positions = [
            [200, 200], [600, 200],
            [200, 400], [600, 400]
        ];

        positions.forEach((pos, i) => {
            const router = DeviceManager.create('router', pos[0], pos[1], {
                name: `Mesh-R${i + 1}`,
                ip: `10.0.0.${i + 1}`,
                layer: 'core'
            });
            routers.push(router);
        });

        setTimeout(() => {
            // Conectar todos los routers entre sí (full mesh)
            const connections = [];
            for (let i = 0; i < routers.length; i++) {
                for (let j = i + 1; j < routers.length; j++) {
                    connections.push([routers[i].id, routers[j].id, 'fiber']);
                }
            }
            this.createConnections(connections);
        }, 100);
    },

    /**
     * Crea red inalámbrica empresarial
     */
    createWirelessNetwork() {
        // Controlador WiFi
        const controller = DeviceManager.create('controller', 400, 150, {
            name: 'WiFi-Controller',
            ip: '192.168.1.1',
            layer: 'core'
        });

        // Switch de distribución
        const distSwitch = DeviceManager.create('l3-switch', 400, 300, {
            name: 'Dist-Switch',
            ip: '192.168.1.10',
            layer: 'distribution'
        });

        // Access Points distribuidos
        const aps = [];
        const apPositions = [
            [200, 450], [400, 450], [600, 450]
        ];

        apPositions.forEach((pos, i) => {
            const ap = DeviceManager.create('ap', pos[0], pos[1], {
                name: `AP-${i + 1}`,
                ip: `192.168.1.${20 + i}`,
                layer: 'access'
            });
            aps.push(ap);
        });

        // Dispositivos móviles (representados como notebooks)
        const devices = [];
        for (let i = 0; i < 6; i++) {
            const x = 150 + i * 100;
            const device = DeviceManager.create('notebook', x, 600, {
                name: `Mobile-${i + 1}`,
                ip: `192.168.1.${100 + i}`,
                layer: 'user'
            });
            devices.push(device);
        }

        setTimeout(() => {
            const connections = [
                [controller.id, distSwitch.id, 'utp']
            ];

            // Conectar APs al switch
            aps.forEach(ap => {
                connections.push([distSwitch.id, ap.id, 'utp']);
            });

            // Conectar dispositivos móviles a APs (wireless)
            devices.forEach((device, i) => {
                const apIndex = Math.floor(i / 2);
                if (apIndex < aps.length) {
                    connections.push([aps[apIndex].id, device.id, 'wireless']);
                }
            });

            this.createConnections(connections);
        }, 100);
    },

    /**
     * Crea red híbrida con cloud
     */
    createHybridCloud() {
        // Firewall principal
        const firewall = DeviceManager.create('firewall', 300, 200, {
            name: 'Edge-Firewall',
            ip: '192.168.1.1',
            layer: 'core'
        });

        // VPN Gateway
        const vpnGateway = DeviceManager.create('vpn', 500, 200, {
            name: 'VPN-Gateway',
            ip: '192.168.1.2',
            layer: 'core'
        });

        // Switch LAN
        const lanSwitch = DeviceManager.create('l3-switch', 400, 350, {
            name: 'LAN-Switch',
            ip: '192.168.1.10',
            layer: 'distribution'
        });

        // Servidores locales
        const localServer = DeviceManager.create('server', 200, 500, {
            name: 'Local-Server',
            ip: '192.168.1.100',
            layer: 'user'
        });

        // Estaciones de trabajo
        const workstation = DeviceManager.create('pc', 400, 500, {
            name: 'Workstation',
            ip: '192.168.1.101',
            layer: 'user'
        });

        // Representación de cloud (usando un servidor especial)
        const cloudGateway = DeviceManager.create('server', 600, 500, {
            name: 'Cloud-Services',
            ip: '10.0.0.1',
            layer: 'wan'
        });

        setTimeout(() => {
            this.createConnections([
                [firewall.id, vpnGateway.id, 'utp'],
                [firewall.id, lanSwitch.id, 'utp'],
                [vpnGateway.id, cloudGateway.id, 'serial'],
                [lanSwitch.id, localServer.id, 'utp'],
                [lanSwitch.id, workstation.id, 'utp']
            ]);
        }, 100);
    },

    /**
     * Crea conexiones entre dispositivos
     */
    createConnections(connectionList) {
        connectionList.forEach(([device1Id, device2Id, type]) => {
            // Esperar a que las interfaces estén inicializadas
            const device1 = this.app.getDevice(device1Id);
            const device2 = this.app.getDevice(device2Id);
            
            if (device1 && device2) {
                // Inicializar interfaces si no existen
                if (!device1.interfaces) {
                    InterfaceManager.initializeDeviceInterfaces(device1);
                }
                if (!device2.interfaces) {
                    InterfaceManager.initializeDeviceInterfaces(device2);
                }
                
                // Encontrar interfaces compatibles
                const interface1 = device1.interfaces.find(i => 
                    !i.connected && i.status === 'up' && 
                    InterfaceManager.areInterfacesCompatible(i.type, type)
                );
                
                const interface2 = device2.interfaces.find(i => 
                    !i.connected && i.status === 'up' && 
                    InterfaceManager.areInterfacesCompatible(i.type, type)
                );

                if (interface1 && interface2) {
                    InterfaceManager.connectInterfaces(
                        device1Id, interface1.id,
                        device2Id, interface2.id
                    );
                } else {
                    // Fallback: crear conexión simple
                    ConnectionManager.create(device1, device2, type);
                }
            }
        });
    },

    /**
     * Obtiene la lista de plantillas disponibles
     */
    getTemplateList() {
        return Object.keys(this.templates).map(id => ({
            id,
            ...this.templates[id]
        }));
    },

    /**
     * Obtiene plantillas por categoría
     */
    getTemplatesByCategory() {
        const categories = {};
        
        Object.keys(this.templates).forEach(id => {
            const template = this.templates[id];
            const category = template.category || 'General';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                id,
                ...template
            });
        });
        
        return categories;
    },

    /**
     * Busca plantillas por término
     */
    searchTemplates(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        return Object.keys(this.templates)
            .filter(id => {
                const template = this.templates[id];
                return template.name.toLowerCase().includes(term) ||
                       template.description.toLowerCase().includes(term) ||
                       template.category.toLowerCase().includes(term);
            })
            .map(id => ({
                id,
                ...this.templates[id]
            }));
    },

    /**
     * Exporta una plantilla personalizada
     */
    exportCustomTemplate(name, description) {
        if (this.app.state.devices.length === 0) {
            Notifications.warning('No hay dispositivos para exportar como plantilla');
            return;
        }

        const templateData = {
            name: name,
            description: description,
            devices: this.app.state.devices.map(device => ({
                type: device.type,
                x: device.x,
                y: device.y,
                layer: device.layer,
                name: device.name,
                properties: {
                    ip: device.ip,
                    model: device.model,
                    brand: device.brand
                }
            })),
            connections: this.app.state.connections.map(connection => ({
                device1: this.app.state.devices.findIndex(d => d.id === connection.device1),
                device2: this.app.state.devices.findIndex(d => d.id === connection.device2),
                type: connection.type
            })),
            metadata: {
                createdAt: new Date().toISOString(),
                version: '1.0'
            }
        };

        // Descargar como JSON
        const blob = new Blob([JSON.stringify(templateData, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${name.toLowerCase().replace(/\s+/g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Notifications.success(`Plantilla "${name}" exportada exitosamente`);
    },

    /**
     * Importa una plantilla personalizada
     */
    importCustomTemplate(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const templateData = JSON.parse(e.target.result);
                this.applyCustomTemplate(templateData);
            } catch (error) {
                Notifications.error('Error al importar la plantilla: formato inválido');
            }
        };
        
        reader.readAsText(file);
    },

    /**
     * Aplica una plantilla personalizada
     */
    applyCustomTemplate(templateData) {
        if (!templateData.devices || !Array.isArray(templateData.devices)) {
            Notifications.error('Formato de plantilla inválido');
            return;
        }

        // Limpiar diagrama
        this.app.clearDiagram();

        // Crear dispositivos
        const deviceMap = {};
        templateData.devices.forEach((deviceData, index) => {
            const device = DeviceManager.create(
                deviceData.type,
                deviceData.x,
                deviceData.y,
                {
                    name: deviceData.name,
                    layer: deviceData.layer,
                    ...deviceData.properties
                }
            );
            deviceMap[index] = device.id;
        });

        // Crear conexiones
        if (templateData.connections) {
            setTimeout(() => {
                templateData.connections.forEach(connData => {
                    const device1Id = deviceMap[connData.device1];
                    const device2Id = deviceMap[connData.device2];
                    
                    if (device1Id && device2Id) {
                        const device1 = this.app.getDevice(device1Id);
                        const device2 = this.app.getDevice(device2Id);
                        ConnectionManager.create(device1, device2, connData.type);
                    }
                });
            }, 200);
        }

        Notifications.success(`Plantilla "${templateData.name}" importada exitosamente`);
    }
};

// Exportar para uso global
window.NetworkTemplates = NetworkTemplates;