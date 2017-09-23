const DataIndex = require("./dataindex");
const dataIndex = new DataIndex();
const shortid = require('shortid32');
const ContestantGroup = require("./contestantgroup");

module.exports = {
  addGroup: ({ title, choices, userId }) => {
    let id = shortid.generate();
    let cg = new ContestantGroup(id, title, choices);
    return dataIndex.add({ userId, id, data: cg });
  },

  getGroup: ({ userId, id }) => {
    return dataIndex.get({ userId, id });
  },

  getGroups: ({ userId }) => {
    return dataIndex.getAll({ userId });
  }

}