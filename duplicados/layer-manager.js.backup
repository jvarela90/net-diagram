/**
 * LayerManager - Gestor de capas para diagramas de red
 * Maneja la organización jerárquica de dispositivos en capas lógicas
 * Capas soportadas: ISP, WAN, Core, Distribution, Access, DMZ, User, IoT
 */

class LayerManager {
    constructor() {
        this.layers = new Map();
        this.layerOrder = ['ISP', 'WAN', 'Core', 'Distribution', 'Access', 'DMZ', 'User', 'IoT'];
        this.layerColors = {
            'ISP': '#FF6B6B',
            'WAN': '#4ECDC4', 
            'Core': '#45B7D1',
            'Distribution': '#96CEB4',
            'Access': '#FECA57',
            'DMZ': '#FF9FF3',
            'User': '#54A0FF',
            'IoT': '#5F27CD'
        };
        this.layerVisibility = new Map();
        this.deviceLayers = new Map(); // Mapea device ID a layer
        this.init();
    }

    /**
     * Inicializa el gestor de capas
     */
    init() {
        // Inicializar todas las capas
        this.layerOrder.forEach(layerName => {
            this.layers.set(layerName, {
                name: layerName,
                devices: new Set(),
                visible: true,
                color: this.layerColors[layerName],
                description: this.getLayerDescription(layerName),
                yPosition: this.getLayerYPosition(layerName)
            });
            this.layerVisibility.set(layerName, true);
        });

        this.createLayerControls();
        this.attachEventListeners();
    }

    /**
     * Obtiene la descripción de una capa
     */
    getLayerDescription(layerName) {
        const descriptions = {
            'ISP': 'Proveedor de Servicios de Internet',
            'WAN': 'Red de Área Amplia',
            'Core': 'Núcleo de la red - equipos principales',
            'Distribution': 'Capa de distribución - agregación',
            'Access': 'Capa de acceso - conexión de usuarios',
            'DMZ': 'Zona desmilitarizada - servicios públicos',
            'User': 'Dispositivos de usuario final',
            'IoT': 'Dispositivos Internet de las Cosas'
        };
        return descriptions[layerName] || '';
    }

    /**
     * Calcula la posición Y sugerida para una capa
     */
    getLayerYPosition(layerName) {
        const index = this.layerOrder.indexOf(layerName);
        return 100 + (index * 120); // Espaciado de 120px entre capas
    }

    /**
     * Asigna un dispositivo a una capa
     */
    assignDeviceToLayer(deviceId, layerName) {
        if (!this.layers.has(layerName)) {
            console.warn(`Capa ${layerName} no existe`);
            return false;
        }

        // Remover de capa anterior si existe
        this.removeDeviceFromLayer(deviceId);

        // Asignar a nueva capa
        this.layers.get(layerName).devices.add(deviceId);
        this.deviceLayers.set(deviceId, layerName);

        // Disparar evento
        this.dispatchEvent('deviceAssigned', {
            deviceId,
            layerName,
            layer: this.layers.get(layerName)
        });

        this.updateLayerVisuals();
        return true;
    }

    /**
     * Remueve un dispositivo de su capa actual
     */
    removeDeviceFromLayer(deviceId) {
        const currentLayer = this.deviceLayers.get(deviceId);
        if (currentLayer && this.layers.has(currentLayer)) {
            this.layers.get(currentLayer).devices.delete(deviceId);
            this.deviceLayers.delete(deviceId);
            
            this.dispatchEvent('deviceRemoved', {
                deviceId,
                layerName: currentLayer
            });
        }
    }

    /**
     * Obtiene la capa de un dispositivo
     */
    getDeviceLayer(deviceId) {
        return this.deviceLayers.get(deviceId) || null;
    }

    /**
     * Obtiene todos los dispositivos de una capa
     */
    getLayerDevices(layerName) {
        const layer = this.layers.get(layerName);
        return layer ? Array.from(layer.devices) : [];
    }

    /**
     * Alterna la visibilidad de una capa
     */
    toggleLayerVisibility(layerName) {
        if (!this.layers.has(layerName)) return false;

        const layer = this.layers.get(layerName);
        layer.visible = !layer.visible;
        this.layerVisibility.set(layerName, layer.visible);

        this.updateDeviceVisibility(layerName);
        this.updateLayerControls();
        
        this.dispatchEvent('layerVisibilityChanged', {
            layerName,
            visible: layer.visible
        });

        return layer.visible;
    }

    /**
     * Establece la visibilidad de una capa
     */
    setLayerVisibility(layerName, visible) {
        if (!this.layers.has(layerName)) return false;

        const layer = this.layers.get(layerName);
        layer.visible = visible;
        this.layerVisibility.set(layerName, visible);

        this.updateDeviceVisibility(layerName);
        this.updateLayerControls();
        
        this.dispatchEvent('layerVisibilityChanged', {
            layerName,
            visible
        });

        return true;
    }

