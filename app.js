// --- FONTS DATABASES (Dynamically loaded from CDN) ---
let HINDI_FONTS = ['Noto Sans Devanagari', 'Yatra One', 'Rozha One', 'Kalam', 'Modak', 'Teko'];
let ENGLISH_FONTS = ['Outfit', 'Poppins', 'Playfair Display', 'Pacifico', 'Inter', 'Roboto'];

// --- STATE MANAGEMENT ---
const state = {
    selectedImageUrl: '',
    selectedImageElement: null,
    generatedImages: [],
    currentSeedBase: Math.floor(Math.random() * 100000),
    imagesPerPage: 4,
    loadedCount: 0,
    searchPrompt: '',
    textAlignment: 'center',
    activeFontTab: 'hindi', // 'hindi' or 'english'
    fontSearchQuery: '',
    loadedFonts: new Set(),
    activeFontFamily: "'Noto Sans Devanagari', sans-serif",
    textX: 540,
    textY: 960,
    textBounds: null,
    maxTextWidth: 918,
    isTextSelected: false,
    resizeCorners: null,
    sideHandles: null,

    // Audio & Export State
    audioElement: null,
    audioContext: null,
    audioAnalyser: null,
    audioSource: null,
    audioRecorderDestination: null,
    audioPlaying: false,
    selectedAudio: null,
    audioStartOffset: 0,
    audioDuration: 15,
    audioVisualizerStyle: 'none',
    audioVisualizerColor: '#f59e0b',
    audioVisualizerPosition: 80,
    exportFormat: 'image',
    isRecording: false
};

// --- DOM ELEMENTS ---
const quoteInput = document.getElementById('quote-input');
const promptInput = document.getElementById('prompt-input');
const btnGenerateAi = document.getElementById('btn-generate-ai');
const aiSpinner = document.getElementById('ai-spinner');
const imageGrid = document.getElementById('image-grid');
const btnLoadMore = document.getElementById('btn-load-more');
const loadMoreSpinner = document.getElementById('load-more-spinner');

// File Upload
const btnBrowseImg = document.getElementById('btn-browse-img');
const fileUpload = document.getElementById('file-upload');

// Auto Style & Modals
const btnMagicStyle = document.getElementById('btn-magic-style');
const modalMagicLayouts = document.getElementById('modal-magic-layouts');
const btnCloseLayouts = document.getElementById('btn-close-layouts');
const btnRefreshLayouts = document.getElementById('btn-refresh-layouts');
const magicLayoutsGrid = document.getElementById('magic-layouts-grid');
const btnOpenFonts = document.getElementById('btn-open-fonts');
const modalFonts = document.getElementById('modal-fonts');
const btnCloseFonts = document.getElementById('btn-close-fonts');
const fontSearch = document.getElementById('font-search');
const tabHindiFonts = document.getElementById('tab-hindi-fonts');
const tabEnglishFonts = document.getElementById('tab-english-fonts');
const fontsPreviewGrid = document.getElementById('fonts-preview-grid');

// Customizer Controls
const fontSelect = document.getElementById('font-select');
const sizeSlider = document.getElementById('size-slider');
const sizeVal = document.getElementById('size-val');
const positionSlider = document.getElementById('position-slider');
const positionVal = document.getElementById('position-val');
const overlaySlider = document.getElementById('overlay-slider');
const overlayVal = document.getElementById('overlay-val');
const shadowColorPicker = document.getElementById('shadow-color-picker');
const shadowColorVal = document.getElementById('shadow-color-val');
const shadowOpacitySlider = document.getElementById('shadow-opacity-slider');
const shadowOpacityVal = document.getElementById('shadow-opacity-val');
const shadowBlurSlider = document.getElementById('shadow-blur-slider');
const shadowBlurVal = document.getElementById('shadow-blur-val');
const shadowOffsetXSlider = document.getElementById('shadow-offset-x');
const shadowOffsetXVal = document.getElementById('shadow-offset-x-val');
const shadowOffsetYSlider = document.getElementById('shadow-offset-y');
const shadowOffsetYVal = document.getElementById('shadow-offset-y-val');
const alignButtons = document.querySelectorAll('#align-group .btn-toggle');

// Canvas
const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');

// Download & Modal
const btnDownload8k = document.getElementById('btn-download-8k');
const downloadSpinner = document.getElementById('download-spinner');
const modalProcessing = document.getElementById('modal-processing');

// --- AUDIO DOM ELEMENTS ---
const audioWidget = document.getElementById('audio-widget');
const selectedAudioTitle = document.getElementById('selected-audio-title');
const selectedAudioArtist = document.getElementById('selected-audio-artist');
const btnPlaySelected = document.getElementById('btn-play-selected');
const audioSearchInput = document.getElementById('audio-search-input');
const btnSearchAudio = document.getElementById('btn-search-audio');
const audioResultsList = document.getElementById('audio-results-list');
const audioFileUpload = document.getElementById('audio-file-upload');
const audioDropzone = document.getElementById('audio-dropzone');
const audioUrlInput = document.getElementById('audio-url-input');
const btnLoadAudioUrl = document.getElementById('btn-load-audio-url');
const btnFormatImage = document.getElementById('btn-format-image');
const btnFormatVideo = document.getElementById('btn-format-video');
const bgAudio = document.getElementById('bg-audio');
const audioTrimContainer = document.getElementById('audio-trim-container');
const audioStartSlider = document.getElementById('audio-start-slider');
const audioStartVal = document.getElementById('audio-start-val');
const audioEndSlider = document.getElementById('audio-end-slider');
const audioEndVal = document.getElementById('audio-end-val');
const audioTotalDurationVal = document.getElementById('audio-total-duration-val');

// Curated default background images (High Resolution BMW M5 Photos)
const CURATED_BACKGROUNDS = [
    {
        name: "BMW M5 Dark Front Angle",
        url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=95&w=4320&auto=format&fit=crop"
    },
    {
        name: "BMW M5 Competition Rear View",
        url: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=95&w=4320&auto=format&fit=crop"
    },
    {
        name: "BMW M5 CS Headlight Close-up",
        url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=95&w=4320&auto=format&fit=crop"
    },
    {
        name: "BMW M5 Studio Front Profile",
        url: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=95&w=4320&auto=format&fit=crop"
    },
    {
        name: "BMW M4/M5 Shadowy Forest Drive",
        url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=95&w=4320&auto=format&fit=crop"
    },
    {
        name: "Classic BMW M5 Sunset Glow",
        url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=95&w=4320&auto=format&fit=crop"
    }
];

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    // Load saved theme preference
    const themeCheckbox = document.getElementById('theme-checkbox');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeCheckbox) {
            themeCheckbox.checked = true;
        }
    } else {
        document.body.classList.remove('light-theme');
        if (themeCheckbox) {
            themeCheckbox.checked = false;
        }
    }

    setupCanvas();
    loadCuratedBackgrounds();
    setupEventListeners();
    populateQuickFontSelect();
    loadGoogleFontsDatabase();
    setupAudioFeatures();
    
    document.fonts.ready.then(() => {
        drawCanvasPreview();
    });
});

async function loadGoogleFontsDatabase() {
    // 1. Try to fetch directly from fast, CORS-enabled jsDelivr CDNs for all free fonts
    try {
        console.log("Fetching all available free fonts from live CDN...");
        const [hindiRes, englishRes] = await Promise.all([
            fetch('https://cdn.jsdelivr.net/gh/hasinhayder/google-fonts/subsets/devanagari/fonts.json'),
            fetch('https://cdn.jsdelivr.net/gh/hasinhayder/google-fonts/subsets/latin/fonts.json')
        ]);
        
        if (hindiRes.ok && englishRes.ok) {
            const hindiData = await hindiRes.json();
            const englishData = await englishRes.json();
            
            if (hindiData.fonts && hindiData.fonts.length > 0) {
                HINDI_FONTS = hindiData.fonts;
            }
            if (englishData.fonts && englishData.fonts.length > 0) {
                ENGLISH_FONTS = englishData.fonts;
            }
            console.log(`Successfully loaded ${HINDI_FONTS.length} Hindi fonts and ${ENGLISH_FONTS.length} English fonts dynamically from live CDN!`);
            return; // Successful fetch from CDN, we can exit
        }
    } catch (cdnErr) {
        console.warn("Failed to load fonts from CDN, trying backend proxy:", cdnErr);
    }

    // 2. Fallback to python server proxy `/api/fonts` if running on http
    try {
        if (window.location.protocol.startsWith('http')) {
            const response = await fetch('/api/fonts');
            if (response.ok) {
                const data = await response.json();
                if (data.hindi && data.hindi.length > 0) {
                    HINDI_FONTS = data.hindi;
                }
                if (data.english && data.english.length > 0) {
                    ENGLISH_FONTS = data.english;
                }
                console.log(`Successfully loaded ${HINDI_FONTS.length} Hindi fonts and ${ENGLISH_FONTS.length} English fonts dynamically from backend proxy!`);
            }
        }
    } catch (e) {
        console.error("Failed to load dynamic fonts database, using local fallback:", e);
    }
}

