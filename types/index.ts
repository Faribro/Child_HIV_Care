// types/index.ts

export type UserRole = 'SuperAdmin' | 'Admin' | 'Editor' | 'Viewer' | 'DataEntry';

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface DesignationStats {
  name: string;
  withComputers: number;
  withTablets: number;
  withInternet: number;
  withScanners: number;
}

export interface DashboardStats {
  totalChildren: number;
  totalIncomeAvg: number;
  avgWeight: number;
  avgHeight: number;
  severeAnaemiaCount: number;
  severelyUnderweightCount: number;
  educationStatusCounts: Record<string, number>;
  states: Record<string, number>;
  districts: Record<string, number>;
}

// Representing the primary Child Nutrition / HIV Care row in the database.
export interface EquipmentRecord {
  _uuid: string;
  _id: string | number;
  _submission_time: string;
  _submitted_by: string;
  
  consent_obtained: string;
  thumb_impression?: string; // Signature/thumb impression base64 or link
  visitdate: string;
  childname: string;
  dateofbirth: string;
  gender: string;
  orphanstatus: string;
  caregivername: string;
  caregiverrelation: string;
  caregivercontact: string;
  address: string;
  addressstate: string;
  addressdistrict: string;
  
  householdmembers?: number;
  noofchildren?: number;
  householdincomemonthly?: number;
  incomesource?: string;
  
  current_weight?: number;
  current_height?: number;
  bmicalc?: number;
  bmicategory?: string;
  hemoglobin?: number;
  hb_category?: string;
  comorbidities?: string;
  comorbidities_other?: string;
  
  appetite?: string;
  mealsperday?: number;
  
  educationstatus?: string;
  educationstatus_other?: string;
  schoolname?: string;
  schooltype?: string;
  currentclass?: string;
  attendancestatus?: string;
  
  // Expenses
  eduschoolfees?: number;
  private_tution_fee?: number;
  edubooks?: number;
  edustationery?: number;
  eduuniform?: number;
  edutransport?: number;
  eduother?: number;
  edutotalannual?: number;
  school_fee_receipt?: string;
  marksheet_prev_year?: string;
  
  // Required support
  reqschoolfees?: number;
  reqbooks?: number;
  reqstationery?: number;
  requniform?: number;
  reqtransport?: number;
  reqother?: number;
  reqtotalsupport?: number;
  
  reviewconfirmed?: string;
  organization_name?: string;
  organization_email?: string;
  
  __sync_needed?: string;
  __last_updated?: string;
  __rowNum?: number;
}

export type Patient = EquipmentRecord;

export interface AuditEntry {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipHash: string;
  details?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'offline';

export interface SyncQueueItem {
  id: string; // uuid
  action: 'ADD_RECORD' | 'UPDATE_RECORD' | 'DELETE_RECORD';
  payload: Record<string, unknown> | Partial<Patient>;
  timestamp: number;
}

export interface AppConfig {
  appName: string;
  version: string;
  koboAssetUid: string;
  koboBaseUrl: string;
}

export interface DuplicateMatch {
  record1: Patient;
  record2: Patient;
  distance: number;
  fields: string[];
}
