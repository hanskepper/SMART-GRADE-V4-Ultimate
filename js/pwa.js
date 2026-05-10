var deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  var prompt = document.getElementById('installPrompt');
  if (prompt) prompt.classList.add('show');
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') {
        if (typeof showToast === 'function') showToast('App installed!');
      }
      deferredPrompt = null;
    });
    var prompt = document.getElementById('installPrompt');
    if (prompt) prompt.classList.remove('show');
  } else {
    // Fallback pour navigateurs sans beforeinstallprompt
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      alert('Install on iOS:\n1. Tap the Share button\n2. Scroll down\n3. Tap "Add to Home Screen"');
    } else if (isAndroid) {
      alert('Install on Android:\n1. Open Chrome menu (3 dots)\n2. Tap "Add to Home Screen"\n\nOr use Settings > Build APK');
    } else {
      alert('Install:\n1. Open browser menu\n2. Look for "Install" or "Add to Home Screen"');
    }
  }
}

function buildAPK() {
  var student = getCurrentStudent ? getCurrentStudent() : null;
  if (!student) {
    if (typeof showToast === 'function') showToast('Please login first');
    return;
  }
  
  var buildData = [
    'SMART GRADE v4.0 - APK BUILD',
    '===============================',
    '',
    'Student: ' + student.name,
    'Class: ' + student.class + ' | Number: ' + student.number,
    'Date: ' + new Date().toLocaleString(),
    '',
    'INSTALL ON ANDROID:',
    '1. Open Chrome > Menu > Add to Home Screen',
    '2. OR visit pwabuilder.com',
    '3. Enter: https://hanskepper.github.io/SMART-GRADE/',
    '4. Download APK > Install',
    '',
    'INSTALL ON iOS:',
    '1. Open Safari > Share > Add to Home Screen',
    '',
    'INSTALL ON WINDOWS/MAC:',
    '1. Open Edge/Chrome > Menu > Apps > Install',
    '',
    'Contact: hanskepper52@gmail.com',
    '+237 698 640 885'
  ].join('\n');
  
  var blob = new Blob([buildData], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'SMART_GRADE_Install_' + student.number + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  if (typeof showToast === 'function') showToast('Instructions downloaded!');
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/SMART-GRADE/sw.js')
      .then(function(reg) { console.log('SW registered'); })
      .catch(function(err) { console.log('SW failed:', err); });
  }
}

function initPWA() {
  registerServiceWorker();
  if (window.matchMedia('(display-mode: standalone)').matches) {
    var prompt = document.getElementById('installPrompt');
    if (prompt) prompt.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', function() { initPWA(); });