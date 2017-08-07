const _ = require("lodash");

class Match {
  constructor({ id, players }) {
    this.id = id;
    this.players = players;
    this.scores = [0, 0];
  }

  getWinner() {
    // if the player is a fake, then move the top seed
    if (this.players[1].slug) {
      return this.players[0];
    }
    // otherwise return the higher score, higher seed wins in a tie
    if (this.scores[0] >= this.scores[1]) {
      return this.players[0];
    } else {
      return this.players[1];
    }
  }

  getLoser() {
    // there is no loser, just a filler player
    if (this.players[1].slug) {
      return
    }

    // otherwise return the higher score, higher seed wins in a tie
    if (this.scores[0] >= this.scores[1]) {
      return this.players[1];
    } else {
      return this.players[0];
    }
  }

  vote(seed) {
    if (this.players[0].seed === seed) {
      this.scores[0]++;
    } else if (this.players[1].seed === seed) {
      this.scores[1]++;
    }
  }

  /**
   * Determines if this match has a filler player in it
   */
  hasSlug() {
    return !_.every(this.players, player => !player.slug)
  }

  /**
   * Returns a player that lost to this player
   * @param {*} seed 
   */
  getLostTo(seed) {
    if(this.getWinner().seed === seed) {
      return this.getLoser();
    }
  }
}

module.exports = Match;