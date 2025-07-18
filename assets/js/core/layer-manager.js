/**
 * LayerManager - Gestión de capas de red
 * VERSIÓN CORREGIDA - Soluciona el error "setCurrentLayer is not a function"
 */

class LayerManager {
    constructor() {
        this.initialized = false;
        this.defaultLayers = [
            { 
                id: 'isp', 
                name: 'ISP', 
                description: 'Proveedor de Servicios de Internet',
                color: '#FF6B6B', 
                visible: true, 
                order: 1,
                icon: '🌐'
            },
            { 
                id: 'wan', 
                name: 'WAN', 
                description: 'Red de Área Amplia',
                color: '#4ECDC4', 
                visible: true, 
                order: 2,
                icon: '🔗'
            },
            { 
                id: 'core', 
                name: 'Core', 
                description: 'Núcleo de la Red',
                color: '#45B7D1', 
                visible: true, 
                order: 3,
                icon: '⭐'
            },
            { 
                id: 'distribution', 
                name: 'Distribution', 
                description: 'Capa de Distribución',
                color: '#96CEB4', 
                visible: true, 
                order: 4,
                icon: '📊'
            },
            { 
                id: 'access', 
                name: 'Access', 
                description: 'Capa de Acceso',
                color: '#FFEAA7', 
                visible: true, 
                order: 5,
                icon: '🔌'
            },
            { 
                id: 'dmz', 
                name: 'DMZ', 
                description: 'Zona Desmilitarizada',
                color: '#DDA0DD', 
                visible: true, 
                order: 6,
                icon: '🛡️'
            },
            { 
                id: 'user', 
                name: 'User', 
                description: 'Dispositivos de Usuario',
                color: '#98D8C8', 
                visible: true, 
                order: 7,
                icon: '👤'
            },
            { 
                id: 'iot', 
                name: 'IoT', 
                description: 'Internet de las Cosas',
                color: '#F7DC6F', 
                visible: true, 
                order: 8,
                icon: '📱'
            }
        ];
        
        this.currentLayer = 'core';
        this.eventListeners = new Map();
        this.animationFrameId = null;
        
        // Bind de métodos para evitar problemas de contexto
        this.setCurrentLayer = this.setCurrentLayer.bind(this);
        this.toggleLayerVisibility = this.toggleLayerVisibility.bind(this);
        this.onLayerClick = this.onLayerClick.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        
        console.log('🏗️ LayerManager constructor ejecutado');
    }

    async initialize() {
        if (this.initialized) {
            console.log('✅ LayerManager ya inicializado');
            return;
        }

        try {
            console.log('🔧 Inicializando LayerManager...');
            
            // Verificar dependencias
            await this.checkDependencies();
            
            // Inicializar capas en el StateManager
            await this.initializeLayers();
            
            // Crear interfaz de usuario
            await this.createLayerUI();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar capa inicial
            this.setCurrentLayer(this.currentLayer);
            
            // Marcar como inicializado
            this.initialized = true;
            
            console.log('✅ LayerManager inicializado correctamente');
            
            // Notificar inicialización completa
            this.emit('initialized');
            
        } catch (error) {
            console.error('❌ Error inicializando LayerManager:', error);
            throw new Error(`LayerManager initialization failed: ${error.message}`);
        }
    }

    async checkDependencies() {
        // Verificar StateManager
        if (!window.StateManager) {
            throw new Error('StateManager no está disponible');
        }
        
        if (!window.StateManager.initialized) {
            console.log('⏳ Esperando inicialización de StateManager...');
            await this.waitForStateManager();
        }
        
        console.log('✅ Dependencias verificadas');
    }

