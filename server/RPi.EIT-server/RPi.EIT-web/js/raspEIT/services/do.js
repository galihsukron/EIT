app.service('Do', function (LocalStorage, $state) {

	this.logout = function () {
		// console.log("tes");
		LocalStorage.remove('userToken');
		$state.go('access.login', {}, {reload : true});
	};

});
