'use strict';
let _ = require("lodash");
var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
const YAML = require('yamljs');
const path = require("path");
const cors = require("cors");

_.objectToArray = ({ obj, valueName = "value", keyName = "key" }) => {
  let retVal = [];
  _.forOwn(obj, (value, key) => {
    let retObj = {};
    retObj[keyName] = key;
    retObj[valueName] = value;
    retVal.push(retObj);
  })
  return retVal;
}

module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
};
var express = require("express");

app.use((req, res, next) => {
  res.locals.getUserId = () => req.swagger.params["X-User-ID"].value;
  next();
});

app.use((req, res, next) => {
  res.locals.getBracketId = () => req.swagger.params.id.value;
  next();
})

app.use((req, res, next) => {
  res.locals.selfLink = route => `http://localhost:10010${route}`
  next();
});

app.use(cors());

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) { throw err; }
  //swaggerExpress.runner.config.swagger.bagpipes._swagger_validate.validateResponse = false;
  // install middleware
  swaggerExpress.register(app);
  var swaggerUiPath = path.join(__dirname, "./swagger-ui");
  app.use("/swagger-ui", express.static(swaggerUiPath));


  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});