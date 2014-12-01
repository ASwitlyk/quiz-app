define([
  'jquery',
  'backbone',
  'controllers/welcome',
  'controllers/again',
  'controllers/question',
  'controllers/summary',
  'collections/topFiveUsersCollection',
  'views/topFive',
  'repositories/user'

], function (
  $,
  Backbone,
  WelcomeController,
  AgainController,
  QuestionController,
  SummaryController,
  TopFiveCollection,
  TopFiveView,
  UserRepository) {

  'use strict';

  var topFiveCollection = new TopFiveCollection();

  var topFiveView = new TopFiveView({collection: topFiveCollection});

  var AppRouter = Backbone.Router.extend({
    routes: {
      '': 'welcome',
      'again': 'again',
      'question-:id': 'question',
      'summary': 'summary'
    },

    // var topFiveView = new TopFiveView();

    welcome: function() {
      this.render(WelcomeController.action());
    },

    again: function() {
      this.render(AgainController.action());
    },

    question: function(id) {
      this.render(QuestionController.action(id));
    },

    summary: function() {
      this.render(SummaryController.action());
    },

    render: function(view) {
      if (this.currentView) {
        this.currentView.remove();
      }
      // always update topfive view
      UserRepository.getTopFive(topFiveCollection);
      topFiveCollection.trigger('change');

      if (view) {
        this.currentView = view;
        view.render();
        $('#content').html(view.el);
      }
      else {
        this.navigate('', { trigger:true });
      }
    }

  });

  return AppRouter;
});
