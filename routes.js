const responseUtils = require('./utils/responseUtils');
const {renderPublic} = require('./utils/render');
const requestUtils = require('./utils/requestUtils');
const helloWorldController = require('./controllers/helloWorld');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    '/api/hello': ['GET']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {*} response Http response
 * @returns {*} Options
 */
const sendOptions = (filePath, response) => {
    if (filePath in allowedMethods) {
        response.writeHead(204, {
            'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
            'Access-Control-Allow-Headers': 'Content-Type,Accept',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type,Accept'
        });
        return response.end();
    }

    return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix sub path
 * @returns {boolean} True if url contains ID
 */
const matchIdRoute = (url, prefix) => {
    const idPattern = '([0-9A-Z\\S]{3,32})\\w+';
    const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
    return regex.test(url);
};

/**
 * Redirect to https
 * @param request Request
 * @param response Response
 * @returns {*} Redirect
 */
const redirectHttp = (request, response) => {
    try{
        if (response.redirect) {
            response.redirect(`https://${request.headers.host}${request.url}`);
        } else {
            response.writeHead(301, {
                'Location': `https://${request.headers.host}${request.url}`
            });
        }
        return response.end();
    }catch (e){
        console.error(e);
    }
};


const handleRequest = async (request, response) => {
    const {url, method, headers} = request;
    const filePath = new URL(url, `http://${headers.host}`).pathname;
    // serve static files from public/ and return immediately
    if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
        try{
            response.setHeader("Content-Security-Policy", "default-src 'none'; connect-src 'self' *.google-analytics.com;" +
                " base-uri 'self'; form-action 'self'; manifest-src 'self'; script-src 'self';" +
                " img-src 'self' data:; font-src 'self'; style-src 'self';" +
                " frame-ancestors 'none'; frame-src 'self';");
            response.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("X-Frame-Options", "DENY");
            response.setHeader("X-XSS-Protection", "1; mode=block");
            response.setHeader("Referrer-Policy", "no-referrer");
            if(process.env.ENABLE_CACHING){
                // ETag will be set when the file is read for serving in render.js -> renderFile()
                response.setHeader("Cache-Control", `public, max-age=${24 * 60 * 60}`);
                // Copy If-None-Match header from request to response so that it can be used in render.js -> renderFile()
                if(Object.keys(request.headers).includes('if-none-match'))
                    response.setHeader("If-None-Match", request.headers['if-none-match']);
            }
        }catch (e) {
            console.log(e);
        }
        const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
        return renderPublic(fileName, response);
    }

    if (method.toUpperCase() === 'POST' && !(filePath in allowedMethods)) {
        response.writeHead(200, {'Content-Type': 'text/html'});
    }

    // Default to 404 Not Found if unknown url
    if (!(filePath in allowedMethods)) {
        return responseUtils.notFound(response);
    }

    if(filePath === '/api/hello' && method.toUpperCase() === 'GET'){
        responseUtils.sendJson(response, helloWorldController.getHello());
    }

    // See: http://restcookbook.com/HTTP%20Methods/options/
    if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

    // Check for allowable methods
    if (!allowedMethods[filePath].includes(method.toUpperCase())) return responseUtils.methodNotAllowed(response);

    // Require a correct accept header (require 'application/json' or '*/*')
    if (!requestUtils.acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
    }


};

module.exports = {handleRequest};
