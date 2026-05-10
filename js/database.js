// ╔══════════════════════════════════════════════════════════╗
// ║  SMART GRADE v4.0 - DATABASE MANAGER                   ║
// ║  localStorage CRUD operations for all entities         ║
// ╚══════════════════════════════════════════════════════════╝

// ============================================
// 14 DEFAULT SUBJECTS (Form 4B Science)
// ============================================
var DEFAULT_SUBJECTS = [
  { id: 1,  name: "COMPUTER SCIENCES",       code: "CS",   coefficient: 5 },
  { id: 2,  name: "MATHEMATICS",             code: "MATH", coefficient: 5 },
  { id: 3,  name: "CHEMISTRY",               code: "CHM",  coefficient: 5 },
  { id: 4,  name: "HUMAN BIOLOGY",           code: "HBIO", coefficient: 5 },
  { id: 5,  name: "GEOLOGY",                 code: "GEL",  coefficient: 5 },
  { id: 6,  name: "PHYSICS",                 code: "PHY",  coefficient: 5 },
  { id: 7,  name: "ADDITIONAL MATHEMATICS",  code: "AMATH", coefficient: 5 },
  { id: 8,  name: "BIOLOGY",                 code: "BIO",  coefficient: 5 },
  { id: 9,  name: "ECONOMICS",               code: "ECO",  coefficient: 5 },
  { id: 10, name: "ENGLISH LANGUAGE",        code: "ENG",  coefficient: 5 },
  { id: 11, name: "GEOGRAPHY",               code: "GEO",  coefficient: 5 },
  { id: 12, name: "CITIZENSHIP",             code: "CIV",  coefficient: 5 },
  { id: 13, name: "FRENCH",                  code: "FR",   coefficient: 5 },
  { id: 14, name: "FOOD AND NUTRITION",      code: "FDN",  coefficient: 5 }
];

// ============================================
// STUDENTS CRUD
// ============================================

function getAllStudents() {
  var data = localStorage.getItem('smartgrade_students');
  if (!data) return [];
  try { return JSON.parse(data); } catch(e) { return []; }
}

function saveAllStudents(students) {
  localStorage.setItem('smartgrade_students', JSON.stringify(students));
}

function getStudentById(id) {
  return getAllStudents().find(function(s) { return s.id === id; });
}

function createStudentAccount(name, number, className, pin) {
  var students = getAllStudents();

  // Check if number already taken in this class
  var exists = students.some(function(s) {
    return s.class === className && s.number === number;
  });
  if (exists) {
    return { success: false, message: 'Number ' + number + ' already taken in ' + className };
  }

  var newId = students.length > 0 ? Math.max.apply(null, students.map(function(s) { return s.id; })) + 1 : 1;

  var newStudent = {
    id: newId,
    name: name,
    number: number,
    class: className,
    pin: pin,
    createdAt: new Date().toISOString()
  };

  students.push(newStudent);
  saveAllStudents(students);

  // Initialize data for new student
  saveStudentGrades(newId, []);
  saveStudentAchievements(newId, []);

  // Initialize per-term subject selections (all subjects selected by default)
  saveStudentSelectedSubjects(newId, 1, DEFAULT_SUBJECTS.map(function(s) { return s.id; }));
  saveStudentSelectedSubjects(newId, 2, DEFAULT_SUBJECTS.map(function(s) { return s.id; }));
  saveStudentSelectedSubjects(newId, 3, DEFAULT_SUBJECTS.map(function(s) { return s.id; }));

  // Initialize coefficients
  var coeffs = {};
  DEFAULT_SUBJECTS.forEach(function(s) { coeffs[s.id] = 5; });
  saveSubjectCoefficients(newId, coeffs);

  // Initialize goal
  saveStudentGoal(newId, 12);

  return { success: true, student: newStudent };
}

function deleteStudent(studentId) {
  var students = getAllStudents();
  students = students.filter(function(s) { return s.id !== studentId; });
  saveAllStudents(students);

  // Clean up all student data
  localStorage.removeItem('smartgrade_grades_' + studentId);
  localStorage.removeItem('smartgrade_achievements_' + studentId);
  localStorage.removeItem('smartgrade_selected_' + studentId + '_term1');
  localStorage.removeItem('smartgrade_selected_' + studentId + '_term2');
  localStorage.removeItem('smartgrade_selected_' + studentId + '_term3');
  localStorage.removeItem('smartgrade_coeffs_' + studentId);
  localStorage.removeItem('smartgrade_goal_' + studentId);
}

