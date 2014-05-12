'use strict';

var scope, ctrl, $http;

var setupGlobal = function(ctrlId, routeParams){
	//Matcher pour ne comparer que les champs d'un objet	
	beforeEach(function(){
			this.addMatchers({
				toEqualData: function(expected) {
				return angular.equals(this.actual, expected);
			}
		});
	});
	
	beforeEach(module('ngRoute'));
	beforeEach(module('Hesperides.controllers'));
	beforeEach(module('Hesperides.services'));
	beforeEach(module('Hesperides.filters'));
	beforeEach(module('Hesperides.directives'));
	
	
    var ctrl;	
	beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
			$http = Test.prepareHttpBackendStub(_$httpBackend_);
			scope = $rootScope.$new();
			
			for (var attrname in routeParams) { $routeParams[attrname] = routeParams[attrname]; }
						
			ctrl = $controller(ctrlId, {$scope:scope});
			
	}));
	
	return ctrl;
}

describe('controllers', function(){

  describe('InstancesCtrl' , function(){
	
	setupGlobal('InstancesCtrl', {});
	
	it('should return all instances from elastic search', inject(function($controller) {
		$http.flush();
		
		expect(scope.instances).toBeDefined();
		expect(scope.instances.length).toBe(3);
		expect(scope.instances).toEqualData(
			[
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
			]
		);
		
	  }));

  });
  
  describe('InstanceCtrl', function(){
	
	setupGlobal('InstanceCtrl', {id: '1'});
	
	it('should return the instance matching the id', inject(function($controller) {
		$http.flush();	
			
		expect(scope.instance).toBeDefined();
		expect(scope.instance).toEqualData(
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
		);
			
	}));
	
	it('should call the post rest service when saving an existing instance', inject(function($controller) {
		$http.flush();
		expect(scope.Save).toBeDefined();
				
		scope.Save();
		
		$http.flush();	
		
		expect(scope.instance).toEqualData(
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
		);
	
	
	}));
	
	it('should add an empty bin with Add_bin', inject(function($controller) {
		$http.flush();
		
		scope.Add_bin();
		
		expect(scope.instance.bins).toEqualData(
			[
								{
									"name": "TOMCAT",
									"version": "7.0.37",
									"home": "/export/product/tomcat/product/7.0.37"
								},
								{
									"name": "JDK",
									"version": "1.7u15",
									"home": "/usr/java/vsc_jdk_1.7u15_32bit",
								},
								{	
								}
							]
		);
	
	
	}));
	
	it('should add an empty module with Add_module', inject(function($controller) {
		$http.flush();
		
		scope.Add_module();
		
		expect(scope.instance.modules).toEqualData(
			[
								{
									"name": "miui",
									"war": "mi-ui.war",
									"context": "miwUi"
								},
								{
									"name": "miIolog",
									"war": "mi-admin-iolog.war",
									"context": "miwIolog"
								}, {}
							]
		);
	
	
	}));
	
	it('should add an empty port with Add_port', inject(function($controller) {
		$http.flush();
		
		scope.Add_port();
		
		expect(scope.instance.ports).toEqualData(
			[
								{
									"name": "HTTP",
									"number": 55010
								},
								{
									"name": "JMX",
									"number": 55011
								},
								{}
							]
		);
	
	
	}));
	
	it('should add an empty jdbc with Add_jdbc', inject(function($controller) {
		$http.flush();
		
		scope.Add_jdbc();
		
		expect(scope.instance.external_links.jdbc).toEqualData(
			[
									{
										"name": "wdi/ds",
										"schema": "uiwivmo1",
										"pool": {
											"min": 1,
											"max": 5
										}
									},{}
								]
		);
	
	
	}));
	
	it('should add an empty jms with Add_jms', inject(function($controller) {
		$http.flush();
		
		scope.Add_jms();
		
		expect(scope.instance.external_links.jms).toEqualData(
			[
									{
										"name": "ConnectionFactoryMetrix",
										"type": "AMQ",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX",
									},{}
								]
		);
	
	
	}));
	
	it('should add an empty jolt with Add_jolt', inject(function($controller) {
		$http.flush();
		
		scope.Add_jolt();
		
		expect(scope.instance.external_links.jolt).toEqualData(
			[
									{
										"host": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										}
									},{}
								]
		);
	
	
	}));
	
	it('should add an empty was with Add_was', inject(function($controller) {
		$http.flush();
		
		scope.Add_was();
		
		expect(scope.instance.external_links.was).toEqualData(
			[
									{
										"name": "ESB",
										"instances": ["VMODENU51MIW", "VMODENU52MIW"]
									},{}
								]
		);
	
	
	}));
	  
	  
	 it('should delete bin', inject(function($controller) {
		$http.flush();
		
		scope.Del_bin(1);
		
		expect(scope.instance.bins).toEqualData(
			[
								{
									"name": "TOMCAT",
									"version": "7.0.37",
									"home": "/export/product/tomcat/product/7.0.37"
								}
							]
		);
	
	
	}));
	
	it('should delete module', inject(function($controller) {
		$http.flush();
		
		scope.Del_module(1);
		
		expect(scope.instance.modules).toEqualData(
			[
								{
									"name": "miui",
									"war": "mi-ui.war",
									"context": "miwUi"
								}
							]
		);
	
	
	}));
	
	it('should delete port', inject(function($controller) {
		$http.flush();
		
		scope.Del_port(1);
		
		expect(scope.instance.ports).toEqualData(
			[
								{
									"name": "HTTP",
									"number": 55010
								}
							]
		);
	
	
	}));
	
	it('should delete jdbc', inject(function($controller) {
		$http.flush();
		
		scope.Del_jdbc(0);
		
		expect(scope.instance.external_links.jdbc).toEqualData(
			[
								]
		);
	
	
	}));
	
	it('should delete jms', inject(function($controller) {
		$http.flush();
		
		scope.Del_jms(0);
		
		expect(scope.instance.external_links.jms).toEqualData(
			[
								]
		);
	
	
	}));
	
	it('should delete jolt', inject(function($controller) {
		$http.flush();
		
		scope.Del_jolt(0);
		
		expect(scope.instance.external_links.jolt).toEqualData(
			[							
								]
		);
	
	
	}));
	
	it('should delete was', inject(function($controller) {
		$http.flush();
		
		scope.Del_was(0);
		
		expect(scope.instance.external_links.was).toEqualData(
			[
								]
		);
	
	
	}));
	   
  });
  
  describe('InstanceCtrl', function() {
    
	setupGlobal('InstanceCtrl');
	
	it('should show an empty instance if no id is given', inject(function($controller) {
		$http.verifyNoOutstandingRequest();		
		expect(scope.instance).toBeDefined();
		expect(scope.instance).toEqualData({});
			
	}));
	
	it('should call the put rest service when saving an existing instance and instance has a new id', inject(function($controller) {
		$http.verifyNoOutstandingRequest();
		expect(scope.Save).toBeDefined();
		
		//Simulate user putting infos
		scope.instance = Test.singleInstance;
		scope.instance.id = null;
		
		scope.Save();
		
		$http.flush();	
		
		expect(scope.instance).toEqualData(
			{
							"id": 999,
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
		);
	
	
	}));
  
  });
  
  
  
});
