/**
 * FHIR Resource Validators
 *
 * Validates FHIR R4 resources to ensure they meet the required structure
 * and contain mandatory fields. Uses Zod for runtime validation.
 */

import { z } from 'zod';

// =============================================================================
// BASE SCHEMAS
// =============================================================================

const ReferenceSchema = z.object({
  reference: z.string().optional(),
  type: z.string().optional(),
  display: z.string().optional(),
});

const CodingSchema = z.object({
  system: z.string().optional(),
  version: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
  userSelected: z.boolean().optional(),
});

const CodeableConceptSchema = z.object({
  coding: z.array(CodingSchema).optional(),
  text: z.string().optional(),
});

const PeriodSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
});

const QuantitySchema = z.object({
  value: z.number().optional(),
  comparator: z.enum(['<', '<=', '>=', '>']).optional(),
  unit: z.string().optional(),
  system: z.string().optional(),
  code: z.string().optional(),
});

const IdentifierSchema = z.object({
  use: z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
  type: CodeableConceptSchema.optional(),
  system: z.string().optional(),
  value: z.string().optional(),
  period: PeriodSchema.optional(),
});

const HumanNameSchema = z.object({
  use: z.enum(['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden']).optional(),
  text: z.string().optional(),
  family: z.string().optional(),
  given: z.array(z.string()).optional(),
  prefix: z.array(z.string()).optional(),
  suffix: z.array(z.string()).optional(),
  period: PeriodSchema.optional(),
});

const ContactPointSchema = z.object({
  system: z.enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other']).optional(),
  value: z.string().optional(),
  use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional(),
  rank: z.number().optional(),
  period: PeriodSchema.optional(),
});

const AddressSchema = z.object({
  use: z.enum(['home', 'work', 'temp', 'old', 'billing']).optional(),
  type: z.enum(['postal', 'physical', 'both']).optional(),
  text: z.string().optional(),
  line: z.array(z.string()).optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  period: PeriodSchema.optional(),
});

const MetaSchema = z.object({
  versionId: z.string().optional(),
  lastUpdated: z.string().optional(),
  source: z.string().optional(),
  profile: z.array(z.string()).optional(),
  security: z.array(CodingSchema).optional(),
  tag: z.array(CodingSchema).optional(),
});

// =============================================================================
// RESOURCE SCHEMAS
// =============================================================================

/**
 * Patient Resource Schema
 */
