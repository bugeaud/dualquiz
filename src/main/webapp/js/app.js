var quizzApp = angular.module('quizzApp', ['ui.router', 'ngAnimate']);

quizzApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/start');

    $stateProvider

            // HOME STATES AND NESTED VIEWS ========================================
            .state('start', {
                url: '/start',
                templateUrl: 'start.html'
            })

            // nested list with custom controller
            .state('play', {
                url: '/play/:battleId',
                templateUrl: 'player.html',
                controller: 'battleController'
            })
           

         

});

quizzApp.directive('testChange', function () {
    return function (scope, element, attrs) {
        element.bind('change', function () {
            console.log('value changed');
        })
    }
})


quizzApp.service('battleService', function() {
    this.category="saga";
    
    this.battle={"id" :"",
                  "boardMembers":[]};
    
    this.player1 = {"id" : "",
                "firstname" : "",
                "lastname" : "", 
                "email" : "",  
                "badges" : [],
                "points" : 0,
                "currentTime":0, 
                "currentAnswer":false, 
                "currentScore": 0,
                "currentGoodAnswer":0,
                "winner":false,
                "abandon":false
                };
    this.player2 = {"id" : "",
                    "firstname" : "",
                    "lastname" : "", 
                    "email" : "",  
                    "badges" : [],
                    "points" : 0,
                    "currentTime":0, 
                    "currentAnswer":false, 
                    "currentScore":0,
                    "currentGoodAnswer":0,
                    "winner":false,
                    "abandon":false
                    };  
});





quizzApp.controller('searchController', function ($scope, $timeout, $location, $http, battleService) {


    $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    $http.get('http://localhost:8080/dualquiz/webresources/net.java.dualquizz.player').
            success(function (data) {
               $scope.templateList = data;
            });     
    $scope.confirmed1=false;
    $scope.confirmed2=false;

    $scope.players = {user1: "", user2: ""};
    $scope.setValue1 = function (list) {
        $scope.search1 = list.firstName + " " + list.lastName;
        $scope.user1 = list;
        $scope.checked1=true;
       
    }
    $scope.setValue2 = function (list) {
        $scope.search2 = list.firstName + " " + list.lastName;
        $scope.user2 = list;
        $scope.checked2=true;

    };
    
    $scope.confirm = function(user){
        if(user == 1){
            battleService.player1 = $scope.user1;
            battleService.player1.currentScore = 0;
            battleService.player1.currentGoodAnswer = 0;
            battleService.player1.winner = false;
            battleService.player1.abandon = false;
            $scope.confirmed1=true;
        }else{
            battleService.player2 = $scope.user2;
            $scope.confirmed2=true;
            battleService.player2.currentScore = 0;
            battleService.player2.currentGoodAnswer = 0;
            battleService.player2.winner = false;
            battleService.player2.abandon = false;
        }
         $scope.goPlay();
    };
    
    $scope.onTimeout = function(){
        
    }

    
    $scope.goPlay = function () {
        

        if (battleService.player1.id != "" && battleService.player2.id  != "") {
            $scope.moveSaber = true;
            
            var battleServiceUrl='http://localhost:8080/dualquiz/webresources/net.java.dualquizz.battle/new-battle';
            $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
            $http.get(battleServiceUrl
                        +"?cid=" +battleService.player1.id 
                    + "&cid=" + battleService.player2.id
                    + "&category=" + battleService.category).
                    success(function (data) {
                        battleService.battle = data;
                        $timeout(function () {
                            $location.url('/play/'+data.id);
                        }, 1500);                                                 
                    }).
                    error(function (data) {
                        battleService.battle = data; 
                         $timeout(function () {
                            $location.url('/play/'+data.id);
                        }, 1500);             
                    });
           
        }
    }
});


