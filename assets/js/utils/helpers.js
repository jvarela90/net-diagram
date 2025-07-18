/**
 * Helpers - Funciones auxiliares y utilidades
 */

const Helpers = {
    app: null,

    /**
     * Inicializa las funciones auxiliares
     */
    init(app) {
        this.app = app;
        console.log('✓ Helpers inicializado');
    },

    /**
     * Genera un ID único
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Formatea una fecha
     */
    formatDate(date, format = 'dd/mm/yyyy') {
        if (!date) date = new Date();
        if (typeof date === 'string') date = new Date(date);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'yyyy-mm-dd':
                return `${year}-${month}-${day}`;
            case 'dd/mm/yyyy hh:mm':
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            default:
                return date.toLocaleDateString();
        }
    },

    /**
     * Debounce para funciones
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle para funciones
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Clona un objeto profundamente
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Valida una dirección IP
     */
    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    },

    /**
     * Valida una dirección MAC
     */
    isValidMAC(mac) {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return macRegex.test(mac);
    },

    /**
     * Convierte bytes a formato legible
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Calcula la distancia entre dos puntos
     */
    calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    /**
     * Obtiene el color en formato hexadecimal
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    /**
     * Convierte hex a RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Capitaliza la primera letra
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Trunca un texto
     */
    truncate(str, length = 100, ending = '...') {
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        }
        return str;
    },

    /**
     * Escapa caracteres HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Genera un color aleatorio
     */
    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    },

    /**
     * Verifica si un elemento está visible en el viewport
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Obtiene parámetros de la URL
     */
    getUrlParams() {
        const params = {};
        const urlSearchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlSearchParams) {
            params[key] = value;
        }
        return params;
    },

    /**
     * Guarda datos en localStorage de forma segura
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
            return false;
        }
    },

    /**
     * Carga datos desde localStorage de forma segura
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('No se pudo cargar desde localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Detecta el tipo de dispositivo
     */
    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    },

    /**
     * Detecta capacidades del navegador
     */
    getBrowserCapabilities() {
        return {
            canvas: !!document.createElement('canvas').getContext,
            localStorage: typeof Storage !== 'undefined',
            webGL: (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
                } catch (e) {
                    return false;
                }
            })(),
            touch: 'ontouchstart' in window,
            orientation: 'orientation' in window
        };
    },

    /**
     * Convierte grados a radianes
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convierte radianes a grados
     */
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Obtiene un número aleatorio entre min y max
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Mezcla un array aleatoriamente
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    /**
     * Agrupa elementos de un array por una propiedad
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = (groups[item[key]] || []);
            group.push(item);
            groups[item[key]] = group;
            return groups;
        }, {});
    },

    /**
     * Encuentra elementos únicos en un array
     */
    unique(array) {
        return [...new Set(array)];
    },

    /**
     * Aplana un array anidado
     */
    flatten(array) {
        return array.reduce((flat, toFlatten) => {
            return flat.concat(Array.isArray(toFlatten) ? this.flatten(toFlatten) : toFlatten);
        }, []);
    },

    /**
     * Verifica si dos objetos son iguales (comparación superficial)
     */
    isEqual(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) {
            return false;
        }
        
        for (let key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }
        
        return true;
    },

    /**
     * Crea una promesa con delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Formatea números con separadores de miles
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Obtiene la extensión de un archivo
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    },

    /**
     * Verifica si una cadena es un JSON válido
     */
    isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// Exportar para uso global
window.Helpers = Helpers;