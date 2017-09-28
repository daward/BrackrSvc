const database = require("./database");
const Joi = require("joi");

const CgModel = database.define('ContestantGroup', {
  hashKey: 'id',

  // add the timestamp attributes (updatedAt, createdAt) 
  timestamps: true,

  schema: {
    id: Joi.string(),
    userId: Joi.string(),
    title: Joi.string(),
    choices: Joi.string()
  }
});

module.exports = {
  save: ({ id, userId, title, choices, cb }) => CgModel.create({ id, userId, title, choices: JSON.stringify(choices) },
    (err, group) => {
      let dbValues = group.get();
      cb({
        contestantGroupId: dbValues.id,
        title: dbValues.title,
        choices: JSON.parse(dbValues.choices)
      })
    }),

  get: ({ userId, id, cb }) => {
    CgModel.get(id, (err, group) => {
      if (err) {
        cb({ err })
      } else {
        group = group.get();
        group.choices = JSON.parse(group.choices);
        cb({ group });
      }
    })
  },

  getAll: ({ userId, cb }) => {
    CgModel.scan().where('userId').equals(userId).exec((err, results) => {
      cb(results);
    })
  }
}