import type { KeyProvider } from '../credentials'
import type { Image2Mode, Image2Quality } from './types'

export class Image2ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
  }
}

export interface Image2RouteResolved {
  quality: Image2Quality
  mode: Image2Mode
  model_id: string
  size: string
}

const MODEL_ID = 'gpt-image-2'

export function resolveImage2Route(quality: Image2Quality, mode: Image2Mode): Image2RouteResolved {
  const size = quality === '4k' ? '3840x2160' : '2048x2048'
  return { quality, mode, model_id: MODEL_ID, size }
}

export interface Image2ResponsePayload {
  image_url: string | null
  inline_base64: string | null
}

interface ImagesApiResponse {
  data?: Array<{ url?: string; b64_json?: string }>
}

export class Image2Client {
  constructor(private readonly keyProvider: KeyProvider) {}

  async generate(prompt: string, route: Image2RouteResolved): Promise<Image2ResponsePayload> {
    const { api_key, base_url } = await this.keyProvider.get()
    const url = `${base_url}/v1/images/generations`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: route.model_id,
        size: route.size,
        prompt,
        n: 1,
      }),
    })
    return parseImagesResponse(res, route)
  }

  async edit(
    prompt: string,
    referenceFileName: string,
    referenceBytes: ArrayBuffer,
    referenceMime: string,
    route: Image2RouteResolved
  ): Promise<Image2ResponsePayload> {
    const { api_key, base_url } = await this.keyProvider.get()
    const url = `${base_url}/v1/images/edits`
    const form = new FormData()
    form.append('model', route.model_id)
    form.append('size', route.size)
    form.append('prompt', prompt)
    form.append('n', '1')
    form.append('image', new Blob([referenceBytes], { type: referenceMime }), referenceFileName)
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${api_key}` },
      body: form,
    })
    return parseImagesResponse(res, route)
  }
}

async function parseImagesResponse(
  res: Response,
  route: Image2RouteResolved
): Promise<Image2ResponsePayload> {
  const text = await res.text()
  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    throw new Image2ApiError(`Image2 非 JSON 响应 (HTTP ${res.status}): ${text.slice(0, 200)}`, res.status)
  }
  if (!res.ok) {
    const msg = extractError(parsed) || text || `HTTP ${res.status}`
    throw new Image2ApiError(`Image2 API 错误 [${route.quality}/${route.mode}]: ${msg}`, res.status)
  }
  const data = (parsed as ImagesApiResponse)?.data
  if (!Array.isArray(data) || !data.length) {
    throw new Image2ApiError('Image2 响应缺少 data')
  }
  const first = data[0]
  return {
    image_url: first.url || null,
    inline_base64: first.b64_json || null,
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
