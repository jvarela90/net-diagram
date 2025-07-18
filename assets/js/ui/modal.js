/**
 * Modal - Sistema de gestión de ventanas modales
 */

const Modal = {
    app: null,
    currentModal: null,

    /**
     * Inicializa el sistema de modales
     */
    init(app) {
        this.app = app;
        this.setupModalSystem();
        console.log('✓ Modal inicializado');
    },

    /**
     * Configura el sistema de modales
     */
    setupModalSystem() {
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });

        // Cerrar modal clickeando fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close();
            }
        });

        this.addModalStyles();
    },

    /**
     * Abre el modal de propiedades de dispositivo
     */
    openProperties(device) {
        if (!device) return;

        const modal = this.createPropertiesModal(device);
        this.show(modal);
    },

    /**
     * Crea el modal de propiedades
     */
    createPropertiesModal(device) {
        const modal = document.createElement('div');
        modal.className = 'modal properties-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Propiedades de ${device.name}</h3>
                    <span class="close" onclick="Modal.close()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="modal-tabs">
                        <button class="modal-tab active" onclick="Modal.switchTab('general')">📋 General</button>
                        <button class="modal-tab" onclick="Modal.switchTab('network')">🌐 Red</button>
                        <button class="modal-tab" onclick="Modal.switchTab('monitoring')">📊 Monitoreo</button>
                        <button class="modal-tab" onclick="Modal.switchTab('advanced')">⚙️ Avanzado</button>
                    </div>

                    <form id="properties-form" onsubmit="Modal.handlePropertiesSubmit(event)">
                        ${this.generateTabContent(device)}
                        
                        <div class="modal-buttons">
                            <button type="button" class="btn-secondary" onclick="Modal.close()">Cancelar</button>
                            <button type="button" class="btn-danger" onclick="Modal.deleteDevice()">🗑️ Eliminar</button>
                            <button type="submit" class="btn-primary">💾 Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        return modal;
    },

    /**
     * Genera el contenido de las pestañas
     */
    generateTabContent(device) {
        return `
            <!-- General Tab -->
            <div id="general-tab" class="tab-content active">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="device-name">Nombre del Dispositivo:</label>
                        <input type="text" id="device-name" name="name" value="${device.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="device-type-display">Tipo:</label>
                        <input type="text" id="device-type-display" value="${device.type}" readonly>
                    </div>
                    <div class="form-group">
                        <label for="device-model">Modelo:</label>
                        <input type="text" id="device-model" name="model" value="${device.model || ''}">
                    </div>
                    <div class="form-group">
                        <label for="device-brand">Marca:</label>
                        <input type="text" id="device-brand" name="brand" value="${device.brand || ''}">
                    </div>
                    <div class="form-group">
                        <label for="device-serial">Número de Serie:</label>
                        <input type="text" id="device-serial" name="serial" value="${device.serial || ''}">
                    </div>
                    <div class="form-group">
                        <label for="device-location">Ubicación Física:</label>
                        <input type="text" id="device-location" name="location" value="${device.location || ''}" placeholder="Sala/Rack/Posición">
                    </div>
                    <div class="form-group full-width">
                        <label for="device-description">Descripción:</label>
                        <textarea id="device-description" name="description" rows="3">${device.description || ''}</textarea>
                    </div>
                </div>
            </div>

            <!-- Network Tab -->
            <div id="network-tab" class="tab-content">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="device-ip">Dirección IP:</label>
                        <input type="text" id="device-ip" name="ip" value="${device.ip || ''}" placeholder="192.168.1.1">
                    </div>
                    <div class="form-group">
                        <label for="device-subnet">Máscara de Subred:</label>
                        <input type="text" id="device-subnet" name="subnet" value="${device.subnet || ''}" placeholder="255.255.255.0">
                    </div>
                    <div class="form-group">
                        <label for="device-gateway">Gateway:</label>
                        <input type="text" id="device-gateway" name="gateway" value="${device.gateway || ''}" placeholder="192.168.1.1">
                    </div>
                    <div class="form-group">
                        <label for="device-dns">DNS:</label>
                        <input type="text" id="device-dns" name="dns" value="${device.dns || ''}" placeholder="8.8.8.8">
                    </div>
                    <div class="form-group">
                        <label for="device-vlan">VLAN ID:</label>
                        <input type="number" id="device-vlan" name="vlan" value="${device.vlan || ''}" min="1" max="4094">
                    </div>
                    <div class="form-group">
                        <label for="device-mac">Dirección MAC:</label>
                        <input type="text" id="device-mac" name="mac" value="${device.mac || ''}" placeholder="00:11:22:33:44:55">
                    </div>
                    <div class="form-group">
                        <label for="device-ports">Puertos Abiertos:</label>
                        <input type="text" id="device-ports" name="ports" value="${device.ports || ''}" placeholder="22, 80, 443">
                    </div>
                    <div class="form-group">
                        <label for="device-layer">Capa de Red:</label>
                        <select id="device-layer" name="layer">
                            <option value="isp" ${device.layer === 'isp' ? 'selected' : ''}>ISP Layer</option>
                            <option value="wan" ${device.layer === 'wan' ? 'selected' : ''}>WAN Layer</option>
                            <option value="core" ${device.layer === 'core' ? 'selected' : ''}>Core Layer</option>
                            <option value="distribution" ${device.layer === 'distribution' ? 'selected' : ''}>Distribution Layer</option>
                            <option value="access" ${device.layer === 'access' ? 'selected' : ''}>Access Layer</option>
                            <option value="dmz" ${device.layer === 'dmz' ? 'selected' : ''}>DMZ Layer</option>
                            <option value="user" ${device.layer === 'user' ? 'selected' : ''}>User Layer</option>
                            <option value="iot" ${device.layer === 'iot' ? 'selected' : ''}>IoT Layer</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Monitoring Tab -->
            <div id="monitoring-tab" class="tab-content">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="device-status">Estado:</label>
                        <select id="device-status" name="status">
                            <option value="up" ${device.status === 'up' ? 'selected' : ''}>🟢 Activo</option>
                            <option value="down" ${device.status === 'down' ? 'selected' : ''}>🔴 Inactivo</option>
                            <option value="warning" ${device.status === 'warning' ? 'selected' : ''}>🟡 Advertencia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="device-uptime">Uptime:</label>
                        <input type="text" id="device-uptime" name="uptime" value="${device.uptime || ''}" placeholder="99.9%" readonly>
                    </div>
                    <div class="form-group">
                        <label for="device-cpu">CPU (%):</label>
                        <input type="number" id="device-cpu" name="cpu" value="${device.cpu || 25}" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label for="device-memory">Memoria (%):</label>
                        <input type="number" id="device-memory" name="memory" value="${device.memory || 45}" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label for="device-bandwidth">Ancho de Banda (%):</label>
                        <input type="number" id="device-bandwidth" name="bandwidth" value="${device.bandwidth || 30}" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label for="device-temperature">Temperatura (°C):</label>
                        <input type="number" id="device-temperature" name="temperature" value="${device.temperature || 35}" min="0" max="100">
                    </div>
                    <div class="form-group full-width">
                        <label for="device-alerts">Alertas Activas:</label>
                        <textarea id="device-alerts" name="alerts" rows="3" placeholder="No hay alertas activas">${device.alerts || ''}</textarea>
                    </div>
                </div>
            </div>

            <!-- Advanced Tab -->
            <div id="advanced-tab" class="tab-content">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="device-snmp">Comunidad SNMP:</label>
                        <input type="text" id="device-snmp" name="snmp" value="${device.snmp || 'public'}" placeholder="public">
                    </div>
                    <div class="form-group">
                        <label for="device-backup">Backup:</label>
                        <select id="device-backup" name="backup">
                            <option value="none" ${device.backup === 'none' ? 'selected' : ''}>Sin backup</option>
                            <option value="daily" ${device.backup === 'daily' ? 'selected' : ''}>Diario</option>
                            <option value="weekly" ${device.backup === 'weekly' ? 'selected' : ''}>Semanal</option>
                            <option value="monthly" ${device.backup === 'monthly' ? 'selected' : ''}>Mensual</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="device-firmware">Versión Firmware:</label>
                        <input type="text" id="device-firmware" name="firmware" value="${device.firmware || ''}">
                    </div>
                    <div class="form-group">
                        <label for="device-warranty">Garantía:</label>
                        <input type="date" id="device-warranty" name="warranty" value="${device.warranty || ''}">
                    </div>
                    <div class="form-group">
                        <label for="device-purchase">Fecha de Compra:</label>
                        <input type="date" id="device-purchase" name="purchase" value="${device.purchase || ''}">
                    </div>
                    <div class="form-group">
                        <label for="device-cost">Costo (USD):</label>
                        <input type="number" id="device-cost" name="cost" value="${device.cost || 0}" min="0" step="0.01">
                    </div>
                    <div class="form-group full-width">
                        <label for="device-notes">Notas Técnicas:</label>
                        <textarea id="device-notes" name="notes" rows="4">${device.notes || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Cambia entre pestañas del modal
     */
    switchTab(tabName) {
        // Actualizar pestañas
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    },

    /**
     * Maneja el envío del formulario de propiedades
     */
    handlePropertiesSubmit(e) {
        e.preventDefault();
        
        if (!this.app.state.selectedDevice) return;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Validar datos
        const validationErrors = this.validateFormData(data);
        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }

        // Actualizar dispositivo
        this.updateDevice(this.app.state.selectedDevice, data);
        
        this.close();
        Notifications.success('Propiedades actualizadas exitosamente');
    },

    /**
     * Valida los datos del formulario
     */
    validateFormData(data) {
        const errors = [];

        if (!data.name || data.name.trim() === '') {
            errors.push('El nombre del dispositivo es requerido');
        }

        if (data.ip && !Validators.isValidIP(data.ip)) {
            errors.push('Dirección IP inválida');
        }

        if (data.subnet && !Validators.isValidSubnetMask(data.subnet)) {
            errors.push('Máscara de subred inválida');
        }

        if (data.gateway && !Validators.isValidIP(data.gateway)) {
            errors.push('Gateway inválido');
        }

        if (data.dns && !Validators.isValidIP(data.dns)) {
            errors.push('DNS inválido');
        }

        if (data.mac && !Validators.isValidMAC(data.mac)) {
            errors.push('Dirección MAC inválida');
        }

        if (data.vlan && !Validators.isValidVLAN(data.vlan)) {
            errors.push('VLAN inválida (debe estar entre 1-4094)');
        }

        return errors;
    },

    /**
     * Muestra errores de validación
     */
    showValidationErrors(errors) {
        const errorList = errors.map(error => `• ${error}`).join('\n');
        Notifications.error(`Errores de validación:\n${errorList}`);
    },

    /**
     * Actualiza el dispositivo con los nuevos datos
     */
    updateDevice(device, data) {
        // Actualizar propiedades
        Object.keys(data).forEach(key => {
            if (data[key] !== '') {
                device[key] = data[key];
            }
        });

        // Convertir números
        ['cpu', 'memory', 'bandwidth', 'temperature', 'vlan', 'cost'].forEach(field => {
            if (data[field] !== '') {
                device[field] = parseFloat(data[field]) || 0;
            }
        });

        // Actualizar visualización
        DeviceManager.updateRender(device);

        // Auto-guardar
        if (this.app.config.autoSave) {
            setTimeout(() => this.app.autoSave(), 500);
        }
    },

    /**
     * Elimina el dispositivo seleccionado
     */
    deleteDevice() {
        if (!this.app.state.selectedDevice) return;
        
        const deviceName = this.app.state.selectedDevice.name;
        if (confirm(`¿Estás seguro de que quieres eliminar ${deviceName}?`)) {
            DeviceManager.delete(this.app.state.selectedDevice.id);
            this.close();
        }
    },

    /**
     * Muestra un modal
     */
    show(modal) {
        if (this.currentModal) {
            this.close();
        }

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Animación de entrada
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Enfocar primer input
        const firstInput = modal.querySelector('input[type="text"], textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    },

    /**
     * Cierra el modal actual
     */
    close() {
        if (!this.currentModal) return;

        this.currentModal.classList.remove('show');
        
        setTimeout(() => {
            if (this.currentModal && this.currentModal.parentNode) {
                this.currentModal.parentNode.removeChild(this.currentModal);
            }
            this.currentModal = null;
        }, 300);
    },

    /**
     * Cierra todas las ventanas modales
     */
    closeAll() {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        this.currentModal = null;
    },

    /**
     * Crea un modal de confirmación
     */
    confirm(message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'modal confirm-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>Confirmación</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <div class="modal-buttons">
                        <button type="button" class="btn-secondary" onclick="Modal.handleConfirmCancel()">Cancelar</button>
                        <button type="button" class="btn-primary" onclick="Modal.handleConfirmAccept()">Aceptar</button>
                    </div>
                </div>
            </div>
        `;

        // Almacenar callbacks
        modal._onConfirm = onConfirm;
        modal._onCancel = onCancel;

        this.show(modal);
        return modal;
    },

    /**
     * Maneja la confirmación
     */
    handleConfirmAccept() {
        if (this.currentModal && this.currentModal._onConfirm) {
            this.currentModal._onConfirm();
        }
        this.close();
    },

    /**
     * Maneja la cancelación
     */
    handleConfirmCancel() {
        if (this.currentModal && this.currentModal._onCancel) {
            this.currentModal._onCancel();
        }
        this.close();
    },

    /**
     * Crea un modal de información
     */
    info(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <span class="close" onclick="Modal.close()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="info-content">${content}</div>
                    <div class="modal-buttons">
                        <button type="button" class="btn-primary" onclick="Modal.close()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        this.show(modal);
        return modal;
    },

    /**
     * Crea un modal de ayuda
     */
    showHelp() {
        const helpContent = `
            <div class="help-sections">
                <section>
                    <h4>🎯 Controles Principales</h4>
                    <ul>
                        <li><strong>Crear dispositivos:</strong> Arrastra desde el panel lateral</li>
                        <li><strong>Seleccionar:</strong> Click izquierdo en dispositivo</li>
                        <li><strong>Propiedades:</strong> Click derecho en dispositivo</li>
                        <li><strong>Mover:</strong> Arrastrar dispositivo seleccionado</li>
                        <li><strong>Conectar:</strong> Botón "Conectar" + seleccionar interfaces</li>
                    </ul>
                </section>

                <section>
                    <h4>⌨️ Atajos de Teclado</h4>
                    <ul>
                        <li><strong>Ctrl+N:</strong> Nuevo diagrama</li>
                        <li><strong>Ctrl+S:</strong> Guardar diagrama</li>
                        <li><strong>Ctrl+O:</strong> Abrir diagrama</li>
                        <li><strong>Ctrl++ / Ctrl+-:</strong> Zoom in/out</li>
                        <li><strong>Ctrl+0:</strong> Resetear zoom</li>
                        <li><strong>C:</strong> Modo conexión</li>
                        <li><strong>Escape:</strong> Cancelar acciones</li>
                        <li><strong>Delete:</strong> Eliminar seleccionado</li>
                    </ul>
                </section>

                <section>
                    <h4>🔌 Sistema de Interfaces</h4>
                    <ul>
                        <li><strong>Gestionar:</strong> Seleccionar dispositivo + botón "Interfaces"</li>
                        <li><strong>Agregar:</strong> Botón "+" en gestor de interfaces</li>
                        <li><strong>Conectar:</strong> Solo interfaces compatibles</li>
                        <li><strong>Estados:</strong> Verde=conectada, Rojo=incompatible</li>
                    </ul>
                </section>

                <section>
                    <h4>🏷️ Etiquetas de Cables</h4>
                    <ul>
                        <li><strong>Generar:</strong> Botón "Etiquetas" en toolbar</li>
                        <li><strong>Configurar:</strong> Tamaño, formato, colores</li>
                        <li><strong>Imprimir:</strong> Documento optimizado para rotuladoras</li>
                        <li><strong>Exportar:</strong> Datos en JSON/CSV</li>
                    </ul>
                </section>

                <section>
                    <h4>📊 Funciones Avanzadas</h4>
                    <ul>
                        <li><strong>Capas:</strong> Organizar por jerarquía de red</li>
                        <li><strong>Plantillas:</strong> Topologías predefinidas</li>
                        <li><strong>Validación:</strong> Verificar problemas automáticamente</li>
                        <li><strong>Documentación:</strong> Generar reportes técnicos</li>
                    </ul>
                </section>
            </div>
        `;

        this.info('Ayuda - Network Diagram Creator Pro', helpContent);
    },

    /**
     * Añade estilos CSS para los modales
     */
    addModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal {
                display: flex;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(3px);
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal.show {
                opacity: 1;
            }

            .modal-content {
                background-color: white;
                border-radius: 12px;
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }

            .modal.show .modal-content {
                transform: translateY(0);
            }

            .modal-header {
                background: var(--primary-color);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.2em;
            }

            .close {
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }

            .close:hover {
                opacity: 1;
            }

            .modal-body {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .modal-tabs {
                display: flex;
                margin-bottom: 20px;
                border-bottom: 2px solid var(--bg-light);
            }

            .modal-tab {
                padding: 12px 20px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: var(--transition);
                font-size: 14px;
            }

            .modal-tab.active {
                border-bottom-color: var(--secondary-color);
                color: var(--secondary-color);
                font-weight: bold;
            }

            .tab-content {
                display: none;
            }

            .tab-content.active {
                display: block;
            }

            .form-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group.full-width {
                grid-column: 1 / -1;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: var(--text-dark);
                font-size: 13px;
            }

            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 2px solid var(--bg-light);
                border-radius: var(--border-radius);
                font-size: 14px;
                transition: var(--transition);
                font-family: inherit;
            }

            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: var(--secondary-color);
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }

            .form-group input[readonly] {
                background-color: #f8f9fa;
                color: #6c757d;
            }

            .modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid var(--bg-light);
            }

            .btn-primary {
                background: var(--secondary-color);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-size: 14px;
                transition: var(--transition);
            }

            .btn-primary:hover {
                background: #2980b9;
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-size: 14px;
                transition: var(--transition);
            }

            .btn-secondary:hover {
                background: #545b62;
            }

            .btn-danger {
                background: var(--accent-color);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-size: 14px;
                transition: var(--transition);
            }

            .btn-danger:hover {
                background: #c0392b;
            }

            .help-sections section {
                margin-bottom: 25px;
            }

            .help-sections h4 {
                color: var(--primary-color);
                margin-bottom: 10px;
                border-bottom: 2px solid var(--bg-light);
                padding-bottom: 5px;
            }

            .help-sections ul {
                list-style: none;
                padding: 0;
            }

            .help-sections li {
                padding: 5px 0;
                border-bottom: 1px solid #f1f1f1;
            }

            .help-sections li:last-child {
                border-bottom: none;
            }

            .help-sections strong {
                color: var(--secondary-color);
                font-weight: 600;
            }

            .info-content {
                line-height: 1.6;
                color: #333;
            }

            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 10px;
                }

                .form-grid {
                    grid-template-columns: 1fr;
                }

                .modal-tabs {
                    flex-wrap: wrap;
                }

                .modal-tab {
                    padding: 8px 12px;
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Exportar para uso global
window.Modal = Modal;