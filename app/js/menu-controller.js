'use strict';

angular.module('Hesperides.controllers').controller('MenuCtrl', ['$scope', '$location', '$modal', 'Application', 'Technos', 'Context', function ($scope, $location, $modal, Application, Technos, Context) {	
		
	/* Technos */
	$scope.get_technos = function(name) {
		return Technos.like(name).then(function(technosByName){
			return _.flatten(technosByName);
		});
	};	
		
	$scope.open_create_techno_dialog = function(){
		$scope.technoModalInstance = $modal.open({
			templateUrl: 'techno-menu-modal.html',
			scope: $scope
		});
	};
	
	$scope.open_techno_page = function(name, version) {
		$location.path('/technos/'+name+'/'+version);
		$scope.technoSearched = "";
		$scope.technoModalInstance.close();
	}
	
	/* Applications */
	$scope.get_applications = function(name) {
		return Applications.like(name).then(function(applicationsByName){
			return _.flatten(applicationsByName);
		}); //TO IMPLEMENT
	};

	$scope.open_application_page = function(name, version) {
		$location.path('/application/'+name+'/'+version);
		$scope.applicationSearched = "";
		$scope.applicationModalInstance.close();
	}
	
	$scope.open_create_application_dialog = function(){
		$scope.applicationModalInstance = $modal.open({
			templateUrl: 'application-menu-modal.html',
			scope: $scope
		});
	};
	
}]);