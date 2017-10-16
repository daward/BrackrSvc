const database = require("./database");
const Joi = require("joi");
const shortid = require('shortid32');
const _ = require("lodash");
const P = require("bluebird");
const ContestantGroup = require("../contestantgroup");

const CgModel = database.define('ContestantGroup', {
  hashKey: 'id',

  // add the timestamp attributes (updatedAt, createdAt) 
  timestamps: true,

  schema: {
    id: Joi.string(),
    userId: Joi.string(),
    title: Joi.string(),
    choices: Joi.string(),
    active: Joi.boolean().default(false),
    voting: Joi.boolean().default(false)
  }
});

const get = ({ userId, id }) => {
  return new P((resolve, reject) => {
    CgModel.get(id, (err, group) => {
      if (err) {
        reject(err);
      } else {
        group = group.get();
        resolve(new ContestantGroup({
          id: group.id,
          title: group.title,
          choices: JSON.parse(group.choices),
          userId: group.userId,
          voting: group.voting
        }));
      }
    })
  });
};

const save = ({ id, userId, title, choices, active, voting }) =>
  new P((resolve, reject) => {
    CgModel.create({ id: id || shortid.generate(), userId, title, choices: JSON.stringify(choices), active, voting },
      (err, group) => {
        if (err) {
          reject(err);
        } else {
          let dbValues = group.get();
          resolve(new ContestantGroup({
            id: dbValues.id,
            title: dbValues.title,
            choices: JSON.parse(dbValues.choices),
            userId: dbValues.userId,
            voting: dbValues.voting
          }))
        }
      })
  });

module.exports = {
  save,
  get,
  getActive: ({ userId }) => new P((resolve, reject) => {
    CgModel.scan().where('userId').equals(userId).where("active").equals(true).exec((err, results) => {
      let groups = _.map(results.Items, result => {
        return new ContestantGroup({
          id: result.attrs.id,
          title: result.attrs.title,
          choices: JSON.parse(result.attrs.choices),
          userId: result.attrs.userId
        });
      })
      resolve(groups);
    })
  }),
  stopVoting: bracketId => new P((resolve, reject) => {
    CgModel.update({ id: bracketId, voting: false }, function (err, group) {
      let dbValues = group.get();
      resolve(new ContestantGroup({
        id: dbValues.id,
        title: dbValues.title,
        choices: JSON.parse(dbValues.choices),
        userId: dbValues.userId,
        voting: dbValues.voting
      }))
    });
  }),
  getTemplates: ({ userId }) => new P((resolve, reject) => {
    CgModel.scan().where('userId').equals(userId).exec((err, results) => {

      let items = _.filter(results.Items, item => !item.attrs.active);

      let groups = _.map(items, result => {
        return new ContestantGroup({
          id: result.attrs.id,
          title: result.attrs.title,
          choices: JSON.parse(result.attrs.choices),
          userId: result.attrs.userId
        });
      })
      resolve(groups);
    })
  })
}