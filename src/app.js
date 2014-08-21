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
        $routeProvider.when('/', {template: '<div org-list></div>'}); // load orgList direvative 
        $routeProvider.when('/o/:orgId/b/:boardId', {template: '<div card-list></div>'}); // load cardList direvative 
        
        //$locationProvider.html5Mode(true);
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
            var modalInstance = $modal.open({
                templateUrl: 'createOrgModalTemplate',
                controller: 'createOrgModalCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function (board) {});
        };
    }]);
    
    
    app.directive('boardDropdown', function () {
        return {
            restrict: 'A',
            templateUrl: 'boardDropdownTemplate',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                function resetScope_ () {
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
                };
                
                $rootScope.$watch('$storage.orgs', resetScope_, true);
            }]
        };
    });

    // The organization controller that contains the details of the organizations 
    app.directive('orgList', function () {
        return {
            restrict: 'A',
            templateUrl: 'boardviewTemplate',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                // seperate orgs from default boards
                function resetScope_ () {
                    $scope.data = {
                        orgs: [],
                        defaultBoards: []
                    };

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
                            $scope.data.defaultBoards = boards;
                        } else {
                            $scope.data.orgs.push({
                                    id: org.id,
                                    name: org.name,
                                    boards: boards
                            });
                        }
                    });
                };
                $rootScope.$watch('$storage.orgs', resetScope_, true);
            }]
        };
    });

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
            if (!$scope.data.boardName.length)
                    return $('#createBoardModalName').addClass('myllo-invalid');
            $rootScope.$storage.orgs.forEach(function (org) {
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

    app.controller('createOrgModalCtrl', ['$scope', '$rootScope', '$modalInstance'
        , function ($scope, $rootScope, $modalInstance) {
        $scope.orgs = $rootScope.$storage.orgs;
        $scope.data = {orgName: ""}
        
        $scope.ok = function () {
            var close = false;
            $('#createOrgModalName').removeClass('myllo-invalid');
            if (!$scope.data.orgName.length)
                    return $('#createOrgModalName').addClass('myllo-invalid');
            var close = true, maxId = 0;
            $rootScope.$storage.orgs.forEach(function (org) {
                if (org.name === $scope.data.orgName) {
                    $('#createOrgModalName').addClass('myllo-invalid');
                    close = false;
                } else {
                    maxId = org.id > maxId ? org.id : maxId;
                }
            });
            
            if (close) {
                $rootScope.$storage.orgs.push({
                    id: ++maxId,
                    name: $scope.data.orgName,
                    isOrganization: true,
                    boards: []
                });
                $modalInstance.close();
            }
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('close');
        };
    }]);
})();


