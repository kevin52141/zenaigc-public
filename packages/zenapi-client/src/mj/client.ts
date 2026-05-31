import type { KeyProvider } from '../credentials'
import type { MjSubmitResult, MjTaskResponse } from './types'

export class MjApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
  }
}

interface RequestInit_ {
  method: 'GET' | 'POST'
  subPath: string
  body?: unknown
}

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const obj = payload as Record<string, unknown>
  if (typeof obj.description === 'string') return obj.description
  if (typeof obj.message === 'string') return obj.message
  if (obj.error && typeof obj.error === 'object') {
    const errObj = obj.error as Record<string, unknown>
    if (typeof errObj.message === 'string') return errObj.message
  }
  return ''
}

export class MjClient {
  constructor(private readonly keyProvider: KeyProvider) {}

  private async request<T>(init: RequestInit_): Promise<T> {
    const { api_key, base_url } = await this.keyProvider.get()
    const url = `${base_url}${init.subPath}`
    const res = await fetch(url, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${api_key}`,
        'Content-Type': 'application/json',
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    })
    const text = await res.text()
    let parsed: unknown
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      throw new MjApiError(`MJ API 非 JSON 响应（HTTP ${res.status}）: ${text.slice(0, 200)}`, res.status)
    }
    if (!res.ok) {
      const errMsg = extractErrorMessage(parsed) || text || `HTTP ${res.status}`
      throw new MjApiError(`MJ API 错误: ${errMsg}`, res.status)
    }
    return parsed as T
  }

  async submitImagine(prompt: string, base64Array: string[] | undefined): Promise<string> {
    const body: Record<string, unknown> = { prompt }
    if (base64Array && base64Array.length) body.base64Array = base64Array
    const data = await this.request<MjSubmitResult>({
      method: 'POST',
      subPath: '/mj/submit/imagine',
      body,
    })
    if (data.code !== 1 || !data.result) {
      throw new MjApiError(`imagine 提交失败: ${data.description}`)
    }
    return data.result
  }

  async submitAction(customId: string, taskId: string): Promise<string> {
    const data = await this.request<MjSubmitResult>({
      method: 'POST',
      subPath: '/mj/submit/action',
      body: { customId, taskId },
    })
    if (data.code !== 1 || !data.result) {
      throw new MjApiError(`action 提交失败: ${data.description}`)
    }
    return data.result
  }

  async submitModal(taskId: string, prompt: string | undefined): Promise<string> {
    const data = await this.request<MjSubmitResult>({
      method: 'POST',
      subPath: '/mj/submit/modal',
      body: { taskId, prompt: prompt ?? '' },
    })
    if (data.code !== 1 || !data.result) {
      throw new MjApiError(`modal 提交失败: ${data.description}`)
    }
    return data.result
  }

  async submitDescribe(base64: string): Promise<string> {
    const data = await this.request<MjSubmitResult>({
      method: 'POST',
      subPath: '/mj/submit/describe',
      body: { base64 },
    })
    if (data.code !== 1 || !data.result) {
      throw new MjApiError(`describe 提交失败: ${data.description}`)
    }
    return data.result
  }

  async fetchTask(taskId: string): Promise<MjTaskResponse> {
    return this.request<MjTaskResponse>({
      method: 'GET',
      subPath: `/mj/task/${taskId}/fetch`,
    })
  }

  async downloadImage(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url)
    if (!res.ok) {
      throw new MjApiError(`下载图片失败: HTTP ${res.status}`, res.status)
    }
    return res.arrayBuffer()
  }

  async fetchImageBinary(taskId: string): Promise<ArrayBuffer> {
    const { api_key, base_url } = await this.keyProvider.get()
    const url = `${base_url}/mj/image/${taskId}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${api_key}` },
    })
    if (!res.ok) {
      throw new MjApiError(`image proxy fetch failed: HTTP ${res.status}`, res.status)
    }
    return res.arrayBuffer()
  }
}
