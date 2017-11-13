const _ = require("lodash");

class VoteSet {
  constructor(votes) {
    this.votes = votes;
  }

  winners(matches) {

    let matchResults = _.map(matches, match => {
      let retVal = {};

      retVal[match[0]] = 0;
      retVal[match[1]] = 0;
      return retVal;
    });  

    // for every match, count up the votes for each
    let totalVotes = _.countBy(this.votes, 'seed');

    _.forEach(matchResults, match => {
      let topSeed = _.keys(match)[0];
      let underdog = _.keys(match)[1];

      match[topSeed] = totalVotes[topSeed] || 0;
      match[underdog] = totalVotes[underdog] || 0;
    });

    return matchResults;
  }
}

module.exports = VoteSet;