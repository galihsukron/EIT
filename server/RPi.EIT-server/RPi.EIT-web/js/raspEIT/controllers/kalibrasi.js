app.controller('KalibrasiCtrl', ['$scope', '$rootScope', 'socket', '$interval', '$localStorage', '$http', 'toaster',
function($scope, $rootScope, socket, $interval, $localStorage, $http, toaster) {
    $interval(function(){},10);
    var alertOnline = [{type: 'success', msg: 'Perangkat EIT sedang Online, klik tombol dibawah ini untuk mulai mendapatkan citra dari objek'}];
    var alertOffline = [{type: 'danger', msg: 'Perangkat EIT sedang Offline, hidupkan alat untuk memulai rekonstruksi citra dari objek yang diinginkan.'}];
    var alertCollectData = [{type: 'warning', msg: 'Sedang mengumpulkan data dari perangkat EIT...'}];
    var alertStartReconstruction = [{type: 'info', msg: 'Selesai mengambil data, memulai rekonstruksi citra...'}];
    var alertFinish = [{type: 'success', msg: 'Sukses merekonstruksi citra dari objek pada perangkat EIT (autosave)'}];

    $http({
        method  : 'GET',
        url     : '/algor',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).success(function(data){
        $scope.algors = data;
    }).error(function(e){
        console.log(e);
    });

    $scope.realtimeSession = {
        loadImage: false,
        showImage: false
    };
    $scope.headSetting = "Setting";

    if ($rootScope.piOnline) {
        $scope.alerts = alertOnline;
        $scope.iconClass = "icon icon-control-play";
    }else{
        $scope.alerts = alertOffline
        $scope.iconClass = "fa fa-times-circle-o";
    }

    socket.on('raspiStatus', function(status){
        if(status['online']){
            $scope.alerts = alertOnline;
            $scope.iconClass = "icon icon-control-play";
        }else{
            $scope.alerts = alertOffline;
            $scope.iconClass = "fa fa-times-circle-o";
            $scope.realtimeSession = {
                loadImage: false,
                showImage: false,
            };
        }
    });
    socket.on('viewResultVoltage', function(data) {
        if(data['status'] && data['token']==$localStorage.webToken){ // handle hanya sekali mellakukan rekonstruksi
            $scope.alerts = alertStartReconstruction;
            socket.emit('runReconstruction', {
                status: true,
                tipe: "fromraspi",
                token: $localStorage.webToken,
                kerapatan: 0.305,
                arus: 7.0,
                iddata: 2,
                data: data['volt'],
                algor: $localStorage.eitSettings.algor,
                colorbar: $localStorage.eitSettings.colorbar
            });
        }
        data['status'] = false;
        console.log("finissshhh");
    });
    socket.on('notifFinish', function(data) {
        if(data['session']=="fromraspi" && data['token']==$localStorage.webToken){
            $scope.alerts = alertFinish;
            $scope.realtimeSession.loadImage = false;
            $scope.realtimeSession.showImage = true;
            $scope.waktu = data['waktu'];
            $scope.imageName = data['filename'];
            $scope.judul6 = "Hasil";
            toaster.pop("success", "Sukses", "Sukses merekonstruksi citra. Hasil citra tersimpan. Waktu eksekusi = "+data['waktu']+" detik");
        }
    });

    $scope.sweet = {
        title: "Hapus citra?",
        text: "Apakah anda yakin ingin menghapus citra ini?",
        type: "warning",
        // closeOnConfirm: false,
        showCancelButton: true,
    }

    $scope.run = function(){
        if($rootScope.piOnline){
            $scope.realtimeSession.loadImage = true;
            $scope.alerts = alertCollectData;
            socket.emit('startGetData', {
                status: true,
                token: $localStorage.webToken
            });
        }
    };
    $scope.deleteImg = function() {
        $http({
            method  : 'DELETE',
            url     : '/image',
            data    : $.param({'filename': $scope.imageName}),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            $scope.alerts = alertOnline;
            console.log('sukses delete');
            $scope.realtimeSession.loadImage = false;
            $scope.realtimeSession.showImage = false;
        }).error(function(e){
            alert(':(');
        });
    };
    $scope.changeSetting = function(){
        $scope.settingSession = true;
        $scope.headSetting = "Change Setting";
    };
    $scope.saveSetting = function(){
        $scope.settingSession = false;
        if($scope.eitSettings.colorbar) $scope.colorbar="Yes";
        else $scope.colorbar="No";
        if($scope.eitSettings.saveData) $scope.saveData="Yes";
        else $scope.saveData="No";
        $scope.headSetting = "Setting";
        toaster.pop("success", "Setting saved");
    };

    $scope.eitSettings = $localStorage.eitSettings;
    if($scope.eitSettings.colorbar) $scope.colorbar="Yes";
    else $scope.colorbar="No";
    if($scope.eitSettings.saveData) $scope.saveData="Yes";
    else $scope.saveData="No";
}]);
