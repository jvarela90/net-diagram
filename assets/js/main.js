/**
 * Network Diagram Creator - Aplicación Principal
 * Versión corregida que soluciona los problemas de inicialización
 */

class NetworkDiagramApp {
    constructor() {
        this.initialized = false;
        this.version = '2.0.0';
        this.modules = new Map();
        this.eventBus = new EventTarget();
        
        // Estado de la aplicación
        this.state = {
            loading: true,
            error: null,
            currentTool: 'select',
            selectedItems: [],
            clipboard: null,
            isDirty: false
        };
        
        // Configuración por defecto
        this.config = {
            autoSave: true,
            autoSaveInterval: 30000,
            maxUndoSteps: 50,
            gridSize: 20,
            snapToGrid: true,
            theme: 'light'
        };
        
        console.log('🚀 NetworkDiagramApp constructor ejecutado');
    }

    async initialize() {
        if (this.initialized) {
            console.log('✅ Aplicación ya inicializada');
            return;
        }

        try {
            console.log('🔧 Inicializando NetworkDiagramApp...');
            
            // Verificar dependencias críticas
            this.checkCriticalDependencies();
            
            // Cargar configuración
            await this.loadConfiguration();
            
            // Inicializar módulos en orden
            await this.initializeModules();
            
            // Configurar UI
            await this.setupUI();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Cargar datos iniciales
            await this.loadInitialData();
            
            // Configurar auto-guardado
            this.setupAutoSave();
            
            // Marcar como inicializado
            this.initialized = true;
            this.state.loading = false;
            
            // Emitir evento de inicialización completa
            this.emit('app:ready');
            
            console.log('✅ NetworkDiagramApp inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando NetworkDiagramApp:', error);
            this.state.error = error;
            this.state.loading = false;
            throw error;
        }
    }

    checkCriticalDependencies() {
        const requiredGlobals = [
            'StateManager',
            'LayerManager', 
            'AppInitializer'
        ];

        const missing = requiredGlobals.filter(name => !window[name]);
        
        if (missing.length > 0) {
            throw new Error(`Dependencias críticas faltantes: ${missing.join(', ')}`);
        }

        // Verificar que StateManager esté inicializado
        if (!window.StateManager.initialized) {
            throw new Error('StateManager no está inicializado');
        }

        console.log('✅ Dependencias críticas verificadas');
    }

    async loadConfiguration() {
        try {
            // Cargar configuración guardada
            const savedConfig = localStorage.getItem('network-diagram-config');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsed };
            }
            
            // Aplicar tema
            this.applyTheme(this.config.theme);
            
