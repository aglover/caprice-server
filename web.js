var express = require('express');
var form = require('connect-form');

var app = express.createServer(form({ keepExtensions: true }));
app.set('view engine', 'jade');
app.use("/css", express.static(__dirname + '/css'));
app.use("/images", express.static(__dirname + '/images'));


app.get('/upload', function(req, res){
	res.render('upload');
});


app.get('/index', function(req, res){
	res.render('index');
});

app.post('/', function(req, res, next){

  // connect-form adds the req.form object
  // we can (optionally) define onComplete, passing
  // the exception (if any) fields parsed, and files parsed
  req.form.complete(function(err, fields, files){
    if (err) {
      next(err);
    } else {
      console.log('\nuploaded %s to %s'
        ,  files.image.filename
        , files.image.path);
      res.redirect('/index');
    }
  });

  // We can add listeners for several form
  // events such as "progress"
  req.form.on('progress', function(bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    process.stdout.write('Uploading: %' + percent + '\r');
  });
});


var port = process.env.PORT || 3000;

app.listen(port, function(){
	console.log("listening on port " + port);
});