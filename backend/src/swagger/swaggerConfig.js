const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0', // Swagger 3.0
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation for my Node.js app',
        },
        servers: [
            {
                url: 'http://localhost:8000', // change according to your environment
            },
        ],
    },
    apis: ['./routes/*.js'], // path to files with OpenAPI annotations
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
