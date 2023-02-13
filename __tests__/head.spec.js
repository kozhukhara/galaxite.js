const GalaxiteServer = require('../src/index.js');
const http = require('http');
const qs = require('querystring');
const fs = require('fs');

describe('HTTP headers', () => {
    let request;
    let response;
    const port = 3000;
    const server = new GalaxiteServer({ cors: { enabled: true, origin: ['*'], methods: ["POST", "GET"] }, uploadDir: './tmp' });
    server
        .route("/echo/file")
        .head((req, res) => {
            const fileSize = fs.statSync("../Readme.md").size;
            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Length', fileSize);
            return
        })

    let params = {
        timestamp: Date.now().toString(),
        slug: Date.now().toString(32)
    };

    let query = {
        a: Array.from({ length: 3 }, () => (~~(Math.random() * 100)).toString()),
        b: Date.now().toString(32)
    };

    beforeAll((done) => {
        server.listen(port, () => done());
    });

    afterAll((done) => {
        server.close(done);
    });

    it('Returns file with known Content-Length', async () => {
        const fileSize = fs.statSync("../Readme.md").size;
        request = http.get({
            host: 'localhost',
            port,
            path: '/echo/file',
        }, (res) => {
            // response = res;
            console.log(res.headers)
            done();
        });
        // response.on('end', () => {
        //     expect(data).toEqual(JSON.stringify({ query, params }));
        //     done();
        // });
    });
});
