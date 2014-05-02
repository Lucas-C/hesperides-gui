'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('Hesperides.controllers'));


  it('should return all instances from elastic search', inject(function($controller) {
    
	var scope = {},
		ctrl = $controller('AllInstancesCtrl', {$scope:scope});
		
	expect(scope.instances.length).toBe(3);	
	
    expect(scope.name).toBeDefined();
  }));

  
  
});
