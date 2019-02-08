/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const RIDDLES = require("./riddle_objects");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = "Welcome to Level Up Riddles! "
        + "I will give you 5 riddles. Would you like to start with easy, medium, or hard riddles?";
 
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Level Up Riddles', speechText)
      .getResponse();
  },
};

const PlayGameIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlayGameIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    // Get the level the customer selected: 'easy', 'med', 'hard'
    const spokenLevel = request.intent.slots.level.value;
    if (spokenLevel) {
      sessionAttributes.currentLevel = spokenLevel;
    } else {
      sessionAttributes.currentLevel = 'easy';
    }

    // Reset variables to 0 to start the new game
    sessionAttributes.correctCount = 0;
    sessionAttributes.currentIndex = 0;

    // Get the first riddle according to that level
    sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];

    sessionAttributes.speechText = "Lets play with " 
        + sessionAttributes.currentLevel + " riddles! "
        + " First riddle: " + sessionAttributes.currentRiddle.question;

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speechText)
      .reprompt(sessionAttributes.speechText)
      .withSimpleCard('Level Up Riddles', sessionAttributes.speechText)
      .getResponse();
  }
};

const AnswerRiddleIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AnswerRiddleIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    console.log(JSON.stringify(handlerInput.requestEnvelope.request.intent.slots));

    // Determine if the customer said the correct answer for the current riddle
    const spokenAnswer = handlerInput.requestEnvelope.request.intent.slots.answer.value;
    sessionAttributes.speechText = "";
    if (spokenAnswer == sessionAttributes.currentRiddle.answer) {
      sessionAttributes.speechText += sessionAttributes.currentRiddle.answer + " is correct! You got it right! "
      sessionAttributes.correctCount += 1;
      sessionAttributes.correct = "Correct! ";
    } else {
      sessionAttributes.speechText += "Oops, that was wrong. The correct answer is " + sessionAttributes.currentRiddle.answer + ". ";
      sessionAttributes.correct = "Incorrect! ";
    }

    // Move on to the next question
    sessionAttributes.currentIndex += 1;

    // If the customer has gone through all 5 riddles, report the score
    if (sessionAttributes.currentIndex == RIDDLES.LEVELS[sessionAttributes.currentLevel].length) {
      sessionAttributes.speechText +=
          "You have completed all of the riddles on this level! "
          + "Your correct answer count is "
          + sessionAttributes.correctCount
          + ". To play another level, say easy, medium, or hard. ";

      // Reset variables to start a new game
      sessionAttributes.currentLevel = "";
      sessionAttributes.currentRiddle = {};
      sessionAttributes.currentIndex = 0;
    } else {
      sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];
      sessionAttributes.speechText += "Next riddle: " + sessionAttributes.currentRiddle.question;
    }

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    return handlerInput.responseBuilder
      .speak(sessionAttributes.speechText)
      .reprompt(sessionAttributes.speechText)
      .withSimpleCard('Level Up Riddles', sessionAttributes.speechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = "I will give you 5 riddles. Would you like to start with easy, medium, or hard riddles?"

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Level Up Riddles', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Level Up Riddles', speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    console.log("Error in request "  + JSON.stringify(handlerInput.requestEnvelope.request));

    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    PlayGameIntentHandler,
    AnswerRiddleIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .addErrorHandlers(ErrorHandler)
  .lambda();




