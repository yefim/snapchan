var submit = require('./submit');


var fs = require('fs');
var payloadIndex = -1;

process.argv.forEach(function(val, index, array) {
        if(val == "-payload") {
                payloadIndex = index + 1;
        }
});

if(payloadIndex == -1) {
        console.error("No payload argument");
        process.exit(1);
}

if(payloadIndex >= process.argv.length) {
        console.error("No payload value");
        process.exit(1);
}

fs.readFile(process.argv[payloadIndex], 'ascii', function(err, data) {
        if(err) {
                console.error("Could not open file: %s", err);
                process.exit(1);
        }
        console.log(JSON.parse(data));

        data = JSON.parse(data);

        console.log("data:", data);

        submit(data.url, data.title, function (err) {
          if (err) console.err(err);
        });
});

