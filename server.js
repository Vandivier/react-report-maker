const bodyParser = require('body-parser');
const { createServer } = require('http'); // TODO: needed?
const fs = require('fs');

const { parse } = require('url');
const next = require('next');
const nextAuth = require('next-auth');
const nextAuthConfig = require('./next-auth.config'); // TODO: move location
const { join } = require('path');

// Load environment variables from .env file if present
require('dotenv').load(); // TODO: needed?

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';

// const dir = '.'; // TODO: needed?
// const app = next({ dev, dir }); // TODO: needed?
const app = next({ dev });
const handle = app.getRequestHandler();

const controllerReports = require('./api/controllers/controller-reports');
const routes = {
    admin: require('./api/controllers/controller-ref-admin.js'),
    account: require('./api/controllers/controller-ref-account'),
};

app.prepare()
    .then(() => {
        // Load configuration and return config object
        return nextAuthConfig();
    })
    .then(nextAuthOptions => {
        // Pass Next.js App instance and NextAuth options to NextAuth
        // Note We do not pass a port in nextAuthOptions, because we want to add some
        // additional routes before Express starts (if you do pass a port, NextAuth
        // tells app to handle default routing and starts Express automatically).
        return nextAuth(app, nextAuthOptions);
    })
    .then(nextAuthOptions => {
        const express = nextAuthOptions.express;
        // uncomment below to enable auth
        // const server = nextAuthOptions.expressApp;
        // below line creates new server instance, without auth
        const server = express();

        server.use(express.static('static')); // for serving the HTML file
        //server.use(bodyParser.urlencoded({ extended: false }));
        //server.use(bodyParser.json());

        server.get('/a', (req, res) => {
            return app.render(req, res, '/b', req.query);
        });

        server.use('/reports', controllerReports);

        server.get('/b', (req, res) => {
            return app.render(req, res, '/a', req.query);
        });

        server.get('/posts/:id', (req, res) => {
            return app.render(req, res, '/posts', { id: req.params.id });
        });

        // Add admin routes
        routes.admin(server);

        // Add account management route - reuses functions defined for NextAuth
        routes.account(server, nextAuthOptions.functions);

        // Serve fonts from ionicon npm module
        server.use('/fonts/ionicons', express.static('./node_modules/ionicons/dist/fonts'));

        // A simple example of custom routing
        // Send requests for '/custom-route/{anything}' to 'pages/examples/routing.js'
        server.get('/custom-route/:id', (req, res) => {
            // Note: To make capturing a slug easier when rendering both client
            // and server side, name it ':id'
            return app.render(req, res, '/examples/routing', req.params);
        });

        server.get('*', (req, res) => {
            const parsedUrl = parse(req.url, true);
            const rootStaticFiles = ['/robots.txt', '/sitemap.xml', '/favicon.ico'];

            if (rootStaticFiles.indexOf(parsedUrl.pathname) > -1) {
                const path = join(__dirname, 'static', parsedUrl.pathname);
                return app.serveStatic(req, res, path);
            } else {
                return handle(req, res);
            }
        });

        server.listen(port, err => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
    });

process.on('uncaughtException', function(err) {
    console.error('Uncaught Exception: ', err);
});

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection: Promise:', p, 'Reason:', reason);
});
