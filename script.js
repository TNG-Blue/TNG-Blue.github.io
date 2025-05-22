// DOM Elements
const elements = {
  // Navigation
  hamburger: document.querySelector('.hamburger'),
  navMenu: document.querySelector('.nav-menu'),
  navLinks: document.querySelectorAll('.nav-link'),

  // Upload functionality
  uploadArea: document.getElementById('uploadArea'),
  fileInput: document.getElementById('fileInput'),
  selectFileBtn: document.getElementById('selectFileBtn'),
  filePreview: document.getElementById('filePreview'),
  fileName: document.getElementById('fileName'),
  fileSize: document.getElementById('fileSize'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  removeFileBtn: document.getElementById('removeFileBtn'),
  uploadBtn: document.getElementById('uploadBtn'),

  // Options
  materialSelect: document.getElementById('materialSelect'),
  colorOptions: document.querySelectorAll('input[name="color"]'),
  qualityOptions: document.querySelectorAll('input[name="quality"]'),
  priceEstimate: document.getElementById('priceEstimate'),
  printTime: document.getElementById('printTime'),
  materialUsage: document.getElementById('materialUsage'),
  totalCost: document.getElementById('totalCost'),

  // Contact form
  contactForm: document.getElementById('contactForm'),

  // Notification
  notification: document.getElementById('notification')
};

// Application State
const state = {
  currentFile: null,
  uploadProgress: 0,
  isUploading: false,
  selectedOptions: {
    material: 'pla',
    color: 'white',
    quality: 'standard'
  }
};

// Pricing Configuration
const pricing = {
  materials: {
    pla: { name: 'PLA', pricePerGram: 800, multiplier: 1 },
    abs: { name: 'ABS', pricePerGram: 900, multiplier: 1.1 },
    petg: { name: 'PETG', pricePerGram: 1200, multiplier: 1.2 },
    tpu: { name: 'TPU', pricePerGram: 1500, multiplier: 1.3 },
    resin: { name: 'Resin', pricePerGram: 2000, multiplier: 1.5 }
  },
  quality: {
    draft: { multiplier: 0.8, time: 0.7 },
    standard: { multiplier: 1, time: 1 },
    high: { multiplier: 1.4, time: 1.6 }
  }
};

// Utility Functions
const utils = {
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatCurrency: (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  estimateFileStats: (fileSize) => {
    // Simple estimation based on file size
    const baseMaterial = Math.max(20, Math.min(200, fileSize / 10000)); // 20g to 200g
    const baseTime = Math.max(2, Math.min(24, fileSize / 50000)); // 2h to 24h

    return {
      materialGrams: Math.round(baseMaterial),
      printHours: Math.round(baseTime * 10) / 10
    };
  },

  debounce: (func, wait) => {
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

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone: (phone) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
};

// Notification System
const notification = {
  show: (message, type = 'info', duration = 3000) => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-triangle'
    };

    elements.notification.className = `notification ${type}`;
    elements.notification.querySelector('.notification-icon').className = `notification-icon ${icons[type]}`;
    elements.notification.querySelector('.notification-message').textContent = message;

    elements.notification.classList.add('show');

    setTimeout(() => {
      elements.notification.classList.remove('show');
    }, duration);
  }
};

// Navigation Functionality
const navigation = {
  init: () => {
    // Mobile hamburger menu
    elements.hamburger?.addEventListener('click', () => {
      elements.navMenu.classList.toggle('active');
      elements.hamburger.classList.toggle('active');
    });

    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update active link
          elements.navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          // Close mobile menu
          elements.navMenu.classList.remove('active');
          elements.hamburger.classList.remove('active');
        }
      });
    });

    // Update active link on scroll
    window.addEventListener('scroll', utils.debounce(() => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, 100));
  }
};

