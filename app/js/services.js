'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
    value('version', '0.1');

hesperidesServices.factory('Instance', ['$resource', function ($resource) {

    return $resource('http://localhost:8080/rest/instances/:id', {id: '@id'}, {
        all: {method: 'GET', params: {id: ''}, isArray: true},
        put: {method: 'PUT'}
    });

}]);


hesperidesServices.factory('Search', ['$http', 'Instance', function ($http, Instance) {

    return {
        instances: function (application, component) {
            return $http.get('http://localhost:8080/rest/search?application=' + application + '&platform=' + component).then(function (response) {
                var instances = [];
                for (var i = 0; i < response.data.length; i++) {
                    var instance = new Instance(response.data[i]);
                    instances.push(instance);
                }
                return instances;
            }, function(response) {
				alert('Impossible de recuperer les instances\nStatus Code : '+response.status+" "+response.statusText);
			});
        },
        fulltext: function (keywords) {
            return $http.get('http://localhost:8080/rest/search/fulltext/appinst/' + keywords).then(function (response) {
                return response.data;
            }, function(response) {
				alert('Probleme du serveur\nStatus Code : '+response.status+" "+response.statusText);
			});
        },
        fulltextHostname: function (hostname) {
            return $http.get('http://localhost:8080/rest/search/fulltext/hostname/' + hostname).then(function (response) {
                return response.data;
            }, function(response) {
				alert('Probleme du serveur\nStatus Code : '+response.status+" "+response.statusText);
			});
        }
    };

}]);

hesperidesServices.factory('ENC', ['$http', '$resource', function ($http, $resource) {
    return {
        get: function (hostname) {
            return $http.get('http://localhost:8080/rest/enc/' + hostname).then(function (response) {
                return response.data;
            })
        },
        save: function (hostname, enc) {
            return $http({method: 'POST', url: 'http://localhost:8080/rest/enc/' + hostname, data: enc}).then(function (response) {
                return response.data;
            })
        }
    }

}]);
