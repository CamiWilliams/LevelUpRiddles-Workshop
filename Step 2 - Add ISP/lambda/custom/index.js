/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const RIDDLES = require("./riddle_objects");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = "Welcome to Level Up Riddles! Before we get started, I need a few pieces of information."
        + " What is your name and favorite color?"
        + " How many riddles would you like to play with?"
        + " Would you like to start with easy, medium, or hard riddles?";
 
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
    sessionAttributes.currentLevel = request.intent.slots.level.value;

    // Store the slot values for name and color
    if (request.intent.slots.name.value) {
      sessionAttributes.name = request.intent.slots.name.value;
    }

    if (request.intent.slots.color.value) {
      sessionAttributes.color = request.intent.slots.color.value;
    }

    // Check if the slot value for riddleNum is filled and <5, otherwise default to 5
    const riddleNum = request.intent.slots.riddleNum.value;
    if (riddleNum) {
      sessionAttributes.totalRids = riddleNum <= 5 ? riddleNum : 5;
    } else {
      sessionAttributes.totalRids = 5;
    }

    // Reset variables to 0 to start the new game
    sessionAttributes.correctCount = 0;
    sessionAttributes.currentIndex = 0;
    sessionAttributes.currentHintIndex = 0;

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

    // If the customer has gone through all riddles, report the score
    if (sessionAttributes.currentIndex == sessionAttributes.totalRids) {
      sessionAttributes.speechText +=
          "You have completed all of the riddles on this level! "
          + "Your correct answer count is "
          + sessionAttributes.correctCount
          + ". To play another level, say easy, medium, or hard. ";

      // Reset variables to start a new game
      sessionAttributes.currentLevel = "";
      sessionAttributes.currentRiddle = {};
      sessionAttributes.currentIndex = 0;
      sessionAttributes.totalRids = 5;
    } else {
      sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];
      sessionAttributes.speechText += "Next riddle: " + sessionAttributes.currentRiddle.question;
    }
    
    // Reset hint index for the new question
    sessionAttributes.currentHintIndex = 0;

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

//----------------------------------------------------------------------
//----------------------------ISP HANDLERS------------------------------
//----------------------------------------------------------------------

const HintIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HintIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const index = sessionAttributes.currentHintIndex;

    // Read all hints the customer has asked for thus far
    let speechText = "Okay, here are your hints: ";
    let i = 0;
    while (i <= index) {
      speechText += sessionAttributes.currentRiddle.hints[i] + ", ";
      i++;
    }
    speechText += ". Here is your question again: "
        + sessionAttributes.currentRiddle.question;

    // Update the current hint index, maximum of 3 hints per riddle
    sessionAttributes.currentHintIndex = index == 2 ? 2 : (index + 1);
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(sessionAttributes.currentRiddle.question)
      .withSimpleCard('Level Up Riddles', speechText)
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
    HintIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .withApiClient(new Alexa.DefaultApiClient())
  .addErrorHandlers(ErrorHandler)
  .lambda();




