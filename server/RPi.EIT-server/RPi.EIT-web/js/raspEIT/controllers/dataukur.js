app.controller('DataCtrl', ['$scope', '$rootScope', '$http', 'toaster', '$interval', '$state', 'tglId',
function($scope, $rootScope, $http, toaster, $interval, $state, tglId){
    $interval(function(){}, 10);
    $scope.judul4 = "Data Hasil Pengukuran Tegangan";
    $scope.alerts = [{type: 'danger', msg: 'Upload data tegangan hanya dalam file berekstensi .txt dan jumlah data dalam file sebanyak 208 data tegangan.'}];

    $http.get('/data')
        .success(function(data){
            $scope.dataTegangan = data;
        })
        .error(function(e) {
            console.log("error");
        });

    $scope.mainData = true;

    $scope.cobaPrint = "detailhomedata";

    $scope.saveData = function(){
        var file = angular.element(document.querySelector('#file')).prop("files")[0];
        var origName = file.name;
        var extensi = origName.substr(origName.length-4);
        console.log(extensi);
        if(extensi!='.txt'){
            $scope.alerts = [{type: "danger", msg: "Format file tidak benar, harus berjenis .txt"}];
            return;
        }
        var namefile = $scope.valNama.replace(/\s/g, '')+".txt";
        $scope.files = [];
        $scope.files.push(file);
        console.log($scope.files);
        $http({
            method: 'POST',
            url: '/uploaddata',
            headers: { 'Content-Type': undefined },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append('nama_data', $scope.valNama);
                formData.append('filename', namefile);
                formData.append('arus_injeksi', $scope.valArus);
                formData.append('deskripsi', $scope.valDes);
                formData.append('file', data.files[0]);
                return formData;
            },
            data: {
                    nama_data: $scope.valNama,
                    filename: 'cobaupload',
                    arus_injeksi: $scope.valArus,
                    deskripsi: $scope.valDes,
                    files: $scope.files
                }

        }).success(function (res) {
            console.log(res);
            $interval(function(){}, 1000);
            $state.go('app.data.id', {idData: namefile.slice(0, -4)});
            toaster.pop("success", "Sukses", "Sukses upload data.");
        });
    };

    $scope.sweet = {
        title: "Hapus Data?",
        text: "You will not be able to recover this imaginary file!",
        type: "warning",
        // closeOnConfirm: false,
        showCancelButton: true,
    };
    $scope.deleteData = function(filename,id){
        $http({
            method  : 'DELETE',
            url     : '/data',
            data    : $.param({'filename': filename, 'id': id}),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            console.log('sukses delete');
            $state.go('app.data.home');
        }).error(function(e){
            alert(':(');
        });
    };
}]);

 // ------------------------------------------------------------------------------------------------------------------------