            console.log('⚙️ Configuración cargada:', this.config);
        } catch (error) {
            console.warn('⚠️ Error cargando configuración, usando valores por defecto:', error);
        }
    }

    async initializeModules() {
        console.log('🔧 Inicializando módulos de la aplicación...');
        
        // Orden específico de inicialización
        const moduleInitOrder = [
            'LayerManager',
            'DeviceManager', 
            'ConnectionManager',
            'CanvasManager',
            'SelectionManager',
            'UIManager',
            'ToolbarManager',
            'SidebarManager',
            'NotificationManager',
            'ModalManager',
            'FileManager',
            'ExportManager',
            'TemplateManager',
            'ValidationManager'
        ];

        for (const moduleName of moduleInitOrder) {
            try {
                const module = window[moduleName];
                
                if (module && typeof module.initialize === 'function') {
                    console.log(`🔧 Inicializando ${moduleName}...`);
                    await module.initialize();
                    this.modules.set(moduleName, module);
                    console.log(`✅ ${moduleName} inicializado`);
                } else if (module) {
                    // Módulo existe pero no tiene método initialize
                    this.modules.set(moduleName, module);
                    console.log(`📝 ${moduleName} registrado (sin inicialización)`);
                } else {
                    console.warn(`⚠️ ${moduleName} no encontrado, continuando...`);
                }
            } catch (error) {
                console.error(`❌ Error inicializando ${moduleName}:`, error);
                // No detener la inicialización por módulos opcionales
                if (['LayerManager', 'DeviceManager', 'CanvasManager'].includes(moduleName)) {
                    throw error;
                }
            }
        }

        console.log(`✅ ${this.modules.size} módulos inicializados`);
    }

    async setupUI() {
        console.log('🎨 Configurando interfaz de usuario...');
        
        // Configurar toolbar
        this.setupToolbar();
        
        // Configurar sidebar
        this.setupSidebar();
        
        // Configurar canvas
        this.setupCanvas();
        
        // Configurar atajos de teclado
        this.setupKeyboardShortcuts();
        
        // Configurar drag & drop
        this.setupDragAndDrop();
        
        console.log('✅ Interfaz de usuario configurada');
    }

    setupToolbar() {
        // Configurar herramientas del toolbar
        const tools = [
            { id: 'select', element: 'select-tool', icon: '🔍', tooltip: 'Seleccionar (V)' },
            { id: 'device', element: 'device-tool', icon: '🖥️', tooltip: 'Agregar dispositivo (D)' },
            { id: 'connection', element: 'connection-tool', icon: '🔗', tooltip: 'Conectar (C)' },
            { id: 'text', element: 'text-tool', icon: '📝', tooltip: 'Agregar texto (T)' }
        ];

        tools.forEach(tool => {
            const element = document.getElementById(tool.element);
            if (element) {
                element.addEventListener('click', () => this.setActiveTool(tool.id));
                element.title = tool.tooltip;
            }
        });

        // Configurar botones de archivo
        this.setupFileButtons();
        
        // Configurar botones de zoom
        this.setupZoomButtons();
        
        // Configurar botones de configuración
        this.setupSettingsButtons();
    }

    setupFileButtons() {
        const fileButtons = [
            { id: 'new-btn', action: () => this.newProject() },
            { id: 'open-btn', action: () => this.openProject() },
            { id: 'save-btn', action: () => this.saveProject() }
        ];

        fileButtons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', action);
            }
        });
    }

    setupZoomButtons() {
        const zoomButtons = [
            { id: 'zoom-in', action: () => this.zoomIn() },
            { id: 'zoom-out', action: () => this.zoomOut() },
            { id: 'zoom-fit', action: () => this.zoomToFit() }
        ];

        zoomButtons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', action);
            }
        });
    }

    setupSettingsButtons() {
        const settingsButtons = [
            { id: 'settings-btn', action: () => this.showSettings() },
            { id: 'help-btn', action: () => this.showHelp() }
        ];

        settingsButtons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', action);
            }
        });
    }

    setupSidebar() {
        // Configurar comportamiento del sidebar
        const collapseBtns = document.querySelectorAll('.collapse-btn');
        collapseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.sidebar-section');
                const content = section.querySelector('.section-content');
                const isCollapsed = content.style.display === 'none';
                
                content.style.display = isCollapsed ? 'block' : 'none';
                btn.querySelector('span').textContent = isCollapsed ? '−' : '+';
            });
        });

        // Configurar búsqueda de dispositivos
        const deviceSearch = document.getElementById('device-search');
        if (deviceSearch) {
            deviceSearch.addEventListener('input', (e) => {
                this.filterDevices(e.target.value);
            });
        }
    }

    setupCanvas() {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) {
            console.warn('⚠️ Canvas container no encontrado');
            return;
        }

        // Configurar eventos del canvas
        canvasContainer.addEventListener('click', (e) => this.handleCanvasClick(e));
        canvasContainer.addEventListener('contextmenu', (e) => this.handleCanvasRightClick(e));
        canvasContainer.addEventListener('wheel', (e) => this.handleCanvasWheel(e));
        canvasContainer.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        
        // Configurar botones del canvas
        const canvasButtons = [
            { id: 'grid-toggle', action: () => this.toggleGrid() },
            { id: 'snap-toggle', action: () => this.toggleSnap() },
            { id: 'rulers-toggle', action: () => this.toggleRulers() }
        ];

        canvasButtons.forEach(({ id, action }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', action);
            }
        });
    }

    setupKeyboardShortcuts() {
        const shortcuts = [
            { key: 'v', action: () => this.setActiveTool('select') },
            { key: 'd', action: () => this.setActiveTool('device') },
            { key: 'c', action: () => this.setActiveTool('connection') },
            { key: 't', action: () => this.setActiveTool('text') },
            { key: 'Delete', action: () => this.deleteSelected() },
            { key: 'Escape', action: () => this.cancelCurrentOperation() },
            { key: '+', action: () => this.zoomIn() },
            { key: '-', action: () => this.zoomOut() },
            { key: '0', action: () => this.zoomToFit() }
        ];

        document.addEventListener('keydown', (e) => {
            // Ignorar si está en un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const shortcut = shortcuts.find(s => s.key === e.key);
            if (shortcut) {
                e.preventDefault();
                shortcut.action();
            }
        });
    }

    setupDragAndDrop() {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;

        // Permitir drop en el canvas
        canvasContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        canvasContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleCanvasDrop(e);
        });
    }

    setupEventListeners() {
        console.log('📡 Configurando event listeners...');

        // Escuchar cambios de estado
        if (window.StateManager) {
            window.StateManager.subscribe('currentLayer', (layer) => {
                this.onLayerChanged(layer);
            });

            window.StateManager.subscribe('selectedDevices', (devices) => {
                this.onSelectionChanged(devices);
            });
        }

        // Escuchar eventos de módulos
        this.eventBus.addEventListener('tool:changed', (e) => {
            this.onToolChanged(e.detail);
        });

        this.eventBus.addEventListener('device:added', (e) => {
            this.onDeviceAdded(e.detail);
        });

        this.eventBus.addEventListener('project:saved', (e) => {
            this.onProjectSaved(e.detail);
        });

        console.log('✅ Event listeners configurados');
    }

    async loadInitialData() {
        console.log('📚 Cargando datos iniciales...');

        try {
            // Cargar biblioteca de dispositivos
            await this.loadDeviceLibrary();
            
            // Cargar plantillas
            await this.loadTemplates();
            
            // Intentar cargar último proyecto
            await this.loadLastProject();
            
            console.log('✅ Datos iniciales cargados');
        } catch (error) {
            console.warn('⚠️ Error cargando datos iniciales:', error);
        }
    }

    async loadDeviceLibrary() {
        const deviceCategories = [
            {
                id: 'network',
                name: 'Dispositivos de Red',
                icon: '🌐',
                devices: [
                    { type: 'router', name: 'Router', icon: 'R', description: 'Dispositivo de enrutamiento' },
                    { type: 'switch', name: 'Switch', icon: 'SW', description: 'Conmutador de red' },
                    { type: 'firewall', name: 'Firewall', icon: 'FW', description: 'Cortafuegos' },
                    { type: 'access-point', name: 'Access Point', icon: 'AP', description: 'Punto de acceso WiFi' }
                ]
            },
            {
                id: 'servers',
                name: 'Servidores',
                icon: '🖥️',
                devices: [
                    { type: 'server', name: 'Servidor', icon: 'SRV', description: 'Servidor genérico' },
                    { type: 'database', name: 'Base de Datos', icon: 'DB', description: 'Servidor de base de datos' },
                    { type: 'web-server', name: 'Servidor Web', icon: 'WEB', description: 'Servidor web' },
                    { type: 'mail-server', name: 'Servidor Email', icon: 'MAIL', description: 'Servidor de correo' }
                ]
            },
            {
                id: 'endpoints',
                name: 'Dispositivos Finales',
                icon: '💻',
                devices: [
                    { type: 'workstation', name: 'PC', icon: 'PC', description: 'Estación de trabajo' },
                    { type: 'laptop', name: 'Laptop', icon: 'LAP', description: 'Computadora portátil' },
                    { type: 'phone', name: 'Teléfono IP', icon: 'TEL', description: 'Teléfono IP' },
                    { type: 'printer', name: 'Impresora', icon: 'PRT', description: 'Impresora de red' }
                ]
            }
        ];

        // Renderizar categorías en el sidebar
        this.renderDeviceCategories(deviceCategories);
    }

    renderDeviceCategories(categories) {
        const container = document.getElementById('device-categories');
        if (!container) return;

        container.innerHTML = '';

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'device-category';
            categoryElement.innerHTML = `
                <div class="category-header" data-category="${category.id}">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                    <span class="category-toggle">−</span>
                </div>
                <div class="category-devices" id="devices-${category.id}">
                    ${category.devices.map(device => `
                        <div class="device-item" 
                             data-device-type="${device.type}"
                             draggable="true"
                             title="${device.description}">
                            <span class="device-icon">${device.icon}</span>
                            <span class="device-name">${device.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            container.appendChild(categoryElement);

            // Configurar eventos
            this.setupCategoryEvents(categoryElement, category);
        });
    }

    setupCategoryEvents(categoryElement, category) {
        const header = categoryElement.querySelector('.category-header');
        const devices = categoryElement.querySelector('.category-devices');
        const toggle = categoryElement.querySelector('.category-toggle');

        // Toggle de categoría
        header.addEventListener('click', () => {
            const isCollapsed = devices.style.display === 'none';
            devices.style.display = isCollapsed ? 'block' : 'none';
            toggle.textContent = isCollapsed ? '−' : '+';
        });

        // Drag de dispositivos
        const deviceItems = categoryElement.querySelectorAll('.device-item');
        deviceItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.deviceType);
                e.dataTransfer.effectAllowed = 'copy';
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            // Click para agregar dispositivo
            item.addEventListener('click', () => {
                this.addDeviceToCenter(item.dataset.deviceType);
            });
        });
    }

    async loadTemplates() {
        const templates = [
            {
                id: 'basic-office',
                name: 'Oficina Básica',
                description: 'Red simple para oficina pequeña',
                thumbnail: '🏢',
                devices: [
                    { type: 'router', x: 400, y: 200, layer: 'core' },
                    { type: 'switch', x: 400, y: 350, layer: 'access' },
                    { type: 'workstation', x: 200, y: 450, layer: 'user' },
                    { type: 'workstation', x: 600, y: 450, layer: 'user' }
                ]
            },
            {
                id: 'enterprise',
                name: 'Red Empresarial',
                description: 'Topología empresarial con DMZ',
                thumbnail: '🏭',
                devices: [
                    { type: 'router', x: 400, y: 100, layer: 'core' },
                    { type: 'firewall', x: 400, y: 200, layer: 'dmz' },
                    { type: 'switch', x: 200, y: 350, layer: 'access' },
                    { type: 'switch', x: 600, y: 350, layer: 'access' },
                    { type: 'server', x: 500, y: 250, layer: 'dmz' }
                ]
            }
        ];

        this.renderTemplates(templates);
    }

    renderTemplates(templates) {
        const container = document.getElementById('template-grid');
        if (!container) return;

        container.innerHTML = templates.map(template => `
            <div class="template-item" data-template-id="${template.id}">
                <div class="template-thumbnail">${template.thumbnail}</div>
                <div class="template-info">
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                </div>
            </div>
        `).join('');

        // Configurar eventos de plantillas
        container.addEventListener('click', (e) => {
            const templateItem = e.target.closest('.template-item');
            if (templateItem) {
                const templateId = templateItem.dataset.templateId;
                this.loadTemplate(templateId, templates);
            }
        });
    }

    async loadLastProject() {
        try {
            const lastProject = localStorage.getItem('network-diagram-last-project');
            if (lastProject) {
                const projectData = JSON.parse(lastProject);
                await this.loadProjectData(projectData);
                console.log('📂 Último proyecto cargado');
            }
        } catch (error) {
            console.warn('⚠️ Error cargando último proyecto:', error);
        }
    }

    setupAutoSave() {
        if (!this.config.autoSave) return;

        setInterval(() => {
            if (this.state.isDirty && window.StateManager) {
                this.saveProject(false); // Guardado silencioso
            }
        }, this.config.autoSaveInterval);

        console.log(`💾 Auto-guardado configurado cada ${this.config.autoSaveInterval / 1000}s`);
    }

    // Métodos de herramientas
    setActiveTool(toolId) {
        if (this.state.currentTool === toolId) return;

        // Desactivar herramienta anterior
        const prevBtn = document.querySelector('.toolbar-btn.active');
        if (prevBtn) {
            prevBtn.classList.remove('active');
        }

        // Activar nueva herramienta
        const newBtn = document.getElementById(`${toolId}-tool`);
        if (newBtn) {
            newBtn.classList.add('active');
        }

        this.state.currentTool = toolId;
        
        // Notificar cambio de herramienta
        this.emit('tool:changed', { tool: toolId });
        
        // Actualizar cursor del canvas
        this.updateCanvasCursor(toolId);

        console.log(`🔧 Herramienta activa: ${toolId}`);
    }

    updateCanvasCursor(toolId) {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;

        const cursors = {
            select: 'default',
            device: 'crosshair',
            connection: 'crosshair',
            text: 'text'
        };

        canvasContainer.style.cursor = cursors[toolId] || 'default';
    }

    // Métodos de canvas
    handleCanvasClick(e) {
        if (!this.initialized) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        switch (this.state.currentTool) {
            case 'device':
                this.showDeviceSelector(x, y);
                break;
            case 'text':
                this.addTextLabel(x, y);
                break;
            default:
                this.handleSelection(x, y, e.ctrlKey);
        }

        this.updateCanvasInfo(x, y);
    }

    handleCanvasRightClick(e) {
        e.preventDefault();
        
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.showContextMenu(x, y, e.clientX, e.clientY);
    }

    handleCanvasWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.adjustZoom(delta);
        }
    }

    handleCanvasMouseMove(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.updateCanvasInfo(x, y);
    }

    handleCanvasDrop(e) {
        const deviceType = e.dataTransfer.getData('text/plain');
        if (!deviceType) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.addDevice(deviceType, x, y);
    }

    updateCanvasInfo(x, y) {
        const coordsElement = document.getElementById('canvas-coordinates');
        if (coordsElement) {
            coordsElement.textContent = `X: ${Math.round(x)}, Y: ${Math.round(y)}`;
        }
    }

    // Métodos de dispositivos
    addDevice(deviceType, x, y) {
        if (!window.DeviceManager) {
            console.error('DeviceManager no disponible');
            return;
        }

        const device = {
            type: deviceType,
            x: x,
            y: y,
            layer: window.StateManager.getState().currentLayer,
            name: this.generateDeviceName(deviceType),
            properties: {}
        };

        const deviceId = window.DeviceManager.addDevice(device);
        
        if (deviceId) {
            this.state.isDirty = true;
            this.emit('device:added', { deviceId, device });
            this.showNotification(`Dispositivo ${device.name} agregado`, 'success');
        }
    }

    addDeviceToCenter(deviceType) {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;

        const rect = canvasContainer.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        this.addDevice(deviceType, centerX, centerY);
    }

    generateDeviceName(deviceType) {
        const state = window.StateManager.getState();
        const existingDevices = Array.from(state.devices.values());
        const sameTypeDevices = existingDevices.filter(d => d.type === deviceType);
        
        const prefixes = {
            router: 'R',
            switch: 'SW',
            firewall: 'FW',
            server: 'SRV',
            workstation: 'PC',
            'access-point': 'AP'
        };

        const prefix = prefixes[deviceType] || deviceType.toUpperCase();
        const number = sameTypeDevices.length + 1;
        
        return `${prefix}-${number.toString().padStart(2, '0')}`;
    }

    // Métodos de archivo
    newProject() {
        if (this.state.isDirty) {
            if (!confirm('¿Crear nuevo proyecto? Se perderán los cambios no guardados.')) {
                return;
            }
        }

        // Limpiar estado
        window.StateManager.reset();
        this.state.isDirty = false;
        
        // Limpiar canvas
        if (window.CanvasManager) {
            window.CanvasManager.clear();
        }

        this.showNotification('Nuevo proyecto creado', 'success');
        console.log('📄 Nuevo proyecto creado');
    }

    openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.ndcp';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadProjectFile(file);
            }
        };
        input.click();
    }

    async loadProjectFile(file) {
        try {
            const text = await file.text();
            const projectData = JSON.parse(text);
            
            await this.loadProjectData(projectData);
            
            this.showNotification(`Proyecto ${file.name} cargado`, 'success');
            console.log('📂 Proyecto cargado desde archivo');
        } catch (error) {
            console.error('Error cargando proyecto:', error);
            this.showNotification('Error cargando proyecto', 'error');
        }
    }

    async loadProjectData(projectData) {
        // Validar datos del proyecto
        if (!this.validateProjectData(projectData)) {
            throw new Error('Datos de proyecto inválidos');
        }

        // Cargar en StateManager
        window.StateManager.setState({
            devices: new Map(projectData.devices || []),
            connections: new Map(projectData.connections || []),
            layers: new Map(projectData.layers || [])
        });

        // Actualizar canvas
        if (window.CanvasManager) {
            await window.CanvasManager.refresh();
        }

        this.state.isDirty = false;
    }

    saveProject(showNotification = true) {
        try {
            const projectData = this.exportProjectData();
            
            // Guardar en localStorage
            localStorage.setItem('network-diagram-last-project', JSON.stringify(projectData));
            
            // Crear archivo para descarga
            const blob = new Blob([JSON.stringify(projectData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `network-diagram-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            
            URL.revokeObjectURL(url);

            this.state.isDirty = false;
            
            if (showNotification) {
                this.showNotification('Proyecto guardado', 'success');
            }
            
            this.emit('project:saved', { projectData });
            console.log('💾 Proyecto guardado');
        } catch (error) {
            console.error('Error guardando proyecto:', error);
            this.showNotification('Error guardando proyecto', 'error');
        }
    }

    exportProjectData() {
        const state = window.StateManager.getState();
        
        return {
            version: this.version,
            metadata: {
                name: state.project.name,
                createdAt: new Date().toISOString(),
                author: 'Network Diagram Creator'
            },
            devices: Array.from(state.devices.entries()),
            connections: Array.from(state.connections.entries()),
            layers: Array.from(state.layers.entries()),
            config: this.config
        };
    }

    validateProjectData(data) {
        return data && 
               typeof data === 'object' && 
               Array.isArray(data.devices) && 
               Array.isArray(data.connections);
    }

    // Métodos de zoom
    zoomIn() {
        this.adjustZoom(0.1);
    }

    zoomOut() {
        this.adjustZoom(-0.1);
    }

    zoomToFit() {
        if (window.CanvasManager) {
            window.CanvasManager.zoomToFit();
        }
    }

    adjustZoom(delta) {
        if (window.CanvasManager) {
            window.CanvasManager.adjustZoom(delta);
        }
        
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        const state = window.StateManager.getState();
        const zoomElement = document.getElementById('canvas-zoom');
        if (zoomElement) {
            const zoom = Math.round(state.canvas.zoom * 100);
            zoomElement.textContent = `Zoom: ${zoom}%`;
        }
    }

    // Event handlers
    onLayerChanged(layerId) {
        console.log(`📋 Capa cambiada a: ${layerId}`);
        
        // Actualizar UI si es necesario
        if (window.CanvasManager) {
            window.CanvasManager.setActiveLayer(layerId);
        }
    }

    onSelectionChanged(selectedDevices) {
        this.state.selectedItems = selectedDevices;
        
        // Actualizar display de selección
        const selectionElement = document.getElementById('canvas-selection');
        if (selectionElement) {
            const count = selectedDevices.length;
            selectionElement.textContent = `${count} seleccionado${count !== 1 ? 's' : ''}`;
        }
        
        // Mostrar/ocultar panel de propiedades
        this.updatePropertiesPanel(selectedDevices);
    }

    onToolChanged(data) {
        console.log(`🔧 Herramienta cambiada: ${data.tool}`);
    }

    onDeviceAdded(data) {
        this.state.isDirty = true;
        console.log(`➕ Dispositivo agregado: ${data.device.name}`);
    }

    onProjectSaved(data) {
        console.log('💾 Proyecto guardado exitosamente');
    }

    // Métodos de utilidad
    emit(eventName, data = {}) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    showNotification(message, type = 'info') {
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        console.log(`🎨 Tema aplicado: ${theme}`);
    }

    // Métodos públicos para debugging
    getDebugInfo() {
        return {
            version: this.version,
            initialized: this.initialized,
            modules: Array.from(this.modules.keys()),
            state: this.state,
            config: this.config
        };
    }

    destroy() {
        // Cleanup
        this.modules.clear();
        this.initialized = false;
        console.log('🧹 NetworkDiagramApp destruido');
    }
}

// Crear instancia global
window.NetworkDiagramApp = new NetworkDiagramApp();

// Alias para facilidad de uso
window.app = window.NetworkDiagramApp;