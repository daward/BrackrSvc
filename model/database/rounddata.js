const database = require("./database");
const Joi = require("joi");
const shortid = require('shortid32');
const _ = require("lodash");
const P = require("bluebird");
const RoundSet = require("../roundset");

const RoundModel = database.define('CompletedRound', {
  hashKey: 'roundId',
  rangeKey: 'bracketId',

  // add the timestamp attributes (updatedAt, createdAt) 
  timestamps: true,

  schema: {
    roundId: Joi.string(),
    bracketId: Joi.string(),
    roundNumber: Joi.number(),
    tournamentNumber: Joi.number(),
    results: Joi.string()
  },
  indexes: [{
    hashKey: 'bracketId', rangeKey: 'roundId', name: 'bracketIndex', type: 'global'
  }]
});

// database.createTables({
//   'CompletedRound': { readCapacity: 5, writeCapacity: 2 }
// }, function (err) {
//   if (err) {
//     console.log('Error creating tables: ', err);
//   } else {
//     console.log('Tables has been created');
//   }
// });

module.exports = {
  get: ({ roundId }) => new P((resolve, reject) =>
    RoundModel.get(roundId, (err, round) => {
      if (err) {
        reject(err)
      } else {
        round = round.get();
        round.results = JSON.parse(round.results);
        resolve(round);
      }
    })),

  getForBracket: bracketId => new P((resolve, reject) => {
    RoundModel.query(bracketId)
      .usingIndex('bracketIndex').loadAll().exec((err, results) => {
        resolve(new RoundSet(_.map(results.Items, item => item.attrs)));
      })
  }),

  save: ({ roundId, bracketId, roundNumber, tournamentNumber, results }) => new P((resolve, reject) =>
    RoundModel.create({ roundId: roundId || shortid.generate(), bracketId, roundNumber, tournamentNumber, results: JSON.stringify(results) },
      (err, round) => {
        if (err) {
          reject(err)
        } else {
          let dbValues = round.get();
          resolve({
            roundId: dbValues.roundId,
            bracketId: dbValues.bracketId,
            roundNumber: dbValues.roundNumber,
            tournamentNumber: dbValues.tournamentNumber,
            results: dbValues.results ? JSON.parse(dbValues.results) : undefined
          })
        }
      }))
};