export const PatientSchema = z.object({
  resourceType: z.literal('Patient'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  identifier: z.array(IdentifierSchema).optional(),
  active: z.boolean().optional(),
  name: z.array(HumanNameSchema).optional(),
  telecom: z.array(ContactPointSchema).optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  birthDate: z.string().optional(),
  deceasedBoolean: z.boolean().optional(),
  deceasedDateTime: z.string().optional(),
  address: z.array(AddressSchema).optional(),
  maritalStatus: CodeableConceptSchema.optional(),
});

/**
 * Observation Resource Schema
 */
export const ObservationSchema = z.object({
  resourceType: z.literal('Observation'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum([
    'registered',
    'preliminary',
    'final',
    'amended',
    'corrected',
    'cancelled',
    'entered-in-error',
    'unknown',
  ]),
  category: z.array(CodeableConceptSchema).optional(),
  code: CodeableConceptSchema,
  subject: ReferenceSchema.optional(),
  encounter: ReferenceSchema.optional(),
  effectiveDateTime: z.string().optional(),
  effectivePeriod: PeriodSchema.optional(),
  issued: z.string().optional(),
  performer: z.array(ReferenceSchema).optional(),
  valueQuantity: QuantitySchema.optional(),
  valueCodeableConcept: CodeableConceptSchema.optional(),
  valueString: z.string().optional(),
  valueBoolean: z.boolean().optional(),
  valueInteger: z.number().optional(),
  interpretation: z.array(CodeableConceptSchema).optional(),
  note: z.array(z.object({ text: z.string() })).optional(),
  component: z
    .array(
      z.object({
        code: CodeableConceptSchema,
        valueQuantity: QuantitySchema.optional(),
        valueCodeableConcept: CodeableConceptSchema.optional(),
        valueString: z.string().optional(),
      })
    )
    .optional(),
});

/**
 * DiagnosticReport Resource Schema
 */
export const DiagnosticReportSchema = z.object({
  resourceType: z.literal('DiagnosticReport'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum([
    'registered',
    'partial',
    'preliminary',
    'final',
    'amended',
    'corrected',
    'appended',
    'cancelled',
    'entered-in-error',
    'unknown',
  ]),
  category: z.array(CodeableConceptSchema).optional(),
  code: CodeableConceptSchema,
  subject: ReferenceSchema.optional(),
  encounter: ReferenceSchema.optional(),
  effectiveDateTime: z.string().optional(),
  effectivePeriod: PeriodSchema.optional(),
  issued: z.string().optional(),
  performer: z.array(ReferenceSchema).optional(),
  result: z.array(ReferenceSchema).optional(),
  conclusion: z.string().optional(),
  conclusionCode: z.array(CodeableConceptSchema).optional(),
});

/**
 * Encounter Resource Schema
 */
export const EncounterSchema = z.object({
  resourceType: z.literal('Encounter'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum([
    'planned',
    'arrived',
    'triaged',
    'in-progress',
    'onleave',
    'finished',
    'cancelled',
    'entered-in-error',
    'unknown',
  ]),
  class: CodingSchema,
  type: z.array(CodeableConceptSchema).optional(),
  subject: ReferenceSchema.optional(),
  participant: z
    .array(
      z.object({
        type: z.array(CodeableConceptSchema).optional(),
        period: PeriodSchema.optional(),
        individual: ReferenceSchema.optional(),
      })
    )
    .optional(),
  period: PeriodSchema.optional(),
  reasonCode: z.array(CodeableConceptSchema).optional(),
  diagnosis: z
    .array(
      z.object({
        condition: ReferenceSchema,
        use: CodeableConceptSchema.optional(),
        rank: z.number().optional(),
      })
    )
    .optional(),
  location: z
    .array(
      z.object({
        location: ReferenceSchema,
        status: z.enum(['planned', 'active', 'reserved', 'completed']).optional(),
        period: PeriodSchema.optional(),
      })
    )
    .optional(),
});

/**
 * MedicationRequest Resource Schema
 */
export const MedicationRequestSchema = z.object({
  resourceType: z.literal('MedicationRequest'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum([
    'active',
    'on-hold',
    'cancelled',
    'completed',
    'entered-in-error',
    'stopped',
    'draft',
    'unknown',
  ]),
  intent: z.enum([
    'proposal',
    'plan',
    'order',
    'original-order',
    'reflex-order',
    'filler-order',
    'instance-order',
    'option',
  ]),
  category: z.array(CodeableConceptSchema).optional(),
  priority: z.enum(['routine', 'urgent', 'asap', 'stat']).optional(),
  medicationCodeableConcept: CodeableConceptSchema.optional(),
  medicationReference: ReferenceSchema.optional(),
  subject: ReferenceSchema,
  encounter: ReferenceSchema.optional(),
  authoredOn: z.string().optional(),
  requester: ReferenceSchema.optional(),
  reasonCode: z.array(CodeableConceptSchema).optional(),
  dosageInstruction: z
    .array(
      z.object({
        text: z.string().optional(),
        timing: z
          .object({
            repeat: z
              .object({
                frequency: z.number().optional(),
                period: z.number().optional(),
                periodUnit: z.string().optional(),
              })
              .optional(),
          })
          .optional(),
        route: CodeableConceptSchema.optional(),
        doseAndRate: z
          .array(
            z.object({
              doseQuantity: QuantitySchema.optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

/**
 * Consent Resource Schema
 */
export const ConsentSchema = z.object({
  resourceType: z.literal('Consent'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  identifier: z.array(IdentifierSchema).optional(),
  status: z.enum(['draft', 'proposed', 'active', 'rejected', 'inactive', 'entered-in-error']),
  scope: CodeableConceptSchema,
  category: z.array(CodeableConceptSchema),
  patient: ReferenceSchema.optional(),
  dateTime: z.string().optional(),
  performer: z.array(ReferenceSchema).optional(),
  organization: z.array(ReferenceSchema).optional(),
  policyRule: CodeableConceptSchema.optional(),
  provision: z
    .object({
      type: z.enum(['deny', 'permit']).optional(),
      period: PeriodSchema.optional(),
      actor: z
        .array(
          z.object({
            role: CodeableConceptSchema,
            reference: ReferenceSchema,
          })
        )
        .optional(),
      action: z.array(CodeableConceptSchema).optional(),
    })
    .optional(),
});

/**
 * Bundle Resource Schema
 */
export const BundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  id: z.string().optional(),
  meta: MetaSchema.optional(),
  type: z.enum([
    'document',
    'message',
    'transaction',
    'transaction-response',
    'batch',
    'batch-response',
    'history',
    'searchset',
    'collection',
  ]),
  total: z.number().optional(),
  link: z
    .array(
      z.object({
        relation: z.string(),
        url: z.string(),
      })
    )
    .optional(),
  entry: z
    .array(
      z.object({
        fullUrl: z.string().optional(),
        resource: z.any().optional(), // Will be validated separately
        search: z
          .object({
            mode: z.enum(['match', 'include', 'outcome']).optional(),
            score: z.number().optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: string[];
    };

/**
 * Validate a Patient resource
 */
export function validatePatient(data: unknown): ValidationResult<z.infer<typeof PatientSchema>> {
  const result = PatientSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate an Observation resource
 */
export function validateObservation(
  data: unknown
): ValidationResult<z.infer<typeof ObservationSchema>> {
  const result = ObservationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate a DiagnosticReport resource
 */
export function validateDiagnosticReport(
  data: unknown
): ValidationResult<z.infer<typeof DiagnosticReportSchema>> {
  const result = DiagnosticReportSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate an Encounter resource
 */
export function validateEncounter(
  data: unknown
): ValidationResult<z.infer<typeof EncounterSchema>> {
  const result = EncounterSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate a MedicationRequest resource
 */
export function validateMedicationRequest(
  data: unknown
): ValidationResult<z.infer<typeof MedicationRequestSchema>> {
  const result = MedicationRequestSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate a Consent resource
 */
export function validateConsent(data: unknown): ValidationResult<z.infer<typeof ConsentSchema>> {
  const result = ConsentSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate a Bundle resource
 */
export function validateBundle(data: unknown): ValidationResult<z.infer<typeof BundleSchema>> {
  const result = BundleSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Validate any FHIR resource based on resourceType
 */
export function validateResource(data: unknown): ValidationResult<unknown> {
  if (typeof data !== 'object' || data === null) {
    return { success: false, errors: ['Invalid resource: not an object'] };
  }

  const resource = data as { resourceType?: string };

  switch (resource.resourceType) {
    case 'Patient':
      return validatePatient(data);
    case 'Observation':
      return validateObservation(data);
    case 'DiagnosticReport':
      return validateDiagnosticReport(data);
    case 'Encounter':
      return validateEncounter(data);
    case 'MedicationRequest':
      return validateMedicationRequest(data);
    case 'Consent':
      return validateConsent(data);
    case 'Bundle':
      return validateBundle(data);
    default:
      // For unknown resource types, we just check it has a resourceType
      if (!resource.resourceType) {
        return { success: false, errors: ['Missing resourceType'] };
      }
      return { success: true, data };
  }
}

export default {
  validatePatient,
  validateObservation,
  validateDiagnosticReport,
  validateEncounter,
  validateMedicationRequest,
  validateConsent,
  validateBundle,
  validateResource,
};
