const _ = require("lodash");
const HashIds = require("hashids");
const hasher = new HashIds("saltysalt");

class Match {
  constructor({ id, players }) {
    this.id = id;
    this.players = players;
    this.votes = [];
  }

  static encode({ players, roundNumber }) {
    return hasher.encode(roundNumber, players[0].seed, players[1].seed);
  }

  static decode(hash) {
    const values = hasher.decode(hash);
    return {
      roundNumber: values[0],
      seeds: [
        values[1], values[2]
      ]
    }
  }

  getScoresBySeed() {
    let scores = _.countBy(this.votes, 'seed');
    return [{
      seed: this.players[0].seed,
      score: _.get(scores, this.players[0].seed, 0),
    }, {
      seed: this.players[1].seed,
      score: _.get(scores, this.players[1].seed, 0),
    }];
  }

  getWinner() {
    // if the player is a fake, then move the top seed
    if (this.players[1].slug) {
      return this.players[0];
    }

    let scores = this.getScoresBySeed();
    let winningSeed = _.maxBy(scores, 'score').seed;
    return _.find(this.players, player => player.seed === winningSeed);
  }

  getLoser() {
    // there is no loser, just a filler player
    if (this.players[1].slug) {
      return
    }

    let scores = this.getScoresBySeed();
    let losingSeed = _.minBy(scores, 'score').seed;
    return _.find(this.players, player => player.seed === losingSeed);
  }

  vote({ seed, voterId }) {
    this.votes.push({ seed, voterId });
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
    if (this.getWinner().seed === seed) {
      return this.getLoser();
    }
  }
}

module.exports = Match;