import http from 'http'
import {
  getBody,
  parseCookies,
  pathExists,
  provideFile
} from './lib/parsers.js'
import { ResponseHelpers, ServerOptions } from './lib/extenders.js'
import Router from './lib/router.js'
class GalaxiteServer {
  static Router = Router
  constructor (options = {}) {
    this.options = new ServerOptions(options)
    this.router = new Router()
    this.middlewares = []
  }

  route (...args) {
    return this.router.route(...args)
  }

  use (middleware) {
    this.middlewares.push(middleware)
  }

  async #handleRequest (req, res) {
    const corsSent = await this.#checkCors(req, res)
    if (corsSent) {
      return
    }

    const { handler, router } = this.router.parseRoute(req)

    if (this.staticDirectory) {
      const fileSent = await provideFile(
        `${this.staticDirectory}${router.path}`,
        res
      )
      if (fileSent) return
    }
    switch (handler) {
      case null:
        return res.status(404).send('404 Not Found')
      case undefined:
        return res.status(501).send(`Cannot ${router.method} ${router.path}`)
      default:
        break
    }

    req.router = router
    req.cookies = parseCookies(req)

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const data = await getBody(req, this.options.uploadDir)
      req.body = data
    }

    let middlewareIndex = 0
    const next = () => {
      if (middlewareIndex >= this.middlewares.length) {
        return handler(req, res)
      }
      const middleware = this.middlewares[middlewareIndex]
      middlewareIndex++
      middleware(req, res, next)
    }
    return next()
  }

  async #checkCors (req, res) {
    const corsOptions = this.options.cors

    if (corsOptions) {
      const origin = req.headers.origin
      if (
        corsOptions.origins === true ||
        corsOptions.origins.includes(origin)
      ) {
        res.setHeader('Access-Control-Allow-Origin', origin)
      }

      if (corsOptions.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true')
      }

      if (corsOptions.headers) {
        res.setHeader(
          'Access-Control-Allow-Headers',
          corsOptions.headers.join(', ')
        )
      }

      if (corsOptions.methods) {
        res.setHeader(
          'Access-Control-Allow-Methods',
          corsOptions.methods.join(', ')
        )
      }

      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return true
      }
    }
    return false
  }

  serveStatic (dir) {
    if (pathExists(dir)) this.staticDirectory = dir
  }

  close (callback) {
    this.server.close((err) => callback(err))
  }

  listen (port, callback) {
    this.server = http.createServer((req, res) => {
      req.query = {}
      Object.assign(res, ResponseHelpers)
      this.#handleRequest(req, res)
    })
    this.server.listen(port, () => callback(port))
  }
}

export default GalaxiteServer
