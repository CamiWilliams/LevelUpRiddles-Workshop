
const Alexa = require("ask-sdk");
const RIDDLES = require("./riddle_objects");

const GadgetDirectives = require('util/gadgetDirectives.js');
const BasicAnimations = require('button_animations/basicAnimations.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
  	let speechOutput = "Welcome to the Amazing Riddle Challenge! ";
  	let reprompt = "If you want to use multiplayer mode, say multiplayer mode. Otherwise, would you like to play with easy, medium, or hard riddles? ";
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  	sessionAttributes.isRollCallComplete = false;

  	if (supportsAPL(handlerInput)) {
  		handlerInput.responseBuilder
	      .addDirective({
	          type: 'Alexa.Presentation.APL.RenderDocument',
	          token: "homepage",
	          document: require('./launchrequest.json'),
	      });
  	}
    return handlerInput.responseBuilder
      .speak(speechOutput + reprompt)
      .reprompt(reprompt)
      .getResponse();
  },
};

const MultiPlayerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    	&& handlerInput.requestEnvelope.request.intent.name === 'MultiPlayerIntent';
  },
  handle(handlerInput) {
  	const request = handlerInput.requestEnvelope.request;
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
	
	let speechOutput = "Okay great! You need two echo buttons for multiplayer mode. If you do not have two buttons, you can play with easy, medium or hard riddles. Hit your echo buttons one at a time. Player 1, hit your button. ";

  	sessionAttributes.isRollCallComplete = false;
	sessionAttributes.buttonCount = 0;
	sessionAttributes.deviceIds = [];

	let response = handlerInput.responseBuilder.getResponse();
    response.directives = [];
    response.directives.push(GadgetDirectives.startInputHandler({ 
            'timeout': 15000,
            'recognizers': {
				"button_down_recognizer" : {
			        "type": "match",
			        "fuzzy": false,
			        "anchor": "end",
			        "pattern": [{
			                "action": "down"
			            }
			        ]
				}
			}, 
            'events': {
			    "button_down_event": {
			        "meets": ["button_down_recognizer"],
			        "reports": "matches",
			        "shouldEndInputHandler": false
			    },
			    "timeout": {
			        "meets": ["timed out"],
			        "reports": "history",
			        "shouldEndInputHandler": true
			    }
			}
    }));
    response.directives.push(GadgetDirectives.setButtonDownAnimation({
        'targetGadgets': [],
        'animations': BasicAnimations.SolidAnimation(1, "green", 8000)
    }));

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .getResponse();
  },
};

const RollCallHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'GameEngine.InputHandlerEvent'
        && sessionAttributes.isRollCallComplete === false;
  },
  handle(handlerInput) {
    let gameEngineEvents = handlerInput.requestEnvelope.request.events || [];
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let speechText = "";
    let reprompt = "";
    let response = handlerInput.responseBuilder.getResponse();

    for (let i = 0; i < gameEngineEvents.length; i++) {
      switch(gameEngineEvents[i].name) {
        case 'button_down_event' :
          console.log("A BUTTON HAS BEEN PUSHED FOR ROLL CALL");
          // Don't end session, and don't open the microphone
          delete response.shouldEndSession;

          let buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;
          if (sessionAttributes.deviceIds.includes(buttonId)) {
            speechText += "You have already pushed that button! Try another button. ";
          } else {
          	sessionAttributes.deviceIds.push(buttonId);
            sessionAttributes.buttonCount += 1;
          }


          if (sessionAttributes.buttonCount === 1) {
            speechText = "Great, player 1 button registered. Player 2, hit your button. ";
          } else if (sessionAttributes.buttonCount === 2) {

			sessionAttributes.isRollCallComplete = true;
            speechText = "Great, both buttons are registered. ";
            reprompt = "Would you like to play with easy, medium, or hard riddles? ";

            handlerInput.requestEnvelope.request.events = [];
		    return handlerInput.responseBuilder
		      .speak(speechText + reprompt)
		      .speak(reprompt)
		      .getResponse();

          } else {
            console.log("What the heck is happening: " + sessionAttributes.buttonCount);
          }

          break;
        case 'timeout':
          speechText = "You haven't registed two buttons, so we will play normal mode.";
          reprompt = "Would you like to play with easy, medium, or hard riddles? ";
          sessionAttributes.isRollCallComplete = false;

          return handlerInput.responseBuilder
		      .speak(speechText + reprompt)
		      .speak(reprompt)
		      .getResponse();
      }
    }

    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .getResponse();
  }
};

