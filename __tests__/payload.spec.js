const GalaxiteServer = require('../src/index.js')
const http = require('http')
const qs = require('querystring')
const FormData = require('form-data')
const fetch = require('node-fetch')
const fs = require('fs')

describe('Request with payload', () => {
  let request
  let response
  const port = 3001
  const server = new GalaxiteServer({
    cors: { enabled: true, origin: ['*'], methods: ['POST', 'GET'] },
    uploadDir: './tmp'
  })
  server.route('/post').post((req, res) => {
    return res.status(200).json({ ...req.body })
  })

  beforeAll((done) => {
    server.listen(port, () => done())
  })

  afterAll((done) => {
    server.close(() => done())
  })

  // it('Parses plain payload', async () => {
  //     const testBody = { textField1: Date.now(), textField2: Date.now().toString(32) }
  //     const response = await fetch(`http://localhost:${port}/post`, { method: 'POST', body: qs.stringify(testBody) });
  //     const data = await response.json();
  //     expect(1).toEqual(1);
  // });

  it('Parses JSON payload', async () => {
    const testBody = {
      fields: { textField1: Date.now(), textField2: Date.now().toString(32) },
      files: {}
    }
    const response = await fetch(`http://localhost:${port}/post`, {
      method: 'POST',
      body: JSON.stringify(testBody.fields),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    expect(JSON.stringify(data)).toEqual(JSON.stringify(testBody))
  })

  it('Parses `x-www-form-urlencoded` payload', async () => {
    const testBody = {
      fields: {
        textField1: Date.now().toString(),
        textField2: Date.now().toString(32)
      },
      files: {}
    }
    const formattedParams = new URLSearchParams(testBody.fields)
    const response = await fetch(`http://localhost:${port}/post`, {
      method: 'POST',
      body: formattedParams
    })
    const data = await response.json()
    expect(JSON.stringify(data)).toEqual(JSON.stringify(testBody))
  })

  it('Parses `multipart/form-data` payload', async () => {
    const testBody = {
      fields: { textField: Date.now().toString() },
      files: {}
    }
    const formData = new FormData()
    const fileName = 'Readme.md'
    const file = fs.createReadStream(fileName)
    formData.append('textField', testBody.fields.textField)
    formData.append('file', file)
    const response = await fetch(`http://localhost:${port}/post`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    const { size } = fs.statSync(fileName)
    expect(JSON.stringify(data.fields)).toEqual(
      JSON.stringify(testBody.fields)
    )
    expect(data.files.file.originalFilename).toEqual(fileName)
    expect(data.files.file.size).toEqual(size)
  })
})
