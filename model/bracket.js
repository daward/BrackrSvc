const _ = require("lodash");
const shortid = require('shortid32');
const Tournament = require("./tournament");

class Bracket {
  constructor(title, choices) {
    this.id = shortid.generate();
    let seed = 1;
    // seed the players
    this.players = _.map(choices, choice => {
      return {
        seed: seed++,
        data: choice
      }
    });
    this.tournaments = [];
    this.title = title;
  }

  init() {
    this.rounds = [];

    if (this.tournaments.length) {
      // we'll need to find the last winner, and then create a tournament
      // with every player that ever lost to this player

      // first find who the last winner was
      let lastWinner = this.tournaments[this.tournaments.length - 1].winner.seed;

      // then find everyone that lost to them
      let losers = _.flatten(_.map(this.tournaments, 
        tournament => tournament.getLosers(lastWinner)));

      if(!losers.length) {
        // its all over!
        return;
      }

      // now make the tournament
      this.tournaments.push(new Tournament(losers));
      if(losers.length === 1) {
        this.init();
      }
      
    } else {
      this.tournaments.push(new Tournament(this.players));
    }
  }

  isActive() {
    return this.getCurrentTournament().active;
  }

  getCurrentTournament() {
    return this.tournaments[this.tournaments.length - 1];
  }

  getWinners() {
    return _.map(this.tournaments, tournament => tournament.winner.data);
  }

  getChoices() {
    return _.map(this.players, player => player.data);
  }
}

module.exports = Bracket;