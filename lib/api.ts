const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
}

const getEndpoint = (envKey: string, defaultPath: string) => {
  const endpoint = process.env[envKey] || defaultPath
  const baseUrl = getApiBaseUrl()
  
  // If endpoint already includes the base URL, return as is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  
  // Otherwise, combine base URL with endpoint
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error occurred')
  }
}

export interface LogsResponse {
  success: boolean
  data: any[]
  count: number
}

export interface EnvResponse {
  success: boolean
  data: {
    KITE_REQUEST_TOKEN: string
    TRADING_QUANTITY: string
    OPTION_EXPIRY: string
  }
}

export interface StartBotResponse {
  success: boolean
  message: string
  pid: number
}

export interface StopBotResponse {
  success: boolean
  message: string
}

export interface BotStatusResponse {
  success: boolean
  running: boolean
  pid?: number
}

export const fetchLogs = async (): Promise<LogsResponse> => {
  const url = getEndpoint('NEXT_PUBLIC_API_LOGS_ENDPOINT', '/api/logs')
  const response = await apiCall(url, { method: 'GET' })
  if (response.success && Array.isArray(response.data)) {
    return response as LogsResponse
  }
  throw new Error('Invalid logs response format')
}

export const fetchEnv = async (): Promise<EnvResponse> => {
  const url = getEndpoint('NEXT_PUBLIC_API_GET_ENV_ENDPOINT', '/api/env')
  const response = await apiCall(url, { method: 'GET' })
  if (response.success && response.data) {
    return response as EnvResponse
  }
  throw new Error('Invalid env response format')
}

export const startBot = async (envVars: Record<string, string>): Promise<StartBotResponse> => {
  const url = getEndpoint('NEXT_PUBLIC_API_START_BOT_ENDPOINT', '/api/bot/start')
  const response = await apiCall(url, {
    method: 'POST',
    body: JSON.stringify(envVars),
  })
  if (response.success) {
    return response as StartBotResponse
  }
  throw new Error(response.message || 'Failed to start bot')
}

export const stopBot = async (): Promise<StopBotResponse> => {
  const url = getEndpoint('NEXT_PUBLIC_API_STOP_BOT_ENDPOINT', '/api/bot/stop')
  const response = await apiCall(url, { method: 'POST' })
  if (response.success) {
    return response as StopBotResponse
  }
  throw new Error(response.message || 'Failed to stop bot')
}

export const getBotStatus = async (): Promise<BotStatusResponse> => {
  const url = getEndpoint('NEXT_PUBLIC_API_BOT_STATUS_ENDPOINT', '/api/bot/status')
  const response = await apiCall(url, { method: 'GET' })
  if (response.success !== undefined && typeof response.running === 'boolean') {
    return response as BotStatusResponse
  }
  throw new Error('Invalid bot status response format')
}

