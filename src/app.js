/** 
 * Javascript file for the app
 * 
 * Author: Rituparna Kashyap
 **/

(function() {
    
    // Define the module for the myllo app, include all required module
    var app = angular.module('myllo', ['ui.bootstrap', 'ngRoute', 'ngStorage']);
    
    // configure the routes
    app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', {             
            templateUrl: 'boardviewTemplate',
            controller: "OrgListCtrl"
        });
        
        $locationProvider.html5Mode(true);
    }]);
    
    // The mail app controller that stores the app configuration 
    app.controller('AppCtrl', ['$scope', '$rootScope', '$localStorage', '$modal'
        , function ($scope, $rootScope, $localStorage, $modal) {
            
        $rootScope.appName = "Myllo";
        
        // storing data and initialization of My board organization 
        $rootScope.$storage = $localStorage.$default({
            orgs: [{
                    id: 0,
                    name: "none", // name of the organization
                    isOrganization: false, // if treated as organization
                    boards: [{
                            id: 0,
                            name: "Welcome board",
                            lists: [{
                                    id: 0,
                                    position: 0,
                                    name: "Basic",
                                    cards: [{
                                            id: 0,
                                            positions: 0,
                                            name: "Welcome to trello",
                                            todos: []
                                    }]
                            }]
                    }] // list of boards in the organization 
            }]
        });
        
        $scope.createBoard = function () {

            var modalInstance = $modal.open({
                templateUrl: 'createBoardModalTemplate',
                controller: 'createBoardModalCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function (board) {});
        };
        
        $scope.createOrg = function () {
            alert(2);
        };
    }]);
    
    app.controller('BoardDropdownCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.boards = [];
        $rootScope.$storage.orgs.forEach(function(org) {
            org.boards.forEach(function (board) {
                $scope.boards.push({
                    id: board.id,
                    name: board.name,
                    orgId: org.id,
                    orgName: org.name
                }); 
            });
        });
    }]);

    // The organization controller that contains the details of the organizations 
    app.controller('OrgListCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        // seperate orgs from default boards
        $scope.orgs = [],
        $scope.defaultBoards = [];

        $rootScope.$storage.orgs.forEach(function(org) {
            var boards = [];
            org.boards.forEach(function (board) {
                boards.push({
                    id: board.id,
                    name: board.name
                }); 
            });
            // if org is not organization then list all the cards on my boards sections 
            if (!org.isOrganization) {
                $scope.defaultBoards = boards;
            } else {
                $scope.orgs.push({
                        id: org.id,
                        name: org.name,
                        boards: boards
                });
            }
        });
    }]);

    app.controller('createBoardModalCtrl', ['$scope', '$rootScope', '$modalInstance'
        , function ($scope, $rootScope, $modalInstance) {
        $scope.orgs = $rootScope.$storage.orgs;
        $scope.data = {
            boardName: "",
            orgId: 0 // My Boards selected by default
        }
        
        $scope.ok = function () {
            var close = false;
            $('#createBoardModalName').removeClass('myllo-invalid');
            $rootScope.$storage.orgs.forEach(function (org) {
       
                if (!$scope.data.boardName.length)
                    return $('#createBoardModalName').addClass('myllo-invalid');
                if (org.id === parseInt($scope.data.orgId)) {
                    var maxId = 0, present = false;
                    org.boards.forEach(function (board) {
                        if (board.name === $scope.data.boardName) {// same board exist
                           $('#createBoardModalName').addClass('myllo-invalid');
                           present = true;
                        } else {
                            maxId = board.id > maxId ? board.id : maxId;
                        }
                    });
                    
                    if (!present) {
                        close = true;
                        org.boards.push({
                            id: ++maxId, // auto increment id
                            name: $scope.data.boardName,
                            lists: []
                        });
                    }
                }
            });
            if (close)
                $modalInstance.close();
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('close');
        };
    }]);
})();


