# Add Advanced Voice Design

In this section of the workshop, you will incorporate Auto slot delegation into your skill. Auto delegation promotes a more conversational VUI design. When launched, this Alexa skill will have the customer interact with a Riddle Game skill that requests them to provide both the level type and how many questions they'd like to answer.

## Objectives

After completing this workshop, you will be able to:

- Configure Intents, Sample Utterances, and Slots
- Update your Lambda service code to be able to handle auto delegation

## Prerequisites

This lab requires:

- Access to a notebook computer with Wi-Fi, running Microsoft Windows, Mac OSX, or Linux (Ubuntu, SuSE, or RedHat).
- An Internet browser suchas Chrome, Firefox, or IE9 (previous versions of Internet Explorer are not supported).
- Having completed **[Step 0: Initialize Riddle Game](https://github.com/CamiWilliams/LevelUpRiddles-Workshop/tree/master/Step%200%20-%20Initialize%20Riddle%20Game)**

## Goal: Handling more complex dialog in your skill.
Real conversations are dynamic, moving between topics and ideas fluidly. To create conversational Alexa skills, design for flexibility and responsiveness. Skills should be able to handle variations of conversation, conditional collection of data, and switching context mid-conversation. Auto Delegation and Dialog management makes these natural interactions possible.

To read about Dialog Management, go [here](https://build.amazonalexadev.com/alexa-skill-dialog-management-guide-ww.html).

### Task 1.1: Update your Interfaces
In order to achieve our more advanced conversational experience, we need to incorporate Auto Delegation into our skill.

1. Navigate to the Amazon Developer Portal at[https://developer.amazon.com/alexa](https://developer.amazon.com/alexa).
2. Click **Sign In** in the upper right.
3. When signed in, click **Your Alexa Dashboards** in the upper right.
4. Choose your **Riddle Game Workshop** skill.
5. Click on **Interfaces** on the left menu.
6. Assure that **Auto Delegation** is toggled. Note: it may already be toggled as it is enabled by default.

### Task 1.2: Use Auto Delegation in your Interaction Model
When a customer launches the Riddle Game Workshop skill, we want to update our opening message to request that they provide what level they want to source riddles from, along with how many riddles they would like to play with, their name, and favorite color.

As the skill stands, we already have the `level` slot in the `PlayGameIntent`. In this task, we want to make that the required slot, and add optional slots of `riddleNum`, `name`, and `color`.

1. Select the **PlayGameIntent** in the left menu, under Interaction Model. This is the intent logically follows the LaunchRequest, where Alexa will prompt the user for the `level` slot to be filled.
2. Scroll down to **Intent Slots**. In row 2, toggle your mouse into _Create a new slot_ and type "riddleNum".
3. Hit the **+** icon or _Enter_.
4. Repeat the same process for "name" and "color".
5. Next to each new slot, there is a dropdown menu to _Select a slot type_. For "riddleNum", select **AMAZON.NUMBER**.
3. For "name", select **AMAZON.US_FIRST_NAME**.
4. For "color", select **AMAZON.Color**.
5. Scroll up to **Sample Utterances**. Add each of the following utterances individually:

```
let's start
i want to play
i want {riddleNum} riddles
give me {riddleNum} riddles
my name is {name}
my name is {name} and my favorite color is {color}
i am {name}
i am {name} and i like {color}
my favorite color is {color}
{riddleNum} of the {level} riddles
i like {color}
i like {color} and {level} riddles
my favorite color is {color} and {riddleNum} {level}
i want {riddleNum} {level} riddles
give me {riddleNum} {level} riddles
my name is {name} and i want {level} riddles
my name is {name} and i want {riddleNum} {level} riddles
my name is {name} and my favorite color is {color} and i want {riddleNum} {level} riddles
give me {riddleNum} {level}
{name} and {color} and i want {riddleNum} {level} riddles
{name} {color} {riddleNum} level {level}
```
Each of these utterances shows a varying combination of what a customer could say to initiate the gameplay, on top of the utterances we already have trained in our skill. Now, we need to make sure that out of each of these, the customer will at least fill the `level` slot.

5. Under **Intent Slots**, click on "level".
6. Toggle "Is this slot required to fulfill the intent" under **Slot Filling**.

You will see two fields appear: **Alexa speech prompts** and **User utterances**. The former is what Alexa will say to prompt the user to fill the `level` slot. The latter is what the user might say in response to Alexa's prompt.

7. Add the following to **Alexa speech prompts**.

```
Do you want easy, medium, or hard riddles?
Hi {name}, do you want easy, medium or hard riddles?
Which category would you like your {riddleNum} riddles to be sourced from, easy, medium, or hard?
Nice to meet you {name}. You want to play through {riddleNum} riddles. Would you like those to be easy, medium, or hard?
```
Notice how you can incorporate slots that the customer has potentially filled within your speech prompt.

8. Add the following to **User utterances**.

```
{level}
level {level}
{level} riddles
{riddleNum} {level} riddles
{riddleNum} {level}
{riddleNum} of the {level} riddles
```
9. Now navigate back to your `PlayGameIntent`.
10. You will notice under **Dialog Delegation Strategy** that "fallback to skill setting" is selected. Select **enable auto delegation**.
11. Scroll up, and click **Save Model**.
12. Once it is done being saved, click **Build Model**.

### Task 1.4: Update your Skill Lambda

At this point in your development lifecycle, I recommend updating your code locally as it could start to get large. The code editor in AWS Lambda may not show your code depending on its size. With each iteration of your skill code, you can [**Upload a .zip** into Lambda]().

14. In the **Designer** view, under **Add Triggers** , select **Alexa Skills Kit**
15. In the upper-right corner of the page, **copy your ARN**. Copy everything except &quot;ARN-&quot;. It will look like this:
`arn:aws:lambda:us-east-1:123456789012:function:riddleGameWorkshop`
16. Now **switch browser tabs back to your skill** in the developer portal. You should be on the configuration page. (If you closed the browser tab, here&#39;s how to get back: Go to  [http://developer.amazon.com](http://developer.amazon.com/), sign in, click Alexa, click Alexa Skills Kit, click on your skill name, click on configuration from the left-hand menu).
17. Select **Endpoint** from the left menu.
18. For the service endpoint type, choose the **AWS Lambda ARN (Amazon Resource Name)** radio button.
19. **Paste your Lambda ARN** into the Default text field.
20. Click **Save Endpoints**.
21. Copy your skill ID.
22. Navigate back to your **Lambda function tab**. **Click** on the **Alexa Skills Kit** trigger that we previously added in the **Designer** view (it should say &quot;Configuration Required&quot; underneath).
23. Scroll down to the **Configure Triggers** view.
24. Skill id verification: **Enabled**
25. **Paste** your skill id.
26. Click **Add.**
27. Click **Save**.

Next, we will upload the Riddle Game skill code into Lambda. You should now see details of your riddleGameWorkshop Lambda function that includes your function&#39;s ARN in the upper right and the Configuration view of your function.

28. Click on the **riddleGameWorkshop** part of the tree in the **Designer** view.
29. Scroll down to see the **Function code** view.
30. Code Entry Type: **Upload a .zip file**
31. Ensure **Node.js 8.10** is selected for **Runtime**
32. Handler: **index.handler**.
33. Function Package: **Upload** a .zip of the contents in the lambda/custom folder of this repo.
34. Click the **Save** button in the top of the page. This will upload your function code into the Lambda container.

After the Save is complete, you should see your code editor inline (Note, if your function code becomes large, this view will not be available after uploading, but will still run). 

### Task 1.6: Test your voice interaction

We&#39;ll now test your skill in the Developer Portal. You can also optionally test your skill in AWS Lambda using the JSON Input from the testing console.

1. Switch browser tabs to **the developer portal** (If you closed the browser tab, here&#39;s how to get back: Go to  [http://developer.amazon.com](http://developer.amazon.com/), sign in, click Alexa, click Alexa Skills Kit, click on your skill name, click on configuration from the left-hand menu).
2. Scroll to the top of the page and click **Test**.
3. Switch **Test is disabled for this skill** to Development.
4. In **Alexa Simulator** tab, under **Type or click…**, type &quot;open riddle game workshop&quot;
5. You should hear and see Alexa respond with the message in your LaunchRequest.



### Congratulations! You have finished section 1!


## License

This library is licensed under the Amazon Software License.
