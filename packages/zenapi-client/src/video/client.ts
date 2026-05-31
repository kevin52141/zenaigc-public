import type { KeyProvider } from '../credentials'
import type {
  KlingTaskInfo,
  KlingVideoSubmitArgs,
  KlingVideoSubmitResponse,
  VideoInputMode,
} from './types'

export class VideoApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
  }
}

export interface KlingClientOptions {
  modelId?: string
  fetchVideoTimeoutMs?: number
}

const DEFAULT_MODEL_ID = 'kling-v2.6-pro'
const DEFAULT_VIDEO_DOWNLOAD_TIMEOUT_MS = 120_000

export class KlingClient {
  private readonly modelId: string
  private readonly fetchVideoTimeoutMs: number

  constructor(private readonly keyProvider: KeyProvider, options: KlingClientOptions = {}) {
    this.modelId = options.modelId ?? DEFAULT_MODEL_ID
    this.fetchVideoTimeoutMs = options.fetchVideoTimeoutMs ?? DEFAULT_VIDEO_DOWNLOAD_TIMEOUT_MS
  }

  async submit(args: KlingVideoSubmitArgs): Promise<KlingVideoSubmitResponse> {
    const endpointPath = resolveSubmitPath(args.input_mode)
    const body = buildSubmitBody(this.modelId, args)
    const payload = await this.request(
      endpointPath,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
      'submit'
    )
    return parseSubmitResponse(payload, endpointPath, args.input_mode)
  }

  // 查询路径必须与提交时的 endpoint 对应——i2v 任务在 image2video 路径下查,
  // 不会出现在 text2video。调用方应传 submit 返回的 input_mode 以路由正确 endpoint。
  async fetchTask(taskId: string, inputMode: VideoInputMode = 't2v'): Promise<KlingTaskInfo> {
    const endpointPath = resolveSubmitPath(inputMode)
    const payload = await this.request(
      `${endpointPath}/${encodeURIComponent(taskId)}`,
      { method: 'GET' },
      'fetchTask'
    )
    return parseTaskInfo(taskId, payload)
  }

  async fetchVideoBinary(videoUrl: string): Promise<ArrayBuffer> {
    const res = await fetch(videoUrl, {
      signal: AbortSignal.timeout(this.fetchVideoTimeoutMs),
    })
    if (!res.ok) throw new VideoApiError(`视频下载失败: HTTP ${res.status}`, res.status)
    return res.arrayBuffer()
  }

  private async request(path: string, init: RequestInit, opLabel: string): Promise<unknown> {
    const { api_key, base_url } = await this.keyProvider.get()
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${api_key}`)
    const res = await fetch(`${base_url}${path}`, { ...init, headers })
    const text = await res.text()
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      throw new VideoApiError(
        `Kling 非 JSON 响应 (HTTP ${res.status}): ${text.slice(0, 200)}`,
        res.status
      )
    }
    if (!res.ok) {
      const msg = extractError(parsed) || text || `HTTP ${res.status}`
      throw new VideoApiError(`Kling ${opLabel} 错误: ${msg}`, res.status)
    }
    return parsed
  }
}

function resolveSubmitPath(inputMode: VideoInputMode): string {
  return inputMode === 't2v' ? '/v1/videos/text2video' : '/v1/videos/image2video'
}

function unwrapData(payload: unknown): Record<string, unknown> {
  const obj = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>
  return (obj.data ?? obj) as Record<string, unknown>
}

function buildSubmitBody(modelId: string, args: KlingVideoSubmitArgs): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: modelId,
    prompt: args.prompt,
    duration: args.duration,
  }
  if (args.negative_prompt) body.negative_prompt = args.negative_prompt
  if (args.aspect_ratio && args.input_mode === 't2v') body.aspect_ratio = args.aspect_ratio
  if (args.cfg_scale !== undefined) body.cfg_scale = args.cfg_scale
  if (args.external_task_id) body.external_task_id = args.external_task_id
  if (args.callback_url) body.callback_url = args.callback_url
  if (args.image_url) body.image = args.image_url
  if (args.image_tail_url) body.image_tail = args.image_tail_url
  if (args.camera_preset && args.camera_preset !== 'none') {
    body.camera_control = {
      type: args.camera_preset,
      ...(args.camera_preset === 'simple' && args.camera_config ? { config: args.camera_config } : {}),
    }
  }
  if (args.generate_audio !== undefined) body.generate_audio = args.generate_audio
  return body
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

function parseSubmitResponse(
  payload: unknown,
  endpointPath: string,
  inputMode: VideoInputMode
): KlingVideoSubmitResponse {
  const data = unwrapData(payload)
  const taskId = data.task_id ?? data.id
  if (typeof taskId !== 'string') {
    throw new VideoApiError('Kling submit 响应缺少 task_id')
  }
  return {
    task_id: taskId,
    status: typeof data.status === 'string' ? data.status : 'submitted',
    created_at: typeof data.created_at === 'string' ? data.created_at : undefined,
    input_mode: inputMode,
    endpoint_path: endpointPath,
  }
}

function parseTaskInfo(taskId: string, payload: unknown): KlingTaskInfo {
  const data = unwrapData(payload)
  const status = typeof data.status === 'string' ? data.status : 'processing'
  const result =
    data.result && typeof data.result === 'object' ? (data.result as Record<string, unknown>) : null
  const video =
    result?.video && typeof result.video === 'object' ? (result.video as Record<string, unknown>) : null
  const videoUrl =
    typeof data.video_url === 'string'
      ? data.video_url
      : typeof video?.url === 'string'
        ? (video.url as string)
        : null
  return {
    task_id: taskId,
    status,
    video_url: videoUrl,
    duration_seconds: typeof data.duration === 'number' ? data.duration : undefined,
    fail_reason: typeof data.fail_reason === 'string' ? data.fail_reason : null,
    progress: typeof data.progress === 'string' ? data.progress : null,
    created_at: typeof data.created_at === 'string' ? data.created_at : undefined,
    updated_at: typeof data.updated_at === 'string' ? data.updated_at : undefined,
  }
}
