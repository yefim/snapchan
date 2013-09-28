
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var imgur = require('imgur-upload');
var mongo = require('mongoskin');

var db = mongo.db('localhost:27017/spoonpics', {safe: true}).collection('pics');
imgur.setClientID('b1cf3448754f15f');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './images' }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/email', function (req, res) {
  try { var filename = req.files.attachment1.path; } catch (e) {
    console.log('email w no image');
    return res.send(200, 'no image');
  }
  console.log('Uploading image at ' + filename + ' to imgur');
  imgur.upload(filename, function (err, imgurRes) {

    if (err) {
      res.send(500, 'imgur upload failed');
      console.log('Imgur upload failed');
      console.dir(err);
    } 

    else if (!imgurRes.data || !imgurRes.data.link) {
      // imgur-upload calls my callbakc twice for some reason
      console.log("bad imgur callback");
    }

    else {
      db.insert({
        url: imgurRes.data.link,
        from: req.body.from
      }, {}, function (err) {
        if (err) {
          console.log('error inserting into mongo');
          console.dir(err);
          res.send(500, 'mongo insert failed');
        } else {
          console.log("inserted into mongo");
          res.end();
        }
      });

      fs.unlink(filename, function (err) { 
        if (err) console.log('Error deleting temporary file: ' + filename); 
      });
    }
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
