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

app.controller('NavController', ['$scope', '$location', 'Auth', function ($scope, $location, Auth) {
    $scope.isAuthenticated = false;

    Auth.$onAuth(function (authData) {
        console.log('authData: ', (authData !== null));
        $scope.isAuthenticated = (authData !== null);
    });

    $scope.logout = function () {
        Auth.$unauth();
        $location.path('/');
    };

}]);

app.controller('LoginController', ['$scope', '$routeParams', '$location', 'Auth', 'currentAuth', function ($scope, $routeParams, $location, Auth, currentAuth) {
    if (currentAuth)
        console.info('currentAuth: ', currentAuth);

    $scope.form = {};
    $scope.form.inputEmail = $routeParams.email;

    $scope.login = function () {
        Auth.$authWithPassword({
            "email": $scope.form.inputEmail,
            "password": $scope.form.inputPassword
        }).then(function (authData) {
            console.log("Authenticated successfully with payload:", authData);
            $location.path('/logged');
        }).catch(function (error) {
            console.log("Login Failed!", error);
        });
    };
}]);

app.controller('LoggedController', ['$scope', 'Auth', 'currentAuth', '$firebaseArray', function ($scope, Auth, currentAuth, $firebaseArray) {
    console.info("currentAuth: ", currentAuth);

    $scope.showNewOccurrence = false;
    $scope.newOccurrenceForm = {};

    var ref = new Firebase("https://fiery-fire-206.firebaseio.com/occurrences");
    var occurrences = $firebaseArray(ref);

    var query = ref.orderByChild("timestamp").limitToLast(2);
    var filteredOccurrences = $firebaseArray(query);

    $scope.occurrences = angular.copy(filteredOccurrences);

    console.log("occurrences: ", $scope.occurrences);
    console.log("filteredOccurrences: ", $scope.filteredOccurrences);

    $scope.createOccurrence = function () {
        ref.push({
            timestamp: Firebase.ServerValue.TIMESTAMP,
            message: $scope.newOccurrenceForm.inputMessage,
            author: currentAuth.auth.uid
        });
        $scope.showNewOccurrence = false;
    };

}]);

app.controller('RegisterController', ['$scope', '$location', 'Auth', function ($scope, $location, Auth) {
    $scope.form = {};
    $scope.showPassword = false;

    $scope.register = function () {
        console.log($scope.form);

        Auth.$createUser({
            name: $scope.form.inputName,
            email: $scope.form.inputEmail,
            password: $scope.form.inputPassword
        }).then(function (userData) {
            console.log('Usuário cadastrado: ', userData);
            // cdastrar um user para os dados
            $scope.successMessage = "Seu cadastro foi efetuado com sucesso.";
            $location.path('/loginAfterRegister/' + $scope.form.inputEmail);
        }).catch(function (error) {
            switch (error.code) {
                case "EMAIL_TAKEN":
                    $scope.errorMessage = "Este e-mail já está sendo usado para uma conta.";
                    break;
                case "INVALID_EMAIL":
                    $scope.errorMessage = "O e-mail não está num formato válido.";
                    break;
                default:
                    $scope.errorMessage = error.message;
            }
        });
    }

}]);
