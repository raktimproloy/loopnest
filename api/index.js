// Bridge file for Vercel serverless runtime
// Uses the compiled Express app from dist/app.js
const compiled = require('../dist/app.js');
const app = compiled.default || compiled;

module.exports = app;


