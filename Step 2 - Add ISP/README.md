# Add In-Skill Purchasing

In this section of the workshop, you will incorporate in-skill purchasing (ISP) into your skill. When developers and content creators build delightful skills with compelling content, customers win. With in-skill purchasing, you can sell premium content to enrich your Alexa skill experience.

When a customer plays through your Riddle Game, they have the option to purchase the ability to ask for a hint. When the customer successfully completes the in-skill purchase, they can ask for up to three hints per riddle.

## Objectives

After completing this workshop, you will be able to:

- Set up an ISP entitlement in the developer console
- Configure your interaction model to handle ISP
- Update your Lambda service code to be able to handle the various requests from the purchase flow

## Prerequisites

This lab requires:

- Access to a notebook computer with Wi-Fi, running Microsoft Windows, Mac OSX, or Linux (Ubuntu, SuSE, or RedHat).
- An Internet browser suchas Chrome, Firefox, or IE9 (previous versions of Internet Explorer are not supported).
- Having completed **[Step 0: Initialize Riddle Game](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%200%20-%20Initialize%20Riddle%20Game)**
- Having completed **[Step 1: Add Advanced Voice Design](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%201%20-%20Add%20Advanced%20Voice%20Design)**

## Goal: Integrating Premium Features into your skill
ISP supports one-time purchases for entitlements that unlock access to features or content in your skill, subscriptions that offer access to premium features or content for a period of time, and consumables which can be purchased, depleted and purchased again.

You can define your premium offering and price, and we handle the voice-first purchasing flow. We also provide self-service tools to manage your in-skill products, and optimize their sales performance over time. Today, you can make money through both ISP and Alexa Developer Rewards. This feature is available for Alexa skills in the US.

### Task 2.1: Build the Premium Feature into your skill
Before we start to integrate a formal ISP flow into our skill, we need to build the premium feature into the skill. This will mean creating an intent for when the customer asks for a hint in the game.

1. Navigate to the Amazon Developer Portal at[https://developer.amazon.com/alexa](https://developer.amazon.com/alexa).
2. Click **Sign In** in the upper right.
3. When signed in, click **Your Alexa Dashboards** in the upper right.
4. Choose your **Riddle Game Workshop** skill.
5. In the left-hand menu, click the **+ Add** icon to add an intent
6. Create a custom intent called "HintIntent"
7. Enter the following sample utterances for HintIntent:

```
give me a hint
i need a hint
tell me a hint
hint
i need another hint
i need a clue
i want a clue
clue
give me a clue
tell me a clue
i need another clue
```

8. **Save** and **Build** your interaction model.

This has updated our interaction model to be able to understand when the user requests for a hint. Now we need to be able to handle this in our service code. Once this is done, we will put this ability behind an ISP flow.

9. Navigate to your service code.
10. Update the `riddle_objects.js` file to add a `hints` array to each JSON object (you can copy it directly from [here](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/blob/master/Step%202%20-%20Add%20ISP/lambda/custom/riddle_objects.js)).
11. In your `index.js`, add a handler for the HintIntent to read off all requested hints for the current question:

```
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
```
It is important to note, in this code we keep track of a new session attribute: `sessionAttributes.currentHintIndex`. We need to initialize this attribute at the start of the game play.

12. Initialize `sessionAttributes.currentHintIndex` to 0 in `PlayGameIntent`, and for each new question in `AnswerRiddleIntent`.
13. Finally, add `HintIntentHandler` to your **RequestHandler** builder.
14. **Upload your code** to your Lambda function and click the **Save** button in the top of the page. This will upload your function code into the Lambda container.

After the Save is complete, you may or may not be able your code editor inline.

### Task 2.2: Test that the Premium Feature works in your skill
At this point we should test that hints work within your Riddle Game skill. You can test your skill in the Developer Portal or in Lambda using the JSON Input from the testing console.

1. Navigate to the **Test** tab of the Developer Portal.
2. In **Alexa Simulator** tab, under **Type or click…**, type &quot;open riddle game workshop&quot;
3. You should hear and see Alexa respond with the message in your LaunchRequest. Now type "i want three easy riddles".
4. When Alexa is done reading off the first riddle, respond with "i need a hint". Assure you get an appropriate response.

### Task 2.3: Add In-Skill Purchasing into your skill
Now we are going to add In-Skill purchasing into our skill. This will allow a customer to pay for a premium feature within your skill. You can integrate ISP into your skill through the Developer Portal or via the ASK-CLI.

1. Navigate to the **Build** tab of the Developer Portal.
2. Scroll down on the left-menu and select  

### Task 2.4: Adjust your Premium Feature to only be available on a complete purchase

### Task 2.5: Test that the ISP works in your skill

We will now test our skill again to assure that the ISP flow works and that our hints are accessible ONLY after a purchase flow is successful. As always, you can test your skill in the Developer Portal or in Lambda using the JSON Input from the testing console.

1. Navigate to the **Test** tab of the Developer Portal.
2. In **Alexa Simulator** tab, under **Type or click…**, type &quot;open riddle game workshop&quot;
3. You should hear and see Alexa respond with the message in your LaunchRequest. Now type "i want three easy riddles".
4. When Alexa is done reading off the first riddle, respond with "i need a hint". Assure that she asks you if you want to purchase hints.
5. 


### Congratulations! You have finished Task 2!


## License

This library is licensed under the Amazon Software License.
