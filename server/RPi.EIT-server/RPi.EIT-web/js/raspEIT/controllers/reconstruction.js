app.controller('ReconstructionCtrl', ['$scope', 'socket', '$interval', '$rootScope', '$http', '$timeout', '$localStorage', 'toaster',
    function($scope, socket, $interval, $rootScope, $http, $timeout, $localStorage, toaster) {
    // GET data ukur and algor from API
    $http({
        method  : 'GET',
        url     : '/data'
    }).success(function(data){
        $scope.dataUkur = data;
    }).error(function(e){
        alert(':(');
    });
    $http({
        method  : 'GET',
        url     : '/algor'
    }).success(function(data){
        $scope.dataAlgor = data;
    }).error(function(e){
        alert(':(');
    });

    $interval(function(){},10); // handle asynchronously
    $scope.disableBtn = true;
    $scope.loadImage = false;
    $scope.showImage = false;
    $scope.dataClicked = "No data selected";
    $scope.judul5='Rekonstruksi Citra';
    $scope.settingSession=false;

    // form kerapatan
    $scope.valKerapatan = 0.1;
    $scope.kerapatanOp = {
        min: 0.01,
        max: 0.3,
        step: 0.01,
        value: $scope.valKerapatan
    };
    var updateModel = function(val){
      $scope.$apply(function(){
        $scope.valKerapatan = val;
      });
    };
    angular.element("#slider").on('slideStop', function(data){
      updateModel(data.value);
    });

    // select form data and algor
    $scope.selectData = {
        id: "",
        filename: "",
        arus: ""
    }
    $scope.valAlgor = {};
    $scope.valAlgor.selectedAlgor = [];
    $scope.valData = {};
    $scope.valData.selectedData = [];
    var reconPage=false;

    $scope.cekData = function(id, filename, arus, nama){
        $scope.selectData.id = id;
        $scope.selectData.filename = filename;
        $scope.selectData.arus = arus;
        $scope.disableBtn = false;
        $scope.dataClicked = nama;
    };
	$scope.reconstruction = function(){
        reconPage=true;
        $scope.alerts = [{type: 'info', msg: 'Sedang merekonstruksi citra. (Data: '+$scope.valData.selectedData.nama_data+', Algoritma: '+$scope.valAlgor.selectedAlgor.nama_algor+')...'}];
        $scope.loadImage = true;
        $scope.disableBtn = true;
        $scope.judul5 = "Sedang merekonstruksi citra dari "+$scope.dataClicked;
		socket.emit('runReconstruction', {
            status: true,
            tipe: 'fromdata',
            token: $localStorage.webToken,
            kerapatan: parseFloat($localStorage.eitSettings.kerapatan),
            arus: parseFloat($scope.selectData.arus),
            iddata: $scope.selectData.id,
            data: $scope.selectData.filename,
            algor: $localStorage.eitSettings.algor,
            colorbar: $localStorage.eitSettings.colorbar
        });
	};
    socket.on('notifFinish', function(data) {
        if(data['session']=='fromdata' && data['token']==$localStorage.webToken && reconPage){
            $scope.loadImage = false;
            $scope.showImage = true;
            $scope.waktu = data['waktu'];
            $scope.imageName = data['filename'];
            $scope.judul5 = "Hasil citra "+$scope.dataClicked;
            toaster.pop("success", "Sukses", "Sukses merekonstruksi citra. Hasil citra tersimpan. Waktu eksekusi = "+data['waktu']+" detik");
            $scope.disableBtn = false;
            updateImage($scope.selectData.id, $scope.imageName);
        }
        reconPage=false;
    });
    function updateImage(iddata, filename){
        console.log(iddata);
        $http({
            method  : 'PUT',
            url     : '/data',
            data    : $.param({'id_data':iddata, 'citra': filename}),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            console.log('sukses update');
            toaster.pop("success", "Sukses", "Success update image for this data.");
        }).error(function(e){
            console.log(e);
        });
    };
    $scope.closeImage = function(otom) {
        $scope.loadImage = false;
        $scope.showImage = false;
        $scope.judul5 = "Rekonstruksi Citra";
        if(otom) updateImage($scope.selectData.id, $scope.imageName);
    };
    $scope.deleteImage = function() {
        $http({
            method  : 'DELETE',
            url     : '/image',
            data    : $.param({'filename': $scope.imageName}),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            console.log('sukses delete');
            toaster.pop("warning", "Citra dihapus");
        }).error(function(e){
            alert(':(');
        });
        $scope.closeImage(false);
    };
    $scope.changeSetting = function(){
        $scope.settingSession = true;
    };
    $scope.saveSetting = function(){
        $scope.settingSession = false;
        toaster.pop("success", "Setting saved", "Algoritma Rekonstruksi: "+$scope.eitSettings.algor+
            "\nKerapatan: "+$scope.eitSettings.kerapatan+
            "\nInjeksi Arus: "+$scope.eitSettings.arus);
    };
    $scope.eitSettings = $localStorage.eitSettings;
    if($scope.eitSettings.colorbar) $scope.colorbar="Yes";
    else $scope.colorbar="No";

    $scope.sweet = {
        title: "Hapus citra?",
        text: "Apakah anda yakin ingin menghapus citra ini?",
        type: "warning",
        // closeOnConfirm: false,
        showCancelButton: true,
    }
    // $scope.$watch('eitSettings', function(){
    //   $localStorage.eitSettings = $scope.eitSettings;
    //   toaster.pop("success", "Setting saved");
    // }, true);
}]);
