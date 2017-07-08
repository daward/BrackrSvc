'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var shortid = require('shortid');
var brackets = require("../../model/brackets");
var Bracket = require("../../model/bracket");

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */

let getBracket = req => {
  var id = req.swagger.params.id.value;
  return brackets[id];
};

module.exports = {
  create: (req, res) => {
    var id = shortid.generate();
    var choices = req.swagger.params.choices.value;
    brackets[id] = new Bracket(choices);
    brackets[id].init();
    res.json({ id: id, choices: choices });
  },

  get: (req, res) => {
    res.json({ id: id, choices: getBracket(req).choices });
  },

  currentRound: (req, res) => {
    res.json(getBracket(req).activeGames());
  },

  vote: (req, res) => {
    var matchId = req.swagger.params.matchId.value;
    var seed = req.swagger.params.seed.value;
    var bracket = getBracket(req);
    bracket.vote(matchId, seed);
    res.json();
  },

  close: (req, res) => {
    var bracket = getBracket(req);
    bracket.closeRound();
    res.json();
  }
};
