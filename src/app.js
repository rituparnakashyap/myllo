/** 
 * Javascript file for the app
 * 
 * Author: Rituparna Kashyap
 **/

(function() {
    
    var DEFAULT_CONFIG = {
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
                                }, {
                                        id: 1,
                                        positions: 1,
                                        name: "Drag and drop me",
                                        todos: []
                                }]
                        },{
                                id: 1,
                                position: 0,
                                name: "Imtermediate",
                                cards: []
                        }]
                }] // list of boards in the organization 
        }]
    };
    
    // Define the module for the myllo app, include all required module
    var app = angular.module('myllo', ['ui.bootstrap', 'ngRoute', 'ngStorage', 'ui']);
    
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
        $rootScope.$storage = $localStorage.$default(DEFAULT_CONFIG);
        
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
                    if (!$rootScope.$storage.orgs)
                        return;
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
            templateUrl: 'orgViewTemplate',
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
    
    // The directives for board list 
    app.directive('cardList', function () {
        return {
            restrict: 'A',
            templateUrl: 'boardViewTemplate',
            controller: ['$scope', '$rootScope', '$routeParams', function ($scope, $rootScope, $routeParams) {
                
                var orgId = $routeParams.orgId;
                var boardId = $routeParams.boardId;
                
                function onSortableStop (e, ui) {
                    var scope = ui.item.scope(),
                    card = scope.card,
                    listOld = scope.$parent.list,
                    listCurrent = ui.item.parent().scope().list,
                    board = scope.$parent.$parent.board,
                    org = scope.$parent.$parent.org;

                    $rootScope.$storage.orgs.forEach(function (org_) {
                       if (org.id === org_.id ) {/* the org we are looking for */ 
                            org_.boards.forEach(function(board_) {
                                if (board.id === board_.id) { /* the board we are looking for */

                                    board_.lists.forEach(function (list_) {
                                        if (listOld.id !== listCurrent.id) { /* the card has changed the list */
                                            var oldIndex = 0;
                                            if (listOld.id === list_.id) {

                                                for (var i = list_.cards.length - 1; i >= 0; --i) {
                                                    if (card.id === list_.cards[i].id) {
                                                       oldIndex = i;
                                                       break;
                                                    }
                                                }

                                                list_.cards.splice(oldIndex, 1); // remove card from list 
                                            }
                                            if (listCurrent.id === list_.id) {

                                                list_.cards.push(card); // add car to list
                                            }

                                        } else { /* postition has changed */
                                            /*TODO*/
                                        }
                                    });
                                }
                            });
                        }
                    });
                    
                    $rootScope.$apply();
                };
                
                // reset scope every time there is any change in the data 
                function resetScope_ () {
                    if (!$rootScope.$storage.orgs)
                        return $scope.orgs = [];
                    for (var i = $rootScope.$storage.orgs.length - 1; i >= 0; i--) {
                        var org = $rootScope.$storage.orgs[i];
                        
                        // find org with org id
                        if (org.id === parseInt(orgId)) {

                            // find board with board id 
                            for (var i = org.boards.length - 1; i >= 0; i--) {
                                
                                var board = org.boards[i];
                                
                                if (board.id === parseInt(boardId)) {
                                    $scope.board = board;
                                    $scope.org = org;
                                }
                            }
                        }
                    };
                };
               
                $scope.sortableOptions = {        
                    stop: onSortableStop,
                    connectWith: '.card-container',
                    placeholder: 'card-placeholder'
                };
            
                $rootScope.$watch('$storage.orgs', resetScope_, true);
            }],
            link: function link (scope, elem, attrs) {
                $(window).unbind('resize.board');
                $(window).bind('resize.board', function () {
                    
                    $('.card-container').css('max-height', ($(window).innerHeight() - 220) + 'px');
                    $('#board').height($(window).innerHeight() - 120);
                });
                
                $('.card-container').css('max-height', ($(window).innerHeight() - 220) + 'px');
                $('#board').height($(window).innerHeight() - 120);
            }
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
            if (close) {
                $rootScope.$apply();
                $modalInstance.close();
            }
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
                $rootScope.$apply();
                $modalInstance.close();
            }
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('close');
        };
    }]);

    /* controller for saving list  */
    app.controller('SaveListCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.showEditList = false;
        $scope.saveList = function saveList (orgId, boardId, listId) {
           
            $rootScope.$storage.orgs.forEach(function (org) {
                if (org.id === orgId ) {/* the org we are looking for */ 
                     org.boards.forEach(function(board) {
                        if (board.id === boardId) { /* the board we are looking for */
                            
                            var maxListId = 0, position = 0; /* card id is accross a board */
                            board.lists.forEach(function (list) {
                                if (typeof listId !== 'undefined' && list.id === listId) { /* update list */
                                    list.name = $scope.$parent.list.name;
                                } else {
                                    /* find the position and id of the new list */
                                    position = list.position > position ? list.position : position;
                                    maxListId = list.id > maxListId ? list.id : maxListId;
                                }
                            });
                            
                            if (typeof listId === 'undefined') { /* create new */
                                board.lists.push({
                                    id: ++maxListId,
                                    position: ++position,
                                    name: $scope.name,
                                    cards: []
                                });
                            }
                            
                        }
                    });
                }
            });          
            
            $rootScope.$apply();
            $scope.showEditList = false;
            $scope.name = '';
        };
    }]);

    /* controller for saving card */
    app.controller('SaveCardCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $scope.showEditCard = false;
        $scope.saveCard = function saveCard (orgId, boardId, listId, cardId) {
           
            $rootScope.$storage.orgs.forEach(function (org) {
                if (org.id === orgId ) {/* the org we are looking for */ 
                     org.boards.forEach(function(board) {
                        if (board.id === boardId) { /* the board we are looking for */
                            
                            var maxCardId = 0, targetList = null, position = 0; /* card id is accross a board */
                            board.lists.forEach(function (list) {
                                if (typeof cardId !== 'undefined') { /* updating card */
                                    if (list.id === listId) {
                                        list.cards.forEach(function (card) {
                                            if (card.id === cardId)
                                                card.name = $scope.$parent.card.name;
                                        }); 
                                    }
                                } else {
                                    if (list.id === listId) { /* creating card, list your are looking for */
                                        targetList = list;
                                    }

                                    list.cards.forEach(function (card) {
                                        /* find the position and id of the new card */
                                        if (list.id === listId) {
                                            position = card.position > position ? card.position : position;
                                        }
                                        maxCardId = card.id > maxCardId ? card.id : maxCardId;
                                    });
                                }
                            });
                            
                            if (typeof cardId === 'undefined') { /* creating card, so insert it */
                                targetList.cards.push({
                                   id: ++maxCardId,
                                   position: ++position,
                                   name: $scope.name,
                                   todos: []
                                });
                            } 
                        }
                    });
                }
            });          
            
            $rootScope.$apply();
            $scope.showEditCard = false;
            $scope.name = '';
        };
    }]);
})();


