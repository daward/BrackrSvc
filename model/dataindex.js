const _ = require("lodash")

class DataIndex {
  constructor() {
    this.indexById = {};
    this.indexByUser = {}
  }

  add({ userId, id, data }) {

    this.indexById[id] = data;

    // make sure we know about the user
    this.indexByUser[userId] = this.indexByUser[userId] || {};

    // then put the bracket there
    this.indexByUser[userId][id] = data;

    return data;
  }

  getAll({ userId }) {
    return this.indexByUser[userId] ?
      _.values(this.indexByUser[userId]) :
      [];
  }

  get({ userId, id }) {
    let dataSet =
      userId ? this.indexByUser[userId] : this.indexById

    return dataSet[id];
  }
}

module.exports = DataIndex;