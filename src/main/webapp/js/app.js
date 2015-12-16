var quizzApp = angular.module('quizzApp', ['ui.router', 'ngAnimate','ngTouch']);

quizzApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/cat');

    $stateProvider
            //ecran de login
            .state('cat', {
                url: '/cat',
                templateUrl: 'cat.html'
            })
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
quizzApp.service('battleService', function ($http, $q) {

    this.battleEnded = false;
    this.battle = {"id": "",
        "category": "",
        "boardMembers": []};

    this.player1 = {"player": null,
        "currentTime": 0,
        "currentAnswer": false,
        "currentScore": 0,
        "currentGoodAnswer": 0,
        "winner": false,
        "abandon": false
    };
    this.player2 = {"player": null,
        "currentTime": 0,
        "currentAnswer": false,
        "currentScore": 0,
        "currentGoodAnswer": 0,
        "winner": false,
        "abandon": false
    };

    this.updatePlayer = function (player) {
        if (player.id != null) {
            return $http.get('/dualquiz/webresources/net.java.dualquizz.player/' + player.id).
                    success(function (response) {
                        var p = response;
                        console.log("update player ok : "
                                + response.firstName + " " + response.lastName + " - " + response.points);
                        if (angular.isUndefined(p.badges)) {
                            p.badges = [];
                        }
                        if (angular.isUndefined(p.points)) {
                            p.points = 0;
                        }
                        return p;
                    }).
                    error(function (response) {
                        console.log("update player ko");
                    });
        } else {
            return null;
        }
    }

    this.updatePlayers = function () {
        console.log("updating players...");
        var self = this;
        var previous = $q.when(null); //initial start promise that's already resolved

        previous = previous.then(function () { //wait for previous operation
            self.updatePlayer(self.player1.player).success(function (player) {
                self.player1.player = player;
            });
            return "ok1";
        }).then(function () {
            self.updatePlayer(self.player2.player).success(function (player) {
                self.player2.player = player;
            });
            return "ok2";

        });
        console.log("Players updated");
        return previous;
    }


    this.resolveBattle = function (questionId, answerId) {
        console.log("Resolving battle...");
        var self = this;
        var previous = $q.when(null);
        previous.then(function () {
            if (self.player1.currentAnswer || self.player2.currentAnswer) {
                var questionWinner = null;
                if (self.player1.currentAnswer && self.player2.currentAnswer) {
                    if (self.player1.currentTime < self.player2.currentTime) {
                        self.player1.currentGoodAnswer += 1;
                        questionWinner = self.player1.player.id;
                        $scope.player[0].winner=true;
                    } else {
                        self.player2.currentGoodAnswer += 1;
                        questionWinner = self.player2.player.id;
                        $scope.player[1].winner=true;
                    }
                } else if (self.player1.currentAnswer) {
                    self.player1.currentGoodAnswer += 1;
                    questionWinner = self.player1.player.id;
                    $scope.player[0].winner=true;
                } else if (self.player2.currentAnswer) {
                    self.player2.currentGoodAnswer += 1;
                    questionWinner = self.player2.player.id;
                    $scope.player[1].winner=true;
                }
                console.log("Player 1 : " +  self.player1.currentGoodAnswer  +
                            " - Player 2 : " +  self.player2.currentGoodAnswer  );
                
                return $http.get('/dualquiz/webresources/net.java.dualquizz.battle/new-answer/'
                        + self.battle.id + "/"
                        + questionWinner + "/"
                        + questionId + "/"
                        + answerId
                        ).
                        success(function (data) {
                            return self.updatePlayers();
                            console.log("battle resolved");
                        });
            }
        });
        return previous;
    }




});