const MultiplayerEasyMediumHardIntentHandler = {
  canHandle(handlerInput) {
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    	&& handlerInput.requestEnvelope.request.intent.name === 'EasyMediumHardIntent'
    	&& !sessionAttributes.gameStarted
    	&& sessionAttributes.isRollCallComplete;
  },
  handle(handlerInput) {
  	const request = handlerInput.requestEnvelope.request;
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  	sessionAttributes.currentLevel = getUserSpecifiedLevel.call(
	  	this, request.intent.slots.level);

  	sessionAttributes.currentIndex = 0;
	sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];	
	sessionAttributes.player1Score = 0;
	sessionAttributes.player2Score = 0;
	sessionAttributes.currentHintIndex = 0;
	sessionAttributes.gameStarted = true;

  	let speechOutput = "";
  	let reprompt = "";
	speechOutput += "Okay great! We will play with " + sessionAttributes.currentLevel
  			+ " riddles. Your first riddle is: ";
	reprompt += sessionAttributes.currentRiddle.question;
	sessionAttributes.multiplayerAnswering = false;

	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
	
	if (supportsAPL(handlerInput)) {
  		handlerInput.responseBuilder
	      .addDirective({
	          type: 'Alexa.Presentation.APL.RenderDocument',
	          token: "riddle",
	          document: require('./riddle.json'),
	          datasources: formulateDatasource.call(this, sessionAttributes)
	      });
  	}

  	let response = handlerInput.responseBuilder.getResponse();
    response.directives = [];
    response.directives.push(GadgetDirectives.startInputHandler({ 
            'timeout': 90000,
            'recognizers': {
				"button_down_recognizer" : {
			        "type": "match",
			        "fuzzy": false,
			        "anchor": "end",
			        "pattern": [{
			                "action": "down"
			            }
			        ]
				}
			}, 
            'events': {
			    "button_down_event": {
			        "meets": ["button_down_recognizer"],
			        "reports": "matches",
			        "shouldEndInputHandler": false
			    },
			    "timeout": {
			        "meets": ["timed out"],
			        "reports": "history",
			        "shouldEndInputHandler": true
			    }
			}
    }));
    response.directives.push(GadgetDirectives.setButtonDownAnimation({
        'targetGadgets': [],
        'animations': BasicAnimations.SolidAnimation(1, "green", 8000)
    }));
    
    return handlerInput.responseBuilder
      .speak(speechOutput + reprompt)
      .getResponse();
  },
};

const GamePlayEngine = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.requestEnvelope.request.type === 'GameEngine.InputHandlerEvent'
        && sessionAttributes.isRollCallComplete === true
        && !sessionAttributes.multiplayerAnswering;
  },
  handle(handlerInput) {
    let gameEngineEvents = handlerInput.requestEnvelope.request.events || [];
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let speechText = "";
    let reprompt = "";
    let response = handlerInput.responseBuilder.getResponse();

    for (let i = 0; i < gameEngineEvents.length; i++) {
      switch(gameEngineEvents[i].name) {
        case 'button_down_event' :
          console.log("A BUTTON HAS BEEN PUSHED FOR GAME PLAY");
          // Don't end session, and don't open the microphone
          delete response.shouldEndSession;

          let buttonId = gameEngineEvents[i].inputEvents[0].gadgetId;
          if (sessionAttributes.deviceIds.includes(buttonId)) {
          	let index = sessionAttributes.deviceIds.indexOf(buttonId);

          	if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "riddle",
			          document: require('./riddle.json'),
			          datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}
          	sessionAttributes.multiplayerAnswering = true

          	if (index == 0) {
          		// player 1 hit
          		speechText += "Player one, what is your answer? ";
          		sessionAttributes.justHit = 0;

			    return handlerInput.responseBuilder
			      .speak(speechText)
			      .reprompt(speechText)
			      .getResponse();

          	} else {
          		// player 2 hit
          		speechText += "Player two, what is your answer? ";
          		sessionAttributes.justHit = 1;

			    return handlerInput.responseBuilder
			      .speak(speechText)
			      .reprompt(speechText)
			      .getResponse();
          	}

          } else {
          	speechText += "Something went wrong with the buttons. Seems like you pushed a button that isn't registered. Please come back later! ";
          	console.log("They pushed another button.");

          }

          break;
        case 'timeout':
          speechText = "You have taken too long to play this game. Please play again, faster, another time!";
          break;
      }
    }

    return handlerInput.responseBuilder
      .speak(speechText + reprompt)
      .getResponse();
  }
};

