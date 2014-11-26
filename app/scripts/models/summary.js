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
    // Object to store answerPercentage, key will be questionId, and value an array
    // whose index is each possible answer number for that question, and value is the percentage
    // of times that answer was selected
    answersPercentage: {},

    initialize: function() {
      var answersStats = this.buildAnswersStats();
      console.log('answersStats is : ', answersStats);
      this.buildAnswersPercentage(answersStats);
    },

    // This will find out how many times an answer has been chosen for each possible question.
    buildAnswersStats: function() {
      var answersStats, userCollection;

      answersStats = {};
      // Create a user collection and populate with users from localStorage
      userCollection = new UserCollection();
      userCollection.fetch();

      // Iterate through collection, and for each model, iterate through each questions array
      // and populate answerStats object key with an empty array
      userCollection.forEach(function(userModel) {
        _.each(userModel.get('questions'), function(question) {
          //If question id not a key in answerStats, add it and assign empty array to it
          if (!answersStats[question.id]) {
            answersStats[question.id] = [];
          }
          // Iterate through each answers array (on questions array on each user)
          // add one for each time a user gave a particular answer to a question
          _.each(question.answers, function(answer) {
            answersStats[question.id][answer] = answersStats[question.id][answer] + 1 || 1;
          });
        });
      });

      return answersStats;
    },

    // Accepts an object with keys of the question ID, each value is an array. The 
    // index of each array corresponds to answer number, and value is how many times
    // that answer was chosen. 
    buildAnswersPercentage: function(answersStats) {
      var self, totalUsers;

      self = this;
      // How many users in local storage
      totalUsers = UserRepository.getTotalUsers();
      // Iterate through object, each answer is an array
      _.each(answersStats, function(answers, questionId) {
        if (!self.answersPercentage[questionId]) {
          self.answersPercentage[questionId] =
            // This uses new Array(5) to create a sparse array, then convert it 
            // to a dense array with Array.apply, so now it can be iterated over
            // and assign each index to the primitive integer value of 0
            Array.apply(null, new Array(5)).map(Number.prototype.valueOf, 0);
        }
        // Iterate over each answers array, and assign percentage of times answer chosen
        // to the answerId (number between 0-4) of the answer to corresponding answerId
        // of the this.answersPercentage[questionId][answerId]
        _.each(answers, function(answer, answerId) {
          self.answersPercentage[questionId][answerId] =
            answer / totalUsers * 100;
        });
      });

      // When done, this.answersPercentage is => obj[key] = array(length 5) -> index is answer and values percentages
      console.log('this.answerPercentage is: ', self.answersPercentage)
    },

    parse: function(response){
      console.log('response is (this lis the user from the queried userId: ', response);
      // sets 
      response.score = this.calculateScore(response.questions);
      response.result = this.calculateResult(response.score);
      response.questions = this.mergeQuestions(response.questions);
      return response;
    },


    calculateScore: function(answeredQuestions) {
      var correctQuestions = 0;

      _.each(answeredQuestions, function(answeredQuestion) {
        // set originalQuestion to an object of the question working with from questions-data
        var originalQuestion = _.findWhere(QuestionsData, { id: parseInt(answeredQuestion.id, 10) });
        // if the answer number chosen by user is equal to the correct answer, increment correctQuestions
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
    // replace questions with an array of objects, each key the corresponding questionId,
    // which is an object with a key of answers which is an array of all possible answers, which
    // has an object at each possible answer number with a key of the possible answer, the class (i.e. correct, incorrect)
    // and the percentage of times it was chosen overall
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
