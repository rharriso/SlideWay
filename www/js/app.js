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

    /*
     * create position combinations
     */
    $scope.positions = [];

    for(var i = 0; i < WIDTH; i++){
      for(var j = 0; j < HEIGHT; j++){
        $scope.positions.push({x: i, y: j});
      }
    }

    /*
     * select image for square
     */
    function selectImage(){
      $scope.image = _.sample(IMAGES);
    }
    selectImage();

    /*
     * register the square with the grid controller
     */
    this.registerSquare = function(sqrCtrl){
      var p = sqrCtrl.getPosition();
      gridSquares[p.x] = gridSquares[p.x] || [];
      gridSquares[p.x][p.y] = gridSquares[p.x][p.y] || {};
      var squareSet = gridSquares[p.x][p.y];

      if(sqrCtrl.isSpare()){
        squareSet.spare = sqrCtrl; 
      } else {
        squareSet.live = sqrCtrl; 
      }
    };
    var gridSquares = [[]]

    /*
     * listen for swipe
     */
  }
  app.controller("GameGridController", GameGridController);


  /*
   * Game grid directive
   */
  app.directive("gameGrid", function(){
    return {
      restrict: "A",
      controller: "GameGridController",
      controllerAs: "gridCtrl",
    };
  });


  /*
   * grid square directive
   */
  app.directive("gridSquare", function(){
    return {
      restrict: "A",
      require: ["^^gameGrid", "gridSquare"],
      controller: "GridSquareController",
      controllerAs: "sqrCtrl",
      template: "<div class='grid-style'></div>",
      scope: {
        "x": "@",
        "y": "@"
      },
      link: function($scope, $element, attrs, requirements){
        var gameGrid = requirements[0];
        var gridSquare = requirements[1];
        gameGrid.registerSquare(gridSquare);
      }
    };
  });

  /*
   * Grid Square controller
   */
  function GridSquareController($scope, $element){

    $scope.$parent.$watch('image', function(image){
      if(!!image){
        $element.css({
          "background-image": "url('../img/puzzle/"+image+"')"
        });
      }
    });

    // 'physical positions'
    var posX, posY;

    /*
     * getPosition the physical position
     */
    this.getPosition = function(){
      return {x: posX, y: posY};
    }

    /*
     * set 'physical position'
     */
    this.setPosition = function(x, y){
      posX = x;
      posY = y;
      var tX = posX * 100;
      var tY = $scope.y * 100;

      $element.css({
        "transform": "translate3d("+tX+"%, "+tY+"%, 0)",
      });
    };

    /*
     * setSpare class on grid
     */
    this.setSpare = function(isSpare){
      if(isSpare){
        $element.addClass("isSpare");
      } else {
        $element.removeClass("isSpare");
      }
    }

    /*
     * Return true if is a spare
     */
    this.isSpare = function(){
      return $element.hasClass("isSpare");
    }
    
    /*
     * return true if the square is in the
     * correct position
     */
    this.isCorrect = function(){
      return posX === $scope.x
        && posY === $scope.y;
    }
   
    /*
     * Initialize the background image and position
     */ 
    function initBackgroundImage(){
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
        "background-position-x": backXStr,
        "background-position-y": backYStr
      });
    }

    /*
     * Initialize
     */
    $scope.x = parseInt($scope.x);
    $scope.y = parseInt($scope.y);
    this.setPosition($scope.x, $scope.y);
    initBackgroundImage();
  }
  app.controller("GridSquareController", GridSquareController);

})();
