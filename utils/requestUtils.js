
/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request Incoming request.
 * @returns {boolean} Client accepts JSON.
 */
const acceptsJson = request => {
    if(!Object.keys(request.headers).includes("accept")) return false;
    const acceptHeader = request.headers["accept"];
    if (acceptHeader === null || acceptHeader === undefined) return false;
    return (acceptHeader.split(',').includes("application/json") || acceptHeader.includes("*/*"));

};

/**
 * Is the client request content type JSON?
 *
 * @param {http.IncomingMessage} request Incoming request.
 * @returns {boolean} Request content type is JSON,
 */
const isJson = request => {
    const header = request.headers["content-type"];
    //let header = request.get("Content-Type");
    return header !== ""
        && header !== null && header === "application/json"
        && header !== undefined;

};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request Incoming request.
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('error', err => reject(err));

        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => {
            try{
                resolve(JSON.parse(body));
            }catch (e){
                resolve(null);
            }

        });
    });
};

// eslint-disable-next-line jsdoc/require-jsdoc
function getQueryParams(request) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    return url.searchParams;
}

module.exports = { getQueryParams, acceptsJson, isJson, parseBodyJson };
