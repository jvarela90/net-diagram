/**
 * Sistema de Inicialización de la Aplicación
 * Maneja la carga ordenada y segura de todos los módulos
 */

class AppInitializer {
    constructor() {
        this.initialized = false;
        this.initPromise = null;
        this.loadingProgress = 0;
        this.initSteps = [
            { name: 'Validando entorno', weight: 10 },
            { name: 'Inicializando Core', weight: 25 },
            { name: 'Configurando UI', weight: 20 },
            { name: 'Cargando datos', weight: 20 },
            { name: 'Configurando eventos', weight: 15 },
            { name: 'Finalizando', weight: 10 }
        ];
        this.currentStep = 0;
    }

    async initialize() {
        if (this.initialized) {
            console.log('✅ Aplicación ya inicializada');
            return;
        }
        
        if (this.initPromise) {
            console.log('⏳ Inicialización en progreso...');
            return this.initPromise;
        }

        console.log('🚀 Iniciando aplicación Network Diagram Creator...');
        this.initPromise = this._performInitialization();
        
        try {
            await this.initPromise;
            this.initialized = true;
            console.log('✅ Aplicación inicializada completamente');
        } catch (error) {
            console.error('❌ Error fatal en inicialización:', error);
            this._handleInitError(error);
            throw error;
        }
    }

    async _performInitialization() {
        try {
            // Paso 1: Validar entorno
            await this._executeStep(0, () => this._validateEnvironment());
            
            // Paso 2: Inicializar Core
            await this._executeStep(1, () => this._initializeCore());
            
            // Paso 3: Configurar UI
            await this._executeStep(2, () => this._initializeUI());
            
            // Paso 4: Cargar datos
            await this._executeStep(3, () => this._loadInitialData());
            
            // Paso 5: Configurar eventos
            await this._executeStep(4, () => this._setupEventListeners());
            
            // Paso 6: Finalizar
            await this._executeStep(5, () => this._finalize());
            
        } catch (error) {
            console.error(`❌ Error en paso ${this.currentStep}:`, error);
            throw error;
        }
    }

    async _executeStep(stepIndex, stepFunction) {
        this.currentStep = stepIndex;
        const step = this.initSteps[stepIndex];
        
        console.log(`📋 ${step.name}...`);
        this._updateProgress(step.name);
        
        await stepFunction();
        
        // Actualizar progreso
        let totalWeight = 0;
        for (let i = 0; i <= stepIndex; i++) {
            totalWeight += this.initSteps[i].weight;
        }
        this.loadingProgress = totalWeight;
        
        this._updateProgressBar(this.loadingProgress);
        
        // Pequeña pausa para permitir que la UI se actualice
        await this._delay(100);
    }

    async _validateEnvironment() {
        // Verificar que estamos en un navegador compatible
        if (typeof window === 'undefined') {
            throw new Error('Entorno no válido: se requiere un navegador web');
        }

        // Verificar APIs necesarias
        const requiredAPIs = ['localStorage', 'Canvas', 'JSON'];
        for (const api of requiredAPIs) {
            if (api === 'Canvas' && !document.createElement('canvas').getContext) {
                throw new Error('Canvas API no disponible');
            }
            if (api === 'localStorage' && !window.localStorage) {
                console.warn('⚠️ localStorage no disponible, usando memoria temporal');
            }
        }

        // Verificar elementos DOM críticos
        const requiredElements = ['loading-screen', 'main-content'];
        for (const id of requiredElements) {
            if (!document.getElementById(id)) {
                throw new Error(`Elemento DOM requerido no encontrado: ${id}`);
            }
        }

        console.log('✅ Entorno validado');
    }

