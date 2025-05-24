// Upload Module - modules/upload.js
import Config from '../config.js';
import Utils from '../utils.js';

export default class Upload {
    constructor() {
        this.config = Config.upload;
        this.pricing = Config.pricing;
        this.supportedFormats = Config.app.supportedFormats;
        this.maxFileSize = Config.app.maxFileSize;

        this.files = new Map();
        this.currentOptions = {
            material: 'pla',
            color: 'white',
            quality: 'standard',
            scale: 1
        };

        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
    }

    setupElements() {
        this.elements = {
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            selectFileBtn: document.getElementById('selectFileBtn'),
            filesList: document.getElementById('filesList'),
            uploadConfig: document.getElementById('uploadConfig'),
            submitOrder: document.getElementById('submitOrder'),
            cancelUpload: document.getElementById('cancelUpload'),

            // Price elements
            printTime: document.getElementById('printTime'),
            materialUsage: document.getElementById('materialUsage'),
            materialCost: document.getElementById('materialCost'),
            serviceFee: document.getElementById('serviceFee'),
            totalCost: document.getElementById('totalCost'),

            // Options
            materialOptions: document.querySelectorAll('input[name="material"]'),
            colorOptions: document.querySelectorAll('input[name="color"]'),
            qualitySlider: document.getElementById('qualitySlider'),
            qualityLabels: document.querySelectorAll('.quality-label'),
            scaleButtons: document.querySelectorAll('.scale-btn'),
            refreshPrice: document.getElementById('refreshPrice')
        };
    }

    bindEvents() {
        // File selection
        this.elements.selectFileBtn?.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        this.elements.fileInput?.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop
        this.setupDragAndDrop();

        // Options
        this.setupOptionListeners();

        // Actions
        this.elements.submitOrder?.addEventListener('click', () => this.submitOrder());
        this.elements.cancelUpload?.addEventListener('click', () => this.cancelUpload());
        this.elements.refreshPrice?.addEventListener('click', () => this.updatePricing());
    }

