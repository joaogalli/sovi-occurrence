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

app.factory('$pageArray', ['$firebaseArray', function ($firebaseArray) {
    return function (ref, field) {
        // create a Paginate reference
        var pageRef = new Firebase.util.Paginate(ref, field, {
            maxCacheSize: 250,
            pageSize: 2
        });
        // generate a synchronized array using the special page ref
        var list = $firebaseArray(pageRef);
        // store the "page" scope on the synchronized array for easy access
        list.page = pageRef.page;

        // when the page count loads, update local scope vars
        pageRef.page.onPageCount(function (currentPageCount, couldHaveMore) {
            list.pageCount = currentPageCount;
            list.couldHaveMore = couldHaveMore;
        });

        // when the current page is changed, update local scope vars
        pageRef.page.onPageChange(function (currentPageNumber) {
            list.currentPageNumber = currentPageNumber;
        });

        // load the first page
        pageRef.page.next();

        return list;
    }
}]);

app.controller('LoggedController', ['$scope', 'Auth', 'currentAuth', '$firebaseArray', 'userService', '$pageArray', '$firebaseObject', function ($scope, Auth, currentAuth, $firebaseArray, userService, $pageArray, $firebaseObject) {
    //    console.info("currentAuth: ", currentAuth);

    $scope.showNewOccurrence = false;
    $scope.newOccurrenceForm = {};
    $scope.occurrences = [];
    $scope.showOccurrenceCreationSuccess = false;
    $scope.showOccurrenceCreationFailure = false;

    var ref = new Firebase("https://fiery-fire-206.firebaseio.com/occurrences");
    // Antigo método de buscar as ocorrências, sem paginação
    //    $scope.occurrences = $firebaseArray(ref);
    //    var query = ref.orderByChild("timestamp").limitToLast(2).on('child_added', function (snapshot) {
    //        $scope.$apply(function () {
    //            $scope.occurrences.push(snapshot.val());
    //        });
    //    });

    $scope.occurrences = $pageArray(ref, 'timestamp');

    $scope.createOccurrence = function () {
        var puss = ref.push({
            timestamp: Firebase.ServerValue.TIMESTAMP,
            message: $scope.newOccurrenceForm.inputMessage,
            author: currentAuth.auth.uid
        }, function (error) {
            if (error) {
                console.error('Error saving: ', error);
                $scope.$apply(function () {
                    $scope.showOccurrenceCreationSuccess = false;
                    $scope.showOccurrenceCreationFailure = true;
                });
            } else {
                $scope.$apply(function () {
                    $scope.showOccurrenceCreationSuccess = true;
                    $scope.showOccurrenceCreationFailure = false;
                    $scope.showNewOccurrence = false;
                });
            }
        });
        // Se salvou corretamente, deve inverter o timestamp para negativo
        if (puss) {
            var timestamp = null;
            puss.child('timestamp').on('value', function (ss) {
                console.log('timestamp: ', ss.val());
                timestamp = ss.val();
            });
            puss.update({
                timestamp: (timestamp * -1)
            });
        }
    };

    $scope.getUser = function (userId) {
        return userService.findByUserId(userId);
    }

    $scope.nextOccurrences = function () {
        $scope.occurrences.page.next();
        $scope.showOccurrenceCreationSuccess = false;
        $scope.showOccurrenceCreationFailure = false;
    }

    $scope.previousOccurrences = function () {
        $scope.occurrences.page.prev();
        $scope.showOccurrenceCreationSuccess = false;
        $scope.showOccurrenceCreationFailure = false;
    }

    $scope.hasNextPage = function () {
        return $scope.occurrences.page.hasNext();
    }

    $scope.hasPreviousPage = function () {
        return $scope.occurrences.page.hasPrev();
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
