export type VideoInputMode = 't2v' | 'i2v' | 'first-last-frame'
export type VideoAspectRatio = '16:9' | '9:16' | '1:1'
export type VideoDuration = 5 | 10

export type KlingCameraPreset =
  | 'none'
  | 'simple'
  | 'down_back'
  | 'forward_up'
  | 'right_turn_forward'
  | 'left_turn_forward'

export interface KlingCameraConfig {
  horizontal?: number
  vertical?: number
  pan?: number
  tilt?: number
  roll?: number
  zoom?: number
}

export interface KlingVideoSubmitArgs {
  input_mode: VideoInputMode
  prompt: string
  negative_prompt?: string
  duration: VideoDuration
  aspect_ratio?: VideoAspectRatio
  image_url?: string
  image_tail_url?: string
  camera_preset?: KlingCameraPreset
  camera_config?: KlingCameraConfig
  cfg_scale?: number
  generate_audio?: boolean
  external_task_id?: string
  callback_url?: string
}

export interface KlingVideoSubmitResponse {
  task_id: string
  status: string
  created_at?: string
  input_mode: VideoInputMode
  endpoint_path: string
}

export type KlingTaskStatus = 'submitted' | 'processing' | 'succeeded' | 'failed' | string

export interface KlingTaskInfo {
  task_id: string
  status: KlingTaskStatus
  video_url?: string | null
  duration_seconds?: number
  fail_reason?: string | null
  progress?: string | null
  created_at?: string
  updated_at?: string
}

export interface VideoToolErrorResult {
  ok: false
  error: string
  hint?: string
}

export interface VideoGenerateResult {
  ok: true
  task_id: string
  status: KlingTaskStatus
  video_url?: string | null
  local_path?: string
  duration_seconds?: number
  model_id: string
}
