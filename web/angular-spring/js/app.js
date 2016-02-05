var app = angular.module('sovi-occurrence', ['ngRoute']);

app.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
});

app.config(function ($routeProvider) {

    $routeProvider

        .when('/', {
        templateUrl: 'pages/landingpage.html'
    })

    .when('/register', {
        templateUrl: 'pages/register.html',
        controller: 'RegisterController'
    })

    .when('/login', {
        templateUrl: 'pages/login.html',
        controller: 'LoginController'
    })

    .when('/loginAfterRegister/:email', {
        templateUrl: 'pages/login.html',
        controller: 'LoginController'
    })

    .when('/logged', {
        templateUrl: 'pages/logged.html',
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
