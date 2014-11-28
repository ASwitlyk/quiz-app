define([
	'underscore',
	'backbone',
	'models/user',
	'repositories/user'
	], function(_, Backbone, UserModel, UserRepository) {
		'use strict';

		var TopFiveCollection = Backbone.Collection.extend({
		  model: UserModel,

		  sync: function(method, collection, options) {
		  	options || (options = {});

		  	switch (method){
		  		case 'read':
		  		  UserRepository.getTopFive(collection);
		  		  break;

		  	}
		  }

		});

	return TopFiveCollection;

});