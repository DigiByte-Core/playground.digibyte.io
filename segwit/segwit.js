'use strict';

angular.module('playApp.segwit', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/segwit', {
    templateUrl: 'segwit/segwit.html',
    controller: 'SegwitCtrl'
  });
}])

.controller('SegwitCtrl', function($scope, $rootScope, $http, digibyte) {

});
