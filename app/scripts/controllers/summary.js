define([
  'models/summary',
  'repositories/user',
  'views/summary',
  'models/user'
], function (
  SummaryModel,
  UserRepository,
  SummaryView,
  UserModel) {

  'use strict';

  var SummaryController = {
    action: function() {
      var userId, summaryModel, summaryView;

      // Retrieving model
      userId = UserRepository.getCurrentUserId();

      console.log('userId is: ', userId);
      if (userId) {
        // Model created with userId, and when initialized new
        // answersPercentage object created
        summaryModel = new SummaryModel({ id: userId });
        // parse run afte fetch to populate model data with attributes:
        // score, result and merged questions
        summaryModel.fetch();
        console.log('summaryModel is: ', summaryModel);

        // Get user model from localStorage, add/set score attribute on model
        // to the score from the summaryModel, and update user model's information on 
        // localStorage

        var user = new UserModel({id: userId});
        user.fetch();
        user.set('score', summaryModel.get('score'));
        user.save();

        summaryView = new SummaryView({
          model: summaryModel
        });
      }

      return summaryView;
    }
  };

  return SummaryController;
});
