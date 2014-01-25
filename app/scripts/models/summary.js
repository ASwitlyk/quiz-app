define([
  'underscore',
  'backbone',
  'collections/user',
  'config/questions-data',
  'models/user',
  'repositories/user'
], function (_, Backbone, UserCollection, QuestionsData, UserModel, UserRepository) {
  'use strict';

  var SummaryModel = Backbone.Model.extend({
    answersPercentage: {},

    initialize: function() {
      var answersStats = this.buildAnswersStats();
      this.buildAnswersPercentage(answersStats);
    },

    buildAnswersStats: function() {
      var answersStats, userCollection;

      answersStats = {};
      userCollection = new UserCollection();
      userCollection.fetch();

      userCollection.forEach(function(userModel) {
        _.each(userModel.get('questions'), function(question) {
          if (!answersStats[question.id]) {
            answersStats[question.id] = [];
          }

          _.each(question.answers, function(answer) {
            answersStats[question.id][answer] = answersStats[question.id][answer] + 1 || 1;
          });
        });
      });

      return answersStats;
    },

    buildAnswersPercentage: function(answersStats) {
      var self, totalUsers;

      self = this;
      totalUsers = UserRepository.getTotalUsers();

      _.each(answersStats, function(answers, questionId) {
        if (!self.answersPercentage[questionId]) {
          self.answersPercentage[questionId] =
            Array.apply(null, new Array(5)).map(Number.prototype.valueOf, 0);
        }

        _.each(answers, function(answer, answerId) {
          self.answersPercentage[questionId][answerId] =
            answer / totalUsers * 100;
        });
      });
    },

    parse: function(response){
      response.score = this.calculateScore(response.questions);
      response.result = this.calculateResult(response.score);
      response.questions = this.mergeQuestions(response.questions);
      return response;
    },

    calculateScore: function(answeredQuestions) {
      var correctQuestions = 0;

      _.each(answeredQuestions, function(answeredQuestion) {
        var originalQuestion = _.findWhere(QuestionsData, { id: parseInt(answeredQuestion.id, 10) });
        if (_.isEqual(answeredQuestion.answers, originalQuestion.correctAnswers)) {
          correctQuestions++;
        }
      });

      return correctQuestions / QuestionsData.length * 100;
    },

    calculateResult: function(score) {
      var result;

      if (score >= 80) {
        result = 'The force is strong with this one!';
      }
      else if (score >= 60) {
        result = 'May the force be with you!';
      }
      else {
        result = 'Much to learn you still have, my young padawan!';
      }

      return result;
    },

    mergeQuestions: function(answeredQuestions) {
      var questions, self;

      self = this;
      questions = [];

      _.each(answeredQuestions, function(answeredQuestion) {
        var question, originalQuestion, userAnswers;

        originalQuestion = _.findWhere(QuestionsData, { id: parseInt(answeredQuestion.id, 10) });
        question = {
          id: originalQuestion.id,
          question: originalQuestion.question,
          answers: []
        };

        _.each(originalQuestion.answers, function(originalAnswer, index) {
          var className;

          if (_.contains(originalQuestion.correctAnswers, index)) {
            className = 'correct';
          }
          else {
            className = 'incorrect';
          }

          if (_.contains(answeredQuestion.answers, index)) {
            className += ' answered';
          }

          question.answers.push({
            answer: originalAnswer,
            result: {
              className: className,
              percentage: self.answersPercentage[question.id][index]
            }
          });
        });

        questions.push(question);
      });

      return questions;
    },

    sync: function(method, model, options) {
      options || (options = {});

      switch (method){
        case 'read':
          UserRepository.read(model, options);
          break;
      }
    }
  });

  return SummaryModel;
});
