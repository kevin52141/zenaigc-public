import type { KeyProvider } from '../credentials'
import type {
  VeoGenerateArgs,
  VeoGenerateResult,
  VeoInputMode,
  VeoLongRunningRequest,
  VeoLongRunningResponse,
  VeoOperation,
  VeoPollResult,
  VeoSubmitResponse,
} from './veo-types'

export class VeoApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
  }
}

export interface VeoClientOptions {
  modelId?: string
  pollIntervalMs?: number
  pollTimeoutMs?: number
}

const DEFAULT_MODEL_ID = 'veo-3.1-generate-001'
const DEFAULT_POLL_INTERVAL_MS = 5_000
const DEFAULT_POLL_TIMEOUT_MS = 600_000

export class VeoClient {
  private readonly modelId: string
  private readonly pollIntervalMs: number
  private readonly pollTimeoutMs: number

  constructor(private readonly keyProvider: KeyProvider, options: VeoClientOptions = {}) {
    this.modelId = options.modelId ?? DEFAULT_MODEL_ID
    this.pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS
    this.pollTimeoutMs = options.pollTimeoutMs ?? DEFAULT_POLL_TIMEOUT_MS
  }

  async submit(args: VeoGenerateArgs): Promise<VeoSubmitResponse> {
    const inputMode: VeoInputMode = args.input_mode ?? 't2v'
    const body = buildVeoRequest(this.modelId, args)
    const payload = await this.request(
      `/v1beta/models/${encodeURIComponent(this.modelId)}:predictLongRunning`,
      { method: 'POST', body: JSON.stringify(body) },
      'submit'
    )
    return parseSubmitResponse(payload, this.modelId)
  }

  async poll(operationName: string): Promise<VeoPollResult> {
    const payload = await this.request(
      `/v1beta/${encodeURIComponent(operationName)}`,
      { method: 'GET' },
      'poll'
    )
    return parsePollResponse(payload)
  }

  async waitForCompletion(operationName: string): Promise<VeoPollResult> {
    const deadline = Date.now() + this.pollTimeoutMs
    while (Date.now() < deadline) {
      const result = await this.poll(operationName)
      if (result.done || result.error) return result
      await new Promise((r) => setTimeout(r, this.pollIntervalMs))
    }
    throw new VeoApiError(`Veo 轮询超时 (${this.pollTimeoutMs / 1000}s): ${operationName}`, 504)
  }

  async generate(args: VeoGenerateArgs): Promise<VeoGenerateResult> {
    const submitted = await this.submit(args)
    const completed = await this.waitForCompletion(submitted.operation_name)
    if (completed.error) {
      throw new VeoApiError(`Veo 生成失败: ${completed.error}`)
    }
    return {
      ok: true,
      video_uri: completed.video_uri ?? null,
      operation_name: submitted.operation_name,
      model_id: submitted.model_id,
    }
  }

  private async request(path: string, init: RequestInit, opLabel: string): Promise<unknown> {
    const { api_key, base_url } = await this.keyProvider.get()
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${api_key}`)
    headers.set('Content-Type', 'application/json')
    const res = await fetch(`${base_url}${path}`, { ...init, headers })
    const text = await res.text()
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      throw new VeoApiError(
        `Veo 非 JSON 响应 (HTTP ${res.status}): ${text.slice(0, 200)}`,
        res.status
      )
    }
    if (!res.ok) {
      const msg = extractError(parsed) || text || `HTTP ${res.status}`
      throw new VeoApiError(`Veo ${opLabel} 错误: ${msg}`, res.status)
    }
    return parsed
  }
}

function buildVeoRequest(modelId: string, args: VeoGenerateArgs): VeoLongRunningRequest {
  const instance: VeoLongRunningRequest['instances'][0] = {}

  if (args.prompt) {
    instance.prompt = args.prompt
  }

  if (args.image_base64) {
    instance.image = {
      inlineData: {
        mimeType: args.image_mime_type ?? 'image/png',
        data: args.image_base64,
      },
    }
  }

  if (args.last_frame_base64) {
    instance.lastFrame = {
      inlineData: {
        mimeType: args.last_frame_mime_type ?? 'image/png',
        data: args.last_frame_base64,
      },
    }
  }

  if (args.reference_images?.length) {
    instance.referenceImages = args.reference_images.map((ref) => ({
      image: {
        inlineData: {
          mimeType: ref.mimeType ?? 'image/png',
          data: ref.base64,
        },
      },
      referenceType: ref.referenceType ?? 'asset',
    }))
  }

  const parameters: VeoLongRunningRequest['parameters'] = {}

  if (args.aspect_ratio) parameters.aspectRatio = args.aspect_ratio
  if (args.duration_seconds) parameters.durationSeconds = args.duration_seconds
  if (args.resolution) parameters.resolution = args.resolution
  if (args.person_generation) parameters.personGeneration = args.person_generation
  if (args.generate_audio !== undefined) parameters.generateAudio = args.generate_audio
  if (args.negative_prompt) parameters.negativePrompt = args.negative_prompt
  if (args.enhance_prompt !== undefined) parameters.enhancePrompt = args.enhance_prompt
  if (args.seed !== undefined && args.seed !== 0) parameters.seed = args.seed
  parameters.numberOfVideos = 1

  return { instances: [instance], parameters }
}

function parseSubmitResponse(payload: unknown, modelId: string): VeoSubmitResponse {
  const obj = payload as Record<string, unknown>
  const name = obj.name
  if (typeof name !== 'string') {
    throw new VeoApiError('Veo submit 响应缺少 operation name')
  }
  return {
    ok: true,
    operation_name: name,
    status: obj.done ? 'completed' : 'submitted',
    model_id: modelId,
  }
}

function parsePollResponse(payload: unknown): VeoPollResult {
  const op = payload as VeoOperation
  const samples = op.response?.generateVideoResponse?.generatedSamples
  const firstSample = samples?.[0]
  return {
    done: !!op.done,
    video_uri: firstSample?.video?.uri ?? null,
    video_mime_type: firstSample?.video?.mimeType ?? null,
    error: op.error?.message ?? null,
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
