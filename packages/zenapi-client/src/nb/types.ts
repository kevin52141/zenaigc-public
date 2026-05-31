import type { GenToolError } from '../shared-types'

export type NbTier = 'flash' | 'pro'
export type NbAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9'

export interface NbGenerateArgs {
  prompt: string
  tier?: NbTier
  aspect_ratio?: NbAspectRatio
  output_prefix?: string
  prompt_label?: string
  reference_image_path?: string
  binding?: { kind: 'character' | 'scene'; id: string }
}

export interface NbGenerateResult {
  ok: true
  local_path: string
  image_url: string | null
  expires_at?: string | null
  prompt_label: string
  tier: NbTier
  model_id: string
}

export interface NbToolErrorResult {
  ok: false
  error: GenToolError
  hint?: string
}
