# Add Displays with the Alexa Presentation Language 

The Alexa Presentation Language (APL) is Amazon’s new voice-first design language you can use to create rich, interactive displays for Alexa skills and tailor the experience for tens of millions of Alexa-enabled devices. Using APL, you can easily build customized, robust displays that coincide with your personal brand and the context of your voice experience.

In this workshop, you will enhance the customer's interaction with Riddle Game by incorporating displays using APL. These displays will handle user interactions alongside voice.

## Objectives

After completing this workshop, you will be able to:

- Create APL documents for your intents
- Make your displays dynamic via your voice datasource
- Utilize transformers to use voice-visual components
- Send events from your display to your voice service
- Handle display user events in your voice service


## Prerequisites

This lab requires:

- Access to a notebook computer with Wi-Fi, running Microsoft Windows, Mac OSX, or Linux (Ubuntu, SuSE, or RedHat).
- An Internet browser suchas Chrome, Firefox, or IE9 (previous versions of Internet Explorer are not supported).
- Having completed **[Step 0: Initialize Riddle Game](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%200%20-%20Initialize%20Riddle%20Game)**
- Having completed **[Step 1: Add Advanced Voice Design](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%201%20-%20Add%20Advanced%20Voice%20Design)**
- Having completed **[Step 2: Add In-Skill Purchasing](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%202%20-%20Add%20ISP)**

## Goal: Create an enriching visual experience in your skill
Voice is the most natural form of interaction. But in a voice-first world, visuals can enhance interactions with Alexa-enabled devices. By combining visual elements with voice experiences, developers can expand the possibilities of what their skills can do. Alexa-enabled devices have varying display sizes and shapes, purposes, and hardware limitations. For example, while using a skill on an Echo Spot or Fire TV may have similar spoken interactions for a customer, interactivity and information rendered on the screen may vary drastically depending on the device features.

You will create 4 display screens: one for the `LaunchRequest`, `PlayGameIntent`, `AnswerRiddleIntent`, and `HintIntent`. 

### Task 3.1: Add displays to your LaunchRequest that send UserEvents 

We will now add some displays to your skill's `LaunchRequest`. The LaunchRequest is the function that is called when a user invokes your skill without an utterance, just the invocation name (for example, "Alexa open riddle game").

When the customer invokes your skill and the `LaunchRequest`, Alexa prompts the user _"Would you like to start with easy, medium, or hard riddles?"_ We want to create a display with buttons that a customer can select to chose their level. 

1. In the **developer portal** , select the **Build** tab in the top menu.
2. Scroll down and select the **Display** tab on the left menu.
3. This will navigate you to the **APL Authoring Tool**. This is an authoring tool used to create and edit APL documents for your skill. There are currently 7 sample templates you can use. For now, we will start from scratch. Select **Start from scratch**.
4. In the top pane, you can toggle between different devices. Select **Small Hub**.
5. Select the **toggle** in the middle of the authoring tool. This should switch views to the raw code. You should see this APL code in the editor:

```
{
    "type": "APL",
    "version": "1.0",
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "layouts": {},
    "mainTemplate": {
        "items": []
    }
}
```
APL is made up of Components dictated in the mainTemplate. A component is a primitive element that displays on the viewport of the device.

6. Under items, **add** a **Container** component. This component can contain and orient child components.

```
{
    "type": "APL",
    "version": "1.0",
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "layouts": {},
    "mainTemplate": {
        "items": [
            {
                "type": "Container",
                "width": "100vw",
                "height": "100vh",
                "items": []
            }
        ]
    }
}
```
This Container currently has a width 100% of the viewport width (100vw) and 100% of the viewport height (100vh).

7. Add a child component to the Container. **Insert** a **Text** component that reads &quot;Hello, World!&quot;.

```
{
    "type": "APL",
    "version": "1.0",
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "layouts": {},
    "mainTemplate": {
        "items": [
            {
                "type": "Container",
                "width": "100vw",
                "height": "100vh",
                "items": [
                    {
                        "type": "Text",
                        "text": "Hello, World!"
                    }
                ]
            }
        ]
    }
}
```

You will now see a cut-off &quot;Hello, World!&quot; appear on screen. The text is currently cut off on the round hub, because the Container view defaults to a square, versus a circle.

8. **Align** the text to be in the center of the screen. **Set** the **height** of the Text component to 100vh and the **width** of the Text component to 100vw. **Add the properties** _textAlign: center_ and _textAlignVertical: center_ to the Text component.

```
{
    "type": "APL",
    "version": "1.0",
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "layouts": {},
    "mainTemplate": {
        "items": [
            {
                "type": "Container",
                "width": "100vw",
                "height": "100vh",
                "items": [
                    {
                        "type": "Text",
                        "text": "Hello, World!",
                        "height": "100vh",
                        "width": "100vw",
                        "textAlign": "center",
                        "textAlignVertical": "center"
                    }
                ]
            }
        ]
    }
}
```
Now you can see the Text in the center of the screen vertically and horizontally.