function getUsedNumbersInClass(className) {
  return getAllStudents()
    .filter(function(s) { return s.class === className; })
    .map(function(s) { return s.number; });
}

// ============================================
// CURRENT USER SESSION
// ============================================

function getCurrentStudent() {
  var data = localStorage.getItem('smartgrade_current');
  if (!data) return null;
  try {
    var parsed = JSON.parse(data);
    return getStudentById(parsed.id);
  } catch(e) { return null; }
}

function setCurrentStudent(student) {
  localStorage.setItem('smartgrade_current', JSON.stringify({
    id: student.id,
    name: student.name,
    number: student.number,
    class: student.class
  }));
}

function clearCurrentStudent() {
  localStorage.removeItem('smartgrade_current');
}

// ============================================
// GRADES CRUD
// ============================================

function getStudentGrades(studentId) {
  var data = localStorage.getItem('smartgrade_grades_' + studentId);
  if (!data) return [];
  try { return JSON.parse(data); } catch(e) { return []; }
}

function saveStudentGrades(studentId, grades) {
  localStorage.setItem('smartgrade_grades_' + studentId, JSON.stringify(grades));
}

function addGrade(studentId, subjectId, sequenceId, value) {
  var grades = getStudentGrades(studentId);

  // Check if grade already exists for this subject+sequence
  var existingIndex = grades.findIndex(function(g) {
    return g.subjectId === subjectId && g.sequenceId === sequenceId;
  });

  var roundedValue = roundToTwo(value);

  if (existingIndex !== -1) {
    grades[existingIndex].value = roundedValue;
    grades[existingIndex].date = new Date().toISOString().split('T')[0];
  } else {
    var newId = grades.length > 0 ? Math.max.apply(null, grades.map(function(g) { return g.id; })) + 1 : 1;
    grades.push({
      id: newId,
      subjectId: subjectId,
      sequenceId: sequenceId,
      value: roundedValue,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }

  saveStudentGrades(studentId, grades);
  return grades;
}

function deleteGrade(studentId, gradeId) {
  var grades = getStudentGrades(studentId);
  grades = grades.filter(function(g) { return g.id !== gradeId; });
  saveStudentGrades(studentId, grades);
  return grades;
}

// ============================================
// PER-TERM SUBJECT SELECTION
// ============================================

function getStudentSelectedSubjects(studentId, termNum) {
  var data = localStorage.getItem('smartgrade_selected_' + studentId + '_term' + termNum);
  if (!data) return DEFAULT_SUBJECTS.map(function(s) { return s.id; });
  try { return JSON.parse(data); } catch(e) { return DEFAULT_SUBJECTS.map(function(s) { return s.id; }); }
}

function saveStudentSelectedSubjects(studentId, termNum, subjectIds) {
  localStorage.setItem('smartgrade_selected_' + studentId + '_term' + termNum, JSON.stringify(subjectIds));
}

function getActiveSubjects(studentId, termNum) {
  var selectedIds = getStudentSelectedSubjects(studentId, termNum);
  return DEFAULT_SUBJECTS.filter(function(s) { return selectedIds.indexOf(s.id) !== -1; });
}

function getActiveSubjectsWithCoefficients(studentId, termNum) {
  var selectedIds = getStudentSelectedSubjects(studentId, termNum);
  return DEFAULT_SUBJECTS
    .filter(function(s) { return selectedIds.indexOf(s.id) !== -1; })
    .map(function(s) {
      s.coefficient = getSubjectCoefficient(studentId, s.id);
      return s;
    });
}

// ============================================
// SUBJECT COEFFICIENTS
// ============================================

function getSubjectCoefficients(studentId) {
  var data = localStorage.getItem('smartgrade_coeffs_' + studentId);
  if (!data) {
    var coeffs = {};
    DEFAULT_SUBJECTS.forEach(function(s) { coeffs[s.id] = 5; });
    return coeffs;
  }
  try { return JSON.parse(data); } catch(e) {
    var coeffs = {};
    DEFAULT_SUBJECTS.forEach(function(s) { coeffs[s.id] = 5; });
    return coeffs;
  }
}

function getSubjectCoefficient(studentId, subjectId) {
  var coeffs = getSubjectCoefficients(studentId);
  return coeffs[subjectId] || 5;
}

function saveSubjectCoefficients(studentId, coeffs) {
  localStorage.setItem('smartgrade_coeffs_' + studentId, JSON.stringify(coeffs));
}

// ============================================
// GRADE CALCULATIONS
// ============================================

function getSubjectSequenceAverage(subjectId, sequenceId, grades) {
  var seqGrades = grades.filter(function(g) {
    return g.subjectId === subjectId && g.sequenceId === sequenceId;
  });
  if (seqGrades.length === 0) return 0;
  return roundToTwo(seqGrades.reduce(function(a, b) { return a + b.value; }, 0) / seqGrades.length);
}

function calculateSubjectTermAverage(subjectId, termNum, grades) {
  var seq = getSequencesForTerm(termNum);
  var termGrades = grades.filter(function(g) {
    return g.subjectId === subjectId && (g.sequenceId === seq[0] || g.sequenceId === seq[1]);
  });
  if (termGrades.length === 0) return 0;
  return roundToTwo(termGrades.reduce(function(a, b) { return a + b.value; }, 0) / termGrades.length);
}

function calculateStudentTermAverage(studentId, termNum) {
  var activeSubjects = getActiveSubjectsWithCoefficients(studentId, termNum);
  var grades = getStudentGrades(studentId);
  var total = 0, totalCoeff = 0;

  activeSubjects.forEach(function(s) {
    var termAvg = calculateSubjectTermAverage(s.id, termNum, grades);
    if (termAvg > 0) {
      total += termAvg * s.coefficient;
      totalCoeff += s.coefficient;
    }
  });

  return totalCoeff > 0 ? roundToTwo(total / totalCoeff) : 0;
}

function calculateStudentOverallAverage(studentId) {
  var activeSubjects = getActiveSubjectsWithCoefficients(studentId, getCurrentTerm());
  var grades = getStudentGrades(studentId);
  var weighted = 0, totalCoeff = 0;

  activeSubjects.forEach(function(s) {
    var yearSum = 0, yearCount = 0;
    for (var seq = 1; seq <= 6; seq++) {
      var avg = getSubjectSequenceAverage(s.id, seq, grades);
      if (avg > 0) { yearSum += avg; yearCount++; }
    }
    var yearAvg = yearCount > 0 ? yearSum / yearCount : 0;
    if (yearAvg > 0) {
      weighted += yearAvg * s.coefficient;
      totalCoeff += s.coefficient;
    }
  });

  return totalCoeff > 0 ? roundToTwo(weighted / totalCoeff) : 0;
}

// ============================================
// ACHIEVEMENTS
// ============================================

var ACHIEVEMENTS = [
  { id: 1,  name: "First Grade",        desc: "Add your very first grade",              condition: "grades.length > 0" },
  { id: 2,  name: "Perfect Score",      desc: "Get 20/20 in any subject",               condition: "hasPerfectScore" },
  { id: 3,  name: "High Average",       desc: "Overall average 12/20 and above",        condition: "overall >= 12" },
  { id: 4,  name: "Bookworm",           desc: "Record 10+ grades",                       condition: "grades.length >= 10" },
  { id: 5,  name: "Dedication",         desc: "Record 30+ grades",                       condition: "grades.length >= 30" },
  { id: 6,  name: "Scholar",            desc: "Unlock 8 achievements",                   condition: "unlockedCount >= 8" },
  { id: 7,  name: "Rising Star",        desc: "Improve by 1+ point in a term",          condition: "improvement >= 1" },
  { id: 8,  name: "Unstoppable",        desc: "All 3 terms have grades entered",         condition: "allTermsHaveGrades" },
  { id: 9,  name: "Subject Completion",  desc: "Add grades in all subjects of a term",   condition: "allSubjectsComplete" },
  { id: 10, name: "Active Semester",    desc: "Complete a full term (all sequences)",    condition: "fullTermComplete" },
  { id: 11, name: "Discipline Mastery", desc: "Average above 15 in one subject",         condition: "subjectAvg >= 15" },
  { id: 12, name: "Study Progress",     desc: "Record 25+ grades",                       condition: "grades.length >= 25" },
  { id: 13, name: "Full Achievement",   desc: "Unlock ALL 13 badges (unlocks last)",     condition: "unlockedCount >= 13" },
  { id: 14, name: "Excellent Result",   desc: "Get 20/20 in a subject (rounded up)",     condition: "hasExcellentResult" }
];

var STREAK_BADGES = [
  { id: 'S1', name: "Beginner Streak",    desc: "Use the app for 3 days",    days: 3 },
  { id: 'S2', name: "Regular Streak",     desc: "Use the app for 7 days",    days: 7 },
  { id: 'S3', name: "Dedicated Streak",   desc: "Use the app for 15 days",   days: 15 },
  { id: 'S4', name: "Legendary Streak",   desc: "Use the app for 30 days",   days: 30 }
];

function getStudentAchievements(studentId) {
  var data = localStorage.getItem('smartgrade_achievements_' + studentId);
  if (!data) return [];
  try { return JSON.parse(data); } catch(e) { return []; }
}

function saveStudentAchievements(studentId, achievements) {
  localStorage.setItem('smartgrade_achievements_' + studentId, JSON.stringify(achievements));
}

// ============================================
// GOAL
// ============================================

function getStudentGoal(studentId) {
  var data = localStorage.getItem('smartgrade_goal_' + studentId);
  if (!data) return 12;
  try { return parseFloat(data); } catch(e) { return 12; }
}

function saveStudentGoal(studentId, goal) {
  localStorage.setItem('smartgrade_goal_' + studentId, goal);
}

// ============================================
// THEME & FONT
// ============================================

function getSavedTheme() {
  return localStorage.getItem('smartgrade_theme') || 'default';
}

function saveTheme(theme) {
  localStorage.setItem('smartgrade_theme', theme);
}

function getSavedFont() {
  return localStorage.getItem('smartgrade_font') || 'medium';
}

function saveFont(font) {
  localStorage.setItem('smartgrade_font', font);
}

// ============================================
// STREAK TRACKING
// ============================================

function getStudentStreak(studentId) {
  var data = localStorage.getItem('smartgrade_streak_' + studentId);
  if (!data) return { days: 0, lastLogin: null };
  try { return JSON.parse(data); } catch(e) { return { days: 0, lastLogin: null }; }
}

function saveStudentStreak(studentId, streak) {
  localStorage.setItem('smartgrade_streak_' + studentId, JSON.stringify(streak));
}

function updateStreak(studentId) {
  var streak = getStudentStreak(studentId);
  var today = new Date().toISOString().split('T')[0];

  if (!streak.lastLogin) {
    streak = { days: 1, lastLogin: today };
  } else {
    var lastDate = new Date(streak.lastLogin);
    var currentDate = new Date(today);
    var diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak.days += 1;
      streak.lastLogin = today;
    } else if (diffDays > 1) {
      streak = { days: 1, lastLogin: today };
    }
  }

  saveStudentStreak(studentId, streak);
  return streak;
}
// ╔══════════════════════════════════════════════════════════╗
// ║  STREAK AUTO-TRACKING - Background counting             ║
// ╚══════════════════════════════════════════════════════════╝

function getStudentStreak(studentId) {
  var data = localStorage.getItem('smartgrade_streak_' + studentId);
  if (!data) return { days: 0, lastLogin: null };
  try { return JSON.parse(data); } catch(e) { return { days: 0, lastLogin: null }; }
}

function saveStudentStreak(studentId, streak) {
  localStorage.setItem('smartgrade_streak_' + studentId, JSON.stringify(streak));
}

/*
 * AUTO UPDATE STREAK - Called on every page visit
 * Works in background without user action
 */
function updateStreakOnVisit(studentId) {
  if (!studentId) return;
  
  var streak = getStudentStreak(studentId);
  var today = new Date().toISOString().split('T')[0];
  
  if (!streak.lastLogin) {
    // First visit ever
    streak = { days: 1, lastLogin: today };
    saveStudentStreak(studentId, streak);
    return streak;
  }
  
  var lastDate = new Date(streak.lastLogin);
  var currentDate = new Date(today);
  var diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day, do nothing
    return streak;
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    streak.days += 1;
    streak.lastLogin = today;
    saveStudentStreak(studentId, streak);
    return streak;
  } else {
    // Missed days, reset streak
    streak = { days: 1, lastLogin: today };
    saveStudentStreak(studentId, streak);
    return streak;
  }
}

