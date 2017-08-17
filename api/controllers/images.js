const GoogleImages = require('google-images');
const _ = require("lodash");

const client = new GoogleImages(
  '013311614369239452324:z4hv3ha5cpa', 
  'AIzaSyAHwfA-3FMQnThZrl7syFjP6ZUQQHeqsns');

module.exports = {
  search: (req, res) => {
    
    client.search(req.swagger.params.choice.value)
    .then(images => {
      let links = _.map(images, image => image.thumbnail.url);
      res.json({ images : links });
    })
  }
}
