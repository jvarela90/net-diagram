/**
 * Validators - Funciones de validación para la aplicación
 */

const Validators = {
    app: null,

    /**
     * Inicializa el sistema de validaciones
     */
    init(app) {
        this.app = app;
        console.log('✓ Validators inicializado');
    },

    /**
     * Valida la topología completa de la red
     */
    validateNetworkTopology() {
        const issues = [];
        
        // Validar dispositivos
        const deviceIssues = this.validateDevices();
        issues.push(...deviceIssues);
        
        // Validar conexiones
        const connectionIssues = this.validateConnections();
        issues.push(...connectionIssues);
        
        // Validar jerarquía de capas
        const layerIssues = this.validateLayerHierarchy();
        issues.push(...layerIssues);
        
        return issues;
    },

    /**
     * Valida dispositivos individuales
     */
    validateDevices() {
        const issues = [];
        
        this.app.state.devices.forEach(device => {
            // Validar propiedades requeridas
            if (!device.name || device.name.trim() === '') {
                issues.push({
                    type: 'error',
                    category: 'Dispositivos',
                    message: `Dispositivo sin nombre en posición (${device.x}, ${device.y})`,
                    deviceId: device.id
                });
            }
            
            // Validar IP si está presente
            if (device.ip && !this.isValidIP(device.ip)) {
                issues.push({
                    type: 'error',
                    category: 'Configuración',
                    message: `IP inválida en ${device.name}: ${device.ip}`,
                    deviceId: device.id
                });
            }
            
            // Validar MAC si está presente
            if (device.mac && !this.isValidMAC(device.mac)) {
                issues.push({
                    type: 'warning',
                    category: 'Configuración',
                    message: `MAC inválida en ${device.name}: ${device.mac}`,
                    deviceId: device.id
                });
            }
            
            // Validar VLAN
            if (device.vlan && (device.vlan < 1 || device.vlan > 4094)) {
                issues.push({
                    type: 'error',
                    category: 'Configuración',
                    message: `VLAN inválida en ${device.name}: ${device.vlan} (debe estar entre 1-4094)`,
                    deviceId: device.id
                });
            }
            
            // Verificar dispositivos duplicados por IP
            if (device.ip) {
                const duplicates = this.app.state.devices.filter(d => 
                    d.id !== device.id && d.ip === device.ip
                );
                if (duplicates.length > 0) {
                    issues.push({
                        type: 'error',
                        category: 'Conflictos',
                        message: `IP duplicada ${device.ip} en ${device.name} y ${duplicates.map(d => d.name).join(', ')}`,
                        deviceId: device.id
                    });
                }
            }
        });
        
        return issues;
    },

    /**
     * Valida las conexiones
     */
    validateConnections() {
        const issues = [];
        
        this.app.state.connections.forEach(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            
            // Verificar que los dispositivos existan
            if (!device1 || !device2) {
                issues.push({
                    type: 'error',
                    category: 'Conexiones',
                    message: `Conexión con dispositivo inexistente: ${connection.id}`,
                    connectionId: connection.id
                });
                return;
            }
            
            // Verificar compatibilidad de interfaces si existen
            if (connection.interface1 && connection.interface2) {
                const interface1 = device1.interfaces?.find(i => i.id === connection.interface1.interfaceId);
                const interface2 = device2.interfaces?.find(i => i.id === connection.interface2.interfaceId);
                
                if (interface1 && interface2) {
                    if (!this.areInterfacesCompatible(interface1.type, interface2.type)) {
                        issues.push({
                            type: 'error',
                            category: 'Conexiones',
                            message: `Interfaces incompatibles: ${device1.name}:${interface1.name} (${interface1.type}) con ${device2.name}:${interface2.name} (${interface2.type})`,
                            connectionId: connection.id
                        });
                    }
                }
            }
            
            // Verificar conexiones duplicadas
            const duplicates = this.app.state.connections.filter(c => 
                c.id !== connection.id && 
                ((c.device1 === connection.device1 && c.device2 === connection.device2) ||
                 (c.device1 === connection.device2 && c.device2 === connection.device1))
            );
            
            if (duplicates.length > 0) {
                issues.push({
                    type: 'warning',
                    category: 'Conexiones',
                    message: `Conexión duplicada entre ${device1.name} y ${device2.name}`,
                    connectionId: connection.id
                });
            }
        });
        
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
            issues.push({
                type: 'warning',
                category: 'Conectividad',
                message: `Dispositivos aislados: ${isolatedDevices.map(d => d.name).join(', ')}`,
                devices: isolatedDevices.map(d => d.id)
            });
        }
        
        return issues;
    },

    /**
     * Valida la jerarquía de capas
     */
    validateLayerHierarchy() {
        const issues = [];
        const layerCounts = {};
        
        // Contar dispositivos por capa
        this.app.state.devices.forEach(device => {
            layerCounts[device.layer] = (layerCounts[device.layer] || 0) + 1;
        });
        
        // Verificar capa core
        if (layerCounts.core === 1) {
            issues.push({
                type: 'warning',
                category: 'Redundancia',
                message: 'Solo hay un dispositivo en la capa Core (falta redundancia)'
            });
        } else if (!layerCounts.core && this.app.state.devices.length > 5) {
            issues.push({
                type: 'info',
                category: 'Arquitectura',
                message: 'Red compleja sin capa Core definida'
            });
        }
        
        // Verificar conectividad entre capas
        const interLayerConnections = this.getInterLayerConnections();
        if (interLayerConnections.length === 0 && this.app.state.devices.length > 2) {
            issues.push({
                type: 'warning',
                category: 'Arquitectura',
                message: 'No hay conexiones entre diferentes capas de red'
            });
        }
        
        // Verificar jerarquía lógica
        const hierarchyIssues = this.validateHierarchicalConnections();
        issues.push(...hierarchyIssues);
        
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
     * Valida conexiones jerárquicas
     */
    validateHierarchicalConnections() {
        const issues = [];
        const layerHierarchy = ['isp', 'wan', 'core', 'distribution', 'access', 'dmz', 'user', 'iot'];
        
        this.app.state.connections.forEach(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            
            if (!device1 || !device2) return;
            
            const layer1Index = layerHierarchy.indexOf(device1.layer);
            const layer2Index = layerHierarchy.indexOf(device2.layer);
            
            // Verificar saltos de capa excesivos
            if (Math.abs(layer1Index - layer2Index) > 2 && layer1Index !== -1 && layer2Index !== -1) {
                issues.push({
                    type: 'info',
                    category: 'Arquitectura',
                    message: `Conexión entre capas no adyacentes: ${device1.name} (${device1.layer}) con ${device2.name} (${device2.layer})`,
                    connectionId: connection.id
                });
            }
        });
        
        return issues;
    },

    /**
     * Verifica si dos tipos de interfaces son compatibles
     */
    areInterfacesCompatible(type1, type2) {
        // Mismos tipos son compatibles
        if (type1 === type2) return true;
        
        // FastEthernet y GigabitEthernet son compatibles
        const ethernetTypes = ['fastethernet', 'gigabitethernet'];
        if (ethernetTypes.includes(type1) && ethernetTypes.includes(type2)) {
            return true;
        }
        
        // Fiber y GigabitEthernet son compatibles
        if ((type1 === 'fiber' && type2 === 'gigabitethernet') ||
            (type1 === 'gigabitethernet' && type2 === 'fiber')) {
            return true;
        }
        
        return false;
    },

    /**
     * Valida una dirección IP
     */
    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    },

    /**
     * Valida una dirección MAC
     */
    isValidMAC(mac) {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
    },

    /**
     * Valida una máscara de subred
     */
    isValidSubnetMask(mask) {
        if (!this.isValidIP(mask)) return false;
        
        const parts = mask.split('.');
        const binary = parts.map(part => 
            parseInt(part).toString(2).padStart(8, '0')
        ).join('');
        
        // Verificar que sea una máscara válida (1s seguidos de 0s)
        return /^1*0*$/.test(binary);
    },

    /**
     * Valida un rango de puertos
     */
    isValidPortRange(ports) {
        if (!ports) return true;
        
        const portList = ports.split(',').map(p => p.trim());
        
        for (const port of portList) {
            if (port.includes('-')) {
                const [start, end] = port.split('-').map(p => parseInt(p.trim()));
                if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
                    return false;
                }
            } else {
                const portNum = parseInt(port);
                if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                    return false;
                }
            }
        }
        
        return true;
    },

    /**
     * Valida configuración de VLAN
     */
    isValidVLAN(vlan) {
        if (!vlan) return true;
        const vlanNum = parseInt(vlan);
        return !isNaN(vlanNum) && vlanNum >= 1 && vlanNum <= 4094;
    },

    /**
     * Valida una dirección de red (CIDR)
     */
    isValidCIDR(cidr) {
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([1-2]?[0-9]|3[0-2])$/;
        return cidrRegex.test(cidr);
    },

    /**
     * Valida configuración de ancho de banda
     */
    isValidBandwidth(bandwidth) {
        if (!bandwidth) return true;
        const bandwidthRegex = /^\d+\s*(bps|kbps|mbps|gbps|tbps)$/i;
        return bandwidthRegex.test(bandwidth.trim());
    },

    /**
     * Valida nombre de dispositivo
     */
    isValidDeviceName(name) {
        if (!name || name.trim().length === 0) return false;
        
        // Permitir letras, números, guiones y guiones bajos
        const nameRegex = /^[a-zA-Z0-9_-]+$/;
        return nameRegex.test(name) && name.length <= 50;
    },

    /**
     * Valida configuración de interfaz
     */
    validateInterface(interface_) {
        const issues = [];
        
        if (!interface_.name || interface_.name.trim() === '') {
            issues.push('Nombre de interfaz requerido');
        }
        
        if (!interface_.type) {
            issues.push('Tipo de interfaz requerido');
        }
        
        if (interface_.vlan && !this.isValidVLAN(interface_.vlan)) {
            issues.push('VLAN inválida');
        }
        
        return issues;
    },

    /**
     * Valida configuración de dispositivo completa
     */
    validateDeviceConfiguration(device) {
        const issues = [];
        
        // Validaciones básicas
        if (!this.isValidDeviceName(device.name)) {
            issues.push('Nombre de dispositivo inválido');
        }
        
        if (device.ip && !this.isValidIP(device.ip)) {
            issues.push('Dirección IP inválida');
        }
        
        if (device.subnet && !this.isValidSubnetMask(device.subnet)) {
            issues.push('Máscara de subred inválida');
        }
        
        if (device.gateway && !this.isValidIP(device.gateway)) {
            issues.push('Gateway inválido');
        }
        
        if (device.dns && !this.isValidIP(device.dns)) {
            issues.push('DNS inválido');
        }
        
        if (device.mac && !this.isValidMAC(device.mac)) {
            issues.push('Dirección MAC inválida');
        }
        
        if (device.ports && !this.isValidPortRange(device.ports)) {
            issues.push('Rango de puertos inválido');
        }
        
        if (device.vlan && !this.isValidVLAN(device.vlan)) {
            issues.push('VLAN inválida');
        }
        
        // Validar interfaces si existen
        if (device.interfaces) {
            device.interfaces.forEach((interface_, index) => {
                const interfaceIssues = this.validateInterface(interface_);
                interfaceIssues.forEach(issue => {
                    issues.push(`Interfaz ${index + 1}: ${issue}`);
                });
            });
        }
        
        return issues;
    },

    /**
     * Valida que las subredes no se solapen
     */
    validateSubnetOverlap() {
        const issues = [];
        const subnets = [];
        
        this.app.state.devices.forEach(device => {
            if (device.ip && device.subnet) {
                subnets.push({
                    device: device.name,
                    network: this.getNetworkAddress(device.ip, device.subnet),
                    mask: device.subnet
                });
            }
        });
        
        // Verificar solapamientos
        for (let i = 0; i < subnets.length; i++) {
            for (let j = i + 1; j < subnets.length; j++) {
                if (this.subnetsOverlap(subnets[i], subnets[j])) {
                    issues.push({
                        type: 'warning',
                        category: 'Subredes',
                        message: `Posible solapamiento de subredes entre ${subnets[i].device} y ${subnets[j].device}`
                    });
                }
            }
        }
        
        return issues;
    },

    /**
     * Obtiene la dirección de red dado IP y máscara
     */
    getNetworkAddress(ip, mask) {
        const ipParts = ip.split('.').map(part => parseInt(part));
        const maskParts = mask.split('.').map(part => parseInt(part));
        
        return ipParts.map((part, i) => part & maskParts[i]).join('.');
    },

    /**
     * Verifica si dos subredes se solapan
     */
    subnetsOverlap(subnet1, subnet2) {
        // Implementación simplificada
        return subnet1.network === subnet2.network && subnet1.mask === subnet2.mask;
    },

    /**
     * Valida la seguridad de la configuración
     */
    validateSecurity() {
        const issues = [];
        
        // Verificar dispositivos sin firewall en DMZ
        const dmzDevices = this.app.state.devices.filter(d => d.layer === 'dmz');
        const firewalls = this.app.state.devices.filter(d => d.type === 'firewall');
        
        if (dmzDevices.length > 0 && firewalls.length === 0) {
            issues.push({
                type: 'warning',
                category: 'Seguridad',
                message: 'DMZ sin firewall detectado'
            });
        }
        
        // Verificar conexiones directas de internet a dispositivos internos
        const ispDevices = this.app.state.devices.filter(d => d.layer === 'isp');
        const internalDevices = this.app.state.devices.filter(d => 
            ['user', 'access', 'distribution'].includes(d.layer)
        );
        
        this.app.state.connections.forEach(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            
            if (device1 && device2) {
                const isISPConnection = device1.layer === 'isp' || device2.layer === 'isp';
                const isInternalConnection = 
                    ['user', 'access', 'distribution'].includes(device1.layer) ||
                    ['user', 'access', 'distribution'].includes(device2.layer);
                
                if (isISPConnection && isInternalConnection) {
                    issues.push({
                        type: 'error',
                        category: 'Seguridad',
                        message: `Conexión directa de ISP a red interna: ${device1.name} - ${device2.name}`,
                        connectionId: connection.id
                    });
                }
            }
        });
        
        return issues;
    },

    /**
     * Genera reporte completo de validación
     */
    generateValidationReport() {
        const allIssues = [];
        
        // Ejecutar todas las validaciones
        allIssues.push(...this.validateNetworkTopology());
        allIssues.push(...this.validateSubnetOverlap());
        allIssues.push(...this.validateSecurity());
        
        // Categorizar por severidad
        const report = {
            errors: allIssues.filter(issue => issue.type === 'error'),
            warnings: allIssues.filter(issue => issue.type === 'warning'),
            info: allIssues.filter(issue => issue.type === 'info'),
            total: allIssues.length,
            summary: {
                errorCount: allIssues.filter(issue => issue.type === 'error').length,
                warningCount: allIssues.filter(issue => issue.type === 'warning').length,
                infoCount: allIssues.filter(issue => issue.type === 'info').length
            }
        };
        
        return report;
    }
};

// Exportar para uso global
window.Validators = Validators;