const responseUtils = require('./utils/responseUtils');
const {renderPublic} = require('./utils/render');
const requestUtils = require('./utils/requestUtils');
const tts = require('./controllers/tts');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    '/api/tts': ['GET']
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

    if(filePath.startsWith('/api/tts')){
        const text = requestUtils.getQueryParams(request).get('text');
        if(!text){
            console.error('Missing text', url);
            responseUtils.badRequest(response);
        }
        const stream = await tts.getTTS(text);
        if(!stream){
            responseUtils.internalServerError(response);
        }
        response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': stream.readableLength,
            'Access-Control-Allow-Origin': '*'
        });
        return stream.pipe(response);
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
