var snapchat = require("./snapchat-client");
var ocr = require("nodecr");
var client = new snapchat.Client();
var config = require("./config.json");
var utils = require("./upload");
var submit = require("./submit");
var enq = require('./enq');

var queue = [];

client.login(config.snapchat_user, config.snapchat_pw);

client.on("sync", function(data) {
  process.stdout.write(".");

  if (!data.snaps) {
    return console.log('no snaps lol');
  }

  data.snaps.forEach(function(snap, i) {
    if (snap.sn == "githubdub") {
      return;
    }

    if (snap.t) {
      utils.dup(snap.id, function() {
        utils.mark(snap.id, function () {
          console.log("marked " + snap.id + ", processing");
          var filename = "snap" + i + ".jpg";
          var out = require('fs').createWriteStream(filename);
          client.getBlob(snap.id, out, function (err) { if (err) console.log(err); });
          out.on("finish", function () {
            // console.log("download finished for filename: " + filename);
            ocr.process(filename, function(err, text) {
              if (err) console.log(err);
              text = text || "";
              var title = text.trim() + ' - ' + snap.sn;

              queue.push({filename: filename, id: snap.id, title: title});
            });
          });
        });
      });
    }
  });
});

client.on('error', function (err) {
  console.log(err);
});

setInterval(function() {
  client.sync();
  var post = queue.shift();
  if (post) {
    console.log("doing an upload");
    utils.upload(post.filename, post.id, post.title, function(err, url) {
      if (err) {
        console.log(err);
        console.log('unmarking due to error ' + post.id);
        utils.unmark(post.id, function () {});
      }
      else enq({
        url: url,
        title: post.title
      }, function (err) {
        if (err) console.err(err);
      });
    });
  }
}, 5000);
