const express = require('express');
const next = require('next');
const routes = require('../routes');
// service middleware
const authService = require('./services/auth');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = routes.getRequestHandler(app);

const secretData = [
    { title: 'secret data 1', description: 'how to build spacerocket' },
    { title: 'secret data 2', description: 'how to survive in space' }
]

app.prepare()
    .then(() => {
        const server = express();

        server.get('/api/v1/secret', authService.checkJWT, (req, res) => {
            return res.json(secretData)
        })

        server.get('*', (req, res) => {
            return handler(req, res)
        })

        server.use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
                res.status(401).send({ title: 'Unauthorized', detail: 'Unauthorize access' })
            }
        });

        server.use(handler).listen(3009, (err) => {
            if (err) throw err
            console.log('ready on http//:localhost:3009')
        })
    }).catch((ext) => {
        console.log(ext.stack)
        process.exit(1)
    });