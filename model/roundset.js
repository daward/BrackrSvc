const _ = require("lodash");

class RoundSet {
  constructor(rounds) {
    this.rounds = _.map(rounds, round => {
      round.results = round.results ? JSON.parse(round.results) : round.results
      return round;
    });
  }

  setter(name, func) {
    let retVal = this[name] || func();
    this[name] = retVal;
    return retVal;
  }

  latestRound() {
    return this.setter("latestRoundData",
      () => _.minBy(this.latestTournamentRounds(), round => round.roundNumber));
  }

  isEmpty() {
    return !this.rounds || !this.rounds.length;
  }

  latestTournament() {
    return this.setter("latestTournamentData",
      () => _.minBy(this.rounds, round => round.tournamentNumber));
  }

  nextRoundNumber() {
    return this.latestRound().roundNumber - 1
  }

  currentRoundNumber() {
    return this.latestRound().roundNumber;
  }

  latestTotalRoundNumber() {
    return _.maxBy(this.latestTournamentRounds(), round => round.roundNumber).roundNumber;
  }

  latestTournamentRounds() {
    let latestTournament = this.latestTournament();

    return this.setter("latestTournamentRoundsData",
      () => _.filter(this.rounds, round => round.tournamentNumber === latestTournament.tournamentNumber));
  }

  latestWinningSeeds() {
    const func = () => _.map(this.latestRound().results,
      matchResults => {
        let votes = _.objectToArray({ obj: matchResults, keyName: "seed", valueName: "voteCount" });
        return parseInt(_.maxBy(votes, "voteCount").seed);
      });

    return this.setter("latestWinningSeedData", func);
  }
}

module.exports = RoundSet;