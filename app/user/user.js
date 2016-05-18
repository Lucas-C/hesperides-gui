/**
 * Created by tidiane_sidibe on 17/05/2016.
 *
 * This contains stuff for user authentication.
 */

angular.module("hesperides.user", [])

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
 * The authentication service for users.
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
 * This is an authentication class for Hesperides.
 * It uses the angular 'UserService' for http request.
 * It's a kind of singleton implementation in pure JavaScript.
 */
var HesperidesAuthenticatorClass = function (){
    // The user authenticated
    this.user = null;

    // Angular UserService.
    this.UserService = angular.injector(['ng', 'hesperides.user']).get("UserService");
}

/**
 * Methods of the class
 */
HesperidesAuthenticatorClass.prototype = {

    /**
     * Authenticates the user and save the authenticated user.
     */
    auth: function (){
        var _this = this;

        if (_this.user == null ){
            _this.UserService.authenticate().then(function (user){
                _this.user = user;
                return _this.user;
            });
        }else{
            return _this.user;
        }
    }
};

// Creating a global instance
// So it's shared in all Hesperides.
var HesperidesAuthenticator = new HesperidesAuthenticatorClass();

// try to authenticate immediately
HesperidesAuthenticator.auth();