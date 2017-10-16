const _ = require("lodash");

class VoteSet {
  constructor(votes) {
    this.votes = votes;
  }

  winners() {

    // group the set of votes by match, turn back into array
    let matches = _.objectToArray({
      obj: _.groupBy(this.votes, vote => vote.matchId),
      keyName: "matchId",
      valueName: "votes" });

    // for every match, count up the votes for each
    let results = _.map(matches, match => _.countBy(match.votes, 'seed'));

    return results;
  } 
}

module.exports = VoteSet;