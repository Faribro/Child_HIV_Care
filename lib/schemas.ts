// lib/schemas.ts
import { z } from 'zod';

export const UserRoleSchema = z.enum(['SuperAdmin', 'Admin', 'Editor', 'Viewer', 'DataEntry']);

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
  rememberMe: z.boolean().optional(),
});

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: UserRoleSchema,
});

export const DesignationFieldsSchema = z.object({
  filled_posts: z.coerce.number().nonnegative().optional().default(0),
  vacant_posts: z.coerce.number().nonnegative().optional().default(0),
  computers: z.enum(['Yes', 'No', '']).optional().default(''),
  workstations: z.enum(['Yes', 'No', '']).optional().default(''),
  internet: z.enum(['Yes', 'No', '']).optional().default(''),
});

export const PatientSchema = z.object({
  _uuid: z.string().uuid().or(z.string()),
  _id: z.union([z.string(), z.number()]).optional().default(''),
  _submission_time: z.string().optional().default(''),
  _submitted_by: z.string().optional().default(''),
  
  consent_obtained: z.string().min(1, 'Consent is required'),
  thumb_impression: z.string().optional().default(''),
  visitdate: z.string().min(1, 'Visit date is required'),
  childname: z.string().min(1, "Child's name is required"),
  dateofbirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  orphanstatus: z.string().min(1, 'Orphan status is required'),
  caregivername: z.string().min(1, "Caregiver's name is required"),
  caregiverrelation: z.string().min(1, 'Caregiver relationship is required'),
  caregivercontact: z.string().optional().default(''),
  address: z.string().min(1, 'Address is required'),
  addressstate: z.string().min(1, 'State is required'),
  addressdistrict: z.string().min(1, 'District is required'),
  
  householdmembers: z.coerce.number().nonnegative().optional().default(0),
  noofchildren: z.coerce.number().nonnegative().optional().default(0),
  householdincomemonthly: z.coerce.number().nonnegative().optional().default(0),
  incomesource: z.string().optional().default(''),
  
  current_weight: z.coerce.number().nonnegative().optional().default(0),
  current_height: z.coerce.number().nonnegative().optional().default(0),
  bmicalc: z.coerce.number().nonnegative().optional().default(0),
  bmicategory: z.string().optional().default(''),
  hemoglobin: z.coerce.number().nonnegative().optional().default(0),
  hb_category: z.string().optional().default(''),
  comorbidities: z.string().optional().default(''),
  comorbidities_other: z.string().optional().default(''),
  
  appetite: z.string().optional().default(''),
  mealsperday: z.coerce.number().nonnegative().optional().default(0),
  
  educationstatus: z.string().optional().default(''),
  educationstatus_other: z.string().optional().default(''),
  schoolname: z.string().optional().default(''),
  schooltype: z.string().optional().default(''),
  currentclass: z.string().optional().default(''),
  attendancestatus: z.string().optional().default(''),
  
  eduschoolfees: z.coerce.number().nonnegative().optional().default(0),
  private_tution_fee: z.coerce.number().nonnegative().optional().default(0),
  edubooks: z.coerce.number().nonnegative().optional().default(0),
  edustationery: z.coerce.number().nonnegative().optional().default(0),
  eduuniform: z.coerce.number().nonnegative().optional().default(0),
  edutransport: z.coerce.number().nonnegative().optional().default(0),
  eduother: z.coerce.number().nonnegative().optional().default(0),
  edutotalannual: z.coerce.number().nonnegative().optional().default(0),
  school_fee_receipt: z.string().optional().default(''),
  marksheet_prev_year: z.string().optional().default(''),
  
  reqschoolfees: z.coerce.number().nonnegative().optional().default(0),
  reqbooks: z.coerce.number().nonnegative().optional().default(0),
  reqstationery: z.coerce.number().nonnegative().optional().default(0),
  requniform: z.coerce.number().nonnegative().optional().default(0),
  reqtransport: z.coerce.number().nonnegative().optional().default(0),
  reqother: z.coerce.number().nonnegative().optional().default(0),
  reqtotalsupport: z.coerce.number().nonnegative().optional().default(0),
  
  reviewconfirmed: z.string().optional().default(''),
  organization_name: z.string().optional().default(''),
  organization_email: z.string().optional().default(''),
  
  __sync_needed: z.string().optional().default(''),
  __last_updated: z.string().optional().default(''),
  __rowNum: z.number().optional(),
});

export type Patient = z.infer<typeof PatientSchema>;
