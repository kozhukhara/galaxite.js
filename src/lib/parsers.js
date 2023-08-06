import formidable from 'formidable'
import { existsSync as pathExists, mkdirSync, readFile } from 'fs'
import { lookup } from 'mime-types'

export * as qs from 'querystring'
export { existsSync as pathExists } from 'fs'

export const handleDirectory = (directoryPath) => {
  if (!pathExists(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true })
  }
}

export const getBody = async (request, uploadDir) => {
  return new Promise((ok, fail) => {
    if (uploadDir) handleDirectory(uploadDir)
    const form = new formidable.IncomingForm({
      multiples: true,
      keepExtensions: true,
      uploadDir
    })
    form.parse(request, (err, fields, files) => {
      if (err) return fail(err)
      ok({ fields, files })
    })
  })
}

export const extractParamNames = (pattern) => {
  const patternParts = pattern.split('/')
  const paramNames = []
  let hasWildcard = false

  patternParts.forEach((part) => {
    if (part.startsWith(':')) {
      paramNames.push(part.slice(1))
    } else if (part === '*') {
      if (hasWildcard) {
        throw new Error(
          'Wildcard (*) can only appear once and must be at the end of the pattern'
        )
      }
      paramNames.push('slug')
      hasWildcard = true
    }
  })

  return paramNames
}

export const patternToRegex = (pattern) => {
  if (pattern.startsWith('/')) pattern = pattern.substring(1)
  if (pattern.endsWith('/')) pattern = pattern.substring(0, pattern.length - 1)
  return new RegExp(
    `^${pattern
      .split('/')
      .map((part) => {
        if (part.startsWith(':')) {
          return '/([^/]+)'
        } else if (part === '*') {
          return '(?:\\/(.*))?'
        } else {
          return `/${part}`
        }
      })
      .join('')}$`
  )
}

export const parseCookies = (request) => {
  const cookieString = request.headers.cookie || ''
  return cookieString.split(';').reduce((cookies, cookie) => {
    const [key, value] = cookie.split('=').map((c) => c.trim())
    cookies[key] = value
    return cookies
  }, {})
}

export const provideFile = (path, res) => {
  return new Promise((resolve) => {
    if (pathExists(path)) {
      if (!path.split('/').reverse()[0]) path += 'index.html'
      readFile(`${path}`, function (error, pgResp) {
        if (error) {
          resolve(false)
        } else {
          res
            .status(200)
            .setHeader(
              'Content-Type',
              lookup(path) || 'application/octet-stream'
            )
            .send(pgResp)
          resolve(true)
        }
      })
    } else resolve(false)
  })
}
