/**
 * Cable Label Generator - Generador de etiquetas para cables
 * Simula una rotuladora profesional para etiquetar ambos extremos de los cables
 */

const CableLabelGenerator = {
    app: null,
    labelTemplates: {
        'standard': {
            name: 'Estándar',
            width: 24, // mm
            height: 8,  // mm
            fontSize: 8,
            maxChars: 20
        },
        'large': {
            name: 'Grande',
            width: 36,
            height: 12,
            fontSize: 10,
            maxChars: 30
        },
        'small': {
            name: 'Pequeña',
            width: 18,
            height: 6,
            fontSize: 6,
            maxChars: 15
        }
    },

    /**
     * Inicializa el generador de etiquetas
     */
    init(app) {
        this.app = app;
        this.setupLabelStyles();
        console.log('✓ CableLabelGenerator inicializado');
    },

    /**
     * Genera etiquetas para todas las conexiones
     */
    generateAllLabels() {
        if (this.app.state.connections.length === 0) {
            Notifications.warning('No hay conexiones para etiquetar');
            return;
        }

        this.showLabelGeneratorModal();
    },

    /**
     * Muestra el modal del generador de etiquetas
     */
    showLabelGeneratorModal() {
        const modal = this.createLabelGeneratorModal();
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Crea el modal del generador de etiquetas
     */
    createLabelGeneratorModal() {
        const connections = this.app.state.connections.filter(conn => conn.interface1 && conn.interface2);
        
        const modal = document.createElement('div');
        modal.className = 'modal label-generator-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; height: 80vh;">
                <div class="modal-header">
                    <h3>🏷️ Generador de Etiquetas para Cables</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body" style="display: flex; gap: 20px; height: calc(100% - 120px);">
                    <!-- Panel de configuración -->
                    <div class="label-config-panel" style="width: 300px; border-right: 1px solid #ddd; padding-right: 20px;">
                        <h4>Configuración de Etiquetas</h4>
                        
                        <div class="form-group">
                            <label>Tamaño de etiqueta:</label>
                            <select id="label-template" onchange="CableLabelGenerator.updatePreview()">
                                ${Object.keys(this.labelTemplates).map(key => `
                                    <option value="${key}">${this.labelTemplates[key].name} (${this.labelTemplates[key].width}x${this.labelTemplates[key].height}mm)</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Formato de etiqueta:</label>
                            <select id="label-format" onchange="CableLabelGenerator.updatePreview()">
                                <option value="device-interface">Dispositivo - Interfaz</option>
                                <option value="device-port">Dispositivo - Puerto</option>
                                <option value="interface-only">Solo interfaz</option>
                                <option value="custom">Personalizado</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="include-cable-id" checked onchange="CableLabelGenerator.updatePreview()">
                                Incluir ID de cable
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="include-date" onchange="CableLabelGenerator.updatePreview()">
                                Incluir fecha
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="include-bandwidth" checked onchange="CableLabelGenerator.updatePreview()">
                                Incluir ancho de banda
                            </label>
                        </div>

                        <div class="form-group">
                            <label>Color de fondo:</label>
                            <select id="label-background" onchange="CableLabelGenerator.updatePreview()">
                                <option value="white">Blanco</option>
                                <option value="yellow">Amarillo</option>
                                <option value="blue">Azul claro</option>
                                <option value="green">Verde claro</option>
                                <option value="red">Rojo claro</option>
                                <option value="gray">Gris claro</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Orientación:</label>
                            <select id="label-orientation" onchange="CableLabelGenerator.updatePreview()">
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                            </select>
                        </div>

                        <hr>

                        <div class="form-group">
                            <button class="btn btn-primary" onclick="CableLabelGenerator.generatePrintableLabels()">
                                🖨️ Generar para Imprimir
                            </button>
                        </div>

                        <div class="form-group">
                            <button class="btn btn-secondary" onclick="CableLabelGenerator.exportLabelData()">
                                💾 Exportar Datos
                            </button>
                        </div>
                    </div>

                    <!-- Panel de vista previa -->
                    <div class="label-preview-panel" style="flex: 1; overflow-y: auto;">
                        <h4>Vista Previa (${connections.length} conexiones)</h4>
                        <div id="labels-preview" class="labels-container">
                            ${this.generateLabelsPreview(connections)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addLabelGeneratorStyles();
        return modal;
    },

    /**
     * Genera la vista previa de las etiquetas
     */
    generateLabelsPreview(connections) {
        return connections.map(connection => {
            const device1 = this.app.getDevice(connection.interface1.deviceId);
            const device2 = this.app.getDevice(connection.interface2.deviceId);
            
            if (!device1 || !device2) return '';

            const cableId = this.generateCableId(connection);
            
            return `
                <div class="connection-labels" data-connection-id="${connection.id}">
                    <div class="connection-header">
                        <strong>Conexión ${cableId}</strong>
                        <span class="connection-type">${connection.type.toUpperCase()} - ${connection.bandwidth}</span>
                    </div>
                    <div class="label-pair">
                        <div class="label-side">
                            <h5>Extremo A</h5>
                            ${this.generateSingleLabel(device1, connection.interface1, cableId, 'A')}
                        </div>
                        <div class="label-side">
                            <h5>Extremo B</h5>
                            ${this.generateSingleLabel(device2, connection.interface2, cableId, 'B')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Genera una etiqueta individual
     */
    generateSingleLabel(device, interfaceInfo, cableId, side) {
        const template = this.labelTemplates[document.getElementById('label-template')?.value || 'standard'];
        const format = document.getElementById('label-format')?.value || 'device-interface';
        const includeCableId = document.getElementById('include-cable-id')?.checked ?? true;
        const includeDate = document.getElementById('include-date')?.checked ?? false;
        const includeBandwidth = document.getElementById('include-bandwidth')?.checked ?? true;
        const background = document.getElementById('label-background')?.value || 'white';
        const orientation = document.getElementById('label-orientation')?.value || 'horizontal';

        const labelText = this.formatLabelText(device, interfaceInfo, format);
        const additionalInfo = this.getAdditionalInfo(cableId, side, includeDate, includeBandwidth);

        const isVertical = orientation === 'vertical';
        const width = isVertical ? template.height : template.width;
        const height = isVertical ? template.width : template.height;

        return `
            <div class="cable-label ${background}" style="
                width: ${width * 3}px; 
                height: ${height * 3}px; 
                font-size: ${template.fontSize}px;
                ${isVertical ? 'writing-mode: vertical-rl; text-orientation: mixed;' : ''}
            ">
                <div class="label-main-text">${labelText}</div>
                ${includeCableId ? `<div class="label-cable-id">${cableId}-${side}</div>` : ''}
                ${additionalInfo ? `<div class="label-additional">${additionalInfo}</div>` : ''}
            </div>
        `;
    },

    /**
     * Formatea el texto principal de la etiqueta
     */
    formatLabelText(device, interfaceInfo, format) {
        const maxLength = this.getCurrentTemplate().maxChars;
        
        switch (format) {
            case 'device-interface':
                return this.truncateText(`${device.name} - ${interfaceInfo.name}`, maxLength);
            case 'device-port':
                return this.truncateText(`${device.name} - Puerto ${interfaceInfo.name.replace(/[^\d]/g, '')}`, maxLength);
            case 'interface-only':
                return this.truncateText(interfaceInfo.name, maxLength);
            case 'custom':
                return this.truncateText(`${device.name}:${interfaceInfo.name}`, maxLength);
            default:
                return this.truncateText(`${device.name} - ${interfaceInfo.name}`, maxLength);
        }
    },

    /**
     * Obtiene información adicional para la etiqueta
     */
    getAdditionalInfo(cableId, side, includeDate, includeBandwidth) {
        let info = [];
        
        if (includeDate) {
            info.push(new Date().toLocaleDateString());
        }
        
        if (includeBandwidth) {
            // El ancho de banda se añadirá desde la conexión
            info.push('1Gbps'); // Placeholder
        }
        
        return info.join(' | ');
    },

    /**
     * Genera un ID único para el cable
     */
    generateCableId(connection) {
        // Generar ID basado en los dispositivos conectados
        const device1 = this.app.getDevice(connection.interface1.deviceId);
        const device2 = this.app.getDevice(connection.interface2.deviceId);
        
        const prefix1 = device1.name.substring(0, 3).toUpperCase();
        const prefix2 = device2.name.substring(0, 3).toUpperCase();
        const connectionIndex = this.app.state.connections.indexOf(connection) + 1;
        
        return `${prefix1}-${prefix2}-${String(connectionIndex).padStart(3, '0')}`;
    },

    /**
     * Trunca texto según la longitud máxima
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Obtiene la plantilla actual
     */
    getCurrentTemplate() {
        const templateKey = document.getElementById('label-template')?.value || 'standard';
        return this.labelTemplates[templateKey];
    },

    /**
     * Actualiza la vista previa
     */
    updatePreview() {
        const previewContainer = document.getElementById('labels-preview');
        if (!previewContainer) return;

        const connections = this.app.state.connections.filter(conn => conn.interface1 && conn.interface2);
        previewContainer.innerHTML = this.generateLabelsPreview(connections);
    },

    /**
     * Genera etiquetas para imprimir
     */
    generatePrintableLabels() {
        const connections = this.app.state.connections.filter(conn => conn.interface1 && conn.interface2);
        
        if (connections.length === 0) {
            Notifications.warning('No hay conexiones para generar etiquetas');
            return;
        }

        const printDocument = this.createPrintDocument(connections);
        
        // Abrir ventana de impresión
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printDocument);
        printWindow.document.close();
        
        // Enfocar y mostrar diálogo de impresión
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);

        Notifications.success(`${connections.length * 2} etiquetas generadas para impresión`);
    },

    /**
     * Crea el documento HTML para imprimir
     */
    createPrintDocument(connections) {
        const template = this.getCurrentTemplate();
        const background = document.getElementById('label-background')?.value || 'white';
        const orientation = document.getElementById('label-orientation')?.value || 'horizontal';
        
        const allLabels = connections.flatMap(connection => {
            const device1 = this.app.getDevice(connection.interface1.deviceId);
            const device2 = this.app.getDevice(connection.interface2.deviceId);
            const cableId = this.generateCableId(connection);
            
            return [
                {
                    device: device1,
                    interface: connection.interface1,
                    cableId: cableId,
                    side: 'A',
                    connection: connection
                },
                {
                    device: device2,
                    interface: connection.interface2,
                    cableId: cableId,
                    side: 'B',
                    connection: connection
                }
            ];
        });

        const isVertical = orientation === 'vertical';
        const labelWidth = isVertical ? template.height : template.width;
        const labelHeight = isVertical ? template.width : template.height;

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Etiquetas de Cables - ${new Date().toLocaleDateString()}</title>
    <style>
        @page {
            margin: 10mm;
            size: A4;
        }
        
        body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        
        .labels-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(${labelWidth * 4}px, 1fr));
            gap: 5mm;
            page-break-inside: avoid;
        }
        
        .print-label {
            width: ${labelWidth * 4}px;
            height: ${labelHeight * 4}px;
            border: 2px solid #333;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 2mm;
            font-size: ${template.fontSize * 1.2}px;
            background: ${this.getBackgroundColor(background)};
            box-sizing: border-box;
            ${isVertical ? 'writing-mode: vertical-rl; text-orientation: mixed;' : ''}
            page-break-inside: avoid;
        }
        
        .print-label-main {
            font-weight: bold;
            line-height: 1.1;
            margin-bottom: 1mm;
        }
        
        .print-label-cable {
            font-size: ${template.fontSize * 0.8}px;
            color: #666;
            margin-bottom: 1mm;
        }
        
        .print-label-info {
            font-size: ${template.fontSize * 0.7}px;
            color: #888;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="print-header no-print">
        <h1>Etiquetas de Cables de Red</h1>
        <p>Proyecto: ${this.app.state.metadata?.title || 'Sin título'}</p>
        <p>Generado: ${new Date().toLocaleString()}</p>
        <p>Total de etiquetas: ${allLabels.length}</p>
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; margin: 10px;">🖨️ Imprimir</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; margin: 10px;">❌ Cerrar</button>
    </div>
    
    <div class="labels-grid">
        ${allLabels.map((label, index) => {
            const labelText = this.formatLabelText(label.device, label.interface, 
                document.getElementById('label-format')?.value || 'device-interface');
            const includeCableId = document.getElementById('include-cable-id')?.checked ?? true;
            const includeDate = document.getElementById('include-date')?.checked ?? false;
            const includeBandwidth = document.getElementById('include-bandwidth')?.checked ?? true;
            
            let additionalInfo = [];
            if (includeDate) additionalInfo.push(new Date().toLocaleDateString());
            if (includeBandwidth) additionalInfo.push(label.connection.bandwidth);
            
            return `
                <div class="print-label ${index > 0 && index % 12 === 0 ? 'page-break' : ''}">
                    <div class="print-label-main">${labelText}</div>
                    ${includeCableId ? `<div class="print-label-cable">${label.cableId}-${label.side}</div>` : ''}
                    ${additionalInfo.length > 0 ? `<div class="print-label-info">${additionalInfo.join(' | ')}</div>` : ''}
                </div>
            `;
        }).join('')}
    </div>
    
    <script>
        // Auto-focus para impresión
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.focus();
            }, 100);
        });
    </script>
