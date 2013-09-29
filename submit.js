var request = require("request");
var config = require("./config.json");

var DOMAIN = "https://ssl.reddit.com";
var SUBMIT_URL = "http://www.reddit.com/api/submit"
var headers = {
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "Accept-Encoding": "gzip,deflate,sdch",
  "Accept-Language": "en-US,en;q=0.8",
  "Connection": "keep-alive",
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/28.0.1500.71 Chrome/28.0.1500.71 Safari/537.36"
};


function submit(url, title, callback) {
  var data = {
    "user": config.reddit_user,
    "passwd": config.reddit_pw,
    "api_type": "json"
  };
  request({
    url: DOMAIN + "/api/login/" + data.user,
    method: "post",
    form: data,
    headers: headers
  }, function(err, resp, body) {
    if (err) console.log(err);
    body = JSON.parse(body);

    if (resp.headers && body.json && body.json.data) {
      headers.Cookie = resp.headers["set-cookie"];
      request({
        url: SUBMIT_URL,
        method: "post",
        form: {
          uh: body.json.data.modhash,
          title: title,
          sr: "snapchan",
          url: url,
          kind: "link"
        },
        headers: headers
      }, function(err, resp, body) {
        console.log("Just uploaded to Reddit");
      });
    }
  });
}

module.exports = submit;
