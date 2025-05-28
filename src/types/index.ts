export type UserRole = 'student' | 'hod' | 'placement' | 'principal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  year?: number;
  studentId?: string;
  hasResume?: boolean;
  resumeLastUpdated?: string;
  skills?: string[];
}

export interface PlacementDrive {
  id: string;
  company: string;
  position: string;
  eligibility: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  location: string;
  package: string;
}

export interface SkillGap {
  id: string;
  studentId: string;
  skill: string;
  currentLevel: number;
  targetLevel: number;
  plan: string;
}

export interface Mentorship {
  id: string;
  studentId: string;
  mentorId: string;
  mentorName: string;
  status: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface Query {
  id: string;
  from: string;
  to: UserRole;
  subject: string;
  message: string;
  date: string;
  status: 'open' | 'closed' | 'in-progress';
  response?: string;
}

export interface Preference {
  id: string;
  userId: string;
  notificationEmail: boolean;
  darkMode: boolean;
  language: 'en' | 'hi' | 'te' | 'ta';
}

// Dashboard-specific types
export interface PlacementData {
  id?: string;
  name: string;
  students: number;
  placed: number;
  offers: number;
}

export interface SkillData {
  id?: string;
  name: string;
  target: number;
  current: number;
}
