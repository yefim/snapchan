var snapchat = require("./snapchat-client");
var client = new snapchat.Client();
var config = require("./config.json");
var upload = require("./upload");

client.login(config.username, config.password);

client.on("sync", function(data) {
  data.snaps.forEach(function(snap, i) {
    if (snap.t) {
      var filename = "snap" + i + ".jpg";
      var out = require('fs').createWriteStream(filename);
      client.getBlob(snap.id, out, function(err) { if (err) console.log(err); });
      out.on("finish", function() {
        upload(filename, snap.id, snap.sn, function(err, dup) {
          if (err) console.log(err);
          if (!dup) {
            console.log("upload that bitch to reddit");
            // upload that bitch to reddit
          }
        });
      });
    }
  });
});
