/**
 * Toolbar - Gestión de la barra de herramientas
 */

const Toolbar = {
    app: null,

    /**
     * Inicializa la barra de herramientas
     */
    init(app) {
        this.app = app;
        console.log('✓ Toolbar inicializado');
    },

    /**
     * Renderiza la barra de herramientas
     */
    render() {
        const toolbar = document.getElementById('advanced-toolbar');
        if (!toolbar) return;

        toolbar.innerHTML = `
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="App.newDiagram()" title="Nuevo diagrama">
                    <span>📄</span> Nuevo
                </button>
                <button class="toolbar-btn" onclick="FileManager.saveDiagram()" title="Guardar diagrama">
                    <span>💾</span> Guardar
                </button>
                <button class="toolbar-btn" onclick="document.getElementById('file-input').click()" title="Cargar diagrama">
                    <span>📁</span> Cargar
                </button>
            </div>
            
            <div class="toolbar-group">
                <button class="toolbar-btn" id="connect-btn" onclick="SmartConnectionManager.connectionMode ? SmartConnectionManager.deactivateConnectionMode() : SmartConnectionManager.activateConnectionMode()" title="Modo conexión inteligente">
                    <span>🔗</span> Conectar
                </button>
                <select id="connection-type" class="toolbar-select" title="Tipo de conexión">
                    <option value="utp">UTP (Verde)</option>
                    <option value="fiber">Fibra Óptica (Naranja)</option>
                    <option value="serial">Serial (Violeta)</option>
                    <option value="coaxial">Coaxial (Gris)</option>
                    <option value="wireless">Inalámbrico (Azul)</option>
                </select>
            </div>

            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="Toolbar.showInterfaceManager()" title="Gestionar interfaces">
                    <span>🔌</span> Interfaces
                </button>
                <button class="toolbar-btn" onclick="DeviceManager.autoArrange()" title="Auto organizar">
                    <span>🎯</span> Auto-organizar
                </button>
                <button class="toolbar-btn" onclick="Toolbar.validateTopology()" title="Validar topología">
                    <span>✅</span> Validar
                </button>
            </div>

            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="CableLabelGenerator.generateAllLabels()" title="Generar etiquetas de cables">
                    <span>🏷️</span> Etiquetas
                </button>
                <button class="toolbar-btn" onclick="Toolbar.generateDocumentation()" title="Generar documentación">
                    <span>📋</span> Docs
                </button>
                <button class="toolbar-btn" onclick="FileManager.exportDiagram('png')" title="Exportar como imagen">
                    <span>📸</span> Exportar
                </button>
            </div>
            
            <div class="toolbar-group">
                <button class="toolbar-btn" onclick="CanvasManager.fitToContent()" title="Ajustar vista">
                    <span>📐</span> Ajustar
                </button>
                <button class="toolbar-btn" onclick="App.clearDiagram()" title="Limpiar diagrama">
                    <span>🗑️</span> Limpiar
                </button>
            </div>

            <div class="zoom-controls">
                <button class="toolbar-btn" onclick="CanvasManager.zoomOut()" title="Alejar">🔍-</button>
                <span class="zoom-level" id="zoom-level">100%</span>
                <button class="toolbar-btn" onclick="CanvasManager.zoomIn()" title="Acercar">🔍+</button>
                <button class="toolbar-btn" onclick="CanvasManager.resetZoom()" title="Zoom normal">🎯</button>
            </div>
        `;
    },

    /**
     * Muestra el gestor de interfaces para el dispositivo seleccionado
     */
    showInterfaceManager() {
        if (!this.app.state.selectedDevice) {
            Notifications.warning('Selecciona un dispositivo para gestionar sus interfaces');
            return;
        }

        InterfaceManager.openInterfaceManager(this.app.state.selectedDevice.id);
    },

    /**
     * Valida la topología completa
     */
    validateTopology() {
        const issues = [];
        
        // Validar dispositivos aislados
        const deviceIssues = this.validateIsolatedDevices();
        issues.push(...deviceIssues);

        // Validar jerarquía de capas
        const layerIssues = LayerManager.validateLayerHierarchy();
        issues.push(...layerIssues);

        // Validar conexiones
        const connectionIssues = ConnectionManager.validateTopology();
        issues.push(...connectionIssues);

        // Validar interfaces
        const interfaceIssues = this.validateInterfaces();
        issues.push(...interfaceIssues);

        // Mostrar resultados
        if (issues.length === 0) {
            Notifications.success('✅ Topología válida - No se encontraron problemas', 5000);
            this.app.setStatus('Validación completada - Topología correcta');
        } else {
            this.showValidationResults(issues);
        }
    },

    /**
     * Valida dispositivos aislados
     */
    validateIsolatedDevices() {
        const issues = [];
        const connectedDevices = new Set();
        
        this.app.state.connections.forEach(conn => {
            connectedDevices.add(conn.device1);
            connectedDevices.add(conn.device2);
        });
        
        const isolatedDevices = this.app.state.devices.filter(device => 
            !connectedDevices.has(device.id)
        );
        
        if (isolatedDevices.length > 0) {
            issues.push({
                type: 'warning',
                category: 'Conectividad',
                message: `Dispositivos aislados: ${isolatedDevices.map(d => d.name).join(', ')}`,
                devices: isolatedDevices.map(d => d.id)
            });
        }

        return issues;
    },

    /**
     * Valida interfaces
     */
    validateInterfaces() {
        const issues = [];

        this.app.state.devices.forEach(device => {
            if (!device.interfaces) return;

            // Verificar interfaces sin conectar en dispositivos críticos
            const criticalTypes = ['router', 'core-router', 'l3-switch', 'firewall'];
            if (criticalTypes.includes(device.type)) {
                const unconnectedInterfaces = device.interfaces.filter(i => 
                    !i.connected && i.status === 'up'
                );

                if (unconnectedInterfaces.length > device.interfaces.length * 0.7) {
                    issues.push({
                        type: 'info',
                        category: 'Utilización',
                        message: `${device.name} tiene muchas interfaces sin usar (${unconnectedInterfaces.length}/${device.interfaces.length})`,
                        deviceId: device.id
                    });
                }
            }

            // Verificar interfaces inactivas conectadas
            const inactiveConnected = device.interfaces.filter(i => 
                i.connected && i.status === 'down'
            );

            if (inactiveConnected.length > 0) {
                issues.push({
                    type: 'error',
                    category: 'Estado',
                    message: `${device.name} tiene interfaces conectadas pero inactivas: ${inactiveConnected.map(i => i.name).join(', ')}`,
                    deviceId: device.id
                });
            }
        });

        return issues;
    },

    /**
     * Muestra los resultados de validación
     */
    showValidationResults(issues) {
        const errorCount = issues.filter(i => i.type === 'error').length;
        const warningCount = issues.filter(i => i.type === 'warning').length;
        const infoCount = issues.filter(i => i.type === 'info').length;

        const summary = `Validación completada: ${errorCount} errores, ${warningCount} advertencias, ${infoCount} informaciones`;
        
        const issuesByCategory = {};
        issues.forEach(issue => {
            if (!issuesByCategory[issue.category]) {
                issuesByCategory[issue.category] = [];
            }
            issuesByCategory[issue.category].push(issue);
        });

        const modalContent = `
            <div class="validation-results">
                <div class="validation-summary">
                    <h4>Resumen de Validación</h4>
                    <div class="summary-stats">
                        <span class="stat-item error">${errorCount} Errores</span>
                        <span class="stat-item warning">${warningCount} Advertencias</span>
                        <span class="stat-item info">${infoCount} Informaciones</span>
                    </div>
                </div>

                ${Object.keys(issuesByCategory).map(category => `
                    <div class="validation-category">
                        <h5>${category}</h5>
                        <ul class="issue-list">
                            ${issuesByCategory[category].map(issue => `
                                <li class="issue-item ${issue.type}">
                                    <span class="issue-icon">${this.getIssueIcon(issue.type)}</span>
                                    <span class="issue-text">${issue.message}</span>
                                    ${issue.deviceId ? `<button class="issue-action" onclick="Toolbar.highlightDevice('${issue.deviceId}')">Ver</button>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal validation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Resultados de Validación</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    ${modalContent}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Cerrar</button>
                    <button class="btn btn-secondary" onclick="Toolbar.generateValidationReport()">Generar Reporte</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        this.app.setStatus(summary);
        
        if (errorCount > 0) {
            Notifications.error(`⚠️ ${errorCount} problemas críticos encontrados`);
        } else if (warningCount > 0) {
            Notifications.warning(`⚠️ ${warningCount} advertencias encontradas`);
        } else {
            Notifications.info(`ℹ️ ${infoCount} observaciones encontradas`);
        }

        this.addValidationStyles();
    },

    /**
     * Obtiene el icono para un tipo de issue
     */
    getIssueIcon(type) {
        const icons = {
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || '•';
    },

    /**
     * Resalta un dispositivo específico
     */
    highlightDevice(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return;

        // Centrar en el dispositivo
        CanvasManager.centerOn(device.x + 50, device.y + 40);

        // Resaltar temporalmente
        const element = document.getElementById(deviceId);
        if (element) {
            element.style.boxShadow = '0 0 20px 5px #ff0000';
            element.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                element.style.boxShadow = '';
                element.style.transform = '';
            }, 3000);
        }

        // Seleccionar dispositivo
        DeviceManager.select(device);
        
        // Cerrar modal
        const modal = document.querySelector('.validation-modal');
        if (modal) modal.remove();
    },

    /**
     * Genera documentación técnica
     */
    generateDocumentation() {
        if (this.app.state.devices.length === 0) {
            Notifications.warning('No hay dispositivos para documentar');
            return;
        }

        const doc = this.createDocumentationData();
        const docContent = this.formatDocumentation(doc);

        // Crear y descargar archivo
        const blob = new Blob([docContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network_documentation_${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);

        // También generar reporte de interfaces
        this.generateInterfaceReport();

        Notifications.success('📋 Documentación técnica generada y descargada');
        this.app.setStatus('Documentación técnica generada exitosamente');
    },

    /**
     * Crea los datos de documentación
     */
    createDocumentationData() {
        const stats = SmartConnectionManager.getConnectionStats();
        const layerStats = LayerManager.getLayerStats();

        return {
            title: 'Documentación de Red',
            generatedAt: new Date().toLocaleString(),
            summary: {
                totalDevices: this.app.state.devices.length,
                totalConnections: this.app.state.connections.length,
                totalInterfaces: stats.totalInterfaces,
                connectedInterfaces: stats.connectedInterfaces,
                utilizationPercent: stats.utilizationPercent,
                layers: Object.keys(layerStats).filter(layer => layerStats[layer].devices > 0),
                deviceTypes: [...new Set(this.app.state.devices.map(d => d.type))]
            },
            devices: this.app.state.devices.map(device => ({
                name: device.name,
                type: device.type,
                layer: device.layer,
                ip: device.ip,
                location: device.location,
                model: device.model,
                brand: device.brand,
                status: device.status,
                interfaces: device.interfaces ? device.interfaces.map(iface => ({
                    name: iface.name,
                    type: iface.type,
                    status: iface.status,
                    connected: iface.connected,
                    speed: iface.speed
                })) : []
            })),
            connections: this.app.state.connections.map(conn => {
                const dev1 = this.app.getDevice(conn.device1);
                const dev2 = this.app.getDevice(conn.device2);
                return {
                    from: dev1?.name || 'Unknown',
                    to: dev2?.name || 'Unknown',
                    type: conn.type,
                    bandwidth: conn.bandwidth,
                    interface1: conn.interface1?.name,
                    interface2: conn.interface2?.name,
                    status: conn.status
                };
            }),
            layerAnalysis: layerStats
        };
    },

    /**
     * Formatea la documentación en Markdown
     */
    formatDocumentation(doc) {
        return `# ${doc.title}

**Generado:** ${doc.generatedAt}

## Resumen Ejecutivo

- **Total de Dispositivos:** ${doc.summary.totalDevices}
- **Total de Conexiones:** ${doc.summary.totalConnections}
- **Total de Interfaces:** ${doc.summary.totalInterfaces}
- **Interfaces Conectadas:** ${doc.summary.connectedInterfaces} (${doc.summary.utilizationPercent}%)
- **Capas de Red:** ${doc.summary.layers.join(', ')}
- **Tipos de Dispositivos:** ${doc.summary.deviceTypes.join(', ')}

## Análisis por Capas

${Object.keys(doc.layerAnalysis).map(layerId => {
    const layer = doc.layerAnalysis[layerId];
    return `### ${layer.name}
- Dispositivos: ${layer.devices}
- Conexiones: ${layer.connections}
- Estado: ${layer.visible ? 'Visible' : 'Oculta'}`;
}).join('\n\n')}

## Inventario de Dispositivos

${doc.devices.map(d => `### ${d.name}
- **Tipo:** ${d.type}
- **Capa:** ${d.layer}
- **IP:** ${d.ip || 'No asignada'}
- **Ubicación:** ${d.location || 'No especificada'}
- **Modelo:** ${d.model || 'No especificado'}
- **Estado:** ${d.status}
- **Interfaces:** ${d.interfaces.length} (${d.interfaces.filter(i => i.connected).length} conectadas)

${d.interfaces.length > 0 ? `**Detalle de Interfaces:**
${d.interfaces.map(iface => `  - ${iface.name} (${iface.type}): ${iface.status} ${iface.connected ? '- Conectada' : ''}`).join('\n')}` : ''}
`).join('\n')}

## Conexiones de Red

${doc.connections.map(c => `- **${c.from}** (${c.interface1 || 'N/A'}) ↔ **${c.to}** (${c.interface2 || 'N/A'})
  - Medio: ${c.type}
  - Ancho de banda: ${c.bandwidth}
  - Estado: ${c.status}`).join('\n\n')}

## Estadísticas de Utilización

- **Eficiencia de conexiones:** ${doc.summary.utilizationPercent}%
- **Promedio de interfaces por dispositivo:** ${(doc.summary.totalInterfaces / doc.summary.totalDevices).toFixed(1)}
- **Densidad de conexiones:** ${(doc.summary.totalConnections / doc.summary.totalDevices).toFixed(1)} conexiones por dispositivo

---
*Documento generado automáticamente por Network Diagram Creator Pro*`;
    },

    /**
     * Genera reporte detallado de interfaces
     */
    generateInterfaceReport() {
        const interfaceData = [];

        this.app.state.devices.forEach(device => {
            if (!device.interfaces) return;

            device.interfaces.forEach(iface => {
                interfaceData.push({
                    device: device.name,
                    deviceType: device.type,
                    deviceLayer: device.layer,
                    interfaceName: iface.name,
                    interfaceType: iface.type,
                    status: iface.status,
                    connected: iface.connected ? 'Sí' : 'No',
                    speed: iface.speed,
                    vlan: iface.vlan || 'N/A',
                    description: iface.description || ''
                });
            });
        });

        // Generar CSV
        const headers = [
            'Dispositivo', 'Tipo Dispositivo', 'Capa', 'Interfaz', 
            'Tipo Interfaz', 'Estado', 'Conectada', 'Velocidad', 'VLAN', 'Descripción'
        ];

        const csvContent = [
            headers.join(','),
            ...interfaceData.map(row => [
                `"${row.device}"`, row.deviceType, row.deviceLayer, row.interfaceName,
                row.interfaceType, row.status, row.connected, row.speed, row.vlan, `"${row.description}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interface_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Añade estilos para validación
     */
    addValidationStyles() {
        if (document.getElementById('validation-styles')) return;

        const style = document.createElement('style');
        style.id = 'validation-styles';
        style.textContent = `
            .validation-results {
                max-height: 500px;
                overflow-y: auto;
            }
            
            .validation-summary {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .summary-stats {
                display: flex;
                gap: 15px;
                margin-top: 10px;
            }
            
            .stat-item {
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
            }
            
            .stat-item.error { background: #ffebee; color: #c62828; }
            .stat-item.warning { background: #fff3e0; color: #ef6c00; }
            .stat-item.info { background: #e3f2fd; color: #1565c0; }
            
            .validation-category {
                margin-bottom: 20px;
            }
            
            .validation-category h5 {
                margin: 0 0 10px 0;
                color: #495057;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 5px;
            }
            
            .issue-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }
            
            .issue-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 4px;
                font-size: 13px;
            }
            
            .issue-item.error { background: #ffebee; border-left: 4px solid #f44336; }
            .issue-item.warning { background: #fff3e0; border-left: 4px solid #ff9800; }
            .issue-item.info { background: #e3f2fd; border-left: 4px solid #2196f3; }
            
            .issue-icon {
                margin-right: 8px;
                font-size: 14px;
            }
            
            .issue-text {
                flex: 1;
            }
            
            .issue-action {
                background: #007bff;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 11px;
                cursor: pointer;
                margin-left: 8px;
            }
            
            .issue-action:hover {
                background: #0056b3;
            }
        `;
        document.head.appendChild(style);
    }
};

// Exportar para uso global
//window.Toolbar = Toolbar;
window.ToolbarManager = Toolbar;