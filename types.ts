
export enum Role {
  USER = 'user',
  PATIENT = 'patient',
  SYSTEM = 'system',
  TUTOR = 'tutor'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isResult?: boolean; // True if it's a test result/exam finding
  timestamp: number;
}

export interface CaseDetails {
  title: string;
  patientInfo: string; // "Male, 65 years old"
  chiefComplaint: string;
  history: string;
  physicalExam: string;
  labsAndImaging: string;
  diagnosis: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  specialty?: string;
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  CASE_STUDIO = 'CASE_STUDIO',
  SIMULATION = 'SIMULATION',
  REVIEW = 'REVIEW',
  LOADING = 'LOADING'
}

export type AIProvider = 'gemini' | 'siliconflow' | 'doubao' | 'qwen';
export type Language = 'en' | 'zh';
export type Theme = 'cyan-dark' | 'emerald-dark' | 'rose-dark' | 'blue-light';

export interface AIConfig {
  provider: AIProvider;
  patientModel: string; // Model for simulation chat
  tutorModel: string;   // Model for evaluation and expert tasks
  apiKey: string;
  baseUrl?: string;
}

// HIS System Types
export interface MedicalRecord {
  history: {
    chiefComplaint: string;
    hpi: string; // History of Present Illness
  };
  orders: string[]; // List of ordered tests
  diagnosis: string;
  plan: string;
}

export interface EvaluationResult {
  score: number;
  breakdown: {
    history: number;
    exams: number;
    diagnosis: number;
  };
  missed: string[];
  feedback: string;
  goldStandard: string;
}

// Patient Monitor Types
export type UrgencyLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface VitalsData {
  HR: number;
  BP: string;
  SpO2: number;
  RR: number;
  Temp: number;
  Pain: number; // 0-10 scale
}

// Dynamic Visual Engine Types
export interface Demographics {
  gender: "Male" | "Female";
  age_group: "Child" | "Young_Adult" | "Middle_Aged" | "Elderly";
  build: "Thin" | "Normal" | "Obese";
}

export interface VisualState {
  // CNS & Expression
  consciousness: "Alert" | "Drowsy" | "Comatose" | "Agitated" | "Confused";
  facial_expression: "Neutral" | "Pain_Grimace" | "Anxious_WideEyed" | "Slack" | "Dyspneic_Gasp";
  eye_contact: "Direct" | "Avoidant" | "Fixed" | "Closed";
  
  // Skin & Trauma
  skin_color: "Normal" | "Pale" | "Flushed" | "Cyanotic" | "Jaundiced" | "Mottled";
  skin_moisture: "Dry" | "Diaphoretic" | "Clammy";
  visible_trauma: "None" | "Bleeding_Head" | "Bruised_Chest" | "Swollen_Limb";

  // Posture & Devices
  posture: "Supine" | "Tripod" | "Clutching_Chest" | "Curled_Up" | "Slumped";
  equipment: ("Nasal_Cannula" | "Oxygen_Mask" | "Neck_Brace" | "Intubated" | "IV_Line")[];
}

export interface MonitorState {
  monitor_text: string; // Short summary text "Patient is clutching chest..."
  visual_state: VisualState;
  urgency: UrgencyLevel;
  vitals: VitalsData;
  demographics?: Demographics; // Set on init
}

// Physical Exam Types (Module 3)
export type ExamTool = 'None' | 'Stethoscope' | 'Flashlight' | 'Palpation';
export type BodyLocation = 'Head' | 'Chest' | 'Abdomen' | 'Extremities';
