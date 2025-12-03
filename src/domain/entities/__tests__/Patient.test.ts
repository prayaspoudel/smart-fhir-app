/**
 * Patient Entity Tests
 *
 * Tests for the Patient FHIR R4 entity and helper functions.
 */

import { Patient, PatientHelpers } from '../Patient';

describe('Patient Entity', () => {
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'test-patient-123',
    identifier: [
      {
        system: 'urn:oid:2.16.840.1.113883.4.1',
        value: '123-45-6789',
      },
    ],
    name: [
      {
        use: 'official',
        family: 'Doe',
        given: ['John', 'Michael'],
      },
    ],
    gender: 'male',
    birthDate: '1990-05-15',
    telecom: [
      {
        system: 'phone',
        value: '555-123-4567',
        use: 'mobile',
      },
      {
        system: 'email',
        value: 'john.doe@example.com',
        use: 'home',
      },
    ],
    address: [
      {
        use: 'home',
        line: ['123 Main St'],
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
      },
    ],
    active: true,
  };

  describe('PatientHelpers.getDisplayName', () => {
    it('should return full name with given names and family name', () => {
      const displayName = PatientHelpers.getDisplayName(mockPatient);
      expect(displayName).toBe('John Michael Doe');
    });

    it('should return "Unknown Patient" for patient without name', () => {
      const patientNoName: Patient = {
        resourceType: 'Patient',
        id: 'no-name',
      };
      expect(PatientHelpers.getDisplayName(patientNoName)).toBe('Unknown Patient');
    });

    it('should handle patient with only family name', () => {
      const patientFamilyOnly: Patient = {
        resourceType: 'Patient',
        id: 'family-only',
        name: [{ family: 'Smith' }],
      };
      expect(PatientHelpers.getDisplayName(patientFamilyOnly)).toBe('Smith');
    });

    it('should handle patient with only given names', () => {
      const patientGivenOnly: Patient = {
        resourceType: 'Patient',
        id: 'given-only',
        name: [{ given: ['Jane'] }],
      };
      expect(PatientHelpers.getDisplayName(patientGivenOnly)).toBe('Jane');
    });

    it('should prefer official name over other uses', () => {
      const patientMultipleNames: Patient = {
        resourceType: 'Patient',
        id: 'multi-name',
        name: [
          { use: 'nickname', given: ['Johnny'] },
          { use: 'official', family: 'Doe', given: ['John'] },
        ],
      };
      expect(PatientHelpers.getDisplayName(patientMultipleNames)).toBe('John Doe');
    });
  });

  describe('PatientHelpers.getAge', () => {
    it('should calculate age from birthDate', () => {
      const now = new Date();
      const birthYear = now.getFullYear() - 30;
      const patient30: Patient = {
        resourceType: 'Patient',
        id: 'age-test',
        birthDate: `${birthYear}-01-01`,
      };

      const age = PatientHelpers.getAge(patient30);
      // Age could be 30 or 29 depending on current date
      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(30);
    });

    it('should return undefined for patient without birthDate', () => {
      const patientNoBirth: Patient = {
        resourceType: 'Patient',
        id: 'no-birth',
      };
      expect(PatientHelpers.getAge(patientNoBirth)).toBeUndefined();
    });
  });

  describe('PatientHelpers.getPrimaryPhone and getPrimaryEmail', () => {
    it('should extract phone', () => {
      const phone = PatientHelpers.getPrimaryPhone(mockPatient);
      expect(phone).toBe('555-123-4567');
    });

    it('should extract email', () => {
      const email = PatientHelpers.getPrimaryEmail(mockPatient);
      expect(email).toBe('john.doe@example.com');
    });

    it('should return undefined for missing contact info', () => {
      const patientNoContact: Patient = {
        resourceType: 'Patient',
        id: 'no-contact',
      };
      expect(PatientHelpers.getPrimaryPhone(patientNoContact)).toBeUndefined();
      expect(PatientHelpers.getPrimaryEmail(patientNoContact)).toBeUndefined();
    });
  });

  describe('PatientHelpers.getPrimaryAddress', () => {
    it('should return formatted address', () => {
      const address = PatientHelpers.getPrimaryAddress(mockPatient);
      expect(address).toBe('123 Main St, Anytown, CA, 12345, USA');
    });

    it('should return undefined for patient without address', () => {
      const patientNoAddress: Patient = {
        resourceType: 'Patient',
        id: 'no-address',
      };
      expect(PatientHelpers.getPrimaryAddress(patientNoAddress)).toBeUndefined();
    });
  });

  describe('PatientHelpers.isDeceased', () => {
    it('should return false for living patient', () => {
      expect(PatientHelpers.isDeceased(mockPatient)).toBe(false);
    });

    it('should return true for deceasedBoolean = true', () => {
      const deceasedPatient: Patient = {
        resourceType: 'Patient',
        id: 'deceased',
        deceasedBoolean: true,
      };
      expect(PatientHelpers.isDeceased(deceasedPatient)).toBe(true);
    });

    it('should return true for deceasedDateTime', () => {
      const deceasedPatient: Patient = {
        resourceType: 'Patient',
        id: 'deceased',
        deceasedDateTime: '2023-01-15T10:30:00Z',
      };
      expect(PatientHelpers.isDeceased(deceasedPatient)).toBe(true);
    });
  });

  describe('PatientHelpers.getMRN', () => {
    it('should extract MRN from identifiers', () => {
      const patientWithMRN: Patient = {
        resourceType: 'Patient',
        id: 'mrn-test',
        identifier: [
          {
            type: {
              coding: [{ code: 'MR', system: 'http://terminology.hl7.org/CodeSystem/v2-0203' }],
            },
            value: 'MRN123456',
          },
        ],
      };
      expect(PatientHelpers.getMRN(patientWithMRN)).toBe('MRN123456');
    });

    it('should return undefined for patient without MRN', () => {
      expect(PatientHelpers.getMRN(mockPatient)).toBeUndefined();
    });
  });

  describe('Patient object validation', () => {
    it('should have required FHIR properties', () => {
      expect(mockPatient.resourceType).toBe('Patient');
      expect(mockPatient.id).toBeDefined();
    });

    it('should have valid gender code', () => {
      const validGenders = ['male', 'female', 'other', 'unknown', undefined];
      expect(validGenders).toContain(mockPatient.gender);
    });

    it('should have valid telecom system', () => {
      mockPatient.telecom?.forEach(t => {
        expect(['phone', 'email', 'fax', 'pager', 'url', 'sms', 'other']).toContain(t.system);
      });
    });
  });
});
