/**
 * Notifications - Sistema de notificaciones
 */

const Notifications = {
    app: null,
    container: null,
    notifications: [],
    maxNotifications: 5,
    defaultDuration: 4000,

    /**
     * Inicializa el sistema de notificaciones
     */
    init(app) {
        this.app = app;
        this.container = document.getElementById('notification');
        this.setupNotificationArea();
        console.log('✓ Notifications inicializado');
    },

    /**
     * Configura el área de notificaciones
     */
    setupNotificationArea() {
        // Crear contenedor múltiple si no existe
        if (!document.getElementById('notification-area')) {
            const area = document.createElement('div');
            area.id = 'notification-area';
            area.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(area);
        }
    },

    /**
     * Muestra una notificación
     */
    show(message, type = 'info', duration = null, actions = null) {
        const notification = this.createNotification(message, type, duration, actions);
        this.addNotification(notification);
        return notification;
    },

    /**
     * Crea una notificación
     */
    createNotification(message, type, duration, actions) {
        const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const notification = {
            id,
            message,
            type,
            duration: duration || this.defaultDuration,
            actions: actions || [],
            timestamp: new Date(),
            element: null
        };

        notification.element = this.createNotificationElement(notification);
        return notification;
    },

    /**
     * Crea el elemento DOM de la notificación
     */
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.id = notification.id;
        
        // Aplicar estilos
        element.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            padding: 15px 20px;
            margin-bottom: 10px;
            min-width: 300px;
            transform: translateX(450px);
            transition: all 0.3s ease;
            pointer-events: auto;
            position: relative;
        `;

        // Aplicar color según tipo
        const colors = {
            success: '#27ae60',
            warning: '#f39c12', 
            error: '#e74c3c',
            info: '#3498db'
        };
        
        element.style.borderLeft = `4px solid ${colors[notification.type] || colors.info}`;

        // Crear contenido
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
        `;

        // Icono
        const icon = document.createElement('div');
        icon.style.cssText = `
            margin-right: 12px;
            font-size: 18px;
            margin-top: 2px;
        `;
        
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        icon.textContent = icons[notification.type] || icons.info;

        // Mensaje
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            color: #333;
        `;
        messageDiv.innerHTML = notification.message;

        // Botón cerrar
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.5;
            margin-left: 10px;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.addEventListener('click', () => this.remove(notification.id));

        content.appendChild(icon);
        content.appendChild(messageDiv);
        content.appendChild(closeBtn);
        element.appendChild(content);

        // Añadir acciones si existen
        if (notification.actions && notification.actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = `
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 8px;
            `;

            notification.actions.forEach(action => {
                const actionBtn = document.createElement('button');
                actionBtn.textContent = action.text;
                actionBtn.style.cssText = `
                    background: ${action.primary ? colors[notification.type] : 'transparent'};
                    color: ${action.primary ? 'white' : colors[notification.type]};
                    border: 1px solid ${colors[notification.type]};
                    border-radius: 4px;
                    padding: 6px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                `;
                
                actionBtn.addEventListener('click', () => {
                    if (action.callback) {
                        action.callback(notification);
                    }
                    if (action.closeOnClick !== false) {
                        this.remove(notification.id);
                    }
                });

                actionsDiv.appendChild(actionBtn);
            });

            element.appendChild(actionsDiv);
        }

        // Barra de progreso si tiene duración
        if (notification.duration > 0) {
            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: ${colors[notification.type]};
                border-radius: 0 0 8px 8px;
                width: 100%;
                animation: notification-progress ${notification.duration}ms linear;
            `;

            // Añadir animación CSS
            if (!document.getElementById('notification-animations')) {
                const style = document.createElement('style');
                style.id = 'notification-animations';
                style.textContent = `
                    @keyframes notification-progress {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                    .notification:hover .notification-progress {
                        animation-play-state: paused;
                    }
                `;
                document.head.appendChild(style);
            }

            progressBar.className = 'notification-progress';
            element.appendChild(progressBar);

            // Pausar/reanudar en hover
            element.addEventListener('mouseenter', () => {
                progressBar.style.animationPlayState = 'paused';
            });
            
            element.addEventListener('mouseleave', () => {
                progressBar.style.animationPlayState = 'running';
            });
        }

        return element;
    },

    /**
     * Añade una notificación al área
     */
    addNotification(notification) {
        const area = document.getElementById('notification-area');
        
        // Limitar número de notificaciones
        if (this.notifications.length >= this.maxNotifications) {
            this.remove(this.notifications[0].id);
        }

        // Añadir al array y al DOM
        this.notifications.push(notification);
        area.appendChild(notification.element);

        // Animación de entrada
        setTimeout(() => {
            notification.element.style.transform = 'translateX(0)';
        }, 50);

        // Auto-remover si tiene duración
        if (notification.duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        // Efecto sonoro opcional
        this.playNotificationSound(notification.type);
    },

    /**
     * Elimina una notificación
     */
    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        // Animación de salida
        notification.element.style.transform = 'translateX(450px)';
        notification.element.style.opacity = '0';

        setTimeout(() => {
            // Remover del DOM
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }

            // Remover del array
            this.notifications = this.notifications.filter(n => n.id !== id);
        }, 300);
    },

    /**
     * Limpia todas las notificaciones
     */
    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
    },

    /**
     * Reproduce sonido de notificación
     */
    playNotificationSound(type) {
        // Solo reproducir si el usuario ha interactuado con la página
        if (!this.userHasInteracted()) return;

        try {
            const frequencies = {
                success: 800,
                warning: 600,
                error: 400,
                info: 700
            };

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequencies[type] || frequencies.info;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Fallar silenciosamente si no hay soporte de audio
        }
    },

    /**
     * Verifica si el usuario ha interactuado con la página
     */
    userHasInteracted() {
        return document.hasStoredUserActivation || window.hasUserActivation;
    },

    /**
     * Muestra notificación de éxito
     */
    success(message, duration, actions) {
        return this.show(message, 'success', duration, actions);
    },

    /**
     * Muestra notificación de advertencia
     */
    warning(message, duration, actions) {
        return this.show(message, 'warning', duration, actions);
    },

    /**
     * Muestra notificación de error
     */
    error(message, duration, actions) {
        return this.show(message, 'error', duration || 6000, actions);
    },

    /**
     * Muestra notificación informativa
     */
    info(message, duration, actions) {
        return this.show(message, 'info', duration, actions);
    },

    /**
     * Muestra notificación persistente (sin auto-cerrar)
     */
    persistent(message, type = 'info', actions = null) {
        return this.show(message, type, 0, actions);
    },

    /**
     * Muestra notificación con confirmación
     */
    confirm(message, onConfirm, onCancel = null) {
        const actions = [
            {
                text: 'Cancelar',
                callback: onCancel
            },
            {
                text: 'Confirmar',
                primary: true,
                callback: onConfirm
            }
        ];

        return this.show(message, 'warning', 0, actions);
    },

    /**
     * Muestra notificación con entrada de texto
     */
    prompt(message, defaultValue = '', onSubmit = null) {
        const id = 'prompt_' + Date.now();
        
        const customContent = `
            ${message}
            <div style="margin-top: 10px;">
                <input type="text" id="${id}_input" value="${defaultValue}" 
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        `;

        const actions = [
            {
                text: 'Cancelar',
                callback: () => {}
            },
            {
                text: 'Aceptar',
                primary: true,
                callback: (notification) => {
                    const input = document.getElementById(`${id}_input`);
                    if (input && onSubmit) {
                        onSubmit(input.value);
                    }
                }
            }
        ];

        const notification = this.show(customContent, 'info', 0, actions);
        
        // Enfocar el input después de que aparezca
        setTimeout(() => {
            const input = document.getElementById(`${id}_input`);
            if (input) {
                input.focus();
                input.select();
                
                // Enviar con Enter
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        if (onSubmit) onSubmit(input.value);
                        this.remove(notification.id);
                    }
                });
            }
        }, 100);

        return notification;
    },

    /**
     * Muestra notificación de progreso
     */
    progress(message, progress = 0) {
        const id = 'progress_' + Date.now();
        
        const customContent = `
            ${message}
            <div style="margin-top: 10px;">
                <div style="background: #eee; border-radius: 10px; height: 8px;">
                    <div id="${id}_bar" style="background: #3498db; height: 100%; border-radius: 10px; width: ${progress}%; transition: width 0.3s ease;"></div>
                </div>
                <div id="${id}_text" style="text-align: center; margin-top: 5px; font-size: 12px; color: #666;">${Math.round(progress)}%</div>
            </div>
        `;

        const notification = this.show(customContent, 'info', 0);
        
        // Función para actualizar progreso
        notification.updateProgress = (newProgress) => {
            const bar = document.getElementById(`${id}_bar`);
            const text = document.getElementById(`${id}_text`);
            
            if (bar) bar.style.width = `${newProgress}%`;
            if (text) text.textContent = `${Math.round(newProgress)}%`;
            
            // Auto-cerrar al 100%
            if (newProgress >= 100) {
                setTimeout(() => this.remove(notification.id), 1000);
            }
        };

        return notification;
    },

    /**
     * Obtiene estadísticas de notificaciones
     */
    getStats() {
        const typeStats = {};
        this.notifications.forEach(n => {
            typeStats[n.type] = (typeStats[n.type] || 0) + 1;
        });

        return {
            total: this.notifications.length,
            typeStats,
            oldest: this.notifications[0]?.timestamp,
            newest: this.notifications[this.notifications.length - 1]?.timestamp
        };
    }
};

// Exportar para uso global
window.Notifications = Notifications;