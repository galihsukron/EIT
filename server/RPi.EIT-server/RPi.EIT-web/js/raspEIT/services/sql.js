app.service('SqlService', ['$http', '$q', 'UrlServer', 'LocalStorage', 'Do',
function ($http, $q, UrlServer, LocalStorage, Do) {
	this.conn = function (dataSql, dataPost) {
		// console.log(dataSql);
		// Cache remover
		var d = new Date();
		var n = d.getTime();

		var deferred = $q.defer();

		// Token validation
		dataPost.userToken = LocalStorage.get('webToken');
		console.log(dataPost);

		$http({
			method: 'POST',
			url: '/login',
			data: $.param(dataPost),
			headers : {'Content-Type': 'application/x-www-form-urlencoded'}
		})
			.success(function(data){
					console.log(data);
				if (data == false) deferred.reject('Connection failed sds');
				else {
					delete data.app;
					if (data.error == 'Token is invalid') {
						Do.logout();
						deferred.reject(data.error);
					}
					else {
						// console.log(data);
						if (dataSql != 'signin' && dataSql != 'signup') delete data.userToken;
						if (data.data) {
							deferred.resolve(data.data);
						} else {
							deferred.resolve(data);
						}
					}
				}
			})
			.error(function(){
				deferred.reject('Connection failed xxxs');
			})
		return deferred.promise;
	};
	this.conn0 = function (dataGet) {
		var deferred = $q.defer();
		var dataPost = {};
		this.conn(dataGet, dataPost).then(
			function(data) { deferred.resolve(data); },
			function(data) { deferred.reject(data); }
		);
		return deferred.promise;
	};
	this.connIter = function (dataGet, dataPost, iter) {
		var deferred = $q.defer();
		this.conn(dataGet, dataPost).then(
			function(data) { data.iter = iter; deferred.resolve(data); },
			function(data) { deferred.reject(data); }
		);
		return deferred.promise;
	};
}]);
