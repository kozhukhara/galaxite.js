import { qs } from './parsers.js'

export class RouterNode {
  constructor (key = '') {
    this.key = key
    this.children = []
    this.handler = null
  }
}

export default class Router {
  constructor () {
    this.root = new RouterNode()
  }

  route (endpoint, nestedRouter = null) {
    if (nestedRouter) {
      const parts = endpoint.split('/')
      let node = this.root
      for (let i = endpoint.startsWith('/') ? 1 : 0; i < parts.length; i++) {
        const part = parts[i]
        if (part.length === 0) continue
        let child = node.children.find((c) => c.key === part)
        if (!child) {
          child = new RouterNode(part)
          if (part.startsWith(':')) child.isParam = true
          if (part === '*') child.isWildcard = true
          node.children.push(child)
        }
        node = child
      }
      node.handler = nestedRouter.root.handler
      node.children = [...node.children, ...nestedRouter.root.children]
      return true
    }

    const route = {};
    ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'].forEach((method) => {
      route[method.toLowerCase()] = (handler) => {
        this.addRoute(method, endpoint, handler)
        return route
      }
    })

    return route
  }

  addRoute (method, endpoint, handler) {
    const parts = endpoint.split('/')
    let node = this.root
    for (let i = endpoint.startsWith('/') ? 1 : 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.length === 0) continue
      let child = node.children.find((c) => c.key === part)
      if (!child) {
        child = new RouterNode(part)
        if (part.startsWith(':')) child.isParam = true
        if (part === '*') child.isWildcard = true
        node.children[child.isWildcard || child.isParam ? 'push' : 'unshift'](
          child
        )
      }
      node = child
    }

    if (!node.handler) {
      node.handler = { [method]: handler }
    } else {
      node.handler[method] = handler
    }
  }

  parseRoute (req) {
    const method = req.method || ''
    const url = req.url || ''
    const [path, query] = url.split('?')
    const segments = path.split('/').filter((segment) => segment !== '')
    let currentNode = this.root
    const params = {}
    let found = false
    for (const segment of segments) {
      let wildcardEntryFound = false
      found = false
      for (const child of currentNode.children) {
        if (child.isParam && !child.isWildcard) {
          params[child.key.slice(1)] = decodeURIComponent(segment)
          currentNode = child
          found = true
          break
        }
        if (child.isWildcard) {
          params.slug = decodeURIComponent(
            segments.slice(segments.indexOf(segment)).join('/')
          )
          currentNode = child
          found = wildcardEntryFound = true
          break
        }
        if (child.key === segment) {
          currentNode = child
          found = true
          break
        }
      }
      if (!found || wildcardEntryFound) break
    }
    return {
      handler:
        found && currentNode.handler ? currentNode.handler[method] : null,
      router: {
        query: { ...qs.parse(query) },
        path: path || '/',
        params,
        method
      }
    }
  }
}
