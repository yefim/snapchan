var snapchat = require("./snapchat-client");
var client = new snapchat.Client();
var config = require("./config.json");
var upload = require("./upload");
var submit = require("./submit");
var enq = require('./enq');

client.login(config.snapchat_user, config.snapchat_pw);

client.on("sync", function(data) {
  if (!data.snaps) {
    return console.log('no snaps lol');
  }

  data.snaps.forEach(function(snap, i) {
    if (snap.t) {
      var filename = "snap" + i + ".jpg";
      var out = require('fs').createWriteStream(filename);
      client.getBlob(snap.id, out, function (err) { if (err) console.log(err); });
      out.on("finish", function () {
        //console.log("download finished for filename: " + filename);

        upload(filename, snap.id, snap.sn, function(err, dup, url) {
          if (err) console.log(err);
          if (!dup) {
            //queue.push({url: url, title: snap.sn});
            // IRON.IO SUBMIT GOES HERE

            enq({
              url: url,
              title: snap.sn
            }, function (err) {
              if (err) console.err(err);
            });

          }
        });
      });
    }
  });
});

setInterval(function() {
  client.sync();
/*
  var post = queue.shift();
  if (post) {
    submit(post.url, post.title, function() {});
  }
  */
}, 3000);
