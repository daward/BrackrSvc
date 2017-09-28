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
const util = require('util');
const shortid = require('shortid32');
const bracketIndex = require("../../model/brackets");
const _ = require("lodash");
const cgData = require("../../model/database/contestantgroupdata");

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */

const userBracketIds = (req, res) => {
  let retVal = bracketIds(req);
  retVal.userId = res.locals.getUserId();
  return retVal;
}

const bracketIds = req => {
  return {
    bracketId: req.swagger.params.id.value
  }
}

module.exports = {
  createBracket: (req, res) => {
    let contestantGroupId = req.swagger.params.bracketRequest.value.contestantGroupId;

    cgData.get({
      id: contestantGroupId, cb: ({ group, error }) => {
        let bracket = bracketIndex.addBracket({ contestantGroup: group, userId: res.locals.getUserId() })
        res.json({ bracketId: bracket.id, contestantGroupId });
      }
    })
  },

  getCompletedTournament: (req, res) => {
    let bracket = bracketIndex.getBracket(bracketIds(req));
    let tournamentId = req.swagger.params.tournamentId.value;
    const tournament = bracket.tournaments[tournamentId];
    const rounds = tournament.getCompletedRounds();
    res.json({ rounds });
  },

  getBracket: (req, res) => {
    let bracket = bracketIndex.getBracket(bracketIds(req))
    res.json({ bracketId: bracket.id, contestantGroupId: bracket.contestantGroup.contestantGroupId });
  },

  rerun: (req, res) => {
    let bracket = bracketIndex.getBracket(userBracketIds(req, res));
    bracket.init();
    res.json();
  },

  currentRound: (req, res) => {
    let bracket = bracketIndex.getBracket(bracketIds(req));
    let tournament = bracket.getCurrentTournament()
    let retVal = {
      currentRound: tournament.rounds.length,
      totalRounds: tournament.numRounds,
      matches: [],
      admin: !!bracketIndex.getBracket(userBracketIds(req, res)),
      title: bracket.title
    }

    if (bracket.isActive()) {
      retVal.matches = tournament.activeGames();
    } else {
      retVal.results = bracket.getWinners();
    }

    res.json(retVal);
  },

  vote: (req, res) => {
    var matchId = req.swagger.params.matchId.value;
    var seed = req.swagger.params.seed.value;
    let voterId = res.locals.getUserId();
    var bracket = bracketIndex.getBracket(bracketIds(req));
    bracket.getCurrentTournament().vote({ matchId, seed, voterId });
    res.json();
  },

  close: (req, res) => {
    var bracket = bracketIndex.getBracket(userBracketIds(req, res));
    bracket.getCurrentTournament().closeRound();
    res.json();
  },

  getBrackets: (req, res) => {
    let brackets = bracketIndex.getBrackets({ userId: res.locals.getUserId() })

    res.json(_.map(brackets, bracket => ({
      self: res.locals.selfLink(`/brackets/${bracket.id}`),
      id: bracket.id,
      title: bracket.title,
      currentRound: bracket.getCurrentTournament().rounds.length,
      numberOfRounds: bracket.getCurrentTournament().numRounds
    })));
  }
};
