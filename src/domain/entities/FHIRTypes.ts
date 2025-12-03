/**
 * FHIR R4 Base Types
 *
 * Core FHIR R4 data types used across all resources.
 * These types are based on the HL7 FHIR R4 specification.
 *
 * @see https://www.hl7.org/fhir/r4/datatypes.html
 */

/**
 * Base resource interface that all FHIR resources extend
 */
export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: Meta;
  implicitRules?: string;
  language?: string;
  text?: Narrative;
  contained?: FHIRResource[];
  extension?: Extension[];
  modifierExtension?: Extension[];
}

/**
 * Meta information about a resource
 */
export interface Meta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: Coding[];
  tag?: Coding[];
}

/**
 * Human-readable summary of the resource
 */
export interface Narrative {
  status: 'generated' | 'extensions' | 'additional' | 'empty';
  div: string;
}

/**
 * Extension element for additional data
 */
export interface Extension {
  url: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueDecimal?: number;
  valueString?: string;
  valueUri?: string;
  valueUrl?: string;
  valueCode?: string;
  valueDateTime?: string;
  valueDate?: string;
  valueTime?: string;
  valueCoding?: Coding;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueReference?: Reference;
  valuePeriod?: Period;
  valueIdentifier?: Identifier;
}

/**
 * A reference from one resource to another
 */
export interface Reference {
  reference?: string;
  type?: string;
  identifier?: Identifier;
  display?: string;
}

/**
 * A time period defined by a start and end date/time
 */
export interface Period {
  start?: string;
  end?: string;
}

/**
 * An identifier for a resource
 */
export interface Identifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: CodeableConcept;
  system?: string;
  value?: string;
  period?: Period;
  assigner?: Reference;
}

/**
 * A concept that may be defined by a coding system
 */
export interface CodeableConcept {
  coding?: Coding[];
  text?: string;
}

/**
 * A reference to a code defined by a terminology system
 */
export interface Coding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

/**
 * A measured or measurable amount
 */
export interface Quantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

/**
 * A name of a human with text, parts and usage information
 */
export interface HumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: Period;
}

/**
 * An address expressed using postal conventions
 */
export interface Address {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: Period;
}

/**
 * Contact details for a person or organization
 */
export interface ContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: Period;
}

/**
 * A ratio of two Quantity values
 */
export interface Ratio {
  numerator?: Quantity;
  denominator?: Quantity;
}

/**
 * A set of ordered Quantities defined by a low and high limit
 */
export interface Range {
  low?: Quantity;
  high?: Quantity;
}

/**
 * Annotation for adding notes and explanations
 */
export interface Annotation {
  authorReference?: Reference;
  authorString?: string;
  time?: string;
  text: string;
}

/**
 * Dosage instructions for medication
 */
export interface Dosage {
  sequence?: number;
  text?: string;
  additionalInstruction?: CodeableConcept[];
  patientInstruction?: string;
  timing?: Timing;
  asNeededBoolean?: boolean;
  asNeededCodeableConcept?: CodeableConcept;
  site?: CodeableConcept;
  route?: CodeableConcept;
  method?: CodeableConcept;
  doseAndRate?: Array<{
    type?: CodeableConcept;
    doseRange?: Range;
    doseQuantity?: Quantity;
    rateRatio?: Ratio;
    rateRange?: Range;
    rateQuantity?: Quantity;
  }>;
  maxDosePerPeriod?: Ratio;
  maxDosePerAdministration?: Quantity;
  maxDosePerLifetime?: Quantity;
}

/**
 * Timing schedule for events
 */
export interface Timing {
  event?: string[];
  repeat?: {
    boundsDuration?: {
      value?: number;
      unit?: string;
      system?: string;
      code?: string;
    };
    boundsRange?: Range;
    boundsPeriod?: Period;
    count?: number;
    countMax?: number;
    duration?: number;
    durationMax?: number;
    durationUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
    frequency?: number;
    frequencyMax?: number;
    period?: number;
    periodMax?: number;
    periodUnit?: 's' | 'min' | 'h' | 'd' | 'wk' | 'mo' | 'a';
    dayOfWeek?: Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>;
    timeOfDay?: string[];
    when?: string[];
    offset?: number;
  };
  code?: CodeableConcept;
}

/**
 * FHIR Bundle for collections of resources
 */
export interface Bundle<T extends FHIRResource = FHIRResource> {
  resourceType: 'Bundle';
  id?: string;
  meta?: Meta;
  type:
    | 'document'
    | 'message'
    | 'transaction'
    | 'transaction-response'
    | 'batch'
    | 'batch-response'
    | 'history'
    | 'searchset'
    | 'collection';
  timestamp?: string;
  total?: number;
  link?: Array<{
    relation: string;
    url: string;
  }>;
  entry?: Array<{
    fullUrl?: string;
    resource?: T;
    search?: {
      mode?: 'match' | 'include' | 'outcome';
      score?: number;
    };
    request?: {
      method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      url: string;
      ifNoneMatch?: string;
      ifModifiedSince?: string;
      ifMatch?: string;
      ifNoneExist?: string;
    };
    response?: {
      status: string;
      location?: string;
      etag?: string;
      lastModified?: string;
      outcome?: FHIRResource;
    };
  }>;
}

/**
 * Source metadata for multi-provider support
 * This is a custom extension to track which provider/EMR each record came from
 */
export interface SourceMetadata {
  providerId: string;
  providerName: string;
  providerIconUrl?: string;
  serverUrl: string;
  fetchedAt: string;
  accessToken?: string; // Do not persist - for runtime use only
}

/**
 * Extended FHIR resource with source tracking
 */
export interface FHIRResourceWithSource<T extends FHIRResource = FHIRResource> {
  resource: T;
  source: SourceMetadata;
}
