/**
 * FHIR R4 Observation Entity
 *
 * Represents clinical observations/measurements (vital signs, lab results, etc.)
 *
 * @see https://www.hl7.org/fhir/r4/observation.html
 */

import {
  FHIRResource,
  CodeableConcept,
  Reference,
  Quantity,
  Period,
  Identifier,
  Range,
  Ratio,
  Annotation,
  Coding,
} from './FHIRTypes';

export type ObservationStatus =
  | 'registered'
  | 'preliminary'
  | 'final'
  | 'amended'
  | 'corrected'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown';

export interface ObservationComponent {
  code: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: {
    origin: Quantity;
    period: number;
    factor?: number;
    lowerLimit?: number;
    upperLimit?: number;
    dimensions: number;
    data?: string;
  };
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: Period;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
}

export interface ObservationReferenceRange {
  low?: Quantity;
  high?: Quantity;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  age?: Range;
  text?: string;
}

export interface Observation extends FHIRResource {
  resourceType: 'Observation';
  identifier?: Identifier[];
  basedOn?: Reference[];
  partOf?: Reference[];
  status: ObservationStatus;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  focus?: Reference[];
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  effectiveTiming?: {
    event?: string[];
    code?: CodeableConcept;
  };
  effectiveInstant?: string;
  issued?: string;
  performer?: Reference[];
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: {
    origin: Quantity;
    period: number;
    factor?: number;
    lowerLimit?: number;
    upperLimit?: number;
    dimensions: number;
    data?: string;
  };
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: Period;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  specimen?: Reference;
  device?: Reference;
  referenceRange?: ObservationReferenceRange[];
  hasMember?: Reference[];
  derivedFrom?: Reference[];
  component?: ObservationComponent[];
}

/**
 * Common vital signs LOINC codes
 */
export const VitalSignsCodes = {
  BLOOD_PRESSURE_SYSTOLIC: '8480-6',
  BLOOD_PRESSURE_DIASTOLIC: '8462-4',
  BLOOD_PRESSURE_PANEL: '85354-9',
  HEART_RATE: '8867-4',
  RESPIRATORY_RATE: '9279-1',
  BODY_TEMPERATURE: '8310-5',
  BODY_HEIGHT: '8302-2',
  BODY_WEIGHT: '29463-7',
  BMI: '39156-5',
  OXYGEN_SATURATION: '2708-6',
  HEAD_CIRCUMFERENCE: '9843-4',
} as const;

/**
 * Observation category codes
 */
export const ObservationCategories = {
  VITAL_SIGNS: 'vital-signs',
  LABORATORY: 'laboratory',
  IMAGING: 'imaging',
  PROCEDURE: 'procedure',
  SURVEY: 'survey',
  EXAM: 'exam',
  THERAPY: 'therapy',
  ACTIVITY: 'activity',
  SOCIAL_HISTORY: 'social-history',
} as const;

/**
 * Helper functions for Observation entity
 */
export const ObservationHelpers = {
  /**
   * Get the display name of the observation
   */
  getDisplayName(observation: Observation): string {
    return (
      observation.code.text ||
      observation.code.coding?.[0]?.display ||
      observation.code.coding?.[0]?.code ||
      'Unknown Observation'
    );
  },

  /**
   * Get the value as a formatted string
   */
  getValueString(observation: Observation): string {
    if (observation.valueQuantity) {
      const value = observation.valueQuantity.value;
      const unit = observation.valueQuantity.unit || observation.valueQuantity.code || '';
      return `${value} ${unit}`.trim();
    }

    if (observation.valueCodeableConcept) {
      return (
        observation.valueCodeableConcept.text ||
        observation.valueCodeableConcept.coding?.[0]?.display ||
        ''
      );
    }

    if (observation.valueString !== undefined) {
      return observation.valueString;
    }

    if (observation.valueBoolean !== undefined) {
      return observation.valueBoolean ? 'Yes' : 'No';
    }

    if (observation.valueInteger !== undefined) {
      return observation.valueInteger.toString();
    }

    if (observation.valueDateTime) {
      return new Date(observation.valueDateTime).toLocaleString();
    }

    // Check components for composite values (e.g., blood pressure)
    if (observation.component && observation.component.length > 0) {
      return observation.component
        .map(c => {
          if (c.valueQuantity) {
            return `${c.valueQuantity.value} ${c.valueQuantity.unit || ''}`.trim();
          }
          return '';
        })
        .filter(Boolean)
        .join(' / ');
    }

    return observation.dataAbsentReason?.text || 'No value';
  },

  /**
   * Get the effective date/time
   */
  getEffectiveDate(observation: Observation): Date | undefined {
    if (observation.effectiveDateTime) {
      return new Date(observation.effectiveDateTime);
    }
    if (observation.effectivePeriod?.start) {
      return new Date(observation.effectivePeriod.start);
    }
    if (observation.effectiveInstant) {
      return new Date(observation.effectiveInstant);
    }
    if (observation.issued) {
      return new Date(observation.issued);
    }
    return undefined;
  },

  /**
   * Check if observation is a vital sign
   */
  isVitalSign(observation: Observation): boolean {
    return (
      observation.category?.some(cat =>
        cat.coding?.some(
          (coding: Coding) =>
            coding.code === ObservationCategories.VITAL_SIGNS ||
            coding.system === 'http://terminology.hl7.org/CodeSystem/observation-category'
        )
      ) ?? false
    );
  },

  /**
   * Check if observation is a lab result
   */
  isLabResult(observation: Observation): boolean {
    return (
      observation.category?.some(cat =>
        cat.coding?.some((coding: Coding) => coding.code === ObservationCategories.LABORATORY)
      ) ?? false
    );
  },

  /**
   * Get interpretation display (e.g., "High", "Low", "Normal")
   */
  getInterpretation(observation: Observation): string | undefined {
    const interp = observation.interpretation?.[0];
    if (!interp) {
      return undefined;
    }

    return interp.text || interp.coding?.[0]?.display || interp.coding?.[0]?.code;
  },

  /**
   * Check if value is outside reference range
   */
  isAbnormal(observation: Observation): boolean {
    const interpretation = observation.interpretation?.[0]?.coding?.[0]?.code;
    if (interpretation) {
      // HL7 interpretation codes for abnormal values
      const abnormalCodes = ['H', 'HH', 'L', 'LL', 'A', 'AA', 'U', 'D'];
      return abnormalCodes.includes(interpretation);
    }

    // Check against reference range
    if (observation.valueQuantity?.value !== undefined && observation.referenceRange?.[0]) {
      const value = observation.valueQuantity.value;
      const range = observation.referenceRange[0];
      if (range.low?.value !== undefined && value < range.low.value) {
        return true;
      }
      if (range.high?.value !== undefined && value > range.high.value) {
        return true;
      }
    }

    return false;
  },

  /**
   * Get LOINC code if available
   */
  getLoincCode(observation: Observation): string | undefined {
    const loincCoding = observation.code.coding?.find(
      (c: Coding) => c.system === 'http://loinc.org'
    );
    return loincCoding?.code;
  },
};

export default Observation;
