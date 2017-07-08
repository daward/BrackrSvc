const _ = require("lodash");

class Bracket {
  constructor(choices) {
    this.choices = choices;
  }

  init() {
    this.rounds = [];
    // figure out how many rounds we'll need based on the number of players
    let numRounds = Math.ceil(Math.sqrt(this.choices.length));

    // figure out how many players we need to fill out the first round
    let numTotalPlayers = Math.pow(2, numRounds);

    // seed the players we have
    let seed = 1;
    let players = _.map(this.choices, choice => {
      return {
        seed: seed++,
        data: choice
      }
    });

    // fill out the rest of the players
    players = _.concat(players, _.fill(new Array(numTotalPlayers - players.length), { slug: true }))

    // create a round with these players
    this.rounds.push(this.buildRound(players));
  }

  buildRound(players) {
    let matches = [];
    for (let i = 0; i < players.length / 2; i++) {
      matches.push({
        id: matches.length.toString(),
        players: [players[i], players[players.length - 1 - i]],
        scores: [0, 0]
      });
    }
    return matches;
  }

  currentRound() {
    return this.rounds[this.rounds.length - 1];
  }

  activeGames() {
    return _.filter(this.currentRound(), match => _.every(match.players, player => !player.slug));
  }

  vote(matchId, seed) {
    let match = this.activeMatch(matchId);
    if(match.players[0].seed === seed) {
      match.scores[0]++;
    } else if (match.players[1].seed === seed) {
      match.scores[1]++;
    }
  }

  activeMatch(matchId) {
    return _.find(this.activeGames(), match => match.id === matchId);
  }

  closeRound() {
    this.rounds.push(this.buildRound(this.getWinners()));
  }

  getWinners() {
    // for the current round of games, find the winner of each
    return _.map(this.currentRound(), match => {
      // if the player is a fake, then move the top seed
      if (match.players[1].slug) {
        return match.players[0];
      }

      // otherwise return the higher score, higher seed wins in a tie
      if (match.scores[0] >= match.scores[1]) {
        return match.players[0];
      } else {
        return match.players[1];
      }
    });
  }
}

module.exports = Bracket;