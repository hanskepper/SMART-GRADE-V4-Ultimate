function authenticateWithPin(studentId, pin) {
  var student = getStudentById(studentId);
  if (!student) return { success: false, message: 'Account not found' };
  if (student.pin !== pin) return { success: false, message: 'Incorrect PIN' };
  setCurrentStudent(student);
  updateStreakOnVisit(student.id);
  return { success: true, student: student };
}

function changePin(studentId, oldPin, newPin) {
  var student = getStudentById(studentId);
  if (!student) return { success: false, message: 'Account not found' };
  if (student.pin !== oldPin) return { success: false, message: 'Incorrect current PIN' };
  if (!newPin || newPin.length !== 4 || !/^\d+$/.test(newPin)) return { success: false, message: 'PIN must be 4 digits' };
  var students = getAllStudents();
  var index = students.findIndex(function(s) { return s.id === studentId; });
  if (index !== -1) { students[index].pin = newPin; saveAllStudents(students); }
  return { success: true };
}

function logout() { clearCurrentStudent(); window.location.href = 'index.html'; }

function requireAuth() {
  var currentUser = getCurrentStudent();
  if (!currentUser) { window.location.href = 'login.html'; return null; }
  return currentUser;
}

function isBiometricAvailable() {
  return typeof PublicKeyCredential !== 'undefined' && typeof window.crypto !== 'undefined' && typeof window.crypto.subtle !== 'undefined';
}

function registerFingerprint(studentId, studentName, callback) {
  if (!isBiometricAvailable()) {
    callback({ success: false, message: 'Biometric not available. Use HTTPS or localhost.' });
    return;
  }

  var challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  var createOptions = {
    challenge: challenge,
    rp: { name: 'SMART GRADE', id: window.location.hostname },
    user: {
      id: new TextEncoder().encode(studentId.toString()),
      name: studentName.split(' ')[0].toLowerCase(),
      displayName: studentName
    },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    timeout: 120000,
    attestation: 'none',
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' }
  };

  navigator.credentials.create({ publicKey: createOptions })
    .then(function(credential) {
      var rawId = btoa(String.fromCharCode.apply(null, new Uint8Array(credential.rawId)));
      saveFingerprintForStudent(studentId, rawId);
      callback({ success: true, message: 'Fingerprint registered successfully!' });
    })
    .catch(function(err) {
      callback({ success: false, message: 'Registration cancelled or failed. Try again.' });
    });
}

function loginWithFingerprint(callback) {
  if (!isBiometricAvailable()) {
    callback({ success: false, message: 'Biometric not available. Use HTTPS.' });
    return;
  }

  var studentsWithFP = getAllStudents().filter(function(s) { return s.hasFingerprint && s.fingerprintHash; });

  if (studentsWithFP.length === 0) {
    callback({ success: false, message: 'No fingerprint accounts. Create one first.' });
    return;
  }

  var challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  var allowCredentials = studentsWithFP.map(function(s) {
    return { id: Uint8Array.from(atob(s.fingerprintHash), function(c) { return c.charCodeAt(0); }).buffer, type: 'public-key' };
  });

  var getOptions = {
    challenge: challenge,
    allowCredentials: allowCredentials,
    timeout: 120000,
    userVerification: 'required',
    rpId: window.location.hostname
  };

  navigator.credentials.get({ publicKey: getOptions })
    .then(function(assertion) {
      var rawId = btoa(String.fromCharCode.apply(null, new Uint8Array(assertion.rawId)));
      var matched = studentsWithFP.find(function(s) { return s.fingerprintHash === rawId; });
      if (matched) {
        setCurrentStudent(matched);
        updateStreakOnVisit(matched.id);
        callback({ success: true, student: matched });
      } else {
        callback({ success: false, message: 'Fingerprint not recognized.' });
      }
    })
    .catch(function(err) {
      callback({ success: false, message: 'Authentication failed. Use PIN.' });
    });
}

function removeFingerprint(studentId) {
  var students = getAllStudents();
  var index = students.findIndex(function(s) { return s.id === studentId; });
  if (index !== -1) { delete students[index].fingerprintHash; students[index].hasFingerprint = false; saveAllStudents(students); return true; }
  return false;
}