app.controller('DetailDataCtrl', ['$scope', '$stateParams', '$http', '$rootScope', '$interval', '$state', 'socket', '$localStorage',
function($scope, $stateParams, $http, $rootScope, $interval, $state, socket, $localStorage){
    $interval(function(){}, 10);
    $scope.infoData = {};
    $scope.detailSession = {
        loadRecon: false,
        judul: "Model & Citra"
    }

    $http({
        method  : 'GET',
        url     : '/data',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded', 'iddata': $stateParams.idData+'.txt' }
    }).success(function(data){
        $scope.infoData = {
            namaData: data[0].nama_data,
            arus: data[0].arus_injeksi,
            filename: data[0].filename,
            model: data[0].model,
            citra: data[0].citra,
            datetime: data[0].datetime,
            id: data[0].id_data
        };

        var cekColorbar = $scope.infoData.citra.charAt($scope.infoData.citra.length-5);
        if(cekColorbar=="1") $scope.showColorbarImage = false;
        else $scope.showColorbarImage = true;
    }).error(function(e){
        alert(':(');
    });

    var xData = [];
    var tableData = [];
    var temp = new Array();
    $http.get('./dataObjek/'+$stateParams.idData+'.txt')
        .success(function(data){
            var elektroda=0, aPos, aNeg, vPos, vNeg;
            temp = data.split("\n");
            var dataLength = temp.length;
            for(var i = 0; i < dataLength; i++) {
                xData.push([i,parseFloat(temp[i])]);

                if(i%13==0){
                    aNeg = parseInt(i/13);
                    aPos = aNeg+1;
                    vPos = 0;
                    vNeg = vPos+1;
                    if(aPos==16) aPos=0;
                    if((aNeg==vPos) && (aPos==vNeg)){
                        vPos=2;
                        vNeg=3;
                    }else if((aNeg==vNeg) || (vPos==aPos)) {
                        vPos=aPos+1;
                        vNeg=vPos+1;
                    }
                    tableData.push({elecArus:(aNeg)+"-"+(aPos), elecTegangan:(vPos)+"-"+(vNeg),voltage:parseFloat(temp[i])});
                }else{
                    vPos++;
                    vNeg=vPos+1;
                    if((vNeg==aNeg)) {
                        vPos=aPos+1;
                        vNeg=vPos+1;
                    }
                    if(vNeg==16) vNeg=0;
                    tableData.push({elecTegangan:(vPos)+"-"+(vNeg),voltage:parseFloat(temp[i])});
                }
            }

            $scope.XData = xData;
            $scope.TableData = tableData;
        })
        .error(function(e) {
            console.log("error");
        });

    $scope.sweet = {
        title: "Hapus Data?",
        text: "You will not be able to recover this imaginary file!",
        type: "warning",
        // closeOnConfirm: false,
        showCancelButton: true,
    };
    var thisPage=false;
    $scope.startDataRecon = function(){
        thisPage=true;
        $scope.detailSession = {
            loadRecon: true,
            judul: "Sedang merekonstruksi citra"
        };
        socket.emit('runReconstruction', {
            status: true,
            tipe: 'fromdata',
            token: $localStorage.webToken,
            kerapatan: parseFloat($localStorage.eitSettings.kerapatan),
            arus: parseFloat($scope.infoData.arus),
            iddata: $scope.infoData.id,
            data: $scope.infoData.filename,
            algor: $localStorage.eitSettings.algor,
            colorbar: $localStorage.eitSettings.colorbar
        });
    };
    $scope.deleteData = function(){
        $http({
            method  : 'DELETE',
            url     : '/data',
            data    : $.param({'filename': $scope.infoData.filename, 'id':$scope.infoData.id}),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            console.log('sukses delete');
            $state.go('app.data.home');
        }).error(function(e){
            alert(':(');
        });
    };

    socket.on('notifFinish', function(data) {
        if(data['session']=='fromdata' && data['token']==$localStorage.webToken && thisPage){
            $scope.detailSession.loadRecon = false;
            $scope.infoData.citra = true;
            $scope.waktu = data['waktu'];
            $scope.infoData.citra = data['filename'];
            $scope.judul5 = "Hasil citra "+$scope.dataClicked;
            updateImageProfil($scope.infoData.id, $scope.infoData.citra);
        }
        thisPage=false;
    });
    function updateImageProfil(iddata, filename){
        console.log(filename);
        console.log(iddata);
        $http({
            method  : 'PUT',
            url     : '/data',
            data    : $.param({'id_data':iddata, 'citra': filename}),
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).success(function(data){
            console.log('sukses update');
        }).error(function(e){
            console.log(e);
        });
    };

    $scope.saveModel = function(){
        var file = angular.element(document.querySelector('#file')).prop("files")[0];
        var origName = file.name;
        var extensi = origName.substr(origName.length-4);
        console.log(extensi);
        if(extensi!='.png'){
            alert("File harus berjenis gambar (.png)");
            return;
        }
        var thisname = $scope.infoData.namaData.replace(/\s/g, '')+extensi;
        $scope.files = [];
        $scope.files.push(file);
        console.log($scope.files);
        $http({
            method: 'PUT',
            url: '/uploadmodel',
            headers: { 'Content-Type': undefined },
            transformRequest: function (data) {
                var formData = new FormData();
                formData.append('id_data', $scope.infoData.id);
                formData.append('model', thisname);
                formData.append('file', data.files[0]);
                return formData;
            },
            data: {
                    id_data: $scope.infoData.id,
                    model: file.originalname,
                    files: $scope.files
                }

        }).success(function(res){
            console.log(res);
            $state.reload();
        });
    };
}]);
