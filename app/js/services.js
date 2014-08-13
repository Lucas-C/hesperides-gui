'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
    value('version', '0.1');
	
hesperidesServices.factory('Properties', ['$http', function ($http) {

    return {
		getModel: function(namespaces) {
			var namespaces_as_string = _.isArray(namespaces) ? namespaces.join(",")  : namespaces;
			return $http.get('rest/properties/model/'+namespaces_as_string).then(function(response){
				return response.data;
			});
		},
		getProperties: function(properties_namespace, model_namespaces) {
			return this.getModel(model_namespaces).then(function(model){
				return $http.get('rest/properties/'+properties_namespace).then(function(response){
					return response.data;
				}, function(error) {
					return {namespace: properties_namespace, keyValueProperties: [], iterableProperties: []};
				}).then(function(properties){
					/* Detect properties that are/are not in the model */
					_.each(properties.keyValueProperties, function(property){
						property.inModel = _.some(model.keyValueProperties, function(modelProp){
							return modelProp.name === property.name;
						});					
					});
					
					_.each(properties.iterableProperties, function(property){
						property.inModel = _.some(model.iterableProperties, function(modelProp){
							return modelProp.name === property.name;
						});					
					});
					
					/* Add properties only in the model */
					_.chain(model.keyValueProperties)
					 .filter(function(model){
						return !_.some(properties.keyValueProperties, function(property){
							return property.name === model.name;
						});
					}).each(function(model){
						properties.keyValueProperties.push({name: model.name, comment: model.comment, value: "", inModel: true});
					});
					
					_.chain(model.iterableProperties)
					 .filter(function(model){
						return !_.some(properties.keyValueProperties, function(property){
							return property.name === model.name;
						});
					}).each(function(model){
						properties.iterableProperties.push({name: model.name, comment: model.comment, value: "", inModel: true, fields: model.fields});
					});
				
					return properties;
				});
			})
			
		}
    }

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
