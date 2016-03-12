// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'slideway'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

/*
 * SlideWay App
 */
(function(){

  var app = angular.module('slideway', []);  

  /*
   * Game Grid
   */
  function GameGridController($scope, $compile, $element){
    var IMAGES = [
      "olympus.jpg",
      "pillars.jpg",
      "starry-night.jpg"
    ];
    $scope.image = _.sample(IMAGES);
    var HEIGHT = 5;
    var WIDTH = 3;
    
    for(var i = 0; i < WIDTH; i++){
      for(var j = 0; j < HEIGHT; j++){
        $compile("<grid-square grid-></grid-square>", $scope.$new())(function(){
        });
      }
    }
  }
  app.controller("GameGridController", GameGridController);


  app.directive("gameGrid", function(){
    return {
      restrict: "E",
      controller: "GameGridController",
      controllerAs: "gridCtrl"
    };
  });
  

  /*
   * Game item
   */
  function GridSquareController($scope, $element){

  }
  app.controller("GridSquareController", GridSquareController);


  app.directive("gridSquare", function(){
    return {
      restrict: "a",
      controller: "GridSquareController",
      controllerAs: "sqrCtrl",
      template: "<div class='grid-style' " +
        "ng-style='background-color: url('../img/{{image}})'>" +
        "</div>",
      scope: {
        "image": "="
      }
    };
  });
  
})();
