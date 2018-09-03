app.controller('SettingCtrl', ['$scope', '$localStorage', 'toaster', '$http',
function($scope, $localStorage, toaster, $http) {
    $http({
        method  : 'GET',
        url     : '/algor',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
        $scope.algors = data;
    }).error(function(e){
        alert(':(');
    });
    
    $scope.saveSetting = function(){
        $localStorage.eitSettings = $scope.eitSettings;
        toaster.pop("success", "Sukses", "Sukses save setting.");
        // $window.history.back();
    }

    // $scope.$watch('eitSettings', function(){
    //   $localStorage.eitSettings = $scope.eitSettings;
    // }, true);

}]);