quizzApp.controller('battleController', function ($scope, $http, $timeout, $stateParams, battleService) {

 
    $scope.onTimeout = function () {
        if(!$scope.battleEnded){
            if ($scope.counter > 0) {
                mytimeout = $timeout($scope.onTimeout, 1000);
                $scope.counter--;
            } else {
                //show answers
                if ($scope.wait > 0) {
                    if($scope.wait == 5){
                        battleService.player1.points += battleService.player1.currentTime;
                        battleService.player1.currentScore += battleService.player1.currentTime;
                        if(battleService.player1.currentAnswer){
                            battleService.player1.currentGoodAnswer += 1;
                        }
                        battleService.player2.points += battleService.player2.currentTime;
                        battleService.player2.currentScore += battleService.player2.currentTime;
                        if(battleService.player2.currentAnswer){
                            battleService.player2.currentGoodAnswer += 1;
                        }
                    console.log("player1 : score " + battleService.player1.currentScore + " - " + battleService.player1.points );
                    console.log("player2 : score " + battleService.player2.currentScore + " - " + battleService.player2.points );

                    }
                     $scope.showAnswer = true;
                    mytimeout = $timeout($scope.onTimeout, 1000);
                    $scope.wait--;

                } else {
                    if ($scope.nbQuestion < nbQuestionMax ){
                        $scope.pullQuestion();
                        $scope.reset();
                    }else{
                        //end
                        $scope.endBattle();
                    }
                }
            }
        }
    };
    
    $scope.abandon = function(player){
        if(player == 0){
            battleService.player1.abandon = true;
            battleService.player1.currentScore = 0;
            battleService.player1.currentGoodAnswer = 0;
            battleService.player2.currentScore = 50;
            battleService.player2.currentGoodAnswer = 1;            
        }else{
            battleService.player2.abandon = true;
            battleService.player2.currentScore = 0;
            battleService.player2.currentGoodAnswer = 0;
            battleService.player1.currentScore = 50;
            battleService.player1.currentGoodAnswer = 1;
        }
        battleService.player1.points += battleService.player1.currentScore;
        battleService.player2.points += battleService.player2.currentScore;
        $scope.endBattle();
    }
    
    $scope.endBattle = function () {
        var score1 = battleService.player1.currentScore;
        var score2 = battleService.player2.currentScore;
        var goodAnswer1 = battleService.player1.currentGoodAnswer;
        var goodAnswer2 = battleService.player2.currentGoodAnswer;
        if (!(goodAnswer1 == 0 && goodAnswer2 == 0)) {
            if (goodAnswer1 > goodAnswer2
                    || (goodAnswer1 == goodAnswer2 && score1 > score2)
                    ) {
                battleService.player1.badges.push(battleService.category);
                battleService.player1.winner = true;
            } else {
                battleService.player2.badges.push(battleService.category);
                battleService.player2.winner = true;
            }
        }
        $scope.battleEnded = true;
    }
    
    
    $scope.reset= function(){
        $scope.counter = delay;
        $scope.wait = 5;
        mytimeout = $timeout($scope.onTimeout,1000);
    };

    $scope.myQuestion = 'question.html';
    $scope.end = 'end.html';
    
    $scope.pullQuestion = function () {
        $scope.showAnswer=false;
        $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $http.get('http://localhost:8080/dualquiz/webresources/net.java.dualquizz.question/random').
                success(function (data) {
                    console.log(data);
                    $scope.description = data.description;
                    $scope.nbQuestion += 1;
                    battleService.player1.currentTime = 0;
                    battleService.player1.currentAnswer = false;
                    battleService.player2.currentTime = 0;
                    battleService.player2.currentAnswer = false;
                    $scope.proposals = [
                        {"id": 1, "label": "Vert"},
                        {"id": 2, "label": "Orange"},
                        {"id": 3, "label": "Rouge", "correct": true},
                        {"id": 4, "label": "#FFFFFF00 (c'est un geek fan d'alpha)"}];
                });
    };

    $scope.clickedOrTouched = function ($event, correct) {
              
        var parentId = $event.currentTarget.offsetParent.id;
        var score = 0;
        if (correct == true) {
            score = $scope.counter;
        }

        if (parentId == "play1") {
            battleService.player1.currentTime = score;
            battleService.player1.currentAnswer = correct;
        } else {
            battleService.player2.currentTime = score;
            battleService.player2.currentAnswer = correct;
        }
        
        

    };
   
     
    $scope.category = battleService.category;
    $scope.showAnswer=false;
    $scope.battleEnded=false;
    $scope.player=[battleService.player1, battleService.player2];
    var delay = 10;
    $scope.counter = delay;
    $scope.wait = 5;
    $scope.nbQuestion = 0;
    var nbQuestionMax = 2;
    var mytimeout = $timeout($scope.onTimeout,1000);
    $scope.pullQuestion();
    
});