// File Upload Functionality
const fileUpload = {
  init: () => {
    // File selection
    elements.selectFileBtn?.addEventListener('click', () => {
      elements.fileInput.click();
    });

    elements.fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        fileUpload.handleFile(file);
      }
    });

    // Drag and drop
    elements.uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      elements.uploadArea.classList.add('dragover');
    });

    elements.uploadArea?.addEventListener('dragleave', (e) => {
      e.preventDefault();
      elements.uploadArea.classList.remove('dragover');
    });

    elements.uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      elements.uploadArea.classList.remove('dragover');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileUpload.handleFile(files[0]);
      }
    });

    // Remove file
    elements.removeFileBtn?.addEventListener('click', () => {
      fileUpload.removeFile();
    });

    // Upload button
    elements.uploadBtn?.addEventListener('click', () => {
      if (state.currentFile && !state.isUploading) {
        fileUpload.uploadFile();
      }
    });
  },

  handleFile: (file) => {
    // Validate file type
    const allowedTypes = ['.stl', '.obj', '.ply', '.3mf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      notification.show('Định dạng file không được hỗ trợ!', 'error');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      notification.show('Kích thước file quá lớn! Tối đa 50MB.', 'error');
      return;
    }

    state.currentFile = file;
    fileUpload.showFilePreview(file);
    fileUpload.updatePriceEstimate();

    notification.show('File đã được chọn thành công!', 'success');
  },

  showFilePreview: (file) => {
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = utils.formatFileSize(file.size);
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = '0%';

    elements.filePreview.style.display = 'block';
    elements.uploadBtn.disabled = false;
  },

  removeFile: () => {
    state.currentFile = null;
    elements.filePreview.style.display = 'none';
    elements.priceEstimate.style.display = 'none';
    elements.uploadBtn.disabled = true;
    elements.fileInput.value = '';

    notification.show('File đã được xóa', 'info');
  },

  uploadFile: () => {
    if (!state.currentFile) return;

    state.isUploading = true;
    elements.uploadBtn.disabled = true;
    elements.uploadBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Đang tải lên...';

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;

      elements.progressFill.style.width = progress + '%';
      elements.progressText.textContent = Math.round(progress) + '%';

      if (progress >= 100) {
        clearInterval(interval);
        fileUpload.completeUpload();
      }
    }, 200);
  },

  completeUpload: () => {
    state.isUploading = false;
    elements.uploadBtn.innerHTML = '<i class="fas fa-check"></i> Tải lên thành công!';
    elements.uploadBtn.style.background = '#10b981';

    notification.show('File đã được tải lên thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success', 5000);

    // Reset after 3 seconds
    setTimeout(() => {
      fileUpload.removeFile();
      elements.uploadBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi Yêu Cầu In';
      elements.uploadBtn.style.background = '';
    }, 3000);
  },

  updatePriceEstimate: () => {
    if (!state.currentFile) return;

    const stats = utils.estimateFileStats(state.currentFile.size);
    const material = pricing.materials[state.selectedOptions.material];
    const quality = pricing.quality[state.selectedOptions.quality];

    // Calculate estimates
    const materialCost = stats.materialGrams * material.pricePerGram;
    const qualityMultiplier = quality.multiplier;
    const totalCost = Math.round(materialCost * qualityMultiplier * material.multiplier);
    const printTime = Math.round(stats.printHours * quality.time * 10) / 10;

    // Update display
    elements.printTime.textContent = `~${printTime} giờ`;
    elements.materialUsage.textContent = `~${stats.materialGrams}g`;
    elements.totalCost.textContent = utils.formatCurrency(totalCost);

    elements.priceEstimate.style.display = 'block';
  }
};

// Options Handling
const options = {
  init: () => {
    // Material selection
    elements.materialSelect?.addEventListener('change', (e) => {
      state.selectedOptions.material = e.target.value;
      fileUpload.updatePriceEstimate();
    });

    // Color selection
    elements.colorOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.selectedOptions.color = e.target.value;
        }
      });
    });

    // Quality selection
    elements.qualityOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.selectedOptions.quality = e.target.value;
          fileUpload.updatePriceEstimate();
        }
      });
    });
  }
};

