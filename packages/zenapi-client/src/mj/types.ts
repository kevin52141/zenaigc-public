import type { GenToolError } from '../shared-types'

export type MjStatus = 'NOT_START' | 'SUBMITTED' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE'

export type MjAction =
  | 'IMAGINE'
  | 'UPSCALE'
  | 'VARIATION'
  | 'REROLL'
  | 'ZOOM'
  | 'PAN'
  | 'DESCRIBE'
  | 'BLEND'

export interface MjButton {
  customId: string
  emoji?: string
  label?: string
  style?: number
  type?: number
}

export interface MjSubmitResult {
  code: number
  description: string
  result?: string
  properties?: Record<string, unknown>
}

export interface MjTaskResponse {
  id?: string
  action?: string
  status?: MjStatus
  progress?: string
  prompt?: string
  promptEn?: string
  description?: string
  submitTime?: number
  startTime?: number
  finishTime?: number
  imageUrl?: string
  failReason?: string
  buttons?: MjButton[]
  properties?: Record<string, unknown>
}

export interface MjTaskRecord {
  task_id: string
  parent_task_id: string | null
  action: MjAction
  prompt_label: string
  output_prefix: string
  submitted_at: number
  last_status: MjStatus | 'unknown' | ''
  last_progress: string
  last_image_url: string
  last_buttons: MjButton[]
  local_path: string | null
  fail_reason: string
  custom_suffix?: string
  binding?: { kind: 'character' | 'scene'; id: string }
}

export interface MjImagineArgs {
  prompt: string
  prompt_label?: string
  output_prefix?: string
  binding?: { kind: 'character' | 'scene'; id: string }
  base64Array?: string[]
}

export interface MjActionArgs {
  parent_task_id: string
  custom_id: string
  label?: string
  extra_prompt?: string
}

export interface MjDescribeArgs {
  image_url?: string
  file_path?: string
  summary?: string
}

export interface MjUploadArgs {
  file_path: string
}

export interface MjCheckTasksArgs {
  task_ids: string[]
  summary?: string
}

export interface MjToolSubmitResult {
  ok: true
  task_id: string
  hint: string
}

export interface MjUploadResult {
  ok: true
  base64: string
  size_kb: number
  file_path: string
}

export interface MjDescribeResult {
  ok: true
  task_id: string
  hint: string
}

export interface MjTaskQueryItem {
  task_id: string
  status: MjStatus | 'unknown'
  progress: string
  image_url: string
  expires_at?: string | null
  local_path: string | null
  buttons: MjButton[]
  fail_reason: string
}

export interface MjCheckTasksResult {
  ok: true
  tasks: MjTaskQueryItem[]
  progress_summary: string
}

export interface MjToolErrorResult {
  ok: false
  error: GenToolError
  hint?: string
}
