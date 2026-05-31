export interface NewapiCredentials {
  api_key: string
  base_url: string
}

export interface CredentialsFile {
  newapi?: NewapiCredentials
}

export interface KeyProvider {
  get(): Promise<NewapiCredentials>
  invalidate?(): void
}

export class CredentialsError extends Error {}

const DEFAULT_BASE_URL = 'https://api.zenaigc.com'
const DEFAULT_CACHE_TTL_MS = 60_000

const SCHEMA_HINT = `预期 schema：{ "newapi": { "api_key": "sk-...", "base_url": "https://api.zenaigc.com" } }`

export interface CreateKeyProviderOptions {
  readCredentialsFile: () => Promise<string>
  defaultBaseUrl?: string
  cacheTtlMs?: number
}

export function createKeyProvider(options: CreateKeyProviderOptions): KeyProvider {
  const {
    readCredentialsFile,
    defaultBaseUrl = DEFAULT_BASE_URL,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  } = options

  let cached: CredentialsFile | null = null
  let cachedAt = 0

  async function getCredentialsFile(): Promise<CredentialsFile> {
    const now = Date.now()
    if (cached && now - cachedAt < cacheTtlMs) return cached
    let raw: string
    try {
      raw = await readCredentialsFile()
    } catch (e) {
      throw new CredentialsError(`读取 credentials.json 失败：${(e as Error).message ?? e}`)
    }
    if (!raw.trim()) throw new CredentialsError('credentials.json 为空')
    try {
      const parsed = JSON.parse(raw) as CredentialsFile
      cached = parsed
      cachedAt = now
      return parsed
    } catch (e) {
      throw new CredentialsError(`credentials.json JSON 解析失败：${(e as Error).message}`)
    }
  }

  return {
    async get(): Promise<NewapiCredentials> {
      const creds = await getCredentialsFile()
      if (!creds.newapi || !creds.newapi.api_key) {
        throw new CredentialsError(`credentials.json 缺少 newapi.api_key。${SCHEMA_HINT}`)
      }
      return {
        api_key: creds.newapi.api_key,
        base_url: creds.newapi.base_url || defaultBaseUrl,
      }
    },
    invalidate() {
      cached = null
      cachedAt = 0
    },
  }
}
