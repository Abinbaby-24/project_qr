// DOM Elements
const qrText = document.getElementById('qrText');
const qrSize = document.getElementById('qrSize');
const qrColor = document.getElementById('qrColor');
const qrBgColor = document.getElementById('qrBgColor');
const qrCodeContainer = document.getElementById('qr-code');
const downloadSection = document.getElementById('download-section');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');

// QR History array
let qrHistory = [];

// Generate QR Code
function generateQR() {
  const text = qrText.value.trim();
  const size = parseInt(qrSize.value);
  const color = qrColor.value;
  const bgColor = qrBgColor.value;

  qrCodeContainer.innerHTML = '';
  downloadSection.classList.add('hidden');

  if (!text) {
    alert('Please enter text or a URL');
    return;
  }

  // Generate QR code with options
  QRCode.toCanvas(
    document.createElement('canvas'),
    text,
    {
      width: size,
      color: {
        dark: color,
        light: bgColor
      },
      margin: 2
    },
    function (err, canvas) {
      if (err) {
        console.error(err);
        return;
      }
      
      canvas.classList.add('qr-canvas');
      qrCodeContainer.appendChild(canvas);
      downloadSection.classList.remove('hidden');
      
      // Add to history
      addToHistory(text, canvas.toDataURL());
      
      // Set up download button
      setupDownloadButton(canvas, text);
    }
  );
}

// Add QR to history
function addToHistory(text, imageData) {
  // Check if already in history
  const existingIndex = qrHistory.findIndex(item => item.text === text);
  if (existingIndex !== -1) {
    qrHistory.splice(existingIndex, 1);
  }
  
  // Add to beginning of array
  qrHistory.unshift({ text, imageData });
  
  // Keep only last 6 items
  if (qrHistory.length > 6) {
    qrHistory.pop();
  }
  
  updateHistoryUI();
}

// Update History UI
function updateHistoryUI() {
  historyList.innerHTML = '';
  
  if (qrHistory.length > 0) {
    historySection.classList.remove('hidden');
    
    qrHistory.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <img src="${item.imageData}" alt="${item.text.substring(0, 10)}" />
      `;
      
      historyItem.addEventListener('click', () => {
        qrText.value = item.text;
        generateQR();
      });
      
      historyList.appendChild(historyItem);
    });
  } else {
    historySection.classList.add('hidden');
  }
}

// Setup Download Button
function setupDownloadButton(canvas, text) {
  const downloadBtn = document.getElementById('download-btn');
  const fileTypeSelect = document.getElementById('file-type');
  
  downloadBtn.onclick = function() {
    downloadQR(canvas, text, fileTypeSelect.value);
  };
}

// Download QR Code
function downloadQR(canvas, text, format) {
  const filename = `QRCode-${text.substring(0, 15)}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  if (format === 'svg') {
    // Generate SVG download
    QRCode.toString(text, { 
      type: 'svg',
      color: {
        dark: qrColor.value,
        light: qrBgColor.value
      }
    }, function (err, svg) {
      if (err) {
        console.error(err);
        return;
      }
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filename}.svg`);
    });
  } else {
    // For PNG/JPEG formats
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const url = canvas.toDataURL(mimeType);
    triggerDownload(url, `${filename}.${format}`);
  }
}

// Trigger Download
function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load any saved history from localStorage
  const savedHistory = localStorage.getItem('qrHistory');
  if (savedHistory) {
    qrHistory = JSON.parse(savedHistory);
    updateHistoryUI();
  }
});

// Save history to localStorage when page unloads
window.addEventListener('beforeunload', () => {
  localStorage.setItem('qrHistory', JSON.stringify(qrHistory));
});