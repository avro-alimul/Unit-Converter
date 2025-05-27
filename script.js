// Language translations
const translations = {
    en: {
        title: "Unit Converter",
        category: "Category",
        convert: "Convert",
        result: "Result",
        history: "Conversion History",
        export: "Export History",
        import: "Import History",
        categories: {
            length: "Length",
            weight: "Weight",
            temperature: "Temperature",
            time: "Time"
        },
        units: {
            meters: "Meters",
            feet: "Feet",
            kilometers: "Kilometers",
            miles: "Miles",
            kilograms: "Kilograms",
            pounds: "Pounds",
            grams: "Grams",
            ounces: "Ounces",
            celsius: "Celsius",
            fahrenheit: "Fahrenheit",
            kelvin: "Kelvin",
            seconds: "Seconds",
            minutes: "Minutes",
            hours: "Hours"
        }
    },
    bn: {
        title: "ইউনিট কনভার্টার",
        category: "বিভাগ",
        convert: "রূপান্তর করুন",
        result: "ফলাফল",
        history: "রূপান্তর ইতিহাস",
        export: "ইতিহাস সংরক্ষণ করুন",
        import: "ইতিহাস আমদানি করুন",
        categories: {
            length: "দৈর্ঘ্য",
            weight: "ওজন",
            temperature: "তাপমাত্রা",
            time: "সময়"
        },
        units: {
            meters: "মিটার",
            feet: "ফুট",
            kilometers: "কিলোমিটার",
            miles: "মাইল",
            kilograms: "কিলোগ্রাম",
            pounds: "পাউন্ড",
            grams: "গ্রাম",
            ounces: "আউন্স",
            celsius: "সেলসিয়াস",
            fahrenheit: "ফারেনহাইট",
            kelvin: "কেলভিন",
            seconds: "সেকেন্ড",
            minutes: "মিনিট",
            hours: "ঘন্টা"
        }
    }
};

// Unit conversion factors
const units = {
    length: {
        meters: 1,
        feet: 3.28084,
        kilometers: 0.001,
        miles: 0.000621371
    },
    weight: {
        kilograms: 1,
        pounds: 2.20462,
        grams: 1000,
        ounces: 35.274
    },
    time: {
        seconds: 1,
        minutes: 1/60,
        hours: 1/3600
    }
};

// DOM Elements
const languageSelect = document.getElementById('language');
const categorySelect = document.getElementById('category');
const fromUnitSelect = document.getElementById('fromUnit');
const toUnitSelect = document.getElementById('toUnit');
const inputValue = document.getElementById('inputValue');
const convertBtn = document.getElementById('convertBtn');
const resultDiv = document.getElementById('result');
const historyList = document.getElementById('historyList');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const copyBtn = document.getElementById('copyBtn');

// State
let currentLang = 'en';
let history = [];

// Initialize the application
function init() {
    updateLanguage();
    updateUnitOptions();
    setupEventListeners();
}

// Update language across the UI
function updateLanguage() {
    const lang = translations[currentLang];
    
    // Update text content
    document.getElementById('title').textContent = lang.title;
    document.getElementById('categoryLabel').textContent = lang.category;
    document.getElementById('convertText').textContent = lang.convert;
    document.getElementById('historyTitle').textContent = lang.history;
    document.getElementById('exportText').textContent = lang.export;
    document.getElementById('importText').textContent = lang.import;

    // Update category options
    categorySelect.innerHTML = Object.entries(lang.categories)
        .map(([value, text]) => `<option value="${value}">${text}</option>`)
        .join('');

    // Update unit options
    updateUnitOptions();
}

// Update unit options based on selected category
function updateUnitOptions() {
    const category = categorySelect.value;
    const lang = translations[currentLang];
    
    let unitOptions = '';
    
    if (category === 'temperature') {
        unitOptions = ['celsius', 'fahrenheit', 'kelvin']
            .map(unit => `<option value="${unit}">${lang.units[unit]}</option>`)
            .join('');
    } else {
        unitOptions = Object.keys(units[category])
            .map(unit => `<option value="${unit}">${lang.units[unit]}</option>`)
            .join('');
    }
    
    fromUnitSelect.innerHTML = unitOptions;
    toUnitSelect.innerHTML = unitOptions;
}

// Convert temperature
function convertTemperature(value, from, to) {
    let celsius;
    
    // Convert to Celsius first
    switch (from) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
    }
    
    // Convert from Celsius to target unit
    switch (to) {
        case 'celsius':
            return celsius;
        case 'fahrenheit':
            return (celsius * 9/5) + 32;
        case 'kelvin':
            return celsius + 273.15;
    }
}

// Perform conversion
function convert() {
    const value = parseFloat(inputValue.value);
    if (isNaN(value)) {
        resultDiv.textContent = translations[currentLang].result + ': Invalid input';
        return;
    }

    const category = categorySelect.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    
    let result;
    
    if (category === 'temperature') {
        result = convertTemperature(value, fromUnit, toUnit);
    } else {
        const fromFactor = units[category][fromUnit];
        const toFactor = units[category][toUnit];
        result = value * (toFactor / fromFactor);
    }
    
    // Format result
    result = result.toFixed(4);
    resultDiv.textContent = `${value} ${fromUnit} = ${result} ${toUnit}`;
    
    // Add to history
    addToHistory(value, fromUnit, toUnit, result);
}

// Add conversion to history
function addToHistory(value, fromUnit, toUnit, result) {
    const entry = {
        timestamp: new Date().toISOString(),
        value,
        fromUnit,
        toUnit,
        result
    };
    
    history.unshift(entry);
    updateHistoryUI();
}

// Update history UI
function updateHistoryUI() {
    const lang = translations[currentLang];
    historyList.innerHTML = history
        .slice(0, 10) // Show only last 10 entries
        .map(entry => `
            <li>
                <span>${entry.value} ${entry.fromUnit} → ${entry.result} ${entry.toUnit}</span>
                <small>${new Date(entry.timestamp).toLocaleString()}</small>
            </li>
        `)
        .join('');
}

// Export history to JSON
function exportHistory() {
    const blob = new Blob([JSON.stringify(history)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversion-history.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Import history from JSON
function importHistory(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedHistory = JSON.parse(e.target.result);
            history = importedHistory;
            updateHistoryUI();
        } catch (error) {
            alert('Error importing history file');
        }
    };
    reader.readAsText(file);
}

// Copy result to clipboard
function copyResult() {
    const text = resultDiv.textContent;
    if (text) {
        navigator.clipboard.writeText(text)
            .then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    }
}

// Setup event listeners
function setupEventListeners() {
    languageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        updateLanguage();
    });

    categorySelect.addEventListener('change', updateUnitOptions);
    
    convertBtn.addEventListener('click', convert);
    
    exportBtn.addEventListener('click', exportHistory);
    
    importFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importHistory(e.target.files[0]);
        }
    });
    
    copyBtn.addEventListener('click', copyResult);
    
    // Auto-convert on input change
    inputValue.addEventListener('input', () => {
        if (inputValue.value) {
            convert();
        }
    });
}

// Initialize the application
init(); 