app.service('Auth', ['$rootScope', 'LocalStorage', '$state', '$q', 'SqlService', 'UserService',
function ($rootScope, LocalStorage, $state, $q, SqlService, UserService) {

	this.isLogin = function () {
		return (LocalStorage.get('userToken') != '');
	};

	this.controller = function (toState) {
		var dataUser = UserService.data;

		var deferred = $q.defer();
		if (this.isLogin()) {
			if (toState.name.split('.')[1] != 'access') {
				if (toState.name.split('.')[1] != 'web' && (dataUser.skinColorID == null || dataUser.faceShapeID == null || dataUser.bodyShapeID == null)) {
					deferred.reject('fs.web.camera');
				}
				deferred.resolve('success');
			}
			else {
				deferred.reject('app.dashboard');
			}
		}
		else {
			if (toState.name.split('.')[1] != 'app') {
				deferred.resolve('success');
			}
			else {
				deferred.reject('access.signin');
			}
		};
		return deferred.promise;
	};


	this.login = function (email, password) {
		var deferred = $q.defer();
		dataPost = {username : email, password : password};
		SqlService.conn('signin', dataPost).then(
			function (data) {
				if (data.length > 0) {
					console.log(data);
					LocalStorage.set('userToken', data[0].token);
					LocalStorage.setObject('user', data[0]);
					// UserService.update();
					deferred.resolve(data[0]);
				}
				else deferred.reject('Username or password is invalid');
			},
			function (data) { deferred.reject(data); }
		);
		return deferred.promise;
	};


	this.signup = function (name, email, password) {
		var deferred = $q.defer();
		dataPost = {userName: name, userEmail : email, password : password};
		SqlService.conn('signup', dataPost).then(
			function (data) {
				// console.log(data);
				if (!data.error) {
					// console.log("success");
					LocalStorage.set('userToken', data[0].userToken);
					LocalStorage.setObject('user', data[0]);
					UserService.update();
					deferred.resolve(data[0]);
				}
				else deferred.reject(data.error);
			},
			function (data) { deferred.reject(data); }
		);
		return deferred.promise;
	};

}]);
