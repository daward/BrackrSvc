'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
const YAML = require('yamljs');
const path = require("path");

module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
};
var express = require("express");

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  //swaggerExpress.runner.config.swagger.bagpipes._swagger_validate.validateResponse = false;
  // install middleware
  swaggerExpress.register(app);
  var swaggerUiPath = path.join(__dirname, "./swagger-ui");
  app.use("/swagger-ui", express.static(swaggerUiPath));

  var port = process.env.PORT   || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
