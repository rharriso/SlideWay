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
  function GameGridController($scope, $compile, $element, $timeout){
    $scope.sliding = false;

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
    var gridSquares = [[]];


    /*
     * select image for square
     */
    function selectImage(){
      $scope.image = _.sample(IMAGES);
    }
    selectImage();
    
    /*
     * move spare grid into position for transition
     *    - pos: position of spare
     *    - prepPos: pre position of spare
     */
    function prepSpare(pos, prepPos){
      var sp = gridSquares[pos.x][pos.y].spare;
      sp.setPosition(prepPos.x, prepPos.y);
      sp.setSpare(false);
    }

    /*
     * switchSpare and live (after slide)
     */
    function switchSpare(pos){
      var sqr = gridSquares[pos.x][pos.y];
      var holder = sqr.spare;

      sqr.spare = sqr.live;
      sqr.spare.setSpare(true);
      sqr.live = holder;
      sqr.live.setSpare(false);
    }

    /*
     * slide column
     */
    function slideColumn(idx, dir){
      var isUp = dir === 'up';
      var adjust = (isUp) ? -1 : 1;

      console.log($element);
      /*
       * slide the spare
       */
      if(isUp){
        gridSquares[idx][0].spare.setPosition(idx, HEIGHT-1); 
      }
      else{
        gridSquares[idx][HEIGHT-1].spare.setPosition(idx, 0); 
      }

      /*
       * slide other cells
       */
      for(var j = 0; j < HEIGHT; j++){
        gridSquares[idx][j].live.setPosition(idx, j + adjust);
      }

      /*
       * adjust column
       */
      var spareSqr = null;
      if(isUp){
        var wrapSquare = gridSquares[idx][0];
        for(var j = 1; j < HEIGHT; j++){
          gridSquares[idx][j-1] = gridSquares[idx][j];
        }
        gridSquares[idx][HEIGHT-1] = wrapSquare;
      }
      else{
        var wrapSquare = gridSquares[idx][HEIGHT-1];
        for(var j = HEIGHT-2; j > 0; j--){
          gridSquares[idx][j-1] = gridSquares[idx][j];
        }
        gridSquares[idx][0] = wrapSquare;
      }
      
      // switch spares  for slider 
      $timeout(function(){
        var row = (isUp) ? HEIGHT - 1 : 0;
        switchSpare({x: idx, y: row});
      }, 250);
    }

    /*
     * setSliding
     */
    function setSliding(isSliding){
      $scope.sliding = isSliding;
      if(isSliding) {
        $element.addClass("sliding");
      }
      else {
        $element.removeClass("sliding");
      }
    }

    /*
     * listen for swipe in children
     */
    $scope.$on('swipeup', function(e, sqrCtrl){
      if($scope.sliding) return;

      var p = sqrCtrl.getPosition();
      console.log("move column", p.x, "up"); 

      prepSpare({x: p.x, y: 0}, {x: p.x, y: HEIGHT});
      setSliding(true);

      // allow DOM changes to apply before sliding
      $timeout(function(){
        slideColumn(p.x, "up");
         
      });

    });
    $scope.$on('swipedown', function(e, sqrCtrl){
      var p = sqrCtrl.getPosition();
      console.log("move column", p.x, "down"); 
    });
    $scope.$on('swipeleft', function(e, sqrCtrl){
      var p = sqrCtrl.getPosition();
      console.log("move row ", p.y, "left"); 
    });
    $scope.$on('swiperight', function(e, sqrCtrl){
      var p = sqrCtrl.getPosition();
      console.log("move row ", p.y, "right"); 
    });

    $element.on("transitionend", function(){
      setSliding(false);
    });
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
  function GridSquareController($scope, $element, $ionicGesture){
    var _this = this;

    $scope.$parent.$watch('image', function(image){
      if(!!image){
        $element.css({
          "background-image": "url('img/puzzle/"+image+"')"
        });
      }
    });

    this.el = $element;

    /*
     * respond to swipes
     */
    $ionicGesture.on("swipeup", function(){
      $scope.$emit("swipeup", _this);
    }, $element);
    $ionicGesture.on("swipedown", function(){
      $scope.$emit("swipedown", _this);
    }, $element);
    $ionicGesture.on("swipeleft", function(){
      $scope.$emit("swipeleft", _this);
    }, $element);
    $ionicGesture.on("swiperight", function(){
      $scope.$emit("swiperight", _this);
    }, $element);

    // 'physical positions'
    var posX, posY;

    /*
     * getPosition the physical position
     */
    this.getPosition = function(){
      return {x: posX, y: posY};
    };

    /*
     * set 'physical position'
     */
    this.setPosition = function(x, y){
      posX = x;
      posY = y;
      var tX = posX * 100;
      var tY = posY * 100;

      $element.css({
        "transform": "translate3d("+tX+"%, "+tY+"%, 0)",
      });
    };

    /*
     * setSpare class on grid
     */
    this.setSpare = function(isSpare){
      if(isSpare){
        $element.addClass("spare");
      } else {
        $element.removeClass("spare");
      }
    };

    /*
     * Return true if is a spare
     */
    this.isSpare = function(){
      return $element.hasClass("spare");
    };
    
    /*
     * return true if the square is in the
     * correct position
     */
    this.isCorrect = function(){
      return posX === $scope.x && posY === $scope.y;
    };
   
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
