(function(){
  "use strict";

  function killEvent(e){
    e.preventDefault();
  }
  document.addEventListener("touchstart", killEvent, false);
  document.addEventListener("touchmove", killEvent, false);
  document.addEventListener("touchend", killEvent, false);
  document.addEventListener("touchcancel", killEvent, false);

  // angular.module is a global place for creating, registering and retrieving Angular modules
  // 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
  // the 2nd parameter is an array of 'requires'
  angular.module('starter', ['ionic', 'slideway']).run(function($ionicPlatform) {
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

      /*
       * admob code
       */
      var admobid = {};
      // select the right Ad Id according to platform
      if( /(android)/i.test(navigator.userAgent) ) { 
        admobid = { // for Android
          banner: 'ca-app-pub-7301395537838912/7009371583'
        };
      } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
        admobid = { // for iOS
          banner: 'ca-app-pub-7301395537838912/9962837985'
        };
      } 

      if(window.AdMob) {
        AdMob.createBanner({
          adId:admobid.banner, 
          position:AdMob.AD_POSITION.BOTTOM_CENTER, 
          autoShow:true
        });
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
  var HIDE_MENU_TIMEOUT = 2000;

  /*
   * master directive
   */
  app.directive("master", function(){
    return {
      restrict: "E",
      require: "gameGrid",
      controller: "MasterController",
      controllerAs: "master",
    };
  });

  /*
   * MasterController
   */
  function MasterController($scope, $element, $ionicGesture, $ionicModal, $ionicPopup){

    $ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    /*
     * Show correct arrangement
     */
    $scope.showSolution = function(){
      $scope.modal.show();
    };

    var ctrlBars = angular.element(document.getElementsByClassName("ctrlbar"));
    /*
     * Hide the menu oafter a timeout
     */
    var hideMenu = _.debounce(function(){
      ctrlBars.addClass("hidden");
    }, HIDE_MENU_TIMEOUT);
    hideMenu();

    /*
     * click to start a new game
     */
    $scope.resetClick = function(){
      var confirmPopup = $ionicPopup.confirm({
        title: 'Start A new Game',
        template: 'Are you sure you want to start a new game?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          $scope.$broadcast('reset');
        }
      });
    };

    $scope.$on("victory", function(){
      $ionicPopup.alert({
        template: "You Won!",
        okText: "Play Again?"
      }).then(function(){
        $scope.$broadcast('reset'); 
      });
    });

    /*
     * show menu on tap
     */
    $ionicGesture.on("tap", function(){
      ctrlBars.removeClass("hidden");
      hideMenu(); // hide on delay
    }, $element);
  }
  app.controller("MasterController", MasterController);


  /*
   * Game grid directive
   */
  app.directive("gameGrid", function(){
    return {
      restrict: "A",
      require: "master",
      controller: "GameGridController",
      controllerAs: "gridCtrl",
    };
  });

  /*
   * Game Grid
   */
  function GameGridController($scope, $element, $timeout, $ionicGesture){
    var _this = this;
    _this.sliding = false;
    _this.shuffled = false;

    /*
     * Image handling
     */
    var IMAGES = [
      "bird-ledge.jpg",
      "droplet-window.jpg",
      "park-view.jpg",
      "saturn.jpg",
      "gaseous-cavity.jpg",
      "starry-night.jpg",
      "red-spot.jpg",
      "olympus.jpg",
      "pillars.jpg",
      "snow-lake.jpg",
      "splash.jpg",
      "snow-street.jpg",
      "helix.jpg",
    ];

    /*
     * start the game over
     */
    function reset (){
      selectImage();
      fixPositions();
      _this.shuffled = false;
    }
    $scope.$on('reset', reset);

    /*
     * select image for square
     */
    function selectImage(){
      $scope.image = _.sample(IMAGES);
      var url = 'img/puzzle/'+$scope.image;

      var styleTag = document.getElementById("app-style");
      styleTag.innerHTML = ".grid-square {" +
        "  background-image: url("+url+")" +
        "}";
    }
    selectImage();

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
     * shuffle the grid squares
     */
    this.shuffle = function(){
      gridSquares = _.shuffle(gridSquares);
      for(var i = 0; i < WIDTH; i++){
        gridSquares[i] = _.shuffle(gridSquares[i]);
      }

      for(var i = 0; i < WIDTH; i++){
        for(var j = 0; j < HEIGHT; j++){
          gridSquares[i][j].live.setPosition(i, j);
        }
      }
      _this.shuffled = true;
      _this.sliding = true;
    };
   
    /*
     * shuffle board if not done so yet
     */ 
    $ionicGesture.on("tap", function(){
      if(!_this.shuffled){
        _this.shuffle(); 
      }
    }, $element);

    /*
     * move spare grid into position for transition
     *    - pos: position of spare
     *    - prepPos: pre position of spare
     */
    function prepSpare(pos, prepPos){
      var sp = gridSquares[pos.x][pos.y].spare;
      sp.setPosition(prepPos.x, prepPos.y);
      $timeout(function(){
        sp.setSpare(false);
      })
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
     * slide row
     */
    function slideRow(idx, dir){
      var isLeft = dir === 'left';
      var adjust = (isLeft) ? -1 : 1;

      /*
       * slide the spare
       */
      if(isLeft){
        gridSquares[0][idx].spare.setPosition(WIDTH-1, idx); 
      }
      else{
        gridSquares[WIDTH-1][idx].spare.setPosition(0, idx); 
      }

      /*
       * slide other cells
       */
      for(var i = 0; i < WIDTH; i++){
        gridSquares[i][idx].live.setPosition(i + adjust, idx);
      }

      /*
       * adjust column
       */
      var spareSqr = null;
      if(isLeft){
        var wrapSquare = gridSquares[0][idx];
        for(var i = 1; i < WIDTH; i++){
          gridSquares[i-1][idx] = gridSquares[i][idx];
        }
        gridSquares[WIDTH-1][idx] = wrapSquare;
      }
      else{
        var wrapSquare = gridSquares[WIDTH-1][idx];
        for(var i = WIDTH-2; i >= 0; i--){
          gridSquares[i+1][idx] = gridSquares[i][idx];
        }
        gridSquares[0][idx] = wrapSquare;
      }

      // switch spares  for slider 
      $timeout(function(){
        var col = (isLeft) ? WIDTH - 1 : 0;
        switchSpare({x: col, y: idx});
      }, 250);
    }

    /*
     * slide column
     */
    function slideColumn(idx, dir){
      var isUp = dir === 'up';
      var adjust = (isUp) ? -1 : 1;

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
        var wrapSquare = gridSquares[idx].shift();
        gridSquares[idx].push(wrapSquare);
      }
      else{
        var wrapSquare = gridSquares[idx].pop();
        gridSquares[idx].unshift(wrapSquare);
      }

      // switch spares  for slider 
      $timeout(function(){
        var row = (isUp) ? HEIGHT - 1 : 0;
        switchSpare({x: idx, y: row});
      }, 250);
    }

    /*
     * listen for swipe in children
     */
    $scope.$on('swipeup', function(e, sqrCtrl){
      if(_this.sliding || !_this.shuffled) return false;
      var p = sqrCtrl.getPosition();

      prepSpare({x: p.x, y: 0}, {x: p.x, y: HEIGHT});
      _this.sliding = true;

      // allow DOM changes to apply before sliding
      $timeout(function(){
        slideColumn(p.x, "up");
      }, 50);
    });
    $scope.$on('swipedown', function(e, sqrCtrl){
      if(_this.sliding || !_this.shuffled) return false;
      var p = sqrCtrl.getPosition();
      console.log("move column", p.x, "down"); 

      prepSpare({x: p.x, y: HEIGHT-1}, {x: p.x, y: -1});
      _this.sliding = true;

      // allow DOM changes to apply before sliding
      $timeout(function(){
        slideColumn(p.x, "down");
      }, 50);
    });
    $scope.$on('swipeleft', function(e, sqrCtrl){
      if(_this.sliding || !_this.shuffled) return false;
      var p = sqrCtrl.getPosition();
      console.log("move row ", p.y, "left"); 

      prepSpare({x: 0, y: p.y}, {x: WIDTH + 1, y: p.y});
      _this.sliding = true;

      // allow DOM changes to apply before sliding
      $timeout(function(){
        slideRow(p.y, "left");
      }, 50);
    });
    $scope.$on('swiperight', function(e, sqrCtrl){
      if(_this.sliding || !_this.shuffled) return false;

      var p = sqrCtrl.getPosition();
      console.log("move row ", p.y, "right"); 

      prepSpare({x: WIDTH - 1, y: p.y}, {x: -1, y: p.y});
      _this.sliding = true;

      // allow DOM changes to apply before sliding
      $timeout(function(){
        slideRow(p.y, "right");
      }, 50);
    });

    $element.on("transitionend", function(){
      if(!_this.sliding) return;
      _this.sliding = false;
      checkVictory();
    });

    /*
     * broadcast victory if the blocks are all in
     * correct location
     */
    function checkVictory(){
      if(isSolved()){
        $scope.$emit("victory");
      } 
    }

    /*
     * returns true if all the blocks are in the right place
     */
    function isSolved(){
      for(var i = 0; i < WIDTH; i++){
        for(var j = 0; j < HEIGHT; j++){
          if(!gridSquares[i][j].live.isCorrect()){
            return false;
          }
        }
      }

      return true;
    }

    function fixPositions (){
      for(var i = 0; i < WIDTH; i++){
        for(var j = 0; j < HEIGHT; j++){
          var p = gridSquares[i][j].live.getActualPosition();
          gridSquares[i][j].live.setPosition(p.x, p.y);
        }
      }
    };
  }
  app.controller("GameGridController", GameGridController);


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
  function GridSquareController($scope, $element, $ionicGesture, $window){
    var _this = this;
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
     *  return true if in the correct position
     */
    this.isCorrect = function(){
      return parseInt($scope.x) === posX &&
        parseInt($scope.y) === posY;
    };

    /*
     * return the actual position 
     */
    this.getActualPosition = function(){
      return {
        x: parseInt($scope.x),
        y: parseInt($scope.y)
      };

    }


    var H_CENTER = Math.floor(WIDTH / 2)
      var V_CENTER = Math.floor(HEIGHT/ 2)

      /*
       * Initialize the background image and position
       */ 
      function initBackgroundImage(){
        var blockHeight = window.innerHeight / HEIGHT;
        var blockWidth = window.innerWidth / WIDTH;
        console.log(blockHeight, blockWidth);
        var backX = ($scope.x - H_CENTER) * blockWidth;
        var backXStr = "50%";
        var backY = ($scope.y - V_CENTER) * blockHeight;
        var backYStr = "50%";
        console.log($scope.y, $scope.x);

        if($scope.x === '2' && $scope.y === '0'){
          console.log(backY, backX);
        }

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
          "background-position": backXStr+" "+backYStr
        });
      }

    /*
     * Initialize
     */
    $scope.x = parseInt($scope.x);
    $scope.y = parseInt($scope.y);
    _this.setPosition($scope.x, $scope.y);
    initBackgroundImage();
    angular.element($window).on('resize', initBackgroundImage);
  }
  app.controller("GridSquareController", GridSquareController);

})();
