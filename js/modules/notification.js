// Notification Module - modules/notification.js
export default class Notification {
    constructor() {
        this.queue = [];
        this.isShowing = false;
        this.currentNotification = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
    }

    setupElements() {
        this.container = document.getElementById('notification');
        this.icon = this.container?.querySelector('.notification-icon');
        this.title = this.container?.querySelector('.notification-title');
        this.message = this.container?.querySelector('.notification-message');
        this.closeBtn = this.container?.querySelector('.notification-close');
    }

    bindEvents() {
        this.closeBtn?.addEventListener('click', () => {
            this.hide();
        });

        // Auto-hide on click
        this.container?.addEventListener('click', () => {
            this.hide();
        });
    }

    show(message, type = 'info', duration = 5000, title = null) {
        const notification = {
            message,
            type,
            duration,
            title,
            timestamp: Date.now()
        };

        // Add to queue
        this.queue.push(notification);

        // Process queue if not already showing
        if (!this.isShowing) {
            this.processQueue();
        }
    }

    processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        this.currentNotification = this.queue.shift();
        this.render();
    }

    render() {
        const { message, type, duration, title } = this.currentNotification;

        // Set type class
        this.container.className = `notification ${type} show`;

        // Set icon
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        this.icon.className = `notification-icon ${icons[type] || icons.info}`;

        // Set content
        if (title) {
            this.title.textContent = title;
            this.title.style.display = 'block';
        } else {
            this.title.style.display = 'none';
        }
        this.message.textContent = message;

        // Auto hide after duration
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, duration);

        // Add show animation
        requestAnimationFrame(() => {
            this.container.classList.add('animate-in');
        });
    }

    hide() {
        if (!this.currentNotification) return;

        // Clear timeout
        clearTimeout(this.hideTimeout);

        // Add hide animation
        this.container.classList.add('animate-out');

        // Remove after animation
        setTimeout(() => {
            this.container.classList.remove('show', 'animate-in', 'animate-out');
            this.currentNotification = null;

            // Process next in queue
            this.processQueue();
        }, 300);
    }

    // Create toast notification (alternative style)
    toast(message, type = 'info', position = 'bottom-right') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} toast-${position}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
      <i class="${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Clear all notifications
    clear() {
        this.queue = [];
        this.hide();
    }
}