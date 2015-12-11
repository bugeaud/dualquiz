var quizzApp = angular.module('quizzApp', ['ui.router', 'timer']);

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

quizzApp.controller('searchController', function ($scope, $location) {

    $scope.templateList = [{name: 'John'},
        {name: 'Mary'},
        {name: 'Mike'},
        {name: 'Adam'},
        {name: 'Julie'},
        {name: 'Juliette'}];

    $scope.players = {user1: "", user2: ""};
    $scope.setValue1 = function (list) {
        $scope.players.user1 = list.name;
        $scope.goPlay();
    }
    $scope.setValue2 = function (list) {
        $scope.players.user2 = list.name;
        $scope.goPlay();
    }

    $scope.goPlay = function () {

        if ($scope.players.user1 != "" && $scope.players.user2 != "") {

            $location.url('/play');
        }
    }
});


quizzApp.controller('battleController', function ($scope, $location, $timeout) {

    
    var delay = 5;
    $scope.counter = delay;
    $scope.onTimeout = function(){
        $scope.counter--;
        if ($scope.counter > 0) {
            mytimeout = $timeout($scope.onTimeout,1000);
        }
        else {
          $scope.nextSlide();
          $scope.reset();
        }
    };
    var mytimeout = $timeout($scope.onTimeout,1000);
    
    $scope.reset= function(){
        $scope.counter = delay;
        mytimeout = $timeout($scope.onTimeout,1000);
    };

    $scope.myQuestion = 'question.html';
    $scope.count = 0;
    $scope.nextSlide = function () {
       
            $scope.description = $scope.count;
            $scope.count += 1;
     

    };

    
   
    
 /*    $timeout(function() {
                 $scope.countdownVal = 5;
                 if($scope.timerRunning == false){
                     
                 }
            }, 3000);   */
        






    /* $scope.$on('$viewContentLoaded', function () 
     {
     
     });*/

});




quizzApp.controller('scotchController', function ($scope) {

    $scope.message = 'test';

    $scope.scotches = [
        {
            name: 'Macallan 12',
            price: 50
        },
        {
            name: 'Chivas Regal Royal Salute',
            price: 10000
        },
        {
            name: 'Glenfiddich 1937',
            price: 20000
        }
    ];

});