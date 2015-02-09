var imgur = require('imgur-upload');
var mongo = require('mongoskin');
var fs = require('fs');
var _ = require('lodash');

var db = mongo.db('localhost:27017/snapchan', {safe: true}).collection('pics');
imgur.setClientID('f5ad64079b3b9a3');

function upload (filename, id, from, callback) {
  imgur.upload(filename, function (err, imgurRes) {
    console.log(imgurRes);

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
          id: id,
          from: from
        }, {}, function (err) {
          if (err) {
            console.dir(err);
            callback('mongo insert failed');
          } else {
            //console.log("mongo insert succeeded");
            callback(null, imgurRes.data.link);
          }
        }); 
      } catch (e) { console.dir(e); }

      fs.unlink(filename, function (err) { 
        if (err) console.log('Error deleting temporary file: ' + filename); 
      });
    }
  });
};

function mark (id, callback) {
  db.insert({
    url: 'mark',
    id: id,
    from: 'mark'
  }, {}, callback);
};

function unmark (id, callback) {
  db.remove({
    id: id
  }, {}, callback);
};


// only run callback if unique
function dup(id, callback) {
  db.findOne({id: id}, {}, function(err, post) {
    if (err) {
      console.log(err);
    } else {
      if (!post) callback();
    }
  });
};

module.exports = {upload: upload, dup: dup, mark: mark, unmark: unmark};
