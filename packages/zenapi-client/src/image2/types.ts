// NOTE 2026-05-16 ADR `zenaigc-r2-pivot`：
// 客户端面向"上游响应"的可选字段 `expires_at` 已加入 NbGenerateResult / MjTaskQueryItem。
// Image2 是异步类，最终 image_url + expires_at 通过 MjTaskQueryItem（共用 task 状态结构）返回。
// 等 zenaigc 中转商上线新 schema 后切换 nb/client.ts / image2/client.ts 的 parser（删 base64 兜底）。

import type { GenToolError } from '../shared-types'

export type Image2Quality = '2k' | '4k'
export type Image2Mode = 't2i' | 'i2i'

export interface Image2GenerateArgs {
  prompt: string
  quality?: Image2Quality
  mode?: Image2Mode
  reference_image_path?: string
  output_prefix?: string
  prompt_label?: string
  binding?: { kind: 'character' | 'scene'; id: string }
}

export interface Image2SubmitResult {
  ok: true
  task_id: string
  hint: string
  quality: Image2Quality
  mode: Image2Mode
  model_id: string
}

export interface Image2ToolErrorResult {
  ok: false
  error: GenToolError
  hint?: string
}
