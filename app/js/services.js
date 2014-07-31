'use strict';

var hesperidesServices = angular.module('Hesperides.services', ['ngResource']).
    value('version', '0.1');
	
var Scope = function() {
		this.keyValueProperties = [];
		this.iterableProperties = [];
		
		this.addKeyValueProperties = function(keyValueProps) {
			this.keyValueProperties.push(keyValueProps);
		};
		
		this.addIterableProperties = function(iterableProps) {
			this.iterableProperties.push(iterableProps);
		};
		
};

var EvaluatedField = function(title, fields){
	this.title = title;
	this.fields = fields;
};	

hesperidesServices.factory('Instance', ['$resource', function ($resource) {

    return $resource('rest/instances/:id', {id: '@id'}, {
        put: {method: 'PUT'}
    });

}]);

hesperidesServices.factory('Properties', ['$resource', function ($resource) {

    var Properties  = $resource('rest/properties/:application/:version/:platform/:template_name', {version: '@version', application: '@application', platform: '@platform', template_name: '@template_name'}, {
        create: {method: 'PUT'},
		update: {method: 'POST'}
    });
	
	Properties.prototype.scope = new Scope();
	
	Properties.prototype.hasProperties = function(name) {
		return _.some(this.scope.keyValueProperties, function(kvp) { return kvp.name === name; });
	};

	Properties.prototype.getIterableProperty = function(name, fields) {
		return _.chain(this.scope.iterableProperties).filter(function(ip) { return ip.name === name; })
											  .find(function(ip) {
												/* Compare les noms des fields */
												return ip.fields.length === fields.length && _.intersection(_.pluck(ip.fields, 'name'),_.pluck(fields,'name')).length === fields.length;
											}).value(); 
	};
	
	Properties.prototype.getKeyValueProperty = function(name) {
		return _.find(this.scope.keyValueProperties, function(kvp) { return kvp.name === name; });
	};
	
	Properties.prototype.rebuildScopeWithTemplate = function(template) {
		var self = this;
		//Merge avec la description du template
		//Algo basique :
		//Le template a tjs raison
		//pour les keyValueProperties -> ne garder que celles qui ont le m�me nom, ajouter les manquantes
		//pour les iterableProperties -> ne garder que celles qui ont le m�me nom+m�me fields, ajouter les manquantes
		var newScope = new Scope();
		/* key value properties */
		template.getKeyValueProperties().forEach(function(kvpFromTemplate){
			if(self.hasProperties(kvpFromTemplate.name)){
				var selfProp = self.getKeyValueProperty(kvpFromTemplate.name);
				/* In case template was updated, change the comment */
				selfProp.comment = kvpFromTemplate.comment;
				newScope.addKeyValueProperties(self.getKeyValueProperty(kvpFromTemplate.name));
			} else {
				newScope.addKeyValueProperties(kvpFromTemplate);
			}
		});
		
		/* Iterable Properties */
		template.getIterableProperties().forEach(function(ipFromTemplate){
			var ip = self.getIterableProperty(ipFromTemplate.name, ipFromTemplate.fields);
			if(ip) {
				/* In case template was updated, change the comment */
				ip.comment = ipFromTemplate.comment;
				newScope.addIterableProperties(ip);
			}
			else newScope.addIterableProperties(ipFromTemplate);
		});
		
		this.scope = newScope;
	};
		
	return Properties;

}]);

hesperidesServices.factory('Template', ['$resource', function ($resource) {

    var Template = $resource('rest/templates/:application/:version/:name', {version: '@version', application: '@application', name: '@name'}, {
        create: {method: 'PUT'},
		update: {method: 'POST'}
    });
	
	Template.prototype.scope = new Scope();
	
	Template.prototype.getKeyValueProperties = function() {
		if(this.scope) return this.scope.keyValueProperties;
	};
	
	Template.prototype.getIterableProperties = function() {
		return this.scope.iterableProperties;
	};
	
	return Template;

}]);

hesperidesServices.factory('Templates', ['$resource', function ($resource) {

    var Templates = $resource('rest/templates/:application/:version', {version: '@version', application: '@application'}, {
		get: {method: 'GET', isArray: true}
	});
	
	/* JUST FOR DOC */
	var TemplateEntry = function() {
		this.filename;
		this.location;
		this.id;
	}
	
	return Templates;

}]);

hesperidesServices.factory('FileGenerator', ['$http', function ($http) {

	return {
		generate: function (application, version, platform, template_name) {
			return $http.get('rest/properties/generated/'+version+'/'+application+'/'+platform+'/'+template_name).then(function(response) {
				return response.data;
			}, function(error) {
				alert('Impossible de g�n�rer le template\nStatus Code : '+error.status+" "+error.statusText);
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

hesperidesServices.factory('ENC', ['$http', '$resource', function ($http, $resource) {
    return {
        get: function (hostname) {
            return $http.get('rest/enc/' + hostname).then(function (response) {
                return response.data;
            })
        },
        save: function (hostname, enc) {
            return $http({method: 'POST', url: 'rest/enc/' + hostname, data: enc}).then(function (response) {
                return response.data;
            })
        }
    }

}]);