    setupDragAndDrop() {
        const uploadArea = this.elements.uploadArea;
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            });
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        });
    }

    setupOptionListeners() {
        // Material selection
        this.elements.materialOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.currentOptions.material = e.target.value;
                this.updatePricing();
            });
        });

        // Color selection
        this.elements.colorOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.currentOptions.color = e.target.value;
            });
        });

        // Quality slider
        this.elements.qualitySlider?.addEventListener('input', (e) => {
            const quality = parseInt(e.target.value);
            this.updateQualityDisplay(quality);
            this.currentOptions.quality = ['draft', 'standard', 'high'][quality - 1];
            this.updatePricing();
        });

        // Scale buttons
        this.elements.scaleButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.elements.scaleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentOptions.scale = parseFloat(button.dataset.scale);
                this.updatePricing();
            });
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelect(fileList) {
        const files = Array.from(fileList);

        for (const file of files) {
            if (this.validateFile(file)) {
                this.addFile(file);
            }
        }

        if (this.files.size > 0) {
            this.showConfig();
            this.updatePricing();
        }
    }

    validateFile(file) {
        // Check file type
        if (!Utils.isFileTypeSupported(file.name, this.supportedFormats)) {
            this.showNotification(`File "${file.name}" không được hỗ trợ`, 'error');
            return false;
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            this.showNotification(`File "${file.name}" vượt quá kích thước cho phép (${Utils.formatFileSize(this.maxFileSize)})`, 'error');
            return false;
        }

        return true;
    }

    addFile(file) {
        const fileId = Utils.generateId('file');

        this.files.set(fileId, {
            id: fileId,
            file: file,
            status: 'pending',
            progress: 0,
            analysis: null
        });

        this.renderFileItem(fileId);
        this.analyzeFile(fileId);
    }

    renderFileItem(fileId) {
        const fileData = this.files.get(fileId);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.id = `file-${fileId}`;

        fileItem.innerHTML = `
      <div class="file-icon">
        <i class="fas fa-cube"></i>
      </div>
      <div class="file-details">
        <h4 class="file-name">${fileData.file.name}</h4>
        <p class="file-info">
          <span class="file-size">${Utils.formatFileSize(fileData.file.size)}</span>
          <span class="file-status" data-status="analyzing">
            <i class="fas fa-spinner fa-spin"></i> Đang phân tích...
          </span>
        </p>
        <div class="file-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>
      <button class="remove-file" data-file-id="${fileId}">
        <i class="fas fa-times"></i>
      </button>
    `;

        this.elements.filesList.appendChild(fileItem);

        // Bind remove event
        fileItem.querySelector('.remove-file').addEventListener('click', () => {
            this.removeFile(fileId);
        });
    }

    async analyzeFile(fileId) {
        const fileData = this.files.get(fileId);

        try {
            // Simulate file analysis
            await this.simulateFileAnalysis(fileId);

            // Update status
            fileData.status = 'ready';
            fileData.analysis = {
                volume: Math.random() * 1000 + 100, // cm³
                boundingBox: {
                    x: Math.random() * 200 + 50,
                    y: Math.random() * 200 + 50,
                    z: Math.random() * 200 + 50
                },
                triangles: Math.floor(Math.random() * 50000) + 10000,
                complexity: Math.random() > 0.7 ? 'complex' : Math.random() > 0.3 ? 'medium' : 'simple'
            };

            this.updateFileStatus(fileId, 'ready', 'Sẵn sàng in');
            this.updatePricing();

        } catch (error) {
            fileData.status = 'error';
            this.updateFileStatus(fileId, 'error', 'Lỗi phân tích file');
        }
    }

    simulateFileAnalysis(fileId) {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 100) progress = 100;

                this.updateFileProgress(fileId, progress);

                if (progress >= 100) {
                    clearInterval(interval);
                    resolve();
                }
            }, 300);
        });
    }

    updateFileStatus(fileId, status, message) {
        const fileItem = document.getElementById(`file-${fileId}`);
        if (!fileItem) return;

        const statusElement = fileItem.querySelector('.file-status');
        statusElement.dataset.status = status;

        const icons = {
            ready: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            uploading: '<i class="fas fa-cloud-upload-alt"></i>'
        };

        statusElement.innerHTML = `${icons[status] || ''} ${message}`;
    }

    updateFileProgress(fileId, progress) {
        const fileItem = document.getElementById(`file-${fileId}`);
        if (!fileItem) return;

        const progressFill = fileItem.querySelector('.progress-fill');
        progressFill.style.width = `${progress}%`;
    }

    removeFile(fileId) {
        this.files.delete(fileId);
        const fileItem = document.getElementById(`file-${fileId}`);
        fileItem?.remove();

        if (this.files.size === 0) {
            this.hideConfig();
        } else {
            this.updatePricing();
        }
    }

    showConfig() {
        this.elements.uploadConfig.style.display = 'block';
        this.elements.uploadArea.style.display = 'none';
    }

    hideConfig() {
        this.elements.uploadConfig.style.display = 'none';
        this.elements.uploadArea.style.display = 'block';
    }

    updateQualityDisplay(value) {
        this.elements.qualityLabels.forEach(label => {
            label.classList.toggle('active', parseInt(label.dataset.quality) === value);
        });
    }

    calculatePricing() {
        let totalVolume = 0;
        let totalTime = 0;
        let maxComplexity = 'simple';

        // Calculate total volume and complexity
        this.files.forEach(fileData => {
            if (fileData.analysis) {
                totalVolume += fileData.analysis.volume * this.currentOptions.scale ** 3;

                if (fileData.analysis.complexity === 'complex' || maxComplexity === 'complex') {
                    maxComplexity = 'complex';
                } else if (fileData.analysis.complexity === 'medium' && maxComplexity !== 'complex') {
                    maxComplexity = 'medium';
                }
            }
        });

        // Get pricing parameters
        const material = this.pricing.materials[this.currentOptions.material];
        const quality = this.pricing.quality[this.currentOptions.quality];

        // Calculate material usage (volume to weight)
        const materialWeight = totalVolume * material.density / 1000; // Convert to grams

        // Calculate print time (simplified)
        const baseTime = totalVolume / 50; // 50 cm³/hour base speed
        totalTime = baseTime * quality.timeMultiplier;

        // Calculate costs
        const materialCost = materialWeight * material.pricePerGram * material.multiplier;
        const complexityMultiplier = this.pricing.serviceFee.complexity[maxComplexity];
        const serviceFee = this.pricing.serviceFee.base * complexityMultiplier * quality.multiplier;
        const totalCost = materialCost + serviceFee;

        return {
            materialWeight,
            printTime: totalTime,
            materialCost,
            serviceFee,
            totalCost
        };
    }

    updatePricing() {
        if (this.files.size === 0) return;

        const pricing = this.calculatePricing();

        // Update display
        this.elements.printTime.textContent = `~${Math.ceil(pricing.printTime)} giờ`;
        this.elements.materialUsage.textContent = `~${Math.ceil(pricing.materialWeight)}g`;
        this.elements.materialCost.textContent = Utils.formatCurrency(pricing.materialCost);
        this.elements.serviceFee.textContent = Utils.formatCurrency(pricing.serviceFee);
        this.elements.totalCost.textContent = Utils.formatCurrency(pricing.totalCost);

        // Add animation
        this.elements.totalCost.parentElement.classList.add('highlight');
        setTimeout(() => {
            this.elements.totalCost.parentElement.classList.remove('highlight');
        }, 300);
    }

    async submitOrder() {
        if (this.files.size === 0) return;

        // Validate all files are ready
        const notReady = Array.from(this.files.values()).filter(f => f.status !== 'ready');
        if (notReady.length > 0) {
            this.showNotification('Vui lòng đợi tất cả file được phân tích xong', 'warning');
            return;
        }

        // Prepare order data
        const orderData = {
            files: Array.from(this.files.values()).map(f => ({
                name: f.file.name,
                size: f.file.size,
                analysis: f.analysis
            })),
            options: this.currentOptions,
            pricing: this.calculatePricing()
        };

        // Show loading
        this.elements.submitOrder.disabled = true;
        this.elements.submitOrder.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            // Simulate order submission
            await this.simulateOrderSubmission(orderData);

            // Success
            this.showNotification('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm.', 'success');

            // Reset
            setTimeout(() => {
                this.cancelUpload();
            }, 2000);

        } catch (error) {
            this.showNotification('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
        } finally {
            this.elements.submitOrder.disabled = false;
            this.elements.submitOrder.innerHTML = '<i class="fas fa-shopping-cart"></i> Đặt hàng ngay';
        }
    }

    simulateOrderSubmission(orderData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Order submitted:', orderData);
                resolve();
            }, 2000);
        });
    }

    cancelUpload() {
        this.files.clear();
        this.elements.filesList.innerHTML = '';
        this.hideConfig();
        this.resetOptions();
    }

    resetOptions() {
        // Reset to defaults
        document.querySelector('input[name="material"][value="pla"]').checked = true;
        document.querySelector('input[name="color"][value="white"]').checked = true;
        this.elements.qualitySlider.value = 2;
        this.updateQualityDisplay(2);

        this.elements.scaleButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === '1');
        });

        this.currentOptions = {
            material: 'pla',
            color: 'white',
            quality: 'standard',
            scale: 1
        };
    }

    showNotification(message, type = 'info') {
        // Dispatch custom event for notification
        window.dispatchEvent(new CustomEvent('app:notify', {
            detail: { message, type }
        }));
    }
}