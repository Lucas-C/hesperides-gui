var Test = {};
Test.prepareHttpBackendStub = function($httpBackend) {
								
				var whenGet = $httpBackend.whenGET(/partials\/.*/);
				
				if(!(typeof whenGet.passThrough == 'undefined')){
					whenGet.passThrough();
				}
								
				$httpBackend.whenGET('/rest/instances').
					respond([
						{
							"id": 1,
							"type": "WAS",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"composant": "WDI",
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
										"hosts": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										},
										"instance_id": "6"
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
							"composant": "WDI",
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
										"hosts": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										},
										"instance_id": "6"
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
							"composant": "WDI",
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
										"hosts": "TUX1",
										"gateway": "joltpoolSN",
										"pool": {
											"min": 1,
											"max": 5
										},
										"instance_id": "6"
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
					]);
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

