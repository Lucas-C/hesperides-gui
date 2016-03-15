/**
 * Created by william_montaz on 17/10/2014.
 */
var templateModule = angular.module('hesperides.template', []);

templateModule.factory('HesperidesTemplateModal', ['TemplateService', '$modal', '$rootScope', function (TemplateService, $modal, $rootScope) {

    var hesperidesOverlay = {
        startState: function() {
            return {
                inMustache: false
            }
        },
        token: function(stream, state) {
            var ch;
            if (stream.match("{{")){ //We found an hesperides token
                state.inMustache = true; //Remember what we do
                state.inMustacheInner = true;
                return "hesperides";
            }
            if(state.inMustache) {
                while ((ch = stream.next()) != null) { //Read characters through the token
                    if (ch == "}" && stream.next() == "}") { //End of hesperides token
                        if(state.inMustacheInner){
                            stream.backUp(2);
                            state.inMustacheInner = false;
                            return "hesperides-token"; //Color for the inner token
                        } else {
                            stream.eat("}");
                            state.inMustache = false; //Remember to update state
                            state.inMustacheInner = false;
                            return "hesperides"; //Color for the }}
                        }
                    }
                    if(ch == "|"){ //Found an inner item limit
                        if(state.inMustacheInner){
                            stream.backUp(1);
                            state.inMustacheInner = false;
                            return "hesperides-token"; //Color for the inner token
                        } else {
                            state.inMustacheInner = true;
                            return "hesperides"; //Color for the | character
                        }
                    }
                }
                return "hesperides-token"; //return the style for syntax highlight even if we reached end of line
            }
            while (stream.next() != null && !stream.match("{{", false)) {} //Skip everything unless we find an hesperides token or reach the end of line
            return null;
        }
    };

    /* Thisis for the initialization, to make sure we have at least the simple Mustache mode selected */
    CodeMirror.defineMode("hesperides", function(config, parserConfig) {
        return CodeMirror.overlayMode(
            CodeMirror.getMode(config, parserConfig.backdrop || ""),
            hesperidesOverlay
        );
    });

    var defaultScope = {
        codemirrorModes: [
            { name: "Simple Hesperides", mimetype: ""},
            { name: "Properties File", mimetype:"text/x-properties"}
        ],
        codeMirrorOptions: {
            mode: 'hesperides',
            lineNumbers: true,
            extraKeys: {
                'F11': function (cm) {
                    $('body').append($('#templateContent')); //Change the parent of codemirror because if not, fullscreen is restricted to the modal
                    $('#templateContent').children().css("z-index", 100000);
                    cm.setOption('fullScreen', true);
                    cm.focus();
                },
                'Esc': function (cm) {
                    $('#templateContentParent').append($('#templateContent'));
                    if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                    cm.focus();
                }
            },
            onLoad: function(_editor){
                defaultScope.editor = _editor;
                //This is some trick to avoid a bug. If not refresh, then we have to click on code mirror to see its content
                setTimeout(function(){
                    defaultScope.editor.refresh();
                }, 100);
            }
        },
        changeCodeMirrorMode: function(new_mode){
            var mode_name = "hesperides+"+new_mode;
            CodeMirror.defineMode(mode_name, function(config, parserConfig) {
                return CodeMirror.overlayMode(
                    CodeMirror.getMode(config, parserConfig.backdrop || new_mode),
                    hesperidesOverlay
                );
            });
            defaultScope.editor.setOption("mode", mode_name);
        }
    };

    return {
        edit_template: function (options) {

            var modalScope = $rootScope.$new(true);

            modalScope.template = options.template;

            modalScope.add = options.add;

            modalScope.save = options.onSave;

            modalScope.isReadOnly = options.isReadOnly;

            modalScope.fileRightsOption = [{text: "O", value: true}, {text: "N", value: false}, {text: "", value: null}];

            defaultScope.codeMirrorOptions.readOnly = options.isReadOnly ? true : false;

            angular.extend(modalScope, defaultScope);

            var modal = $modal.open({
                templateUrl: 'template/template-modal.html',
                backdrop: 'static',
                size: 'lg',
                keyboard: false,
                scope: modalScope
            });

            modalScope.$save = function(template){
                modalScope.save(template).then(function(savedTemplate){
                    modalScope.template = savedTemplate;
                }).catch(function() {
                    // Do nothing to prevent closing window if error with annotation
                });
            };

            //If everything went well (using $close to close the modal), then save the template
            //If we use $dismiss to close the modal, this will not be called
            modal.result.then(function (template) {
                modalScope.$save(template);
            });
        }
    };

}]);

templateModule.directive('hesperidesTemplateList', function () {
    return {
        restrict: 'E',
        scope: {
            templateEntries: '=',
            add: '&',
            delete: '&',
            edit: '&',
            isReadOnly: '='
        },
        templateUrl: "template/template-list.html",
        link: function (scope, element, attr) {

            scope.add_template = function () {
                scope.add()();
            };

            scope.delete_template = function (name) {
                scope.delete()(name);
            };

            scope.edit_template = function (name) {
                scope.edit()(name);
            };

        }
    };
});

templateModule.factory('Template', function () {

    var Template = function (data) {

        angular.extend(this, {
            name: "",
            filename: "",
            location: "",
            content: "",
            version_id: -1
        }, data);

        this.toHesperidesEntity = function(){
          return {
              name: this.name,
              filename: this.filename,
              location: this.location,
              content: this.content,
              version_id: this.version_id,
              rights: this.rights
          }
        };

    };

    return Template;

});

templateModule.factory('TemplateEntry', ['$http', 'Template',function ($http, Template) {

    var TemplateEntry = function (data) {
        angular.extend(this, {
            name: "",
            namespace: "",
            filename: "",
            location: ""
        }, data);

    this.getRights = function (url) {
            return $http.get(url).then(function (response) {
                return (new Template(response.data)).toHesperidesEntity();
            });
        };
    };

    return TemplateEntry;
}]);

templateModule.factory('TemplateService', ['$http', 'Template', 'TemplateEntry', function ($http, Template, TemplateEntry) {

    return {
        get: function (namespace, name) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
            });
        },
        save: function (template) {
            template = template.toHesperidesEntity();
            if (template.version_id < 0) {
                return $http.post('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $.notify("Le template bien ete cree", "success");
                    return new Template(response.data);
                }, function (error) {
                    if (error.status === 409) {
                        $.notify("Impossible de creer le template car il existe deja un template avec ce nom", "error");
                    } else {
                        $.notify(error.data.message, "error");
                    }
                });
            } else {
                return $http.put('rest/templates/' + encodeURIComponent(template.namespace) + '/' + encodeURIComponent(template.name), template).then(function (response) {
                    $.notify("Le template a ete mis a jour", "success");
                    return new Template(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                });
            }
        },
        delete: function (namespace, name) {
            return $http.delete('rest/templates/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name)).then(function (response) {
                $.notify("Le template a bien ete supprime", "success");
                return response;
            }, function (error) {
                $.notify(error.data.message, "error");
            });
        },
        all: function (namespace) {
            return $http.get('rest/templates/' + encodeURIComponent(namespace)).then(function (response) {
                return response.data.map(function (data) {
                    return new TemplateEntry(data);
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data.message, "error");
                    } else {
                        return [];
                    }
                });
            });
        }
    }

}]);
