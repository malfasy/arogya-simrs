import type { Diagnosis, Patient, PrescriptionItem } from './types'
import { uid } from './format'

/**
 * Mock Satu Sehat (Kemenkes) service. It mimics the real integration pattern:
 * 1) OAuth2 client_credentials -> bearer token
 * 2) POST FHIR R4 resources to the /fhir-r4/v1 base, receiving the created
 *    resource echoed back with a server-assigned logical id + meta.
 * Everything runs in memory with small artificial latency to feel like a network call.
 */

export const FHIR_BASE = 'https://api-satusehat.kemkes.go.id/fhir-r4/v1'
export const OAUTH_ENDPOINT =
  'https://api-satusehat.kemkes.go.id/oauth2/v1/accesstoken?grant_type=client_credentials'

export const NIK_SYSTEM = 'https://fhir.kemkes.go.id/id/nik'
const ORG_ID = '10000004' // mock organization id (RS mock)

export interface MockToken {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  scope: string
  issued_at: number
}

function randomToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < 48; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function requestOAuthToken(): Promise<{
  request: unknown
  response: MockToken
  endpoint: string
}> {
  await delay(400)
  const token: MockToken = {
    access_token: randomToken(),
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'read write',
    issued_at: Date.now(),
  }
  return {
    endpoint: OAUTH_ENDPOINT,
    request: {
      grant_type: 'client_credentials',
      client_id: 'MOCK-CLIENT-ID-Arogya',
      client_secret: '••••••••••••••••',
    },
    response: token,
  }
}

export function isTokenValid(token: MockToken | null): boolean {
  if (!token) return false
  return Date.now() < token.issued_at + token.expires_in * 1000
}

// ---- FHIR R4 resource builders ----

export function buildPatientResource(patient: Patient) {
  return {
    resourceType: 'Patient',
    identifier: [
      {
        use: 'official',
        system: NIK_SYSTEM,
        value: patient.nik,
      },
    ],
    active: true,
    name: [{ use: 'official', text: patient.name }],
    gender: patient.gender,
    birthDate: patient.birthDate,
    address: [
      {
        use: 'home',
        text: patient.address,
        country: 'ID',
      },
    ],
    telecom: [{ system: 'phone', value: patient.phone, use: 'mobile' }],
  }
}

export function buildEncounterResource(params: {
  patientSatuSehatId: string
  patientName: string
  complaint: string
}) {
  const now = new Date().toISOString()
  return {
    resourceType: 'Encounter',
    status: 'arrived',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    subject: {
      reference: `Patient/${params.patientSatuSehatId}`,
      display: params.patientName,
    },
    serviceProvider: { reference: `Organization/${ORG_ID}` },
    period: { start: now },
    reasonCode: [{ text: params.complaint }],
  }
}

export function buildConditionResource(params: {
  patientSatuSehatId: string
  patientName: string
  encounterId: string
  diagnosis: Diagnosis
}) {
  return {
    resourceType: 'Condition',
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-category',
            code: 'encounter-diagnosis',
            display: 'Encounter Diagnosis',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://hl7.org/fhir/sid/icd-10',
          code: params.diagnosis.code,
          display: params.diagnosis.display,
        },
      ],
      text: params.diagnosis.display,
    },
    subject: {
      reference: `Patient/${params.patientSatuSehatId}`,
      display: params.patientName,
    },
    encounter: { reference: `Encounter/${params.encounterId}` },
  }
}

// ---- Mock POST ----

export async function postResource(
  resourceType: string,
  resource: Record<string, unknown>,
): Promise<{ endpoint: string; response: Record<string, unknown>; assignedId: string }> {
  await delay(500)
  const assignedId = uid(resourceType.toLowerCase()).replace(/^[a-z]+-/, '')
  const response = {
    ...resource,
    id: assignedId,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
    },
  }
  return {
    endpoint: `${FHIR_BASE}/${resourceType}`,
    response,
    assignedId,
  }
}

// exported for display convenience
export type { PrescriptionItem }
