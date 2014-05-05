'use strict';

describe('controllers', function(){

  describe('AllInstancesCtrl' , function(){
	
	  var scope, ctrl, $http;
	
	//Matcher pour ne comparer que les champs d'un objet	
	beforeEach(function(){
		this.addMatchers({
			toEqualData: function(expected) {
			return angular.equals(this.actual, expected);
		}
		});
	});
	
	  beforeEach(module('Hesperides.controllers'));
	  beforeEach(module('Hesperides.services'));

	  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
		
		$http = Test.prepareHttpBackendStub(_$httpBackend_);
		
		scope = $rootScope.$new();
		ctrl = $controller('AllInstancesCtrl', {$scope:scope});
	  }));

	  it('should return all instances from elastic search', inject(function($controller) {
		$http.flush();
		
		expect(scope.instances).toBeDefined();
		expect(scope.instances.length).toBe(3);
		expect(scope.instances).toEqualData(
			[
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
			]
		);
		
	  }));

  });
  
});
