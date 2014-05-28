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
							"links": [
								{
									"type": "JDBC",
									"key": {
										"name": "biwdi09",
										"schema": "uiwivmo1"
									},
									"configuration": {
										"name": "wdi/ds",
										"pool_min": 1,
										"pool_max": 5
									}
								},
								{
									"type": "JMS",
									"key": {
										"name": "ConnectionFactoryMetrix",
										"instance": "VMOCLOU51AMQMTX"
									},
									"configuration": {
										"type": "AMQ",
										"amq_type": "MTX",
									}
								},
								{
									"type": "JOLT",
									"key": {
										"host": "TUX1",
										"gateway": "joltpoolSN"
									},
									"configuration": {
										"pool_min": 1,
										"pool_max": 2
									}
								},
								{
									"type": "WAS",
									"key": {
										"name": "ESB",
										"instance": "VMODENU51MIW"
									}
								}
							],
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
							"links": [
								{
									"type": "JDBC",
									"key": {
										"name": "biwdi09",
										"schema": "uiwivmo1"
									},
									"configuration": {
										"name": "wdi/ds",
										"pool_min": 1,
										"pool_max": 5
									}
								},
								{
									"type": "JMS",
									"key": {
										"name": "ConnectionFactoryMetrix",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX"
									},
									"configuration": {
										"type": "AMQ"
									}
								},
								{
									"type": "JOLT",
									"key": {
										"host": "TUX1",
										"gateway": "joltpoolSN"
									},
									"configuration": {
										"pool_min": 1,
										"pool_max": 2
									}
								},
								{
									"type": "WAS",
									"key": {
										"name": "ESB",
										"instance": "VMODENU51MIW"
									}
								}
							],
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
							"links": [
								{
									"type": "JDBC",
									"key": {
										"name": "biwdi09",
										"schema": "uiwivmo1"
									},
									"configuration": {
										"name": "wdi/ds",
										"pool_min": 1,
										"pool_max": 5
									}
								},
								{
									"type": "JMS",
									"key": {
										"name": "ConnectionFactoryMetrix",
										"shortName": "MTX",
										"instance": "VMOCLOU51AMQMTX"
									},
									"configuration": {
										"type": "AMQ"
									}
								},
								{
									"type": "JOLT",
									"key": {
										"host": "TUX1",
										"gateway": "joltpoolSN"
									},
									"configuration": {
										"pool_min": 1,
										"pool_max": 2
									}
								},
								{
									"type": "WAS",
									"key": {
										"name": "ESB",
										"instance": "VMODENU51MIW"
									}
								}
							],
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
							"id": 4,
							"type": "SGBD",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"name": "BIWDI09",
							"schema": "UIWIVMO1",
							"login": "uiwivmo1",
							"password": "uiwivmo1",
							"hostname": "GRIANTE",
							"ip": "10.98.208.68",
						},
						{
							"id": 5,
							"type": "SGBD",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"name": "BIWDI09",
							"schema": "UIWIVMO2",
							"login": "uiwivmo2",
							"password": "uiwivmo2",
							"hostname": "GRIANTE",
							"ip": "10.98.208.68",
						},
						{
							"id": 6,
							"type": "ESB",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "MIW",
							"name": "VMODENU51MIW",
							"hostname": "DENOEL",
							"ip": "10.98.208.67",
							"ports": [
								{
									"name": "HTTP",
									"number": 55030
								},
								{
									"name": "JMX",
									"number": 55031
								}
							],
							"links": [
								{
									"type": "WAS",
									"key": {
										"name": "WDI",
										"instance": "VMODENU51WDI"
									}
								}
							],
							"modules": [
								{
									"name": "ROOT",
									"war": "mulemiw-esbexplode",
									"context": "miwMule"
								}
							]
						},
						{
							"id": 7,
							"type": "TUX",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "WDI",
							"name": "joltpoolSN",
							"hostname": "",
							"ip": "148.169.132.44",
							"ports": [
								{
									"name": "TUXEDO",
									"number": 51813
								}
							]
						},
						{
							"id": 8,
							"type": "TUX",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "CBE",
							"name": "joltpoolSN",
							"hostname": "",
							"ip": "148.169.132.44",
							"ports": [
								{
									"name": "TUXEDO",
									"number": 51813
								}
							]
						},
						{
							"id": 9,
							"type": "ATO",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "ATOS",
							"name": "joltpoolSN",
							"user": "atosvmo",
							"home": "/appl/apiatosvmo",
							"hostname": "DENOEL",
							"ip": "148.169.132.44",
							"bins": [
								{
									"name": "JDK",
									"version": "1_5_0_17",
									"home": "/usr/java/vsc_jdk_1.5u17_32bit"
								},
								{
									"name": "ATOS",
									"version": "320-1.320-2",
									"home": "/HOME/atos/product/API_Atos_o320_s204_c107",
								}
							],
							"ports": [
								{
									"name": "SERVICE",
									"number": 9185
								},
								{
									"name": "COMMAND",
									"number": 9186
								},
								{
									"name": "HTTP",
									"number": 9187
								},
								{
									"name": "SURV",
									"number": 9188
								}
							]
						},
						{
							"id": 9,
							"type": "AMQ",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "AMQ",
							"name": "VMOCLOU51AMQMTA",
							"user": "amqvslu5",
							"home": "/appl/amqvslu5",
							"hostname": "",
							"amq_type" : "MTA",
							"logical_name": "mail",
							"queue": "mail-broker-vmousn5",
							"target_dir": "/appl/amqvslu5/mail/data/",
							"discovery_url": "'230.0.0.251:52830?group=mail-vmousn5'",
							"ip": "10.98.208.66",
							"bins": [
								{
									"name": "JDK",
									"version": "1.6u37",
									"home": "/usr/java/vsc_jdk_1.6u37_32bit"
								},
								{
									"name": "AMQ",
									"version": "5.4.1-fuse-02-00",
									"home": "/HOME/activemq/product/5.4.1-fuse-02-00",
								}
							],
							"ports": [
								{
									"name": "BROKER",
									"number": 55051
								},
								{
									"name": "JETTY",
									"number": 51052
								},
								{
									"name": "TRANSPORT",
									"number": 55053
								},
								{
									"name": "URI",
									"number": 55054
								}
							]
						},
						{
							"id": 10,
							"type": "AMQ",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "AMQ",
							"name": "VMOCLOU51AMQMTA",
							"user": "amqvslu5",
							"home": "/appl/amqvslu5",
							"hostname": "",
							"amq_type" : "MTX",
							"logical_name": "mail",
							"queue": "metrix-broker-vmousn5",
							"target_dir": "/appl/amqvslu5/metrix/data/",
							"discovery_url": "'230.0.0.251:52830?group=metrix-vmousn5'",
							"ip": "10.98.208.66",
							"bins": [
								{
									"name": "JDK",
									"version": "1.6u37",
									"home": "/usr/java/vsc_jdk_1.6u37_32bit"
								},
								{
									"name": "AMQ",
									"version": "5.4.1-fuse-02-00",
									"home": "/HOME/activemq/product/5.4.1-fuse-02-00",
								}
							],
							"ports": [
								{
									"name": "BROKER",
									"number": 55061
								},
								{
									"name": "JETTY",
									"number": 51062
								},
								{
									"name": "TRANSPORT",
									"number": 55063
								},
								{
									"name": "URI",
									"number": 55064
								}
							]
						},
						{
							"id": 11,
							"type": "HTTP",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "VMO",
							"name": "VMONOVI51",
							"user": "webadm",
							"home": "/HOME/webadm/VMO",
							"target_dir": "webvmo",
							"method_test": 1,
							"nb_echec": 10,
							"hostname": "NOVELLA",
							"ip": "10.102.99.100",
							"ports": [
								{
									"name": "HTTP",
									"number": 80
								},
								{
									"name": "HTTPS",
									"number": 443
								}
							],
							"links": [
								{
									"type": "HAP",
									"key": {
										"name": "/VMO",
										"instance": "VMOINT5VMO"
									}
								}
							]
						},
						{
							"id": 12,
							"type": "HAP",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "VMO",
							"name": "VMOINT5VMO",
							"user": "hapadm",
							"home": "/HOME/hapadm/VMO",
							"target_dir": "vmo",
							"hostname": "MONREALE",
							"ip": "10.101.175.71",
							"ports": [
								{
									"name": "HTTP",
									"number": 51100
								}
							],
							"links": [
								{
									"type": "WAS",
									"key": {
										"name": "/mobile",
										"instance": "VMOEVII51VMO"
									}
								},
								{
									"type": "WAS",
									"key": {
										"name": "/mobile",
										"instance": "VMOEVII52VMO"
									}
								}
							]
						},
						{
							"id": 13,
							"type": "HAP",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "VMO",
							"name": "VMOINT5VMOCBE",
							"user": "hapadm",
							"home": "/HOME/hapadm/VMO",
							"target_dir": "vmo",
							"hostname": "MONREALE",
							"ip": "10.101.175.71",
							"ports": [
								{
									"name": "HTTP",
									"number": 51101
								}
							],
							"links": [
								{
									"type": "WAS",
									"key": {
										"name": "/cbeWebServices",
										"instance": "VMOGALI51CBE"
									}
								}
							]
						},
						{
							"id": 14,
							"type": "HAP",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "VMO",
							"name": "VMOINT5VMO",
							"user": "hapadm",
							"home": "/HOME/hapadm/VMO",
							"target_dir": "vmo",
							"hostname": "MONTE",
							"ip": "10.101.175.71",
							"ports": [
								{
									"name": "HTTP",
									"number": 51100
								}
							],
							"links": [
								{
									"type": "WAS",
									"key": {
										"name": "/mobile",
										"instance": "VMOEVII51VMO"
									}
								},
								{
									"type": "WAS",
									"key": {
										"name": "/mobile",
										"instance": "VMOEVII52VMO"
									}
								}
							]
						},
						{
							"id": 15,
							"type": "HAP",
							"application": "WDI",
							"application_fullname": "Application WDI",
							"application_version": "2013-04",
							"application_url": "usl.wsmobile.voyages-sncf.com",
							"platform": "INT1",
							"client": "SAB",
							"component": "VMO",
							"name": "VMOINT5VMO",
							"user": "hapadm",
							"home": "/HOME/hapadm/VMO",
							"target_dir": "vmo",
							"hostname": "MONTE",
							"ip": "10.101.175.71",
							"ports": [
								{
									"name": "HTTP",
									"number": 51101
								}
							],
							"links": [
								{
									"type": "WAS",
									"key": {
										"name": "/cbeWebServices",
										"instance": "VMOGALI51CBE"
									}
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
Test.searchResultAI = [
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"},
	{application: "WDI",platform: "INT1"}
];
Test.searchResultHostname = [
	"slayer", "anthrax", "opeth", "gojira", "meshuggah", "dagoba"
]
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
					
				$httpBackend.whenGET('/rest/search?application=WDI&platform=INT1').
					respond(function(){ return [200, Test.wdiInstances, {}]});
								
				$httpBackend.whenGET('/rest/instances').
					respond(Test.wdiInstances);
				
				$httpBackend.whenGET(/\/rest\/search\/fulltext\/appinst\/*/).
					respond(Test.searchResultAI);
					
				$httpBackend.whenGET(/\/rest\/search\/fulltext\/hostname\/*/).
					respond(Test.searchResultHostname);
					
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