//Gestion de l'écran de login
//une fois que les deux joueurs ont selectionne leur noms et cliquer sur commencer, petite animation et c'est parti
quizzApp.controller('startController', function ($scope, $timeout, $location, $http, battleService, $q, $state) {
    
    //on initialise la category de la battle
    var params = $location.search();
    
    if(params.category == null || params.category==""){
        $state.go('cat');
    }
    
    battleService.battle.category = params.category;
    battleService.battleEnded = true;
    $scope.confirmed1 = false;
    $scope.confirmed2 = false;

//sale !!! on init les players quand le joueur clique sur son nom
    $scope.players = {};

    $scope.setValue1 = function (list) {
        $scope.search1 = list.firstName + " " + list.lastName;
        $scope.players[0] = list;
        $scope.checked1 = true;

    }
    $scope.setValue2 = function (list) {
        $scope.search2 = list.firstName + " " + list.lastName;
        $scope.players[1] = list;
        $scope.checked2 = true;

    };

    //les joueurs confirment leur identite. on initialise les parametres de la battle
    $scope.confirm = function (user) {
        if (user == 1) {
            battleService.player1.player = $scope.players[0];
            if (angular.isUndefined($scope.players[0].badges)) {
                battleService.player1.player.badges = [];
            }
            if (angular.isUndefined($scope.players[0].points)) {
                battleService.player1.player.points = 0;
            }
            battleService.player1.currentScore = 0;
            battleService.player1.currentGoodAnswer = 0;
            battleService.player1.winner = false;
            battleService.player1.abandon = false;
            $scope.confirmed1 = true;
        } else {
            battleService.player2.player = $scope.players[1];
            if (angular.isUndefined($scope.players[1].badges)) {
                battleService.player2.player.badges = [];
            }
            if (angular.isUndefined($scope.players[1].points)) {
                battleService.player2.player.points = 0;
            }
            $scope.confirmed2 = true;
            battleService.player2.currentScore = 0;
            battleService.player2.currentGoodAnswer = 0;
            battleService.player2.winner = false;
            battleService.player2.abandon = false;
        }
        $scope.goPlay();
    };


    $scope.goPlay = function ($q) {
        //si on a bien 2 joueurs 
        if (battleService.player1.player != null && battleService.player2.player != null) {

            //on cree une nouvelle battle
            var battleServiceUrl = '/dualquiz/webresources/net.java.dualquizz.battle/new-battle';
            return  $http.get(battleServiceUrl
                    + "?cid=" + battleService.player1.player.id
                    + "&cid=" + battleService.player2.player.id
                    + "&category=" + battleService.battle.category).
                    success(function (data) {
                        battleService.battle = data;
                        return battleService.updatePlayers().then(
                                $timeout(function () {
                                    $location.url('/play/' + battleService.battle.id);
                                }, 1500));

                    }).
                    error(function (data) {
                        //@todo si une bataille entre les 2 joueurs existent deja ça ne marche pas ??
                        //error
                    });


        }
    }
});

