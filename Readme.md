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
  return res.status(200).text(`User ID: ${req.route.params.user_id}`);
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
