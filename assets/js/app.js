/**
 * Network Diagram Creator - Aplicación Principal
 * Coordina todos los módulos y maneja el estado global
 */

(function() {
    'use strict';

    // Aplicación principal
    window.App = {
        // Estado de la aplicación
        state: {
            currentTool: 'select',
            selectedDevices: [],
            selectedConnections: [],
            isConnecting: false,
            connectingFrom: null,
            isDragging: false,
            isMultiSelecting: false,
            clipboard: null,
            history: [],
            historyIndex: -1
        },

        // Referencia a los módulos
        modules: {},

        // Inicializar la aplicación
        init: async function() {
            console.log('App.init() llamado');
            
            try {
                // Usar el inicializador
                if (window.AppInitializer) {
                    await window.AppInitializer.init();
                    
                    // Guardar referencias a los módulos
                    this.modules = {
                        canvas: window.CanvasManager,
                        devices: window.DeviceManager,
                        connections: window.ConnectionManager,
                        layers: window.LayerManager,
                        interface: window.InterfaceManager,
                        state: window.StateManager,
                        files: window.FileManager,
                        notifications: window.NotificationManager,
                        modal: window.ModalManager,
                        toolbar: window.ToolbarManager,
                        sidebar: window.SidebarManager
                    };
                    
                    // Configurar handlers
                    this.setupHandlers();
                    
                    // Cargar proyecto guardado si existe
                    this.loadLastProject();
                    
                } else {
                    throw new Error('AppInitializer no está disponible');
                }
                
            } catch (error) {
                console.error('Error al inicializar App:', error);
                this.showError(error);
            }
        },

        // Configurar manejadores de eventos
        setupHandlers: function() {
            // Botones del header
            const newBtn = document.getElementById('newDiagram');
            const saveBtn = document.getElementById('saveDiagram');
            const loadBtn = document.getElementById('loadDiagram');
            const exportBtn = document.getElementById('exportDiagram');

            if (newBtn) newBtn.addEventListener('click', () => this.newDiagram());
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveDiagram());
            if (loadBtn) loadBtn.addEventListener('click', () => this.loadDiagram());
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportDiagram());

            // Escuchar eventos personalizados
            document.addEventListener('device:selected', (e) => this.handleDeviceSelection(e.detail));
            document.addEventListener('connection:created', (e) => this.handleConnectionCreated(e.detail));
            document.addEventListener('tool:changed', (e) => this.handleToolChange(e.detail));

            console.log('Handlers configurados');
        },

        // Crear nuevo diagrama
        newDiagram: function() {
            if (this.state.history.length > 0) {
                this.modules.modal.confirm(
                    '¿Crear nuevo diagrama?',
                    'Se perderán los cambios no guardados.',
                    () => {
                        this.clearDiagram();
                        this.modules.notifications.show('Nuevo diagrama creado', 'info');
                    }
                );
            } else {
                this.clearDiagram();
            }
        },

        // Limpiar diagrama
        clearDiagram: function() {
            if (this.modules.devices) this.modules.devices.clear();
            if (this.modules.connections) this.modules.connections.clear();
            if (this.modules.canvas) this.modules.canvas.clear();
            
            this.state.history = [];
            this.state.historyIndex = -1;
            this.state.selectedDevices = [];
            this.state.selectedConnections = [];
        },

        // Guardar diagrama
        saveDiagram: function() {
            try {
                const data = this.exportData();
                this.modules.files.save(data);
                this.modules.notifications.show('Diagrama guardado correctamente', 'success');
            } catch (error) {
                this.modules.notifications.show('Error al guardar: ' + error.message, 'error');
            }
        },

        // Cargar diagrama
        loadDiagram: function() {
            this.modules.files.load((data) => {
                try {
                    this.importData(data);
                    this.modules.notifications.show('Diagrama cargado correctamente', 'success');
                } catch (error) {
                    this.modules.notifications.show('Error al cargar: ' + error.message, 'error');
                }
            });
        },

        // Exportar diagrama
        exportDiagram: function() {
            this.modules.modal.show({
                title: 'Exportar Diagrama',
                content: `
                    <div class="export-options">
                        <button class="btn btn-primary" onclick="App.exportAs('png')">
                            <i class="fas fa-image"></i> Exportar como PNG
                        </button>
                        <button class="btn btn-primary" onclick="App.exportAs('svg')">
                            <i class="fas fa-vector-square"></i> Exportar como SVG
                        </button>
                        <button class="btn btn-primary" onclick="App.exportAs('pdf')">
                            <i class="fas fa-file-pdf"></i> Exportar como PDF
                        </button>
                        <button class="btn btn-primary" onclick="App.exportAs('json')">
                            <i class="fas fa-code"></i> Exportar como JSON
                        </button>
                    </div>
                `
            });
        },

        // Exportar en formato específico
        exportAs: function(format) {
            try {
                this.modules.modal.close();
                
                switch(format) {
                    case 'png':
                    case 'svg':
                    case 'pdf':
                        this.modules.canvas.export(format);
                        break;
                    case 'json':
                        const data = this.exportData();
                        this.modules.files.download(JSON.stringify(data, null, 2), 'diagram.json', 'application/json');
                        break;
                }
                
                this.modules.notifications.show(`Exportado como ${format.toUpperCase()}`, 'success');
            } catch (error) {
                this.modules.notifications.show('Error al exportar: ' + error.message, 'error');
            }
        },

        // Exportar datos del diagrama
        exportData: function() {
            return {
                version: '3.0',
                timestamp: new Date().toISOString(),
                canvas: {
                    width: this.modules.canvas.width,
                    height: this.modules.canvas.height,
                    zoom: this.modules.canvas.zoom
                },
                devices: this.modules.devices.export(),
                connections: this.modules.connections.export(),
                layers: this.modules.layers.export(),
                metadata: {
                    title: document.getElementById('diagramTitle')?.value || 'Sin título',
                    description: document.getElementById('diagramDescription')?.value || '',
                    author: 'Network Diagram Creator'
                }
            };
        },

        // Importar datos del diagrama
        importData: function(data) {
            // Validar versión
            if (!data.version || data.version < '3.0') {
                throw new Error('Formato de archivo no compatible');
            }

            // Limpiar diagrama actual
            this.clearDiagram();

            // Importar canvas
            if (data.canvas) {
                this.modules.canvas.setSize(data.canvas.width, data.canvas.height);
                this.modules.canvas.setZoom(data.canvas.zoom || 1);
            }

            // Importar capas
            if (data.layers) {
                this.modules.layers.import(data.layers);
            }

            // Importar dispositivos
            if (data.devices) {
                this.modules.devices.import(data.devices);
            }

            // Importar conexiones
            if (data.connections) {
                this.modules.connections.import(data.connections);
            }

            // Actualizar metadatos
            if (data.metadata) {
                const titleEl = document.getElementById('diagramTitle');
                const descEl = document.getElementById('diagramDescription');
                if (titleEl) titleEl.value = data.metadata.title || '';
                if (descEl) descEl.value = data.metadata.description || '';
            }

            // Redibujar
            this.modules.canvas.render();
        },

        // Cargar último proyecto
        loadLastProject: function() {
            const lastProject = localStorage.getItem('lastProject');
            if (lastProject) {
                try {
                    const data = JSON.parse(lastProject);
                    this.importData(data);
                    console.log('Último proyecto cargado');
                } catch (error) {
                    console.warn('No se pudo cargar el último proyecto:', error);
                }
            }
        },

        // Auto-guardar
        enableAutosave: function() {
            setInterval(() => {
                try {
                    const data = this.exportData();
                    localStorage.setItem('lastProject', JSON.stringify(data));
                    console.log('Auto-guardado completado');
                } catch (error) {
                    console.error('Error en auto-guardado:', error);
                }
            }, 30000); // Cada 30 segundos
        },

        // Manejar selección de dispositivos
        handleDeviceSelection: function(device) {
            if (this.state.currentTool === 'select') {
                this.state.selectedDevices = [device];
                this.modules.sidebar.showDeviceProperties(device);
            }
        },

        // Manejar creación de conexiones
        handleConnectionCreated: function(connection) {
            this.addToHistory({
                type: 'connection:create',
                data: connection
            });
        },

        // Manejar cambio de herramienta
        handleToolChange: function(tool) {
            this.state.currentTool = tool;
            
            // Limpiar estados según la herramienta
            if (tool !== 'connect') {
                this.state.isConnecting = false;
                this.state.connectingFrom = null;
            }
        },

        // Agregar a historial (para undo/redo)
        addToHistory: function(action) {
            // Eliminar acciones posteriores al índice actual
            this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
            
            // Agregar nueva acción
            this.state.history.push(action);
            this.state.historyIndex++;
            
            // Limitar tamaño del historial
            if (this.state.history.length > 50) {
                this.state.history.shift();
                this.state.historyIndex--;
            }
        },

        // Deshacer
        undo: function() {
            if (this.state.historyIndex > 0) {
                this.state.historyIndex--;
                const action = this.state.history[this.state.historyIndex];
                this.revertAction(action);
            }
        },

        // Rehacer
        redo: function() {
            if (this.state.historyIndex < this.state.history.length - 1) {
                this.state.historyIndex++;
                const action = this.state.history[this.state.historyIndex];
                this.applyAction(action);
            }
        },

        // Mostrar error
        showError: function(error) {
            console.error('Error en la aplicación:', error);
            
            if (this.modules.notifications) {
                this.modules.notifications.show(error.message, 'error');
            } else {
                alert('Error: ' + error.message);
            }
        },

        // Revertir acción (para undo)
        revertAction: function(action) {
            switch(action.type) {
                case 'device:create':
                    this.modules.devices.remove(action.data.id);
                    break;
                case 'device:delete':
                    this.modules.devices.restore(action.data);
                    break;
                case 'connection:create':
                    this.modules.connections.remove(action.data.id);
                    break;
                case 'connection:delete':
                    this.modules.connections.restore(action.data);
                    break;
            }
        },

        // Aplicar acción (para redo)
        applyAction: function(action) {
            switch(action.type) {
                case 'device:create':
                    this.modules.devices.restore(action.data);
                    break;
                case 'device:delete':
                    this.modules.devices.remove(action.data.id);
                    break;
                case 'connection:create':
                    this.modules.connections.restore(action.data);
                    break;
                case 'connection:delete':
                    this.modules.connections.remove(action.data.id);
                    break;
            }
        },

        // Obtener herramienta actual
        getCurrentTool: function() {
            return this.state.currentTool;
        },

        // Establecer herramienta
        setTool: function(tool) {
            this.state.currentTool = tool;
            document.dispatchEvent(new CustomEvent('tool:changed', { detail: tool }));
        },

        // API pública para módulos externos
        api: {
            getState: () => this.state,
            setTool: (tool) => this.setTool(tool),
            undo: () => this.undo(),
            redo: () => this.redo(),
            save: () => this.saveDiagram(),
            load: () => this.loadDiagram(),
            export: (format) => this.exportAs(format),
            new: () => this.newDiagram()
        }
    };

    // Exponer globalmente
    window.App = window.App;

})();