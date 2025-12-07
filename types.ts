export interface VitalSigns {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  isResponsive: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface EmergencyStatus {
  isCritical: boolean;
  statusMessage: string;
  trigger: 'unresponsive' | 'hr' | 'bp' | null;
}

export interface MedicalHistory {
  name: string;
  age: number;
  conditions: string[];
  allergies: string[];
  medications: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}
