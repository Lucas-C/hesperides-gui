'use strict';

angular.module('Hesperides.controllers').controller('ENCCtrl', ['$scope', '$routeParams', 'ENC', 'Page', function ($scope, $routeParams, ENC, Page) {

	Page.setTitle("Edition ENC "+$routeParams.hostname);

    $scope.hostname = $routeParams.hostname;
	
	$scope.environments = ["usine", "assemblage", "integration", "preproduction", "production"];
	$scope.environment = $scope.environments[1];

	$scope.$watch('environment', function() {
		if($scope.enc){
			$scope.enc.environment = $scope.environment;
			saveENC();
		}
	}, true);
	
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: "text/x-yaml",
        onKeyEvent: function (_, evt) {


            switch (evt.keyCode) {
                case 37:
                case 38:
                case 39:
                case 40:
                    return;
            }

            if (evt.type === 'keyup') {
                saveENC();
            }
        }
    });
	
	var saveENC = function () {
		if($scope.enc){
			$scope.enc.hostname = $scope.hostname;
			$scope.enc.environment = $scope.environment;
			$scope.enc.custom = jsyaml.dump(jsyaml.load(myCodeMirror.getValue()));
			if($scope.enc.custom == "null\n") $scope.enc.custom = "";
			ENC.save($scope.hostname, $scope.enc).then(function(enc){
					$scope.enc = enc;
					updatePreview(enc);
				}
			);
		}
	}
	
	var previewYAML = CodeMirror.fromTextArea(document.getElementById('preview'), {
        mode: "yaml",
		readOnly: true
    });
	
	var updatePreview = function(enc) {
		var preview = enc.generated;
		if(enc.custom){
			/* On fait le decalage de 2 espaces pour avoir un format yaml correct */
			var custom = "  ";
			custom += enc.custom.replace(/\n/g, "\n  ");
			preview += custom;
		}
		previewYAML.setValue(preview);
	}
	
	var updateCustom = function(enc) {
		if(enc.custom) {
			myCodeMirror.setValue(enc.custom);
		}
	}

    ENC.get($scope.hostname).then(function (enc) {
		$scope.enc = enc;
		updatePreview($scope.enc);
		updateCustom($scope.enc);
		$scope.environment = enc.environment;
    });

}]);
