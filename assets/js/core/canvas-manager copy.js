/**
 * Canvas Manager - Gestión del área de trabajo
 */

const CanvasManager = {
    app: null,
    viewport: null,
    container: null,
    currentZoom: 1,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    panOffset: { x: 0, y: 0 },

    /**
     * Inicializa el gestor del canvas
     */
    init(app) {
        this.app = app;
        this.viewport = document.getElementById('canvas-viewport');
        this.container = document.getElementById('canvas-container');
        this.setupEventListeners();
        this.initializeMinimap();
        console.log('✓ CanvasManager inicializado');
    },

    /**
     * Configura los event listeners del canvas
     */
    setupEventListeners() {
        // Eventos de zoom con rueda del mouse
        this.viewport.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        
        // Eventos de pan (arrastrar canvas)
        this.viewport.addEventListener('mousedown', this.handlePanStart.bind(this));
        this.viewport.addEventListener('mousemove', this.handlePanMove.bind(this));
        this.viewport.addEventListener('mouseup', this.handlePanEnd.bind(this));
        this.viewport.addEventListener('mouseleave', this.handlePanEnd.bind(this));
        
        // Eventos de teclado para navegación
        document.addEventListener('keydown', this.handleKeyNavigation.bind(this));
        
        // Eventos de redimensionamiento
        window.addEventListener('resize', this.handleResize.bind(this));
    },

    /**
     * Maneja el zoom con la rueda del mouse
     */
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, this.currentZoom * zoomFactor));
        
        this.zoomToPoint(newZoom, mouseX, mouseY);
    },

    /**
     * Zoom hacia un punto específico
     */
    zoomToPoint(newZoom, pointX, pointY) {
        const oldZoom = this.currentZoom;
        const zoomRatio = newZoom / oldZoom;
        
        // Calcular nuevo scroll para mantener el punto bajo el cursor
        const scrollLeft = this.viewport.scrollLeft;
        const scrollTop = this.viewport.scrollTop;
        
        const newScrollLeft = (scrollLeft + pointX) * zoomRatio - pointX;
        const newScrollTop = (scrollTop + pointY) * zoomRatio - pointY;
        
        this.setZoom(newZoom);
        
        this.viewport.scrollLeft = newScrollLeft;
        this.viewport.scrollTop = newScrollTop;
        
        this.updateMinimap();
    },

    /**
     * Establece el zoom del canvas
     */
    setZoom(zoom) {
        this.currentZoom = Math.max(0.1, Math.min(5, zoom));
        this.container.style.transform = `scale(${this.currentZoom})`;
        this.app.setState({ currentZoom: this.currentZoom });
        this.updateZoomDisplay();
    },

    /**
     * Aumenta el zoom
     */
    zoomIn() {
        const center = this.getViewportCenter();
        this.zoomToPoint(this.currentZoom * 1.25, center.x, center.y);
    },

    /**
     * Disminuye el zoom
     */
    zoomOut() {
        const center = this.getViewportCenter();
        this.zoomToPoint(this.currentZoom * 0.8, center.x, center.y);
    },

    /**
     * Resetea el zoom al 100%
     */
    resetZoom() {
        const center = this.getViewportCenter();
        this.zoomToPoint(1, center.x, center.y);
    },

    /**
     * Obtiene el centro del viewport
     */
    getViewportCenter() {
        return {
            x: this.viewport.clientWidth / 2,
            y: this.viewport.clientHeight / 2
        };
    },

    /**
     * Actualiza la visualización del zoom
     */
    updateZoomDisplay() {
        const zoomPercent = Math.round(this.currentZoom * 100);
        const displays = ['zoom-level', 'zoom-display'];
        
        displays.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `${zoomPercent}%`;
            }
        });
    },

    /**
     * Maneja el inicio del pan
     */
    handlePanStart(e) {
        // Solo pan con el botón del medio o Ctrl+click
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            e.preventDefault();
            this.isPanning = true;
            this.panStart = { x: e.clientX, y: e.clientY };
            this.panOffset = {
                x: this.viewport.scrollLeft,
                y: this.viewport.scrollTop
            };
            this.viewport.style.cursor = 'grabbing';
        }
    },

    /**
     * Maneja el movimiento durante el pan
     */
    handlePanMove(e) {
        if (!this.isPanning) return;
        
        e.preventDefault();
        const deltaX = e.clientX - this.panStart.x;
        const deltaY = e.clientY - this.panStart.y;
        
        this.viewport.scrollLeft = this.panOffset.x - deltaX;
        this.viewport.scrollTop = this.panOffset.y - deltaY;
        
        this.updateMinimap();
    },

    /**
     * Maneja el fin del pan
     */
    handlePanEnd(e) {
        if (this.isPanning) {
            this.isPanning = false;
            this.viewport.style.cursor = '';
        }
    },

    /**
     * Maneja la navegación con teclado
     */
    handleKeyNavigation(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const scrollAmount = 50;
        let handled = false;
        
        switch(e.key) {
            case 'ArrowUp':
                this.viewport.scrollTop -= scrollAmount;
                handled = true;
                break;
            case 'ArrowDown':
                this.viewport.scrollTop += scrollAmount;
                handled = true;
                break;
            case 'ArrowLeft':
                this.viewport.scrollLeft -= scrollAmount;
                handled = true;
                break;
            case 'ArrowRight':
                this.viewport.scrollLeft += scrollAmount;
                handled = true;
                break;
            case 'Home':
                this.viewport.scrollTop = 0;
                this.viewport.scrollLeft = 0;
                handled = true;
                break;
        }
        
        if (handled) {
            e.preventDefault();
            this.updateMinimap();
        }
    },

    /**
     * Maneja el redimensionamiento de la ventana
     */
    handleResize() {
        this.updateMinimap();
    },

    /**
     * Centra la vista en un punto específico
     */
    centerOn(x, y) {
        const viewportRect = this.viewport.getBoundingClientRect();
        const centerX = viewportRect.width / 2;
        const centerY = viewportRect.height / 2;
        
        this.viewport.scrollLeft = (x * this.currentZoom) - centerX;
        this.viewport.scrollTop = (y * this.currentZoom) - centerY;
        
        this.updateMinimap();
    },

    /**
     * Ajusta la vista para mostrar todos los dispositivos
     */
    fitToContent() {
        if (this.app.state.devices.length === 0) return;
        
        // Calcular bounds de todos los dispositivos
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        this.app.state.devices.forEach(device => {
            minX = Math.min(minX, device.x);
            minY = Math.min(minY, device.y);
            maxX = Math.max(maxX, device.x + 100); // Ancho del dispositivo
            maxY = Math.max(maxY, device.y + 80);  // Alto del dispositivo
        });
        
        // Añadir margen
        const margin = 50;
        minX -= margin;
        minY -= margin;
        maxX += margin;
        maxY += margin;
        
        // Calcular zoom para que quepa todo
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const viewportWidth = this.viewport.clientWidth;
        const viewportHeight = this.viewport.clientHeight;
        
        const zoomX = viewportWidth / contentWidth;
        const zoomY = viewportHeight / contentHeight;
        const optimalZoom = Math.min(zoomX, zoomY, 1); // No hacer zoom mayor al 100%
        
        // Aplicar zoom y centrar
        this.setZoom(optimalZoom);
        
        setTimeout(() => {
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            this.centerOn(centerX, centerY);
        }, 50);
    },

    /**
     * Inicializa el minimapa
     */
    initializeMinimap() {
        const minimap = document.getElementById('minimap');
        const minimapViewport = document.getElementById('minimap-viewport');
        
        if (!minimap || !minimapViewport) return;
        
        // Configurar minimapa
        minimap.addEventListener('click', this.handleMinimapClick.bind(this));
        minimapViewport.addEventListener('mousedown', this.handleMinimapDrag.bind(this));
        
        // Actualizar minimapa cuando cambie el scroll
        this.viewport.addEventListener('scroll', this.updateMinimap.bind(this));
        
        this.updateMinimap();
    },

    /**
     * Actualiza el minimapa
     */
    updateMinimap() {
        const minimap = document.getElementById('minimap');
        const minimapViewport = document.getElementById('minimap-viewport');
        
        if (!minimap || !minimapViewport) return;
        
        const minimapRect = minimap.getBoundingClientRect();
        const canvasWidth = 3000;
        const canvasHeight = 2000;
        
        // Calcular escala del minimapa
        const scaleX = minimapRect.width / canvasWidth;
        const scaleY = minimapRect.height / canvasHeight;
        
        // Calcular posición y tamaño del viewport en el minimapa
        const viewportWidth = this.viewport.clientWidth / this.currentZoom;
        const viewportHeight = this.viewport.clientHeight / this.currentZoom;
        const viewportX = this.viewport.scrollLeft / this.currentZoom;
        const viewportY = this.viewport.scrollTop / this.currentZoom;
        
        minimapViewport.style.left = (viewportX * scaleX) + 'px';
        minimapViewport.style.top = (viewportY * scaleY) + 'px';
        minimapViewport.style.width = (viewportWidth * scaleX) + 'px';
        minimapViewport.style.height = (viewportHeight * scaleY) + 'px';
    },

    /**
     * Maneja el click en el minimapa
     */
    handleMinimapClick(e) {
        const minimapRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - minimapRect.left;
        const clickY = e.clientY - minimapRect.top;
        
        const canvasWidth = 3000;
        const canvasHeight = 2000;
        
        // Convertir coordenadas del minimapa a coordenadas del canvas
        const scaleX = canvasWidth / minimapRect.width;
        const scaleY = canvasHeight / minimapRect.height;
        
        const targetX = clickX * scaleX;
        const targetY = clickY * scaleY;
        
        this.centerOn(targetX, targetY);
    },

    /**
     * Obtiene las coordenadas del mouse en el canvas
     */
    getCanvasCoordinates(clientX, clientY) {
        const rect = this.viewport.getBoundingClientRect();
        const canvasX = (clientX - rect.left + this.viewport.scrollLeft) / this.currentZoom;
        const canvasY = (clientY - rect.top + this.viewport.scrollTop) / this.currentZoom;
        
        return { x: canvasX, y: canvasY };
    },

    /**
     * Convierte coordenadas del canvas a coordenadas de pantalla
     */
    canvasToScreen(canvasX, canvasY) {
        const rect = this.viewport.getBoundingClientRect();
        const screenX = (canvasX * this.currentZoom) - this.viewport.scrollLeft + rect.left;
        const screenY = (canvasY * this.currentZoom) - this.viewport.scrollTop + rect.top;
        
        return { x: screenX, y: screenY };
    },

    /**
     * Verifica si un punto está visible en el viewport
     */
    isPointVisible(x, y) {
        const viewLeft = this.viewport.scrollLeft / this.currentZoom;
        const viewTop = this.viewport.scrollTop / this.currentZoom;
        const viewRight = viewLeft + (this.viewport.clientWidth / this.currentZoom);
        const viewBottom = viewTop + (this.viewport.clientHeight / this.currentZoom);
        
        return x >= viewLeft && x <= viewRight && y >= viewTop && y <= viewBottom;
    },

    /**
     * Obtiene el área visible del canvas
     */
    getVisibleArea() {
        const left = this.viewport.scrollLeft / this.currentZoom;
        const top = this.viewport.scrollTop / this.currentZoom;
        const width = this.viewport.clientWidth / this.currentZoom;
        const height = this.viewport.clientHeight / this.currentZoom;
        
        return {
            left,
            top,
            right: left + width,
            bottom: top + height,
            width,
            height
        };
    },

    /**
     * Anima el scroll hacia una posición
     */
    animateScrollTo(targetX, targetY, duration = 500) {
        const startX = this.viewport.scrollLeft;
        const startY = this.viewport.scrollTop;
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Función de easing (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.viewport.scrollLeft = startX + (deltaX * easeOut);
            this.viewport.scrollTop = startY + (deltaY * easeOut);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            
            this.updateMinimap();
        };
        
        requestAnimationFrame(animate);
    },

    /**
     * Exporta la vista actual como imagen
     */
    exportView() {
        const visibleArea = this.getVisibleArea();
        // Esta función se integraría con FileManager para exportar solo la vista actual
        return visibleArea;
    },

    /**
     * Resetea la vista al estado inicial
     */
    reset() {
        this.setZoom(1);
        this.viewport.scrollLeft = 0;
        this.viewport.scrollTop = 0;
        this.updateMinimap();
    }
};

// Exportar para uso global
window.CanvasManager = CanvasManager;