    /**
     * Actualiza la visibilidad de dispositivos en una capa
     */
    updateDeviceVisibility(layerName) {
        const layer = this.layers.get(layerName);
        if (!layer) return;

        layer.devices.forEach(deviceId => {
            const deviceElement = document.querySelector(`[data-device-id="${deviceId}"]`);
            if (deviceElement) {
                deviceElement.style.display = layer.visible ? 'block' : 'none';
                deviceElement.classList.toggle('layer-hidden', !layer.visible);
            }
        });
    }

    /**
     * Organiza automáticamente los dispositivos por capas
     */
    autoOrganizeByLayers() {
        this.layerOrder.forEach((layerName, index) => {
            const layer = this.layers.get(layerName);
            const yPosition = layer.yPosition;
            
            let xOffset = 100;
            const deviceSpacing = 150;

            layer.devices.forEach(deviceId => {
                const deviceElement = document.querySelector(`[data-device-id="${deviceId}"]`);
                if (deviceElement && layer.visible) {
                    // Animar posición
                    this.animateDevicePosition(deviceElement, xOffset, yPosition);
                    xOffset += deviceSpacing;
                }
            });
        });

        this.dispatchEvent('layersOrganized');
    }

    /**
     * Anima la posición de un dispositivo
     */
    animateDevicePosition(element, x, y) {
        element.style.transition = 'all 0.3s ease-in-out';
        element.style.left = x + 'px';
        element.style.top = y + 'px';
    }

    /**
     * Crea los controles de capas en la UI
     */
    createLayerControls() {
        const sidebar = document.querySelector('.sidebar') || document.body;
        
        const layerPanel = document.createElement('div');
        layerPanel.className = 'layer-panel';
        layerPanel.innerHTML = `
            <div class="layer-panel-header">
                <h3>Capas de Red</h3>
                <button class="btn-organize" title="Organizar por capas">
                    <i class="icon-organize"></i>
                </button>
            </div>
            <div class="layer-controls"></div>
        `;

        const controlsContainer = layerPanel.querySelector('.layer-controls');
        
        this.layerOrder.forEach(layerName => {
            const layer = this.layers.get(layerName);
            const layerControl = this.createLayerControl(layer);
            controlsContainer.appendChild(layerControl);
        });

        sidebar.appendChild(layerPanel);
    }

    /**
     * Crea un control individual para una capa
     */
    createLayerControl(layer) {
        const control = document.createElement('div');
        control.className = 'layer-control';
        control.dataset.layer = layer.name;
        
        control.innerHTML = `
            <div class="layer-header">
                <div class="layer-color" style="background-color: ${layer.color}"></div>
                <span class="layer-name">${layer.name}</span>
                <div class="layer-actions">
                    <button class="btn-layer-visibility" data-visible="${layer.visible}">
                        <i class="icon-${layer.visible ? 'eye' : 'eye-off'}"></i>
                    </button>
                    <span class="device-count">${layer.devices.size}</span>
                </div>
            </div>
            <div class="layer-description">${layer.description}</div>
        `;

        return control;
    }

    /**
     * Actualiza los controles de capas
     */
    updateLayerControls() {
        this.layerOrder.forEach(layerName => {
            const layer = this.layers.get(layerName);
            const control = document.querySelector(`[data-layer="${layerName}"]`);
            
            if (control) {
                const visibilityBtn = control.querySelector('.btn-layer-visibility');
                const deviceCount = control.querySelector('.device-count');
                const icon = visibilityBtn.querySelector('i');
                
                visibilityBtn.dataset.visible = layer.visible;
                icon.className = `icon-${layer.visible ? 'eye' : 'eye-off'}`;
                deviceCount.textContent = layer.devices.size;
                
                control.classList.toggle('layer-hidden', !layer.visible);
            }
        });
    }

    /**
     * Actualiza visuales de las capas en el canvas
     */
    updateLayerVisuals() {
        // Actualizar indicadores visuales en el canvas
        this.layerOrder.forEach(layerName => {
            const layer = this.layers.get(layerName);
            this.drawLayerBackground(layer);
        });
    }

