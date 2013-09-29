var https = require("https");
var conf = require('./iron.json');

function queue_task(project, token, payload, done) {
  var req_json = {
    "tasks": [{
      "code_name": "uploader",
      "payload": JSON.stringify(payload)
    }]
  }

  // Convert the JSON data
  var req_data = JSON.stringify(req_json);

  // Create the request headers
  var headers = {
    'Authorization': 'OAuth ' + token,
    'Content-Type': "application/json"
  };

  // Build config object for https.request
  var endpoint = {
    "host": "worker-aws-us-east-1.iron.io",
    "port": 443,
    "path": "/2/projects/" + project + "/tasks",
    "method": "POST",
    "headers": headers
  };

  var post_req = https.request(endpoint, function(res) {
    console.log("statusCode: ", res.statusCode);

    res.on('data', function(d) {
      process.stdout.write(d);
    });

    res.on('end', done);
  });
  
  post_req.write(req_data)
  post_req.end();

  post_req.on('error', function(e) {
    console.error(e);
    done(e);
  });
}

module.exports = function (payload, done) {
  console.log("arguments:", arguments);
  queue_task(conf.project_id, conf.token, payload, done);
};
