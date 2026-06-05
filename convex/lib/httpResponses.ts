const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const

export function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export function getOtpSecret(): string {
  const secret =
    process.env['OTP_INTERNAL_SECRET'] ||
    process.env.OTP_INTERNAL_SECRET ||
    ''

  const trimmed = secret.trim()

  if (!trimmed) {
    console.log('Available env:', Object.keys(process.env))

    throw new Error(
      'OTP is not configured on the server. Set OTP_INTERNAL_SECRET in Convex environment variables.',
    )
  }

  return trimmed
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text()
  if (!text) return {}
  return JSON.parse(text) as Record<string, unknown>
}

export function formatHandlerError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Request failed'
  }
  const uncaught = error.message.match(/Uncaught Error: ([^\n]+)/)
  if (uncaught?.[1]) {
    return uncaught[1]
  }
  return error.message
}
