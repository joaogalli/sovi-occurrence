app.factory('authenticationService', ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', function (Base64, $http, $cookieStore, $rootScope, $timeout) {
    console.info('Building authenticationservice');

    var service = {};

    service.basicAuthentication = function (username, password, callback) {
        $http.post('/sovi-occurrences/auth', {
            username: login,
            password: password
        }).success(function (response) {
            callback(response);
        });
    }



}]);
