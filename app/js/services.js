'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
    value('version', '0.1');
	
hesperidesServices.factory('Properties', ['$resource', function ($resource) {

    var Properties  = $resource('rest/properties/:application/:version/:platform/:template_name', {version: '@version', application: '@application', platform: '@platform', template_name: '@template_name'}, {
		getModel: {method: 'GET', url: 'rest/properties/model/:namespace'}
    });
		
	return Properties;

}]);

hesperidesServices.factory('Template', ['$resource', function ($resource) {

    var Template = $resource('rest/templates/:namespace/:name', {namespace: '@hesnamespace', name: '@name'}, {
        update: {method: 'PUT'},
		create: {method: 'POST'},
		all: {method: 'GET', url: 'rest/templates/:namespace', isArray: true},
    });
		
	return Template;

}]);

hesperidesServices.factory('Application', ['$resource', function ($resource) {

    var Application = $resource('rest/applications/:name/:version', {name: '@name', version: '@version'}, {
        update: {method: 'PUT'},
		create: {method: 'POST'}
    });
	
	return Application;

}]);

hesperidesServices.factory('Technos', ['$http', function ($http) {
	
	var Techno = function(namespace) {
		var namespaceTokens = namespace.split(".");
		this.name = namespaceTokens[1];
		this.version = namespaceTokens[2];
		this.namespace = namespace;
		this.title = this.name+", version "+this.version;
	};

    return {
		all: function () {
			return $http.get('rest/templates/search/namespace/technos').then(function(response) {
				return _.chain(response.data)
						.groupBy("namespace")
						.map(function(templateList) { 
							var template = templateList[0];
							return new Techno(template.namespace);
						})
						.groupBy("name")
						.sortBy("version")
						.value();
			});
		},
		like: function (name) {
			return $http.get('rest/templates/search/namespace/technos.*'+name+'*').then(function(response) {
				return _.chain(response.data)
						.groupBy("namespace")
						.map(function(templateList) { 
							var template = templateList[0];
							return new Techno(template.namespace);
						})
						.groupBy("name")
						.sortBy("version")
						.value();
			});
		}
	
	}

}]);

hesperidesServices.factory('FileGenerator', ['$http', function ($http) {

	return {
		generate: function (application, version, platform, template_name) {
			return $http.get('rest/properties/generated/'+version+'/'+application+'/'+platform+'/'+template_name).then(function(response) {
				return response.data;
			}, function(error) {
				alert('Impossible de générer le template\nStatus Code : '+error.status+" "+error.statusText);
				return '';
			});
		}
	
	}
	
}]);

hesperidesServices.factory('Search', ['$http', 'Instance', function ($http, Instance) {

    return {
        instances: function (application, component) {
            return $http.get('rest/search?application=' + application + '&platform=' + component).then(function (response) {
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
            return $http.get('rest/search/fulltext/applicationplatform/' + keywords).then(function (response) {
                return response.data;
            }, function(response) {
				alert('Probleme du serveur\nStatus Code : '+response.status+" "+response.statusText);
			});
        },
        fulltextHostname: function (hostname) {
            return $http.get('rest/search/fulltext/hostname/' + hostname).then(function (response) {
                return response.data;
            }, function(response) {
				alert('Probleme du serveur\nStatus Code : '+response.status+" "+response.statusText);
			});
        }
    };

}]);