function setupCanvas() {
    canvas.width = 1080;
    canvas.height = 1920;
}

// Populate the quick font dropdown with a curated subset of popular fonts
function populateQuickFontSelect() {
    fontSelect.innerHTML = `
        <option value="'Noto Sans Devanagari', sans-serif" selected>Noto Sans Devanagari (Default)</option>
        <option value="'Yatra One', cursive">Yatra One (Calligraphy)</option>
        <option value="'Rozha One', serif">Rozha One (Serif Bold)</option>
        <option value="'Poppins', sans-serif">Poppins (Modern Sans)</option>
        <option value="'Kalam', cursive">Kalam (Handwriting)</option>
        <option value="'Modak', cursive">Modak (Heavy Cartoon)</option>
        <option value="'Teko', sans-serif">Teko (Tall Headline)</option>
        <option value="'Playfair Display', serif">Playfair Display (English Serif)</option>
        <option value="'Pacifico', cursive">Pacifico (English Script)</option>
    `;
}

// Load default background images
function loadCuratedBackgrounds() {
    imageGrid.innerHTML = `
        <div class="gallery-placeholder" style="grid-column: span 3; text-align: center; padding: 2.5rem 1.5rem; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.02); height: 100%; min-height: 200px;">
            <i class="fa-regular fa-image" style="font-size: 2.8rem; color: var(--text-muted); opacity: 0.6;"></i>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">Pexels Library Ready</div>
            <p style="font-size: 0.8rem; color: var(--text-muted); max-width: 220px; line-height: 1.4; margin: 0 auto;">Search backgrounds above to explore high-quality photos</p>
        </div>
    `;
    
    selectBackgroundImage(CURATED_BACKGROUNDS[0].url);
}

// Create gallery image card
function createImageCard(url, altText, isSelected = false) {
    const card = document.createElement('div');
    card.className = `gallery-card ${isSelected ? 'selected' : ''}`;
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'img-loading-overlay';
    loadingOverlay.innerHTML = '<i class="fa-solid fa-spinner spinner-icon"></i>';
    card.appendChild(loadingOverlay);
    
    const img = document.createElement('img');
    img.alt = altText;
    
    img.crossOrigin = 'anonymous';
    img.src = url;
    
    img.onload = () => {
        loadingOverlay.classList.add('hidden');
    };
    
    img.onerror = () => {
        loadingOverlay.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>';
    };
    
    card.appendChild(img);
    
    card.addEventListener('click', () => {
        document.querySelectorAll('.gallery-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectBackgroundImage(url);
    });
    
    imageGrid.appendChild(card);
}

// Select background image and draw it on canvas
function selectBackgroundImage(url) {
    state.selectedImageUrl = url;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    
    img.onload = () => {
        state.selectedImageElement = img;
        drawCanvasPreview();
    };
    
    img.onerror = () => {
        console.error("Failed to load background image:", url);
    };
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
    // Quote Input
    quoteInput.addEventListener('input', drawCanvasPreview);
    
    // File Browse Handler
    btnBrowseImg.addEventListener('click', () => fileUpload.click());
    fileUpload.addEventListener('change', handleFileUpload);
    
    // Theme Toggle Handler
    const themeCheckbox = document.getElementById('theme-checkbox');
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            if (themeCheckbox.checked) {
                document.body.classList.add('light-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-theme');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Drag-to-Move Text Canvas Event Listeners
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);

    canvas.addEventListener('touchstart', startDrag, { passive: false });
    canvas.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', endDrag);

    // Pexels Search Actions
    btnGenerateAi.addEventListener('click', () => {
        const query = promptInput.value.trim();
        if (query) {
            generateAiImages(query, true);
        }
    });
    
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = promptInput.value.trim();
            if (query) {
                generateAiImages(query, true);
            }
        }
    });

    // Load More action
    btnLoadMore.addEventListener('click', () => {
        if (state.searchPrompt) {
            generateAiImages(state.searchPrompt, false);
        }
    });


    // Customizer Controls
    fontSelect.addEventListener('change', (e) => {
        state.activeFontFamily = e.target.value;
        drawCanvasPreview();
    });
    
    sizeSlider.addEventListener('input', (e) => {
        sizeVal.textContent = `${e.target.value}px`;
        drawCanvasPreview();
    });
    
    positionSlider.addEventListener('input', (e) => {
        positionVal.textContent = `${e.target.value}%`;
        state.textY = canvas.height * (parseInt(e.target.value) / 100);
        drawCanvasPreview();
    });
    
    overlaySlider.addEventListener('input', (e) => {
        overlayVal.textContent = `${e.target.value}%`;
        drawCanvasPreview();
    });
    
    if (shadowColorPicker) {
        shadowColorPicker.addEventListener('input', (e) => {
            shadowColorVal.textContent = e.target.value.toUpperCase();
            drawCanvasPreview();
        });
    }
    if (shadowOpacitySlider) {
        shadowOpacitySlider.addEventListener('input', (e) => {
            shadowOpacityVal.textContent = `${e.target.value}%`;
            drawCanvasPreview();
        });
    }
    if (shadowBlurSlider) {
        shadowBlurSlider.addEventListener('input', (e) => {
            shadowBlurVal.textContent = `${e.target.value}px`;
            drawCanvasPreview();
        });
    }
    if (shadowOffsetXSlider) {
        shadowOffsetXSlider.addEventListener('input', (e) => {
            shadowOffsetXVal.textContent = `${e.target.value}px`;
            drawCanvasPreview();
        });
    }
    if (shadowOffsetYSlider) {
        shadowOffsetYSlider.addEventListener('input', (e) => {
            shadowOffsetYVal.textContent = `${e.target.value}px`;
            drawCanvasPreview();
        });
    }

    // Alignment Toggle buttons
    alignButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            alignButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.textAlignment = btn.getAttribute('data-value');
            
            // Snap textX to standard positions
            if (state.textAlignment === 'left') {
                state.textX = canvas.width * 0.085;
            } else if (state.textAlignment === 'right') {
                state.textX = canvas.width * 0.915;
            } else {
                state.textX = canvas.width / 2;
            }
            drawCanvasPreview();
        });
    });

    // Auto Stylist
    btnMagicStyle.addEventListener('click', openLayoutsModal);
    if (btnCloseLayouts) {
        btnCloseLayouts.addEventListener('click', closeLayoutsModal);
    }
    if (btnRefreshLayouts) {
        btnRefreshLayouts.addEventListener('click', () => renderLayoutsGrid());
    }

    // Font Modal Controls
    btnOpenFonts.addEventListener('click', openFontsModal);
    btnCloseFonts.addEventListener('click', closeFontsModal);
    fontSearch.addEventListener('input', handleFontSearch);
    tabHindiFonts.addEventListener('click', () => switchFontTab('hindi'));
    tabEnglishFonts.addEventListener('click', () => switchFontTab('english'));

    // Download Button
    btnDownload8k.addEventListener('click', handleDownloadExport);
}

// --- FILE UPLOAD PROCESSING ---
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        // Append user uploaded image as a card in the grid
        createImageCard(dataUrl, "Uploaded Image", true);
        
        // Remove selection from previous gallery cards
        document.querySelectorAll('.gallery-card').forEach(c => {
            if (c.querySelector('img').src !== dataUrl) {
                c.classList.remove('selected');
            }
        });
        
        selectBackgroundImage(dataUrl);
    };
    reader.readAsDataURL(file);
}



// --- SURPRISE ME LAYOUTS MODAL CONTROLLERS ---
function openLayoutsModal() {
    if (modalMagicLayouts) {
        modalMagicLayouts.classList.remove('hidden');
        renderLayoutsGrid();
    }
}

function closeLayoutsModal() {
    if (modalMagicLayouts) {
        modalMagicLayouts.classList.add('hidden');
    }
}

function generateLayoutPresets(count = 9) {
    const text = quoteInput.value.trim() || 'तजुर्बा खामोशी';
    const isHindi = /[\u0900-\u097F]/.test(text);
    const fontPool = isHindi ? HINDI_FONTS : ENGLISH_FONTS;
    
    const presets = [];
    const alignments = ['left', 'center', 'right'];
    
    for (let i = 0; i < count; i++) {
        const fontName = fontPool[Math.floor(Math.random() * fontPool.length)];
        const fontSize = Math.floor(Math.random() * (75 - 40 + 1)) + 40; // 40px to 75px
        const positionPercent = Math.floor(Math.random() * (75 - 28 + 1)) + 28; // 28% to 75%
        const overlayOpacity = Math.floor(Math.random() * (68 - 32 + 1)) + 32; // 32% to 68%
        const shadowSoftness = Math.floor(Math.random() * (24 - 8 + 1)) + 8; // 8px to 24px
        const shadowColorHex = '#000000';
        const shadowOpacityPercent = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // 65% to 95%
        const shadowOffsetX = Math.floor(Math.random() * (8 - (-8) + 1)) - 8; // -8 to 8
        const shadowOffsetY = Math.floor(Math.random() * (12 - 2 + 1)) + 2; // 2 to 12
        const textAlignment = alignments[Math.floor(Math.random() * alignments.length)];
        const maxTextWidth = Math.floor(Math.random() * (960 - 650 + 1)) + 650;
        
        presets.push({
            fontFamilyName: fontName,
            fontFamily: `'${fontName}', sans-serif`,
            fontSize,
            positionPercent,
            overlayOpacity: overlayOpacity / 100,
            shadowSoftness,
            shadowColorHex,
            shadowOpacityPercent,
            shadowOffsetX,
            shadowOffsetY,
            textAlignment,
            maxTextWidth
        });
    }
    return presets;
}

