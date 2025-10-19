/**
 * WordExtra Web Application JavaScript
 * Handles markdown preview, conversion, file upload, and UI interactions
 */

class MarkdownConverter {
    constructor() {
        this.elements = {};
        this.debounceTimer = null;
        this.debounceDelay = 500; // ms
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.initializeHighlightJS();
        this.updatePreview(); // Initial preview update
        console.log('WordExtra initialized successfully');
    }

    /**
     * Bind DOM elements for easy access
     */
    bindElements() {
        this.elements = {
            markdownInput: document.getElementById('markdownInput'),
            previewArea: document.getElementById('previewArea'),
            convertBtn: document.getElementById('convertBtn'),
            clearBtn: document.getElementById('clearBtn'),
            wordCount: document.getElementById('wordCount'),
            charCount: document.getElementById('charCount'),
            lineCount: document.getElementById('lineCount'),
            fileInput: document.getElementById('fileInput'),
            uploadArea: document.getElementById('uploadArea'),
            pandocStatus: document.getElementById('pandocStatus'),
            
            // Modals
            loadingModal: new bootstrap.Modal(document.getElementById('loadingModal')),
            successModal: new bootstrap.Modal(document.getElementById('successModal')),
            errorModal: new bootstrap.Modal(document.getElementById('errorModal')),
            
            // Modal content elements
            successMessage: document.getElementById('successMessage'),
            downloadLink: document.getElementById('downloadLink'),
            errorMessage: document.getElementById('errorMessage'),
            errorDetails: document.getElementById('errorDetails'),
            errorDetailsText: document.getElementById('errorDetailsText')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Markdown input events
        if (this.elements.markdownInput) {
            this.elements.markdownInput.addEventListener('input', () => {
                this.debouncePreviewUpdate();
                this.updateStatistics();
            });
            this.elements.markdownInput.addEventListener('paste', () => {
                // Small delay to allow paste content to be processed
                setTimeout(() => {
                    this.debouncePreviewUpdate();
                    this.updateStatistics();
                }, 100);
            });
        }

        // Convert button
        if (this.elements.convertBtn) {
            this.elements.convertBtn.addEventListener('click', () => {
                this.convertMarkdown();
            });
        }

        // Clear button
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }

        // File input
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (event) => {
                this.handleFileSelect(event.target.files[0]);
            });
        }

        // Drag and drop events
        if (this.elements.uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                this.elements.uploadArea.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                this.elements.uploadArea.addEventListener(eventName, () => {
                    this.elements.uploadArea.classList.add('drag-over');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                this.elements.uploadArea.addEventListener(eventName, () => {
                    this.elements.uploadArea.classList.remove('drag-over');
                }, false);
            });

            this.elements.uploadArea.addEventListener('drop', (event) => {
                const files = event.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            }, false);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch(event.key) {
                    case 'Enter':
                        event.preventDefault();
                        if (!this.elements.convertBtn.disabled) {
                            this.convertMarkdown();
                        }
                        break;
                    case 'k':
                        event.preventDefault();
                        this.clearAll();
                        break;
                }
            }
        });
    }

    /**
     * Prevent default drag behaviors
     */
    preventDefaults(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Initialize Highlight.js for code syntax highlighting
     */
    initializeHighlightJS() {
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    }

    /**
     * Debounced preview update to avoid excessive API calls
     */
    debouncePreviewUpdate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updatePreview();
        }, this.debounceDelay);
    }

    /**
     * Update markdown preview and statistics
     */
    async updatePreview() {
        const markdown = this.elements.markdownInput.value;
        
        if (!markdown.trim()) {
            this.elements.previewArea.innerHTML = `
                <p class="text-muted text-center py-5">
                    <i class="fas fa-file-alt fa-2x mb-3"></i><br>
                    Xem trước sẽ hiển thị ở đây khi bạn nhập Markdown
                </p>
            `;
            this.updateStatisticsDisplay(0, 0, 0);
            return;
        }

        try {
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ markdown })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Update preview
            this.elements.previewArea.innerHTML = data.html || '';
            this.elements.previewArea.classList.add('fade-in');
            
            // Update statistics
            const stats = data.stats || { words: 0, characters: 0, lines: 0 };
            this.updateStatisticsDisplay(stats.words, stats.characters, stats.lines);
            
            // Re-highlight code blocks
            this.highlightCodeBlocks();
            
        } catch (error) {
            console.error('Preview update failed:', error);
            this.elements.previewArea.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể cập nhật xem trước. Vui lòng thử lại.
                </div>
            `;
        }
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const text = this.elements.markdownInput.value;
        
        if (text.trim()) {
            const words = text.split(/\s+/).filter(word => word.length > 0).length;
            const characters = text.length;
            const lines = text.split('\n').length;
            
            this.updateStatisticsDisplay(words, characters, lines);
        } else {
            this.updateStatisticsDisplay(0, 0, 0);
        }
    }

    /**
     * Update statistics display elements
     */
    updateStatisticsDisplay(words, characters, lines) {
        if (this.elements.wordCount) {
            this.elements.wordCount.textContent = words.toLocaleString('vi-VN');
        }
        if (this.elements.charCount) {
            this.elements.charCount.textContent = characters.toLocaleString('vi-VN');
        }
        if (this.elements.lineCount) {
            this.elements.lineCount.textContent = lines.toLocaleString('vi-VN');
        }
    }

    /**
     * Highlight code blocks in preview
     */
    highlightCodeBlocks() {
        if (typeof hljs !== 'undefined') {
            this.elements.previewArea.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    /**
     * Convert markdown to Word document
     */
    async convertMarkdown() {
        const markdown = this.elements.markdownInput.value.trim();
        
        if (!markdown) {
            this.showError('Vui lòng nhập nội dung Markdown trước khi chuyển đổi!');
            return;
        }

        // Show loading
        this.elements.loadingModal.show();
        this.setButtonLoading(this.elements.convertBtn, true);

        try {
            const response = await fetch('/api/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ markdown })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess(data.message, data.filename);
            } else {
                this.showError(data.message, data.error);
            }

        } catch (error) {
            console.error('Conversion failed:', error);
            this.showError('Có lỗi xảy ra khi kết nối đến server. Vui lòng thử lại!', error.message);
        } finally {
            // Hide loading
            this.elements.loadingModal.hide();
            this.setButtonLoading(this.elements.convertBtn, false);
        }
    }

    /**
     * Handle file selection
     */
    handleFileSelect(file) {
        if (!file) return;

        // Check file type
        if (!file.name.toLowerCase().endsWith('.md') && !file.name.toLowerCase().endsWith('.txt')) {
            this.showError('Vui lòng chọn file có định dạng .md hoặc .txt');
            return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File quá lớn! Vui lòng chọn file có kích thước nhỏ hơn 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            this.elements.markdownInput.value = event.target.result;
            this.updatePreview();
            this.updateStatistics();
            
            // Show success message
            const toast = this.createToast('success', `Đã tải file "${file.name}" thành công!`);
            document.body.appendChild(toast);
            
            // Auto remove toast after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
        };

        reader.onerror = () => {
            this.showError('Không thể đọc file. Vui lòng thử lại.');
        };

        reader.readAsText(file);
    }

    /**
     * Clear all content
     */
    clearAll() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung?')) {
            this.elements.markdownInput.value = '';
            this.elements.previewArea.innerHTML = `
                <p class="text-muted text-center py-5">
                    <i class="fas fa-file-alt fa-2x mb-3"></i><br>
                    Xem trước sẽ hiển thị ở đây khi bạn nhập Markdown
                </p>
            `;
            this.updateStatisticsDisplay(0, 0, 0);
            this.elements.markdownInput.focus();
        }
    }

    /**
     * Show success modal
     */
    showSuccess(message, filename) {
        this.elements.successMessage.textContent = message;
        
        if (filename) {
            this.elements.downloadLink.href = `/download/${filename}`;
            this.elements.downloadLink.style.display = 'inline-block';
        } else {
            this.elements.downloadLink.style.display = 'none';
        }
        
        this.elements.successModal.show();
    }

    /**
     * Show error modal
     */
    showError(message, details = null) {
        this.elements.errorMessage.textContent = message;
        
        if (details) {
            this.elements.errorDetailsText.textContent = details;
            this.elements.errorDetails.style.display = 'block';
        } else {
            this.elements.errorDetails.style.display = 'none';
        }
        
        this.elements.errorModal.show();
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Chuyển đổi sang Word';
        }
    }

    /**
     * Create toast notification
     */
    createToast(type, message) {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '9999';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        return toast;
    }

    /**
     * Check pandoc status
     */
    async checkPandocStatus() {
        try {
            const response = await fetch('/api/pandoc-status');
            const data = await response.json();
            
            const statusElement = this.elements.pandocStatus;
            if (data.status === 'success') {
                statusElement.innerHTML = `
                    <div class="alert alert-success mb-0">
                        <i class="fas fa-check-circle me-2"></i>
                        ${data.version}
                    </div>
                `;
                this.elements.convertBtn.disabled = false;
            } else {
                statusElement.innerHTML = `
                    <div class="alert alert-danger mb-0">
                        <i class="fas fa-times-circle me-2"></i>
                        ${data.message}
                    </div>
                `;
                this.elements.convertBtn.disabled = true;
            }
        } catch (error) {
            console.error('Failed to check pandoc status:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.MarkdownConverter = new MarkdownConverter();
    window.MarkdownConverter.init();
});

// Global utilities
window.utils = {
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Validate markdown content
     */
    validateMarkdown(content) {
        if (!content || typeof content !== 'string') {
            return { valid: false, message: 'Nội dung không hợp lệ' };
        }
        
        if (content.trim().length === 0) {
            return { valid: false, message: 'Nội dung không được để trống' };
        }
        
        if (content.length > 1000000) { // 1MB limit
            return { valid: false, message: 'Nội dung quá dài (giới hạn 1MB)' };
        }
        
        return { valid: true };
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy: ', err);
            return false;
        }
    }
};