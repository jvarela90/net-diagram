/**
 * Monitoring - Sistema de monitoreo de red
 */

const Monitoring = {
    app: null,
    enabled: false,
    interval: null,
    updateFrequency: 3000, // 3 segundos

    /**
     * Inicializa el sistema de monitoreo
     */
    init(app) {
        this.app = app;
        this.setupMonitoringPanel();
        console.log('✓ Monitoring inicializado');
    },

    /**
     * Configura el panel de monitoreo
     */
    setupMonitoringPanel() {
        const panel = document.getElementById('monitoring-panel');
        if (!panel) return;

        const content = document.getElementById('monitoring-content');
        if (content) {
            content.innerHTML = `
                <div class="metric-item">
                    <span>Dispositivos Activos:</span>
                    <span class="metric-value metric-good" id="active-devices">0</span>
                </div>
                <div class="metric-item">
                    <span>Conexiones:</span>
                    <span class="metric-value metric-good" id="total-connections">0</span>
                </div>
                <div class="metric-item">
                    <span>Alertas:</span>
                    <span class="metric-value metric-warning" id="alerts-count">0</span>
                </div>
                <div class="metric-item">
                    <span>Rendimiento Promedio:</span>
                    <span class="metric-value metric-good" id="avg-performance">98%</span>
                </div>
                <div class="metric-item">
                    <span>Ancho de Banda:</span>
                    <span class="metric-value metric-good" id="bandwidth-usage">45%</span>
                </div>
                <div class="metric-item">
                    <span>Latencia Promedio:</span>
                    <span class="metric-value metric-good" id="avg-latency">12ms</span>
                </div>
            `;
        }
    },

    /**
     * Alterna el estado del monitoreo
     */
    toggle() {
        if (this.enabled) {
            this.stop();
        } else {
            this.start();
        }
    },

    /**
     * Inicia el monitoreo
     */
    start() {
        this.enabled = true;
        const panel = document.getElementById('monitoring-panel');
        if (panel) {
            panel.classList.remove('hidden');
        }

        this.startSimulation();
        Notifications.info('Monitoreo de red activado');
    },

    /**
     * Detiene el monitoreo
     */
    stop() {
        this.enabled = false;
        const panel = document.getElementById('monitoring-panel');
        if (panel) {
            panel.classList.add('hidden');
        }

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        Notifications.info('Monitoreo de red desactivado');
    },

    /**
     * Pausa el monitoreo
     */
    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    /**
     * Reanuda el monitoreo
     */
    resume() {
        if (this.enabled && !this.interval) {
            this.startSimulation();
        }
    },

    /**
     * Verifica si el monitoreo está activo
     */
    isEnabled() {
        return this.enabled;
    },

    /**
     * Inicia la simulación de monitoreo
     */
    startSimulation() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            if (!this.enabled) return;
            
            this.updateDeviceMetrics();
            this.updateNetworkMetrics();
            this.checkAlerts();
            this.updateMonitoringPanel();
        }, this.updateFrequency);

        // Actualización inicial
        this.updateStats();
    },

    /**
     * Actualiza métricas de dispositivos
     */
    updateDeviceMetrics() {
        this.app.state.devices.forEach(device => {
            // Simular cambios en CPU
            const cpuChange = (Math.random() - 0.5) * 10;
            device.cpu = Math.max(5, Math.min(95, device.cpu + cpuChange));

            // Simular cambios en memoria
            const memoryChange = (Math.random() - 0.5) * 5;
            device.memory = Math.max(10, Math.min(90, device.memory + memoryChange));

            // Simular cambios en ancho de banda
            const bandwidthChange = (Math.random() - 0.5) * 15;
            device.bandwidth = Math.max(5, Math.min(80, device.bandwidth + bandwidthChange));

            // Simular cambios en temperatura
            const tempChange = (Math.random() - 0.5) * 2;
            device.temperature = Math.max(20, Math.min(70, device.temperature + tempChange));

            // Cambios ocasionales de estado
            if (Math.random() < 0.01) { // 1% probabilidad
                const statuses = ['up', 'down', 'warning'];
                const weights = [0.85, 0.05, 0.10]; // 85% up, 5% down, 10% warning
                device.status = this.weightedRandom(statuses, weights);
                
                // Actualizar visualización del dispositivo
                this.updateDeviceVisualization(device);
            }

            // Actualizar uptime
            if (device.status === 'up') {
                const currentUptime = parseFloat(device.uptime) || 99.0;
                device.uptime = Math.min(99.9, currentUptime + 0.01).toFixed(1) + '%';
            }
        });
    },

    /**
     * Actualiza métricas de red
     */
    updateNetworkMetrics() {
        // Simular latencia de red
        this.networkLatency = 5 + Math.random() * 20; // 5-25ms

        // Simular throughput
        this.networkThroughput = 80 + Math.random() * 20; // 80-100%

        // Simular packet loss
        this.packetLoss = Math.random() * 0.5; // 0-0.5%
    },

    /**
     * Verifica y genera alertas
     */
    checkAlerts() {
        const alerts = [];

        this.app.state.devices.forEach(device => {
            // Alertas de CPU
            if (device.cpu > 80) {
                alerts.push({
                    type: 'warning',
                    device: device.name,
                    message: `CPU alta: ${device.cpu.toFixed(1)}%`,
                    timestamp: new Date()
                });
            }

            // Alertas de temperatura
            if (device.temperature > 60) {
                alerts.push({
                    type: 'warning',
                    device: device.name,
                    message: `Temperatura alta: ${device.temperature.toFixed(1)}°C`,
                    timestamp: new Date()
                });
            }

            // Alertas de estado
            if (device.status === 'down') {
                alerts.push({
                    type: 'error',
                    device: device.name,
                    message: 'Dispositivo inaccesible',
                    timestamp: new Date()
                });
            }

            // Alertas de memoria
            if (device.memory > 85) {
                alerts.push({
                    type: 'warning',
                    device: device.name,
                    message: `Memoria alta: ${device.memory.toFixed(1)}%`,
                    timestamp: new Date()
                });
            }
        });

        // Mostrar alertas críticas
        alerts.forEach(alert => {
            if (alert.type === 'error') {
                Notifications.error(`${alert.device}: ${alert.message}`);
            }
        });

        this.currentAlerts = alerts;
    },

    /**
     * Actualiza el panel de monitoreo
     */
    updateMonitoringPanel() {
        if (!this.enabled) return;

        const activeDevices = this.app.state.devices.filter(d => d.status === 'up').length;
        const totalConnections = this.app.state.connections.length;
        const alertsCount = this.currentAlerts ? this.currentAlerts.length : 0;
        
        // Calcular promedios
        const avgCPU = this.app.state.devices.length > 0 ? 
            this.app.state.devices.reduce((sum, d) => sum + d.cpu, 0) / this.app.state.devices.length : 0;
        
        const avgBandwidth = this.app.state.devices.length > 0 ?
            this.app.state.devices.reduce((sum, d) => sum + d.bandwidth, 0) / this.app.state.devices.length : 0;

        const avgPerformance = 100 - avgCPU;

        // Actualizar elementos
        this.updateMetricElement('active-devices', activeDevices);
        this.updateMetricElement('total-connections', totalConnections);
        this.updateMetricElement('alerts-count', alertsCount);
        this.updateMetricElement('avg-performance', `${avgPerformance.toFixed(1)}%`);
        this.updateMetricElement('bandwidth-usage', `${avgBandwidth.toFixed(1)}%`);
        this.updateMetricElement('avg-latency', `${this.networkLatency ? this.networkLatency.toFixed(0) : 12}ms`);

        // Actualizar colores según valores
        this.updateMetricColor('avg-performance', avgPerformance, 90, 70);
        this.updateMetricColor('bandwidth-usage', 100 - avgBandwidth, 80, 60);
        this.updateMetricColor('alerts-count', alertsCount, 1, 5, true); // invertido: más alertas = peor
    },

    /**
     * Actualiza un elemento de métrica
     */
    updateMetricElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    /**
     * Actualiza el color de una métrica según umbrales
     */
    updateMetricColor(elementId, value, goodThreshold, warningThreshold, inverted = false) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Limpiar clases anteriores
        element.classList.remove('metric-good', 'metric-warning', 'metric-critical');

        let className;
        if (inverted) {
            // Para alertas: menos es mejor
            if (value <= goodThreshold) {
                className = 'metric-good';
            } else if (value <= warningThreshold) {
                className = 'metric-warning';
            } else {
                className = 'metric-critical';
            }
        } else {
            // Para métricas normales: más es mejor
            if (value >= goodThreshold) {
                className = 'metric-good';
            } else if (value >= warningThreshold) {
                className = 'metric-warning';
            } else {
                className = 'metric-critical';
            }
        }

        element.classList.add(className);
    },

    /**
     * Actualiza la visualización de un dispositivo
     */
    updateDeviceVisualization(device) {
        const deviceElement = document.getElementById(device.id);
        if (!deviceElement) return;

        // Actualizar clases de estado
        deviceElement.className = `device-on-canvas status-${device.status} layer-${device.layer}`;

        // Actualizar métricas mostradas
        const metricsElement = deviceElement.querySelector('.device-metrics');
        if (metricsElement) {
            metricsElement.textContent = `CPU: ${device.cpu.toFixed(0)}% | RAM: ${device.memory.toFixed(0)}%`;
        }
    },

    /**
     * Actualiza estadísticas generales
     */
    updateStats() {
        const totalDevices = this.app.state.devices.length;
        const activeDevices = this.app.state.devices.filter(d => d.status === 'up').length;
        const totalConnections = this.app.state.connections.length;
        const activeConnections = this.app.state.connections.filter(c => c.status === 'up').length;

        // Actualizar contadores en la barra de estado
        this.app.updateStats();

        return {
            totalDevices,
            activeDevices,
            totalConnections,
            activeConnections,
            deviceAvailability: totalDevices > 0 ? (activeDevices / totalDevices * 100).toFixed(1) : 0,
            connectionAvailability: totalConnections > 0 ? (activeConnections / totalConnections * 100).toFixed(1) : 0
        };
    },

    /**
     * Selección aleatoria ponderada
     */
    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    },

    /**
     * Genera reporte de monitoreo
     */
    generateReport() {
        const stats = this.updateStats();
        const currentTime = new Date();
        
        const report = {
            timestamp: currentTime.toISOString(),
            summary: stats,
            devices: this.app.state.devices.map(device => ({
                name: device.name,
                type: device.type,
                layer: device.layer,
                status: device.status,
                metrics: {
                    cpu: device.cpu.toFixed(1),
                    memory: device.memory.toFixed(1),
                    bandwidth: device.bandwidth.toFixed(1),
                    temperature: device.temperature.toFixed(1),
                    uptime: device.uptime
                },
                lastUpdate: currentTime.toISOString()
            })),
            alerts: this.currentAlerts || [],
            network: {
                latency: this.networkLatency ? this.networkLatency.toFixed(1) : 'N/A',
                throughput: this.networkThroughput ? this.networkThroughput.toFixed(1) : 'N/A',
                packetLoss: this.packetLoss ? this.packetLoss.toFixed(3) : 'N/A'
            }
        };

        return report;
    },

    /**
     * Exporta reporte de monitoreo
     */
    exportReport() {
        const report = this.generateReport();
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monitoring_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Notifications.success('Reporte de monitoreo exportado');
    },

    /**
     * Simula un ping a un dispositivo
     */
    pingDevice(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return null;

        const isReachable = device.status === 'up';
        const latency = isReachable ? 5 + Math.random() * 50 : null;
        const packetLoss = isReachable ? Math.random() * 2 : 100;

        const result = {
            device: device.name,
            reachable: isReachable,
            latency: latency ? latency.toFixed(1) + 'ms' : 'timeout',
            packetLoss: packetLoss.toFixed(1) + '%',
            timestamp: new Date().toISOString()
        };

        Notifications.info(`Ping ${device.name}: ${result.reachable ? 'OK' : 'FAILED'} (${result.latency})`);
        
        return result;
    },

    /**
     * Simula un trace route
     */
    traceRoute(sourceDeviceId, targetDeviceId) {
        const sourceDevice = this.app.getDevice(sourceDeviceId);
        const targetDevice = this.app.getDevice(targetDeviceId);
        
        if (!sourceDevice || !targetDevice) {
            Notifications.error('Dispositivos no encontrados para trace route');
            return null;
        }

        // Encontrar ruta simple entre dispositivos
        const path = this.findPath(sourceDeviceId, targetDeviceId);
        
        const hops = path.map((deviceId, index) => {
            const device = this.app.getDevice(deviceId);
            const latency = 5 + index * 2 + Math.random() * 10;
            
            return {
                hop: index + 1,
                device: device.name,
                ip: device.ip || `192.168.1.${index + 1}`,
                latency: latency.toFixed(1) + 'ms'
            };
        });

        const result = {
            source: sourceDevice.name,
            target: targetDevice.name,
            hops: hops,
            totalHops: hops.length,
            timestamp: new Date().toISOString()
        };

        // Mostrar resultado en modal
        this.showTraceRouteResult(result);
        
        return result;
    },

    /**
     * Encuentra una ruta simple entre dos dispositivos
     */
    findPath(sourceId, targetId) {
        // Implementación simple de búsqueda de ruta
        const visited = new Set();
        const queue = [[sourceId]];
        
        while (queue.length > 0) {
            const path = queue.shift();
            const currentId = path[path.length - 1];
            
            if (currentId === targetId) {
                return path;
            }
            
            if (visited.has(currentId)) {
                continue;
            }
            
            visited.add(currentId);
            
            // Encontrar dispositivos conectados
            const connectedDevices = this.app.state.connections
                .filter(conn => conn.device1 === currentId || conn.device2 === currentId)
                .map(conn => conn.device1 === currentId ? conn.device2 : conn.device1);
            
            connectedDevices.forEach(deviceId => {
                if (!visited.has(deviceId)) {
                    queue.push([...path, deviceId]);
                }
            });
        }
        
        // Si no se encuentra ruta, retornar solo origen y destino
        return [sourceId, targetId];
    },

    /**
     * Muestra resultado de trace route
     */
    showTraceRouteResult(result) {
        const modal = document.createElement('div');
        modal.className = 'modal traceroute-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Trace Route: ${result.source} → ${result.target}</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="traceroute-info">
                        <p><strong>Origen:</strong> ${result.source}</p>
                        <p><strong>Destino:</strong> ${result.target}</p>
                        <p><strong>Total de saltos:</strong> ${result.totalHops}</p>
                        <p><strong>Hora:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <table class="traceroute-table">
                        <thead>
                            <tr>
                                <th>Salto</th>
                                <th>Dispositivo</th>
                                <th>IP</th>
                                <th>Latencia</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${result.hops.map(hop => `
                                <tr>
                                    <td>${hop.hop}</td>
                                    <td>${hop.device}</td>
                                    <td>${hop.ip}</td>
                                    <td>${hop.latency}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        this.addTraceRouteStyles();
    },

    /**
     * Simula monitoreo SNMP
     */
    snmpWalk(deviceId) {
        const device = this.app.getDevice(deviceId);
        if (!device) return null;

        if (device.status !== 'up') {
            Notifications.warning(`${device.name} no responde a SNMP`);
            return null;
        }

        const oids = {
            '1.3.6.1.2.1.1.1.0': `${device.type} ${device.model || 'Generic'}`,
            '1.3.6.1.2.1.1.3.0': Math.floor(Math.random() * 1000000) + ' ticks',
            '1.3.6.1.2.1.1.5.0': device.name,
            '1.3.6.1.2.1.2.1.0': device.interfaces ? device.interfaces.length : 4,
            '1.3.6.1.4.1.2021.4.5.0': `${device.memory.toFixed(0)}%`,
            '1.3.6.1.4.1.2021.10.1.3.1': `${device.cpu.toFixed(0)}%`
        };

        const result = {
            device: device.name,
            community: device.snmp || 'public',
            oids: oids,
            timestamp: new Date().toISOString()
        };

        Notifications.success(`SNMP walk completado para ${device.name}`);
        console.log('SNMP Walk Result:', result);
        
        return result;
    },

    /**
     * Configura alertas personalizadas
     */
    configureAlerts() {
        const modal = document.createElement('div');
        modal.className = 'modal alerts-config-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Configuración de Alertas</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="alert-config-grid">
                        <div class="config-group">
                            <h4>Umbrales de CPU</h4>
                            <label>Advertencia (%): <input type="number" id="cpu-warning" value="80" min="0" max="100"></label>
                            <label>Crítico (%): <input type="number" id="cpu-critical" value="90" min="0" max="100"></label>
                        </div>
                        
                        <div class="config-group">
                            <h4>Umbrales de Memoria</h4>
                            <label>Advertencia (%): <input type="number" id="memory-warning" value="85" min="0" max="100"></label>
                            <label>Crítico (%): <input type="number" id="memory-critical" value="95" min="0" max="100"></label>
                        </div>
                        
                        <div class="config-group">
                            <h4>Umbrales de Temperatura</h4>
                            <label>Advertencia (°C): <input type="number" id="temp-warning" value="60" min="0" max="100"></label>
                            <label>Crítico (°C): <input type="number" id="temp-critical" value="70" min="0" max="100"></label>
                        </div>
                        
                        <div class="config-group">
                            <h4>Configuración General</h4>
                            <label>Frecuencia de actualización (ms): <input type="number" id="update-freq" value="${this.updateFrequency}" min="1000" max="60000"></label>
                            <label><input type="checkbox" id="sound-alerts"> Alertas sonoras</label>
                            <label><input type="checkbox" id="email-alerts"> Notificaciones por email</label>
                        </div>
                    </div>
                    
                    <div class="modal-buttons">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="button" class="btn-primary" onclick="Monitoring.saveAlertConfig()">Guardar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    },

    /**
     * Guarda configuración de alertas
     */
    saveAlertConfig() {
        const config = {
            cpu: {
                warning: parseInt(document.getElementById('cpu-warning').value),
                critical: parseInt(document.getElementById('cpu-critical').value)
            },
            memory: {
                warning: parseInt(document.getElementById('memory-warning').value),
                critical: parseInt(document.getElementById('memory-critical').value)
            },
            temperature: {
                warning: parseInt(document.getElementById('temp-warning').value),
                critical: parseInt(document.getElementById('temp-critical').value)
            },
            updateFrequency: parseInt(document.getElementById('update-freq').value),
            soundAlerts: document.getElementById('sound-alerts').checked,
            emailAlerts: document.getElementById('email-alerts').checked
        };

        // Aplicar nueva frecuencia
        this.updateFrequency = config.updateFrequency;
        if (this.enabled) {
            this.startSimulation(); // Reiniciar con nueva frecuencia
        }

        // Guardar configuración
        Helpers.saveToStorage('monitoringConfig', config);
        
        // Cerrar modal
        document.querySelector('.alerts-config-modal').remove();
        
        Notifications.success('Configuración de alertas guardada');
    },

    /**
     * Añade estilos para trace route
     */
    addTraceRouteStyles() {
        if (document.getElementById('traceroute-styles')) return;

        const style = document.createElement('style');
        style.id = 'traceroute-styles';
        style.textContent = `
            .traceroute-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .traceroute-table {
                width: 100%;
                border-collapse: collapse;
                font-family: monospace;
            }
            
            .traceroute-table th,
            .traceroute-table td {
                padding: 8px 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .traceroute-table th {
                background: #f8f9fa;
                font-weight: bold;
            }
            
            .alert-config-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .config-group h4 {
                margin-bottom: 15px;
                color: var(--primary-color);
                border-bottom: 2px solid var(--bg-light);
                padding-bottom: 5px;
            }
            
            .config-group label {
                display: block;
                margin-bottom: 10px;
                font-size: 13px;
            }
            
            .config-group input[type="number"] {
                width: 80px;
                padding: 4px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-left: 10px;
            }
            
            .config-group input[type="checkbox"] {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(style);
    }
};

// Exportar para uso global
window.Monitoring = Monitoring;