const MultiplayerAnswerIntentHandler = {
  canHandle(handlerInput) {
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    	&& handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent'
    	&& sessionAttributes.isRollCallComplete
        && sessionAttributes.multiplayerAnswering;
   },
  handle(handlerInput) {
  	const request = handlerInput.requestEnvelope.request;
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  	
	let speechOutput = "";
  	let reprompt = "";

	let customerAnswer = request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value;

	if (customerAnswer.id == "01") {
		// repeat question
		speechOutput += "Okay, here is the question repeated: ";
		reprompt += sessionAttributes.currentRiddle.question;
	} else {
		if (customerAnswer.id == "00" || customerAnswer.name != sessionAttributes.currentRiddle.answer) { 
			// wrong answer
			speechOutput += "That is incorrect! ";
			if (sessionAttributes.justHit == 0) {
				sessionAttributes.player2Score++;
			} else {
				sessionAttributes.player1Score++;
			}
		} else {
			// right answer
			speechOutput += "That is correct! ";
			if (sessionAttributes.justHit == 0) {
				sessionAttributes.player1Score++;
			} else {
				sessionAttributes.player2Score++;
			}
		}

		speechOutput += "The answer was "
				+ sessionAttributes.currentRiddle.answer;
		sessionAttributes.currentIndex += 1;

		if (sessionAttributes.currentIndex == RIDDLES.LEVELS[sessionAttributes.currentLevel].length) {
			speechOutput += ". You have completed the game! The total scores are Player 1 with "
					+ sessionAttributes.player1Score + "points and Player 2 with "
					+ sessionAttributes.player2Score
					+ " points. You can play again if you'd like. ";
			reprompt = "Would you like to play with easy, medium, or hard riddles? ";
			sessionAttributes.gameStarted = false;
		} else {
			speechOutput += ". Here is your next riddle: ";
			sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];	
			reprompt += sessionAttributes.currentRiddle.question;
			sessionAttributes.currentHintIndex = 0;

			if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "riddle",
			          document: require('./riddle.json'),
	          		  datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}
		}
	}
	
	sessionAttributes.multiplayerAnswering = false;
	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechOutput + reprompt)
      .reprompt(reprompt)
      .getResponse();
  },
};