function renderLayoutsGrid() {
    if (!magicLayoutsGrid) return;
    
    magicLayoutsGrid.innerHTML = '';
    
    const quoteText = quoteInput.value.trim() || 'तजुर्बा खामोशी';
    const presets = generateLayoutPresets(9);
    
    presets.forEach(preset => {
        loadWebFont(preset.fontFamilyName, quoteText);
    });
    
    const cardsInfo = [];
    
    presets.forEach((preset, index) => {
        const card = document.createElement('div');
        card.className = 'layout-preset-card';
        
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'layout-preset-canvas-wrapper';
        
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 180;
        previewCanvas.height = 320;
        
        canvasWrapper.appendChild(previewCanvas);
        card.appendChild(canvasWrapper);
        
        const footer = document.createElement('div');
        footer.className = 'layout-preset-footer';
        
        const title = document.createElement('div');
        title.className = 'layout-preset-title';
        title.textContent = `Design ${index + 1}`;
        
        const subtitle = document.createElement('div');
        subtitle.className = 'layout-preset-subtitle';
        subtitle.textContent = preset.fontFamilyName;
        
        footer.appendChild(title);
        footer.appendChild(subtitle);
        card.appendChild(footer);
        
        card.addEventListener('click', () => {
            applyLayoutPreset(preset);
            closeLayoutsModal();
        });
        
        magicLayoutsGrid.appendChild(card);
        
        cardsInfo.push({
            canvas: previewCanvas,
            ctx: previewCanvas.getContext('2d'),
            preset: preset
        });
    });
    
    document.fonts.ready.then(() => {
        cardsInfo.forEach(info => {
            drawCanvasPreview(info.canvas, info.ctx, 180, 320, info.preset);
        });
    });
}

function applyLayoutPreset(preset) {
    if (!preset) return;
    
    const fontName = preset.fontFamilyName;
    let fontOptExists = false;
    for (let i = 0; i < fontSelect.options.length; i++) {
        if (fontSelect.options[i].text.includes(fontName)) {
            fontSelect.selectedIndex = i;
            fontOptExists = true;
            break;
        }
    }
    if (!fontOptExists) {
        const opt = document.createElement('option');
        opt.value = preset.fontFamily;
        opt.text = fontName;
        fontSelect.add(opt);
        fontSelect.value = opt.value;
    }
    
    state.activeFontFamily = preset.fontFamily;
    state.textAlignment = preset.textAlignment;
    state.maxTextWidth = preset.maxTextWidth;
    
    sizeSlider.value = preset.fontSize;
    sizeVal.textContent = `${preset.fontSize}px`;
    
    positionSlider.value = preset.positionPercent;
    positionVal.textContent = `${preset.positionPercent}%`;
    state.textY = canvas.height * (preset.positionPercent / 100);
    
    const overlayPercent = Math.round(preset.overlayOpacity * 100);
    overlaySlider.value = overlayPercent;
    overlayVal.textContent = `${overlayPercent}%`;
    
    // Apply custom shadow settings
    shadowColorPicker.value = preset.shadowColorHex || '#000000';
    shadowColorVal.textContent = (preset.shadowColorHex || '#000000').toUpperCase();
    
    shadowOpacitySlider.value = preset.shadowOpacityPercent !== undefined ? preset.shadowOpacityPercent : 85;
    shadowOpacityVal.textContent = `${shadowOpacitySlider.value}%`;
    
    shadowBlurSlider.value = preset.shadowSoftness;
    shadowBlurVal.textContent = `${preset.shadowSoftness}px`;
    
    shadowOffsetXSlider.value = preset.shadowOffsetX !== undefined ? preset.shadowOffsetX : 0;
    shadowOffsetXVal.textContent = `${shadowOffsetXSlider.value}px`;
    
    shadowOffsetYSlider.value = preset.shadowOffsetY !== undefined ? preset.shadowOffsetY : 4;
    shadowOffsetYVal.textContent = `${shadowOffsetYSlider.value}px`;
    
    alignButtons.forEach(btn => {
        if (btn.getAttribute('data-value') === preset.textAlignment) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (state.textAlignment === 'left') {
        state.textX = canvas.width * 0.085;
    } else if (state.textAlignment === 'right') {
        state.textX = canvas.width * 0.915;
    } else {
        state.textX = canvas.width / 2;
    }
    
    drawCanvasPreview();
}

// Helper to inject Google Font stylesheet on demand
function loadWebFont(family, textSubset = '') {
    const key = `${family}_${textSubset}`;
    if (state.loadedFonts.has(key)) return;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    
    // If textSubset is provided, download ONLY the characters needed (highly optimized!)
    let url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`;
    if (textSubset) {
        const cleanSubset = encodeURIComponent(Array.from(new Set(textSubset)).join(''));
        url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&text=${cleanSubset}&display=swap`;
    }
    
    link.href = url;
    document.head.appendChild(link);
    state.loadedFonts.add(key);
}

// --- FONTS MODAL CONTROLLER & LAZY PREVIEW ---
function openFontsModal() {
    modalFonts.classList.remove('hidden');
    // Detect query language and auto-switch to correct tab
    const text = quoteInput.value.trim();
    const isHindi = /[\u0900-\u097F]/.test(text);
    switchFontTab(isHindi ? 'hindi' : 'english');
}

function closeFontsModal() {
    modalFonts.classList.add('hidden');
}

function switchFontTab(tabName) {
    state.activeFontTab = tabName;
    if (tabName === 'hindi') {
        tabHindiFonts.classList.add('active');
        tabEnglishFonts.classList.remove('active');
    } else {
        tabHindiFonts.classList.remove('active');
        tabEnglishFonts.classList.add('active');
    }
    renderFontsGrid();
}

function handleFontSearch() {
    state.fontSearchQuery = fontSearch.value.trim().toLowerCase();
    renderFontsGrid();
}

// Render the modal grid of fonts with live active quote previews
function renderFontsGrid() {
    fontsPreviewGrid.innerHTML = '';
    const quote = quoteInput.value.trim() || 'तजुर्बा खामोशी';
    
    const fontList = state.activeFontTab === 'hindi' ? HINDI_FONTS : ENGLISH_FONTS;
    
    // Filter list based on search query
    const filteredFonts = fontList.filter(f => f.toLowerCase().includes(state.fontSearchQuery));
    
    // Intersection Observer to lazy load the fonts ONLY as the card scrolls into view!
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const fontName = card.getAttribute('data-font');
                
                // Inject the font stylesheet link with subset optimizations
                loadWebFont(fontName, quote);
                
                // Apply the style to the card preview text
                const textEl = card.querySelector('.font-preview-text');
                textEl.style.fontFamily = `'${fontName}', sans-serif`;
                
                // Unobserve card once loaded
                observer.unobserve(card);
            }
        });
    }, { root: fontsPreviewGrid, threshold: 0.1 });
    
    filteredFonts.forEach(font => {
        const card = document.createElement('div');
        card.className = 'font-preview-card';
        card.setAttribute('data-font', font);
        
        // Highlight active font
        if (state.activeFontFamily.includes(font)) {
            card.classList.add('active-font');
        }
        
        if (state.selectedImageUrl) {
            card.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${state.selectedImageUrl}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.style.textShadow = '0 2px 5px rgba(0,0,0,0.8)';
        }
        
        // Preview text
        const textEl = document.createElement('div');
        textEl.className = 'font-preview-text';
        textEl.textContent = quote;
        // Set generic fallback first
        textEl.style.fontFamily = 'sans-serif';
        
        // Font Name footer
        const footerEl = document.createElement('div');
        footerEl.className = 'font-preview-name';
        footerEl.textContent = font;
        
        card.appendChild(textEl);
        card.appendChild(footerEl);
        
        // Click action
        card.addEventListener('click', () => {
            selectFontFromModal(font);
        });
        
        fontsPreviewGrid.appendChild(card);
        observer.observe(card);
    });
    
    if (filteredFonts.length === 0) {
        fontsPreviewGrid.innerHTML = '<div style="grid-column: span 3; text-align: center; padding: 2rem; color: var(--text-muted);">No fonts found. Try another search.</div>';
    }
}

