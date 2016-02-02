app.factory('userService', ['$firebaseObject', function ($firebaseObject) {
    console.info('userService start');

    var ref = new Firebase('https://fiery-fire-206.firebaseio.com/users');

    var findByUserId = function (userId) {
        //        var uid = ref.child('-K9RxdfnODg5pIuDXOIl').child(userId).child('fullname');
        //        console.info('toString(): ', uid.toString());
        //        uid.on('value', function (snapshot) {
        //            console.log('on: ', snapshot.val());
        //            return snapshot.val();
        //        });



    };

    var save = function (user) {
        console.info('userService.save: ', user);
        ref.push(user);
    };

    var register = function (userId, fullname) {
        var obj = {};
        obj[userId] = {
            fullname: fullname
        };

        save(obj);
    };

    return {
        save: save,
        register: register,
        findByUserId: findByUserId
    };
}]);
