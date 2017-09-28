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
const shortid = require('shortid32');

module.exports = {

  createContestantGroup: (req, res) => {
    let choices = req.swagger.params.contestantGroupRequest.value.choices;
    let title = req.swagger.params.contestantGroupRequest.value.title;
    let userId = req.swagger.params["X-User-ID"].value;

    cgData.save({
      id: shortid.generate(), userId, title, choices, cb: group => {
        res.json(group)
      }
    });
  },

  updateContestantGroup: (req, res) => {
    let id = req.swagger.params.id.value;
    let title = req.swagger.params.contestantGroupRequest.value.title;
    let choices = req.swagger.params.contestantGroupRequest.value.choices;

    let cg = cgData.get({
      userId: res.locals.getUserId(), id,
      cb: ({ err, group }) => {
        cgData.save({
          id: group.id, userId: group.userId, title, choices, cb: group => {
            res.json(group);
          }
        });
      }
    });
  },

  getContestantGroup: (req, res) => {
    let id = req.swagger.params.id.value;

    cgData.get({
      userId: res.locals.getUserId(), id,
      cb: ({ err, group }) => {
        res.json({
          choices: group.choices,
          contestantGroupId: group.id,
          title: group.title
        });
      }
    });
  },

  getContestantGroups: (req, res) => {
    let data = cgData.getAll({
      userId: res.locals.getUserId(), cb: results => {
        res.json(_.map(results.Items, item => ({
          self: res.locals.selfLink(`/create/${item.attrs.id}`),
          title: item.attrs.title,
          id: item.attrs.id
        })))
      }
    });
  }
}