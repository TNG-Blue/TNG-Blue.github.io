// Configuration File - config.js
const Config = {
    // Application settings
    app: {
        name: 'PrintHub3D',
        version: '1.0.0',
        debug: false,
        apiUrl: process.env.API_URL || 'https://api.printhub3d.vn',
        maxFileSize: 100 * 1024 * 1024, // 100MB
        supportedFormats: ['.stl', '.obj', '.ply', '.3mf', '.step', '.stp']
    },

    // Theme settings
    theme: {
        default: 'light',
        storageKey: 'printhub3d-theme',
        transitions: true
    },

    // Animation settings
    animation: {
        duration: 300,
        easing: 'ease-in-out',
        threshold: 0.1,
        rootMargin: '50px'
    },

    // Upload settings
    upload: {
        chunkSize: 1024 * 1024, // 1MB chunks
        maxConcurrent: 3,
        timeout: 30000,
        retries: 3
    },

    // Pricing configuration
    pricing: {
        materials: {
            pla: {
                name: 'PLA',
                description: 'Nhựa sinh học thân thiện môi trường',
                pricePerGram: 800,
                density: 1.24,
                colors: ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple'],
                multiplier: 1
            },
            abs: {
                name: 'ABS',
                description: 'Nhựa cứng, bền, chịu nhiệt tốt',
                pricePerGram: 900,
                density: 1.04,
                colors: ['white', 'black', 'red', 'blue', 'gray'],
                multiplier: 1.1
            },
            petg: {
                name: 'PETG',
                description: 'Trong suốt, bền, chống hóa chất',
                pricePerGram: 1200,
                density: 1.27,
                colors: ['clear', 'white', 'black', 'blue'],
                multiplier: 1.2
            },
            tpu: {
                name: 'TPU',
                description: 'Nhựa dẻo, đàn hồi cao',
                pricePerGram: 1500,
                density: 1.21,
                colors: ['white', 'black', 'clear'],
                multiplier: 1.3
            },
            resin: {
                name: 'Resin',
                description: 'Chi tiết siêu cao, bề mặt mịn',
                pricePerGram: 2000,
                density: 1.1,
                colors: ['white', 'gray', 'clear', 'black'],
                multiplier: 1.5
            }
        },
        quality: {
            draft: {
                name: 'Nháp',
                layerHeight: 0.3,
                multiplier: 0.8,
                timeMultiplier: 0.7,
                description: 'In nhanh, tiết kiệm chi phí'
            },
            standard: {
                name: 'Tiêu chuẩn',
                layerHeight: 0.2,
                multiplier: 1,
                timeMultiplier: 1,
                description: 'Cân bằng giữa chất lượng và tốc độ'
            },
            high: {
                name: 'Cao cấp',
                layerHeight: 0.1,
                multiplier: 1.4,
                timeMultiplier: 1.6,
                description: 'Chi tiết cao, bề mặt mịn'
            }
        },
        serviceFee: {
            base: 50000, // Base service fee in VND
            rush: 1.5, // Rush order multiplier
            complexity: {
                simple: 1,
                medium: 1.2,
                complex: 1.5
            }
        }
    },

    // Contact form settings
    contact: {
        subjects: [
            { value: 'quote', label: 'Báo giá' },
            { value: 'support', label: 'Hỗ trợ kỹ thuật' },
            { value: 'partnership', label: 'Hợp tác' },
            { value: 'other', label: 'Khác' }
        ],
        validation: {
            nameMin: 2,
            messageMin: 10,
            phoneRegex: /^[\+]?[0-9\s\-\(\)]{10,15}$/
        }
    },

    // API endpoints
    api: {
        upload: '/api/upload',
        quote: '/api/quote',
        contact: '/api/contact',
        newsletter: '/api/newsletter'
    },

    // Social links
    social: {
        facebook: 'https://facebook.com/printhub3d',
        instagram: 'https://instagram.com/printhub3d',
        youtube: 'https://youtube.com/printhub3d',
        linkedin: 'https://linkedin.com/company/printhub3d'
    },

    // Company info
    company: {
        name: 'PrintHub3D',
        phone: '1900 1234',
        mobile: '+84 123 456 789',
        email: 'info@printhub3d.vn',
        address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        workingHours: {
            weekdays: '8:00 - 18:00',
            saturday: '8:00 - 12:00',
            sunday: 'Closed'
        }
    }
};

export default Config;