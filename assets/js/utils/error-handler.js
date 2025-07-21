/**
 * Sistema de Manejo de Errores Avanzado
 * Captura, procesa y reporta errores de manera centralizada
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.errorCount = 0;
        this.initialized = false;
        this.reportingEnabled = true;
        
        // Configuración de tipos de error
        this.errorTypes = {
            INITIALIZATION: 'initialization',
            RUNTIME: 'runtime',
            NETWORK: 'network',
            VALIDATION: 'validation',
            USER_ACTION: 'user_action',
            PERFORMANCE: 'performance'
        };
        
        // Configuración de severidad
        this.severity = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
    }

    initialize() {
        if (this.initialized) return;

        // Configurar manejadores globales
        this.setupGlobalHandlers();
        
        // Configurar interceptores de console
        this.setupConsoleInterceptors();
        
        // Configurar reportes automáticos
        this.setupAutomaticReporting();
        
        this.initialized = true;
        console.log('✅ ErrorHandler inicializado');
    }

    setupGlobalHandlers() {
        // Capturar errores JavaScript no manejados
        window.addEventListener('error', (event) => {
            this.captureError({
                type: this.errorTypes.RUNTIME,
                severity: this.severity.HIGH,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Capturar promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: this.errorTypes.RUNTIME,
                severity: this.severity.HIGH,
                message: 'Unhandled Promise Rejection',
                reason: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Capturar errores de recursos
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.captureError({
                    type: this.errorTypes.NETWORK,
                    severity: this.severity.MEDIUM,
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    setupConsoleInterceptors() {
        // Interceptar console.error para capturar errores loggeados
        const originalError = console.error;
        console.error = (...args) => {
            this.captureError({
                type: this.errorTypes.RUNTIME,
                severity: this.severity.MEDIUM,
                message: args.join(' '),
                args: args,
                timestamp: Date.now(),
                source: 'console.error'
            });
            originalError.apply(console, args);
        };

        // Interceptar console.warn para capturar advertencias
        const originalWarn = console.warn;
        console.warn = (...args) => {
            this.captureError({
                type: this.errorTypes.RUNTIME,
                severity: this.severity.LOW,
                message: args.join(' '),
                args: args,
                timestamp: Date.now(),
                source: 'console.warn'
            });
            originalWarn.apply(console, args);
        };
    }

    setupAutomaticReporting() {
        // Reportar errores críticos inmediatamente
        setInterval(() => {
            const criticalErrors = this.errors.filter(e => 
                e.severity === this.severity.CRITICAL && !e.reported
            );
            
            if (criticalErrors.length > 0) {
                this.reportErrors(criticalErrors);
            }
        }, 5000);

        // Reportar lote de errores cada minuto
        setInterval(() => {
            const unreportedErrors = this.errors.filter(e => !e.reported);
            
            if (unreportedErrors.length > 0) {
                this.reportErrors(unreportedErrors.slice(0, 10)); // Máximo 10 por lote
            }
        }, 60000);
    }

    // Método principal para capturar errores
    captureError(errorData) {
        this.errorCount++;
        
        // Enriquecer datos del error
        const enrichedError = this.enrichErrorData(errorData);
        
        // Agregar ID único
        enrichedError.id = `err_${Date.now()}_${this.errorCount}`;
        
        // Determinar severidad si no se especifica
        if (!enrichedError.severity) {
            enrichedError.severity = this.determineSeverity(enrichedError);
        }
        
        // Agregar contexto de la aplicación
        enrichedError.context = this.getApplicationContext();
        
        // Almacenar error
        this.errors.push(enrichedError);
        
        // Mantener límite de errores
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Notificar si es crítico
        if (enrichedError.severity === this.severity.CRITICAL) {
            this.notifyCriticalError(enrichedError);
        }
        
        // Log del error
        this.logError(enrichedError);
        
        return enrichedError.id;
    }

    enrichErrorData(errorData) {
        return {
            ...errorData,
            browserInfo: this.getBrowserInfo(),
            performanceInfo: this.getPerformanceInfo(),
            sessionInfo: this.getSessionInfo()
        };
    }

    determineSeverity(error) {
        // Errores críticos
        if (error.message && (
            error.message.includes('Network error') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('Cannot read properties of null')
        )) {
            return this.severity.CRITICAL;
        }

        // Errores altos
        if (error.type === this.errorTypes.RUNTIME || error.stack) {
            return this.severity.HIGH;
        }

        // Errores medios
        if (error.type === this.errorTypes.VALIDATION) {
            return this.severity.MEDIUM;
        }

        // Por defecto
        return this.severity.LOW;
    }

    getApplicationContext() {
        const context = {
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer,
            timestamp_iso: new Date().toISOString()
        };

        // Agregar contexto de la aplicación si está disponible
        try {
            if (window.StateManager && window.StateManager.getState) {
                const state = window.StateManager.getState();
                context.appState = {
                    initialized: state.initialized,
                    deviceCount: state.devices ? state.devices.size : 0,
                    connectionCount: state.connections ? state.connections.size : 0,
                    currentLayer: state.currentLayer
                };
            }

            if (window.NetworkDiagramApp) {
                context.app = {
                    initialized: window.NetworkDiagramApp.initialized,
                    version: window.NetworkDiagramApp.version
                };
            }
        } catch (e) {
            context.contextError = e.message;
        }

        return context;
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            vendor: navigator.vendor
        };
    }

    getPerformanceInfo() {
        try {
            return {
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null,
                timing: performance.timing ? {
                    loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                    domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
                } : null
            };
        } catch (e) {
            return { error: e.message };
        }
    }

    getSessionInfo() {
        return {
            sessionStart: this.sessionStart || Date.now(),
            errorsInSession: this.errorCount,
            pageVisibility: document.visibilityState,
            screenResolution: `${screen.width}x${screen.height}`,
            windowSize: `${window.innerWidth}x${window.innerHeight}`
        };
    }

    logError(error) {
        const logMessage = `[${error.severity.toUpperCase()}] ${error.type}: ${error.message}`;
        
        switch (error.severity) {
            case this.severity.CRITICAL:
                console.error('🚨', logMessage, error);
                break;
            case this.severity.HIGH:
                console.error('❌', logMessage, error);
                break;
            case this.severity.MEDIUM:
                console.warn('⚠️', logMessage, error);
                break;
            case this.severity.LOW:
                console.info('ℹ️', logMessage, error);
                break;
        }
    }

    notifyCriticalError(error) {
        // Mostrar notificación crítica al usuario
        try {
            if (window.NotificationManager && window.NotificationManager.show) {
                window.NotificationManager.show(
                    'Error crítico detectado. La aplicación puede no funcionar correctamente.', 
                    'error',
                    0, // Sin auto-cerrar
                    [{
                        text: 'Ver detalles',
                        callback: () => this.showErrorDetails(error)
                    }]
                );
            } else {
                // Fallback a alert
                console.error('Error crítico:', error.message);
            }
        } catch (e) {
            console.error('Error al mostrar notificación crítica:', e);
        }
    }

    showErrorDetails(error) {
        const details = `
Error ID: ${error.id}
Tipo: ${error.type}
Severidad: ${error.severity}
Mensaje: ${error.message}
Tiempo: ${new Date(error.timestamp).toLocaleString()}

${error.stack ? 'Stack:\n' + error.stack : ''}
        `;

        if (window.ModalManager && window.ModalManager.info) {
            window.ModalManager.info('Detalles del Error', `<pre>${details}</pre>`);
        } else {
            alert(details);
        }
    }

    reportErrors(errors) {
        if (!this.reportingEnabled) return;

        errors.forEach(error => {
            error.reported = true;
            
            // Aquí podrías enviar a un servicio de logging externo
            // Por ahora solo log local
            console.log('📊 Error reportado:', error);
        });
    }

    // Métodos públicos de la API
    captureException(error, context = {}) {
        return this.captureError({
            type: this.errorTypes.RUNTIME,
            severity: this.severity.HIGH,
            message: error.message,
            stack: error.stack,
            name: error.name,
            ...context
        });
    }

    captureMessage(message, level = 'info', context = {}) {
        const severityMap = {
            'debug': this.severity.LOW,
            'info': this.severity.LOW,
            'warning': this.severity.MEDIUM,
            'error': this.severity.HIGH,
            'critical': this.severity.CRITICAL
        };

        return this.captureError({
            type: this.errorTypes.USER_ACTION,
            severity: severityMap[level] || this.severity.LOW,
            message: message,
            level: level,
            ...context
        });
    }

    getErrors(filter = {}) {
        let filteredErrors = [...this.errors];

        if (filter.type) {
            filteredErrors = filteredErrors.filter(e => e.type === filter.type);
        }

        if (filter.severity) {
            filteredErrors = filteredErrors.filter(e => e.severity === filter.severity);
        }

        if (filter.limit) {
            filteredErrors = filteredErrors.slice(-filter.limit);
        }

        return filteredErrors;
    }

    clearErrors() {
        this.errors = [];
        this.errorCount = 0;
    }

    exportErrors() {
        return {
            errors: this.errors,
            summary: {
                total: this.errors.length,
                bySeverity: this.errors.reduce((acc, error) => {
                    acc[error.severity] = (acc[error.severity] || 0) + 1;
                    return acc;
                }, {}),
                byType: this.errors.reduce((acc, error) => {
                    acc[error.type] = (acc[error.type] || 0) + 1;
                    return acc;
                }, {})
            },
            exportedAt: new Date().toISOString()
        };
    }

    setReporting(enabled) {
        this.reportingEnabled = enabled;
        console.log(`Error reporting ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Método estático para crear instancia singleton
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
}

// Crear instancia global
window.ErrorHandler = ErrorHandler.getInstance();

// Auto-inicializar si el DOM está listo
if (document.readyState !== 'loading') {
    window.ErrorHandler.initialize();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        window.ErrorHandler.initialize();
    });
}
}
        
        // Notificar inmediatamente si es crítico
        if (enrichedError.severity === this.severity.CRITICAL) {
            this.notifyImmediate(enrichedError);
        }
        
        console.log('Error capturado:', enrichedError);
    }

    enrichErrorData(errorData) {
        return {
            ...errorData,
            browserInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled
            },
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };
    }

    determineSeverity(error) {
        if (error.message && error.message.includes('network')) {
            return this.severity.HIGH;
        }
        return this.severity.MEDIUM;
    }

    getApplicationContext() {
        return {
            currentTool: window.StateManager?.getState()?.currentTool || 'unknown',
            deviceCount: window.StateManager?.getState()?.devices?.size || 0,
            url: window.location.href
        };
    }

    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }

    notifyImmediate(error) {
        if (window.NotificationManager) {
            window.NotificationManager.error('Error crítico detectado');
        }
    }

    reportErrors(errors) {
        errors.forEach(error => {
            error.reported = true;
        });
    }
}

window.ErrorHandler = new ErrorHandler();