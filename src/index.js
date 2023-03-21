const http = require("http");
const { getBody, parseCookies, pathExists, provideFile } = require("./lib/parsers");
const { ResponseHelpers, ServerOptions } = require("./lib/extenders");
const Router = require("./lib/router");
class GalaxiteServer {
  static Router = Router;
  constructor(options = {}) {
    this.options = new ServerOptions(options);
    this.router = new Router();
    this.middlewares = [];
  }

  route(...args) {
    return this.router.route(...args)
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  async #handleRequest(req, res) {
    const { handler, router } = this.router.parseRoute(req);

    if (this.staticDirectory) {
      let fileSent = await provideFile(`${this.staticDirectory}${router.path}`, res);
      if (fileSent) return;
    }
    switch (handler) {
      case null: return res.status(404).send("404 Not Found");
      case undefined: return res.status(501).send(`Cannot ${router.method} ${router.path}`);
      default: break;
    }

    req.router = router;
    req.cookies = parseCookies(req);

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const data = await getBody(req, this.options.uploadDir);
      req.body = data
    }

    let middlewareIndex = 0;
    const next = () => {
      if (middlewareIndex >= this.middlewares.length) {
        return handler(req, res);
      }
      const middleware = this.middlewares[middlewareIndex];
      middlewareIndex++;
      middleware(req, res, next);
    };
    return next();
  }

  serveStatic(dir) {
    if (pathExists(dir)) this.staticDirectory = dir;
  }

  close(callback) {
    this.server.close((err) => callback(err));
  }

  listen(port, callback) {
    this.server = http.createServer(
      (req, res) => {
        req.query = {};
        Object.assign(res, ResponseHelpers);
        if (this.options.cors.enabled) {
          if (
            (this.options.cors.origin.includes("*") ||
              (!!req.headers.host &&
                this.options.cors.origin.includes(req.headers.host)))
          )
            res.setHeader(
              "Access-Control-Allow-Origin",
              `${req.headers.host}`
            );
          if (this.options.cors.methods.length)
            res.setHeader(
              "Access-Control-Allow-Methods",
              this.options.cors.methods.join(",  ")
            );
          res.setHeader(
            "Access-Control-Max-Age",
            `${this.options.cors.maxAge}`
          );
        }
        this.#handleRequest(req, res);
      }
    );
    this.server.listen(port, () => callback(port));
  }
}

module.exports = GalaxiteServer;