/*
 * Get streak for current user automatically
 */
function autoUpdateCurrentUserStreak() {
  var currentUser = getCurrentStudent();
  if (currentUser) {
    updateStreakOnVisit(currentUser.id);
  }
}

// ============================================
// FINGERPRINT STORAGE
// ============================================

function saveFingerprintForStudent(studentId, fingerprintHash) {
  var students = getAllStudents();
  var index = students.findIndex(function(s) { return s.id === studentId; });
  if (index !== -1) {
    students[index].fingerprintHash = fingerprintHash;
    students[index].hasFingerprint = true;
    saveAllStudents(students);
    return true;
  }
  return false;
}

// ============================================
// COMPENSATION ALGORITHM
// ============================================
function applyCompensation(studentId, termNum, removedSubjectId) {
  var grades = getStudentGrades(studentId);
  var activeSubjects = getActiveSubjectsWithCoefficients(studentId, termNum);
  var overallBefore = calculateStudentTermAverage(studentId, termNum);
  var removedAvg = calculateSubjectTermAverage(removedSubjectId, termNum, grades);
  var remainingSubjects = activeSubjects.filter(function(s) { return s.id !== removedSubjectId; });
  var remainingCount = remainingSubjects.length;
  if (remainingCount === 0) return { success: false, message: 'No remaining subjects' };
  var gap = roundToTwo(removedAvg - overallBefore);
  var adjustment = roundToTwo(gap / remainingCount);
  var seq1 = (termNum - 1) * 2 + 1;
  var seq2 = seq1 + 1;
  remainingSubjects.forEach(function(s) {
    var grade1 = grades.find(function(g) { return g.subjectId === s.id && g.sequenceId === seq1; });
    if (grade1 && grade1.value > 0) { grade1.value = roundToTwo(grade1.value + adjustment); }
    var grade2 = grades.find(function(g) { return g.subjectId === s.id && g.sequenceId === seq2; });
    if (grade2 && grade2.value > 0) { grade2.value = roundToTwo(grade2.value + adjustment); }
  });
  saveStudentGrades(studentId, grades);
  var compensations = getCompensations(studentId);
  compensations[termNum] = { applied: true, removedSubjectId: removedSubjectId, removedAvg: removedAvg, overallBefore: overallBefore, adjustment: adjustment, date: new Date().toISOString() };
  saveCompensations(studentId, compensations);
  var overallAfter = calculateStudentTermAverage(studentId, termNum);
  return { success: true, overallBefore: overallBefore, overallAfter: overallAfter, removedAvg: removedAvg, adjustment: adjustment, gap: gap };
}
function getCompensations(studentId) { var data = localStorage.getItem('smartgrade_compensations_' + studentId); if (!data) return {}; try { return JSON.parse(data); } catch(e) { return {}; } }
function saveCompensations(studentId, compensations) { localStorage.setItem('smartgrade_compensations_' + studentId, JSON.stringify(compensations)); }
function hasCompensation(studentId, termNum) { var compensations = getCompensations(studentId); return compensations[termNum] && compensations[termNum].applied; }
function getCompensationDetails(studentId, termNum) { var compensations = getCompensations(studentId); return compensations[termNum] || null; }
function removeCompensation(studentId, termNum) {
  var compensations = getCompensations(studentId);
  if (compensations[termNum]) {
    var comp = compensations[termNum];
    var grades = getStudentGrades(studentId);
    var activeSubjects = getActiveSubjectsWithCoefficients(studentId, termNum);
    var remainingCount = activeSubjects.length;
    var seq1 = (termNum - 1) * 2 + 1;
    var seq2 = seq1 + 1;
    var adjustment = comp.adjustment;
    activeSubjects.forEach(function(s) {
      var grade1 = grades.find(function(g) { return g.subjectId === s.id && g.sequenceId === seq1; });
      if (grade1 && grade1.value > 0) { grade1.value = roundToTwo(grade1.value - adjustment); }
      var grade2 = grades.find(function(g) { return g.subjectId === s.id && g.sequenceId === seq2; });
      if (grade2 && grade2.value > 0) { grade2.value = roundToTwo(grade2.value - adjustment); }
    });
    saveStudentGrades(studentId, grades);
    delete compensations[termNum];
    saveCompensations(studentId, compensations);
    return true;
  }
  return false;
}
// ============================================
// AUTO COMPENSATION SYSTEM
// ============================================

