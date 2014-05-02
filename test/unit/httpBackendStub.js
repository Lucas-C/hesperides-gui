var Test = {};
Test.prepareHttpBackendStub = function($httpBackend) {
				$httpBackend.whenGET('/instances').
					respond([
						{
							"application": "WDI",
							"platform": "INT1",
							"client": "SAB",
							"type": "WAS",
							"composant": "WDI",
							"name": "WDIGALI11WDI",
							"hostname": "GALERIA",
							"ip": "10.16.34.92"
						},
						{
							"application": "WDI",
							"platform": "INT1",
							"client": "SAB",
							"type": "WAS",
							"composant": "WDI",
							"name": "WDIGALI12WDI",
							"hostname": "GALERIA",
							"ip": "10.16.34.92"
						},
						{
							"application": "WDI",
							"platform": "INT1",
							"client": "SAB",
							"type": "WAS",
							"composant": "WDI",
							"name": "WDIGALI13WDI",
							"hostname": "GALERIA",
							"ip": "10.16.34.92"
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