9. **Toggle** in between the various devices. If you click on Medium Hub, Large Hub, and Extra-Large TV in the authoring tool, you can see the same experience on every device.

Now that we have a visual experience that fits for every device, lets change the customer experience to be different for any devices that are NOT round. This will be utilizing the built-in **viewport properties** that specifies device characteristics like size, shape, and orientation.

10. Select **Medium Hub**.
11. In the Text component, add a **when** statement. The when statement uses data-binding to show or hide the component it is attached to based upon the condition specified. This condition should be &quot;if the viewport shape is round&quot;.

```
{
    "type": "APL",
    "version": "1.0",
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "layouts": {},
    "mainTemplate": {
        "items": [
            {
                "type": "Container",
                "width": "100vw",
                "height": "100vh",
                "items": [
                    {
                        "when": "${viewport.shape == 'round'}",
                        "type": "Text",
                        "text": "Hello, World!",
                        "height": "100vh",
                        "width": "100vw",
                        "textAlign": "center",
                        "textAlignVertical": "center"
                    }
                ]
            }
        ]
    }
}
```
Now the text component will only show on any hubs that are round. So, if you **toggle** back to the **Small Hub,** you should see the &quot;Hello, World!&quot; text.

12. Under the Text component, **add** a similar **Text** component with the when condition of &quot;if the viewport&#39;s shape is not round&quot;. **Set** the color of this component to **red**.

```
{
    "type": "APL",
    "version": "1.0",
    "theme": "dark",
    "import": [],
    "resources": [],
    "styles": {},
    "layouts": {},
    "mainTemplate": {
        "items": [
            {
                "type": "Container",
                "width": "100vw",
                "height": "100vh",
                "items": [
                    {
                        "when": "${viewport.shape == 'round'}",
                        "type": "Text",
                        "text": "Hello, World!",
                        "height": "100vh",
                        "width": "100vw",
                        "textAlign": "center",
                        "textAlignVertical": "center"
                    },
                    {
                        "when": "${viewport.shape != 'round'}",
                        "type": "Text",
                        "text": "Hello, World!",
                        "height": "100vh",
                        "width": "100vw",
                        "textAlign": "center",
                        "textAlignVertical": "center",
                        "color": "red"
                    }
                ]
            }
        ]
    }
}
```
Now **toggling** between the different devices, you can see a red &quot;Hello, World!&quot; for any landscape devices, and a white &quot;Hello, World!&quot; for round devices.

We have finished authoring our display screen for our skill, we now need to add this APL code to our skill.

13. **Copy** the entire APL code.
14. **Now switch browser tabs** back to your Lambda function code.
15. Assure you have selected the **helloWorldSkill** function under the **Designer** view and scroll down to the **Function code**
16. Select **File -\&gt; New File**
17. **Paste** the APL code.
18. Select **File -\&gt; Save As** and name this file **main.json.** Assure it is being saved under the **helloWorldSkill**
19. Once main.json is saved, you should see it appear in the navigation view on the left. **Select** js.
20. **Navigate** to the **LaunchRequest** (line 6).

We will now add an APL directive to the LaunchRequest response. A directive specifies how a compiler (or other translator) should process its input. In this case, our directive type will be `Alexa.Presentation.APL.RenderDocument`, indicating to interpret the input as a document to render as APL, and our input will be our main.json document.

21. **Add** an if statement to determine if the customer&#39;s device has a display using the **supportsAPL** function. The current return statement should be in the else of that statement (line 13).

```
    if(supportsAPL(handlerInput)) {

    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard('Hello World', speechText)
        .getResponse();
    }

```
22. In the if statement, **paste** the following code:

```
return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          document: require('./main.json')
        })
      .getResponse();

```
23. Click **Save** at the top of the window **.**

### Task 3.2: Add displays for the game play contingent on the skill datasource

### Task 3.3: Integrate transformers into your displays for a voice-first visual experience 

### Task 3.5: Test that the ISP works in your skill

We will now test our skill again to assure that the ISP flow works and that our hints are accessible ONLY after a purchase flow is successful. As always, you can test your skill in the Developer Portal or in Lambda using the JSON Input from the testing console.

1. Navigate to the **Test** tab of the Developer Portal.
2. In **Alexa Simulator** tab, under **Type or click…**, type &quot;open riddle game workshop&quot;
3. You should hear and see Alexa respond with the message in your LaunchRequest. Now type "i want three easy riddles".
4. When Alexa is done reading off the first riddle, respond with "i need a hint". **Assure that she asks you if you want to purchase hints.**
5. She should respond with "You don't currently own the hint pack. Want to learn more about it?". Type "yes".
6. She should now read your **entitlement description**. Respond "yes" to buy it.
7. Now that you have purchased a hint pack, we can start a new game with hints! Say "i want three easy riddles" and assure you can ask for hints throughout the game.

### Task 3.6 (Extra Credit): Update your displays to use the customer's favorite color



### Congratulations! You have finished Task 3!


## License

This library is licensed under the Amazon Software License.
