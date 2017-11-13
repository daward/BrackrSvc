const _ = require("lodash");
const Match = require("./match");

class ContestantGroup {
  constructor({ id, title, choices, userId, voting }) {
    this.title = title;
    this.choices = choices;
    this.contestantGroupId = id;
    this.userId = userId;
    this.voting = voting;
  }

  seed() {
    let seed = 1;
    // concatenate slugs to the given choices 
    let totalPlayers = _.concat(this.choices, _.fill(new Array(this.roundNumberOfPlayers() - this.choices.length), { slug: true, text: "N/A" }))

    this.choices = _.map(totalPlayers, choice => ({
      seed: seed++,
      data: _.cloneDeep(choice)
    }));
  }

  numRounds() {
    // figure out how many rounds we'll need based on the number of players
    return Math.ceil(Math.log2(this.choices.length));
  }

  roundNumberOfPlayers() {
    // figure out how many players we need to fill out the first round
    return Math.pow(2, this.numRounds());
  }

  // newTournament(userId) {
  //   let numRounds = this.numRounds();
  //   return {
  //     // current round is a decrement of the last round
  //     currentRound: numRounds,
  //     // the total rounds is the maximum round number in the tournament
  //     totalRounds: numRounds,
  //     matches: this.makeMatches(),
  //     admin: this.userId === userId,
  //     title: this.title
  //   }
  // }

  // /**
  //  * Groups players into matches
  //  * @param {*} players - a set of players to turn into matches 
  //  */

  // currentRound({ userId, roundSet }) {
  //   // if there are no rounds, we need to start a new tournament
  //   if (roundSet.isEmpty()) {
  //     return this.newTournament(userId);
  //   }

  //   // if we're not currently voting, then the user gets results
  //   if (!this.voting) {
  //     return {
  //       results: roundSet.latestWinners()
  //     }
  //   }

  //   return this.existingTournament({ userId, roundSet });
  // }

  // existingTournament({ userId, roundSet }) {
  //   return {
  //     // current round is a decrement of the last round
  //     currentRound: roundSet.nextRoundNumber(),
  //     // the total rounds is the maximum round number in the tournament
  //     totalRounds: roundSet.latestTotalRounds(),
  //     matches: this.makeMatches(roundSet),
  //     admin: this.userId === userId,
  //     title: this.title
  //   }
  // }
}

module.exports = ContestantGroup;