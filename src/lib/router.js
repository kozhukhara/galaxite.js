const { qs } = require('./parsers')

class RouterNode {
    constructor(key = '') {
        this.key = key;
        this.children = [];
        this.handler = null;
    }
}

class Router {
    constructor() {
        this.root = new RouterNode();
    }

    addRoute(method, endpoint, handler) {
        const parts = endpoint.split('/');
        let node = this.root;
        for (let i = endpoint.startsWith('/') ? 1 : 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.length === 0) continue;
            let child = node.children.find((c) => c.key === part);
            if (!child) {
                child = new RouterNode(part);
                if (part.startsWith(':')) child.isParam = true;
                if (part === '*') child.isWildcard = true;
                node.children.push(child);
            }
            node = child;
        }

        if (!node.handler) {
            node.handler = { [method]: handler };
        } else {
            node.handler[method] = handler;
        }
    }
    parseRoute(req) {
        const method = req.method || "";
        const url = req.url || "";
        let [path, query] = url.split("?");
        const segments = path.split('/').filter((segment) => segment !== '');
        let currentNode = this.root;
        const params = {};

        for (const segment of segments) {
            let found = false;
            let wildcardEntryFound = false;
            for (const child of currentNode.children) {
                if (child.isParam && !child.isWildcard) {
                    params[child.key.slice(1)] = segment;
                    currentNode = child;
                    found = true;
                    break;
                } else if (child.isWildcard) {
                    params['slug'] = segments.slice(segments.indexOf(segment)).join('/');
                    currentNode = child;
                    found = wildcardEntryFound = true;
                    break;
                } else if (child.key === segment) {
                    currentNode = child;
                    found = true;
                    break;
                }
            }
            if (wildcardEntryFound) break
        }

        return {
            handler: (currentNode.handler) ? currentNode.handler[method] : null,
            router: { query: { ...qs.parse(query) }, path: path || '/', params, method },
        };
    }
}

module.exports = Router;