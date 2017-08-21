var groups = {}
const shortid = require('shortid32');
const ContestantGroup = require("./contestantgroup");

module.exports = {
  addGroup: (title, choices) => {
    let id = shortid.generate();
    groups[id] = new ContestantGroup(id, title, choices);
    return groups[id];
  },
  getGroup: req => {
    var id = req.swagger.params.id.value;
    return groups[id];
  },
  getGroupById: id => {
    return groups[id];
  }
}