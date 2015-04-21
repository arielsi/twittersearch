var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var unirest = require('unirest');

mongoose.connect('mongodb://localhost/tweetslist');

var tweetSchema = mongoose.Schema({
    name: {type: String, dafault: 'NA'},
		tweet: String,
		tweetid: String,
		trackingCategory: String,
		friends: String,
		location: String,
		profile_image_url: String
});

var fbpictures = mongoose.Schema({
	likes_count: 		String,
	time: 					String,
	comments_count: String,
	page: 					String,
	caption: 				String,
	objectid: 			String,
	pageid: 				String,
	src_big: 				String
});

var Tweet = mongoose.model('Tweet', tweetSchema);
var Fbpict = mongoose.model('Fbpict', fbpictures);

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

var twit = require('twitter'),
		twitter = new twit({
			consumer_key: 'XXXX',
			consumer_secret: 'XXXX',
			access_token_key: 'XXXX',
			access_token_secret: 'XXXX'
		});

var util = require('util');
//		tweets = [];

app.get('/tweetslist', function(req, res) {
	console.log("GET /tweetslist request");

	Tweet.find(function(error, docs){
		if (error) return console.error(error);

		//console.log(docs);

		res.json(docs);
	})
});

app.get('/fbslist', function(req, res) {
	console.log("GET /fbslist request");

	Fbpict.find(function(error, docs){
		if (error) return console.error(error);

		//console.log(docs);

		res.json(docs);
	})
});

app.post('/tweetslist', function(req, res){
	console.log("POST /tweetslist request");
	Tweet.create(req.body, function(err, doc){
		res.json(doc);
	});
});

app.delete('/tweetslist:id', function(req, res){
	console.log("DELETE /tweetslist:id request");
	var id = req.params.id;
	console.log("deleting id:" + id);

	Tweet.remove({_id: id }, function(err, doc){
		res.json(doc);
	});
});

app.post('/searchtweets:id', function(req, res){
	var trackerCategory = req.params.id;
	console.log("POST /searchtweets request for: " + trackerCategory);

	Tweet.remove({}, function(err, doc){
		console.log("Deleting tweets");
		if (err) return console.error(err);
		gettweets(trackerCategory);
		console.log("Getting new tweets for " + trackerCategory);

		Fbpict.remove({}, function(err, doc) {
			console.log("Deleting all fb pictures");
			if (err) return console.error(err);
			getfbbestpictures();
		});

	});

});

var gettweets = function(inputTrack) {
	twitter.stream('statuses/filter', {track: inputTrack}, function(stream) {
			console.log('getting stream for ' + inputTrack);

		  stream.on('data', function(tweet) {
				//console.log('printing the tweets data...');
				//tweets.push(tweet);
				Tweet.create({name: tweet.user.name,
											tweet: tweet.text,
											tweetid: tweet.id,
											trackingCategory: inputTrack,
											friends: tweet.user.friends_count,
											location: tweet.user.location,
											profile_image_url: tweet.user.profile_image_url
											});

		    //console.log(tweet.text);
				//console.log("==================start tweet===================");
				//console.log(util.inspect(tweet));
				//console.log("==================end tweet===================")

		  });

		  stream.on('error', function(error) {
				console.log('stream is error:' + error);
				//stream.destroy();
		    //throw error;
		  });

			setTimeout(function(){
					//console.log('Collected ' + tweets.length + ' tweets.');
					stream.destroy();
					//process.exit(0);
			}, 5000);

	});
};

var getfbbestpictures = function()
{
	// These code snippets use an open-source library. http://unirest.io/nodejs
	unirest.post("https://viralfacebookimages.p.mashape.com/dl")
	.header("X-Mashape-Key", "yJ3r2g6eEkmsh31OAPXRp5EiBgXlp1xG44DjsnkJXAona9LRos")
	.header("Content-Type", "application/x-www-form-urlencoded")
	.header("Accept", "application/json")
	.send("likesplus=40000")
	.send("trendcat=fun")
	.send("trendimageage=1")
	.end(function (result) {
	  //console.log(result.status, result.headers, result.body);
		Fbpict.create(result.body);
	});
};

app.listen(8085);
console.log("start listening on port 8085");
