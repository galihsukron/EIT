app.controller('AlgorCtrl', ['$scope', '$http', '$stateParams','$interval', function($scope, $http, $stateParams, $interval){
    $http({
        method  : 'GET',
        url     : '/algor',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded', 'idalgor': $stateParams.idalgor }
    }).success(function(data){
        $scope.infoAlgor = data;
    }).error(function(e){
        alert(':(');
    });

    pola_ok("abba", "ayam goreng goreng ayam");
    // 1
    function pola_ok(a,b){
    	z = b.split(" ");
        x=a.split("");
        var tes={};
        var isi={};
        for(var ii=0;ii<a.length;ii++) isi[a[ii]]=false;
        for(var i=0;i<a.length;i++){
            if(isi[a[i]]){
                console.log("cek",i,a[i],tes[a[i]],z[i]);
                if(z[i] != tes[a[i]]) return false;
            }
            else{
                isi[a[i]]=true;
                tes[a[i]]=z[i];
            }
        }
    	// console.log(tes);
        return true;
    }

    var s=pola_ok("abba", "ayam goreng goreng ayam");
    console.log("Nomor 1:",s)

    // 2
    function ajaib(x) {
        z=x.toString();
        var cek=0;
        for(var i=0;i<z.length;i++){
            cek += Math.pow(parseInt(z[i]),2);
        }
        z = cek.toString();
        while(true){
            var has=0;
            for(var i=0;i<z.length;i++){
                has += Math.pow(parseInt(z[i]),2);
            }
            if(has==1){
                return true;
            }
            if(has==cek) return false;
            z=has.toString();
        }
    }
    console.log("Nomor 2:",ajaib("19"));

    // 3
    function sampoerna(str){
        z=str.split("");
        for(var i=0;i<z.length-1;i++){
            if(z[i]=='('){
                if(z[i+1]!=')') return false;
            }else if(z[i]=='['){
                if(z[i+1]!=']') return false;
            }else if(z[i]=='{'){
                if(z[i+1]!='}') return false;
            }
        }
        return true;
    }
    console.log("Nomor 3:",sampoerna("[]()[]{}"));
}]);
