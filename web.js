var express = require('express');
var form = require('connect-form');
var config = require('./config/config.js');
var knox = require('knox');
var Bitly = require('bitly');
var urlshort = new Bitly('aglover', 'R_b47321c6fbe1cd3b3f951e3eaaaf49d1');

var kclient = knox.createClient({
    key: config.s3.key, 
    secret: config.s3.secret, 
    bucket: config.s3.bucket
});

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
      console.log('\nuploaded %s to %s', files.image.filename, files.image.path);
	  
	  var safeName = files.image.filename.replace(/ /g, "-").replace(/[?\[\]/\\=<>:;,''""&$#*()|~`!{}]/g, '');
	  var safePath = new Date().getTime() + '/' + safeName;
	  kclient.putFile(files.image.path, safePath, function(err, response){
		console.log("response from knox is " + response);
		console.log("url is " + config.s3.domain + "/" + safePath);
		
		urlshort.shorten(config.s3.domain + "/" + safePath, function(err, response) {
		  if (err) throw err;
		  console.log("response from bitly is " + response.status_code);
		console.log("response text from bitly is " + response.status_txt);
		
		  // See http://code.google.com/p/bitly-api/wiki/ApiDocumentation for format of returned object
		  var shortUrl = response.data.url
		  console.log("shortened URL is " + shortUrl);
		  // Do something with data
		});		
	  });	
		
		
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