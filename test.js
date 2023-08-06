import Galaxite from './src/index.js'
const server = new Galaxite()

server.use((req, res, next) => {
  console.log('Middleware', req.router)
  return next()
})

server.route('/users/:user_id').get((req, res) => {
  return res.status(200).send(`User ID: ${req.router.params.user_id}`)
})

server
  .route('/echo/*')
  .get((req, res) => {
    return res.status(200).json({ ...req.router })
  })
  .post((req, res) => {
    return res.status(200).json({ ...req.router, body: req.body })
  })

server.listen(4000, () => console.log('Listening on :4000'))
