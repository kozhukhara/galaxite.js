declare class GalaxiteServer {
  options: ServerOptions;
  routes: Array<Route>;
  middlewares: Array<Middleware>;

  constructor(options?: {});

  route(endpoint: string): RouteBuilder;

  use(middleware: Middleware): void;

  listen(port: number, callback: Callback): void;

  close(callback: Callback): void;
}

interface RouteBuilder {
  get(handler: Handler): RouteBuilder;
  post(handler: Handler): RouteBuilder;
  put(handler: Handler): RouteBuilder;
  delete(handler: Handler): RouteBuilder;
  head(handler: Handler): RouteBuilder;
  options(handler: Handler): RouteBuilder;
}

interface Route {
  method: "GET" | "POST" | "HEAD" | "OPTIONS" | "PUT" | "DELETE";
  handler: Handler;
  regex: RegExp;
  params: string[];
}

type Middleware = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  next: Next
) => Next;

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => http.ServerResponse;

type Next = (middleware: Middleware) => void;

type Callback = (err?: any) => void;
