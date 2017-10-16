const _ = require("lodash");
const shortid = require('shortid32');
const Tournament = require("./tournament");

class Bracket {
  constructor({ contestantGroup, rounds }) {
    this.contestantGroup = contestantGroup;

  }

  init() {

    // if there have been previous tournaments, we'll have to start up a new tournament
    if (this.tournaments.length) {
      // we'll need to find the last winner, and then create a tournament
      // with every player that ever lost to this player

      // first find who the last winner was
      let lastWinner = this.tournaments[this.tournaments.length - 1].winner.seed;

      // then find everyone that lost to them
      let losers = _.flatten(_.map(this.tournaments,
        tournament => tournament.getLosers(lastWinner)));

      if (!losers.length) {
        // its all over!
        return;
      }

      // now make the tournament
      this.tournaments.push(new Tournament({ id: this.tournaments.length, players: losers }));

      // if there is only one loser, we're all done
      if (losers.length === 1) {
        this.init();
      }

    } else {
      this.tournaments.push(new Tournament({ id: this.tournaments.length, players: this.contestantGroup.choices }));
    }
  }

  isActive() {
    return this.getCurrentTournament().active();
  }

  getCurrentTournament() {
    return _.maxBy(this.tournaments, tournament => tournament.id);
  }

  getWinners() {
    return _.map(this.tournaments, tournament => tournament.winner.data);
  }
}

module.exports = Bracket;