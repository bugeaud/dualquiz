var quizzApp = angular.module('quizzApp', ['ui.router', 'ngAnimate']);

quizzApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/start');

    $stateProvider
            //ecran de login
            .state('start', {
                url: '/start?category',
                templateUrl: 'start.html'
            })
            // ecran de jeu
            .state('play', {
                url: '/play/:battleId',
                templateUrl: 'player.html',
                controller: 'battleController'
            })
       

});


//contient les éléments de la battle
quizzApp.service('battleService', function() {
    this.category="";
    
    this.battle={"id" :"",
                  "boardMembers":[]};
    
    this.player1 = {"player":null,
                "currentTime":0, 
                "currentAnswer":false, 
                "currentScore": 0,
                "currentGoodAnswer":0,
                "winner":false,
                "abandon":false
                };
    this.player2 = {"player":null,
                    "currentTime":0, 
                    "currentAnswer":false, 
                    "currentScore":0,
                    "currentGoodAnswer":0,
                    "winner":false,
                    "abandon":false
                    };  
   
});

//Gestion de l'écran de login
//une fois que les deux joueurs ont selectionne leur noms et cliquer sur commencer, petite animation et c'est parti
quizzApp.controller('startController', function ($scope, $timeout, $location, $http, battleService) {
   //on initialise la category de la battle
   var params = $location.search();
   battleService.category=params.category;
   
    $scope.confirmed1=false;
    $scope.confirmed2=false;

//sale !!! on init les players quand le joueur clique sur son nom
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
    
    //les joueurs confirment leur identite. on initialise les parametres de la battle
    $scope.confirm = function(user){
        if(user == 1){
            battleService.player1.player = $scope.user1;
            if(angular.isUndefined($scope.user1.badges)){
                battleService.player1.player.badges=[];
            }
            if(angular.isUndefined($scope.user1.points)){
                battleService.player1.player.points=0;
            }
            battleService.player1.currentScore = 0;
            battleService.player1.currentGoodAnswer = 0;
            battleService.player1.winner = false;
            battleService.player1.abandon = false;
            $scope.confirmed1=true;
        }else{
            battleService.player2.player = $scope.user2;
            if(angular.isUndefined($scope.user2.badges)){
                battleService.player2.player.badges=[];
            }
             if(angular.isUndefined($scope.user2.points)){
                battleService.player2.player.points=0;
            }
            $scope.confirmed2=true;
            battleService.player2.currentScore = 0;
            battleService.player2.currentGoodAnswer = 0;
            battleService.player2.winner = false;
            battleService.player2.abandon = false;
        }
         $scope.goPlay();
    };
    
        
    $scope.goPlay = function () {
        //si on a bien 2 joueurs 
        if (battleService.player1.player != null && battleService.player2.player != null) {
            //on cree une nouvelle battle
            var battleServiceUrl = '/dualquiz/webresources/net.java.dualquizz.battle/new-battle';
            $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
            $http.get(battleServiceUrl
                    + "?cid=" + battleService.player1.id
                    + "&cid=" + battleService.player2.id
                    + "&category=" + battleService.category).
                    success(function (data) {
                        battleService.battle = data;
                        //petite attente pour l'animation sabre laser
                        $timeout(function () {
                            $location.url('/play/' + data.id);
                        }, 1500);
                    }).
                    error(function (data) {
                        //@todo si une bataille entre les 2 joueurs existent deja ça ne marche pas ??
                        battleService.battle = data;
                        $timeout(function () {
                            $location.url('/play/' + data.id);
                        }, 1500);
                    });
        }
    }
});