    /**
     * Dibuja el fondo de una capa en el canvas
     */
    drawLayerBackground(layer) {
        const canvas = document.querySelector('#main-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const layerHeight = 100;
        
        if (layer.visible && layer.devices.size > 0) {
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = layer.color;
            ctx.fillRect(0, layer.yPosition - 50, canvasWidth, layerHeight);
            
            // Etiqueta de la capa
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = layer.color;
            ctx.font = 'bold 12px Arial';
            ctx.fillText(layer.name, 10, layer.yPosition - 30);
            ctx.restore();
        }
    }

    /**
     * Adjunta event listeners
     */
    attachEventListeners() {
        // Event listener para controles de visibilidad
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-layer-visibility')) {
                const layerControl = e.target.closest('.layer-control');
                const layerName = layerControl.dataset.layer;
                this.toggleLayerVisibility(layerName);
            }
            
            if (e.target.closest('.btn-organize')) {
                this.autoOrganizeByLayers();
            }
        });

        // Event listener para drag and drop entre capas
        document.addEventListener('dragover', (e) => {
            const layerControl = e.target.closest('.layer-control');
            if (layerControl) {
                e.preventDefault();
                layerControl.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const layerControl = e.target.closest('.layer-control');
            if (layerControl) {
                layerControl.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            const layerControl = e.target.closest('.layer-control');
            if (layerControl) {
                e.preventDefault();
                layerControl.classList.remove('drag-over');
                
                const layerName = layerControl.dataset.layer;
                const deviceId = e.dataTransfer.getData('text/device-id');
                
                if (deviceId) {
                    this.assignDeviceToLayer(deviceId, layerName);
                }
            }
        });
    }

    /**
     * Obtiene estadísticas de las capas
     */
    getLayerStats() {
        const stats = {};
        this.layerOrder.forEach(layerName => {
            const layer = this.layers.get(layerName);
            stats[layerName] = {
                deviceCount: layer.devices.size,
                visible: layer.visible,
                color: layer.color
            };
        });
        return stats;
    }

    /**
     * Exporta configuración de capas
     */
    exportLayerConfig() {
        const config = {
            layers: {},
            deviceAssignments: {}
        };

        this.layers.forEach((layer, name) => {
            config.layers[name] = {
                visible: layer.visible,
                color: layer.color,
                description: layer.description,
                yPosition: layer.yPosition
            };
        });

        this.deviceLayers.forEach((layer, deviceId) => {
            config.deviceAssignments[deviceId] = layer;
        });

        return config;
    }

    /**
     * Importa configuración de capas
     */
    importLayerConfig(config) {
        if (config.layers) {
            Object.entries(config.layers).forEach(([name, layerConfig]) => {
                const layer = this.layers.get(name);
                if (layer) {
                    layer.visible = layerConfig.visible;
                    layer.color = layerConfig.color || layer.color;
                    layer.description = layerConfig.description || layer.description;
                    layer.yPosition = layerConfig.yPosition || layer.yPosition;
                }
            });
        }

        if (config.deviceAssignments) {
            Object.entries(config.deviceAssignments).forEach(([deviceId, layerName]) => {
                this.assignDeviceToLayer(deviceId, layerName);
            });
        }

        this.updateLayerControls();
        this.updateLayerVisuals();
    }

    /**
     * Limpia todas las asignaciones de dispositivos
     */
    clearAllAssignments() {
        this.deviceLayers.clear();
        this.layers.forEach(layer => {
            layer.devices.clear();
        });
        this.updateLayerControls();
        this.dispatchEvent('layersCleared');
    }

    /**
     * Valida la topología de capas
     */
    validateLayerTopology() {
        const issues = [];
        
        // Verificar dispositivos sin capa asignada
        const allDevices = document.querySelectorAll('[data-device-id]');
        allDevices.forEach(device => {
            const deviceId = device.dataset.deviceId;
            if (!this.deviceLayers.has(deviceId)) {
                issues.push({
                    type: 'unassigned_device',
                    deviceId,
                    message: `Dispositivo ${deviceId} no tiene capa asignada`
                });
            }
        });

        // Verificar capas vacías que deberían tener dispositivos
        const criticalLayers = ['Core', 'Distribution', 'Access'];
        criticalLayers.forEach(layerName => {
            const layer = this.layers.get(layerName);
            if (layer.devices.size === 0) {
                issues.push({
                    type: 'empty_critical_layer',
                    layerName,
                    message: `Capa crítica ${layerName} está vacía`
                });
            }
        });

        return issues;
    }

    /**
     * Dispatcher de eventos personalizado
     */
    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(`layerManager:${eventName}`, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    /**
     * Destructor - limpia recursos
     */
    destroy() {
        const layerPanel = document.querySelector('.layer-panel');
        if (layerPanel) {
            layerPanel.remove();
        }
        
        this.layers.clear();
        this.deviceLayers.clear();
        this.layerVisibility.clear();
    }
}

// Exportar para uso global
window.LayerManager = LayerManager;

// Auto-inicialización si DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.layerManager = new LayerManager();
    });
} else {
    window.layerManager = new LayerManager();
}