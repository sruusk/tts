const path = require('path');
const fs = require('fs');
const etag = require('etag');

const NOT_FOUND_TEMPLATE = path.resolve(__dirname, '../public/404.html');

/**
 * Render file from ./public directory (calls response.end())
 *
 * @param {string} filePath Path to the file.
 * @param {ServerResponse} response Http response
 * @returns {http.OutgoingMessage} Resolves to public
 */
const renderPublic = (filePath, response) => {
    if(process.env.NODE_ENV === 'production') {
        filePath = filePath.replace('.js', '.min.js')
            .replace('.css', '.min.css');
    }
    if (!filePath) return renderNotFound(response);
    const [, ext] = splitPath(filePath);
    const contentType = getContentType(ext);
    const fullPath = getFullFilePath(filePath);

    if (!fullPath) return renderNotFound(response);
    renderFile(fullPath, contentType, response);
};

/**
 * Render ../views/404.html (calls response.end())
 *
 * @param {ServerResponse} response Http response
 * @returns {void}
 */
const renderNotFound = response => {
    renderFile(NOT_FOUND_TEMPLATE, getContentType('html'), response);
};

/**
 * Get Content-Type based on file extension
 *
 * @param {string} fileExtension File extension.
 * @returns {string} contentType
 */
const getContentType = fileExtension => {
    let contentType;

    switch (fileExtension.toLowerCase().replace('.', '')) {
        case 'js':
            contentType = 'text/javascript';
            break;
        case 'css':
            contentType = 'text/css';
            break;
        case 'json':
            contentType = 'application/json';
            break;
        case 'xml':
            contentType = 'application/xml';
            break;
        case 'eot':
            contentType = 'application/vnd.ms-fontobject';
            break;
        case 'ttf':
            contentType = 'application/font-ttf';
            break;
        case 'otf':
            contentType = 'application/font-otf';
            break;
        case 'woff':
            contentType = 'application/font-woff';
            break;
        case 'woff2':
            contentType = 'application/font-woff2';
            break;
        case 'ico':
            contentType = 'image/x-icon';
            break;
        case 'webp':
            contentType = 'image/webp';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'jpg':
            contentType = 'image/jpg';
            break;
        case 'svg':
            contentType = 'image/svg+xml';
            break;
        case 'wav':
            contentType = 'audio/wav';
            break;
        default:
            contentType = 'text/html';
    }

    return contentType;
};

const renderFile = (filePath, contentType, response) => {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.statusCode = 500;
            if (error.code === 'ENOENT') {
                // console.error(`File does not exist: ${filePath}`);
                response.statusCode = 404;
                if (filePath !== NOT_FOUND_TEMPLATE) return renderNotFound(response);
            } else if (error.code === 'EACCES') {
                console.error(`Cannot read file: ${filePath}`);
            } else {
                console.error(
                    'Failed to read file: %s. Received the following error: %s: %s ',
                    filePath,
                    error.code,
                    error.message
                );
            }

            return response.end();
        }
        if(process.env.ENABLE_CACHING) {
            const tag = etag(content);
            if(response.getHeader('If-None-Match') === tag) {
                response.statusCode = 304;
                response.end();
                return;
            }
            response.setHeader('ETag', tag);
        }
        const status = filePath !== NOT_FOUND_TEMPLATE ? 200 : 404;
        response.writeHead(status, {'Content-Type': contentType});
        response.end(content, 'utf-8');
    });
};

const getFullFilePath = fileName => {
    const basePath = 'public';
    return path.resolve(
        __dirname,
        `../${basePath}/${fileName[0] === '/' ? fileName.substring(1) : fileName}`
    );
};

const splitPath = filePath => {
    const tmpPath = filePath.split('?')[0];
    const filename = path.basename(tmpPath);
    const ext = path.extname(filename);
    return [filename, ext];
};

module.exports = {renderPublic, renderNotFound, getContentType};