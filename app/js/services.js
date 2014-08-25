'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
    value('version', '0.1');
	
hesperidesServices.factory('Platform', ['$http', function ($http) {

	return {
		get: function(application, version) {
			return $http.get('rest/properties/search/namespace/properties.*'+application+'*.'+'*'+version+'*').then(function(response) {
				return _(response.data).map(function(properties){
					var splittedNamespace = properties.hesnamespace.split(".");
					return splittedNamespace[3];
				}).groupBy().keys().value();
			});
		}
	}

}]);	
	
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
					return {hesnamespace: properties_namespace, key_value_properties: [], iterable_properties: []};
				}).then(function(properties){
					/* Detect properties that are/are not in the model */
					_.each(properties.key_value_properties, function(property){
						property.inModel = _.some(model.key_value_properties, function(modelProp){
							return modelProp.name === property.name;
						});					
					});
					
					_.each(properties.iterable_properties, function(property){
						property.inModel = _.some(model.iterable_properties, function(modelProp){
							return modelProp.name === property.name;
						});					
					});
					
					/* Add properties only in the model */
					_.chain(model.key_value_properties)
					 .filter(function(model){
						return !_.some(properties.key_value_properties, function(property){
							return property.name === model.name;
						});
					}).each(function(model){
						properties.key_value_properties.push({name: model.name, comment: model.comment, value: "", inModel: true});
					});
					
					_.chain(model.iterable_properties)
					 .filter(function(model){
						return !_.some(properties.iterable_properties, function(property){
							return property.name === model.name;
						});
					}).each(function(model){
						properties.iterable_properties.push({name: model.name, comment: model.comment, inModel: true, fields: model.fields});
					});
				
					return properties;
				});
			});
		},
		create: function(properties) {
			return $http.post('rest/properties/'+properties.hesnamespace, properties).then(function(response) { return response.data });
		},
		update: function(properties) {
			return $http.put('rest/properties/'+properties.hesnamespace, properties).then(function(response) { return response.data });
		}
    }

}]);

hesperidesServices.factory('Context', ['$http', function ($http) {

    return {
		getModel: function(namespace) {
			return $http.get('rest/contexts/model/'+namespace).then(function(response){ return response.data; });
		},
		get: function(namespace, name) {
			return this.getModel(namespace).then(function(model) {
				return $http.get('rest/contexts/'+namespace+'/'+name).then(function(response) {
					return response.data;
				}, function(error) {
					return {hesnamespace: namespace, name: name, key_values: []}; 
				}).then(function(context) {
					/* Mark key/values that are in the model */
					_.each(context.key_values, function(key_value){
						key_value.inModel = _.some(model.key_values, function(model_key_value){
							return model_key_value.name === key_value.name;
						});					
					});
					
					/* Add key_values that are only in the model */
					_(model.key_values).filter(function(model_key_value){
						return !_.some(context.key_values, function(key_value){
							return key_value.name === model_key_value.name;
						});
					}).each(function(model_key_value){
						context.key_values.push({name: model_key_value.name, comment: model_key_value.comment, value: "", inModel: true});
					});
					
					return context;
				});
			});
		},
		create: function(context) {
			return $http.post('rest/contexts/'+context.hesnamespace+'/'+context.name, context).then(function(response) { return response.data });
		},
		update: function(context) {
			return $http.put('rest/contexts/'+context.hesnamespace+'/'+context.name, context).then(function(response) { return response.data });
		}
	};

}]);

hesperidesServices.factory('Template', ['$resource', function ($resource) {

	var Template = $resource('rest/templates/:namespace/:name', {namespace: '@hesnamespace', name: '@name'}, {
        update: {method: 'PUT'},
		create: {method: 'POST'},
		all: {method: 'GET', url: 'rest/templates/:namespace', isArray: true},
    });
		
	return Template;

}]);

hesperidesServices.factory('Application', ['$resource', '$http', function ($resource, $http) {

    var Application = $resource('rest/applications/:name/:version', {name: '@name', version: '@version'}, {
        update: {method: 'PUT'},
		create: {method: 'POST'}
    });
	
	Application.like = function(name) {
		return $http.get('rest/applications/search/*'+name+'*').then(function(response) {
			return _.chain(response.data)
					.groupBy("name")
					.sortBy("version")
					.value();
		});
	};
	
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