function autoDetectAndCompensate(studentId) {
  var results = [];
  var term1Subs = getStudentSelectedSubjects(studentId, 1);
  var term2Subs = getStudentSelectedSubjects(studentId, 2);
  var term3Subs = getStudentSelectedSubjects(studentId, 3);
  var counts = { 1: term1Subs.length, 2: term2Subs.length, 3: term3Subs.length };
  var minCount = Math.min(counts[1], counts[2], counts[3]);
  
  for (var t = 1; t <= 3; t++) {
    if (counts[t] > minCount) {
      var result = compensateTerm(studentId, t, minCount);
      if (result) results.push(result);
    }
  }
  
  return results.length > 0 ? { compensated: true, results: results } : { compensated: false, message: 'All terms balanced' };
}

function compensateTerm(studentId, termNum, targetCount) {
  var currentSubjects = getStudentSelectedSubjects(studentId, termNum);
  var otherTerms = [1, 2, 3].filter(function(t) { return t !== termNum; });
  var otherSubjects = getStudentSelectedSubjects(studentId, otherTerms[0]);
  
  // Trouver la matière présente dans CE trimestre mais PAS dans les autres
  var extraSubject = null;
  for (var i = 0; i < currentSubjects.length; i++) {
    var found = false;
    for (var j = 0; j < otherTerms.length; j++) {
      if (getStudentSelectedSubjects(studentId, otherTerms[j]).indexOf(currentSubjects[i]) !== -1) {
        found = true;
        break;
      }
    }
    if (!found) { extraSubject = currentSubjects[i]; break; }
  }
  
  if (!extraSubject) return null;
  
  var grades = getStudentGrades(studentId);
  var termAvg = calculateStudentTermAverage(studentId, termNum);
  var subjectAvg = calculateSubjectTermAverage(extraSubject, termNum, grades);
  var remainingCount = currentSubjects.length - 1;
  
  if (remainingCount <= 0) return null;
  
  var gap = roundToTwo(subjectAvg - termAvg);
  var adjustment = roundToTwo(gap / remainingCount);
  var seq1 = (termNum - 1) * 2 + 1;
  var seq2 = seq1 + 1;
  
  currentSubjects.forEach(function(sId) {
    if (sId !== extraSubject) {
      var g1 = grades.find(function(g) { return g.subjectId === sId && g.sequenceId === seq1; });
      if (g1 && g1.value > 0) g1.value = roundToTwo(g1.value + adjustment);
      var g2 = grades.find(function(g) { return g.subjectId === sId && g.sequenceId === seq2; });
      if (g2 && g2.value > 0) g2.value = roundToTwo(g2.value + adjustment);
    }
  });
  
  saveStudentGrades(studentId, grades);
  
  // Retirer la matière du trimestre
  var newSelection = currentSubjects.filter(function(id) { return id !== extraSubject; });
  saveStudentSelectedSubjects(studentId, termNum, newSelection);
  
  var extraSubjectName = DEFAULT_SUBJECTS.find(function(s) { return s.id === extraSubject; });
  
  return {
    termNum: termNum,
    removedSubject: extraSubjectName ? extraSubjectName.name : 'Unknown',
    termAvgBefore: termAvg,
    termAvgAfter: calculateStudentTermAverage(studentId, termNum),
    adjustment: adjustment,
    gap: gap
  };
}

