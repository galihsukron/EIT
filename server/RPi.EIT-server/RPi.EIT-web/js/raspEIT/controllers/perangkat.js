app.controller('PerangkatCtrl',['$scope','$http', function($scope,$http){
    $scope.dataEIT = [];
    $http({
        method  : 'GET',
        url     : '/perangkat',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
        $scope.dataEIT = data;
    }).error(function(e){
        console.log(':(');
    });
}]);
