# Riddle Game Workshop 

Riddle Game Workshop was built to showcase advanced skill building techniques. A user opens the skill and selects to play with easy, medium, or hard riddles. After their selection, Alexa gives them 5 riddles per commanded category. A user goes through trying to answer the riddles, to which Alexa responds with celebration if correct, the correct answer if incorrect. At the end, Alexa totals the number of correct riddles they answered.

## Overview

This workshop is split into 5 sections. Each section builds off the previous, and gets more advanced per step:

- **Step 0 - Initialize Riddle Game**: You will create and configure the Riddle Game skill using the Alexa Skills Kit SDK in NodeJS and AWS Lambda. When launched, this Alexa skill will have the customer interact with a riddle game that features a simple voice interaction and using session attributes.

- **Step 1 - Add Dialog Management**: At the beginning of the skill, you will prompt the user not only for the difficulty level, but also how many questions they'd like to be asked in the game.

- **Step 2 - Add In-Skill Purchasing**: A customer can now buy the ability to ask for hints within the game. There are 3 hints per question.

- **Step 3 - Add Displays with the Alexa Presentation Language**: With APL, you can develop visual templates for skills formatted anyway you'd like. This integration allows customers to interact with their multimodal devices and the skill.

- **Step 4 - Add Echo Buttons with the Gadgets API**: With the integration of Echo Buttons, a customer is able to now play Riddle Game with 2 players. The player will hit a button when they know the answer, whoever gets the most points at the end of the 5 riddles wins.

## License

This library is licensed under the Amazon Software License.