//gestion de la battle
quizzApp.controller('battleController', function ($scope, $http, $timeout, battleService, $state) {

    $scope.onTimeout = function () {
        //tant que ce n'est pas fini : fin ou abandon
        if (!battleService.battleEnded) {
            //pour chaque qestion on decompte
            if ($scope.counter > 0) {
                mytimeout = $timeout($scope.onTimeout, 10);
                $scope.counter--;
            } else {
                //si le compteur est a zero et qu'on a du temps a attendre, place aux resultats
                if ($scope.wait > 0) {
                    if ($scope.wait == delayAnswer) {
                        //  on met a jour les scores
                        battleService.resolveBattle($scope.questionId, $scope.correctProposalId).then(function () {
                            
                            mytimeout = $timeout($scope.onTimeout, 10);
                            $scope.wait--;
                        });
                    }else{
                        $scope.player[0].points = battleService.player1.player.points;
                            $scope.player[0].badges = battleService.player1.player.badges;
                            $scope.player[1].points = battleService.player2.player.points;
                            $scope.player[1].badges = battleService.player2.player.badges;
                            $scope.showAnswer = true;
                        mytimeout = $timeout($scope.onTimeout, 10);
                        $scope.wait--;  
                    }
                    
                } else {
                    if (battleService.player1.currentGoodAnswer == 3 || battleService.player2.currentGoodAnswer == 3) {
                        // fin
                        battleService.battleEnded = true;
                        $scope.battleEnded = battleService.battleEnded;
                    } else {
                        //si on a fini de regarder les reponses et qu'on a encore des questions dans la manche
                        $scope.pullQuestion();
                        $scope.reset();
                    }
                }

            }
        }
    };

    //abandon d'un des joueurs, 1 badge et 50 points pour celui qui reste
    $scope.abandon = function (player) {
        if (player == 0) {
            battleService.player1.abandon = true;
            $scope.player[0].abandon = true;
            battleService.player1.currentScore = 0;
            battleService.player1.currentGoodAnswer = 0;
            battleService.player2.currentScore = 50;
            battleService.player2.currentGoodAnswer = 1;

        } else {
            battleService.player2.abandon = true;
            $scope.player[1].abandon = true;
            battleService.player2.currentScore = 0;
            battleService.player2.currentGoodAnswer = 0;
            battleService.player1.currentScore = 50;
            battleService.player1.currentGoodAnswer = 1;
        }
        battleService.player1.player.points += battleService.player1.currentScore;
        battleService.player2.player.points += battleService.player2.currentScore;
        $scope.endBattle();
    }




    $scope.reset = function () {
        $scope.counter = delay;
        $scope.wait = delayAnswer;
        mytimeout = $timeout($scope.onTimeout, 10);
    };


    //tirage d'une question au hasard dans la categorie  
    $scope.pullQuestion = function () {
        $scope.showAnswer = false;
        $http.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $http.get('/dualquiz/webresources/net.java.dualquizz.question/random/' + battleService.battle.category).
                success(function (data) {
                    $scope.questionId = data.id;
                    $scope.description = data.description;
                    $scope.proposals = data.proposals;
                    //on melange l'ordre des reponses 
                    //elles sont affichee de la meme facon pour les 2 joueurs, triche permise!
                    $scope.proposals.sort(function () {
                        return 0.5 - Math.random()
                    })
                    $scope.nbQuestion += 1;
                    battleService.player1.currentTime = 0;
                    battleService.player1.currentAnswer = false;
                    battleService.player2.currentTime = 0;
                    battleService.player2.currentAnswer = false;
                    ;
                }).
                error(function (data) {
                    $scope.nbQuestion = nbQuestionMax;
                });
    };

    /*
     * Se declenche quand le joueur clique sur la reponse
     * si la reponse est bonne, 1 bonne reponse et le temps comptabilises
     * sinon 0 0
     */

    $scope.clickedOrTouched = function ($event, correct, proposalId) {

        var parentId = $event.currentTarget.offsetParent.id;
        var score = 0;
        if (correct == true) {
            score = $scope.counter;
            $scope.correctProposalId = proposalId;
        }

        if (parentId == "play1") {
            battleService.player1.currentTime = score;
            battleService.player1.currentAnswer = correct;
        } else {
            battleService.player2.currentTime = score;
            battleService.player2.currentAnswer = correct;
        }

    };


    $scope.startClickHandler = function(){
        $state.go('start',{category:$scope.category});
    }

    //params

    var nbQuestionMax = 3; //nombre de question par match
    var delay = 1000; //délai pour repondre 
    var delayAnswer = 300; //délai pour voir les reponses (en ms)
    $scope.wait = delayAnswer; // délai pour voir la bonne réponse

    $scope.myQuestion = 'question.html';
    $scope.category = battleService.battle.category;
    $scope.showAnswer = false;
    battleService.battleEnded = false;
    $scope.player = [battleService.player1.player, battleService.player2.player];
    $scope.counter = delay;
    $scope.nbQuestion = 0;
    var mytimeout = $timeout($scope.onTimeout, 10);
    $scope.pullQuestion();
    $scope.battleEnded = battleService.battleEnded;
    if($scope.category == null ||$scope.category == "" ){
        $state.go('cat');
    }
    if($scope.player[0] == null ||$scope.player[1] == null ){
        $state.go('start',{category:$scope.category});
    }


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
                template: "=",
                check: "="
            },
            link: function (scope, element, attrs) {

                var keys = element[0].querySelectorAll('g');
                angular.forEach(keys, function (path, key) {
                    var keyElement = angular.element(path);
                    keyElement.attr("key", "");
                    keyElement.attr("search", "search");
                    keyElement.attr("template", "template");
                    keyElement.attr("check", "check");
                    $compile(keyElement)(scope);
                })

            }
        }

    }]);

/*
 * et une directive pour gerer les touches et les actions : entrer une lettre, back, clear 
 * et recherche dans la lister des joueurs si on a tape plus de 3 lettres
 */
angular.module('quizzApp').directive('key', ['$compile', '$http', function ($compile, $http) {
        return {
            restrict: 'A',
            scope: {
                search: "=",
                template: "=",
                check: "="
            },
            link: function (scope, element, attrs) {
                scope.elementId = element.attr("id");
                scope.keyClick = function () {
                 //simulate css blink
                    $(".key").removeClass("last-selected");
                   
                    setTimeout(function (){
                            element.addClass("last-selected");
                    },50);
                    if (angular.isUndefined(scope.search)) {
                        scope.search = "";
                    }
                    if (scope.elementId == "clear") {
                        scope.search = "";
                    } else if (scope.elementId == "back") {
                        scope.search = scope.search.substring(0, scope.search.length - 1);
                    } else {
                        scope.search += scope.elementId;
                    }
                    if (scope.search.length == 0) {
                        scope.check = false;
                        scope.template = [];
                    } else if (scope.search.length >= 3) {
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





