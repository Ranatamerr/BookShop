import { Context, Next } from 'hono'

export const languageMiddleware = async (c: Context, next: Next) => {
  // Get language from query param, header, or default to 'en'
  const lang =
    c.req.query('lang') ||
    c.req.header('Accept-Language')?.split(',')[0]?.split('-')[0] ||
    'en'

  // Validate supported languages
  const supportedLanguages = ['en', 'ar']
  const language = supportedLanguages.includes(lang) ? lang : 'en'

  // Store in context
  c.set('language', language)

  await next()
}