// Contact Form
const contactForm = {
  init: () => {
    elements.contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(elements.contactForm);
      const name = formData.get('name') || document.getElementById('name').value;
      const email = formData.get('email') || document.getElementById('email').value;
      const phone = formData.get('phone') || document.getElementById('phone').value;
      const message = formData.get('message') || document.getElementById('message').value;

      // Validate form data
      if (!contactForm.validateForm(name, email, phone, message)) {
        return;
      }

      // Submit form
      contactForm.submitForm({ name, email, phone, message });
    });
  },

  validateForm: (name, email, phone, message) => {
    // Check required fields
    if (!name.trim()) {
      notification.show('Vui lòng nhập họ và tên!', 'error');
      document.getElementById('name').focus();
      return false;
    }

    if (!email.trim()) {
      notification.show('Vui lòng nhập email!', 'error');
      document.getElementById('email').focus();
      return false;
    }

    if (!utils.validateEmail(email)) {
      notification.show('Email không hợp lệ!', 'error');
      document.getElementById('email').focus();
      return false;
    }

    if (phone.trim() && !utils.validatePhone(phone)) {
      notification.show('Số điện thoại không hợp lệ!', 'error');
      document.getElementById('phone').focus();
      return false;
    }

    if (!message.trim()) {
      notification.show('Vui lòng nhập nội dung tin nhắn!', 'error');
      document.getElementById('message').focus();
      return false;
    }

    if (message.trim().length < 10) {
      notification.show('Tin nhắn quá ngắn! Vui lòng nhập ít nhất 10 ký tự.', 'error');
      document.getElementById('message').focus();
      return false;
    }

    return true;
  },

  submitForm: (data) => {
    const submitBtn = elements.contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Đang gửi...';

    // Simulate form submission
    setTimeout(() => {
      // Reset form
      elements.contactForm.reset();

      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      // Show success message
      notification.show('Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success', 5000);

      // Log form data (in real app, this would be sent to server)
      console.log('Form submitted:', data);
    }, 2000);
  }
};

// Analytics and Tracking
const analytics = {
  init: () => {
    // Track page views
    analytics.trackPageView();

    // Track user interactions
    analytics.trackInteractions();
  },

  trackPageView: () => {
    // In a real application, you would integrate with Google Analytics or similar
    console.log('Page view tracked:', window.location.pathname);
  },

  trackInteractions: () => {
    // Track file uploads
    elements.uploadBtn?.addEventListener('click', () => {
      analytics.trackEvent('file_upload', 'attempt', state.selectedOptions.material);
    });

    // Track form submissions
    elements.contactForm?.addEventListener('submit', () => {
      analytics.trackEvent('contact_form', 'submit');
    });

    // Track navigation clicks
    elements.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const section = link.getAttribute('href').replace('#', '');
        analytics.trackEvent('navigation', 'click', section);
      });
    });
  },

  trackEvent: (category, action, label = null) => {
    // In a real application, you would send this to your analytics service
    console.log('Event tracked:', { category, action, label });
  }
};

// Performance Optimization
const performance = {
  init: () => {
    // Lazy load images
    performance.lazyLoadImages();

    // Optimize animations
    performance.optimizeAnimations();

    // Preload critical resources
    performance.preloadResources();
  },

  lazyLoadImages: () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  optimizeAnimations: () => {
    // Reduce animations for users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    }
  },

  preloadResources: () => {
    // Preload critical CSS and fonts
    const criticalResources = [
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

// Error Handling
const errorHandler = {
  init: () => {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      notification.show('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.', 'error');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      notification.show('Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.', 'error');
    });
  }
};

// Application Initialization
const app = {
  init: () => {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', app.start);
    } else {
      app.start();
    }
  },

  start: () => {
    try {
      // Initialize all modules
      navigation.init();
      fileUpload.init();
      options.init();
      contactForm.init();
      analytics.init();
      performance.init();
      errorHandler.init();

      // Add any additional startup logic
      app.addEventListeners();
      app.checkBrowserSupport();

      console.log('PrintHub3D application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      notification.show('Không thể khởi tạo ứng dụng. Vui lòng tải lại trang.', 'error');
    }
  },

  addEventListeners: () => {
    // Handle window resize
    window.addEventListener('resize', utils.debounce(() => {
      // Update layout if necessary
      app.handleResize();
    }, 250));

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause any ongoing processes
        app.pauseProcesses();
      } else {
        // Resume processes
        app.resumeProcesses();
      }
    });
  },

  handleResize: () => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768) {
      elements.navMenu?.classList.remove('active');
      elements.hamburger?.classList.remove('active');
    }
  },

  pauseProcesses: () => {
    // Pause any animations or ongoing processes when tab is not visible
    // This helps with performance
  },

  resumeProcesses: () => {
    // Resume processes when tab becomes visible again
  },

  checkBrowserSupport: () => {
    // Check for required browser features
    const requiredFeatures = [
      'IntersectionObserver',
      'fetch',
      'Promise',
      'FormData'
    ];

    const unsupportedFeatures = requiredFeatures.filter(feature => {
      return !(feature in window) && !(feature in window.constructor.prototype);
    });

    if (unsupportedFeatures.length > 0) {
      notification.show(
          'Trình duyệt của bạn không hỗ trợ đầy đủ các tính năng. Vui lòng cập nhật trình duyệt.',
          'warning',
          8000
      );
    }
  }
};

// Start the application
app.init();