function getCompensationInfo(studentId, termNum) {
  var currentSubjects = getStudentSelectedSubjects(studentId, termNum);
  var otherTerms = [1, 2, 3].filter(function(t) { return t !== termNum; });
  var allSame = true;
  for (var i = 0; i < otherTerms.length; i++) {
    if (getStudentSelectedSubjects(studentId, otherTerms[i]).length !== currentSubjects.length) {
      allSame = false;
    }
  }
  return {
    hasCompensation: !allSame,
    subjectCount: currentSubjects.length,
    otherCounts: otherTerms.map(function(t) { return getStudentSelectedSubjects(studentId, t).length; })
  };
}

function applyCompensation(studentId, termNum, subjectId) {
  var grades = getStudentGrades(studentId);
  var subjects = getActiveSubjectsWithCoefficients(studentId, termNum);
  var termAvg = calculateStudentTermAverage(studentId, termNum);
  var subjectAvg = calculateSubjectTermAverage(subjectId, termNum, grades);
  var remaining = subjects.filter(function(s) { return s.id !== subjectId; });
  if (remaining.length === 0) return { success: false, message: 'Need at least 1 remaining subject' };
  var gap = roundToTwo(subjectAvg - termAvg);
  var adj = roundToTwo(gap / remaining.length);
  var seq1 = (termNum - 1) * 2 + 1;
  var seq2 = seq1 + 1;
  var adjustments = [];
  remaining.forEach(function(s) {
    var g1 = grades.find(function(g) { return g.subjectId === s.id && g.sequenceId === seq1; });
    if (g1 && g1.value > 0) { g1.value = roundToTwo(g1.value + adj); adjustments.push({ subjectId: s.id, name: s.name, adjustment: adj, newValue: g1.value, seq: seq1 }); }
    var g2 = grades.find(function(g) { return g.subjectId === s.id && g.sequenceId === seq2; });
    if (g2 && g2.value > 0) { g2.value = roundToTwo(g2.value + adj); adjustments.push({ subjectId: s.id, name: s.name, adjustment: adj, newValue: g2.value, seq: seq2 }); }
  });
  saveStudentGrades(studentId, grades);
  var newSelection = getStudentSelectedSubjects(studentId, termNum).filter(function(id) { return id !== subjectId; });
  saveStudentSelectedSubjects(studentId, termNum, newSelection);
  var compData = { termNum: termNum, removedSubjectId: subjectId, removedAvg: subjectAvg, termAvgBefore: termAvg, termAvgAfter: calculateStudentTermAverage(studentId, termNum), adjustment: adj, date: new Date().toISOString(), adjustments: adjustments };
  var comps = getAllComps(studentId);
  comps[termNum] = compData;
  saveAllComps(studentId, comps);
  return { success: true, data: compData };
}

