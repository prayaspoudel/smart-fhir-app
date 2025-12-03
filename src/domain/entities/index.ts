/**
 * Domain Entities Index
 *
 * Export all FHIR R4 entities for use across the application
 */

// Base FHIR Types
export * from './FHIRTypes';

// FHIR Resources
export * from './Patient';
export * from './Observation';
export * from './DiagnosticReport';
export * from './Encounter';
export * from './MedicationRequest';
export * from './Consent';

// Provider entity for multi-source support
export * from './Provider';

// Auth entities
export * from './AuthEntities';
