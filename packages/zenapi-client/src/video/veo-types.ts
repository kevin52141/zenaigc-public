export type VeoModel = 'veo-3.1-generate-001' | 'veo-3.1-fast-generate-001'

export type VeoInputMode = 't2v' | 'i2v' | 'first-last-frame'

export type VeoAspectRatio = '16:9' | '9:16'

export type VeoDuration = 4 | 6 | 8

export type VeoResolution = '720p' | '1080p' | '4k'

export type VeoPersonGeneration = 'allow_all' | 'allow_adult' | 'dont_allow'

export interface VeoInlineData {
  mimeType: string
  data: string
}

export interface VeoReferenceImage {
  image: {
    inlineData: VeoInlineData
  }
  referenceType: string
}

export interface VeoInstance {
  prompt?: string
  image?: {
    inlineData: VeoInlineData
  }
  lastFrame?: {
    inlineData: VeoInlineData
  }
  referenceImages?: VeoReferenceImage[]
}

export interface VeoParameters {
  aspectRatio?: VeoAspectRatio
  durationSeconds?: VeoDuration
  resolution?: VeoResolution
  personGeneration?: VeoPersonGeneration
  numberOfVideos?: number
  seed?: number
  generateAudio?: boolean
  negativePrompt?: string
  enhancePrompt?: boolean
}

export interface VeoLongRunningRequest {
  instances: [VeoInstance]
  parameters: VeoParameters
}

// submit
export interface VeoLongRunningResponse {
  name: string
  done?: boolean
  metadata?: {
    '@type'?: string
  }
}

// poll
export interface VeoOperation {
  name: string
  done: boolean
  metadata?: {
    '@type'?: string
  }
  response?: {
    generateVideoResponse?: {
      generatedSamples?: Array<{
        video?: {
          uri: string
          mimeType?: string
        }
      }>
    }
  }
  error?: {
    code: number
    message: string
  }
}

export interface VeoGenerateArgs {
  prompt?: string
  image_base64?: string
  image_mime_type?: string
  last_frame_base64?: string
  last_frame_mime_type?: string
  reference_images?: Array<{
    base64: string
    mimeType: string
    referenceType?: string
  }>
  input_mode?: VeoInputMode
  aspect_ratio?: VeoAspectRatio
  duration_seconds?: VeoDuration
  resolution?: VeoResolution
  generate_audio?: boolean
  negative_prompt?: string
  enhance_prompt?: boolean
  person_generation?: VeoPersonGeneration
  seed?: number
  output_prefix?: string
  prompt_label?: string
}

export interface VeoSubmitResponse {
  ok: true
  operation_name: string
  status: string
  model_id: string
}

export interface VeoPollResult {
  done: boolean
  video_uri?: string | null
  video_mime_type?: string | null
  error?: string | null
}

export interface VeoGenerateResult {
  ok: true
  video_uri: string | null
  local_path?: string
  operation_name: string
  duration_seconds?: number
  model_id: string
}

export interface VeoToolErrorResult {
  ok: false
  error: string
  hint?: string
}
