/**
 * FHIR R4 Patient Entity
 *
 * Represents a patient in the FHIR R4 standard.
 * This entity follows Clean Architecture principles - it's a pure domain object
 * with no dependencies on external frameworks or libraries.
 *
 * @see https://www.hl7.org/fhir/r4/patient.html
 */

import {
  FHIRResource,
  HumanName,
  Address,
  ContactPoint,
  CodeableConcept,
  Identifier,
} from './FHIRTypes';

export interface PatientContact {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: {
    reference?: string;
    display?: string;
  };
  period?: {
    start?: string;
    end?: string;
  };
}

export interface PatientCommunication {
  language: CodeableConcept;
  preferred?: boolean;
}

export interface PatientLink {
  other: {
    reference: string;
    display?: string;
  };
  type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
}

export interface Patient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  photo?: Array<{
    contentType?: string;
    url?: string;
    data?: string;
  }>;
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Array<{
    reference?: string;
    display?: string;
  }>;
  managingOrganization?: {
    reference?: string;
    display?: string;
  };
  link?: PatientLink[];
}

/**
 * Helper functions for Patient entity
 */
export const PatientHelpers = {
  /**
   * Get the patient's display name (first official or usual name)
   */
  getDisplayName(patient: Patient): string {
    if (!patient.name || patient.name.length === 0) {
      return 'Unknown Patient';
    }

    // Prefer official name, then usual name, then first available
    const name =
      patient.name.find(n => n.use === 'official') ||
      patient.name.find(n => n.use === 'usual') ||
      patient.name[0];

    if (name.text) {
      return name.text;
    }

    const parts: string[] = [];
    if (name.given) {
      parts.push(...name.given);
    }
    if (name.family) {
      parts.push(name.family);
    }

    return parts.join(' ') || 'Unknown Patient';
  },

  /**
   * Get patient's primary phone number
   */
  getPrimaryPhone(patient: Patient): string | undefined {
    const phone = patient.telecom?.find(t => t.system === 'phone');
    return phone?.value;
  },

  /**
   * Get patient's primary email
   */
  getPrimaryEmail(patient: Patient): string | undefined {
    const email = patient.telecom?.find(t => t.system === 'email');
    return email?.value;
  },

  /**
   * Calculate patient's age from birthDate
   */
  getAge(patient: Patient): number | undefined {
    if (!patient.birthDate) {
      return undefined;
    }

    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  },

  /**
   * Get primary address as formatted string
   */
  getPrimaryAddress(patient: Patient): string | undefined {
    const address = patient.address?.[0];
    if (!address) {
      return undefined;
    }

    if (address.text) {
      return address.text;
    }

    const parts: string[] = [];
    if (address.line) {
      parts.push(...address.line);
    }
    if (address.city) {
      parts.push(address.city);
    }
    if (address.state) {
      parts.push(address.state);
    }
    if (address.postalCode) {
      parts.push(address.postalCode);
    }
    if (address.country) {
      parts.push(address.country);
    }

    return parts.join(', ') || undefined;
  },

  /**
   * Check if patient is deceased
   */
  isDeceased(patient: Patient): boolean {
    return patient.deceasedBoolean === true || !!patient.deceasedDateTime;
  },

  /**
   * Get MRN (Medical Record Number) if available
   */
  getMRN(patient: Patient): string | undefined {
    const mrn = patient.identifier?.find(id =>
      id.type?.coding?.some((c: { code?: string }) => c.code === 'MR')
    );
    return mrn?.value;
  },
};

export default Patient;
