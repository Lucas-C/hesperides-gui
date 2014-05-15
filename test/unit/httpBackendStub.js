var Test = {};
Test.wdiInstances = [
						{
							"id": 1,
							"type": "WAS",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"user": "vmomiwu5",
							"home": "/appl/vmomiwu5/GST",
							"puppet_template_path": "miw/miw/v1",
							"name": "VMODENU51GSTMIW",
							"hostname": "DENOEL",
							"ip": "10.98.208.67",
							"bins": [
								{
									"name": "TOMCAT",
									"version": "7.0.37",
									"home": "/export/product/tomcat/product/7.0.37"
								},
								{
									"name": "JDK",
									"version": "1.7u15",
									"home": "/usr/java/vsc_jdk_1.7u15_32bit",
								}
							],
							"modules": [
								{
									"name": "miui",
									"war": "mi-ui.war",
									"context": "miwUi"
								},
								{
									"name": "miIolog",
									"war": "mi-admin-iolog.war",
									"context": "miwIolog"
								}
							],
							"external_links": {
								"jdbc": [
									{
										"name": "wdi/ds",
										"schema": "uiwivmo1",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"jms": [
									{
										"name": "ConnectionFactoryMetrix",
										"type": "AMQ",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX",
									}
								],
								"jolt": [
									{
										"host": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"was": [
									{
										"name": "ESB",
										"instances": ["VMODENU51MIW"]
									},
								]
							},
							"jvm_opts": {
								"tuning": ["-Xmsx=1024"],
								"system": ["-Dsyslog=localhost:3128"]
							},
							"ports": [
								{
									"name": "HTTP",
									"number": 55010
								},
								{
									"name": "JMX",
									"number": 55011
								}
							]
						},
						{
							"id": 2,
							"type": "WAS",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"user": "vmomiwu5",
							"home": "/appl/vmomiwu5/GST",
							"puppet_template_path": "miw/miw/v1",
							"name": "VMODENU52GSTMIW",
							"hostname": "DENOEL",
							"ip": "10.98.208.67",
							"bins": [
								{
									"name": "TOMCAT",
									"version": "7.0.37",
									"home": "/export/product/tomcat/product/7.0.37"
								},
								{
									"name": "JDK",
									"version": "1.7u15",
									"home": "/usr/java/vsc_jdk_1.7u15_32bit",
								}
							],
							"modules": [
								{
									"name": "miui",
									"war": "mi-ui.war",
									"context": "miwUi"
								},
								{
									"name": "miIolog",
									"war": "mi-admin-iolog.war",
									"context": "miwIolog"
								}
							],
							"external_links": {
								"jdbc": [
									{
										"name": "wdi/ds",
										"schema": "uiwivmo1",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"jms": [
									{
										"name": "ConnectionFactoryMetrix",
										"type": "AMQ",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX",
									}
								],
								"jolt": [
									{
										"host": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"was": [
									{
										"name": "ESB",
										"instances": ["VMODENU51MIW"]
									},
								]
							},
							"jvm_opts": {
								"tuning": ["-Xmsx=1024"],
								"system": ["-Dsyslog=localhost:3128"]
							},
							"ports": [
								{
									"name": "HTTP",
									"number": 55010
								},
								{
									"name": "JMX",
									"number": 55011
								}
							]
						},
						{
							"id": 3,
							"type": "WAS",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"user": "vmomiwu5",
							"home": "/appl/vmomiwu5/GST",
							"puppet_template_path": "miw/miw/v1",
							"name": "VMODENU53GSTMIW",
							"hostname": "DENOEL",
							"ip": "10.98.208.67",
							"bins": [
								{
									"name": "TOMCAT",
									"version": "7.0.37",
									"home": "/export/product/tomcat/product/7.0.37"
								},
								{
									"name": "JDK",
									"version": "1.7u15",
									"home": "/usr/java/vsc_jdk_1.7u15_32bit",
								}
							],
							"modules": [
								{
									"name": "miui",
									"war": "mi-ui.war",
									"context": "miwUi"
								},
								{
									"name": "miIolog",
									"war": "mi-admin-iolog.war",
									"context": "miwIolog"
								}
							],
							"external_links": {
								"jdbc": [
									{
										"name": "wdi/ds",
										"schema": "uiwivmo1",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"jms": [
									{
										"name": "ConnectionFactoryMetrix",
										"type": "AMQ",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX",
									}
								],
								"jolt": [
									{
										"host": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"was": [
									{
										"name": "ESB",
										"instances": ["VMODENU51MIW"]
									},
								]
							},
							"jvm_opts": {
								"tuning": ["-Xmsx=1024"],
								"system": ["-Dsyslog=localhost:3128"]
							},
							"ports": [
								{
									"name": "HTTP",
									"number": 55010
								},
								{
									"name": "JMX",
									"number": 55011
								}
							]
						}
					];
Test.singleInstance = {

							"id": 1,
							"type": "WAS",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"user": "vmomiwu5",
							"home": "/appl/vmomiwu5/GST",
							"puppet_template_path": "miw/miw/v1",
							"name": "VMODENU51GSTMIW",
							"hostname": "DENOEL",
							"ip": "10.98.208.67",
							"bins": [
								{
									"name": "TOMCAT",
									"version": "7.0.37",
									"home": "/export/product/tomcat/product/7.0.37"
								},
								{
									"name": "JDK",
									"version": "1.7u15",
									"home": "/usr/java/vsc_jdk_1.7u15_32bit",
								}
							],
							"modules": [
								{
									"name": "miui",
									"war": "mi-ui.war",
									"context": "miwUi"
								},
								{
									"name": "miIolog",
									"war": "mi-admin-iolog.war",
									"context": "miwIolog"
								}
							],
							"external_links": {
								"jdbc": [
									{
										"name": "wdi/ds",
										"schema": "uiwivmo1",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"jms": [
									{
										"name": "ConnectionFactoryMetrix",
										"type": "AMQ",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX",
									}
								],
								"jolt": [
									{
										"host": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										}
									}
								],
								"was": [
									{
										"name": "ESB",
										"instances": ["VMODENU51MIW", "VMODENU52MIW"]
									},
								]
							},
							"jvm_opts": {
								"tuning": ["-Xms=1024", "-Xmx=1024"],
								"system": ["-Dsyslog=localhost:3128"]
							},
							"ports": [
								{
									"name": "HTTP",
									"number": 55010
								},
								{
									"name": "JMX",
									"number": 55011
								}
							]
}

Test.prepareHttpBackendStub = function($httpBackend) {

				var whenGetPartials = $httpBackend.whenGET(/partials\/.*/);
				
				//En TU, il n'y a pas le decorateur angular.mock.e2e.$httpBackendDecorator
				//donc utiliser cette methode provoquerait une erreur
				if(!(typeof whenGetPartials.passThrough == 'undefined')){
					whenGetPartials.passThrough();
				}
				
				var whenGetHTML = $httpBackend.whenGET(/.*\.html/);
				
				//En TU, il n'y a pas le decorateur angular.mock.e2e.$httpBackendDecorator
				//donc utiliser cette methode provoquerait une erreur
				if(!(typeof whenGetHTML.passThrough == 'undefined')){
					whenGetHTML.passThrough();
				}
								
				$httpBackend.whenGET('/rest/instances/1').
					respond(function(){ return [200, Test.singleInstance, {}]});
					
				$httpBackend.whenGET('/search?application=WDI&platform=INT1').
					respond(function(){ return [200, Test.wdiInstances, {}]});
								
				$httpBackend.whenGET('/rest/instances').
					respond(Test.wdiInstances);
					
				$httpBackend.whenPOST('/rest/instances/1', Test.singleInstance).
					respond(function(){ return [200, Test.singleInstance, {}]});
					
				var postData = null;	
				$httpBackend.whenPOST(/\/rest\/instances\/*/, function(data){postData = data; return true;}).
					respond(function(){ return [200, postData, {}]});
				
				var putData = null;
				$httpBackend.whenPUT('/rest/instances', function(data){putData = data; return true;}).
					respond(function(){ 
						var newInstance = JSON.parse(putData);
						newInstance.id = 999;
						return [200, JSON.stringify(newInstance), {}]
					});	
					
				$httpBackend.whenDELETE(/\/rest\/instances\/*/).respond(function(){ return [200, '', {}]});
				
				return $httpBackend;
			};

(function(ng) {

	if(!document.URL.match(/\?nobackend$/)) {
		return;
	}
	
	console.log('========== UTILISATION DU MOCK HTTP ==========');
	initializeStubbedBackend();
	
	function initializeStubbedBackend() {
		ng.module('Hesperides')
			.config(function($provide) {
				$provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
			})
			.run(Test.prepareHttpBackendStub);
	}

})(angular);

