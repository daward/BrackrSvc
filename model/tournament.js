const _ = require("lodash");
const Match = require("./match");

class Tournament {
  constructor(players) {
    this.rounds = [];
    this.players = players;

    if (players.length > 1) {

      this.active = true;

      // figure out how many rounds we'll need based on the number of players
      this.numRounds = Math.ceil(Math.log2(this.players.length));

      // figure out how many players we need to fill out the first round
      let numTotalPlayers = Math.pow(2, this.numRounds);

      // fill out the rest of the players
      let totalPlayers = _.concat(players, _.fill(new Array(numTotalPlayers - this.players.length), { slug: true }))

      // create a round with these players
      this.rounds.push(this.buildRound(totalPlayers));
    } else {
      this.winner = this.players[0];
      this.numRounds = 0;
    }
  }

  buildRound(players) {
    let matches = [];
    for (let i = 0; i < players.length / 2; i++) {
      matches.push(new Match({
        id: matches.length.toString(),
        players: [players[i], players[players.length - 1 - i]]
      }));
    }
    return matches;
  }

  closeRound() {
    if (this.active) {
      // the tournament is over
      if (this.rounds.length === this.numRounds) {
        this.winner = this.getWinners()[0];
        this.active = false;
      } else {
        this.rounds.push(this.buildRound(this.getWinners()));
      }
    }
  }

  /**
   * Gets all the players in this tournament that lost to this seed
   * @param {*} seed 
   */
  getLosers(seed) {
    let losers = [];
    _.forEach(this.rounds, round => {
      _.forEach(round, match => {
        losers.push(match.getLostTo(seed));
      });
    });
    return _.compact(losers);
  }

  getWinners() {
    // for the current round of games, find the winner of each
    return _.map(this.currentRound(), match => match.getWinner());
  }

  currentRound() {
    return this.rounds[this.rounds.length - 1];
  }

  /**
   * Gets the match corresponding to the id
   * @param {*} matchId 
   */
  activeMatch(matchId) {
    return _.find(this.activeGames(), match => match.id === matchId);
  }

  /**
   * Returns all the games in the round that do not have a slug
   */
  activeGames() {
    return _.filter(this.currentRound(), match => !match.hasSlug());
  }

  vote(matchId, seed) {
    this.activeMatch(matchId).vote(seed);
  }
}

module.exports = Tournament;