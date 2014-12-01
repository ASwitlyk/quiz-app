define([
	'underscore',
	'backbone',
	'models/user',
	'repositories/user'
	], function(_, Backbone, UserModel, UserRepository) {
		'use strict';

		var TopFiveCollection = Backbone.Collection.extend({

		  model: UserModel,

		  initialize: function() {

		  	this.on('clearAll', this.clearAll);

		  },

		  sync: function(method, collection, options) {
		  	options || (options = {});

		  	switch (method){
		  		case 'read':
		  		  UserRepository.getTopFive(collection);
		  		  break;

		  	}
		  },

		  clearAll: function() {

		  	// clear persistent localStorage
		  	localStorage.clear();
		  	// reset collection
		  	this.reset();
		  	Backbone.history.navigate('', {trigger: true});

		  }

		});

	return TopFiveCollection;

});