</body>
</html>`;
    },

    /**
     * Obtiene el color de fondo para CSS
     */
    getBackgroundColor(background) {
        const colors = {
            'white': '#ffffff',
            'yellow': '#fffacd',
            'blue': '#e6f3ff',
            'green': '#e6ffe6',
            'red': '#ffe6e6',
            'gray': '#f5f5f5'
        };
        return colors[background] || colors.white;
    },

    /**
     * Exporta los datos de las etiquetas
     */
    exportLabelData() {
        const connections = this.app.state.connections.filter(conn => conn.interface1 && conn.interface2);
        
        const labelData = connections.map(connection => {
            const device1 = this.app.getDevice(connection.interface1.deviceId);
            const device2 = this.app.getDevice(connection.interface2.deviceId);
            const cableId = this.generateCableId(connection);
            
            return {
                cableId: cableId,
                connectionType: connection.type,
                bandwidth: connection.bandwidth,
                endA: {
                    device: device1.name,
                    interface: connection.interface1.name,
                    ip: device1.ip,
                    location: device1.location,
                    label: `${cableId}-A`
                },
                endB: {
                    device: device2.name,
                    interface: connection.interface2.name,
                    ip: device2.ip,
                    location: device2.location,
                    label: `${cableId}-B`
                },
                installationDate: new Date().toISOString().split('T')[0],
                notes: connection.description || ''
            };
        });

        const exportData = {
            project: this.app.state.metadata?.title || 'Network Diagram',
            generatedDate: new Date().toISOString(),
            totalCables: connections.length,
            cables: labelData
        };

        // Exportar como JSON
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `cable_labels_${new Date().toISOString().split('T')[0]}.json`;
        jsonLink.click();
        
        URL.revokeObjectURL(jsonUrl);

        // Exportar como CSV
        const csvContent = this.generateCSV(labelData);
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `cable_labels_${new Date().toISOString().split('T')[0]}.csv`;
        csvLink.click();
        
        URL.revokeObjectURL(csvUrl);

        Notifications.success('Datos de etiquetas exportados en formato JSON y CSV');
    },

    /**
     * Genera contenido CSV
     */
    generateCSV(labelData) {
        const headers = [
            'Cable ID',
            'Tipo Conexión',
            'Ancho de Banda',
            'Dispositivo A',
            'Interfaz A',
            'IP A',
            'Ubicación A',
            'Etiqueta A',
            'Dispositivo B',
            'Interfaz B',
            'IP B',
            'Ubicación B',
            'Etiqueta B',
            'Fecha Instalación',
            'Notas'
        ].join(',');

        const rows = labelData.map(cable => [
            cable.cableId,
            cable.connectionType,
            cable.bandwidth,
            `"${cable.endA.device}"`,
            cable.endA.interface,
            cable.endA.ip || '',
            `"${cable.endA.location || ''}"`,
            cable.endA.label,
            `"${cable.endB.device}"`,
            cable.endB.interface,
            cable.endB.ip || '',
            `"${cable.endB.location || ''}"`,
            cable.endB.label,
            cable.installationDate,
            `"${cable.notes}"`
        ].join(','));

        return [headers, ...rows].join('\n');
    },

    /**
     * Genera etiquetas para una conexión específica
     */
    generateLabelsForConnection(connectionId) {
        const connection = this.app.getConnection(connectionId);
        if (!connection || !connection.interface1 || !connection.interface2) {
            Notifications.error('Conexión no válida para generar etiquetas');
            return;
        }

        const connections = [connection];
        const printDocument = this.createPrintDocument(connections);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printDocument);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);

        Notifications.success('Etiquetas generadas para la conexión seleccionada');
    },

    /**
     * Añade estilos para el generador de etiquetas
     */
    addLabelGeneratorStyles() {
        if (document.getElementById('label-generator-styles')) return;

        const style = document.createElement('style');
        style.id = 'label-generator-styles';
        style.textContent = `
            .label-generator-modal .modal-content {
                max-height: 90vh;
                overflow: hidden;
            }
            
            .label-config-panel {
                overflow-y: auto;
            }
            
            .label-preview-panel {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
            }
            
            .connection-labels {
                margin-bottom: 20px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .connection-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #ddd;
            }
            
            .connection-type {
                font-size: 12px;
                color: #666;
                background: #e9ecef;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .label-pair {
                display: flex;
                gap: 20px;
            }
            
            .label-side {
                flex: 1;
            }
            
            .label-side h5 {
                margin: 0 0 10px 0;
                color: #495057;
                font-size: 14px;
            }
            
            .cable-label {
                border: 2px solid #333;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 4px;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                line-height: 1.1;
                box-sizing: border-box;
                margin: 5px 0;
            }
            
            .cable-label.white { background: #ffffff; }
            .cable-label.yellow { background: #fffacd; }
            .cable-label.blue { background: #e6f3ff; }
            .cable-label.green { background: #e6ffe6; }
            .cable-label.red { background: #ffe6e6; }
            .cable-label.gray { background: #f5f5f5; }
            
            .label-main-text {
                font-size: inherit;
                margin-bottom: 2px;
            }
            
            .label-cable-id {
                font-size: 80%;
                color: #666;
                margin-bottom: 2px;
            }
            
            .label-additional {
                font-size: 70%;
                color: #888;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                font-size: 13px;
            }
            
            .form-group select,
            .form-group input[type="text"] {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 13px;
            }
            
            .form-group input[type="checkbox"] {
                margin-right: 8px;
            }
            
            .btn {
                width: 100%;
                padding: 10px 15px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0056b3;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #545b62;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Configura estilos generales
     */
    setupLabelStyles() {
        // Los estilos se añaden cuando se necesitan
    }
};

// Exportar para uso global
window.CableLabelGenerator = CableLabelGenerator;