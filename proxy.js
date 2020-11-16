
/*
Normally on a linux machine, apache2 or some other software would be used as proxy.

http-proxy-middleware is used to restrict access to private pages if the user is not authenticated.
If the user is authenticated, then they will be redirect to the app homepage when they try to access certain public pages
*/

const express = require('express');

const { createProxyMiddleware } = require('http-proxy-middleware');
const port = 8080;


const app = express();

const apiHost = "http://localhost:3000/"

app.use((req, res, next) => {
    next();
}, createProxyMiddleware({
    target: 'http://localhost:4200/', router: {
        '/api': apiHost,
        '/logout': apiHost,
        '/todo': apiHost,
        '/login': apiHost,
        '/signup': apiHost,
    }, changeOrigin: true
}));


//app.use('/api', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
