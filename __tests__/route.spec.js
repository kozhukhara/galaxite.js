const GalaxiteServer = require('../src/index.js')
const http = require('http')
const qs = require('querystring')

describe('Router', () => {
  let request
  let response
  const port = 3000
  const server = new GalaxiteServer({
    cors: { enabled: true, origin: ['*'], methods: ['POST', 'GET'] },
    uploadDir: './tmp'
  })
  server.route('/echo/:timestamp/*').get((req, res) => {
    return res.status(200).json({ ...req.router })
  })

  const params = {
    timestamp: Date.now().toString(),
    slug: Date.now().toString(32)
  }
  const query = {
    a: Array.from({ length: 3 }, () => (~~(Math.random() * 100)).toString()),
    b: Date.now().toString(32)
  }
  const path = `/echo/${params.timestamp}/${params.slug}`
  beforeAll((done) => {
    server.listen(port, () => done())
  })

  afterAll((done) => {
    server.close(done)
  })

  beforeEach((done) => {
    request = http.get(
      {
        host: 'localhost',
        port,
        path: `/echo/${params.timestamp}/${params.slug}?${qs.stringify(query)}`
      },
      (res) => {
        response = res
        done()
      }
    )
  })

  it('Parses route params and query string correctly', (done) => {
    let data = ''
    response.on('data', (chunk) => {
      data += chunk
    })
    response.on('end', () => {
      expect(data).toEqual(
        JSON.stringify({ query, path, params, method: 'GET' })
      )
      done()
    })
  })
})
