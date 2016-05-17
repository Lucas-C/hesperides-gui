/**
 * Created by tidiane_sidibe on 17/05/2016.
 *
 * This contains stuff for user authentication.
 */

var userModule = angular.module("hesperides.user", [])

/**
 * The user entity
 */
.factory ("User", function (){

    var User = function (data){
        var me = this;

        // The user name
        this.username = data.username;

        // Indicates if the user is an Ops or not.
        // Used for Ops dedicated actions.
        this.isProdUser = data.prodUser;

    };

    return User;
 })

/**
 * The authentication service for users
 */
 .service("UserService", ["$http", "User", function ($http, User){
    return {
        authenticate : function (){
            return $http.get ('/rest/users/auth').then (function (response){
                return new User(response.data);
            }, function (error){
                throw error;
            })
        }
    }
 }]);


/**
  * This is the authenticated user object.
  * It's populated at the load of the file and share all over the app as a global variable.
  */
 var hesperidesAutheticatedUser = null;

 /**
  * Authenticate the user function
  */
 var auth = function (){
    var UserService = angular.injector(['ng', 'hesperides.user']).get("UserService");
    UserService.authenticate().then(function (user){
        hesperidesAutheticatedUser = user;
    });
 };

setTimeout (function (){
    auth();
}, 1000)

