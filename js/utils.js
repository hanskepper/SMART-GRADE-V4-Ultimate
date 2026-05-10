// ╔══════════════════════════════════════════════════════════╗
// ║  SMART GRADE v4.0 - UTILITY FUNCTIONS                  ║
// ║  Smart Rounding | Math | Compensation | Validation     ║
// ╚══════════════════════════════════════════════════════════╝

/*
 * SMART ROUNDING - Rounds to 2 decimal places
 * Uses mathematical rounding with epsilon correction
 */
function roundToTwo(num) {
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/*
 * ROUND TO N DECIMALS
 */
function roundTo(num, decimals) {
  if (isNaN(num) || !isFinite(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/*
 * CALCULATE AVERAGE of an array of numbers
 */
function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  const validValues = values.filter(function(v) {
    return !isNaN(v) && isFinite(v);
  });
  if (validValues.length === 0) return 0;
  return roundToTwo(validValues.reduce(function(a, b) { return a + b; }, 0) / validValues.length);
}

/*
 * CALCULATE WEIGHTED AVERAGE
 */
function calculateWeightedAverage(values, weights) {
  if (!values || !weights || values.length !== weights.length) return 0;
  var total = 0, totalWeight = 0;
  for (var i = 0; i < values.length; i++) {
    if (values[i] > 0) {
      total += values[i] * weights[i];
      totalWeight += weights[i];
    }
  }
  return totalWeight > 0 ? roundToTwo(total / totalWeight) : 0;
}

/*
 * COMPENSATION ALGORITHM
 * When a subject is removed between terms, redistribute its points
 * so the overall average stays the SAME.
 *
 * Gap = RemovedSubjectAvg - OverallAvg
 * Adjustment = Gap / RemainingCount
 * NewSubjectAvg = OldSubjectAvg + Adjustment
 */
function calculateCompensation(overallAvg, removedSubjectAvg, remainingCount) {
  if (remainingCount <= 0) return 0;
  var gap = roundToTwo(removedSubjectAvg - overallAvg);
  return roundToTwo(gap / remainingCount);
}

/*
 * GET GRADE LETTER based on average
 * A+ : 18-20
 * A  : 16-17.99
 * B+ : 14-15.99
 * B  : 12-13.99
 * C  : 10-11.99
 * D  : 8-9.99
 * F  : 0-7.99
 */
function getGradeLetter(avg) {
  if (avg >= 18) return 'A+';
  if (avg >= 16) return 'A';
  if (avg >= 14) return 'B+';
  if (avg >= 12) return 'B';
  if (avg >= 10) return 'C';
  if (avg >= 8) return 'D';
  return 'F';
}

/*
 * GET GRADE CSS CLASS based on average
 */
function getGradeClass(avg) {
  if (avg >= 14) return 'grade-A';
  if (avg >= 12) return 'grade-B';
  if (avg >= 10) return 'grade-C';
  if (avg >= 8) return 'grade-D';
  return 'grade-F';
}

/*
 * GET CURRENT TERM based on month
 * Sep-Dec = Term 1, Jan-Mar = Term 2, Apr-Jun = Term 3
 */
function getCurrentTerm() {
  var month = new Date().getMonth() + 1;
  if (month >= 9 && month <= 12) return 1;
  if (month >= 1 && month <= 3) return 2;
  return 3;
}

/*
 * VALIDATE GRADE VALUE (0-20)
 */
function isValidGrade(value) {
  return !isNaN(value) && isFinite(value) && value >= 0 && value <= 20;
}

/*
 * GENERATE UNIQUE ID based on timestamp + random
 */
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

/*
 * FORMAT NUMBER for display, returns '--' if invalid
 */
function formatNumber(num, decimals) {
  if (typeof decimals === 'undefined') decimals = 2;
  if (isNaN(num) || !isFinite(num)) return '--';
  return num.toFixed(decimals);
}

/*
 * GET GREETING based on time of day
 */
function getGreeting() {
  var h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

/*
 * FORMAT DATE to readable string (e.g. "15 Sep 2026")
 */
function formatDate(dateString) {
  if (!dateString) return '--';
  var d = new Date(dateString);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

/*
 * GET STATUS TEXT based on average
 */
function getStatusText(avg) {
  if (avg >= 16) return 'Excellent';
  if (avg >= 14) return 'Very Good';
  if (avg >= 12) return 'Good';
  if (avg >= 10) return 'Average';
  if (avg >= 8) return 'Below Average';
  return 'Needs Work';
}

/*
 * GET STATUS COLOR based on average
 */
function getStatusColor(avg) {
  if (avg >= 14) return '#2ecc71';
  if (avg >= 12) return '#3498db';
  if (avg >= 10) return '#f39c12';
  if (avg >= 8) return '#e67e22';
  return '#e74c3c';
}

/*
 * SHOW TOAST notification
 * Creates a temporary floating notification
 */
function showToast(message) {
  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '<i class="fas fa-info-circle"></i> ' + message;
  container.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

/*
 * INIT PARTICLES background animation
 */
function initParticles() {
  var container = document.getElementById('particles');
  if (!container) return;
  container.innerHTML = '';
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    var size = Math.random() * 3 + 2;
    p.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size +
      'px;background:var(--primary);border-radius:50%;left:' + (Math.random() * 100) +
      '%;top:' + (Math.random() * 100) + '%;opacity:' + (Math.random() * 0.3) +
      ';animation:floatParticle ' + (Math.random() * 15 + 10) + 's linear infinite;';
    container.appendChild(p);
  }
}

/*
 * GET SEQUENCE NUMBERS for a given term
 * Term 1 = [1,2], Term 2 = [3,4], Term 3 = [5,6]
 */
function getSequencesForTerm(termNum) {
  var start = (termNum - 1) * 2 + 1;
  return [start, start + 1];
}

/*
 * GET TERM NUMBER for a given sequence
 * Seq 1,2 = Term 1 | Seq 3,4 = Term 2 | Seq 5,6 = Term 3
 */
function getTermForSequence(seqNum) {
  return Math.ceil(seqNum / 2);
}

/* ============================================
   IMPORT/EXPORT JSON (#2)
   ============================================ */

function exportAllData(studentId) {
  var data = {
    version: '4.0',
    exportDate: new Date().toISOString(),
    student: getStudentById(studentId),
    grades: getStudentGrades(studentId),
    subjects: {
      term1: getStudentSelectedSubjects(studentId, 1),
      term2: getStudentSelectedSubjects(studentId, 2),
      term3: getStudentSelectedSubjects(studentId, 3)
    },
    coeffs: getSubjectCoefficients(studentId),
    achievements: JSON.parse(localStorage.getItem('smartgrade_achievements_' + studentId) || '[]'),
    goal: getStudentGoal(studentId),
    streak: getStudentStreak(studentId),
    compensations: getCompensations ? getCompensations(studentId) : {},
    history: JSON.parse(localStorage.getItem('smartgrade_history_' + studentId) || '[]')
  };
  return JSON.stringify(data, null, 2);
}

function importAllData(studentId, jsonString) {
  try {
    var data = JSON.parse(jsonString);
    if (!data.version) throw new Error('Invalid backup file');
    
    saveStudentGrades(studentId, data.grades || []);
    if (data.subjects) {
      saveStudentSelectedSubjects(studentId, 1, data.subjects.term1 || []);
      saveStudentSelectedSubjects(studentId, 2, data.subjects.term2 || []);
      saveStudentSelectedSubjects(studentId, 3, data.subjects.term3 || []);
    }
    if (data.coeffs) saveSubjectCoefficients(studentId, data.coeffs);
    if (data.achievements) localStorage.setItem('smartgrade_achievements_' + studentId, JSON.stringify(data.achievements));
    if (data.goal) saveStudentGoal(studentId, data.goal);
    if (data.streak) saveStudentStreak(studentId, data.streak);
    if (data.compensations && typeof saveAllComps === 'function') saveAllComps(studentId, data.compensations);
    if (data.history) localStorage.setItem('smartgrade_history_' + studentId, JSON.stringify(data.history));
    
    addHistory(studentId, 'Data imported from backup');
    return { success: true, message: 'Data restored successfully' };
  } catch(e) {
    return { success: false, message: 'Invalid backup file: ' + e.message };
  }
}

function downloadJSON(data, filename) {
  var blob = new Blob([data], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ============================================
   HISTORIQUE MODIFICATIONS (#5)
   ============================================ */

function addHistory(studentId, action) {
  var history = JSON.parse(localStorage.getItem('smartgrade_history_' + studentId) || '[]');
  history.unshift({
    action: action,
    date: new Date().toISOString(),
    timestamp: Date.now()
  });
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('smartgrade_history_' + studentId, JSON.stringify(history));
}

function getHistory(studentId, limit) {
  var history = JSON.parse(localStorage.getItem('smartgrade_history_' + studentId) || '[]');
  return limit ? history.slice(0, limit) : history;
}

/* ============================================
   NOTIFICATIONS PUSH (#11)
   ============================================ */

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        console.log('Notifications enabled');
      }
    });
  }
}

function sendLocalNotification(title, body, icon) {
  if ('Notification' in window && Notification.permission === 'granted') {
    var options = { body: body, icon: icon || 'icon.svg', badge: 'icon.svg', vibrate: [200, 100, 200] };
    new Notification(title, options);
  } else {
    showInAppNotification(title, body);
  }
}

function showInAppNotification(title, body) {
  var existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  var toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = '<i class="fas fa-bell"></i><div><div class="notif-title">' + title + '</div><div class="notif-body">' + body + '</div></div><span class="notif-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></span>';
  document.body.appendChild(toast);
  setTimeout(function() { if (toast.parentElement) toast.remove(); }, 5000);
}

function checkAndNotifyAchievements(studentId) {
  var achievements = JSON.parse(localStorage.getItem('smartgrade_achievements_' + studentId) || '[]');
  var newlyUnlocked = achievements.filter(function(a) {
    return a.unlocked && !a.notified;
  });
  
  newlyUnlocked.forEach(function(a) {
    sendLocalNotification('Badge Unlocked!', a.name + ' - ' + a.desc, 'icon.svg');
    a.notified = true;
  });
  
  localStorage.setItem('smartgrade_achievements_' + studentId, JSON.stringify(achievements));
}

function checkStreakMilestone(studentId) {
  var streak = getStudentStreak(studentId);
  var milestones = [3, 7, 15, 30];
  if (milestones.indexOf(streak.days) !== -1) {
    sendLocalNotification('Streak Milestone!', streak.days + ' day streak achieved! Keep going!', 'icon.svg');
  }
}

/* ============================================
   SYNCHRONISATION (#12)
   ============================================ */

function getSyncData(studentId) {
  return {
    studentId: studentId,
    timestamp: Date.now(),
    data: exportAllData(studentId)
  };
}

function compareSyncData(localData, remoteData) {
  if (!remoteData || !remoteData.timestamp) return 'local';
  if (remoteData.timestamp > localData.timestamp) return 'remote';
  if (remoteData.timestamp < localData.timestamp) return 'local';
  return 'same';
}

function simulateSync(studentId) {
  var syncKey = 'smartgrade_sync_' + studentId;
  var lastSync = JSON.parse(localStorage.getItem(syncKey) || 'null');
  var currentData = getSyncData(studentId);
  
  if (!lastSync) {
    localStorage.setItem(syncKey, JSON.stringify(currentData));
    addHistory(studentId, 'First synchronization completed');
    return { synced: true, message: 'First sync completed' };
  }
  
  var comparison = compareSyncData(currentData, lastSync);
  
  if (comparison === 'same') {
    return { synced: false, message: 'Already up to date' };
  }
  
  localStorage.setItem(syncKey, JSON.stringify(currentData));
  addHistory(studentId, 'Synchronization completed');
  return { synced: true, message: 'Sync completed' };
}

function showSyncStatus() {
  var student = getCurrentStudent();
  if (!student) return;
  var syncKey = 'smartgrade_sync_' + student.id;
  var lastSync = JSON.parse(localStorage.getItem(syncKey) || 'null');
  var status = document.getElementById('syncStatus');
  if (status) {
    if (lastSync) {
      status.innerHTML = '<i class="fas fa-cloud"></i> Last sync: ' + formatDate(lastSync.timestamp ? new Date(lastSync.timestamp).toISOString() : lastSync.timestamp);
    } else {
      status.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Not synced yet';
    }
  }
}