//gestion de la battle
quizzApp.controller('battleController', function ($scope, $http, $timeout,battleService) { 
  
    
   
    $scope.onTimeout = function () {
        //tant que ce n'est pas fini : fin ou abandon
        if(!$scope.battleEnded){
            //pour chaque qestion on decompte
            if ($scope.counter > 0) {
                mytimeout = $timeout($scope.onTimeout, 1000);
                $scope.counter--;
            } else {
                //si le compteur est a zero et qu'on a du temps a attendre, place aux resultats
                if ($scope.wait > 0) {
                    if($scope.wait == delayAnswer){
                        battleService.player1.player.points += battleService.player1.currentTime;
                        battleService.player1.currentScore += battleService.player1.currentTime;
                        if(battleService.player1.currentAnswer){
                            battleService.player1.currentGoodAnswer += 1;
                        }
                        battleService.player2.player.points += battleService.player2.currentTime;
                        battleService.player2.currentScore += battleService.player2.currentTime;
                        if(battleService.player2.currentAnswer){
                            battleService.player2.currentGoodAnswer += 1;
                        }
                    console.log("player1 : score " + battleService.player1.currentScore + " - " + battleService.player1.player.points );
                    console.log("player2 : score " + battleService.player2.currentScore + " - " + battleService.player2.player.points );

                    }
                    $scope.showAnswer = true;
                    mytimeout = $timeout($scope.onTimeout, 1000);
                    $scope.wait--;

                } else {
                    //si on a fini de regarder les reponses et qu'on a encore des questions dans la manche
                    if ($scope.nbQuestion < nbQuestionMax ){
                        $scope.pullQuestion();
                        $scope.reset();
                    }else{
                        //sinon fin
                        $scope.endBattle();
                    }
                }
            }
        }
    };
    
    //abandon d'un des joueurs, 1 badge et 50 points pour celui qui reste
    $scope.abandon = function(player){
        if(player == 0){
            battleService.player1.abandon = true;
            $scope.player[0].abandon=true;
            battleService.player1.currentScore = 0;
            battleService.player1.currentGoodAnswer = 0;
            battleService.player2.currentScore = 50;
            battleService.player2.currentGoodAnswer = 1;    
            
        }else{
            battleService.player2.abandon = true;
            $scope.player[1].abandon=true;
            battleService.player2.currentScore = 0;
            battleService.player2.currentGoodAnswer = 0;
            battleService.player1.currentScore = 50;
            battleService.player1.currentGoodAnswer = 1;
        }
        battleService.player1.player.points += battleService.player1.currentScore;
        battleService.player2.player.points += battleService.player2.currentScore;
        $scope.endBattle();
    }
    
    //fin de la battle : score + badges + enregistrement
    $scope.endBattle = function () {
        var score1 = battleService.player1.currentScore;
        var score2 = battleService.player2.currentScore;
        var goodAnswer1 = battleService.player1.currentGoodAnswer;
        var goodAnswer2 = battleService.player2.currentGoodAnswer;
        if (!(goodAnswer1 == 0 && goodAnswer2 == 0)) {
            if (goodAnswer1 > goodAnswer2
                    || (goodAnswer1 == goodAnswer2 && score1 > score2)
                    ) {
                battleService.player1.player.badges.push(battleService.category);
                battleService.player1.winner = true;
                $scope.player[0].winner=true;
            } else {
                battleService.player2.player.badges.push(battleService.category);
                battleService.player2.winner = true;
                $scope.player[1].winner=true;
            }
        }
       // @todo register scores
        $scope.battleEnded = true;
       //a verifier
        //battleService = null;
    }
    
    
    $scope.reset= function(){
        $scope.counter = delay;
        $scope.wait = delayAnswer;
        mytimeout = $timeout($scope.onTimeout,1000);
    };

    
   //tirage d'une question au hasard dans la categorie  
    $scope.pullQuestion = function () {
        $scope.showAnswer=false;
        $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $http.get('/dualquiz/webresources/net.java.dualquizz.question/random?catagory='+battleService.category).
                success(function (data) {
                    $scope.description = data.description;
                    //@ TODO 
                  //  $scope.proposals = data.proposals;
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
                    //on melange l'ordre des reponses 
                    //elles sont affichee de la meme facon pour les 2 joueurs, triche permise!
                   $scope.proposals.sort(function() { return 0.5 - Math.random() });
                });
    };

/*
 * Se declenche quand le joueur clique sur la reponse
 * si la reponse est bonne, 1 bonne reponse et le temps comptabilises
 * sinon 0 0
 */

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
  
    
       //params
     
    var nbQuestionMax = 3; //nombre de question par match
    var delay = 10; //délai pour repondre
    var delayAnswer = 3; //délai pour voir les reponses
    $scope.wait = delayAnswer; // délai pour voir la bonne réponse
    
    $scope.myQuestion = 'question.html';
    $scope.category = battleService.category;
    $scope.showAnswer=false;
    $scope.battleEnded=false;
    $scope.player=[battleService.player1.player, battleService.player2.player];
    $scope.counter = delay;
    $scope.nbQuestion = 0;
    var mytimeout = $timeout($scope.onTimeout,1000);
    $scope.pullQuestion();
    
});

/*
 * Une petite directive pour gerer le clavier svg
 */
angular.module('quizzApp').directive('svgMap', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        templateUrl: 'keyboard-simple-abc.svg',
         scope: {
            search: "=",
            template : "="
        },
        link: function (scope, element, attrs) {
          
            var keys = element[0].querySelectorAll('.key');
            angular.forEach(keys, function (path, key) {
                var keyElement = angular.element(path);
                keyElement.attr("key", "");
                keyElement.attr("search", "search");
                keyElement.attr("template", "template   ");
                $compile(keyElement)(scope);
            })
            
        }
    }
   
}]);

/*
 * et une directive pour gerer les touches et les actions : entrer une lettre, back, clear 
 * et recherche dans la lister des joueurs si on a tape plus de 3 lettres
 */
angular.module('quizzApp').directive('key', ['$compile','$http', function ($compile, $http) {
    return {
        restrict: 'A',
        scope: {
            search: "=",
            template : "="
        },
        link: function (scope, element, attrs ) {
         
            scope.elementId = element.attr("id");
            scope.keyClick = function () {
                // alert(scope.elementId);
                if(angular.isUndefined(scope.search) || scope.elementId == "clear"){
                    scope.search = "";
                }
                else if(scope.elementId == "back"){
                    scope.search = scope.search.substring( 0, scope.search.length-1 );
                }else {
                    scope.search += scope.elementId;
                }
                if (scope.search.length >= 3) {
                        $http.get('/dualquiz/webresources/net.java.dualquizz.player/find/' + scope.search).
                                then(function (response) {
                                    scope.template = response.data;
                                    });

                    } else {
                       scope.template = [];
                    }
            };
             
        
            element.attr("ng-click", "keyClick()");
            element.removeAttr("key");
            
            $compile(element)(scope);
        }
    }
}]);