function selectFontFromModal(font) {
    const quote = quoteInput.value.trim();
    loadWebFont(font, quote);
    
    state.activeFontFamily = `'${font}', sans-serif`;
    
    // Select it in our dropdown
    let fontOptExists = false;
    for (let i = 0; i < fontSelect.options.length; i++) {
        if (fontSelect.options[i].text.includes(font)) {
            fontSelect.selectedIndex = i;
            fontOptExists = true;
            break;
        }
    }
    
    if (!fontOptExists) {
        const opt = document.createElement('option');
        opt.value = `'${font}', sans-serif`;
        opt.text = font;
        fontSelect.add(opt);
        fontSelect.value = opt.value;
    }
    
    drawCanvasPreview();
    closeFontsModal();
}

// --- IMAGE SEARCH FROM PEXELS API ---
async function generateAiImages(prompt, clearGrid = true) {
    state.searchPrompt = prompt;
    
    if (clearGrid) {
        state.loadedCount = 0;
        imageGrid.innerHTML = '';
        btnGenerateAi.disabled = true;
        aiSpinner.classList.remove('hidden');
    } else {
        btnLoadMore.disabled = true;
        loadMoreSpinner.classList.remove('hidden');
    }
    
    const perPage = 12;
    const pageNum = Math.floor(state.loadedCount / perPage) + 1;
    
    try {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=${perPage}&page=${pageNum}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': 'F5GY5xTk5YuS3NslDKxmhW94LAL51xpts7av26v3BE6mHFvCB5H5KQCn'
            }
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const results = data.photos || [];
        const images = results.map(item => {
            const src = item.src || {};
            return {
                id: item.id || '',
                thumb: src.portrait || src.medium || '',
                full: src.original || src.large || ''
            };
        });
        
        if (images.length === 0 && clearGrid) {
            imageGrid.innerHTML = '<div style="grid-column: span 3; text-align: center; padding: 2rem; color: var(--text-muted);">No images found on Pexels. Try other keywords.</div>';
            btnLoadMore.classList.add('hidden');
        } else {
            images.forEach((imgObj, index) => {
                const isFirst = clearGrid && index === 0;
                createImageCard(imgObj.thumb, `Pexels Photo ${imgObj.id}`, isFirst);
                if (isFirst) {
                    selectBackgroundImage(imgObj.full);
                }
            });
            
            state.loadedCount += images.length;
            if (images.length < perPage) {
                btnLoadMore.classList.add('hidden');
            } else {
                btnLoadMore.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error("Pexels search failed:", e);
        if (clearGrid) {
            imageGrid.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 2rem; color: #ef4444;">Search failed: ${e.message}. Please check your internet connection and Pexels API key.</div>`;
        }
    } finally {
        btnGenerateAi.disabled = false;
        aiSpinner.classList.add('hidden');
        btnLoadMore.disabled = false;
        loadMoreSpinner.classList.add('hidden');
    }
}


// --- RENDER TEXT OVERLAY & CANVAS DRAW ---
function drawCanvasPreview(customCanvas = null, customCtx = null, targetWidth = 1080, targetHeight = 1920, preset = null) {
    const activeCanvas = customCanvas || canvas;
    const activeCtx = customCtx || ctx;
    
    activeCtx.clearRect(0, 0, targetWidth, targetHeight);
    
    // 1. Draw Background Image
    if (state.selectedImageElement) {
        const img = state.selectedImageElement;
        const imgRatio = img.width / img.height;
        const canvasRatio = targetWidth / targetHeight;
        
        let sx, sy, sWidth, sHeight;
        
        if (imgRatio > canvasRatio) {
            sHeight = img.height;
            sWidth = img.height * canvasRatio;
            sx = (img.width - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = img.width;
            sHeight = img.width / canvasRatio;
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }
        
        activeCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    } else {
        const fallbackGrad = activeCtx.createRadialGradient(
            targetWidth/2, targetHeight/2, 50, 
            targetWidth/2, targetHeight/2, targetWidth
        );
        fallbackGrad.addColorStop(0, '#1c1917');
        fallbackGrad.addColorStop(1, '#0c0a09');
        activeCtx.fillStyle = fallbackGrad;
        activeCtx.fillRect(0, 0, targetWidth, targetHeight);
    }
    
    // 2. Draw Dark Overlay
    const overlayOpacity = preset ? preset.overlayOpacity : (parseInt(overlaySlider.value) / 100);
    activeCtx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
    activeCtx.fillRect(0, 0, targetWidth, targetHeight);
    
    // 3. Draw Typography
    const rawQuote = quoteInput.value.trim();
    if (!rawQuote) return;
    
    const scaleFactor = targetWidth / 1080;
    const baseFontSize = (preset ? preset.fontSize : parseInt(sizeSlider.value)) * scaleFactor;
    // Resolve shadow parameters
    let shadowBlur, shadowColorHex, shadowOpacityPercent, shadowOffsetXVal, shadowOffsetYVal;
    
    if (preset) {
        shadowBlur = preset.shadowSoftness;
        shadowColorHex = preset.shadowColorHex || '#000000';
        shadowOpacityPercent = preset.shadowOpacityPercent !== undefined ? preset.shadowOpacityPercent : 85;
        shadowOffsetXVal = preset.shadowOffsetX !== undefined ? preset.shadowOffsetX : 0;
        shadowOffsetYVal = preset.shadowOffsetY !== undefined ? preset.shadowOffsetY : 4;
    } else {
        shadowBlur = parseInt(shadowBlurSlider.value);
        shadowColorHex = shadowColorPicker.value;
        shadowOpacityPercent = parseInt(shadowOpacitySlider.value);
        shadowOffsetXVal = parseInt(shadowOffsetXSlider.value);
        shadowOffsetYVal = parseInt(shadowOffsetYSlider.value);
    }
    
    const shadowBlurScaled = shadowBlur * scaleFactor;
    const shadowOffsetXScaled = shadowOffsetXVal * scaleFactor;
    const shadowOffsetYScaled = shadowOffsetYVal * scaleFactor;
    
    // Convert hex color to rgba with opacity
    const hex = shadowColorHex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const shadowColorRgba = `rgba(${r}, ${g}, ${b}, ${shadowOpacityPercent / 100})`;
    
    const selectedFont = preset ? preset.fontFamily : state.activeFontFamily;
    const textAlignment = preset ? preset.textAlignment : state.textAlignment;
    
    activeCtx.font = `bold ${baseFontSize}px ${selectedFont}`;
    activeCtx.fillStyle = '#ffffff';
    activeCtx.textAlign = textAlignment;
    activeCtx.textBaseline = 'middle';
    
    if (shadowBlurScaled > 0 || Math.abs(shadowOffsetXScaled) > 0 || Math.abs(shadowOffsetYScaled) > 0) {
        activeCtx.shadowColor = shadowColorRgba;
        activeCtx.shadowBlur = shadowBlurScaled;
        activeCtx.shadowOffsetX = shadowOffsetXScaled;
        activeCtx.shadowOffsetY = shadowOffsetYScaled;
    } else {
        activeCtx.shadowColor = 'transparent';
        activeCtx.shadowBlur = 0;
        activeCtx.shadowOffsetX = 0;
        activeCtx.shadowOffsetY = 0;
    }
    
    const maxTextWidth = (preset ? preset.maxTextWidth : state.maxTextWidth) * scaleFactor;
    const lines = wrapText(activeCtx, rawQuote, maxTextWidth);
    
    const lineSpacing = baseFontSize * 1.5;
    const totalTextHeight = (lines.length - 1) * lineSpacing;
    
    let targetY;
    if (preset) {
        targetY = 1920 * (preset.positionPercent / 100);
    } else {
        targetY = state.textY;
    }
    const centerY = targetY * scaleFactor;
    
    let targetX;
    if (preset) {
        if (textAlignment === 'left') {
            targetX = 1080 * 0.085;
        } else if (textAlignment === 'right') {
            targetX = 1080 * 0.915;
        } else {
            targetX = 1080 / 2;
        }
    } else {
        targetX = state.textX;
    }
    const xPos = targetX * scaleFactor;
    
    let startY = centerY - (totalTextHeight / 2);
    
    lines.forEach((line) => {
        activeCtx.fillText(line, xPos, startY);
        startY += lineSpacing;
    });
    
    activeCtx.shadowColor = 'transparent';
    activeCtx.shadowBlur = 0;
    
    // Store text bounds for dragging (only for the active preview canvas)
    if (!customCanvas) {
        const textHeightTotal = (lines.length - 1) * lineSpacing + baseFontSize;
        const startYPos = centerY - (baseFontSize / 2) - ((lines.length - 1) * lineSpacing / 2);
        
        let minXPos, maxXPos;
        if (state.textAlignment === 'left') {
            minXPos = xPos;
            maxXPos = xPos + maxTextWidth;
        } else if (state.textAlignment === 'right') {
            minXPos = xPos - maxTextWidth;
            maxXPos = xPos;
        } else { // center
            minXPos = xPos - maxTextWidth / 2;
            maxXPos = xPos + maxTextWidth / 2;
        }
        
        state.textBounds = {
            minX: minXPos,
            maxX: maxXPos,
            minY: startYPos,
            maxY: startYPos + textHeightTotal
        };
        
        // Draw dotted outline and resize handles ONLY if the text is selected!
        if (state.isTextSelected) {
            const pad = 12; // padding around text bounds
            const outlineX = state.textBounds.minX - pad;
            const outlineY = state.textBounds.minY - pad;
            const outlineW = (state.textBounds.maxX - state.textBounds.minX) + 2 * pad;
            const outlineH = (state.textBounds.maxY - state.textBounds.minY) + 2 * pad;
            
            // Draw Dashed Selection Box
            activeCtx.strokeStyle = 'rgba(245, 158, 11, 0.65)'; // Amber border
            activeCtx.lineWidth = 1.5;
            activeCtx.setLineDash([4, 4]); // Dashed line
            activeCtx.strokeRect(outlineX, outlineY, outlineW, outlineH);
            activeCtx.setLineDash([]); // Reset line dash
            
            // Corner handles (circles for size resizing)
            const corners = [
                { x: outlineX, y: outlineY, cursor: 'nwse-resize' }, // Top-Left
                { x: outlineX + outlineW, y: outlineY, cursor: 'nesw-resize' }, // Top-Right
                { x: outlineX, y: outlineY + outlineH, cursor: 'nesw-resize' }, // Bottom-Left
                { x: outlineX + outlineW, y: outlineY + outlineH, cursor: 'nwse-resize' } // Bottom-Right
            ];
            
            activeCtx.fillStyle = '#f59e0b';
            activeCtx.strokeStyle = '#ffffff';
            activeCtx.lineWidth = 1.5;
            corners.forEach(corner => {
                activeCtx.beginPath();
                activeCtx.arc(corner.x, corner.y, 6, 0, 2 * Math.PI);
                activeCtx.fill();
                activeCtx.stroke();
            });
            state.resizeCorners = corners;
            
            // Side handles (vertical pills for wrapping width resizing)
            const sides = [
                { x: outlineX, y: outlineY + outlineH / 2, cursor: 'ew-resize', type: 'left' },
                { x: outlineX + outlineW, y: outlineY + outlineH / 2, cursor: 'ew-resize', type: 'right' }
            ];
            
            activeCtx.fillStyle = '#ffffff';
            activeCtx.strokeStyle = '#f59e0b';
            activeCtx.lineWidth = 1.5;
            sides.forEach(side => {
                activeCtx.beginPath();
                if (activeCtx.roundRect) {
                    activeCtx.roundRect(side.x - 3, side.y - 8, 6, 16, 3);
                } else {
                    activeCtx.rect(side.x - 3, side.y - 8, 6, 16);
                }
                activeCtx.fill();
                activeCtx.stroke();
            });
            state.sideHandles = sides;
            
        } else {
            state.resizeCorners = null;
            state.sideHandles = null;
        }
    }
}

function wrapText(context, text, maxWidth) {
    const paragraphs = text.split('\n');
    let allLines = [];
    
    paragraphs.forEach(paragraph => {
        const words = paragraph.split(' ');
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                allLines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            allLines.push(currentLine);
        }
    });
    
    return allLines;
}

// --- 8K HIGH RESOLUTION EXPORT HANDLING ---
function handleDownload8K() {
    btnDownload8k.disabled = true;
    downloadSpinner.classList.remove('hidden');
    
    modalProcessing.classList.remove('hidden');
    updateModalStep(1, 'active');
    updateModalStep(2, 'pending');
    updateModalStep(3, 'pending');
    updateModalStep(4, 'pending');
    
    const exportWidth = 4320;
    const exportHeight = 7680;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;
    const exportCtx = exportCanvas.getContext('2d');
    
    setTimeout(() => {
        updateModalStep(1, 'completed');
        updateModalStep(2, 'active');
        
        setTimeout(() => {
            updateModalStep(2, 'completed');
            updateModalStep(3, 'active');
            
            drawCanvasPreview(exportCanvas, exportCtx, exportWidth, exportHeight);
            
            setTimeout(() => {
                updateModalStep(3, 'completed');
                updateModalStep(4, 'active');
                
                setTimeout(() => {
                    exportCanvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `tashveer_ai_quote_${Date.now()}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }
                        
                        updateModalStep(4, 'completed');
                        setTimeout(() => {
                            modalProcessing.classList.add('hidden');
                            btnDownload8k.disabled = false;
                            downloadSpinner.classList.add('hidden');
                        }, 500);
                    }, 'image/png');
                }, 1000);
            }, 800);
        }, 800);
    }, 1000);
}

function updateModalStep(stepNumber, status) {
    const stepEl = document.getElementById(`pstep-${stepNumber}`);
    if (!stepEl) return;
    
    stepEl.classList.remove('active', 'completed');
    
    if (status === 'active') {
        stepEl.classList.add('active');
    } else if (status === 'completed') {
        stepEl.classList.add('completed');
    }
}



// --- DRAG AND RESIZE TEXT CONTROLLERS ---
let isDragging = false;
let isResizing = false;
let isWrapping = false;

let startDragX = 0;
let startDragY = 0;
let startResizeX = 0;
let startResizeY = 0;
let startFontSize = 52;

let startWrapX = 0;
let startMaxTextWidth = 918;
let activeSideHandle = null;

function startDrag(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const clickX = (clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (clientY - rect.top) * (canvas.height / rect.height);
    
    // 1. Check click on side handles (for box stretching)
    if (state.sideHandles && state.isTextSelected) {
        for (let side of state.sideHandles) {
            const dist = Math.hypot(clickX - side.x, clickY - side.y);
            if (dist <= 12) {
                isWrapping = true;
                activeSideHandle = side;
                startWrapX = clickX;
                startMaxTextWidth = state.maxTextWidth;
                canvas.style.cursor = 'ew-resize';
                if (e.cancelable) e.preventDefault();
                return;
            }
        }
    }
    
    // 2. Check click on any of the 4 corner handles (for proportional resizing)
    if (state.resizeCorners && state.isTextSelected) {
        for (let corner of state.resizeCorners) {
            const dist = Math.hypot(clickX - corner.x, clickY - corner.y);
            if (dist <= 10) {
                isResizing = true;
                canvas.style.cursor = corner.cursor;
                startResizeX = clickX;
                startResizeY = clickY;
                startFontSize = parseInt(sizeSlider.value);
                if (e.cancelable) e.preventDefault();
                return;
            }
        }
    }
    
    // 3. Check click inside the main text boundaries (for moving/dragging)
    if (state.textBounds &&
        clickX >= state.textBounds.minX &&
        clickX <= state.textBounds.maxX &&
        clickY >= state.textBounds.minY &&
        clickY <= state.textBounds.maxY) {
        
        state.isTextSelected = true;
        isDragging = true;
        canvas.style.cursor = 'grabbing';
        
        startDragX = clickX - state.textX;
        startDragY = clickY - state.textY;
        
        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
    } else {
        // Clicked outside: deselect text box
        state.isTextSelected = false;
        drawCanvasPreview();
    }
}

function drag(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const currentX = (clientX - rect.left) * (canvas.width / rect.width);
    const currentY = (clientY - rect.top) * (canvas.height / rect.height);
    
    // A. Wrapping drag action
    if (isWrapping && activeSideHandle) {
        let newWidth = startMaxTextWidth;
        if (state.textAlignment === 'center') {
            newWidth = Math.abs(currentX - state.textX) * 2;
        } else if (state.textAlignment === 'left') {
            newWidth = currentX - state.textX;
        } else if (state.textAlignment === 'right') {
            newWidth = state.textX - currentX;
        }
        
        state.maxTextWidth = Math.max(150, Math.min(1000, newWidth));
        
        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
        return;
    }
    
    // B. Proportional font resizing drag action
    if (isResizing) {
        const dx = currentX - startResizeX;
        const dy = currentY - startResizeY;
        
        const change = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        const newSize = startFontSize + (change * 0.25);
        
        const sliderVal = Math.max(20, Math.min(120, Math.round(newSize)));
        sizeSlider.value = sliderVal;
        sizeVal.textContent = `${sliderVal}px`;
        
        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
        return;
    }
    
    // C. Position moving drag action
    if (isDragging) {
        state.textX = currentX - startDragX;
        state.textY = currentY - startDragY;
        
        state.textX = Math.max(50, Math.min(canvas.width - 50, state.textX));
        state.textY = Math.max(100, Math.min(canvas.height - 100, state.textY));
        
        const sliderPercent = Math.round((state.textY / canvas.height) * 100);
        positionSlider.value = sliderPercent;
        positionVal.textContent = `${sliderPercent}%`;
        
        drawCanvasPreview();
        if (e.cancelable) e.preventDefault();
        return;
    }
    
    // D. Normal hover cursor feedback
    if (state.isTextSelected) {
        // Check side handles hover
        if (state.sideHandles) {
            for (let side of state.sideHandles) {
                if (Math.hypot(currentX - side.x, currentY - side.y) <= 10) {
                    canvas.style.cursor = side.cursor;
                    return;
                }
            }
        }
        
        // Check corner handles hover
        if (state.resizeCorners) {
            for (let corner of state.resizeCorners) {
                if (Math.hypot(currentX - corner.x, currentY - corner.y) <= 8) {
                    canvas.style.cursor = corner.cursor;
                    return;
                }
            }
        }
    }
    
    // Check main text bounds hover
    if (state.textBounds &&
        currentX >= state.textBounds.minX &&
        currentX <= state.textBounds.maxX &&
        currentY >= state.textBounds.minY &&
        currentY <= state.textBounds.maxY) {
        canvas.style.cursor = 'grab';
    } else {
        canvas.style.cursor = 'default';
    }
}

function endDrag() {
    isDragging = false;
    isResizing = false;
    isWrapping = false;
    activeSideHandle = null;
    canvas.style.cursor = 'default';
}

// --- CURATED REELS MUSIC LIST ---
const CURATED_REELS_MUSIC = [
    {
        title: "Kahani Suno 2.0",
        artist: "Kaifi Khalil",
        url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/91/9f/8e/919f8e02-4d7a-ab7b-d242-a720dc6e2730/mzaf_16480572714421111585.plus.aac.p.m4a",
        thumb: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/bf/d7/de/bfd7def5-77e8-e565-df0b-a1ee40a8a614/artwork.jpg/100x100bb.jpg"
    },
    {
        title: "Calm Down",
        artist: "Rema & Selena Gomez",
        url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/a4/d6/0e/a4d60e7f-47d3-ff4b-449e-b8d9c57d76ee/mzaf_10795551980838153303.plus.aac.p.m4a",
        thumb: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ba/65/59/ba65597c-9b16-43b8-6a3f-1d8dd0208fa5/22UMGIM83883.rgb.jpg/100x100bb.jpg"
    },
    {
        title: "Mi Amor",
        artist: "Sharn",
        url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/bd/ff/2a/bdff2a3b-2877-4b82-8c9a-b44c2084c8a8/mzaf_12948149817926177583.plus.aac.p.m4a",
        thumb: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c3/c7/24/c3c7247a-8f83-e380-0f2c-569d6718d7ff/cover.jpg/100x100bb.jpg"
    },
    {
        title: "Blinding Lights",
        artist: "The Weeknd",
        url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/7b/f7/57/7bf75775-520e-8ab8-5441-df071d7d24e1/mzaf_1638210333060640993.plus.aac.p.m4a",
        thumb: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/0d/bb/01/0dbb01d3-9bc0-880c-a931-18e388f6a913/20UMGIM03058.rgb.jpg/100x100bb.jpg"
    },
    {
        title: "Pasoori",
        artist: "Ali Sethi & Shae Gill",
        url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/71/39/e3/7139e365-1d4b-741c-8b89-21b9795e1e12/mzaf_17208479364958611186.plus.aac.p.m4a",
        thumb: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/44/22/4f/44224f8d-db98-f247-4f6c-8e0ec9a41bd9/artwork.jpg/100x100bb.jpg"
    }
];

let currentPreviewAudio = null;
let currentPreviewBtn = null;

// Fetch fresh preview URLs for curated tracks to prevent 404/expiry errors
async function refreshCuratedMusicUrls() {
    try {
        const promises = CURATED_REELS_MUSIC.map(async (track) => {
            const query = `${track.title} ${track.artist}`;
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.results && data.results.length > 0) {
                        const result = data.results[0];
                        if (result.previewUrl) {
                            track.url = result.previewUrl;
                        }
                        if (result.artworkUrl100 || result.artworkUrl60) {
                            track.thumb = result.artworkUrl100 || result.artworkUrl60;
                        }
                    }
                }
            } catch (err) {
                console.warn(`Could not refresh audio URL for ${track.title}:`, err);
            }
        });
        await Promise.all(promises);
        
        // Re-render search results with refreshed URLs if the user hasn't typed anything yet
        if (!audioSearchInput.value.trim()) {
            renderSearchResults(CURATED_REELS_MUSIC);
        }
    } catch (e) {
        console.error("Error refreshing curated music list:", e);
    }
}

// --- AUDIO FEATURES FUNCTIONS ---
function setupAudioFeatures() {
    // Populate trending tracks
    renderSearchResults(CURATED_REELS_MUSIC);
    
    // Asynchronously refresh the curated music URLs
    refreshCuratedMusicUrls();
    
    // Set up tabs
    const audioTabs = document.querySelectorAll('.btn-audio-tab');
    audioTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            audioTabs.forEach(t => t.classList.remove('active'));
            // Hide all tab contents
            document.getElementById('search-tab').classList.add('hidden');
            document.getElementById('upload-tab').classList.add('hidden');
            document.getElementById('url-tab').classList.add('hidden');
            
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
    
    // Search button
    btnSearchAudio.addEventListener('click', () => {
        const query = audioSearchInput.value.trim();
        if (query) {
            searchSongs(query);
        } else {
            renderSearchResults(CURATED_REELS_MUSIC);
        }
    });
    
    audioSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = audioSearchInput.value.trim();
            if (query) {
                searchSongs(query);
            } else {
                renderSearchResults(CURATED_REELS_MUSIC);
            }
        }
    });
    
    // Play selected audio widget
    btnPlaySelected.addEventListener('click', () => {
        toggleBackgroundAudio();
    });
    
    // Browse click inside dropzone
    const browseAudioLink = document.getElementById('browse-audio-link');
    browseAudioLink.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering parent dropzone click
        audioFileUpload.click();
    });
    
    audioDropzone.addEventListener('click', () => {
        audioFileUpload.click();
    });
    
    audioFileUpload.addEventListener('change', handleAudioUpload);
    
    // Drag & Drop
    audioDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        audioDropzone.classList.add('dragover');
    });
    
    audioDropzone.addEventListener('dragleave', () => {
        audioDropzone.classList.remove('dragover');
    });
    
    audioDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        audioDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            loadAudioFile(file);
        } else {
            alert("Please upload a valid audio file.");
        }
    });
    
    // Load URL button
    btnLoadAudioUrl.addEventListener('click', handleLoadAudioUrl);
    
    // Format Controls
    btnFormatImage.addEventListener('click', () => {
        state.exportFormat = 'image';
        btnFormatImage.classList.add('active');
        btnFormatVideo.classList.remove('active');
        
        btnDownload8k.querySelector('.btn-title').textContent = "Download 8K Poster";
        btnDownload8k.querySelector('.btn-desc').textContent = "High Fidelity HDR Quality";
    });
    
    btnFormatVideo.addEventListener('click', () => {
        state.exportFormat = 'video';
        btnFormatVideo.classList.add('active');
        btnFormatImage.classList.remove('active');
        
        btnDownload8k.querySelector('.btn-title').textContent = "Download Video";
        btnDownload8k.querySelector('.btn-desc').textContent = "1080x1920 with Audio";
    });

    // Helper to format seconds as m:ss.d
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00.0";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const d = Math.floor((seconds % 1) * 10);
        return `${m}:${s < 10 ? '0' : ''}${s}.${d}`;
    }

    // Audio Trim Start Time Slider
    audioStartSlider.addEventListener('input', (e) => {
        let startTime = parseFloat(e.target.value);
        const endTime = parseFloat(audioEndSlider.value);
        
        // Ensure start time is always at least 0.5s before end time
        if (startTime >= endTime - 0.5) {
            startTime = Math.max(0, endTime - 0.5);
            audioStartSlider.value = startTime;
        }
        
        state.audioStartOffset = startTime;
        audioStartVal.textContent = formatTime(startTime);
        
        state.audioDuration = endTime - startTime;
        audioTotalDurationVal.textContent = `${state.audioDuration.toFixed(1)}s`;
        
        if (state.selectedAudio) {
            bgAudio.currentTime = startTime;
        }
    });

    // Audio Trim End Time Slider
    audioEndSlider.addEventListener('input', (e) => {
        const startTime = parseFloat(audioStartSlider.value);
        let endTime = parseFloat(e.target.value);
        const maxDuration = bgAudio.duration || 100;
        
        // Ensure end time is always at least 0.5s after start time
        if (endTime <= startTime + 0.5) {
            endTime = Math.min(maxDuration, startTime + 0.5);
            audioEndSlider.value = endTime;
        }
        
        state.audioDuration = endTime - startTime;
        audioEndVal.textContent = formatTime(endTime);
        audioTotalDurationVal.textContent = `${state.audioDuration.toFixed(1)}s`;
        
        if (state.selectedAudio) {
            // Seek to 1.5s before the end so the user can preview the cutoff
            bgAudio.currentTime = Math.max(startTime, endTime - 1.5);
        }
    });

    // Update sliders when metadata loads
    bgAudio.addEventListener('loadedmetadata', () => {
        const duration = bgAudio.duration;
        if (duration && !isNaN(duration)) {
            // Start slider config
            audioStartSlider.max = duration;
            audioStartSlider.value = 0;
            state.audioStartOffset = 0;
            audioStartVal.textContent = "0:00.0";

            // End slider config
            audioEndSlider.max = duration;
            const defaultEnd = Math.min(duration, 15);
            audioEndSlider.value = defaultEnd;
            audioEndVal.textContent = formatTime(defaultEnd);

            // Compute total video duration
            state.audioDuration = defaultEnd;
            audioTotalDurationVal.textContent = `${state.audioDuration.toFixed(1)}s`;
        }
    });

    // Handle audio timeupdate to loop or pause if it crosses the trim range
    bgAudio.addEventListener('timeupdate', () => {
        if (state.audioPlaying) {
            const currentTrimEnd = state.audioStartOffset + state.audioDuration;
            if (bgAudio.currentTime >= currentTrimEnd) {
                // Stop and seek back to trim start position
                bgAudio.pause();
                bgAudio.currentTime = state.audioStartOffset;
                state.audioPlaying = false;
                audioWidget.classList.remove('playing');
                btnPlaySelected.querySelector('i').className = 'fa-solid fa-play';
                drawCanvasPreview();
            } else if (bgAudio.currentTime < state.audioStartOffset) {
                bgAudio.currentTime = state.audioStartOffset;
            }
        }
    });
}

function initAudioContext() {
    if (state.audioContext) return;
    
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.audioAnalyser = state.audioContext.createAnalyser();
        state.audioAnalyser.fftSize = 256;
        
        // Connect audio element
        state.audioSource = state.audioContext.createMediaElementSource(bgAudio);
        state.audioSource.connect(state.audioAnalyser);
        state.audioAnalyser.connect(state.audioContext.destination);
        
        // Setup recorder destination
        state.audioRecorderDestination = state.audioContext.createMediaStreamDestination();
        state.audioAnalyser.connect(state.audioRecorderDestination);
    } catch (e) {
        console.error("Failed to initialize Web Audio API:", e);
    }
}

function toggleBackgroundAudio(forcePlay = null) {
    if (!state.selectedAudio) return;
    
    initAudioContext();
    
    const widget = document.getElementById('audio-widget');
    const playIcon = btnPlaySelected.querySelector('i');
    
    const shouldPlay = forcePlay !== null ? forcePlay : bgAudio.paused;
    
    if (shouldPlay) {
        // Stop any active search list preview
        if (currentPreviewAudio) {
            currentPreviewAudio.pause();
            if (currentPreviewBtn) {
                currentPreviewBtn.classList.remove('playing');
                currentPreviewBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
            currentPreviewAudio = null;
            currentPreviewBtn = null;
        }

        if (state.audioContext && state.audioContext.state === 'suspended') {
            state.audioContext.resume();
        }
        
        // Ensure starting within trimmed bounds
        if (bgAudio.currentTime < state.audioStartOffset || bgAudio.currentTime >= state.audioStartOffset + state.audioDuration) {
            bgAudio.currentTime = state.audioStartOffset;
        }
        
        bgAudio.play().then(() => {
            state.audioPlaying = true;
            widget.classList.add('playing');
            playIcon.className = 'fa-solid fa-pause';
            animateVisualizer();
        }).catch(err => {
            console.error("Audio playback failed:", err);
            alert("Could not play audio track. This is likely due to CORS restrictions or an expired audio URL. Try uploading the file directly!");
        });
    } else {
        bgAudio.pause();
        state.audioPlaying = false;
        widget.classList.remove('playing');
        playIcon.className = 'fa-solid fa-play';
        drawCanvasPreview();
    }
}

function animateVisualizer() {
    if (!state.audioPlaying && !state.isRecording) return;
    
    drawCanvasPreview();
    requestAnimationFrame(animateVisualizer);
}

bgAudio.onended = () => {
    toggleBackgroundAudio(false);
};

async function searchSongs(query) {
    if (!query) return;
    
    audioResultsList.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted);"><i class="fa-solid fa-spinner spinner-icon"></i> Searching music...</div>';
    
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=200`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Search failed");
        
        const data = await res.json();
        const tracks = (data.results || []).map(track => ({
            title: track.trackName || 'Unknown Title',
            artist: track.artistName || 'Unknown Artist',
            url: track.previewUrl || '',
            thumb: track.artworkUrl60 || track.artworkUrl100 || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop'
        }));
        
        renderSearchResults(tracks);
    } catch (e) {
        console.error("Music search failed:", e);
        audioResultsList.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i> Search failed. Check network connection.</div>';
    }
}

function renderSearchResults(tracks) {
    audioResultsList.innerHTML = '';
    
    if (tracks.length === 0) {
        audioResultsList.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">No tracks found.</div>';
        return;
    }
    
    tracks.forEach(track => {
        const item = document.createElement('div');
        item.className = 'audio-result-item';
        if (state.selectedAudio && state.selectedAudio.title === track.title) {
            item.classList.add('selected');
        }
        
        const infoWrapper = document.createElement('div');
        infoWrapper.className = 'audio-result-info-wrapper';
        
        const thumb = document.createElement('img');
        thumb.className = 'audio-result-thumb';
        thumb.src = track.thumb;
        thumb.alt = track.title;
        
        const meta = document.createElement('div');
        meta.className = 'audio-result-meta';
        
        const title = document.createElement('div');
        title.className = 'audio-result-title';
        title.textContent = track.title;
        
        const artist = document.createElement('div');
        artist.className = 'audio-result-artist';
        artist.textContent = track.artist;
        
        meta.appendChild(title);
        meta.appendChild(artist);
        infoWrapper.appendChild(thumb);
        infoWrapper.appendChild(meta);
        
        const actions = document.createElement('div');
        actions.className = 'audio-result-actions';
        
        const btnPlay = document.createElement('button');
        btnPlay.className = 'btn-result-action btn-result-play';
        btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
        btnPlay.type = 'button';
        btnPlay.title = 'Preview Track';
        
        btnPlay.addEventListener('click', (e) => {
            e.stopPropagation();
            playSearchResultPreview(track, btnPlay);
        });
        
        const btnSelect = document.createElement('button');
        btnSelect.className = 'btn-result-action btn-result-select';
        btnSelect.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btnSelect.type = 'button';
        btnSelect.title = 'Select Track';
        
        btnSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTrack(track);
        });

        const btnDownload = document.createElement('button');
        btnDownload.className = 'btn-result-action btn-result-play'; // reusing the style class
        btnDownload.innerHTML = '<i class="fa-solid fa-download"></i>';
        btnDownload.type = 'button';
        btnDownload.title = 'Download Track';
        
        btnDownload.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const originalText = btnDownload.innerHTML;
                btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                btnDownload.disabled = true;

                const response = await fetch(track.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                
                let songName = track.title ? track.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'downloaded_song';
                a.download = songName + '.mp3';
                document.body.appendChild(a);
                a.click();
                
                window.URL.revokeObjectURL(url);
                a.remove();
                
                btnDownload.innerHTML = originalText;
                btnDownload.disabled = false;
            } catch (err) {
                console.error("Failed to download audio:", err);
                window.open(track.url, '_blank');
                btnDownload.innerHTML = '<i class="fa-solid fa-download"></i>';
                btnDownload.disabled = false;
            }
        });
        
        actions.appendChild(btnPlay);
        actions.appendChild(btnDownload);
        actions.appendChild(btnSelect);
        
        item.appendChild(infoWrapper);
        item.appendChild(actions);
        
        audioResultsList.appendChild(item);
    });
}

function playSearchResultPreview(track, btn) {
    if (currentPreviewAudio) {
        currentPreviewAudio.pause();
        if (currentPreviewBtn) {
            currentPreviewBtn.classList.remove('playing');
            currentPreviewBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        
        if (currentPreviewBtn === btn) {
            currentPreviewAudio = null;
            currentPreviewBtn = null;
            return;
        }
    }
    
    if (state.audioPlaying) {
        toggleBackgroundAudio(false);
    }
    
    const audio = new Audio(track.url);
    audio.crossOrigin = "anonymous";
    audio.play().then(() => {
        btn.classList.add('playing');
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        currentPreviewAudio = audio;
        currentPreviewBtn = btn;
    }).catch(err => {
        console.error("Preview failed:", err);
        alert("Failed to play preview track. The track URL may have expired or there is a CORS/network restriction.");
    });
    
    audio.onended = () => {
        btn.classList.remove('playing');
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        currentPreviewAudio = null;
        currentPreviewBtn = null;
    };
}

function selectTrack(track) {
    if (currentPreviewAudio) {
        currentPreviewAudio.pause();
        if (currentPreviewBtn) {
            currentPreviewBtn.classList.remove('playing');
            currentPreviewBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
        currentPreviewAudio = null;
        currentPreviewBtn = null;
    }
    
    state.selectedAudio = track;
    
    selectedAudioTitle.textContent = track.title;
    selectedAudioArtist.textContent = track.artist;
    btnPlaySelected.removeAttribute('disabled');
    
    if (audioTrimContainer) {
        audioTrimContainer.classList.remove('hidden');
    }
    
    bgAudio.src = track.url;
    bgAudio.load();
    
    toggleBackgroundAudio(false);
    
    document.querySelectorAll('.audio-result-item').forEach(item => {
        const titleEl = item.querySelector('.audio-result-title');
        if (titleEl && titleEl.textContent === track.title) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function handleAudioUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    loadAudioFile(file);
}

function loadAudioFile(file) {
    const fileUrl = URL.createObjectURL(file);
    const track = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Upload",
        url: fileUrl,
        isLocal: true,
        thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop'
    };
    
    selectTrack(track);
}

function handleLoadAudioUrl() {
    const url = audioUrlInput.value.trim();
    if (!url) return;
    
    const track = {
        title: url.substring(url.lastIndexOf('/') + 1) || "Remote Audio",
        artist: "Direct Link",
        url: url,
        isRemoteLink: true,
        thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop'
    };
    
    selectTrack(track);
}

function drawVisualizer(canvasCtx, w, h) {
    if (!state.audioAnalyser) return;
    
    const bufferLength = state.audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    if (state.audioPlaying) {
        state.audioAnalyser.getByteFrequencyData(dataArray);
    }
    
    const style = state.audioVisualizerStyle;
    const color = state.audioVisualizerColor;
    const yPos = h * (state.audioVisualizerPosition / 100);
    
    canvasCtx.save();
    
    if (style === 'bars') {
        const barWidth = (w / bufferLength) * 1.5;
        let barHeight;
        let x = (w - (barWidth * bufferLength)) / 2;
        
        for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i] || 0;
            barHeight = (val / 255) * 150 * (h / 1920);
            
            canvasCtx.beginPath();
            const barX = x;
            const barY = yPos - barHeight / 2;
            const barH = Math.max(8 * (h / 1920), barHeight);
            
            canvasCtx.fillStyle = color;
            canvasCtx.shadowColor = color;
            canvasCtx.shadowBlur = 10 * (w / 1080);
            
            if (canvasCtx.roundRect) {
                canvasCtx.roundRect(barX, barY, barWidth - 4, barH, 4);
                canvasCtx.fill();
            } else {
                canvasCtx.fillRect(barX, barY, barWidth - 4, barH);
            }
            
            x += barWidth;
        }
    } else if (style === 'wave') {
        canvasCtx.beginPath();
        const sliceWidth = w / bufferLength;
        let x = 0;
        
        canvasCtx.strokeStyle = color;
        canvasCtx.shadowColor = color;
        canvasCtx.shadowBlur = 15 * (w / 1080);
        canvasCtx.lineWidth = 6 * (w / 1080);
        
        for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i] || 0;
            const amplitude = (val / 255) * 80 * (h / 1920);
            const y = yPos + Math.sin(i * 0.2 + Date.now() * 0.005) * amplitude;
            
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        canvasCtx.stroke();
    } else if (style === 'circle') {
        const centerX = w / 2;
        const centerY = yPos;
        const baseRadius = 120 * (w / 1080);
        
        canvasCtx.strokeStyle = color;
        canvasCtx.shadowColor = color;
        canvasCtx.shadowBlur = 20 * (w / 1080);
        canvasCtx.lineWidth = 5 * (w / 1080);
        
        canvasCtx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
            const val = dataArray[i] || 0;
            const offset = (val / 255) * 60 * (w / 1080);
            const angle = (i / bufferLength) * Math.PI * 2;
            const r = baseRadius + offset;
            
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
        }
        canvasCtx.closePath();
        canvasCtx.stroke();
    }
    
    canvasCtx.restore();
}

function setProcessingModalSteps(type) {
    const modalTitle = modalProcessing.querySelector('h2');
    const step1Text = document.querySelector('#pstep-1 span');
    const step2Text = document.querySelector('#pstep-2 span');
    const step3Text = document.querySelector('#pstep-3 span');
    const step4Text = document.querySelector('#pstep-4 span');
    
    if (type === 'video') {
        modalTitle.textContent = "Processing HD Video Post";
        step1Text.textContent = "Connecting high-fidelity audio channel...";
        step2Text.textContent = "Setting up canvas rendering stream (1080x1920)...";
        step3Text.textContent = "Recording audio and visualizer frames (real-time)...";
        step4Text.textContent = "Finalizing MP4 container and downloading...";
    } else {
        modalTitle.textContent = "Processing 8K HDR Post";
        step1Text.textContent = "Upscaling background to 4320x7680 pixels...";
        step2Text.textContent = "Applying high-contrast shadow overlay...";
        step3Text.textContent = "Drawing high-fidelity Devnagari typography...";
        step4Text.textContent = "Exporting final 8K JPEG asset...";
    }
}

async function handleDownloadExport() {
    if (state.exportFormat === 'video') {
        if (!state.selectedAudio) {
            alert("Please select an audio track first to export as Video!");
            return;
        }
        await handleDownloadVideo();
    } else {
        handleDownload8K();
    }
}

async function handleDownloadVideo() {
    if (state.isRecording) return;
    
    btnDownload8k.disabled = true;
    downloadSpinner.classList.remove('hidden');
    
    modalProcessing.classList.remove('hidden');
    setProcessingModalSteps('video');
    
    updateModalStep(1, 'active');
    updateModalStep(2, 'pending');
    updateModalStep(3, 'pending');
    updateModalStep(4, 'pending');
    
    initAudioContext();
    if (state.audioContext && state.audioContext.state === 'suspended') {
        await state.audioContext.resume();
    }
    
    setTimeout(() => {
        updateModalStep(1, 'completed');
        updateModalStep(2, 'active');
        
        let videoStream;
        try {
            videoStream = canvas.captureStream(30);
        } catch (e) {
            console.error("Failed to capture stream from canvas:", e);
            alert("Canvas capture is not supported in this browser.");
            resetProcessingModal();
            return;
        }
        
        let audioStream;
        if (state.audioRecorderDestination) {
            audioStream = state.audioRecorderDestination.stream;
        } else {
            console.warn("Audio destination node not found. Recording silent video.");
        }
        
        const combinedStream = new MediaStream();
        videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        if (audioStream) {
            audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
        }
        
        const mimeTypes = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4'
        ];
        let selectedMime = '';
        for (const mime of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mime)) {
                selectedMime = mime;
                break;
            }
        }
        
        if (!selectedMime) {
            alert("No supported video encoder found in your browser.");
            resetProcessingModal();
            return;
        }
        
        setTimeout(() => {
            updateModalStep(2, 'completed');
            updateModalStep(3, 'active');
            
            const chunks = [];
            let mediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(combinedStream, { mimeType: selectedMime });
            } catch (err) {
                console.error("Failed to initialize MediaRecorder:", err);
                alert("Failed to start video recording. Make sure your browser supports video exports.");
                resetProcessingModal();
                return;
            }
            
            mediaRecorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) chunks.push(e.data);
            };
            
            mediaRecorder.onstop = () => {
                state.isRecording = false;
                bgAudio.pause();
                bgAudio.currentTime = state.audioStartOffset;
                state.audioPlaying = false;
                document.getElementById('audio-widget').classList.remove('playing');
                btnPlaySelected.querySelector('i').className = 'fa-solid fa-play';
                
                updateModalStep(3, 'completed');
                updateModalStep(4, 'active');
                
                setTimeout(() => {
                    const blob = new Blob(chunks, { type: selectedMime });
                    const videoUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = videoUrl;
                    const extension = selectedMime.includes('mp4') ? 'mp4' : 'webm';
                    a.download = `tashveer_ai_video_${Date.now()}.${extension}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(videoUrl);
                    
                    updateModalStep(4, 'completed');
                    setTimeout(() => {
                        modalProcessing.classList.add('hidden');
                        btnDownload8k.disabled = false;
                        downloadSpinner.classList.add('hidden');
                    }, 500);
                }, 1000);
            };
            
            bgAudio.currentTime = state.audioStartOffset;
            bgAudio.play().then(() => {
                state.audioPlaying = true;
                document.getElementById('audio-widget').classList.add('playing');
                btnPlaySelected.querySelector('i').className = 'fa-solid fa-pause';
                
                mediaRecorder.start();
                state.isRecording = true;
                animateVisualizer();
                
                const recordingDuration = state.audioDuration;
                const startTime = Date.now();
                
                const interval = setInterval(() => {
                    if (!state.isRecording) {
                        clearInterval(interval);
                        return;
                    }
                    
                    const elapsed = (Date.now() - startTime) / 1000;
                    document.querySelector('#pstep-3 span').textContent = `Recording audio & visualizer frames (${Math.min(Math.round(recordingDuration), Math.round(elapsed))}s / ${Math.round(recordingDuration)}s)...`;
                    
                    if (elapsed >= recordingDuration) {
                        clearInterval(interval);
                        mediaRecorder.stop();
                    }
                }, 200);
            }).catch(err => {
                console.error("Playback failed during video record:", err);
                alert("Audio playback failed during recording. Verify the audio is valid and loaded.");
                resetProcessingModal();
            });
            
        }, 800);
    }, 800);
}

function resetProcessingModal() {
    modalProcessing.classList.add('hidden');
    btnDownload8k.disabled = false;
    downloadSpinner.classList.add('hidden');
    state.isRecording = false;
}
  
