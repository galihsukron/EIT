app.service('UserService', [ 'LocalStorage', 'SqlService', function (LocalStorage, SqlService) {
	var user = {};
	user.data = {};
	user.update = function () {
		// LocalStorage.remove('user');
		// console.log(LocalStorage.get('user'));
		user.data = LocalStorage.getObject('user');
		SqlService.conn0('selectUserByToken').then(
			function (data) {
				// console.log(data[0]);
				user.data = data[0];
				LocalStorage.setObject('user', data[0]);
				// console.log(user.data);
			},
			function (data) {
				console.log(data);
			}
		);
		// console.log(user.data);
	}

	// user.update();
	// console.log(user);
	return user;

}]);
