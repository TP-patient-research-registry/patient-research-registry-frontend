import type { components } from "./schema";

type Schemas = components["schemas"];

export type AccessLogEntry = Schemas["AccessLogEntry"];
export type Consent = Schemas["Consent"];
export type ConsentDocument = Schemas["ConsentDocument"];
export type ConsentKind = Schemas["KindEnum"];
export type DeletionRequest = Schemas["DeletionRequest"];
export type EligibilityCriteria = Schemas["EligibilityCriteria"];
export type CriteriaSex = Schemas["EligibilityCriteriaSexEnum"];
export type Enrollment = Schemas["Enrollment"];
export type EnrollmentStatus = Schemas["EnrollmentStatusEnum"];
export type NotificationPreference = Schemas["NotificationPreference"];
export type ParticipantProfile = Schemas["ParticipantProfile"];
export type ParticipantResponse = Schemas["ParticipantResponse"];
export type PseudonymizedEnrollment = Schemas["PseudonymizedEnrollment"];
export type PseudonymizedResponse = Schemas["PseudonymizedResponse"];
export type PublicStudy = Schemas["PublicStudy"];
export type Questionnaire = Schemas["Questionnaire"];
export type Region = Schemas["RegionEnum"];
export type ResearcherProfile = Schemas["ResearcherProfile"];
export type ResearcherStudy = Schemas["ResearcherStudy"];
export type Sex = Schemas["ParticipantProfileSexEnum"];
export type StudyStatus = Schemas["StudyStatusEnum"];

export type Paginated<T> = { count: number; next?: string | null; previous?: string | null; results: T[] };

export const REGIONS: readonly Region[] = ["BA", "TT", "TN", "NR", "ZA", "BB", "PO", "KE"];
export const SEXES: readonly Sex[] = ["female", "male", "other"];
export const CRITERIA_SEXES: readonly CriteriaSex[] = ["any", "female", "male"];

/** ICD-10 code, e.g. "E11" or "E11.9" — mirrors the backend validator. */
export const ICD10_PATTERN = /^[A-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$/;
