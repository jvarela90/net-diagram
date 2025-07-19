/**
 * Device Manager - Gestión de dispositivos de red
 */

(function() {
    'use strict';

    window.DeviceManager = {
        // Almacén de dispositivos
        devices: new Map(),
        
        // Tipos de dispositivos disponibles
        deviceTypes: {
            router: {
                name: 'Router',
                icon: 'fa-route',
                category: 'networking',
                defaultPorts: 4,
                defaultLayer: 'core'
            },
            switch: {
                name: 'Switch',
                icon: 'fa-ethernet',
                category: 'networking',
                defaultPorts: 24,
                defaultLayer: 'access'
            },
            firewall: {
                name: 'Firewall',
                icon: 'fa-shield-alt',
                category: 'security',
                defaultPorts: 6,
                defaultLayer: 'dmz'
            },
            server: {
                name: 'Server',
                icon: 'fa-server',
                category: 'computing',
                defaultPorts: 2,
                defaultLayer: 'dmz'
            },
            workstation: {
                name: 'Workstation',
                icon: 'fa-desktop',
                category: 'endpoint',
                defaultPorts: 1,
                defaultLayer: 'user'
            },
            laptop: {
                name: 'Laptop',
                icon: 'fa-laptop',
                category: 'endpoint',
                defaultPorts: 1,
                defaultLayer: 'user'
            },
            accesspoint: {
                name: 'Access Point',
                icon: 'fa-wifi',
                category: 'wireless',
                defaultPorts: 1,
                defaultLayer: 'access'
            },
            phone: {
                name: 'IP Phone',
                icon: 'fa-phone',
                category: 'endpoint',
                defaultPorts: 1,
                defaultLayer: 'user'
            },
            printer: {
                name: 'Printer',
                icon: 'fa-print',
                category: 'endpoint',
                defaultPorts: 1,
                defaultLayer: 'user'
            },
            camera: {
                name: 'IP Camera',
                icon: 'fa-video',
                category: 'iot',
                defaultPorts: 1,
                defaultLayer: 'iot'
            }
        },

        // Inicializar módulo
        init: async function() {
            console.log('Inicializando DeviceManager...');
            
            // Cargar tipos de dispositivos personalizados si existen
            try {
                const response = await fetch('data/device-types.json');
                if (response.ok) {
                    const customTypes = await response.json();
                    Object.assign(this.deviceTypes, customTypes);
                }
            } catch (error) {
                console.warn('No se pudieron cargar tipos personalizados:', error);
            }

            // Inicializar panel de dispositivos
            this.initDevicePanel();
            
            // Configurar drag & drop
            this.setupDragAndDrop();
            
            return true;
        },

        // Inicializar panel de dispositivos
        initDevicePanel: function() {
            const panel = document.querySelector('.device-categories');
            if (!panel) return;

            // Agrupar dispositivos por categoría
            const categories = {};
            Object.entries(this.deviceTypes).forEach(([key, type]) => {
                if (!categories[type.category]) {
                    categories[type.category] = [];
                }
                categories[type.category].push({ key, ...type });
            });

            // Crear HTML para cada categoría
            let html = '';
            Object.entries(categories).forEach(([category, devices]) => {
                html += `
                    <div class="device-category">
                        <h4>${this.formatCategoryName(category)}</h4>
                        <div class="device-list">
                `;
                
                devices.forEach(device => {
                    html += `
                        <div class="device-item" draggable="true" data-device-type="${device.key}">
                            <i class="fas ${device.icon}"></i>
                            <span>${device.name}</span>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            });

            panel.innerHTML = html;
        },

        // Formatear nombre de categoría
        formatCategoryName: function(category) {
            const names = {
                networking: 'Redes',
                security: 'Seguridad',
                computing: 'Computación',
                endpoint: 'Dispositivos Finales',
                wireless: 'Inalámbrico',
                iot: 'IoT'
            };
            return names[category] || category;
        },

        // Configurar drag & drop
        setupDragAndDrop: function() {
            // Dispositivos arrastrables
            document.querySelectorAll('.device-item').forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('deviceType', e.target.dataset.deviceType);
                    e.target.classList.add('dragging');
                });

                item.addEventListener('dragend', (e) => {
                    e.target.classList.remove('dragging');
                });
            });

            // Canvas como zona de drop
            const canvas = document.getElementById('networkCanvas');
            if (canvas) {
                canvas.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                });

                canvas.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const deviceType = e.dataTransfer.getData('deviceType');
                    if (deviceType) {
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        this.createDevice(deviceType, x, y);
                    }
                });
            }
        },

        // Crear dispositivo
        createDevice: function(type, x, y, properties = {}) {
            const deviceType = this.deviceTypes[type];
            if (!deviceType) {
                console.error('Tipo de dispositivo no válido:', type);
                return null;
            }

            const id = this.generateId();
            const device = {
                id,
                type,
                name: properties.name || `${deviceType.name}-${id}`,
                x: x || 100,
                y: y || 100,
                width: 80,
                height: 80,
                layer: properties.layer || deviceType.defaultLayer,
                status: 'active',
                properties: {
                    ip: properties.ip || '',
                    mac: properties.mac || '',
                    model: properties.model || '',
                    location: properties.location || '',
                    description: properties.description || '',
                    ports: properties.ports || deviceType.defaultPorts,
                    vlan: properties.vlan || '',
                    ...properties
                },
                connections: [],
                selected: false
            };

            this.devices.set(id, device);
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('device:created', { 
                detail: device 
            }));

            // Redibujar
            if (window.CanvasManager) {
                window.CanvasManager.render();
            }

            return device;
        },

        // Generar ID único
        generateId: function() {
            return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        // Obtener dispositivo por ID
        getDevice: function(id) {
            return this.devices.get(id);
        },

        // Obtener todos los dispositivos
        getAllDevices: function() {
            return Array.from(this.devices.values());
        },

        // Actualizar dispositivo
        updateDevice: function(id, updates) {
            const device = this.devices.get(id);
            if (!device) return false;

            // Actualizar propiedades
            Object.assign(device, updates);
            if (updates.properties) {
                Object.assign(device.properties, updates.properties);
            }

            // Disparar evento
            document.dispatchEvent(new CustomEvent('device:updated', { 
                detail: device 
            }));

            // Redibujar
            if (window.CanvasManager) {
                window.CanvasManager.render();
            }

            return true;
        },

        // Eliminar dispositivo
        removeDevice: function(id) {
            const device = this.devices.get(id);
            if (!device) return false;

            // Eliminar conexiones asociadas
            if (window.ConnectionManager) {
                device.connections.forEach(connId => {
                    window.ConnectionManager.removeConnection(connId);
                });
            }

            this.devices.delete(id);

            // Disparar evento
            document.dispatchEvent(new CustomEvent('device:removed', { 
                detail: { id } 
            }));

            // Redibujar
            if (window.CanvasManager) {
                window.CanvasManager.render();
            }

            return true;
        },

        // Mover dispositivo
        moveDevice: function(id, x, y) {
            const device = this.devices.get(id);
            if (!device) return false;

            device.x = x;
            device.y = y;

            // Actualizar conexiones
            if (window.ConnectionManager) {
                window.ConnectionManager.updateDeviceConnections(id);
            }

            return true;
        },

        // Seleccionar dispositivo
        selectDevice: function(id, multi = false) {
            if (!multi) {
                // Deseleccionar todos
                this.devices.forEach(device => {
                    device.selected = false;
                });
            }

            const device = this.devices.get(id);
            if (device) {
                device.selected = true;
                document.dispatchEvent(new CustomEvent('device:selected', { 
                    detail: device 
                }));
            }
        },

        // Obtener dispositivos seleccionados
        getSelectedDevices: function() {
            return Array.from(this.devices.values()).filter(d => d.selected);
        },

        // Eliminar dispositivos seleccionados
        deleteSelected: function() {
            const selected = this.getSelectedDevices();
            selected.forEach(device => {
                this.removeDevice(device.id);
            });
        },

        // Limpiar todos los dispositivos
        clear: function() {
            this.devices.clear();
            if (window.CanvasManager) {
                window.CanvasManager.render();
            }
        },

        // Exportar dispositivos
        export: function() {
            return Array.from(this.devices.values()).map(device => ({
                ...device,
                connections: undefined // Las conexiones se exportan por separado
            }));
        },

        // Importar dispositivos
        import: function(devices) {
            if (!Array.isArray(devices)) return;

            devices.forEach(deviceData => {
                const device = {
                    ...deviceData,
                    connections: []
                };
                this.devices.set(device.id, device);
            });

            // Redibujar
            if (window.CanvasManager) {
                window.CanvasManager.render();
            }
        },

        // Buscar dispositivos en un área
        getDevicesInArea: function(x1, y1, x2, y2) {
            const devices = [];
            this.devices.forEach(device => {
                if (device.x >= x1 && device.x <= x2 &&
                    device.y >= y1 && device.y <= y2) {
                    devices.push(device);
                }
            });
            return devices;
        },

        // Obtener dispositivo en coordenadas
        getDeviceAt: function(x, y) {
            for (const device of this.devices.values()) {
                if (x >= device.x && x <= device.x + device.width &&
                    y >= device.y && y <= device.y + device.height) {
                    return device;
                }
            }
            return null;
        }
    };

    // Exponer globalmente
    window.DeviceManager = window.DeviceManager;

})();