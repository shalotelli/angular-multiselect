'use strict';

angular.module('multiSelectDemo', [ 'shalotelli-angular-multiselect' ])
.config(function ($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'http://*./**',
    'https://rawgit.com/**',
    'http://rawgit.com/**'
  ]);
})
.controller('MainCtrl', [ '$scope', function ($scope) {
  $scope.multiSelectData = [
    { id: 1, label: 'Customer Name #1' },
    { id: 2, label: 'Customer Name #2' },
    { id: 3, label: 'Customer Name #3' },
    { id: 4, label: 'Customer Name #4' },
    { id: 5, label: 'Customer Name #5' },
    { id: 999, label: 'Other', isOther: true }
  ];

  $scope.selectedItems = [
    { id: 1, label: 'Customer Name #1' },
    { id: 2, label: 'Customer Name #2' }
  ];

  $scope.multiSelectOutput = [];

}]);
