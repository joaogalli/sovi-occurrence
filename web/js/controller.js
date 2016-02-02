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

app.controller('LoggedController', ['$scope', 'Auth', 'currentAuth', '$firebaseArray', 'userService', function ($scope, Auth, currentAuth, $firebaseArray, userService) {
    //    console.info("currentAuth: ", currentAuth);

    $scope.showNewOccurrence = false;
    $scope.newOccurrenceForm = {};
    $scope.occurrences = [];

    var ref = new Firebase("https://fiery-fire-206.firebaseio.com/occurrences");
    //    $scope.occurrences = $firebaseArray(ref);

    var query = ref.orderByChild("timestamp").limitToLast(2).on('child_added', function (snapshot) {
        $scope.$apply(function () {
            $scope.occurrences.push(snapshot.val());
        });
    });

    $scope.createOccurrence = function () {
        ref.push({
            timestamp: Firebase.ServerValue.TIMESTAMP,
            message: $scope.newOccurrenceForm.inputMessage,
            author: currentAuth.auth.uid
        });
        $scope.showNewOccurrence = false;
    };

    $scope.getUser = function (userId) {
        return userService.findByUserId(userId);
    }

    $scope.nextOccurrences = function () {

    }
}]);

app.controller('RegisterController', ['$scope', '$location', 'Auth', 'userService', function ($scope, $location, Auth, userService) {
    $scope.form = {};
    $scope.showPassword = false;

    $scope.register = function () {
        console.log($scope.form);

        Auth.$createUser({
            email: $scope.form.inputEmail,
            password: $scope.form.inputPassword
        }).then(function (userData) {
            console.log('Usuário cadastrado: ', userData);
            userService.register(userData.uid, $scope.form.inputName);
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

    var registerUser = function (uid) {
        var ref = new Firebase("https://fiery-fire-206.firebaseio.com/users");

    }

}]);
