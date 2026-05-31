import type { KeyProvider } from '../credentials'
import type { NbAspectRatio, NbTier } from './types'

export class NbApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
  }
}

export interface NbRouteResolved {
  tier: NbTier
  model_id: string
}

const MODEL_ID_BY_TIER: Record<NbTier, string> = {
  flash: 'gemini-3.1-flash-image-preview',
  pro: 'gemini-3-pro-image-preview',
}

export function resolveNbRoute(tier: NbTier): NbRouteResolved {
  return { tier, model_id: MODEL_ID_BY_TIER[tier] }
}

export interface NbResponsePayload {
  image_url: string | null
  inline_base64: string | null
}

export class NbClient {
  constructor(private readonly keyProvider: KeyProvider) {}

  async generate(
    prompt: string,
    aspectRatio: NbAspectRatio,
    route: NbRouteResolved
  ): Promise<NbResponsePayload> {
    const { api_key, base_url } = await this.keyProvider.get()
    const url = `${base_url}/v1beta/models/${route.model_id}:generateContent`
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio },
      },
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      throw new NbApiError(`NB 非 JSON 响应 (HTTP ${res.status}): ${text.slice(0, 200)}`, res.status)
    }
    if (!res.ok) {
      const msg = extractError(parsed) || text || `HTTP ${res.status}`
      throw new NbApiError(`NB API 错误 [${route.tier}]: ${msg}`, res.status)
    }
    return parseNbResponse(parsed)
  }
}

function extractError(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const obj = payload as Record<string, unknown>
  if (typeof obj.message === 'string') return obj.message
  if (obj.error && typeof obj.error === 'object') {
    const e = obj.error as Record<string, unknown>
    if (typeof e.message === 'string') return e.message
  }
  return ''
}

function parseNbResponse(payload: unknown): NbResponsePayload {
  const candidates = (payload as { candidates?: unknown[] })?.candidates
  if (!Array.isArray(candidates) || !candidates.length) {
    throw new NbApiError('NB 响应缺少 candidates')
  }
  const parts = (candidates[0] as { content?: { parts?: unknown[] } })?.content?.parts
  if (!Array.isArray(parts) || !parts.length) {
    throw new NbApiError('NB 响应缺少 content.parts')
  }
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } })?.inlineData
    if (inline && typeof inline.data === 'string') {
      return { image_url: null, inline_base64: inline.data }
    }
  }
  for (const part of parts) {
    const text = (part as { text?: string })?.text
    if (typeof text === 'string') {
      const m = text.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/)
      if (m) return { image_url: m[1], inline_base64: null }
    }
  }
  throw new NbApiError('NB 响应未提取到 inlineData 或 markdown 图片')
}
