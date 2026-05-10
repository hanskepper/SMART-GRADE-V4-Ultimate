var THEMES = [
  { name: 'default', color: '#0f3b48', label: 'Deep Teal' },
  { name: 'crimson', color: '#c0392b', label: 'Crimson' },
  { name: 'forest', color: '#1e8449', label: 'Forest' },
  { name: 'ocean', color: '#006994', label: 'Ocean' },
  { name: 'royal', color: '#6c3483', label: 'Royal' },
  { name: 'sunset', color: '#d35400', label: 'Sunset' },
  { name: 'rose', color: '#c44569', label: 'Rose' },
  { name: 'turquoise', color: '#00897b', label: 'Turquoise' },
  { name: 'amber', color: '#b7950b', label: 'Amber' },
  { name: 'graphite', color: '#455a64', label: 'Graphite' },
  { name: 'lavender', color: '#7b1fa2', label: 'Lavender' },
  { name: 'cherry', color: '#b71c1c', label: 'Cherry' },
  { name: 'midnight', color: '#1a237e', label: 'Midnight' },
  { name: 'mint', color: '#00b894', label: 'Mint' },
  { name: 'coral', color: '#e74c3c', label: 'Coral' },
  { name: 'indigo', color: '#283593', label: 'Indigo' },
  { name: 'chocolate', color: '#5d4037', label: 'Chocolate' },
  { name: 'electric', color: '#6a1b9a', label: 'Electric' },
  { name: 'steel', color: '#37474f', label: 'Steel' },
  { name: 'lime', color: '#558b2f', label: 'Lime' }
];

(function initApp() {
  var styleSheet = document.createElement('style');
  styleSheet.textContent = '@keyframes floatParticle{0%{transform:translateY(100vh) rotate(0deg);opacity:0}10%{opacity:0.5}90%{opacity:0.3}100%{transform:translateY(-20vh) rotate(360deg);opacity:0}}';
  document.head.appendChild(styleSheet);

  var savedTheme = localStorage.getItem('smartgrade_theme') || 'default';
  document.body.classList.add('theme-' + savedTheme);
  var savedFont = localStorage.getItem('smartgrade_font') || 'medium';
  document.body.classList.add('font-' + savedFont);

  checkNightMode();
  initParticles();
  initThemeSelector();
  initMobileMenu();
  autoUpdateCurrentUserStreak();

  var currentUser = getCurrentStudent();
  if (currentUser) {
    requestNotificationPermission();
    checkAndNotifyAchievements(currentUser.id);
    checkStreakMilestone(currentUser.id);
  }

  if (typeof initPWA === 'function') initPWA();
})();

setInterval(checkNightMode, 60000);

function checkNightMode() {
  var hour = new Date().getHours();
  if (hour >= 18 || hour < 6) { document.body.classList.add('night-mode'); }
  else { document.body.classList.remove('night-mode'); }
}

function initThemeSelector() {
  var container = document.getElementById('themeGrid');
  if (!container) return;
  var savedTheme = localStorage.getItem('smartgrade_theme') || 'default';
  container.innerHTML = THEMES.map(function(t) {
    return '<div class="theme-rect ' + (savedTheme === t.name ? 'active' : '') + '" data-theme="' + t.name + '" style="background:' + t.color + ';" title="' + t.label + '">' + t.label + '</div>';
  }).join('');

  document.querySelectorAll('.theme-rect').forEach(function(rect) {
    rect.addEventListener('click', function() {
      var theme = this.dataset.theme;
      document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
      document.body.classList.add('theme-' + theme);
      localStorage.setItem('smartgrade_theme', theme);
      document.querySelectorAll('.theme-rect').forEach(function(r) { r.classList.remove('active'); });
      this.classList.add('active');
      checkNightMode();
      showToast('Theme: ' + theme);
      closeBottomSheet();
    });
  });

  var savedFont = localStorage.getItem('smartgrade_font') || 'medium';
  document.querySelectorAll('.font-sheet').forEach(function(opt) {
    if (opt.dataset.font === savedFont) opt.classList.add('active');
    opt.addEventListener('click', function() {
      var font = this.dataset.font;
      localStorage.setItem('smartgrade_font', font);
      document.body.classList.remove('font-small', 'font-medium', 'font-large');
      document.body.classList.add('font-' + font);
      document.querySelectorAll('.font-sheet').forEach(function(o) { o.classList.remove('active'); });
      this.classList.add('active');
      showToast('Font: ' + font);
    });
  });

  var themeBtn = document.getElementById('themeBtn');
  var bottomSheet = document.getElementById('bottomSheet');
  var sheetOverlay = document.getElementById('sheetOverlay');
  var closeSheet = document.getElementById('closeSheet');

  if (themeBtn && bottomSheet && sheetOverlay) {
    themeBtn.onclick = function() { bottomSheet.classList.add('open'); sheetOverlay.classList.add('active'); };
    var closeFn = function() { bottomSheet.classList.remove('open'); sheetOverlay.classList.remove('active'); };
    if (closeSheet) closeSheet.onclick = closeFn;
    sheetOverlay.onclick = closeFn;
    window.closeBottomSheet = closeFn;
  }
}

function initMobileMenu() {
  var menuBtn = document.getElementById('menuBtn');
  var closeBtn = document.getElementById('closeSidebar');
  var sidebar = document.getElementById('sidebarMenu');
  var overlay = document.getElementById('overlay');
  if (menuBtn && sidebar && overlay) {
    menuBtn.onclick = function() { sidebar.classList.add('open'); overlay.classList.add('active'); };
    var closeFn = function() { sidebar.classList.remove('open'); overlay.classList.remove('active'); };
    if (closeBtn) closeBtn.onclick = closeFn;
    overlay.onclick = closeFn;
  }
}

function playClickSound() {
  try { var a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='); a.volume=0.3; a.play().catch(function(){}); } catch(e) {}
}
function vibrate(pattern) { if (typeof navigator.vibrate === 'function') navigator.vibrate(pattern || 50); }
function playActionFeedback() { playClickSound(); vibrate(30); }

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.btn, .term-card, .subject-card, .theme-rect, .font-sheet, .nav-item, .term-tab').forEach(function(el) {
    el.addEventListener('click', function() { playClickSound(); });
  });
});

var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); deferredPrompt = e; var p = document.getElementById('installPrompt'); if (p) p.classList.add('show'); });
function installApp() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.then(function(r) { if (r.outcome === 'accepted') showToast('App installed!'); deferredPrompt = null; }); var p = document.getElementById('installPrompt'); if (p) p.classList.remove('show'); }
  else { alert('Open browser menu > Add to Home Screen'); }
}