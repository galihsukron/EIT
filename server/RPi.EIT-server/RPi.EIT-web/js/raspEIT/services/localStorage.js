app.service('LocalStorage', [ '$window', '$base64', function ($window, $base64) {

	var encode = function (value) {
		return $base64.encode(unescape(encodeURIComponent(value)));
	};

	var decode = function (value) {
		return decodeURIComponent(escape($base64.decode(value)));
	};


	this.set = function (key, value) {
		$window.localStorage[encode(key)] = encode(value);
	};
	this.get = function (key) {
		return decode($window.localStorage[encode(key)] || '');
	};
	this.setObject = function(key, value) {
		$window.localStorage[encode(key)] = encode(JSON.stringify(value || {}));
	};
	this.getObject = function(key) {
		return JSON.parse(decode($window.localStorage[encode(key)] || 'e30=' ));
	};
	this.clear = function () {
		$window.localStorage.clear();
	};
	this.remove = function (key) {
		$window.localStorage.removeItem(encode(key));
	};

}]);
