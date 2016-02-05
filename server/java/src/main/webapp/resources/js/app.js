var app = angular.module('sovi-occurrence', ['ngRoute']);

app.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
});

app.config(function ($routeProvider) {

    $routeProvider

        .when('/', {
        templateUrl: 'landingpage'
    })

    .when('/register', {
        templateUrl: 'register',
        controller: 'RegisterController'
    })

    .when('/login', {
        templateUrl: 'login',
        controller: 'LoginController'
    })

    .when('/loginAfterRegister/:email', {
        templateUrl: 'login',
        controller: 'LoginController'
    })

    .when('/logged', {
        templateUrl: 'logged',
        controller: 'LoggedController'
    });
});

app.run(["$rootScope", "$location", function ($rootScope, $location) {
    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $location.path("/login");
        }
    });
}]);
