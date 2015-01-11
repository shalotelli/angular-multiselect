// Code goes here

'use strict';

angular.module('multiSelectDemo', ['shalotelli-angular-multiselect'])
  .controller('MainCtrl', ['$scope', function($scope) {
    $scope.selectedItems = [];
    $scope.multiSelectData = generateData();

    function generateData() {
      var returnMe = [],
        count = 1000;
      for (var i = 0; i < count; i++) {
        var temp = {
          id: i,
          label: 'Customer Name #' + i
        };
        returnMe.push(temp);
        if (i < 10) {
          $scope.selectedItems.push(temp);
        }
      }
      return returnMe;
    }


    $scope.multiSelectOutput = [];
  }]).config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http://*./**',
      'https://rawgit.com/**',
      'http://rawgit.com/**'
    ]);

  });
