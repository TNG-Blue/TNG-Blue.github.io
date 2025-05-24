// Utility Functions - utils.js
const Utils = {
    // Format number with thousand separators
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Format currency (VND)
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },

    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // Format date
    formatDate: (date, format = 'full') => {
        const options = {
            full: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit', second: '2-digit' }
        };

        return new Intl.DateTimeFormat('vi-VN', options[format]).format(new Date(date));
    },

    // Debounce function
    debounce: (func, wait = 300) => {
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

    // Throttle function
    throttle: (func, limit = 100) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Validate email
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone
    validatePhone: (phone) => {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    // Generate unique ID
    generateId: (prefix = 'id') => {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Get file extension
    getFileExtension: (filename) => {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    },

    // Check if file type is supported
    isFileTypeSupported: (filename, supportedTypes) => {
        const extension = '.' + Utils.getFileExtension(filename);
        return supportedTypes.includes(extension);
    },

    // Calculate file hash (simple)
    calculateFileHash: async (file) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    // Parse query string
    parseQueryString: (queryString) => {
        const params = new URLSearchParams(queryString);
        const result = {};

        for (const [key, value] of params) {
            result[key] = value;
        }

        return result;
    },

    // Build query string
    buildQueryString: (params) => {
        const searchParams = new URLSearchParams();

        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                searchParams.append(key, params[key]);
            }
        });

        return searchParams.toString();
    },

    // Deep clone object
    deepClone: (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));

        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = Utils.deepClone(obj[key]);
            }
        }

        return clonedObj;
    },

    // Merge objects deeply
    deepMerge: (target, ...sources) => {
        if (!sources.length) return target;
        const source = sources.shift();

        if (Utils.isObject(target) && Utils.isObject(source)) {
            for (const key in source) {
                if (Utils.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Utils.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return Utils.deepMerge(target, ...sources);
    },

    // Check if object
    isObject: (item) => {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Get scroll position
    getScrollPosition: () => {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    },

    // Lock body scroll
    lockBodyScroll: () => {
        const scrollY = Utils.getScrollPosition().y;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.dataset.scrollY = scrollY;
    },

    // Unlock body scroll
    unlockBodyScroll: () => {
        const scrollY = document.body.dataset.scrollY || 0;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY));
        delete document.body.dataset.scrollY;
    },

    // Load script dynamically
    loadScript: (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    // Load CSS dynamically
    loadCSS: (href) => {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    },

    // Get browser info
    getBrowserInfo: () => {
        const ua = navigator.userAgent;
        let browser = 'Unknown';

        if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') > -1) browser = 'Safari';
        else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
        else if (ua.indexOf('Edge') > -1) browser = 'Edge';

        return {
            browser,
            userAgent: ua,
            language: navigator.language,
            platform: navigator.platform,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
        };
    },

    // Animate value
    animateValue: (start, end, duration, callback) => {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const value = start + (end - start) * Utils.easeOutCubic(progress);
            callback(value);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    // Easing functions
    easeOutCubic: (t) => {
        return 1 - Math.pow(1 - t, 3);
    },

    easeInOutCubic: (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    // Check if element is in viewport
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },

    // Generate random color
    randomColor: () => {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    },

    // Get contrast color (black or white)
    getContrastColor: (hexColor) => {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#FFFFFF';
    }
};

export default Utils;