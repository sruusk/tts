const { getHelloWorld } = require('../models/helloWorld');

/**
 * Get Hello World!
 * @returns {Object} Hello World!
 */
const getHello = () => {
    return {message: getHelloWorld()};
}

module.exports = { getHello };
