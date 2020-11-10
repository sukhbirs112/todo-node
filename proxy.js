/* var proxy = require('express-http-proxy');
var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

const port = 8080;

const ngPort = 4200;
const apiPort = 3000;

app.use('/api/', (req, res, next)=> {
    //console.log(req);
    console.log('yo');
    return next();
}, proxy(`http://localhost:${apiPort}`)); 
    
//app.use('/signup', proxy(`http://localhost:${ngPort}/`));

//app.ws('/', proxy(`ws://localhost:${ngPort}/`))


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
 */

const express = require('express');

const { createProxyMiddleware } = require('http-proxy-middleware');
const port = 8080; 


const app = express();
 
app.use(createProxyMiddleware({ target:'http://localhost:4200/', router: {
    '/api': 'http://localhost:3000/'

}, changeOrigin: true }));


//app.use('/api', createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));


app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
