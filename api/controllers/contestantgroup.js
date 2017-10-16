'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
const _ = require("lodash");
const cgData = require("../../model/database/contestantgroupdata");

module.exports = {

  createContestantGroup: (req, res) => {
    let choices = req.swagger.params.contestantGroupRequest.value.choices;
    let title = req.swagger.params.contestantGroupRequest.value.title;
    let userId = res.locals.getUserId();

    cgData.save({ userId, title, choices })
      .then(group => {
        delete group.userId;
        res.json(group);
      });
  },

  updateContestantGroup: (req, res) => {
    let id = req.swagger.params.id.value;
    let title = req.swagger.params.contestantGroupRequest.value.title;
    let choices = req.swagger.params.contestantGroupRequest.value.choices;

    cgData.get({ userId: res.locals.getUserId(), id })
      .then(group => cgData.save({ id: group.id, userId: group.userId, title, choices }))
      .then(group => {
        delete group.userId;
        res.json(group)
      })
      .catch(e => console.log(e));
  },

  getContestantGroup: (req, res) => {
    let id = req.swagger.params.id.value;

    cgData.get({ userId: res.locals.getUserId(), id })
      .then(group =>
        res.json({
          choices: group.choices,
          contestantGroupId: group.contestantGroupId,
          title: group.title
        }));
  },

  getContestantGroups: (req, res) => {
    cgData.getTemplates({ userId: res.locals.getUserId() })
      .then(groups =>
        res.json(_.map(groups, group => ({
          self: res.locals.selfLink(`/create/${group.contestantGroupId}`),
          title: group.title,
          id: group.contestantGroupId
        })))
      );
  }
}