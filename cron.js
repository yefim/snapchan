var snapchat = require("./snapchat-client");
var client = new snapchat.Client();
var config = require("./config.json");
var upload = require("./upload");
var submit = require("./submit");
var queue = [];

client.login(config.snapchat_user, config.snapchat_pw);


client.on("sync", function(data) {
  data.snaps.forEach(function(snap, i) {
    if (snap.t) {
      var filename = "snap" + i + ".jpg";
      var out = require('fs').createWriteStream(filename);
      client.getBlob(snap.id, out, function(err) { if (err) console.log(err); });
      out.on("finish", function() {
        upload(filename, snap.id, snap.sn, function(err, dup, url) {
          if (err) console.log(err);
          if (!dup) {
            queue.push({url: url, title: snap.sn});
          }
        });
      });
    }
  });
});

setInterval(function() {
  client.sync();

  var post = queue.shift();
  if (post) {
    submit(post.url, post.title, function() {});
  }
}, 3000);
