var InstanceUtils = {
    
	guessInstanceHome: function(instance) {
		var home = "/appl/"+instance.user;
		if(instance.component){
			home += "/"+instance.component;
		}
		return home;
	},
	
    getComponents: function(instances){
		var flags = [], components = [];
		for(var i = 0; i<instances.length; i++){
			if(flags[instances[i].component]) continue;
			flags[instances[i].component] = true;
			components.push(instances[i].component);
		}
		return components;
	}
}


if ( typeof String.prototype.startsWith != 'function' ) {
  String.prototype.startsWith = function( str ) {
    return str.length > 0 && this.substring( 0, str.length ) === str;
  }
};