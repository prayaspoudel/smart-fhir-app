/**
 * FHIR R4 Consent Entity
 *
 * Represents patient consent for data sharing and access
 *
 * @see https://www.hl7.org/fhir/r4/consent.html
 */

import { FHIRResource, CodeableConcept, Reference, Identifier, Period, Coding } from './FHIRTypes';

export type ConsentStatus =
  | 'draft'
  | 'proposed'
  | 'active'
  | 'rejected'
  | 'inactive'
  | 'entered-in-error';

export interface ConsentPolicy {
  authority?: string;
  uri?: string;
}

export interface ConsentVerification {
  verified: boolean;
  verifiedWith?: Reference;
  verificationDate?: string;
}

export interface ConsentProvisionActor {
  role: CodeableConcept;
  reference: Reference;
}

export interface ConsentProvisionData {
  meaning: 'instance' | 'related' | 'dependents' | 'authoredby';
  reference: Reference;
}

export interface ConsentProvision {
  type?: 'deny' | 'permit';
  period?: Period;
  actor?: ConsentProvisionActor[];
  action?: CodeableConcept[];
  securityLabel?: Coding[];
  purpose?: Coding[];
  class?: Coding[];
  code?: CodeableConcept[];
  dataPeriod?: Period;
  data?: ConsentProvisionData[];
  provision?: ConsentProvision[];
}

export interface Consent extends FHIRResource {
  resourceType: 'Consent';
  identifier?: Identifier[];
  status: ConsentStatus;
  scope: CodeableConcept;
  category: CodeableConcept[];
  patient?: Reference;
  dateTime?: string;
  performer?: Reference[];
  organization?: Reference[];
  sourceAttachment?: {
    contentType?: string;
    language?: string;
    data?: string;
    url?: string;
    size?: number;
    hash?: string;
    title?: string;
    creation?: string;
  };
  sourceReference?: Reference;
  policy?: ConsentPolicy[];
  policyRule?: CodeableConcept;
  verification?: ConsentVerification[];
  provision?: ConsentProvision;
}

/**
 * Consent scope codes
 */
export const ConsentScopes = {
  PATIENT_PRIVACY: 'patient-privacy',
  RESEARCH: 'research',
  ADR: 'adr',
  TREATMENT: 'treatment',
} as const;

/**
 * Consent category codes
 */
export const ConsentCategories = {
  ADVANCE_DIRECTIVE: '59284-0',
  DNR: '64300-7',
  EMERG_CONTACT: '64301-5',
  HEALTH_INFO_EXCHANGE: '57016-8',
  HIPAA_AUTH: '57017-6',
  HIPAA_NPP: '57018-4',
  HIPAA_RESTRICTIONS: '57019-2',
  IDSCL: 'IDSCL',
  RESEARCH: 'research',
} as const;

/**
 * Helper functions for Consent entity
 */
export const ConsentHelpers = {
  /**
   * Get the consent type/category display
   */
  getCategoryDisplay(consent: Consent): string {
    const category = consent.category?.[0];
    if (!category) {
      return 'Unknown';
    }

    return (
      category.text || category.coding?.[0]?.display || category.coding?.[0]?.code || 'Unknown'
    );
  },

  /**
   * Get the consent scope display
   */
  getScopeDisplay(consent: Consent): string {
    return (
      consent.scope.text ||
      consent.scope.coding?.[0]?.display ||
      consent.scope.coding?.[0]?.code ||
      'Unknown'
    );
  },

  /**
   * Get the consent date/time
   */
  getDateTime(consent: Consent): Date | undefined {
    if (consent.dateTime) {
      return new Date(consent.dateTime);
    }
    return undefined;
  },

  /**
   * Get status display string
   */
  getStatusDisplay(consent: Consent): string {
    const statusMap: Record<ConsentStatus, string> = {
      draft: 'Draft',
      proposed: 'Proposed',
      active: 'Active',
      rejected: 'Rejected',
      inactive: 'Inactive',
      'entered-in-error': 'Entered in Error',
    };
    return statusMap[consent.status] || consent.status;
  },

  /**
   * Check if consent is active
   */
  isActive(consent: Consent): boolean {
    return consent.status === 'active';
  },

  /**
   * Check if consent allows data sharing
   */
  allowsDataSharing(consent: Consent): boolean {
    if (consent.status !== 'active') {
      return false;
    }

    // If no provision, assume permit by default
    if (!consent.provision) {
      return true;
    }

    return consent.provision.type === 'permit';
  },

  /**
   * Get the organizations consent applies to
   */
  getOrganizations(consent: Consent): string[] {
    return (
      consent.organization?.map(org => org.display).filter((name): name is string => !!name) ?? []
    );
  },

  /**
   * Get verification status
   */
  isVerified(consent: Consent): boolean {
    return consent.verification?.some(v => v.verified) ?? false;
  },

  /**
   * Get the validity period
   */
  getValidityPeriod(consent: Consent): { start?: Date; end?: Date } | undefined {
    const period = consent.provision?.period;
    if (!period) {
      return undefined;
    }

    return {
      start: period.start ? new Date(period.start) : undefined,
      end: period.end ? new Date(period.end) : undefined,
    };
  },

  /**
   * Check if consent has expired
   */
  isExpired(consent: Consent): boolean {
    const validity = ConsentHelpers.getValidityPeriod(consent);
    if (!validity?.end) {
      return false;
    }

    return new Date() > validity.end;
  },

  /**
   * Create a new consent resource for data sharing
   */
  createDataSharingConsent(params: {
    patientReference: Reference;
    organizationReference: Reference;
    dateTime: string;
    providerName: string;
    scope: 'read' | 'write' | 'read-write';
  }): Consent {
    return {
      resourceType: 'Consent',
      status: 'active',
      scope: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/consentscope',
            code: 'patient-privacy',
            display: 'Privacy Consent',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://loinc.org',
              code: '57016-8',
              display: 'Privacy policy acknowledgment Document',
            },
          ],
        },
      ],
      patient: params.patientReference,
      dateTime: params.dateTime,
      organization: [params.organizationReference],
      policyRule: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'OPTIN',
          },
        ],
      },
      provision: {
        type: 'permit',
        action: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/consentaction',
                code: params.scope.includes('read') ? 'access' : 'disclose',
              },
            ],
          },
        ],
        actor: [
          {
            role: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-RoleClass',
                  code: 'PROV',
                },
              ],
            },
            reference: params.organizationReference,
          },
        ],
      },
    };
  },
};

export default Consent;
