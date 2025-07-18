/**
 * File Manager - Gestión de archivos (importar/exportar)
 */

const FileManager = {
    app: null,
    supportedFormats: ['json', 'png', 'svg', 'pdf', 'xml'],

    /**
     * Inicializa el gestor de archivos
     */
    init(app) {
        this.app = app;
        this.setupFileInput();
        console.log('✓ FileManager inicializado');
    },

    /**
     * Configura el input de archivo
     */
    setupFileInput() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', this.loadDiagram.bind(this));
        }
    },

    /**
     * Guarda el diagrama actual
     */
    saveDiagram() {
        try {
            const diagramData = this.createDiagramData();
            const filename = this.generateFilename('network_diagram', 'json');
            this.downloadFile(diagramData, filename, 'application/json');
            
            this.app.setStatus('Diagrama guardado exitosamente');
            Notifications.success(`Diagrama guardado como ${filename}`);
        } catch (error) {
            console.error('Error guardando diagrama:', error);
            Notifications.error('Error al guardar el diagrama');
        }
    },

    /**
     * Carga un diagrama desde archivo
     */
    loadDiagram(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const diagramData = JSON.parse(e.target.result);
                this.validateDiagramData(diagramData);
                
                this.app.loadDiagramData(diagramData);
                
                this.app.setStatus('Diagrama cargado exitosamente');
                Notifications.success(`Diagrama "${file.name}" cargado exitosamente`);
                
            } catch (error) {
                console.error('Error cargando diagrama:', error);
                Notifications.error('Error al cargar el diagrama: ' + error.message);
            }
        };

        reader.onerror = () => {
            Notifications.error('Error al leer el archivo');
        };

        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    },

    /**
     * Exporta el diagrama como imagen
     */
    exportDiagram(format = 'png') {
        try {
            switch (format.toLowerCase()) {
                case 'png':
                    this.exportAsPNG();
                    break;
                case 'svg':
                    this.exportAsSVG();
                    break;
                case 'pdf':
                    this.exportAsPDF();
                    break;
                default:
                    throw new Error(`Formato no soportado: ${format}`);
            }
        } catch (error) {
            console.error('Error exportando diagrama:', error);
            Notifications.error('Error al exportar el diagrama');
        }
    },

    /**
     * Exporta como PNG
     */
    exportAsPNG() {
        const canvas = this.createCanvas();
        const ctx = canvas.getContext('2d');
        
        // Configurar canvas
        canvas.width = 3000;
        canvas.height = 2000;
        
        // Fondo blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar grid
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // Dibujar conexiones
        this.drawConnections(ctx);
        
        // Dibujar dispositivos
        this.drawDevices(ctx);
        
        // Dibujar título y metadatos
        this.drawMetadata(ctx);
        
        // Descargar
        const filename = this.generateFilename('network_diagram', 'png');
        this.downloadCanvas(canvas, filename);
        
        Notifications.success('Diagrama exportado como PNG');
        this.app.setStatus('Diagrama exportado como imagen');
    },

    /**
     * Exporta como SVG
     */
    exportAsSVG() {
        const svgContent = this.generateSVG();
        const filename = this.generateFilename('network_diagram', 'svg');
        this.downloadFile(svgContent, filename, 'image/svg+xml');
        
        Notifications.success('Diagrama exportado como SVG');
    },

    /**
     * Exporta como PDF
     */
    exportAsPDF() {
        // Crear canvas temporal para PDF
        const canvas = this.createCanvas();
        this.exportAsPNG(); // Reutilizar lógica de PNG
        
        // Convertir canvas a PDF usando una biblioteca externa si está disponible
        if (window.jsPDF) {
            const pdf = new jsPDF('landscape');
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, 280, 187);
            
            const filename = this.generateFilename('network_diagram', 'pdf');
            pdf.save(filename);
            
            Notifications.success('Diagrama exportado como PDF');
        } else {
            Notifications.warning('Biblioteca PDF no disponible. Exportando como PNG.');
            this.exportAsPNG();
        }
    },

    /**
     * Crea los datos del diagrama para guardar
     */
    createDiagramData() {
        return {
            version: '2.0',
            metadata: {
                createdAt: new Date().toISOString(),
                title: 'Network Diagram',
                description: 'Created with Network Diagram Creator Pro',
                deviceCount: this.app.state.devices.length,
                connectionCount: this.app.state.connections.length
            },
            settings: {
                currentLayer: this.app.state.currentLayer,
                layerVisibility: this.app.state.layerVisibility,
                zoom: this.app.state.currentZoom
            },
            devices: this.app.state.devices,
            connections: this.app.state.connections
        };
    },

    /**
     * Valida los datos del diagrama
     */
    validateDiagramData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Formato de archivo inválido');
        }

        if (!data.devices || !Array.isArray(data.devices)) {
            throw new Error('No se encontraron dispositivos válidos');
        }

        if (!data.connections || !Array.isArray(data.connections)) {
            throw new Error('No se encontraron conexiones válidas');
        }

        // Validar estructura de dispositivos
        data.devices.forEach((device, index) => {
            if (!device.id || !device.type || typeof device.x !== 'number' || typeof device.y !== 'number') {
                throw new Error(`Dispositivo ${index + 1} tiene formato inválido`);
            }
        });

        // Validar estructura de conexiones
        data.connections.forEach((connection, index) => {
            if (!connection.id || !connection.device1 || !connection.device2 || !connection.type) {
                throw new Error(`Conexión ${index + 1} tiene formato inválido`);
            }
        });
    },

    /**
     * Genera un nombre de archivo
     */
    generateFilename(baseName, extension) {
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        return `${baseName}_${date}_${time}.${extension}`;
    },

    /**
     * Descarga un archivo
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    },

    /**
     * Descarga un canvas como imagen
     */
    downloadCanvas(canvas, filename) {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    },

    /**
     * Crea un canvas para exportación
     */
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        return canvas;
    },

    /**
     * Dibuja la grilla en el canvas
     */
    drawGrid(ctx, width, height) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x <= width; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y <= height; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    },

    /**
     * Dibuja las conexiones en el canvas
     */
    drawConnections(ctx) {
        const connectionColors = {
            'utp': '#27ae60',
            'fiber': '#f39c12',
            'serial': '#9b59b6',
            'coaxial': '#34495e',
            'wireless': '#3498db'
        };

        this.app.state.connections.forEach(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            
            if (!device1 || !device2) return;
            if (!this.app.state.layerVisibility[device1.layer] || !this.app.state.layerVisibility[device2.layer]) return;

            const center1 = { x: device1.x + 50, y: device1.y + 40 };
            const center2 = { x: device2.x + 50, y: device2.y + 40 };
            
            ctx.beginPath();
            ctx.moveTo(center1.x, center1.y);
            ctx.lineTo(center2.x, center2.y);
            
            ctx.strokeStyle = connectionColors[connection.type] || '#000000';
            ctx.lineWidth = 4;
            
            if (connection.status === 'down') {
                ctx.setLineDash([10, 5]);
                ctx.globalAlpha = 0.5;
            } else {
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            }
            
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
            
            // Dibujar etiqueta de conexión
            const midX = (center1.x + center2.x) / 2;
            const midY = (center1.y + center2.y) / 2;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(midX - 25, midY - 8, 50, 16);
            
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(connection.bandwidth || '', midX, midY + 4);
        });
    },

    /**
     * Dibuja los dispositivos en el canvas
     */
    drawDevices(ctx) {
        const statusColors = {
            'up': '#27ae60',
            'down': '#e74c3c',
            'warning': '#f39c12'
        };

        this.app.state.devices.forEach(device => {
            if (!this.app.state.layerVisibility[device.layer]) return;
            
            const x = device.x;
            const y = device.y;
            
            // Fondo del dispositivo
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, 100, 80);
            
            // Borde del dispositivo
            ctx.strokeStyle = statusColors[device.status] || '#3498db';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, 100, 80);
            
            // Icono del dispositivo
            const iconColor = this.getDeviceColor(device.type);
            ctx.fillStyle = iconColor;
            ctx.fillRect(x + 5, y + 5, 32, 32);
            
            // Texto del icono
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(DeviceManager.getDeviceIcon(device.type), x + 21, y + 25);
            
            // Nombre del dispositivo
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 11px Arial';
            ctx.fillText(device.name, x + 50, y + 50);
            
            // Detalles del dispositivo
            ctx.fillStyle = '#666';
            ctx.font = '9px Arial';
            ctx.fillText(device.ip || 'Sin IP', x + 50, y + 62);
            ctx.fillText(device.layer.toUpperCase(), x + 50, y + 72);
        });
    },

    /**
     * Dibuja metadatos en el canvas
     */
    drawMetadata(ctx) {
        const metadata = this.createDiagramData().metadata;
        
        // Título
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Network Diagram', 20, 40);
        
        // Información
        ctx.font = '14px Arial';
        ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 20, 65);
        ctx.fillText(`Devices: ${metadata.deviceCount} | Connections: ${metadata.connectionCount}`, 20, 85);
        
        // Leyenda de colores de conexión
        const legendY = 120;
        const connectionTypes = [
            { type: 'utp', color: '#27ae60', label: 'UTP' },
            { type: 'fiber', color: '#f39c12', label: 'Fiber' },
            { type: 'serial', color: '#9b59b6', label: 'Serial' },
            { type: 'coaxial', color: '#34495e', label: 'Coaxial' },
            { type: 'wireless', color: '#3498db', label: 'Wireless' }
        ];
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText('Connection Types:', 20, legendY);
        
        connectionTypes.forEach((conn, index) => {
            const x = 20 + index * 80;
            const y = legendY + 20;
            
            // Línea de color
            ctx.strokeStyle = conn.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 15, y);
            ctx.stroke();
            
            // Etiqueta
            ctx.fillStyle = '#333';
            ctx.fillText(conn.label, x + 20, y + 4);
        });
    },

    /**
     * Obtiene el color de un dispositivo
     */
    getDeviceColor(type) {
        const colors = {
            'core-router': '#8e44ad', 'edge-router': '#e67e22', 'router': '#e74c3c',
            'l3-switch': '#2ecc71', 'switch': '#27ae60', 'hub': '#3498db',
            'firewall': '#e74c3c', 'ips': '#ad1457', 'waf': '#d32f2f',
            'loadbalancer': '#7b1fa2', 'vpn': '#1976d2', 'modem': '#ff9800',
            'ap': '#4caf50', 'controller': '#009688', 'server': '#ff5722',
            'web-server': '#4caf50', 'db-server': '#9c27b0', 'dns-server': '#3f51b5',
            'mail-server': '#2196f3', 'pc': '#607d8b', 'notebook': '#795548',
            'printer': '#424242', 'phone': '#607d8b', 'nas': '#ff9800',
            'san': '#795548', 'iot-device': '#00bcd4', 'sensor': '#4caf50',
            'camera': '#9e9e9e'
        };
        return colors[type] || '#34495e';
    },

    /**
     * Genera contenido SVG
     */
    generateSVG() {
        const svgWidth = 3000;
        const svgHeight = 2000;
        
        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .device-text { font-family: Arial, sans-serif; font-size: 11px; fill: #2c3e50; }
            .connection-label { font-family: Arial, sans-serif; font-size: 10px; fill: #333; }
            .title-text { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; fill: #2c3e50; }
        </style>
    </defs>
    
    <!-- Background -->
    <rect width="100%" height="100%" fill="white"/>
    
    <!-- Grid -->
    <defs>
        <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e0e0e0" stroke-width="1"/>
        </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    
    <!-- Connections -->
    <g id="connections">`;

        // Añadir conexiones
        this.app.state.connections.forEach(connection => {
            const device1 = this.app.getDevice(connection.device1);
            const device2 = this.app.getDevice(connection.device2);
            
            if (!device1 || !device2) return;
            if (!this.app.state.layerVisibility[device1.layer] || !this.app.state.layerVisibility[device2.layer]) return;

            const center1 = { x: device1.x + 50, y: device1.y + 40 };
            const center2 = { x: device2.x + 50, y: device2.y + 40 };
            
            const connectionColors = {
                'utp': '#27ae60', 'fiber': '#f39c12', 'serial': '#9b59b6',
                'coaxial': '#34495e', 'wireless': '#3498db'
            };
            
            const color = connectionColors[connection.type] || '#000000';
            const dashArray = connection.status === 'down' ? '10,5' : 'none';
            const opacity = connection.status === 'down' ? '0.5' : '1';
            
            svgContent += `
        <line x1="${center1.x}" y1="${center1.y}" x2="${center2.x}" y2="${center2.y}" 
              stroke="${color}" stroke-width="4" stroke-dasharray="${dashArray}" opacity="${opacity}"/>`;
            
            // Etiqueta de conexión
            const midX = (center1.x + center2.x) / 2;
            const midY = (center1.y + center2.y) / 2;
            
            svgContent += `
        <rect x="${midX - 25}" y="${midY - 8}" width="50" height="16" fill="rgba(255,255,255,0.9)"/>
        <text x="${midX}" y="${midY + 4}" text-anchor="middle" class="connection-label">${connection.bandwidth || ''}</text>`;
        });

        svgContent += `
    </g>
    
    <!-- Devices -->
    <g id="devices">`;

        // Añadir dispositivos
        this.app.state.devices.forEach(device => {
            if (!this.app.state.layerVisibility[device.layer]) return;
            
            const x = device.x;
            const y = device.y;
            
            const statusColors = { 'up': '#27ae60', 'down': '#e74c3c', 'warning': '#f39c12' };
            const borderColor = statusColors[device.status] || '#3498db';
            const iconColor = this.getDeviceColor(device.type);
            
            svgContent += `
        <g id="${device.id}">
            <rect x="${x}" y="${y}" width="100" height="80" fill="white" stroke="${borderColor}" stroke-width="3"/>
            <rect x="${x + 5}" y="${y + 5}" width="32" height="32" fill="${iconColor}"/>
            <text x="${x + 21}" y="${y + 25}" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">${DeviceManager.getDeviceIcon(device.type)}</text>
            <text x="${x + 50}" y="${y + 50}" text-anchor="middle" class="device-text" font-weight="bold">${device.name}</text>
            <text x="${x + 50}" y="${y + 62}" text-anchor="middle" class="device-text">${device.ip || 'Sin IP'}</text>
            <text x="${x + 50}" y="${y + 72}" text-anchor="middle" class="device-text">${device.layer.toUpperCase()}</text>
        </g>`;
        });

        svgContent += `
    </g>
    
    <!-- Metadata -->
    <g id="metadata">
        <text x="20" y="40" class="title-text">Network Diagram</text>
        <text x="20" y="65" class="device-text">Generated: ${new Date().toLocaleString()}</text>
        <text x="20" y="85" class="device-text">Devices: ${this.app.state.devices.length} | Connections: ${this.app.state.connections.length}</text>
    </g>
    
</svg>`;

        return svgContent;
    },

    /**
     * Importa datos desde formatos externos
     */
    importFromFormat(data, format) {
        switch (format.toLowerCase()) {
            case 'visio':
                return this.importFromVisio(data);
            case 'drawio':
                return this.importFromDrawIO(data);
            case 'lucidchart':
                return this.importFromLucidchart(data);
            default:
                throw new Error(`Formato de importación no soportado: ${format}`);
        }
    },

    /**
     * Importa desde formato Visio (placeholder)
     */
    importFromVisio(data) {
        // Implementar lógica de importación desde Visio
        throw new Error('Importación desde Visio aún no implementada');
    },

    /**
     * Importa desde Draw.io (placeholder)
     */
    importFromDrawIO(data) {
        // Implementar lógica de importación desde Draw.io
        throw new Error('Importación desde Draw.io aún no implementada');
    },

    /**
     * Obtiene información del archivo
     */
    getFileInfo(file) {
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified),
            extension: file.name.split('.').pop().toLowerCase()
        };
    },

    /**
     * Valida el archivo antes de procesarlo
     */
    validateFile(file) {
        const info = this.getFileInfo(file);
        
        // Verificar extensión
        if (!this.supportedFormats.includes(info.extension)) {
            throw new Error(`Formato de archivo no soportado: ${info.extension}`);
        }
        
        // Verificar tamaño (máximo 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (info.size > maxSize) {
            throw new Error('El archivo es demasiado grande (máximo 50MB)');
        }
        
        return info;
    }
};

// Exportar para uso global
window.FileManager = FileManager;