function getAllComps(studentId) { var d = localStorage.getItem('smartgrade_comps_' + studentId); return d ? JSON.parse(d) : {}; }
function saveAllComps(studentId, comps) { localStorage.setItem('smartgrade_comps_' + studentId, JSON.stringify(comps)); }
function getCompData(studentId, termNum) { var c = getAllComps(studentId); return c[termNum] || null; }
function removeComp(studentId, termNum) { var c = getAllComps(studentId); if (c[termNum]) { delete c[termNum]; saveAllComps(studentId, c); return true; } return false; }

function getSubjectsWithComp(studentId, termNum) {
  var comp = getCompData(studentId, termNum);
  if (!comp) return [];
  var map = {};
  comp.adjustments.forEach(function(a) {
    if (!map[a.subjectId]) map[a.subjectId] = { name: a.name, adjustment: a.adjustment, seqs: [] };
    map[a.subjectId].seqs.push(a.seq);
  });
  return Object.values(map);
}

/* ============================================
   HISTORIQUE AUTOMATIQUE
   ============================================ */
var originalSaveGrades = saveStudentGrades;
saveStudentGrades = function(studentId, grades) {
  addHistory(studentId, 'Grades updated (' + grades.length + ' total)');
  return originalSaveGrades(studentId, grades);
};

var originalSaveSelected = saveStudentSelectedSubjects;
saveStudentSelectedSubjects = function(studentId, termNum, subjects) {
  addHistory(studentId, 'Term ' + termNum + ' subjects updated (' + subjects.length + ' subjects)');
  return originalSaveSelected(studentId, termNum, subjects);
};

var originalSaveCoeffs = saveSubjectCoefficients;
saveSubjectCoefficients = function(studentId, coeffs) {
  addHistory(studentId, 'Coefficients updated');
  return originalSaveCoeffs(studentId, coeffs);
};

function addHistory(studentId, action) {
  if (typeof addHistory === 'undefined') return;
  var history = JSON.parse(localStorage.getItem('smartgrade_history_' + studentId) || '[]');
  history.unshift({ action: action, date: new Date().toISOString(), timestamp: Date.now() });
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('smartgrade_history_' + studentId, JSON.stringify(history));
}