    async _initializeCore() {
        // Verificar que todas las clases principales existen
        const requiredClasses = [
            'StateManager', 'LayerManager', 'DeviceManager', 
            'ConnectionManager', 'CanvasManager'
        ];

        for (const className of requiredClasses) {
            if (!window[className]) {
                throw new Error(`Clase requerida no encontrada: ${className}`);
            }
        }

        // Inicializar StateManager primero
        if (!window.StateManager.initialized) {
            await window.StateManager.initialize();
        }

        // Inicializar managers en orden específico
        console.log('🔧 Inicializando LayerManager...');
        await window.LayerManager.initialize();
        
        console.log('🔧 Inicializando DeviceManager...');
        await window.DeviceManager.initialize();
        
        console.log('🔧 Inicializando ConnectionManager...');
        await window.ConnectionManager.initialize();
        
        console.log('🔧 Inicializando CanvasManager...');
        await window.CanvasManager.initialize();

        console.log('✅ Core inicializado');
    }

    async _initializeUI() {
        // Verificar managers de UI
        const uiManagers = ['UIManager', 'ToolbarManager', 'SidebarManager'];
        
        for (const manager of uiManagers) {
            if (window[manager]) {
                console.log(`🎨 Inicializando ${manager}...`);
                await window[manager].initialize();
            } else {
                console.warn(`⚠️ ${manager} no encontrado, continuando...`);
            }
        }

        // Configurar el canvas principal
        this._setupMainCanvas();
        
        console.log('✅ UI inicializada');
    }

    async _loadInitialData() {
        try {
            // Cargar biblioteca de dispositivos
            console.log('📚 Cargando biblioteca de dispositivos...');
            await this._loadDeviceLibrary();
            
            // Cargar plantillas por defecto
            console.log('📋 Cargando plantillas...');
            await this._loadDefaultTemplates();
            
            // Intentar cargar proyecto guardado
            console.log('💾 Verificando proyecto guardado...');
            await this._loadSavedProject();
            
            console.log('✅ Datos iniciales cargados');
        } catch (error) {
            console.warn('⚠️ Error cargando datos iniciales:', error);
            // No es fatal, continuar con datos por defecto
        }
    }

    async _setupEventListeners() {
        // Configurar event listeners globales
        window.addEventListener('error', this._handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this._handleUnhandledRejection.bind(this));
        window.addEventListener('beforeunload', this._handleBeforeUnload.bind(this));
        
        // Configurar shortcuts de teclado
        this._setupKeyboardShortcuts();
        
        // Configurar auto-guardado
        this._setupAutoSave();
        
        console.log('✅ Event listeners configurados');
    }

    async _finalize() {
        // Configurar estado inicial
        window.StateManager.setState({
            initialized: true,
            loading: false,
            currentLayer: 'core'
        });

        // Notificar que la aplicación está lista
        window.dispatchEvent(new CustomEvent('app:initialized'));
        
        // Configurar métricas de rendimiento
        this._setupPerformanceMonitoring();
        
        console.log('✅ Inicialización completada');
    }

