// views/topFive.js

define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	'collections/topFiveUsersCollection',
	'views/topUser'
	], function($, _, Backbone, JST, TopFive, TopUserView) {
	   'use strict';

	   var TopFiveView = Backbone.View.extend({

	     tagName: 'div',

	     template: JST['app/scripts/templates/topfive.hbs'],

	     className: 'topFive',

	     el: '#topFive',

	     events: {

	     	"click .clear-all": "clearAllUsers"

	     },

	     initialize: function() {

	     	this.render();

     		this.listenTo(this.collection, 'change', function() {
				this.render();
			});

	     },

	     render: function() {

	     	this.$el.html('');
	     	this.$el.html(this.template());
	     	this.collection.fetch();
	     	// create unordered list element
	     	var list = $('<ul></ul>');

	     	this.collection.each(function(model) {
	     		var view = new TopUserView({model: model});
	     		list.append(view.render().el);
	     	});

	     	this.$el.append(list);
	     	return this;

	     },

	     clearAllUsers: function() {

	     	this.collection.trigger('clearAll');
	     	// route app to welcome page, since now all user's deleted
	     	


	     }


	   });
	   
	   return TopFiveView;

});