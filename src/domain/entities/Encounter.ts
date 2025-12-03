/**
 * FHIR R4 Encounter Entity
 *
 * Represents clinical encounters/visits
 *
 * @see https://www.hl7.org/fhir/r4/encounter.html
 */

import { FHIRResource, CodeableConcept, Reference, Identifier, Period, Coding } from './FHIRTypes';

export type EncounterStatus =
  | 'planned'
  | 'arrived'
  | 'triaged'
  | 'in-progress'
  | 'onleave'
  | 'finished'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown';

export interface EncounterStatusHistory {
  status: EncounterStatus;
  period: Period;
}

export interface EncounterClassHistory {
  class: Coding;
  period: Period;
}

export interface EncounterParticipant {
  type?: CodeableConcept[];
  period?: Period;
  individual?: Reference;
}

export interface EncounterDiagnosis {
  condition: Reference;
  use?: CodeableConcept;
  rank?: number;
}

export interface EncounterHospitalization {
  preAdmissionIdentifier?: Identifier;
  origin?: Reference;
  admitSource?: CodeableConcept;
  reAdmission?: CodeableConcept;
  dietPreference?: CodeableConcept[];
  specialCourtesy?: CodeableConcept[];
  specialArrangement?: CodeableConcept[];
  destination?: Reference;
  dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation {
  location: Reference;
  status?: 'planned' | 'active' | 'reserved' | 'completed';
  physicalType?: CodeableConcept;
  period?: Period;
}

export interface Encounter extends FHIRResource {
  resourceType: 'Encounter';
  identifier?: Identifier[];
  status: EncounterStatus;
  statusHistory?: EncounterStatusHistory[];
  class: Coding;
  classHistory?: EncounterClassHistory[];
  type?: CodeableConcept[];
  serviceType?: CodeableConcept;
  priority?: CodeableConcept;
  subject?: Reference;
  episodeOfCare?: Reference[];
  basedOn?: Reference[];
  participant?: EncounterParticipant[];
  appointment?: Reference[];
  period?: Period;
  length?: {
    value?: number;
    comparator?: '<' | '<=' | '>=' | '>';
    unit?: string;
    system?: string;
    code?: string;
  };
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference[];
  diagnosis?: EncounterDiagnosis[];
  account?: Reference[];
  hospitalization?: EncounterHospitalization;
  location?: EncounterLocation[];
  serviceProvider?: Reference;
  partOf?: Reference;
}

/**
 * Encounter class codes (v3-ActEncounterCode)
 */
export const EncounterClassCodes = {
  AMBULATORY: 'AMB',
  EMERGENCY: 'EMER',
  FIELD: 'FLD',
  HOME_HEALTH: 'HH',
  INPATIENT: 'IMP',
  ACUTE_INPATIENT: 'ACUTE',
  NON_ACUTE_INPATIENT: 'NONAC',
  OBSERVATION: 'OBSENC',
  PRE_ADMISSION: 'PRENC',
  SHORT_STAY: 'SS',
  VIRTUAL: 'VR',
} as const;

/**
 * Helper functions for Encounter entity
 */
export const EncounterHelpers = {
  /**
   * Get the encounter type display name
   */
  getTypeName(encounter: Encounter): string {
    const type = encounter.type?.[0];
    if (!type) {
      return EncounterHelpers.getClassDisplay(encounter);
    }

    return (
      type.text ||
      type.coding?.[0]?.display ||
      type.coding?.[0]?.code ||
      EncounterHelpers.getClassDisplay(encounter)
    );
  },

  /**
   * Get the encounter class display
   */
  getClassDisplay(encounter: Encounter): string {
    const classCode = encounter.class?.code;
    const classDisplayMap: Record<string, string> = {
      AMB: 'Outpatient',
      EMER: 'Emergency',
      FLD: 'Field',
      HH: 'Home Health',
      IMP: 'Inpatient',
      ACUTE: 'Acute Inpatient',
      NONAC: 'Non-Acute Inpatient',
      OBSENC: 'Observation',
      PRENC: 'Pre-Admission',
      SS: 'Short Stay',
      VR: 'Virtual',
    };

    return (
      encounter.class?.display ||
      (classCode ? classDisplayMap[classCode] : undefined) ||
      classCode ||
      'Unknown'
    );
  },

  /**
   * Get the encounter period as display string
   */
  getPeriodDisplay(encounter: Encounter): string {
    if (!encounter.period) {
      return 'Unknown date';
    }

    const start = encounter.period.start
      ? new Date(encounter.period.start).toLocaleDateString()
      : undefined;
    const end = encounter.period.end
      ? new Date(encounter.period.end).toLocaleDateString()
      : undefined;

    if (start && end) {
      return start === end ? start : `${start} - ${end}`;
    }

    return start || end || 'Unknown date';
  },

  /**
   * Get the encounter start date
   */
  getStartDate(encounter: Encounter): Date | undefined {
    if (encounter.period?.start) {
      return new Date(encounter.period.start);
    }
    return undefined;
  },

  /**
   * Get status display string
   */
  getStatusDisplay(encounter: Encounter): string {
    const statusMap: Record<EncounterStatus, string> = {
      planned: 'Planned',
      arrived: 'Arrived',
      triaged: 'Triaged',
      'in-progress': 'In Progress',
      onleave: 'On Leave',
      finished: 'Finished',
      cancelled: 'Cancelled',
      'entered-in-error': 'Entered in Error',
      unknown: 'Unknown',
    };
    return statusMap[encounter.status] || encounter.status;
  },

  /**
   * Get the primary practitioner/participant
   */
  getPrimaryPractitioner(encounter: Encounter): string | undefined {
    const practitioner = encounter.participant?.find(p =>
      p.type?.some(t => t.coding?.some((c: Coding) => c.code === 'PPRF' || c.code === 'ATND'))
    );
    return practitioner?.individual?.display;
  },

  /**
   * Get the primary location
   */
  getPrimaryLocation(encounter: Encounter): string | undefined {
    return encounter.location?.[0]?.location?.display;
  },

  /**
   * Get reason for visit
   */
  getReasonDisplay(encounter: Encounter): string | undefined {
    const reason = encounter.reasonCode?.[0];
    if (!reason) {
      return undefined;
    }

    return reason.text || reason.coding?.[0]?.display || reason.coding?.[0]?.code;
  },

  /**
   * Get encounter length in hours
   */
  getLengthInHours(encounter: Encounter): number | undefined {
    if (!encounter.period?.start || !encounter.period?.end) {
      return undefined;
    }

    const start = new Date(encounter.period.start).getTime();
    const end = new Date(encounter.period.end).getTime();
    return Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
  },

  /**
   * Check if encounter is completed
   */
  isCompleted(encounter: Encounter): boolean {
    return encounter.status === 'finished';
  },

  /**
   * Check if encounter is active
   */
  isActive(encounter: Encounter): boolean {
    return ['arrived', 'triaged', 'in-progress', 'onleave'].includes(encounter.status);
  },
};

export default Encounter;