    _setupMainCanvas() {
        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;

        // Crear canvas principal si no existe
        let canvas = document.getElementById('main-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'main-canvas';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvasContainer.appendChild(canvas);
        }

        // Configurar canvas para alta resolución
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    async _loadDeviceLibrary() {
        // Cargar tipos de dispositivos por defecto
        const defaultDevices = {
            router: { icon: 'R', name: 'Router', ports: ['GE0/0', 'GE0/1'] },
            switch: { icon: 'SW', name: 'Switch', ports: Array.from({length: 24}, (_, i) => `Fe0/${i+1}`) },
            firewall: { icon: 'FW', name: 'Firewall', ports: ['Inside', 'Outside', 'DMZ'] },
            server: { icon: 'SRV', name: 'Server', ports: ['NIC1', 'NIC2'] },
            workstation: { icon: 'PC', name: 'Workstation', ports: ['NIC'] }
        };

        if (window.DeviceManager) {
            await window.DeviceManager.loadDeviceTypes(defaultDevices);
        }
    }

    async _loadDefaultTemplates() {
        const templates = [
            {
                id: 'basic-network',
                name: 'Red Básica',
                description: 'Topología básica para oficina pequeña',
                devices: [
                    { type: 'router', x: 400, y: 200, layer: 'core' },
                    { type: 'switch', x: 400, y: 350, layer: 'access' },
                    { type: 'workstation', x: 200, y: 450, layer: 'user' },
                    { type: 'workstation', x: 600, y: 450, layer: 'user' }
                ]
            }
        ];

        if (window.TemplateManager) {
            await window.TemplateManager.loadTemplates(templates);
        }
    }

    async _loadSavedProject() {
        try {
            const savedData = localStorage.getItem('network-diagram-project');
            if (savedData) {
                const project = JSON.parse(savedData);
                console.log('📂 Proyecto guardado encontrado, cargando...');
                
                if (window.ProjectManager) {
                    await window.ProjectManager.loadProject(project);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error cargando proyecto guardado:', error);
        }
    }

    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S: Guardar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this._saveProject();
            }
            
            // Ctrl+Z: Deshacer
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                if (window.HistoryManager) {
                    window.HistoryManager.undo();
                }
            }
            
            // Delete: Eliminar seleccionado
            if (e.key === 'Delete') {
                if (window.SelectionManager) {
                    window.SelectionManager.deleteSelected();
                }
            }
        });
    }

    _setupAutoSave() {
        // Auto-guardar cada 30 segundos
        setInterval(() => {
            if (this.initialized && window.StateManager.getState().hasChanges) {
                this._saveProject();
            }
        }, 30000);
    }

    _setupPerformanceMonitoring() {
        // Monitorear FPS del canvas
        if (window.CanvasManager) {
            window.CanvasManager.enablePerformanceMonitoring();
        }

        // Monitorear memoria
        if (performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('⚠️ Alto uso de memoria detectado');
                }
            }, 10000);
        }
    }

    _saveProject() {
        try {
            if (window.ProjectManager) {
                const projectData = window.ProjectManager.exportProject();
                localStorage.setItem('network-diagram-project', JSON.stringify(projectData));
                console.log('💾 Proyecto guardado automáticamente');
            }
        } catch (error) {
            console.error('❌ Error guardando proyecto:', error);
        }
    }

    _updateProgress(status) {
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    _updateProgressBar(percent) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }

        // Actualizar también el estado global
        window.StateManager?.setState({ loadingProgress: percent });
    }

    _handleInitError(error) {
        // Mostrar pantalla de error
        const loadingScreen = document.getElementById('loading-screen');
        const errorScreen = document.getElementById('error-screen');
        const errorMessage = document.getElementById('error-message');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (errorScreen) errorScreen.style.display = 'flex';
        if (errorMessage) errorMessage.textContent = error.message;

        // Log detallado para debugging
        console.error('🔴 Detalles del error de inicialización:', {
            step: this.currentStep,
            stepName: this.initSteps[this.currentStep]?.name,
            error: error.message,
            stack: error.stack
        });
    }

    _handleGlobalError(event) {
        console.error('🔴 Error global capturado:', event.error);
        this._showNotification('Error inesperado: ' + event.error.message, 'error');
    }

    _handleUnhandledRejection(event) {
        console.error('🔴 Promise rechazada no manejada:', event.reason);
        this._showNotification('Error de promesa no manejada', 'error');
        event.preventDefault();
    }

    _handleBeforeUnload(event) {
        if (window.StateManager?.getState().hasUnsavedChanges) {
            event.preventDefault();
            event.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        }
    }

    _showNotification(message, type = 'info') {
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type);
        } else {
            // Fallback básico
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Métodos públicos para control externo
    getProgress() {
        return this.loadingProgress;
    }

    getCurrentStep() {
        return this.initSteps[this.currentStep]?.name || 'Desconocido';
    }

    isInitialized() {
        return this.initialized;
    }
}

// Crear instancia global
window.AppInitializer = AppInitializer;