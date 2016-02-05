app.controller('NavController', ['$scope', '$location', function ($scope, $location) {
    $scope.isAuthenticated = false;

    $scope.logout = function () {
        // Deslogar
        $location.path('/');
    };

}]);

app.controller('LoginController', ['$scope', '$routeParams', '$location', 'authenticationService', function ($scope, $routeParams, $location) {
    $scope.form = {};
    $scope.form.inputEmail = $routeParams.email;

    $scope.login = function () {
        authenticationService.basicAuthentication($scope.form.inputEmail, $scope.form.inputPassword, function (response) {
            console.info('auth response: ', response);
        });
    };
}]);

app.controller('LoggedController', ['$scope', function ($scope) {
    $scope.showNewOccurrence = false;
    $scope.newOccurrenceForm = {};
    $scope.occurrences = [];
    $scope.showOccurrenceCreationSuccess = false;
    $scope.showOccurrenceCreationFailure = false;

    $scope.occurrences = [];

    $scope.createOccurrence = function () {};

    $scope.getUser = function (userId) {
        return 'username';
    }

    $scope.nextOccurrences = function () {
        //        $scope.occurrences.page.next();
        $scope.showOccurrenceCreationSuccess = false;
        $scope.showOccurrenceCreationFailure = false;
    }

    $scope.previousOccurrences = function () {
        //        $scope.occurrences.page.prev();
        $scope.showOccurrenceCreationSuccess = false;
        $scope.showOccurrenceCreationFailure = false;
    }

    $scope.hasNextPage = function () {
        return true;
        //        return $scope.occurrences.page.hasNext();
    }

    $scope.hasPreviousPage = function () {
        return true;
        //        return $scope.occurrences.page.hasPrev();
    }
}]);

app.controller('RegisterController', ['$scope', function ($scope) {
    $scope.form = {};
    $scope.showPassword = false;

    $scope.register = function () {
        console.log($scope.form);
    }

    var registerUser = function (uid) {

    }

}]);
