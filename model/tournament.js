const Match = require("./match");
const _ = require("lodash");

class Tournament {
  constructor({ contestantGroup, roundSet, userId }) {
    this.contestantGroup = contestantGroup;
    this.roundSet = roundSet;
    this.userId = userId;
  }

  /**
   * Gets all the players that are currently in this tournament
   */
  players() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.choices;
    } else {
      let latestWinningSeeds = this.roundSet.latestWinningSeeds();
      return _.filter(this.contestantGroup.choices, choice => _.includes(latestWinningSeeds, choice.seed));
    }
  }

  /**
   * Gets the next round number for this tournament
   */
  nextRoundNumber() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.numRounds();
    } else {
      return this.currentRoundNumber() - 1;
    }
  }

  /**
   * Gets the current round number of this tournament
   */
  currentRoundNumber() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.numRounds();
    } else {
      return this.roundSet.nextRoundNumber();
    }
  }

  /**
   * Gets the winner of the tournament
   */
  allWinners() {
    return [{
      tournamentNumber: this.tournamentNumber(),
      choice: this.players()[0].data
    }]
  }

  /**
   * Gets the identifier of this tournament within the bracket
   */
  tournamentNumber() {
    // if there's no history at all, then 
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.choices.length;
    } else {
      return this.roundSet.latestRound().tournamentNumber;
    }
  }

  getCompletedRounds() {
    const cg = this.contestantGroup;
    return _.map(this.roundSet.rounds, round => {
      return _.map(round.results, match => {
        const players = _.map(Object.keys(match), key => {
          const playerData = _.find(cg.choices, choice => choice.seed == key);
          return {
            seed: key,
            score: match[key],
            data: playerData.data
          }
        })

        let winner, loser;
        if (players[0].score >= players[1].score) {
          winner = players[0];
          loser = players[1];
        } else {
          winner = players[1];
          loser = players[0]
        }
        return { winner, loser };
      })
    })
  }

  /**
   * Gets the number of rounds that will be in this tournament
   */
  totalRounds() {
    if (!this.roundSet || this.roundSet.isEmpty()) {
      return this.contestantGroup.numRounds();
    } else {
      return this.roundSet.latestTotalRoundNumber();
    }
  }

  /**
   * Returns if the current user is the admin of the tournament
   * which will determine if they can close rounds on this tournament
   */
  isAdmin() {
    return this.userId === this.contestantGroup.userId;
  }

  /**
   * Determines if the tournament is currently voting, or if voting is closed
   */
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

  /** 
   * Gets the matches that will be played in the tournament
   */
  matches({ slugsAllowed = false, votes }) {
    let matches = [];
    let players = this.players();
    let votedMatches = _.map(votes, "matchId");
    for (let i = 0; i < players.length / 2; i++) {
      const home = players[i];
      const away = players[players.length - (i + 1)];

      // if one player is just a slug, there's no need for a match
      if ((!home.data.slug && !away.data.slug) || slugsAllowed) {
        let matchId = Match.encode({
          players: [away, home],
          bracketId: this.contestantGroup.contestantGroupId,
          roundNumber: this.currentRoundNumber()
        });
        if (!_.includes(votedMatches, `${matchId}-${this.bracketId()}`)) {
          matches.push(new Match({
            id: matchId,
            players: [home, away]
          }))
        }
      }
    }

    return matches;
  }
}

module.exports = Tournament;