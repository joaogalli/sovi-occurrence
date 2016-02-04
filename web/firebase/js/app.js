var app = angular.module('sovi-occurrence', ['ngRoute', 'firebase']);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        var ref = new Firebase("https://fiery-fire-206.firebaseio.com");
        return $firebaseAuth(ref);
  }
]);

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
        controller: 'LoginController',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth", function (Auth) {
                // $waitForAuth returns a promise so the resolve waits for it to complete
                return Auth.$waitForAuth();
            }]
        }
    })

    .when('/loginAfterRegister/:email', {
        templateUrl: 'pages/login.html',
        controller: 'LoginController',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth", function (Auth) {
                // $waitForAuth returns a promise so the resolve waits for it to complete
                return Auth.$waitForAuth();
            }]
        }
    })

    .when('/logged', {
        templateUrl: 'pages/logged.html',
        controller: 'LoggedController',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth", function (Auth) {
                // $waitForAuth returns a promise so the resolve waits for it to complete
                return Auth.$requireAuth();
            }]
        }
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
