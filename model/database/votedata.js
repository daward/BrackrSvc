const database = require("./database");
const Joi = require("joi");
const P = require("bluebird");
const VoteSet = require("../voteset");
const _ = require("lodash");

const VoteModel = database.define('Vote', {
  hashKey: 'matchId',
  rangeKey: 'roundNumber',

  // add the timestamp attributes (updatedAt, createdAt) 
  timestamps: true,

  schema: {
    bracketId: Joi.string(),
    roundNumber: Joi.number(),
    matchId: Joi.string(),
    userId: Joi.string(),
    seed: Joi.number(),
  },
  indexes: [{
    hashKey: 'bracketId', rangeKey: 'roundNumber', name: 'roundIndex', type: 'global'
  }, {
    hashKey: 'bracketId', rangeKey: 'userId', name: 'userIndex', type: 'global'
  }]
});

// database.createTables({
//   'Vote': { readCapacity: 3, writeCapacity: 5 }
// }, function (err) {
//   if (err) {
//     console.log('Error creating tables: ', err);
//   } else {
//     console.log('Tables has been created');
//   }
// });

module.exports = {
  save: ({ userId, seed, matchId, roundNumber, bracketId }) => new P((resolve, reject) =>
    VoteModel.create({ userId, seed, matchId: matchId + "-" + bracketId, roundNumber, bracketId },
      (err, vote) => {
        if (err) {
          reject(err)
        } else {
          let dbValues = vote.get();
          resolve();
        }
      })
  ),

  getUserVotes: ({ bracketId, userId }) => new P((resolve, reject) => {
    VoteModel.query(bracketId)
      .usingIndex('userIndex')
      .where('userId').equals(userId)
      .loadAll().exec((err, results) => {
        resolve(new VoteSet(_.map(results.Items, item => item.attrs)));
      })
  }),

  getRoundVotes: ({ bracketId, roundNumber }) => new P((resolve, reject) => {
    VoteModel.query(bracketId)
      .usingIndex('roundIndex')
      .where('roundNumber').equals(roundNumber)
      .loadAll().exec((err, results) => {
        resolve(new VoteSet(_.map(results.Items, item => item.attrs)));
      })
  })
}