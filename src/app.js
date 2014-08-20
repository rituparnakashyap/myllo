/** 
 * Javascript file for the app
 * 
 * Author: Rituparna Kashyap
 **/

(function() {
    var app = angular.module('myllo', ['ui.bootstrap']);
    
    app.controller('SomeController', function ($scope) {
        $scope.name = "Rituparna";
        
    });
    
})();


