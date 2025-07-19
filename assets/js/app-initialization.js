/**
 * Módulo de Inicialización de la Aplicación
 * Maneja la secuencia de inicialización de todos los componentes
 */

(function() {
    'use strict';

    // Namespace global para la aplicación
    window.NetworkDiagram = window.NetworkDiagram || {};

    // Función de inicialización principal
    window.AppInitializer = {
        // Módulos requeridos
        requiredModules: [
            'DeviceManager',
            'ConnectionManager',
            'CanvasManager',
            'LayerManager',
            'InterfaceManager',
            'StateManager',
            'FileManager',
            'NotificationManager',
            'ModalManager',
            'ToolbarManager',
            'SidebarManager'
        ],

        // Verificar que todos los módulos estén cargados
        checkModules: function() {
            console.log('Verificando módulos...');
            const missingModules = [];
            
            this.requiredModules.forEach(moduleName => {
                if (!window[moduleName]) {
                    missingModules.push(moduleName);
                    console.error(`Módulo faltante: ${moduleName}`);
                } else {
                    console.log(`✓ ${moduleName} cargado`);
                }
            });

            if (missingModules.length > 0) {
                throw new Error(`Módulos faltantes: ${missingModules.join(', ')}`);
            }

            return true;
        },

        // Inicializar configuración base
        initializeConfig: function() {
            window.NetworkDiagram.config = {
                canvas: {
                    width: 5000,
                    height: 5000,
                    gridSize: 20,
                    showGrid: true,
                    backgroundColor: '#f5f5f5'
                },
                zoom: {
                    min: 0.1,
                    max: 3,
                    step: 0.1,
                    current: 1
                },
                autosave: {
                    enabled: true,
                    interval: 30000 // 30 segundos
                },
                defaults: {
                    connectionType: 'utp',
                    deviceLayer: 'access'
                }
            };
            console.log('Configuración inicializada');
        },

        // Inicializar los módulos en orden
        initializeModules: async function() {
            try {
                console.log('Inicializando módulos...');

                // 1. Canvas Manager (base para todo)
                if (window.CanvasManager && window.CanvasManager.init) {
                    await window.CanvasManager.init('networkCanvas');
                    console.log('✓ CanvasManager inicializado');
                }

                // 2. State Manager
                if (window.StateManager && window.StateManager.init) {
                    await window.StateManager.init();
                    console.log('✓ StateManager inicializado');
                }

                // 3. Layer Manager
                if (window.LayerManager && window.LayerManager.init) {
                    await window.LayerManager.init();
                    console.log('✓ LayerManager inicializado');
                }

                // 4. Device Manager
                if (window.DeviceManager && window.DeviceManager.init) {
                    await window.DeviceManager.init();
                    console.log('✓ DeviceManager inicializado');
                }

                // 5. Connection Manager
                if (window.ConnectionManager && window.ConnectionManager.init) {
                    await window.ConnectionManager.init();
                    console.log('✓ ConnectionManager inicializado');
                }

                // 6. UI Components
                if (window.ModalManager && window.ModalManager.init) {
                    await window.ModalManager.init();
                    console.log('✓ ModalManager inicializado');
                }

                if (window.NotificationManager && window.NotificationManager.init) {
                    await window.NotificationManager.init();
                    console.log('✓ NotificationManager inicializado');
                }

                if (window.ToolbarManager && window.ToolbarManager.init) {
                    await window.ToolbarManager.init();
                    console.log('✓ ToolbarManager inicializado');
                }

                if (window.SidebarManager && window.SidebarManager.init) {
                    await window.SidebarManager.init();
                    console.log('✓ SidebarManager inicializado');
                }

                // 7. Interface Manager (después de UI)
                if (window.InterfaceManager && window.InterfaceManager.init) {
                    await window.InterfaceManager.init();
                    console.log('✓ InterfaceManager inicializado');
                }

                // 8. File Manager
                if (window.FileManager && window.FileManager.init) {
                    await window.FileManager.init();
                    console.log('✓ FileManager inicializado');
                }

                console.log('Todos los módulos inicializados correctamente');
                return true;

            } catch (error) {
                console.error('Error durante la inicialización de módulos:', error);
                throw error;
            }
        },

        // Configurar event listeners globales
        setupEventListeners: function() {
            // Prevenir comportamiento por defecto de drag & drop
            document.addEventListener('dragover', function(e) {
                e.preventDefault();
            });

            document.addEventListener('drop', function(e) {
                e.preventDefault();
            });

            // Atajos de teclado globales
            document.addEventListener('keydown', function(e) {
                // Ctrl+S: Guardar
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    if (window.FileManager && window.FileManager.save) {
                        window.FileManager.save();
                    }
                }
                
                // Ctrl+O: Abrir
                if (e.ctrlKey && e.key === 'o') {
                    e.preventDefault();
                    if (window.FileManager && window.FileManager.load) {
                        window.FileManager.load();
                    }
                }
                
                // Delete: Eliminar selección
                if (e.key === 'Delete') {
                    if (window.DeviceManager && window.DeviceManager.deleteSelected) {
                        window.DeviceManager.deleteSelected();
                    }
                }
            });

            console.log('Event listeners configurados');
        },

        // Cargar datos iniciales
        loadInitialData: async function() {
            try {
                // Cargar tipos de dispositivos
                const response = await fetch('data/device-types.json');
                if (response.ok) {
                    const deviceTypes = await response.json();
                    window.NetworkDiagram.deviceTypes = deviceTypes;
                    console.log('Tipos de dispositivos cargados');
                }

                // Cargar configuración por defecto
                const configResponse = await fetch('data/default-configs.json');
                if (configResponse.ok) {
                    const defaultConfigs = await configResponse.json();
                    Object.assign(window.NetworkDiagram.config, defaultConfigs);
                    console.log('Configuración por defecto cargada');
                }

                return true;
            } catch (error) {
                console.warn('Error al cargar datos iniciales:', error);
                // No es crítico, continuar con valores por defecto
                return true;
            }
        },

        // Inicialización principal
        init: async function() {
            console.log('=== Iniciando Network Diagram Creator ===');
            
            try {
                // 1. Verificar módulos
                this.checkModules();
                
                // 2. Inicializar configuración
                this.initializeConfig();
                
                // 3. Cargar datos iniciales
                await this.loadInitialData();
                
                // 4. Inicializar módulos
                await this.initializeModules();
                
                // 5. Configurar event listeners
                this.setupEventListeners();
                
                // 6. Marcar como listo
                window.NetworkDiagram.ready = true;
                
                // 7. Disparar evento de aplicación lista
                const event = new CustomEvent('app:ready', { 
                    detail: { timestamp: Date.now() } 
                });
                document.dispatchEvent(event);
                
                console.log('=== Aplicación iniciada correctamente ===');
                
                // Mostrar notificación de bienvenida
                if (window.NotificationManager) {
                    window.NotificationManager.show('¡Bienvenido a Network Diagram Creator!', 'success');
                }
                
                return true;
                
            } catch (error) {
                console.error('Error fatal durante la inicialización:', error);
                
                // Mostrar error en la UI
                const errorContainer = document.createElement('div');
                errorContainer.className = 'initialization-error';
                errorContainer.innerHTML = `
                    <h2>Error de Inicialización</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Recargar Página</button>
                `;
                document.body.appendChild(errorContainer);
                
                throw error;
            }
        }
    };

    // Exponer globalmente
    window.AppInitializer = window.AppInitializer;

})();