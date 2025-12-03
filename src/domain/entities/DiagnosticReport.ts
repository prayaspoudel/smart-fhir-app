/**
 * FHIR R4 DiagnosticReport Entity
 *
 * Represents laboratory and diagnostic reports
 *
 * @see https://www.hl7.org/fhir/r4/diagnosticreport.html
 */

import { FHIRResource, CodeableConcept, Reference, Identifier, Period, Coding } from './FHIRTypes';

export type DiagnosticReportStatus =
  | 'registered'
  | 'partial'
  | 'preliminary'
  | 'final'
  | 'amended'
  | 'corrected'
  | 'appended'
  | 'cancelled'
  | 'entered-in-error'
  | 'unknown';

export interface DiagnosticReportMedia {
  comment?: string;
  link: Reference;
}

export interface DiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  identifier?: Identifier[];
  basedOn?: Reference[];
  status: DiagnosticReportStatus;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference;
  encounter?: Reference;
  effectiveDateTime?: string;
  effectivePeriod?: Period;
  issued?: string;
  performer?: Reference[];
  resultsInterpreter?: Reference[];
  specimen?: Reference[];
  result?: Reference[];
  imagingStudy?: Reference[];
  media?: DiagnosticReportMedia[];
  conclusion?: string;
  conclusionCode?: CodeableConcept[];
  presentedForm?: Array<{
    contentType?: string;
    language?: string;
    data?: string;
    url?: string;
    size?: number;
    hash?: string;
    title?: string;
    creation?: string;
  }>;
}

/**
 * Diagnostic report category codes
 */
export const DiagnosticReportCategories = {
  LABORATORY: 'LAB',
  RADIOLOGY: 'RAD',
  CARDIOLOGY: 'CRD',
  PATHOLOGY: 'PATH',
  MICROBIOLOGY: 'MB',
  OTHER: 'OTH',
} as const;

/**
 * Helper functions for DiagnosticReport entity
 */
export const DiagnosticReportHelpers = {
  /**
   * Get the display name of the report
   */
  getDisplayName(report: DiagnosticReport): string {
    return (
      report.code.text ||
      report.code.coding?.[0]?.display ||
      report.code.coding?.[0]?.code ||
      'Unknown Report'
    );
  },

  /**
   * Get the report category as display string
   */
  getCategory(report: DiagnosticReport): string {
    const category = report.category?.[0];
    if (!category) {
      return 'Unknown';
    }

    return (
      category.text || category.coding?.[0]?.display || category.coding?.[0]?.code || 'Unknown'
    );
  },

  /**
   * Get the effective/issue date
   */
  getEffectiveDate(report: DiagnosticReport): Date | undefined {
    if (report.effectiveDateTime) {
      return new Date(report.effectiveDateTime);
    }
    if (report.effectivePeriod?.start) {
      return new Date(report.effectivePeriod.start);
    }
    if (report.issued) {
      return new Date(report.issued);
    }
    return undefined;
  },

  /**
   * Get status display string
   */
  getStatusDisplay(report: DiagnosticReport): string {
    const statusMap: Record<DiagnosticReportStatus, string> = {
      registered: 'Registered',
      partial: 'Partial',
      preliminary: 'Preliminary',
      final: 'Final',
      amended: 'Amended',
      corrected: 'Corrected',
      appended: 'Appended',
      cancelled: 'Cancelled',
      'entered-in-error': 'Entered in Error',
      unknown: 'Unknown',
    };
    return statusMap[report.status] || report.status;
  },

  /**
   * Check if report is finalized
   */
  isFinal(report: DiagnosticReport): boolean {
    return ['final', 'amended', 'corrected', 'appended'].includes(report.status);
  },

  /**
   * Check if this is a lab report
   */
  isLabReport(report: DiagnosticReport): boolean {
    return (
      report.category?.some(cat =>
        cat.coding?.some(
          (coding: Coding) =>
            coding.code === 'LAB' ||
            coding.code === 'laboratory' ||
            coding.system?.includes('diagnostic-service-sections')
        )
      ) ?? false
    );
  },

  /**
   * Check if this is an imaging/radiology report
   */
  isImagingReport(report: DiagnosticReport): boolean {
    return (
      report.category?.some(cat =>
        cat.coding?.some(
          (coding: Coding) =>
            coding.code === 'RAD' ||
            coding.code === 'radiology' ||
            coding.system?.includes('diagnostic-service-sections')
        )
      ) ?? false
    );
  },

  /**
   * Get performer display name
   */
  getPerformerName(report: DiagnosticReport): string | undefined {
    return report.performer?.[0]?.display;
  },

  /**
   * Check if report has downloadable content
   */
  hasDownloadableContent(report: DiagnosticReport): boolean {
    return (
      (report.presentedForm?.some(f => f.url || f.data) ?? false) || (report.media?.length ?? 0) > 0
    );
  },
};

export default DiagnosticReport;
