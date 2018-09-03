'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$scope', '$http', '$state', 'Auth', '$base64', function($scope, $http, $state, Auth, $base64) {
    $scope.user = {};
    $scope.authError = null;
    $scope.login = function() {
      $scope.authError = null;
      // Try to login
      Auth.login($scope.user.email, $base64.encode($scope.user.password))
      .then(function(data) {
        $state.go("app.dashboard");
      }, function(data) {
        $scope.authError = data;
      });
    };
  }])
;
