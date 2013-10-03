var snapchat = require("./snapchat-client");
var ocr = require("nodecr");
var client = new snapchat.Client();
var config = require("./config.json");
var utils = require("./upload");
var enq = require('./enq');

client.login(config.snapchat_user, config.snapchat_pw);

client.on("sync", function(data) {
  data.snaps.forEach(function(snap, i) {
    if (snap.t) {
      utils.dup(snap.id, function() {
        var filename = "snap" + i + ".jpg";
        var out = require('fs').createWriteStream(filename);
        client.getBlob(snap.id, out, function (err) { if (err) console.log(err); });
        out.on("finish", function () {
          ocr.process(filename, function(err, text) {
            if (err) console.log(err);
            text = text || "";
            var title = text.trim() + ' - ' + snap.sn;
            utils.upload(filename, snap.id, title, function(err, url) {
              if (err) console.log(err);
              enq({
                url: url,
                title: title
              }, function (err) {
                if (err) console.err(err);
              });
            });
          });
        });
      });
    }
  });
});

setInterval(function() {
  client.sync();
}, 3000);
