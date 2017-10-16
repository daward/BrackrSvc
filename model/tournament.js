const Match = require("./match");
const _ = require("lodash");

class Tournament {
  constructor({ contestantGroup, roundSet, userId }) {
    this.contestantGroup = contestantGroup;
    this.roundSet = roundSet;
    this.userId = userId;
  }

  players() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.choices;
    } else {
      let latestWinningSeeds = this.roundSet.latestWinningSeeds();
      return _.filter(this.contestantGroup.choices, choice => _.includes(latestWinningSeeds, choice.seed));
    }
  }

  nextRoundNumber() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.numRounds();
    } else {
      return this.currentRoundNumber() - 1;
    }
  }

  currentRoundNumber() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.numRounds();
    } else {
      return this.roundSet.nextRoundNumber();
    }
  }

  tournamentNumber() {
    // if there's no history at all, then 
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.choices.length;
    } else {
      return this.roundSet.latestRound().tournamentNumber;
    }
  }

  totalRounds() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.numRounds();
    } else {
      return this.roundSet.latestTotalRoundNumber();
    }
  }

  isAdmin() {
    return this.userId === this.contestantGroup.userId;
  }

  isVoting() {
    // if there's no rounds, you're voting
    return (!this.roundSet || this.roundSet.isEmpty()) ||
      // otherwise, we know we're voting if the group says so
      this.contestantGroup.voting;
  }

  title() {
    return this.contestantGroup.title;
  }

  bracketId() {
    return this.contestantGroup.contestantGroupId;
  }

  matches() {
    let matches = [];
    let players = this.players();
    for (let i = 0; i < players.length; i = i + 2) {
      matches.push(new Match({
        id: Match.encode({
          players: [players[i], players[i + 1]],
          bracketId: this.contestantGroup.contestantGroupId,
          roundNumber: this.currentRoundNumber()
        }),
        players: [players[i], players[i + 1]]
      }))
    }
    return matches;
  }
}

module.exports = Tournament;