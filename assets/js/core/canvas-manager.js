/**
 * CanvasManager - Gestión del canvas principal
 * VERSIÓN CORREGIDA - Soluciona errores de elementos DOM null
 */

class CanvasManager {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.initialized = false;
        this.animationFrameId = null;
        
        // Estado del canvas
        this.state = {
            zoom: 1,
            panX: 0,
            panY: 0,
            width: 800,
            height: 600,
            gridVisible: true,
            snapToGrid: true,
            isDragging: false,
            lastMousePos: { x: 0, y: 0 }
        };
        
        // Configuración
        this.config = {
            minZoom: 0.1,
            maxZoom: 5,
            zoomStep: 0.1,
            gridSize: 20,
            backgroundColor: '#ffffff',
            gridColor: '#e0e0e0'
        };
        
        // Bind de métodos para evitar problemas de contexto
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        
        console.log('🖼️ CanvasManager constructor ejecutado');
    }

    async initialize() {
        if (this.initialized) {
            console.log('✅ CanvasManager ya inicializado');
            return;
        }

        try {
            console.log('🔧 Inicializando CanvasManager...');
            
            // Verificar dependencias
            await this.checkDependencies();
            
            // Buscar o crear canvas
            await this.setupCanvas();
            
            // Configurar contexto
            this.setupContext();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar redimensionado
            this.setupResize();
            
            // Configurar render loop
            this.setupRenderLoop();
            
            // Render inicial
            this.render();
            
            this.initialized = true;
            console.log('✅ CanvasManager inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando CanvasManager:', error);
            throw error;
        }
    }

    async checkDependencies() {
        // Verificar StateManager
        if (!window.StateManager) {
            throw new Error('StateManager no está disponible');
        }
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        console.log('✅ Dependencias de CanvasManager verificadas');
    }

    async setupCanvas() {
        // Buscar contenedor de canvas
        const container = this.findCanvasContainer();
        if (!container) {
            throw new Error('No se encontró contenedor de canvas');
        }
        
        // Buscar canvas existente o crear uno nuevo
        this.canvas = container.querySelector('canvas#main-canvas');
        
        if (!this.canvas) {
            console.log('📄 Creando nuevo canvas...');
            this.canvas = this.createCanvas();
            container.appendChild(this.canvas);
        }
        
        // Configurar atributos del canvas
        this.canvas.id = 'main-canvas';
        this.canvas.style.display = 'block';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1';
        
        // Ocultar placeholder si existe
        const placeholder = document.getElementById('canvas-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        console.log('✅ Canvas configurado');
    }

    findCanvasContainer() {
        // Buscar en orden de preferencia
        const selectors = [
            '#canvas-container',
            '.canvas-container',
            '#canvas-area .canvas-container',
            '#main-content .canvas-container'
        ];
        
        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`📍 Contenedor de canvas encontrado: ${selector}`);
                return container;
            }
        }
        
        console.warn('⚠️ No se encontró contenedor de canvas, creando uno temporal');
        return this.createTemporaryContainer();
    }

    createTemporaryContainer() {
        const container = document.createElement('div');
        container.id = 'canvas-container';
        container.style.cssText = `
            position: fixed;
            top: 60px;
            left: 300px;
            right: 0;
            bottom: 0;
            background: #ffffff;
            overflow: hidden;
            z-index: 1;
        `;
        
        document.body.appendChild(container);
        console.log('📦 Contenedor temporal de canvas creado');
        return container;
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        return canvas;
    }

    async init() {
        return this.initialize();
    }

    setupContext() {
        this.context = this.canvas.getContext('2d');
        
        if (!this.context) {
            throw new Error('No se pudo obtener contexto 2D del canvas');
        }
        
        // Configurar propiedades del contexto
        this.context.imageSmoothingEnabled = true;
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        
        console.log('✅ Contexto del canvas configurado');
    }

    setupEventListeners() {
        if (!this.canvas) {
            console.error('❌ Canvas no disponible para configurar eventos');
            return;
        }

        try {
            // Eventos de mouse
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('mouseup', this.handleMouseUp);
            this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
            
            // Eventos de teclado (en el documento)
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            
            // Prevenir menú contextual
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            
            console.log('✅ Event listeners del canvas configurados');
        } catch (error) {
            console.error('❌ Error configurando event listeners:', error);
        }
    }

    setupResize() {
        // Configurar redimensionado inicial
        this.handleResize();
        
        // Escuchar cambios de tamaño
        window.addEventListener('resize', this.handleResize);
        
        // Observer para cambios en el contenedor
        if (window.ResizeObserver) {
            const container = this.canvas.parentElement;
            const observer = new ResizeObserver(() => {
                this.handleResize();
            });
            observer.observe(container);
        }
        
        console.log('✅ Sistema de redimensionado configurado');
    }

    setupRenderLoop() {
        // Configurar loop de renderizado
        const render = () => {
            this.render();
            this.animationFrameId = requestAnimationFrame(render);
        };
        
        this.animationFrameId = requestAnimationFrame(render);
        console.log('🔄 Loop de renderizado iniciado');
    }

    // Event Handlers
    handleResize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Actualizar tamaño del canvas
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Ajustar estilo para mantener tamaño visual
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Escalar contexto para DPI alta
        if (this.context) {
            this.context.scale(dpr, dpr);
        }
        
        // Actualizar estado
        this.state.width = rect.width;
        this.state.height = rect.height;
        
        // Actualizar en StateManager
        if (window.StateManager) {
            window.StateManager.setCanvasSize(rect.width, rect.height);
        }
        
        console.log(`📐 Canvas redimensionado: ${rect.width}x${rect.height}`);
    }

    handleMouseDown(e) {
        this.state.isDragging = true;
        this.state.lastMousePos = { x: e.clientX, y: e.clientY };
        
        // Cambiar cursor
        this.canvas.style.cursor = 'grabbing';
        
        // Prevenir selección de texto
        e.preventDefault();
    }

    handleMouseMove(e) {
        const currentPos = { x: e.clientX, y: e.clientY };
        
        if (this.state.isDragging) {
            // Calcular delta
            const deltaX = currentPos.x - this.state.lastMousePos.x;
            const deltaY = currentPos.y - this.state.lastMousePos.y;
            
            // Actualizar pan
            this.state.panX += deltaX;
            this.state.panY += deltaY;
            
            // Actualizar última posición
            this.state.lastMousePos = currentPos;
            
            // Actualizar en StateManager
            if (window.StateManager) {
                window.StateManager.updateCanvasTransform({
                    panX: this.state.panX,
                    panY: this.state.panY
                });
            }
        }
        
        // Actualizar coordenadas en UI
        this.updateMouseCoordinates(e);
    }

    handleMouseUp(e) {
        this.state.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    handleWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            
            // Zoom con rueda del mouse
            const delta = e.deltaY > 0 ? -this.config.zoomStep : this.config.zoomStep;
            this.adjustZoom(delta);
        }
    }

    handleKeyDown(e) {
        // Atajos de teclado para canvas
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return; // Ignorar si está en un input
        }
        
        switch (e.key) {
            case '0':
                this.zoomToFit();
                break;
            case '+':
            case '=':
                this.adjustZoom(this.config.zoomStep);
                break;
            case '-':
                this.adjustZoom(-this.config.zoomStep);
                break;
        }
    }

    updateMouseCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convertir a coordenadas de canvas
        const canvasX = (x - this.state.panX) / this.state.zoom;
        const canvasY = (y - this.state.panY) / this.state.zoom;
        
        // Actualizar en UI
        const coordsElement = document.getElementById('canvas-coordinates');
        if (coordsElement) {
            coordsElement.textContent = `X: ${Math.round(canvasX)}, Y: ${Math.round(canvasY)}`;
        }
    }

    // Métodos de zoom
    adjustZoom(delta) {
        const newZoom = Math.max(
            this.config.minZoom,
            Math.min(this.config.maxZoom, this.state.zoom + delta)
        );
        
        if (newZoom !== this.state.zoom) {
            this.state.zoom = newZoom;
            
            // Actualizar en StateManager
            if (window.StateManager) {
                window.StateManager.updateCanvasTransform({ zoom: newZoom });
            }
            
            // Actualizar display de zoom
            this.updateZoomDisplay();
        }
    }

    zoomToFit() {
        // Obtener bounds de todos los dispositivos
        const devices = window.StateManager?.getState().devices;
        if (!devices || devices.size === 0) {
            this.resetView();
            return;
        }
        
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        for (const device of devices.values()) {
            minX = Math.min(minX, device.x);
            minY = Math.min(minY, device.y);
            maxX = Math.max(maxX, device.x);
            maxY = Math.max(maxY, device.y);
        }
        
        // Agregar margen
        const margin = 50;
        minX -= margin;
        minY -= margin;
        maxX += margin;
        maxY += margin;
        
        // Calcular zoom necesario
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const zoomX = this.state.width / contentWidth;
        const zoomY = this.state.height / contentHeight;
        
        this.state.zoom = Math.min(zoomX, zoomY, this.config.maxZoom);
        
        // Centrar contenido
        this.state.panX = (this.state.width - contentWidth * this.state.zoom) / 2 - minX * this.state.zoom;
        this.state.panY = (this.state.height - contentHeight * this.state.zoom) / 2 - minY * this.state.zoom;
        
        // Actualizar StateManager
        if (window.StateManager) {
            window.StateManager.updateCanvasTransform({
                zoom: this.state.zoom,
                panX: this.state.panX,
                panY: this.state.panY
            });
        }
        
        this.updateZoomDisplay();
    }

    resetView() {
        this.state.zoom = 1;
        this.state.panX = 0;
        this.state.panY = 0;
        
        if (window.StateManager) {
            window.StateManager.updateCanvasTransform({
                zoom: 1,
                panX: 0,
                panY: 0
            });
        }
        
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        const zoomElement = document.getElementById('canvas-zoom');
        if (zoomElement) {
            const zoomPercent = Math.round(this.state.zoom * 100);
            zoomElement.textContent = `Zoom: ${zoomPercent}%`;
        }
    }

    // Métodos de renderizado
    render() {
        if (!this.context) return;
        
        // Limpiar canvas
        this.clear();
        
        // Aplicar transformaciones
        this.context.save();
        this.context.translate(this.state.panX, this.state.panY);
        this.context.scale(this.state.zoom, this.state.zoom);
        
        // Dibujar grid si está habilitado
        if (this.state.gridVisible) {
            this.drawGrid();
        }
        
        // Dibujar dispositivos
        this.drawDevices();
        
        // Dibujar conexiones
        this.drawConnections();
        
        // Restaurar transformaciones
        this.context.restore();
        
        // Dibujar UI sobre el canvas
        this.drawUI();
    }

    clear() {
        this.context.fillStyle = this.config.backgroundColor;
        this.context.fillRect(0, 0, this.state.width, this.state.height);
    }

    drawGrid() {
        const gridSize = this.config.gridSize;
        const startX = (-this.state.panX / this.state.zoom) % gridSize;
        const startY = (-this.state.panY / this.state.zoom) % gridSize;
        const endX = this.state.width / this.state.zoom;
        const endY = this.state.height / this.state.zoom;
        
        this.context.strokeStyle = this.config.gridColor;
        this.context.lineWidth = 1 / this.state.zoom;
        this.context.beginPath();
        
        // Líneas verticales
        for (let x = startX; x < endX; x += gridSize) {
            this.context.moveTo(x, -this.state.panY / this.state.zoom);
            this.context.lineTo(x, endY);
        }
        
        // Líneas horizontales
        for (let y = startY; y < endY; y += gridSize) {
            this.context.moveTo(-this.state.panX / this.state.zoom, y);
            this.context.lineTo(endX, y);
        }
        
        this.context.stroke();
    }

    drawDevices() {
        const state = window.StateManager?.getState();
        if (!state || !state.devices) return;
        
        for (const device of state.devices.values()) {
            this.drawDevice(device);
        }
    }

    drawDevice(device) {
        const x = device.x;
        const y = device.y;
        const size = 40;
        
        // Dibujar fondo del dispositivo
        this.context.fillStyle = '#ffffff';
        this.context.strokeStyle = '#333333';
        this.context.lineWidth = 2 / this.state.zoom;
        
        this.context.fillRect(x - size/2, y - size/2, size, size);
        this.context.strokeRect(x - size/2, y - size/2, size, size);
        
        // Dibujar icono
        this.context.fillStyle = '#333333';
        this.context.font = `${16 / this.state.zoom}px Arial`;
        this.context.fillText(device.icon || device.type?.toUpperCase().slice(0, 2) || 'DEV', x, y);
        
        // Dibujar nombre
        this.context.font = `${12 / this.state.zoom}px Arial`;
        this.context.fillText(device.name || 'Device', x, y + size/2 + 15);
    }

    drawConnections() {
        const state = window.StateManager?.getState();
        if (!state || !state.connections || !state.devices) return;
        
        for (const connection of state.connections.values()) {
            this.drawConnection(connection, state.devices);
        }
    }

    drawConnection(connection, devices) {
        const sourceDevice = devices.get(connection.sourceId);
        const targetDevice = devices.get(connection.targetId);
        
        if (!sourceDevice || !targetDevice) return;
        
        this.context.strokeStyle = '#666666';
        this.context.lineWidth = 2 / this.state.zoom;
        this.context.beginPath();
        this.context.moveTo(sourceDevice.x, sourceDevice.y);
        this.context.lineTo(targetDevice.x, targetDevice.y);
        this.context.stroke();
    }

    drawUI() {
        // Dibujar elementos de UI que no se escalan con el zoom
        // (como indicadores de selección, etc.)
    }

    // Métodos públicos para control externo
    setGridVisible(visible) {
        this.state.gridVisible = visible;
        
        const gridBtn = document.getElementById('grid-toggle');
        if (gridBtn) {
            gridBtn.classList.toggle('active', visible);
        }
    }

    setSnapToGrid(snap) {
        this.state.snapToGrid = snap;
        
        const snapBtn = document.getElementById('snap-toggle');
        if (snapBtn) {
            snapBtn.classList.toggle('active', snap);
        }
    }

    // Métodos de cleanup
    destroy() {
        // Cancelar animación
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Remover event listeners
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('wheel', this.handleWheel);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        this.initialized = false;
        console.log('🧹 CanvasManager destruido');
    }
}

// Crear instancia global
window.CanvasManager = new CanvasManager();