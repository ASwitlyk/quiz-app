// views/topUser.js

define([
	'jquery',
	'underscore',
	'backbone',
	'templates',
	], function($, _, Backbone, JST) {
		'use strict';

		var TopUserView = Backbone.View.extend({

			tagName: 'li',

			template: JST['app/scripts/templates/top-user.hbs'],

			render: function() {

				this.$el.html(this.template(this.model.toJSON()));

				return this;

			}

		});

		return TopUserView;
});