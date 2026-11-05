export type AdminCategory = 'arc' | 'visa' | 'banking' | 'housing';

export interface AdminChecklistStep {
  id: string;
  titleKo: string;
  titleMm: string;
  descriptionMm: string;
  requiredDocs?: string[];
  tipMm?: string;
}

export interface AdminGuide {
  id: string;
  category: AdminCategory;
  titleKo: string;
  titleMm: string;
  subtitleMm: string;
  badgeText: string;
  estimatedTime: string;
  officialUrl?: string;
  steps: AdminChecklistStep[];
}

export type WasteCategory =
  | 'general'
  | 'food'
  | 'plastic'
  | 'vinyl'
  | 'can_glass'
  | 'paper';

export interface RecyclingItem {
  id: string;
  category: WasteCategory;
  categoryKo: string;
  categoryMm: string;
  nameKo: string;
  nameMm: string;
  howToDisposeMm: string;
  warningMm: string;
  keywords: string[];
  bagTypeKo: string;
}

export interface SafetyAlertItem {
  id: string;
  titleKo: string;
  titleMm: string;
  severity: 'critical' | 'warning';
  summaryMm: string;
  actionStepsMm: string[];
  reportNumber: string;
}

export type BodyPartCategory =
  | 'all'
  | 'head'
  | 'throat_resp'
  | 'stomach'
  | 'dental'
  | 'skin'
  | 'joint_muscle'
  | 'eye_ear';

export interface ClinicDepartment {
  id: string;
  nameKo: string;
  pronunciationMm: string;
  nameMm: string;
  descriptionMm: string;
  naverMapQuery: string;
}

export interface MedicalSymptom {
  id: string;
  bodyPart: Exclude<BodyPartCategory, 'all'>;
  symptomKo: string;
  doctorSentenceKo: string;
  symptomMm: string;
  pronunciationMm: string;
  departmentId: string;
  isUrgent?: boolean;
}

export interface OtcMedicineItem {
  id: string;
  nameKo: string;
  pronunciationMm: string;
  typeMm: string;
  usageMm: string;
  whereToBuyKo: string;
  whereToBuyMm: string;
  cautionMm: string;
}

export interface SymptomContextState {
  durationKo: string;
  durationMm: string;
  severityKo: string;
  severityMm: string;
  specialNotesKo: string[];
}

export type PhraseCategory =
  | 'immigration'
  | 'bank'
  | 'realestate'
  | 'hospital'
  | 'pharmacy';

export interface SituationVocab {
  id: string;
  category: PhraseCategory;
  categoryKo: string;
  categoryMm: string;
  korean: string;
  burmese: string;
  pronunciationMm: string;
  usageTipMm?: string;
}

export interface EmergencyProfile {
  fullName: string;
  bloodType: string;
  allergiesKo: string;
  allergiesMm: string;
  chronicConditionsKo: string;
  chronicConditionsMm: string;
  medicationsKo: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  koreanAddressKo: string;
  koreanAddressNoteMm: string;
  myKoreanPhone: string;
  visaType: string;
  visaExpiryDate: string; // YYYY-MM-DD
}

export interface HotlineContact {
  id: string;
  number: string;
  titleKo: string;
  titleMm: string;
  subtitleMm: string;
  isEmergency?: boolean;
}

