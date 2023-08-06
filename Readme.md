# Galaxite.js

Galaxite is a simple HTTP server built using Node.js. The purpose of this server is to provide a customizable, lightweight alternative to traditional web servers for certain use cases.

## Features

- Supports HTTP methods: GET, POST, PUT, DELETE, HEAD and OPTIONS.
- Accepts and parses incoming request bodies in multiple formats (JSON, multipart/form-data, url-encoded).
- Supports custom routes and handler functions.
- Simple and easy to use API.

## Installation

```
npm install galaxite.js --save
```

## Usage

```js
const Galaxite = require("galaxite.js");
const server = new Galaxite();

server.use((req, res, next) => {
  console.log("Middleware", req.route);
  return next();
});

server.route("/users/:user_id").get((req, res) => {
  return res.status(200).text(`User ID: ${req.router.params.user_id}`);
});

server
  .route("/echo/*")
  .get((req, res) => {
    return res.status(200).json({ ...req.route });
  })
  .post((req, res) => {
    return res.status(200).json({ ...req.route, body: req.body });
  });

server.listen(3000, () => console.log(`Listening on :3000`));
```

## Performance

Benchmark results for 1000 requests with 100 concurrent users:

- Galaxite.js

  ```
  Connection Times (ms)
                min    mean[+/-sd]   median     max
  Connect:        0      1   0.8        1         4
  Processing:     3     10   2.6       10        17
  Waiting:        0      7   2.0        7        14
  Total:          4     11   2.6       11        17
  ```

- Express.js
  ```
  Connection Times (ms)
                min    mean[+/-sd]   median     max
  Connect:        0      1   0.9        1         4
  Processing:     1     30   6.5       31        38
  Waiting:        1     20   7.3       21        33
  Total:          4     31   6.1       32        39
  ```

> Galaxite.js performs significantly better than Express.js in terms of processing time, with a mean processing time of 10ms compared to Express.js's mean processing time of 30ms. This makes Galaxite.js a great choice for use cases where performance is a top priority.
