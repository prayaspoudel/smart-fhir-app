/**
 * FHIR R4 MedicationRequest Entity
 *
 * Represents medication orders/prescriptions
 *
 * @see https://www.hl7.org/fhir/r4/medicationrequest.html
 */

import {
  FHIRResource,
  CodeableConcept,
  Reference,
  Identifier,
  Period,
  Quantity,
  Dosage,
  Annotation,
} from './FHIRTypes';

export type MedicationRequestStatus =
  | 'active'
  | 'on-hold'
  | 'cancelled'
  | 'completed'
  | 'entered-in-error'
  | 'stopped'
  | 'draft'
  | 'unknown';

export type MedicationRequestIntent =
  | 'proposal'
  | 'plan'
  | 'order'
  | 'original-order'
  | 'reflex-order'
  | 'filler-order'
  | 'instance-order'
  | 'option';

export type MedicationRequestPriority = 'routine' | 'urgent' | 'asap' | 'stat';

export interface MedicationRequestDispenseRequest {
  initialFill?: {
    quantity?: Quantity;
    duration?: {
      value?: number;
      unit?: string;
      system?: string;
      code?: string;
    };
  };
  dispenseInterval?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  validityPeriod?: Period;
  numberOfRepeatsAllowed?: number;
  quantity?: Quantity;
  expectedSupplyDuration?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  performer?: Reference;
}

export interface MedicationRequestSubstitution {
  allowedBoolean?: boolean;
  allowedCodeableConcept?: CodeableConcept;
  reason?: CodeableConcept;
}

export interface MedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  identifier?: Identifier[];
  status: MedicationRequestStatus;
  statusReason?: CodeableConcept;
  intent: MedicationRequestIntent;
  category?: CodeableConcept[];
  priority?: MedicationRequestPriority;
  doNotPerform?: boolean;
  reportedBoolean?: boolean;
  reportedReference?: Reference;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference;
  subject: Reference;
  encounter?: Reference;
  supportingInformation?: Reference[];
  authoredOn?: string;
  requester?: Reference;
  performer?: Reference;
  performerType?: CodeableConcept;
  recorder?: Reference;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  basedOn?: Reference[];
  groupIdentifier?: Identifier;
  courseOfTherapyType?: CodeableConcept;
  insurance?: Reference[];
  note?: Annotation[];
  dosageInstruction?: Dosage[];
  dispenseRequest?: MedicationRequestDispenseRequest;
  substitution?: MedicationRequestSubstitution;
  priorPrescription?: Reference;
  detectedIssue?: Reference[];
  eventHistory?: Reference[];
}

/**
 * Helper functions for MedicationRequest entity
 */
export const MedicationRequestHelpers = {
  /**
   * Get the medication name
   */
  getMedicationName(medicationRequest: MedicationRequest): string {
    if (medicationRequest.medicationCodeableConcept) {
      return (
        medicationRequest.medicationCodeableConcept.text ||
        medicationRequest.medicationCodeableConcept.coding?.[0]?.display ||
        medicationRequest.medicationCodeableConcept.coding?.[0]?.code ||
        'Unknown Medication'
      );
    }

    if (medicationRequest.medicationReference) {
      return medicationRequest.medicationReference.display || 'Unknown Medication';
    }

    return 'Unknown Medication';
  },

  /**
   * Get the authored date
   */
  getAuthoredDate(medicationRequest: MedicationRequest): Date | undefined {
    if (medicationRequest.authoredOn) {
      return new Date(medicationRequest.authoredOn);
    }
    return undefined;
  },

  /**
   * Get status display string
   */
  getStatusDisplay(medicationRequest: MedicationRequest): string {
    const statusMap: Record<MedicationRequestStatus, string> = {
      active: 'Active',
      'on-hold': 'On Hold',
      cancelled: 'Cancelled',
      completed: 'Completed',
      'entered-in-error': 'Entered in Error',
      stopped: 'Stopped',
      draft: 'Draft',
      unknown: 'Unknown',
    };
    return statusMap[medicationRequest.status] || medicationRequest.status;
  },

  /**
   * Get dosage instructions as string
   */
  getDosageInstructions(medicationRequest: MedicationRequest): string {
    const dosage = medicationRequest.dosageInstruction?.[0];
    if (!dosage) {
      return 'No dosage information';
    }

    if (dosage.text) {
      return dosage.text;
    }

    const parts: string[] = [];

    // Dose
    const doseAndRate = dosage.doseAndRate?.[0];
    if (doseAndRate?.doseQuantity) {
      parts.push(`${doseAndRate.doseQuantity.value} ${doseAndRate.doseQuantity.unit || ''}`);
    }

    // Frequency
    if (dosage.timing?.repeat) {
      const repeat = dosage.timing.repeat;
      if (repeat.frequency && repeat.period && repeat.periodUnit) {
        parts.push(`${repeat.frequency} time(s) per ${repeat.period} ${repeat.periodUnit}`);
      }
    }

    // Route
    if (dosage.route?.text || dosage.route?.coding?.[0]?.display) {
      parts.push(dosage.route.text || dosage.route.coding?.[0]?.display || '');
    }

    return parts.join(', ') || 'See instructions';
  },

  /**
   * Get the prescriber name
   */
  getPrescriberName(medicationRequest: MedicationRequest): string | undefined {
    return medicationRequest.requester?.display;
  },

  /**
   * Get the reason for the prescription
   */
  getReason(medicationRequest: MedicationRequest): string | undefined {
    const reason = medicationRequest.reasonCode?.[0];
    if (!reason) {
      return undefined;
    }

    return reason.text || reason.coding?.[0]?.display || reason.coding?.[0]?.code;
  },

  /**
   * Check if this is an active prescription
   */
  isActive(medicationRequest: MedicationRequest): boolean {
    return medicationRequest.status === 'active';
  },

  /**
   * Check if this is a high priority prescription
   */
  isHighPriority(medicationRequest: MedicationRequest): boolean {
    return (
      medicationRequest.priority === 'urgent' ||
      medicationRequest.priority === 'asap' ||
      medicationRequest.priority === 'stat'
    );
  },

  /**
   * Get the number of refills allowed
   */
  getRefillsAllowed(medicationRequest: MedicationRequest): number | undefined {
    return medicationRequest.dispenseRequest?.numberOfRepeatsAllowed;
  },

  /**
   * Get supply duration in days
   */
  getSupplyDurationDays(medicationRequest: MedicationRequest): number | undefined {
    const duration = medicationRequest.dispenseRequest?.expectedSupplyDuration;
    if (!duration?.value) {
      return undefined;
    }

    // Convert to days based on unit
    const unitMultipliers: Record<string, number> = {
      d: 1,
      day: 1,
      days: 1,
      wk: 7,
      week: 7,
      weeks: 7,
      mo: 30,
      month: 30,
      months: 30,
    };

    const unit = duration.unit?.toLowerCase() || duration.code?.toLowerCase() || 'd';
    const multiplier = unitMultipliers[unit] || 1;

    return duration.value * multiplier;
  },

  /**
   * Get RxNorm code if available
   */
  getRxNormCode(medicationRequest: MedicationRequest): string | undefined {
    const coding = medicationRequest.medicationCodeableConcept?.coding?.find(
      c => c.system === 'http://www.nlm.nih.gov/research/umls/rxnorm'
    );
    return coding?.code;
  },
};

export default MedicationRequest;
