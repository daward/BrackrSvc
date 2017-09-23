const Bracket = require("./bracket")
const DataIndex = require("./dataindex")
const dataIndex = new DataIndex();
const _ = require("lodash")

module.exports = {
  addBracket: ({ contestantGroup, userId }) => {
    let bracket = new Bracket(contestantGroup);
    dataIndex.add({ userId, id: bracket.id, data: bracket });
    bracket.init();
    return bracket;
  },

  getBrackets: ({ userId }) => {
    return dataIndex.getAll({ userId });
  },

  getBracket: ({ bracketId, userId }) => {
    return dataIndex.get({ userId, id: bracketId });
  }
}