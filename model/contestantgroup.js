const ContestantGroupData = require("./database/contestantgroupdata");

class ContestantGroup {
  constructor(id, title, choices) {
    this.title = title;
    this.choices = choices;
    this.contestantGroupId = id;
  }

  save() {
    ContestantGroupData.create({
      id: this.contestantGroupId,
      title: this.title,
      choices: JSON.stringify(this.choices)
    }, (err, group) => {
      console.log(err);
    })
  }
}

module.exports = ContestantGroup;