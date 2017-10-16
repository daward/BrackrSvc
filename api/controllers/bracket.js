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
const _ = require("lodash");
const cgData = require("../../model/database/contestantgroupdata");
const roundData = require("../../model/database/rounddata");
const P = require("bluebird");
const Tournament = require("../../model/tournament");
const voteData = require("../../model/database/votedata");
const Match = require("../../model/match");

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

const getTournament = (req, res) => {
  let bracketId = res.locals.getBracketId();
  let userId = res.locals.getUserId();
  return P.join(
    cgData.get({ id: bracketId }),
    roundData.getForBracket(bracketId),
    (contestantGroup, roundSet) => new Tournament({ contestantGroup, roundSet, userId }));
}

module.exports = {
  /**
   * creates a bracket with a given contestant group
   */
  createBracket: (req, res) => {
    let contestantGroupId = req.swagger.params.bracketRequest.value.contestantGroupId;
    let userId = res.locals.getUserId();

    // first get the group we're making a bracket for
    return cgData.get({ id: contestantGroupId })
      // seed the players in that group
      .tap(group => group.seed())
      // then save that seeded group
      .then(group => cgData.save({ userId, title: group.title, choices: group.choices, active: true, voting: true }))
      // and tell the user about your good work
      .then(group => res.json({ bracketId: group.contestantGroupId }));
  },

  /**
   * Given a bracket and tournament, returns the rounds that have been completed
   */
  getCompletedTournament: (req, res) => {
    let tournamentId = req.swagger.params.tournamentId.value;
    let bracketId = res.locals.getBracketId();

    P.join(
      cgData.get({ id: bracketId }),
      roundData.getForBracket(bracketId),
      (contestantGroup, rounds) => new Bracket(contestantGroup, rounds))
      .then(bracket => {
        const tournament = bracket.tournaments[tournamentId];
        const rounds = tournament.getCompletedRounds();
        res.json({ rounds });
      });
  },

  getBracket: (req, res) => {
    cgData.get({ id: res.locals.getBracketId() })
      .then(bracket => {
        if (bracket) {
          res.json({ bracketId: bracket.id });
        } else {
          res.json({});
        }
      })
  },

  rerun: (req, res) => {
    let bracket = bracketIndex.getBracket(userBracketIds(req, res));
    bracket.init();
    res.json();
  },

  currentRound: (req, res) => {
    getTournament(req, res)
      .then(tournament => {
        let current;
        if (!tournament.isVoting()) {
          current = {
            results: [tournament.players()[0].data],
            admin: tournament.isAdmin(),
            title: tournament.title()
          }
        } else {
          current = {
            // current round is a decrement of the last round
            currentRound: tournament.currentRoundNumber(),
            // the total rounds is the maximum round number in the tournament
            totalRounds: tournament.totalRounds(),
            matches: tournament.matches(),
            admin: tournament.isAdmin(),
            title: tournament.title()
          }
        }

        // if the round is over, or you aren't the admin, you don't need to know
        // anything about the number of votes
        if (current.results || !tournament.isAdmin()) {
          res.json(current);
        } else {
          // if the tournament isnt over and you're the admin you'll want to know how many votes there are
          voteData.getRoundVotes({ bracketId: tournament.bracketId(), roundNumber: tournament.currentRoundNumber() })
            .then(voteSet => {
              current.totalVotes = voteSet.votes.length;
              res.json(current);
            });
        }
      });
  },

  vote: (req, res) => {
    const matchId = req.swagger.params.matchId.value;
    const seed = req.swagger.params.seed.value;
    const userId = res.locals.getUserId();
    const bracketId = res.locals.getBracketId();
    const roundNumber = Match.decode(matchId).roundNumber;

    voteData.save({
      userId, seed, matchId, roundNumber, bracketId
    }).then(() => res.json());
  },

  close: (req, res) => {
    getTournament(req, res)
      .then(tournament => {
        // if you're not an admin, get out
        if (!tournament.isAdmin()) {
          res.status(403);
          return;
        }

        // get all the votes for the round to decide the winners
        voteData.getRoundVotes({ bracketId: tournament.bracketId(), roundNumber: tournament.currentRoundNumber() })
          .then(voteSet => {
            roundData.save({
              bracketId: tournament.bracketId(),
              roundNumber: tournament.currentRoundNumber(),
              tournamentNumber: tournament.tournamentNumber(),
              results: voteSet.winners()
            })
            .then(() => {
              if(tournament.currentRoundNumber() === 1) {
                cgData.stopVoting(tournament.bracketId()).then(() => res.json())
              }
              else {
                res.json();
              }
            })
          });
      })
  },

  getBrackets: (req, res) => {
    cgData.getActive({ userId: res.locals.getUserId() })
      .then(groups => {
        const retVal = _.map(groups, group => {
          return {
            self: res.locals.selfLink(`/brackets/${group.contestantGroupId}`),
            id: group.contestantGroupId,
            title: group.title || "untitled",
            currentRound: 0,
            numberOfRounds: 0
          }
        });
        res.json(retVal);
      })
  }
};
