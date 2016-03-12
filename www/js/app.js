// Ionic Starter App
(function(){
  "use strict";

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
})();

/*
 * SlideWay App
 */
(function(){
  "use strict";
  var app = angular.module('slideway', []);  
    
  var HEIGHT = 5;
  var WIDTH = 3;
  var blockHeight = window.innerHeight / HEIGHT;
  var blockWidth = window.innerWidth / WIDTH;

  /*
   * Game Grid
   */
  function GameGridController($scope, $compile, $element){

    var IMAGES = [
      "olympus.jpg",
      "pillars.jpg",
      "starry-night.jpg"
    ];

    $scope.positions = [];

    for(var i = 0; i < WIDTH; i++){
      for(var j = 0; j < HEIGHT; j++){
        $scope.positions.push({x: i, y: j});
      }
    }

    function shuffle(){
      $scope.image = _.sample(IMAGES);
    }
    shuffle();
  }
  app.controller("GameGridController", GameGridController);


  app.directive("gameGrid", function(){
    return {
      restrict: "A",
      controller: "GameGridController",
      controllerAs: "gridCtrl",
    };
  });


  /*
   * Game item
   */
  function GridSquareController($scope, $element){
    $scope.x = parseInt($scope.x);
    $scope.y = parseInt($scope.y);
    initStyle();

    $scope.$parent.$watch('image', function(image){
      if(!!image){
        $element.css({
          "background-image": "url('../img/puzzle/"+image+"')"
        });
      }
    });

    function initStyle(){
      var x = $scope.x * 100;
      var y = $scope.y * 100;
      var backX = $scope.x * blockWidth - 100;
      var backXStr = "50%";
      var backY = $scope.y * blockHeight - 300;
      var backYStr = "50%";

      if(backX < 0) {
        backXStr = "calc(50% + "+Math.abs(backX)+"px)";
      } else if (backX > 0){
        backXStr = "calc(50% - "+backX+"px)";
      }
      if(backY < 0) {
        backYStr = "calc(50% + "+Math.abs(backY)+"px)";
      } else if (backY > 0){
        backYStr = "calc(50% - "+backY+"px)";
      }

      $element.css({
        "transform": "translate3d("+x+"%, "+y+"%, 0)",
        "background-position-x": backXStr,
        "background-position-y": backYStr
      });
    }
  }
  app.controller("GridSquareController", GridSquareController);


  app.directive("gridSquare", function(){
    return {
      restrict: "A",
      controller: "GridSquareController",
      controllerAs: "sqrCtrl",
      template: "<div class='grid-style' " +
        ">" +
        "</div>",
      scope: {
        "x": "@",
        "y": "@"
      }
    };
  });

})();
