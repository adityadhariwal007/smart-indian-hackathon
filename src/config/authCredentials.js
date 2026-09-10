/**
 * Centralized Authentication Credentials Configuration
 * 
 * ONLY 3 PREDEFINED ACCOUNTS:
 * 1. aditya  - Aditya@123
 * 2. palakshi - Palakshi@123
 * 3. arnav   - Arnav@123
 * 
 * Each of these users can log in as either Doctor OR Admin.
 * The selected role during login determines which dashboard they enter.
 */

export const AUTH_ACCOUNTS = [
  {
    username: 'aditya',
    password: 'Aditya@123',
    name: 'Aditya Dhariwal',
    email: 'aditya@healthflow.in',
    phone: '+91-98765-43210',
    doctorProfile: {
      title: 'Dr. Aditya Dhariwal',
      specialization: 'Emergency Medicine & Trauma Surgery',
      department: 'Emergency & Trauma Services',
      department_id: 1,
      hospital_id: 1,
      hospital_name: 'Government Medical College & Rajindra Hospital',
      experience: 12,
      regNumber: 'PMC-48910 (Punjab Medical Council)',
      qualifications: ['MBBS', 'MS (Trauma Surgery)', 'FACEE'],
      room: 'Chamber 101, Trauma Bay A',
      avatar: null,
    },
    adminProfile: {
      title: 'Aditya Dhariwal',
      designation: 'Chief Hospital Operations Officer',
      hospital_id: 1,
      hospital_name: 'Government Medical College & Rajindra Hospital',
      permissions: ['beds', 'trips', 'doctors', 'departments', 'analytics'],
      avatar: null,
    }
  },
  {
    username: 'palakshi',
    password: 'Palakshi@123',
    name: 'Palakshi Sharma',
    email: 'palakshi@healthflow.in',
    phone: '+91-98765-43211',
    doctorProfile: {
      title: 'Dr. Palakshi Sharma',
      specialization: 'Cardiology & Critical Care',
      department: 'Cardiology',
      department_id: 2,
      hospital_id: 1,
      hospital_name: 'Government Medical College & Rajindra Hospital',
      experience: 14,
      regNumber: 'PMC-51204 (Punjab Medical Council)',
      qualifications: ['MBBS', 'MD (Internal Medicine)', 'DM (Cardiology)'],
      room: 'Chamber 204, OPD Block B',
      avatar: null,
    },
    adminProfile: {
      title: 'Palakshi Sharma',
      designation: 'Director of Clinical Administration',
      hospital_id: 1,
      hospital_name: 'Government Medical College & Rajindra Hospital',
      permissions: ['beds', 'trips', 'doctors', 'departments', 'analytics'],
      avatar: null,
    }
  },
  {
    username: 'arnav',
    password: 'Arnav@123',
    name: 'Arnav Gupta',
    email: 'arnav@healthflow.in',
    phone: '+91-98765-43212',
    doctorProfile: {
      title: 'Dr. Arnav Gupta',
      specialization: 'Internal Medicine & Critical Triage',
      department: 'Internal Medicine',
      department_id: 3,
      hospital_id: 1,
      hospital_name: 'Government Medical College & Rajindra Hospital',
      experience: 10,
      regNumber: 'PMC-39872 (Punjab Medical Council)',
      qualifications: ['MBBS', 'MD (General Medicine)', 'FICCM'],
      room: 'Chamber 302, OPD Block C',
      avatar: null,
    },
    adminProfile: {
      title: 'Arnav Gupta',
      designation: 'Head of Emergency Resource Dispatch',
      hospital_id: 1,
      hospital_name: 'Government Medical College & Rajindra Hospital',
      permissions: ['beds', 'trips', 'doctors', 'departments', 'analytics'],
      avatar: null,
    }
  }
];

/**
 * Validates staff login credentials against the 3 predefined accounts
 * @param {string} username 
 * @param {string} password 
 * @param {'doctor'|'admin'} role 
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function authenticateStaff(username, password, role) {
  if (!username || !username.trim()) {
    return { success: false, error: 'Please enter your username.' };
  }

  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  // Find user by username
  const account = AUTH_ACCOUNTS.find(acc => acc.username.toLowerCase() === cleanUser);

  if (!account) {
    return { 
      success: false, 
      error: 'Invalid username. Only authorized accounts (aditya, palakshi, arnav) are permitted.' 
    };
  }

  if (account.password !== cleanPass) {
    return { 
      success: false, 
      error: 'Incorrect password. Please verify your password and try again.' 
    };
  }

  if (role !== 'doctor' && role !== 'admin') {
    return { 
      success: false, 
      error: 'Please select whether you are logging in as a Doctor or an Admin.' 
    };
  }

  // Construct authenticated session user object
  const isDoctor = role === 'doctor';
  const profile = isDoctor ? account.doctorProfile : account.adminProfile;

  const sessionUser = {
    id: account.username,
    username: account.username,
    name: profile.title || account.name,
    email: account.email,
    phone: account.phone,
    role: role,
    isGuest: false,
    ...profile,
    authenticatedAt: new Date().toISOString()
  };

  return {
    success: true,
    user: sessionUser
  };
}

export default AUTH_ACCOUNTS;