    async waitForStateManager() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout esperando StateManager'));
            }, 5000);
            
            const checkInterval = setInterval(() => {
                if (window.StateManager && window.StateManager.initialized) {
                    clearInterval(checkInterval);
                    clearTimeout(timeout);
                    resolve();
                }
            }, 100);
        });
    }

    async initializeLayers() {
        console.log('📋 Inicializando capas por defecto...');
        
        // Cargar capas guardadas o usar por defecto
        let layers = this.loadSavedLayers();
        if (!layers || layers.length === 0) {
            layers = this.defaultLayers;
        }
        
        // Convertir a Map y almacenar en StateManager
        const layersMap = new Map();
        layers.forEach(layer => {
            layersMap.set(layer.id, {
                ...layer,
                devices: [], // Dispositivos en esta capa
                connections: [] // Conexiones en esta capa
            });
        });
        
        // Actualizar estado global
        window.StateManager.setState({ layers: layersMap });
        
        console.log(`✅ ${layers.length} capas inicializadas`);
    }

    async createLayerUI() {
        console.log('🎨 Creando interfaz de capas...');
        
        // Buscar o crear contenedor de sidebar
        let sidebar = document.getElementById('main-sidebar');
        if (!sidebar) {
            sidebar = document.getElementById('sidebar');
        }
        
        if (!sidebar) {
            console.warn('⚠️ Sidebar no encontrado, creando contenedor temporal');
            sidebar = this.createTemporarySidebar();
        }
        
        // Crear sección de capas
        this.createLayerSection(sidebar);
        
        // Renderizar lista de capas
        await this.renderLayerList();
        
        console.log('✅ Interfaz de capas creada');
    }

    createTemporarySidebar() {
        const sidebar = document.createElement('div');
        sidebar.id = 'temp-sidebar';
        sidebar.className = 'sidebar temporary';
        sidebar.style.cssText = `
            position: fixed;
            top: 60px;
            left: 0;
            width: 300px;
            height: calc(100vh - 60px);
            background: #f8f9fa;
            border-right: 1px solid #dee2e6;
            z-index: 1000;
            overflow-y: auto;
            padding: 16px;
        `;
        
        document.body.appendChild(sidebar);
        return sidebar;
    }

    createLayerSection(sidebar) {
        // Eliminar sección existente si existe
        const existing = sidebar.querySelector('#layer-section');
        if (existing) {
            existing.remove();
        }
        
        // Crear nueva sección
        const layerSection = document.createElement('div');
        layerSection.id = 'layer-section';
        layerSection.className = 'layer-section';
        
        layerSection.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">
                    <span class="section-icon">📋</span>
                    Capas de Red
                </h3>
                <button class="collapse-btn" id="layer-collapse-btn" title="Colapsar sección">
                    <span>−</span>
                </button>
            </div>
            <div class="section-content" id="layer-content">
                <div class="layer-controls">
                    <button class="btn btn-sm" id="add-layer-btn" title="Agregar capa">
                        <span>+</span> Nueva Capa
                    </button>
                    <button class="btn btn-sm" id="layer-settings-btn" title="Configuración de capas">
                        <span>⚙️</span>
                    </button>
                </div>
                <div id="layer-list" class="layer-list"></div>
                <div class="layer-info" id="layer-info">
                    <small class="text-muted">
                        Capa actual: <span id="current-layer-name">Core</span>
                    </small>
                </div>
            </div>
        `;
        
        sidebar.insertBefore(layerSection, sidebar.firstChild);
        
        // Configurar eventos de la sección
        this.setupSectionEvents(layerSection);
    }

    setupSectionEvents(section) {
        // Botón de colapsar
        const collapseBtn = section.querySelector('#layer-collapse-btn');
        const content = section.querySelector('#layer-content');
        
        if (collapseBtn && content) {
            collapseBtn.addEventListener('click', () => {
                const isCollapsed = content.style.display === 'none';
                content.style.display = isCollapsed ? 'block' : 'none';
                collapseBtn.querySelector('span').textContent = isCollapsed ? '−' : '+';
                collapseBtn.title = isCollapsed ? 'Colapsar sección' : 'Expandir sección';
            });
        }
        
        // Botón agregar capa
        const addBtn = section.querySelector('#add-layer-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddLayerDialog());
        }
        
        // Botón configuración
        const settingsBtn = section.querySelector('#layer-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showLayerSettings());
        }
    }

    async renderLayerList() {
        const layerList = document.getElementById('layer-list');
        if (!layerList) {
            console.warn('⚠️ Contenedor de lista de capas no encontrado');
            return;
        }
        
        // Obtener capas del estado
        const state = window.StateManager.getState();
        const layers = Array.from(state.layers.values()).sort((a, b) => a.order - b.order);
        
        // Limpiar lista
        layerList.innerHTML = '';
        
        // Crear elementos de capa
        layers.forEach(layer => {
            const layerElement = this.createLayerElement(layer);
            layerList.appendChild(layerElement);
        });
        
        console.log(`🔄 Lista de capas renderizada (${layers.length} capas)`);
    }

    createLayerElement(layer) {
        const isActive = layer.id === this.currentLayer;
        
        const element = document.createElement('div');
        element.className = `layer-item ${isActive ? 'active' : ''}`;
        element.dataset.layerId = layer.id;
        
        element.innerHTML = `
            <div class="layer-main" data-layer-id="${layer.id}">
                <span class="layer-icon">${layer.icon || '📄'}</span>
                <div class="layer-info">
                    <span class="layer-name">${layer.name}</span>
                    <small class="layer-description">${layer.description || ''}</small>
                </div>
                <div class="layer-actions">
                    <div class="visibility-toggle">
                        <input type="checkbox" 
                               id="visibility-${layer.id}" 
                               ${layer.visible ? 'checked' : ''} 
                               data-layer-id="${layer.id}">
                        <label for="visibility-${layer.id}" title="Mostrar/Ocultar capa"></label>
                    </div>
                    <span class="layer-color" 
                          style="background-color: ${layer.color}"
                          title="Color de la capa"></span>
                </div>
            </div>
            <div class="layer-stats">
                <small class="text-muted">
                    ${this.getLayerDeviceCount(layer.id)} dispositivos
                </small>
            </div>
        `;
        
        // Eventos del elemento
        this.setupLayerElementEvents(element, layer);
        
        return element;
    }

    setupLayerElementEvents(element, layer) {
        // Click en la capa para seleccionar
        const mainElement = element.querySelector('.layer-main');
        mainElement.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                this.onLayerClick(layer.id);
            }
        });
        
        // Checkbox de visibilidad
        const checkbox = element.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.onVisibilityChange(layer.id, e.target.checked);
        });
        
        // Hover effects
        element.addEventListener('mouseenter', () => {
            element.classList.add('hover');
            this.highlightLayerDevices(layer.id);
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('hover');
            this.clearLayerHighlight();
        });
    }

    // Métodos principales de la API pública
    setCurrentLayer(layerId) {
        if (!this.initialized) {
            console.warn('⚠️ LayerManager no inicializado, almacenando para después...');
            this.currentLayer = layerId;
            return false;
        }
        
        const state = window.StateManager.getState();
        if (!state.layers.has(layerId)) {
            console.error(`❌ Capa ${layerId} no existe`);
            return false;
        }
        
        const prevLayer = this.currentLayer;
        this.currentLayer = layerId;
        
        // Actualizar estado global
        window.StateManager.setState({ currentLayer: layerId });
        
        // Actualizar UI
        this.updateLayerUI();
        
        // Emitir evento
        this.emit('layerChanged', { previous: prevLayer, current: layerId });
        
        console.log(`📋 Capa actual cambiada a: ${layerId}`);
        return true;
    }

    getCurrentLayer() {
        return this.currentLayer;
    }

    getLayer(layerId) {
        const state = window.StateManager.getState();
        return state.layers.get(layerId);
    }

    getAllLayers() {
        const state = window.StateManager.getState();
        return Array.from(state.layers.values()).sort((a, b) => a.order - b.order);
    }

    toggleLayerVisibility(layerId) {
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.error(`❌ Capa ${layerId} no existe`);
            return false;
        }
        
        const newVisibility = !layer.visible;
        this.setLayerVisibility(layerId, newVisibility);
        return newVisibility;
    }

    setLayerVisibility(layerId, visible) {
        // Actualizar en StateManager
        window.StateManager.updateLayer(layerId, { visible });
        
        // Actualizar UI
        this.updateLayerVisibilityUI(layerId, visible);
        
        // Notificar al CanvasManager si existe
        if (window.CanvasManager) {
            window.CanvasManager.updateLayerVisibility(layerId, visible);
        }
        
        // Emitir evento
        this.emit('layerVisibilityChanged', { layerId, visible });
        
        console.log(`👁️ Visibilidad de capa ${layerId}: ${visible ? 'visible' : 'oculta'}`);
    }

    // Eventos de la UI
    onLayerClick(layerId) {
        this.setCurrentLayer(layerId);
    }

    onVisibilityChange(layerId, visible) {
        this.setLayerVisibility(layerId, visible);
    }

    // Métodos de actualización de UI
    updateLayerUI() {
        this.updateActiveLayerHighlight();
        this.updateCurrentLayerInfo();
    }

    updateActiveLayerHighlight() {
        // Remover highlight anterior
        const prevActive = document.querySelector('.layer-item.active');
        if (prevActive) {
            prevActive.classList.remove('active');
        }
        
        // Agregar highlight actual
        const currentElement = document.querySelector(`[data-layer-id="${this.currentLayer}"]`);
        if (currentElement) {
            currentElement.closest('.layer-item').classList.add('active');
        }
    }

    updateCurrentLayerInfo() {
        const infoElement = document.getElementById('current-layer-name');
        if (infoElement) {
            const layer = this.getLayer(this.currentLayer);
            infoElement.textContent = layer ? layer.name : this.currentLayer;
        }
    }

    updateLayerVisibilityUI(layerId, visible) {
        const checkbox = document.getElementById(`visibility-${layerId}`);
        if (checkbox) {
            checkbox.checked = visible;
        }
        
        // Actualizar estilo visual del elemento
        const layerElement = document.querySelector(`[data-layer-id="${layerId}"]`);
        if (layerElement) {
            const item = layerElement.closest('.layer-item');
            item.classList.toggle('hidden', !visible);
        }
    }

    // Métodos de utilidad
    getLayerDeviceCount(layerId) {
        const state = window.StateManager.getState();
        let count = 0;
        
        for (const device of state.devices.values()) {
            if (device.layer === layerId) {
                count++;
            }
        }
        
        return count;
    }

    highlightLayerDevices(layerId) {
        if (window.CanvasManager) {
            window.CanvasManager.highlightLayerDevices(layerId);
        }
    }

    clearLayerHighlight() {
        if (window.CanvasManager) {
            window.CanvasManager.clearHighlight();
        }
    }

    // Gestión de capas
    addLayer(layerData) {
        const layer = {
            id: layerData.id || this.generateLayerId(),
            name: layerData.name || 'Nueva Capa',
            description: layerData.description || '',
            color: layerData.color || this.generateRandomColor(),
            visible: layerData.visible !== false,
            order: layerData.order || this.getNextOrder(),
            icon: layerData.icon || '📄',
            devices: [],
            connections: []
        };
        
        // Agregar al estado
        window.StateManager.addLayer(layer);
        
        // Re-renderizar UI
        this.renderLayerList();
        
        // Emitir evento
        this.emit('layerAdded', layer);
        
        console.log(`➕ Capa agregada: ${layer.name}`);
        return layer.id;
    }

    removeLayer(layerId) {
        if (layerId === 'core') {
            console.error('❌ No se puede eliminar la capa Core');
            return false;
        }
        
        const layer = this.getLayer(layerId);
        if (!layer) {
            console.error(`❌ Capa ${layerId} no existe`);
            return false;
        }
        
        // Mover dispositivos a Core
        this.moveLayerDevices(layerId, 'core');
        
        // Eliminar del estado
        const state = window.StateManager.getState();
        const layers = new Map(state.layers);
        layers.delete(layerId);
        window.StateManager.setState({ layers });
        
        // Si era la capa actual, cambiar a Core
        if (this.currentLayer === layerId) {
            this.setCurrentLayer('core');
        }
        
        // Re-renderizar UI
        this.renderLayerList();
        
        // Emitir evento
        this.emit('layerRemoved', { layerId, layer });
        
        console.log(`➖ Capa eliminada: ${layer.name}`);
        return true;
    }

    moveLayerDevices(fromLayerId, toLayerId) {
        const state = window.StateManager.getState();
        
        for (const [deviceId, device] of state.devices) {
            if (device.layer === fromLayerId) {
                window.StateManager.updateDevice(deviceId, { layer: toLayerId });
            }
        }
    }

    // Event system
    setupEventListeners() {
        // Escuchar cambios en el StateManager
        if (window.StateManager) {
            window.StateManager.subscribe('currentLayer', (newLayer) => {
                if (newLayer !== this.currentLayer) {
                    this.currentLayer = newLayer;
                    this.updateLayerUI();
                }
            });
            
            window.StateManager.subscribe('layers', () => {
                this.renderLayerList();
            });
        }
        
        // Escuchar eventos de ventana
        window.addEventListener('resize', this.debounce(() => {
            this.updateLayerUI();
        }, 250));
        
        // Escuchar eventos de dispositivos
        document.addEventListener('device:added', (e) => {
            this.onDeviceAdded(e.detail);
        });
        
        document.addEventListener('device:removed', (e) => {
            this.onDeviceRemoved(e.detail);
        });
    }

    onDeviceAdded(deviceData) {
        // Actualizar contador de dispositivos en la capa
        this.updateLayerStats(deviceData.layer);
    }

    onDeviceRemoved(deviceData) {
        // Actualizar contador de dispositivos en la capa
        this.updateLayerStats(deviceData.layer);
    }

    updateLayerStats(layerId) {
        const statsElement = document.querySelector(`[data-layer-id="${layerId}"]`)
            ?.closest('.layer-item')
            ?.querySelector('.layer-stats small');
            
        if (statsElement) {
            const count = this.getLayerDeviceCount(layerId);
            statsElement.textContent = `${count} dispositivos`;
        }
    }

    emit(eventName, data = {}) {
        const listeners = this.eventListeners.get(eventName) || [];
        listeners.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`❌ Error en listener de ${eventName}:`, error);
            }
        });
        
        // También emitir evento DOM
        document.dispatchEvent(new CustomEvent(`layer:${eventName}`, { detail: data }));
    }

    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
        
        // Retornar función de cleanup
        return () => this.off(eventName, callback);
    }

    off(eventName, callback) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // Diálogos y modales
    showAddLayerDialog() {
        const dialog = this.createLayerDialog();
        document.body.appendChild(dialog);
        
        // Focus en el primer input
        const firstInput = dialog.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }

    createLayerDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h4>Nueva Capa</h4>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="add-layer-form">
                        <div class="form-group">
                            <label for="layer-name">Nombre:</label>
                            <input type="text" id="layer-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="layer-description">Descripción:</label>
                            <input type="text" id="layer-description" name="description">
                        </div>
                        <div class="form-group">
                            <label for="layer-color">Color:</label>
                            <input type="color" id="layer-color" name="color" value="${this.generateRandomColor()}">
                        </div>
                        <div class="form-group">
                            <label for="layer-icon">Icono:</label>
                            <select id="layer-icon" name="icon">
                                <option value="📄">📄 Documento</option>
                                <option value="🌐">🌐 Red</option>
                                <option value="🔗">🔗 Conexión</option>
                                <option value="⭐">⭐ Estrella</option>
                                <option value="📊">📊 Datos</option>
                                <option value="🔌">🔌 Puerto</option>
                                <option value="🛡️">🛡️ Seguridad</option>
                                <option value="👤">👤 Usuario</option>
                                <option value="📱">📱 Móvil</option>
                                <option value="🖥️">🖥️ Servidor</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="layerManager.handleAddLayer(this.closest('.modal-overlay'))">
                        Crear Capa
                    </button>
                </div>
            </div>
        `;
        
        // Eventos del diálogo
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        return dialog;
    }

    handleAddLayer(dialog) {
        const form = dialog.querySelector('#add-layer-form');
        const formData = new FormData(form);
        
        const layerData = {
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color'),
            icon: formData.get('icon')
        };
        
        // Validar datos
        if (!layerData.name.trim()) {
            alert('El nombre de la capa es obligatorio');
            return;
        }
        
        // Crear capa
        const layerId = this.addLayer(layerData);
        
        // Seleccionar nueva capa
        this.setCurrentLayer(layerId);
        
        // Cerrar diálogo
        dialog.remove();
        
        // Mostrar notificación
        this.showNotification(`Capa "${layerData.name}" creada correctamente`, 'success');
    }

    showLayerSettings() {
        const dialog = this.createSettingsDialog();
        document.body.appendChild(dialog);
    }

    createSettingsDialog() {
        const layers = this.getAllLayers();
        
        const dialog = document.createElement('div');
        dialog.className = 'modal-overlay';
        dialog.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-header">
                    <h4>Configuración de Capas</h4>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="layer-settings">
                        <div class="settings-tabs">
                            <button class="tab-btn active" data-tab="order">Orden</button>
                            <button class="tab-btn" data-tab="properties">Propiedades</button>
                            <button class="tab-btn" data-tab="export">Exportar</button>
                        </div>
                        <div class="tab-content">
                            <div class="tab-pane active" id="order-tab">
                                <h5>Orden de las Capas</h5>
                                <div class="sortable-list" id="layer-order-list">
                                    ${layers.map(layer => `
                                        <div class="sortable-item" data-layer-id="${layer.id}">
                                            <span class="drag-handle">≡</span>
                                            <span class="layer-icon">${layer.icon}</span>
                                            <span class="layer-name">${layer.name}</span>
                                            <span class="layer-order">${layer.order}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="tab-pane" id="properties-tab">
                                <h5>Propiedades Globales</h5>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="auto-assign-layer" ${this.getAutoAssignSetting() ? 'checked' : ''}> 
                                        Asignar capa automáticamente
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="show-layer-colors" ${this.getShowColorsetting() ? 'checked' : ''}> 
                                        Mostrar colores de capa en dispositivos
                                    </label>
                                </div>
                            </div>
                            <div class="tab-pane" id="export-tab">
                                <h5>Exportar Configuración</h5>
                                <button class="btn btn-outline-primary" onclick="layerManager.exportLayerConfig()">
                                    Exportar como JSON
                                </button>
                                <div class="form-group mt-3">
                                    <label for="import-config">Importar configuración:</label>
                                    <input type="file" id="import-config" accept=".json" onchange="layerManager.importLayerConfig(this)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cerrar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="layerManager.saveSettings(this.closest('.modal-overlay'))">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        `;
        
        // Configurar eventos del diálogo
        this.setupSettingsDialogEvents(dialog);
        
        return dialog;
    }

    setupSettingsDialogEvents(dialog) {
        // Tabs
        const tabBtns = dialog.querySelectorAll('.tab-btn');
        const tabPanes = dialog.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const targetTab = dialog.querySelector(`#${btn.dataset.tab}-tab`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
        
        // Sortable list (simplificado)
        this.makeListSortable(dialog.querySelector('#layer-order-list'));
    }

    makeListSortable(list) {
        // Implementación básica de sortable
        let draggedElement = null;
        
        Array.from(list.children).forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedElement = null;
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedElement && draggedElement !== item) {
                    const rect = item.getBoundingClientRect();
                    const midpoint = rect.top + rect.height / 2;
                    
                    if (e.clientY < midpoint) {
                        list.insertBefore(draggedElement, item);
                    } else {
                        list.insertBefore(draggedElement, item.nextSibling);
                    }
                    
                    this.updateLayerOrder(list);
                }
            });
        });
    }

    updateLayerOrder(list) {
        const items = Array.from(list.children);
        items.forEach((item, index) => {
            const layerId = item.dataset.layerId;
            const orderSpan = item.querySelector('.layer-order');
            orderSpan.textContent = index + 1;
            
            // Actualizar en el estado
            window.StateManager.updateLayer(layerId, { order: index + 1 });
        });
    }

    // Utilidades
    generateLayerId() {
        return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    generateRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#85C1E9', '#F8C471'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getNextOrder() {
        const layers = this.getAllLayers();
        return Math.max(...layers.map(l => l.order || 0)) + 1;
    }

    loadSavedLayers() {
        try {
            const saved = localStorage.getItem('network-diagram-layers');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('⚠️ Error cargando capas guardadas:', error);
            return null;
        }
    }

    saveLayers() {
        try {
            const layers = this.getAllLayers();
            localStorage.setItem('network-diagram-layers', JSON.stringify(layers));
            return true;
        } catch (error) {
            console.error('❌ Error guardando capas:', error);
            return false;
        }
    }

    getAutoAssignSetting() {
        return localStorage.getItem('layer-auto-assign') === 'true';
    }

    getShowColorsetting() {
        return localStorage.getItem('layer-show-colors') !== 'false';
    }

    exportLayerConfig() {
        const config = {
            layers: this.getAllLayers(),
            settings: {
                autoAssign: this.getAutoAssignSetting(),
                showColors: this.getShowColorsetting()
            },
            version: '1.0',
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'layer-config.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importLayerConfig(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                // Validar configuración
                if (!config.layers || !Array.isArray(config.layers)) {
                    throw new Error('Formato de configuración inválido');
                }
                
                // Confirmar importación
                if (confirm('¿Estás seguro de que quieres importar esta configuración? Esto sobrescribirá las capas actuales.')) {
                    this.importLayers(config.layers);
                    this.showNotification('Configuración importada correctamente', 'success');
                }
                
            } catch (error) {
                console.error('❌ Error importando configuración:', error);
                alert('Error al importar configuración: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }

    importLayers(layers) {
        // Limpiar capas actuales (excepto core)
        const currentLayers = this.getAllLayers();
        currentLayers.forEach(layer => {
            if (layer.id !== 'core') {
                this.removeLayer(layer.id);
            }
        });
        
        // Importar nuevas capas
        layers.forEach(layer => {
            if (layer.id !== 'core') {
                this.addLayer(layer);
            }
        });
        
        // Re-renderizar
        this.renderLayerList();
    }

    saveSettings(dialog) {
        // Guardar configuraciones
        const autoAssign = dialog.querySelector('#auto-assign-layer').checked;
        const showColors = dialog.querySelector('#show-layer-colors').checked;
        
        localStorage.setItem('layer-auto-assign', autoAssign.toString());
        localStorage.setItem('layer-show-colors', showColors.toString());
        
        // Guardar capas
        this.saveLayers();
        
        // Cerrar diálogo
        dialog.remove();
        
        // Mostrar notificación
        this.showNotification('Configuración guardada', 'success');
    }

    showNotification(message, type = 'info') {
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type);
        } else {
            // Fallback básico
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Método de cleanup
    destroy() {
        // Limpiar event listeners
        this.eventListeners.clear();
        
        // Cancelar animaciones
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Remover elementos UI
        const layerSection = document.getElementById('layer-section');
        if (layerSection) {
            layerSection.remove();
        }
        
        this.initialized = false;
        console.log('🧹 LayerManager destruido');
    }

    // Métodos de debugging
    getDebugInfo() {
        return {
            initialized: this.initialized,
            currentLayer: this.currentLayer,
            layerCount: this.getAllLayers().length,
            eventListeners: Array.from(this.eventListeners.keys()),
            deviceCounts: this.getAllLayers().map(layer => ({
                id: layer.id,
                name: layer.name,
                deviceCount: this.getLayerDeviceCount(layer.id)
            }))
        };
    }
}

// Crear instancia global
window.LayerManager = new LayerManager();

// Alias para compatibilidad
window.layerManager = window.LayerManager;