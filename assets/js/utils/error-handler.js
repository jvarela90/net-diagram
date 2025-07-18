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