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

const getTournament = (req, res, tournamentNumber) => {
  let bracketId = res.locals.getBracketId();
  let userId = res.locals.getUserId();
  return P.join(
    cgData.get({ id: bracketId }),
    roundData.getForBracket({ bracketId, tournamentNumber }),
    (contestantGroup, roundSet) => new Tournament({ contestantGroup, roundSet, userId }));
}

const getCurrentTournamentData = (tournament) => {
  if (!tournament.isVoting()) {
    return P.resolve({
      currentRound: tournament.currentRoundNumber(),
      results: tournament.allWinners(),
      admin: tournament.isAdmin(),
      title: tournament.title(),
      matches: [],
      bracketId: tournament.bracketId()
    });
  } else {
    return voteData.getUserVotes({ bracketId: tournament.bracketId(), userId: tournament.userId })
      .then(votes => {
        votes = _.filter(votes.votes, vote => vote.roundNumber === tournament.currentRoundNumber());
        return {
          // current round is a decrement of the last round
          currentRound: tournament.currentRoundNumber(),
          // the total rounds is the maximum round number in the tournament
          totalRounds: tournament.totalRounds(),
          matches: tournament.matches({ votes }),
          admin: tournament.isAdmin(),
          title: tournament.title(),
          bracketId: tournament.bracketId()
        }
      })
  }
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

    getTournament(req, res, tournamentId)
      .then(tournament => {
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
    // first load up the tournament we're talking about
    getTournament(req, res)
      .then(tournament => getCurrentTournamentData(tournament))
      .then(current => {
        // if the round is over and you're the admin you'll want to know how many votes there are
        if (!current.matches.length && current.admin) {
          voteData.getRoundVotes({ bracketId: current.bracketId, roundNumber: current.currentRound })
            .then(voteSet => {
              current.totalVotes = voteSet.votes.length;
              res.json(current);
            });
        } else {
          res.json(current);
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
            let matches = _.map(tournament.matches({ slugsAllowed: true }), match => {
              return _.map(match.players, player => player.seed);
            })
            roundData.save({
              bracketId: tournament.bracketId(),
              roundNumber: tournament.currentRoundNumber(),
              tournamentNumber: tournament.tournamentNumber(),
              results: voteSet.winners(matches)
            })
              .then(() => {
                if (tournament.currentRoundNumber() === 1) {
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
