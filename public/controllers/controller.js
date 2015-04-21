var myApp = angular.module('myApp', []);

myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from controller");

var refresh = function(clear) {
		$http.get('/tweetslist').success(function(response){
			console.log("controller get the data requested");
			$scope.tweetslist = response;

			if (clear)
				$scope.tweet = "";

		});

		$http.get('/fbslist').success(function(resp){
			console.log("controller get the fb data requested");
			$scope.fbslist = resp;
		});
	};

refresh();

$scope.addTweet = function() {
		console.log($scope.tweet);
		$http.post('/tweetslist', $scope.tweet).success(function(response) {
			console.log(response);
			refresh(true);
		});
};

$scope.remove = function(id) {
		console.log("deleting tweet id: " + id);
		$http.delete('/tweetslist' + id).success(function(response){
			refresh(true);
		});
};

$scope.searchtweets = function() {
	console.log("Searching new tweets for: " + $scope.tweet.trackingCategory);
	$http.post('/searchtweets' + $scope.tweet.trackingCategory).success(function(response) {
		console.log(response);
	});
};

setInterval(function(){
	refresh(false);
}, 1000);

}]);
