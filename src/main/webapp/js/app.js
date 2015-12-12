var quizzApp = angular.module('quizzApp', ['ui.router']);

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
                url: '/play',
                templateUrl: 'player.html',
                controller: 'battleController'
            })

            // nested list with just some random string data
            .state('home.paragraph', {
                url: '/paragraph',
                template: 'I could sure use a drink right now.'
            })

            // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
            .state('about', {
                url: '/about',
                views: {
                    '': {templateUrl: 'partial-about.html'},
                    'columnOne@about': {template: 'Look I am a column!'},
                    'columnTwo@about': {
                        templateUrl: 'table-data.html',
                        controller: 'scotchController'
                    }
                }

            });

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
                "currentScore":0
                };
    this.player2 = {"id" : "",
                    "firstname" : "",
                    "lastname" : "", 
                    "email" : "",  
                    "badges" : [],
                    "points" : 0,
                    "currentTime":0, 
                    "currentAnswer":false, 
                    "currentScore":0
                    };  
});





quizzApp.controller('searchController', function ($scope, $location, $http, battleService) {


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
            $scope.confirmed1=true;
        }else{
            battleService.player2 = $scope.user2;
            $scope.confirmed2=true;
        }
         $scope.goPlay();
    };

    $scope.goPlay = function () {

        if (battleService.player1.id != "" && battleService.player2.id  != "") {
            var battleServiceUrl='http://localhost:8080/dualquiz/webresources/net.java.dualquizz.battle/new-battle';
            $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
            $http.get(battleServiceUrl
                        +"?cid=" +battleService.player1.id 
                        +"&cid="+ battleService.player2.id
                        +"&category=" + battleService.category).
                    success(function (data) {
                        battleService.battle = data; 
                       $location.url('/play');
                    });
            $location.url('/play');
        }
    }
});


quizzApp.controller('battleController', function ($scope, $http, $timeout, battleService) {

 
    $scope.onTimeout = function () {
        
        if ($scope.counter > 0) {
            mytimeout = $timeout($scope.onTimeout, 1000);
            $scope.counter--;
        } else {
            //show answers
            if ($scope.wait > 0) {
                if($scope.wait == 5){
                    battleService.player1.points += battleService.player1.currentTime;
                    if(battleService.player1.currentAnswer){
                        battleService.player1.currentScore += 1;
                    }
                    battleService.player2.points += battleService.player2.currentTime;
                    if(battleService.player2.currentAnswer){
                        battleService.player2.currentScore += 1;
                    }
                console.log("player1 : score " + battleService.player1.currentScore + " - " + battleService.player1.points );
                console.log("player2 : score " + battleService.player2.currentScore + " - " + battleService.player2.points );
               
                }
                 $scope.showAnswer = true;
                mytimeout = $timeout($scope.onTimeout, 1000);
                $scope.wait--;
                
            } else {
                if ($scope.nbQuestion < 5 ){
                    $scope.pullQuestion();
                    $scope.reset();
                }else{
                    //end
                    if(  battleService.player1.currentScore > battleService.player2.currentScore){
                        battleService.player1.badges.push(battleService.category);
                    }else{
                         battleService.player2.badges.push(battleService.category);
                    }
                }
            }

        }
    };
    
    
    $scope.reset= function(){
        $scope.counter = delay;
        $scope.wait = 5;
        mytimeout = $timeout($scope.onTimeout,1000);
    };

    $scope.myQuestion = 'question.html';
    
    $scope.pullQuestion = function () {
        $scope.showAnswer=false;
        $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $http.get('http://localhost:8080/dualquiz/webresources/net.java.dualquizz.question/random').
                success(function (data) {
                    console.log(data);
                    $scope.description = data.description;
                    $scope.nbQuestion += 1;
                 
                      $scope.proposals = [ 
                        {"id":1,  "label" : "Vert"},
                        {"id":2,  "label" : "Orange"},
                        {"id":3,  "label" : "Rouge", "correct" : true},
                        {"id":4,  "label" : "#FFFFFF00 (c'est un geek fan d'alpha)"}];
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
   
     
   
    $scope.showAnswer=false;
    $scope.player=[battleService.player1, battleService.player2];
    var delay = 10;
    $scope.counter = delay;
    $scope.wait = 5;
    $scope.nbQuestion = 0;
    var mytimeout = $timeout($scope.onTimeout,1000);
    $scope.pullQuestion();
    
});

