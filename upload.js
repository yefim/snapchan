var imgur = require('imgur-upload');
var mongo = require('mongoskin');
var fs = require('fs');

var db = mongo.db('localhost:27017/spoonpics', {safe: true}).collection('pics');
imgur.setClientID('b1cf3448754f15f');

function upload (filename, from, callback) {
  imgur.upload(filename, function (err, imgurRes) {

    if (err) {
      console.dir(err);
      callback('imgur upload failed');
    } 

    else if (!imgurRes.data || !imgurRes.data.link) {
      // imgur-upload calls my callbakc twice for some reason
    }

    else {
      try {
        db.insert({
          url: imgurRes.data.link,
          from: from
        }, {}, function (err) {
          if (err) {
            console.dir(err);
            callback('mongo insert failed');
          } else {
            console.log("mongo insert succeeded");
            callback();
          }
        }); 
      } catch (e) { console.dir(e); }

      fs.unlink(filename, function (err) { 
        if (err) console.log('Error deleting temporary file: ' + filename); 
      });
    }
  });
};

module.exports = upload;