const EasyMediumHardIntentHandler = {
  canHandle(handlerInput) {
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return ((handlerInput.requestEnvelope.request.type === 'IntentRequest'
    	&& handlerInput.requestEnvelope.request.intent.name === 'EasyMediumHardIntent'
    	&& !sessionAttributes.gameStarted)
    	|| (handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.APL.UserEvent'))
    	&& !sessionAttributes.isRollCallComplete;
  },
  handle(handlerInput) {
  	const request = handlerInput.requestEnvelope.request;
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

  	if (request.type == 'Alexa.Presentation.APL.UserEvent') {
  		sessionAttributes.currentLevel = request.arguments[0];
  	} else {
	  	sessionAttributes.currentLevel = getUserSpecifiedLevel.call(
	  			this, request.intent.slots.level);
  	}

  	sessionAttributes.currentIndex = 0;
	sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];	
	sessionAttributes.currentScore = 0;
	sessionAttributes.currentHintIndex = 0;
	sessionAttributes.gameStarted = true;

  	let speechOutput = "";
  	let reprompt = "";
	speechOutput += "Okay great! We will play with " + sessionAttributes.currentLevel
  			+ " riddles. Your first riddle is: ";
	reprompt += sessionAttributes.currentRiddle.question;

	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
	
	if (supportsAPL(handlerInput)) {
  		handlerInput.responseBuilder
	      .addDirective({
	          type: 'Alexa.Presentation.APL.RenderDocument',
	          token: "riddle",
	          document: require('./riddle.json'),
	          datasources: formulateDatasource.call(this, sessionAttributes)
	      });
  	}
    
    return handlerInput.responseBuilder
      .speak(speechOutput + reprompt)
      .reprompt(reprompt)
      .getResponse();
  },
};

const IDoNotKnowHandler = {
  canHandle(handlerInput) {
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    	&& handlerInput.requestEnvelope.request.intent.name === 'EasyMediumHardIntent'
    	&& sessionAttributes.gameStarted;
  },
  handle(handlerInput) {
  	const request = handlerInput.requestEnvelope.request;
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  	
	let speechOutput = "";
  	let reprompt = "";

	let customerUtterance = request.intent.slots.level.resolutions.resolutionsPerAuthority[0].values[0].value.id;

	if (customerUtterance == "3") {
		// i do not know
		speechOutput += "Okay, you do not know the answer. ";
		sessionAttributes.currentIndex += 1;

		if (sessionAttributes.currentIndex == RIDDLES.LEVELS[sessionAttributes.currentLevel].length) {
			speechOutput += ". You have completed the game! Your total score is "
					+ sessionAttributes.currentScore
					+ ". You can play again if you'd like. ";
			reprompt = "Would you like to play with easy, medium, or hard riddles? ";
			sessionAttributes.gameStarted = false;
			if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "riddle",
			          document: require('./finalscore.json'),
	          		  datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}
		} else {
			speechOutput += ". Here is your next riddle: ";
			sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];	
			reprompt += sessionAttributes.currentRiddle.question;
			sessionAttributes.currentHintIndex = 0;

			if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "riddle",
			          document: require('./riddle.json'),
	          		  datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}
		}
	} else {	
	    console.log(`handlerInput: ${JSON.stringify(handlerInput)}`);
	    return handlerInput.responseBuilder
	      .speak('Sorry, I didn\'t understand what you meant. Please try again.')
	      .reprompt('Sorry, I didn\'t understand what you meant. Please try again.')
	      .getResponse();
	}

	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechOutput + reprompt)
      .reprompt(reprompt)
      .getResponse();
  },
};

const AnswerIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    	&& handlerInput.requestEnvelope.request.intent.name === 'AnswerIntent';
   },
  handle(handlerInput) {
  	const request = handlerInput.requestEnvelope.request;
  	const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  	
	let speechOutput = "";
  	let reprompt = "";

	let customerAnswer = request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value;

	if (customerAnswer.id == "01") {
		// repeat question
		speechOutput += "Okay, here is the question repeated: ";
		reprompt += sessionAttributes.currentRiddle.question;
	} else {
		if (customerAnswer.id == "00" || customerAnswer.name != sessionAttributes.currentRiddle.answer) { 
			// wrong answer
			speechOutput += "That is incorrect! ";
		} else {
			// right answer
			sessionAttributes.currentScore += 1;
			speechOutput += "That is correct! ";
		}

		speechOutput += "The answer was "
				+ sessionAttributes.currentRiddle.answer;
		sessionAttributes.currentIndex += 1;

		if (sessionAttributes.currentIndex == RIDDLES.LEVELS[sessionAttributes.currentLevel].length) {
			speechOutput += ". You have completed the game! Your total score is "
					+ sessionAttributes.currentScore
					+ ". You can play again if you'd like. ";
			reprompt = "Would you like to play with easy, medium, or hard riddles? ";
			sessionAttributes.gameStarted = false;
			if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "riddle",
			          document: require('./finalscore.json'),
	          		  datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}
		} else {
			speechOutput += ". Here is your next riddle: ";
			sessionAttributes.currentRiddle = RIDDLES.LEVELS[sessionAttributes.currentLevel][sessionAttributes.currentIndex];	
			reprompt += sessionAttributes.currentRiddle.question;
			sessionAttributes.currentHintIndex = 0;

			if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "riddle",
			          document: require('./riddle.json'),
	          		  datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}
		}
	}
	handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speechOutput + reprompt)
      .reprompt(reprompt)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
  	let reprompt = "Would you like to play with easy, medium, or hard riddles? ";

    return handlerInput.responseBuilder
      .speak(reprompt)
      .reprompt(reprompt)
      .getResponse();
  },
};

const SessionEndedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest' ||
      (handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent') ||
      (handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    console.log('IN: SessionEndedHandler.handle');
    return handlerInput.responseBuilder
      .speak("Thanks for playing the Amazing Riddle Challenge!")
      .getResponse();
  },
};

const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    console.log('IN FallbackHandler');
    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t understand what you meant. Please try again.')
      .reprompt('Sorry, I didn\'t understand what you meant. Please try again.')
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${JSON.stringify(error.message)}`);
    console.log(`handlerInput: ${JSON.stringify(handlerInput)}`);
    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t understand what you meant. Please try again.')
      .reprompt('Sorry, I didn\'t understand what you meant. Please try again.')
      .getResponse();
  },
};

// -------------------------- HELPERS -----------------------------

function getUserSpecifiedLevel(slotValue) {
	switch (slotValue.resolutions.resolutionsPerAuthority[0].values[0].value.id) {
		case "0":
			return "easy";
		case "1":
			return "medium";
		case "2":
			return "hard";
		default:
			let rand = Math.floor(Math.random() * 2);
			return rand == 1 ? "easy" : "hard";
	}
}

function isProduct(product) {
  return product &&
    product.length > 0;
}

function isEntitled(product) {
  return isProduct(product) &&
    product[0].entitled === 'ENTITLED';
}

function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface != null && aplInterface != undefined;
}

function formulateDatasource(sessionAttributes) {
	let formattedLevel = "";
	switch (sessionAttributes.currentLevel) {
		case "easy":
			formattedLevel = "Easy";
			break;
		case "medium":
			formattedLevel = "Medium";
			break;
		case "hard":
			formattedLevel = "Hard";
			break;
		default:
			formattedLevel = "Easy";
			break;
	}

	return {
	    "amazingRiddleChallengeData": {
	        "properties": {
	            "currentLevel": sessionAttributes.currentLevel,
	            "currentFormattedLevel": formattedLevel,
	            "currentIndex": Number(sessionAttributes.currentIndex),
	            "currentHintIndex": Number(sessionAttributes.currentHintIndex),
	            "currentScore": Number(sessionAttributes.currentScore),
	            "currentRiddle": sessionAttributes.currentRiddle
	        }
	    }
	};
}

// -------------------------- ISP -----------------------------

const HintIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'HintIntent';
  },
  handle(handlerInput) {
  	const locale = handlerInput.requestEnvelope.request.locale;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then(function(res) {
    	let product = res.inSkillProducts.filter(record => record.referenceName === 'hint_pack');

    	if (isEntitled.call(this, product)) {
    		const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    		
    		console.log(JSON.stringify(sessionAttributes));
    		let speechOutput = "Okay, here are your current hints: ";
    		let reprompt = "";

    		let i = 0;
    		while (i <= sessionAttributes.currentHintIndex) {
    			speechOutput += sessionAttributes.currentRiddle.hints[i] + ", "
    			i++;
    		}

    		sessionAttributes.currentHintIndex = i == 2 ? 2 : (i + 1);
    		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


    		reprompt += ". Here is your riddle again: "
    				+ sessionAttributes.currentRiddle.question;

    		handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    		if (supportsAPL(handlerInput)) {
		  		handlerInput.responseBuilder
			      .addDirective({
			          type: 'Alexa.Presentation.APL.RenderDocument',
			          token: "hints",
			          document: require('./hints.json'),
	          		  datasources: formulateDatasource.call(this, sessionAttributes)
			      });
		  	}

    		return handlerInput.responseBuilder
		      .speak(speechOutput + reprompt)
		      .reprompt(reprompt)
		      .getResponse();
    	} else {
    		let upsellMessage = "You currently do not own the ability to use hints. Would you like to learn more? ";
            return handlerInput.responseBuilder
              .addDirective({
                type: 'Connections.SendRequest',
                name: 'Upsell',
                payload: {
                  InSkillProduct: {
                    productId: product[0].productId,
                  },
                  upsellMessage: upsellMessage,
                },
                token: 'correlationToken',
              })
              .getResponse();
    	}
    });
  },
};

const BuyIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'BuyIntent';
  },
  handle(handlerInput) {
    const locale = handlerInput.requestEnvelope.request.locale;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then(function(res) {
    	let product = res.inSkillProducts.filter(record => record.referenceName == 'hint_pack');

    	return handlerInput.responseBuilder
    		.addDirective({
   				'type': 'Connections.SendRequest',
    			'name': 'Buy',
    			'payload': {
    				'inSkillProduct': {
    					'productId': product[0].productId
    				}
    			},
    			'token': 'correlationToken'
    		})
    		.getResponse()
    });
  },
};

const BuyAndUpsellResponseHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'Connections.Response' &&
      (handlerInput.requestEnvelope.request.name === 'Buy' ||
        handlerInput.requestEnvelope.request.name === 'Upsell');
  },
  handle(handlerInput) {
    console.log('IN: BuyResponseHandler.handle');

    const locale = handlerInput.requestEnvelope.request.locale;
    const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

    return ms.getInSkillProducts(locale).then(function handlePurchaseResponse(res) {
      let product = res.inSkillProducts.filter(record => record.referenceName == 'hint_pack');

      if (handlerInput.requestEnvelope.request.status.code === '200') {
        let speechOutput = "";
    	let reprompt = "";

        switch (handlerInput.requestEnvelope.request.payload.purchaseResult) {
          case 'ACCEPTED':
              speechOutput = "You have just purchased the ability to use hints within your game. ";
              reprompt = "To use a hint, say i need a hint. Would you like to play with easy, medium, or hard riddles?";
              break;
          case 'DECLINED':
              speakOutput = "You can purchase hints at anytime during the game. "
  			  reprompt = "Would you like to play with easy, medium, or hard riddles? ";
              break;
          case 'ALREADY_PURCHASED':
              speechOutput = "You have just purchased the ability to use hints within your game. ";
              reprompt = "To use a hint, say i need a hint. Would you like to play with easy, medium, or hard riddles?";
              break;
          default:
              speechOutput = "Something unexpected happened, but thanks for your interest in the hint pack. ";
  			  reprompt = "Would you like to play with easy, medium, or hard riddles? ";
              break;
        }

        return handlerInput.responseBuilder
          .speak(speechOutput + reprompt)
          .reprompt(reprompt)
          .getResponse();
      }

      // Something failed.
      console.log(`Connections.Response indicated failure. error: ${handlerInput.requestEnvelope.request.status.message}`);

      return handlerInput.responseBuilder
        .speak('There was an error handling your purchase request. Please try again or contact us for help.')
        .getResponse();
    });
  },
};

// -------------------------- SKILL BUILDER -----------------------------

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		MultiPlayerIntentHandler,
		RollCallHandler,
		MultiplayerEasyMediumHardIntentHandler,
		GamePlayEngine,
		MultiplayerAnswerIntentHandler,
		EasyMediumHardIntentHandler,
		AnswerIntentHandler,
		IDoNotKnowHandler,
		HelpIntentHandler,
		SessionEndedHandler,
		FallbackHandler,
		HintIntentHandler,
		BuyIntentHandler,
		BuyAndUpsellResponseHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();


