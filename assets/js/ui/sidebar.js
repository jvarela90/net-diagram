/**
 * Sidebar - Gestión del panel lateral
 */

const Sidebar = {
    app: null,
    currentTab: 'devices',

    /**
     * Inicializa el sidebar
     */
    init(app) {
        this.app = app;
        console.log('✓ Sidebar inicializado');
    },

    /**
     * Renderiza el contenido del sidebar
     */
    render() {
        this.renderDevicesTab();
        this.renderTemplatesTab();
        this.renderLayersTab();
        this.setupDragAndDrop();
    },

    /**
     * Cambia de pestaña en el sidebar
     */
    switchTab(tabName) {
        // Actualizar botones de pestañas
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Actualizar contenido de pestañas
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    },

    /**
     * Renderiza la pestaña de dispositivos
     */
    renderDevicesTab() {
        const deviceCategories = document.getElementById('device-categories');
        if (!deviceCategories) return;

        const categories = this.getDeviceCategories();
        
        deviceCategories.innerHTML = categories.map(category => `
            <div class="device-category">
                <div class="category-header" onclick="Sidebar.toggleCategory(this)">
                    <h3>${category.icon} ${category.name}</h3>
                    <span class="category-toggle">▼</span>
                </div>
                <div class="category-devices">
                    ${category.devices.map(device => `
                        <div class="device-item" draggable="true" data-device-type="${device.type}">
                            <div class="device-icon ${device.type}-icon">${device.icon}</div>
                            <div class="device-info">
                                <div class="device-name">${device.name}</div>
                                <div class="device-description">${device.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        this.setupDeviceItemEvents();
    },

    /**
     * Configura eventos para los elementos de dispositivos
     */
    setupDeviceItemEvents() {
        document.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    },

    /**
     * Maneja el inicio del arrastre
     */
    handleDragStart(e) {
        const deviceType = e.target.closest('.device-item').dataset.deviceType;
        DeviceManager.setDraggedDeviceType(deviceType);
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
    },

    /**
     * Maneja el fin del arrastre
     */
    handleDragEnd(e) {
        e.target.style.opacity = '1';
    },

    /**
     * Configura drag and drop
     */
    setupDragAndDrop() {
        // Los eventos ya se configuran en DeviceManager y en setupDeviceItemEvents
    },

    /**
     * Alterna la visibilidad de una categoría
     */
    toggleCategory(header) {
        header.classList.toggle('collapsed');
        const devices = header.nextElementSibling;
        
        if (header.classList.contains('collapsed')) {
            devices.style.maxHeight = '0';
            header.querySelector('.category-toggle').textContent = '▶';
        } else {
            devices.style.maxHeight = '300px';
            header.querySelector('.category-toggle').textContent = '▼';
        }
    },

    /**
     * Filtra dispositivos según el término de búsqueda
     */
    filterDevices(searchTerm) {
        const deviceItems = document.querySelectorAll('.device-item');
        const term = searchTerm.toLowerCase();
        
        deviceItems.forEach(item => {
            const deviceName = item.querySelector('.device-name').textContent.toLowerCase();
            const deviceDesc = item.querySelector('.device-description').textContent.toLowerCase();
            
            if (deviceName.includes(term) || deviceDesc.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        // Mostrar/ocultar categorías según si tienen dispositivos visibles
        document.querySelectorAll('.device-category').forEach(category => {
            const visibleDevices = category.querySelectorAll('.device-item[style*="flex"]');
            const allDevices = category.querySelectorAll('.device-item');
            
            if (term === '' || visibleDevices.length > 0) {
                category.style.display = 'block';
            } else if (allDevices.length > 0 && visibleDevices.length === 0) {
                category.style.display = 'none';
            }
        });
    },

    /**
     * Renderiza la pestaña de plantillas
     */
    renderTemplatesTab() {
        const templatesGrid = document.getElementById('templates-grid');
        if (!templatesGrid) return;

        const templates = this.getNetworkTemplates();
        
        templatesGrid.innerHTML = templates.map(template => `
            <div class="template-card" onclick="NetworkTemplates.load('${template.id}')">
                <div class="template-title">${template.icon} ${template.name}</div>
                <div class="template-description">${template.description}</div>
                <div class="template-devices">
                    ${template.devices.map(device => `
                        <span class="template-device">${device}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderiza la pestaña de capas
     */
    renderLayersTab() {
        const layerControls = document.getElementById('layer-controls');
        if (!layerControls) return;

        const layers = this.getNetworkLayers();
        
        layerControls.innerHTML = layers.map(layer => `
            <div class="layer-item ${layer.id === this.app.state.currentLayer ? 'active' : ''}" 
                 data-layer="${layer.id}">
                <span>${layer.icon} ${layer.name}</span>
                <input type="checkbox" 
                       ${this.app.state.layerVisibility[layer.id] ? 'checked' : ''}
                       onchange="LayerManager.toggleVisibility('${layer.id}', this.checked)">
            </div>
        `).join('');

        // Configurar eventos de click para seleccionar capa
        layerControls.querySelectorAll('.layer-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const layerId = item.dataset.layer;
                    this.selectLayer(layerId);
                }
            });
        });
    },

    /**
     * Selecciona una capa
     */
    selectLayer(layerId) {
        // Actualizar elementos activos
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-layer="${layerId}"]`).classList.add('active');
        
        // Actualizar selector de capa actual
        const currentLayerSelect = document.getElementById('current-layer');
        if (currentLayerSelect) {
            currentLayerSelect.value = layerId;
        }
        
        LayerManager.setCurrentLayer(layerId);
    },

    /**
     * Obtiene las categorías de dispositivos
     */
    getDeviceCategories() {
        return [
            {
                name: 'INFRAESTRUCTURA DE RED',
                icon: '🔧',
                devices: [
                    { type: 'core-router', icon: 'CR', name: 'Core Router', description: 'Router de núcleo principal' },
                    { type: 'edge-router', icon: 'ER', name: 'Edge Router', description: 'Router de borde/frontera' },
                    { type: 'router', icon: 'R', name: 'Router', description: 'Router estándar' },
                    { type: 'l3-switch', icon: 'L3', name: 'Switch L3', description: 'Switch de capa 3' },
                    { type: 'switch', icon: 'SW', name: 'Switch L2', description: 'Switch de capa 2' },
                    { type: 'hub', icon: 'H', name: 'Hub', description: 'Concentrador de red' }
                ]
            },
            {
                name: 'SEGURIDAD',
                icon: '🛡️',
                devices: [
                    { type: 'firewall', icon: 'FW', name: 'Firewall', description: 'Cortafuegos' },
                    { type: 'ips', icon: 'IPS', name: 'IPS', description: 'Sistema prevención intrusos' },
                    { type: 'waf', icon: 'WAF', name: 'WAF', description: 'Web Application Firewall' },
                    { type: 'vpn', icon: 'VPN', name: 'VPN Gateway', description: 'Puerta de enlace VPN' }
                ]
            },
            {
                name: 'INALÁMBRICO',
                icon: '📡',
                devices: [
                    { type: 'ap', icon: 'AP', name: 'Access Point', description: 'Punto de acceso WiFi' },
                    { type: 'controller', icon: 'WC', name: 'WiFi Controller', description: 'Controlador inalámbrico' },
                    { type: 'modem', icon: 'M', name: 'Módem', description: 'Módem ADSL/Cable' }
                ]
            },
            {
                name: 'SERVIDORES',
                icon: '🖥️',
                devices: [
                    { type: 'server', icon: 'SV', name: 'Servidor', description: 'Servidor genérico' },
                    { type: 'web-server', icon: 'WS', name: 'Servidor Web', description: 'Apache/Nginx/IIS' },
                    { type: 'db-server', icon: 'DB', name: 'Servidor BD', description: 'Base de datos' },
                    { type: 'dns-server', icon: 'DNS', name: 'Servidor DNS', description: 'Servidor de nombres' },
                    { type: 'mail-server', icon: 'MS', name: 'Servidor Mail', description: 'Correo electrónico' }
                ]
            },
            {
                name: 'DISPOSITIVOS FINALES',
                icon: '💻',
                devices: [
                    { type: 'pc', icon: 'PC', name: 'PC Escritorio', description: 'Computadora personal' },
                    { type: 'notebook', icon: 'NB', name: 'Laptop', description: 'Computadora portátil' },
                    { type: 'printer', icon: 'PR', name: 'Impresora', description: 'Impresora de red' },
                    { type: 'phone', icon: 'PH', name: 'Teléfono IP', description: 'VoIP' }
                ]
            },
            {
                name: 'ALMACENAMIENTO',
                icon: '💾',
                devices: [
                    { type: 'nas', icon: 'NAS', name: 'NAS', description: 'Network Attached Storage' },
                    { type: 'san', icon: 'SAN', name: 'SAN', description: 'Storage Area Network' }
                ]
            },
            {
                name: 'IoT',
                icon: '🌐',
                devices: [
                    { type: 'iot-device', icon: 'IoT', name: 'Dispositivo IoT', description: 'Internet de las cosas' },
                    { type: 'sensor', icon: 'SN', name: 'Sensor', description: 'Sensor inteligente' },
                    { type: 'camera', icon: 'CAM', name: 'Cámara IP', description: 'Videovigilancia' }
                ]
            },
            {
                name: 'BALANCEADORES',
                icon: '⚖️',
                devices: [
                    { type: 'loadbalancer', icon: 'LB', name: 'Load Balancer', description: 'Balanceador de carga' }
                ]
            }
        ];
    },

    /**
     * Obtiene las plantillas de red disponibles
     */
    getNetworkTemplates() {
        return [
            {
                id: 'basic-enterprise',
                name: 'Red Empresarial Básica',
                icon: '🏢',
                description: 'Topología básica empresarial con router, switch y PCs',
                devices: ['1 Router', '2 Switches', '4 PCs']
            },
            {
                id: 'dmz-network',
                name: 'Red con DMZ',
                icon: '🛡️',
                description: 'Red empresarial con zona desmilitarizada para servicios públicos',
                devices: ['1 Firewall', '2 Switches', '2 Servidores']
            },
            {
                id: 'campus-network',
                name: 'Red de Campus',
                icon: '🏫',
                description: 'Red jerárquica para campus universitario o corporativo',
                devices: ['Core', 'Distribución', 'Acceso']
            },
            {
                id: 'datacenter',
                name: 'Data Center',
                icon: '🏭',
                description: 'Infraestructura de centro de datos con redundancia',
                devices: ['Core Switches', 'Servidores', 'Storage']
            },
            {
                id: 'star-topology',
                name: 'Topología Estrella',
                icon: '⭐',
                description: 'Topología en estrella simple con switch central',
                devices: ['1 Switch', '6 PCs']
            },
            {
                id: 'mesh-network',
                name: 'Red Mesh',
                icon: '🕸️',
                description: 'Red mallada con múltiples rutas de redundancia',
                devices: ['4 Routers', 'Múltiples enlaces']
            },
            {
                id: 'iot-network',
                name: 'Red IoT',
                icon: '🌐',
                description: 'Infraestructura para dispositivos IoT',
                devices: ['Gateway IoT', 'Sensores', 'Cámaras']
            },
            {
                id: 'hybrid-cloud',
                name: 'Red Híbrida',
                icon: '☁️',
                description: 'Conexión on-premise con servicios en la nube',
                devices: ['VPN Gateway', 'Firewall', 'Cloud Connect']
            }
        ];
    },

    /**
     * Obtiene las capas de red disponibles
     */
    getNetworkLayers() {
        return [
            { id: 'isp', name: 'ISP Layer', icon: '🌍' },
            { id: 'wan', name: 'WAN Layer', icon: '🌐' },
            { id: 'core', name: 'Core Layer', icon: '⚡' },
            { id: 'distribution', name: 'Distribution Layer', icon: '📊' },
            { id: 'access', name: 'Access Layer', icon: '🔌' },
            { id: 'dmz', name: 'DMZ Layer', icon: '🛡️' },
            { id: 'user', name: 'User Layer', icon: '👥' },
            { id: 'iot', name: 'IoT Layer', icon: '🌐' }
        ];
    },

    /**
     * Actualiza el indicador de capa actual
     */
    updateCurrentLayerIndicator(layerId) {
        const layer = this.getNetworkLayers().find(l => l.id === layerId);
        if (layer) {
            const indicator = document.getElementById('layer-indicator');
            if (indicator) {
                indicator.textContent = `${layer.icon} ${layer.name}`;
            }
        }
    },

    /**
     * Actualiza las estadísticas del sidebar
     */
    updateStats() {
        // Actualizar contadores por tipo de dispositivo
        this.updateDeviceTypeStats();
        
        // Actualizar contadores por capa
        this.updateLayerStats();
    },

    /**
     * Actualiza estadísticas por tipo de dispositivo
     */
    updateDeviceTypeStats() {
        const deviceCounts = {};
        
        this.app.state.devices.forEach(device => {
            deviceCounts[device.type] = (deviceCounts[device.type] || 0) + 1;
        });

        // Actualizar badges en los elementos de dispositivos
        document.querySelectorAll('.device-item').forEach(item => {
            const deviceType = item.dataset.deviceType;
            const count = deviceCounts[deviceType] || 0;
            
            // Remover badge anterior si existe
            const existingBadge = item.querySelector('.device-count-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // Añadir nuevo badge si hay dispositivos
            if (count > 0) {
                const badge = document.createElement('div');
                badge.className = 'device-count-badge';
                badge.textContent = count;
                badge.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: bold;
                `;
                item.style.position = 'relative';
                item.appendChild(badge);
            }
        });
    },

    /**
     * Actualiza estadísticas por capa
     */
    updateLayerStats() {
        const layerCounts = {};
        
        this.app.state.devices.forEach(device => {
            layerCounts[device.layer] = (layerCounts[device.layer] || 0) + 1;
        });

        // Actualizar contadores en los elementos de capa
        document.querySelectorAll('.layer-item').forEach(item => {
            const layerId = item.dataset.layer;
            const count = layerCounts[layerId] || 0;
            
            // Actualizar o crear badge de conteo
            let badge = item.querySelector('.layer-count-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'layer-count-badge';
                badge.style.cssText = `
                    background: #3498db;
                    color: white;
                    border-radius: 12px;
                    padding: 2px 8px;
                    font-size: 11px;
                    margin-left: 8px;
                `;
                item.querySelector('span').appendChild(badge);
            }
            
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        });
    },

    /**
     * Expande todas las categorías
     */
    expandAllCategories() {
        document.querySelectorAll('.category-header').forEach(header => {
            if (header.classList.contains('collapsed')) {
                this.toggleCategory(header);
            }
        });
    },

    /**
     * Colapsa todas las categorías
     */
    collapseAllCategories() {
        document.querySelectorAll('.category-header').forEach(header => {
            if (!header.classList.contains('collapsed')) {
                this.toggleCategory(header);
            }
        });
    },

    /**
     * Obtiene dispositivos favoritos del usuario
     */
    getFavoriteDevices() {
        try {
            const favorites = localStorage.getItem('networkDiagramFavorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Guarda dispositivos favoritos
     */
    saveFavoriteDevices(favorites) {
        try {
            localStorage.setItem('networkDiagramFavorites', JSON.stringify(favorites));
        } catch (e) {
            console.warn('No se pueden guardar favoritos');
        }
    },

    /**
     * Añade o quita un dispositivo de favoritos
     */
    toggleFavoriteDevice(deviceType) {
        const favorites = this.getFavoriteDevices();
        const index = favorites.indexOf(deviceType);
        
        if (index === -1) {
            favorites.push(deviceType);
            Notifications.show('Dispositivo añadido a favoritos', 'success');
        } else {
            favorites.splice(index, 1);
            Notifications.show('Dispositivo quitado de favoritos', 'info');
        }
        
        this.saveFavoriteDevices(favorites);
        this.renderFavoritesSection();
    },

    /**
     * Renderiza la sección de favoritos
     */
    renderFavoritesSection() {
        const favorites = this.getFavoriteDevices();
        if (favorites.length === 0) return;

        const devicesTab = document.getElementById('devices-tab');
        if (!devicesTab) return;

        // Verificar si ya existe la sección de favoritos
        let favoritesSection = devicesTab.querySelector('.favorites-section');
        
        if (!favoritesSection) {
            favoritesSection = document.createElement('div');
            favoritesSection.className = 'favorites-section';
            
            // Insertar después del search box
            const searchBox = devicesTab.querySelector('.search-box');
            searchBox.parentNode.insertBefore(favoritesSection, searchBox.nextSibling);
        }

        // Obtener datos de dispositivos favoritos
        const allDevices = this.getDeviceCategories().flatMap(cat => cat.devices);
        const favoriteDevices = favorites.map(fav => 
            allDevices.find(device => device.type === fav)
        ).filter(Boolean);

        if (favoriteDevices.length > 0) {
            favoritesSection.innerHTML = `
                <div class="device-category">
                    <div class="category-header" onclick="Sidebar.toggleCategory(this)">
                        <h3>⭐ FAVORITOS</h3>
                        <span class="category-toggle">▼</span>
                    </div>
                    <div class="category-devices">
                        ${favoriteDevices.map(device => `
                            <div class="device-item" draggable="true" data-device-type="${device.type}">
                                <div class="device-icon ${device.type}-icon">${device.icon}</div>
                                <div class="device-info">
                                    <div class="device-name">${device.name}</div>
                                    <div class="device-description">${device.description}</div>
                                </div>
                                <button class="favorite-btn active" onclick="Sidebar.toggleFavoriteDevice('${device.type}')" title="Quitar de favoritos">⭐</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // Reconfigurar eventos para los nuevos elementos
            this.setupDeviceItemEvents();
        } else {
            favoritesSection.remove();
        }
    },

    /**
     * Añade botones de favoritos a todos los dispositivos
     */
    addFavoriteButtons() {
        const favorites = this.getFavoriteDevices();
        
        document.querySelectorAll('.device-item').forEach(item => {
            const deviceType = item.dataset.deviceType;
            const isFavorite = favorites.includes(deviceType);
            
            // No añadir botón si ya existe
            if (item.querySelector('.favorite-btn')) return;
            
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = `favorite-btn ${isFavorite ? 'active' : ''}`;
            favoriteBtn.innerHTML = isFavorite ? '⭐' : '☆';
            favoriteBtn.title = isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos';
            favoriteBtn.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: none;
                border: none;
                font-size: 14px;
                cursor: pointer;
                opacity: 0.7;
            `;
            
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleFavoriteDevice(deviceType);
            });
            
            item.style.position = 'relative';
            item.appendChild(favoriteBtn);
        });
    },

    /**
     * Busca dispositivos por categoría
     */
    searchInCategory(categoryName, searchTerm) {
        const categories = this.getDeviceCategories();
        const category = categories.find(cat => 
            cat.name.toLowerCase().includes(categoryName.toLowerCase())
        );
        
        if (!category) return [];
        
        return category.devices.filter(device => 
            device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    },

    /**
     * Exporta la configuración del sidebar
     */
    exportConfig() {
        return {
            currentTab: this.currentTab,
            favorites: this.getFavoriteDevices(),
            collapsedCategories: Array.from(document.querySelectorAll('.category-header.collapsed'))
                .map(header => header.querySelector('h3').textContent.trim())
        };
    },

    /**
     * Importa la configuración del sidebar
     */
    importConfig(config) {
        if (config.currentTab) {
            this.switchTab(config.currentTab);
        }
        
        if (config.favorites) {
            this.saveFavoriteDevices(config.favorites);
        }
        
        // Aplicar estados de categorías colapsadas después de un breve delay
        setTimeout(() => {
            if (config.collapsedCategories) {
                config.collapsedCategories.forEach(categoryName => {
                    const header = Array.from(document.querySelectorAll('.category-header'))
                        .find(h => h.querySelector('h3').textContent.trim() === categoryName);
                    if (header && !header.classList.contains('collapsed')) {
                        this.toggleCategory(header);
                    }
                });
            }
        }, 100);
    }
};

// Exportar para uso global
//window.Sidebar = Sidebar;
window.SidebarManager = Sidebar;