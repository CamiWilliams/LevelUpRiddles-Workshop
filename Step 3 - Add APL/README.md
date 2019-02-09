# Add Displays with the Alexa Presentation Language 

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
- Having completed **[Step 2: Add In-Skill Purchasing](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%202%20-%20Add%20ISP)**

## Goal: Integrating Premium Features into your skill
ISP supports one-time purchases for entitlements that unlock access to features or content in your skill, subscriptions that offer access to premium features or content for a period of time, and consumables which can be purchased, depleted and purchased again.

You can define your premium offering and price, and we handle the voice-first purchasing flow. We also provide self-service tools to manage your in-skill products, and optimize their sales performance over time. Today, you can make money through both ISP and Alexa Developer Rewards. This feature is available for Alexa skills in the US.

### Task 3.1: Add displays to your LaunchRequest

We will now add some displays written in the Alexa Presentation Language to your skill&#39;s LaunchRequest. The LaunchRequest is the function that is called when a user invokes your skill without an utterance, just the invocation name (for example, &quot;Alexa open [hello world]&quot;).

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

### Task 3.5: Test that the ISP works in your skill

We will now test our skill again to assure that the ISP flow works and that our hints are accessible ONLY after a purchase flow is successful. As always, you can test your skill in the Developer Portal or in Lambda using the JSON Input from the testing console.

1. Navigate to the **Test** tab of the Developer Portal.
2. In **Alexa Simulator** tab, under **Type or click…**, type &quot;open riddle game workshop&quot;
3. You should hear and see Alexa respond with the message in your LaunchRequest. Now type "i want three easy riddles".
4. When Alexa is done reading off the first riddle, respond with "i need a hint". **Assure that she asks you if you want to purchase hints.**
5. She should respond with "You don't currently own the hint pack. Want to learn more about it?". Type "yes".
6. She should now read your **entitlement description**. Respond "yes" to buy it.
7. Now that you have purchased a hint pack, we can start a new game with hints! Say "i want three easy riddles" and assure you can ask for hints throughout the game.


### Congratulations! You have finished Task 3!


## License

This library is licensed under the Amazon Software License.
