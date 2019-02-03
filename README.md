# Group X Group Simulator

![Example](https://github.com/jamjar919/groupx/blob/master/groupx_sample.png?raw=true)

Simulate your messenger group with the highest quality markov chains on the market. 

### Build/Running instructions
The app is built with Node JS and NPM, so extracting the archive or cloning the repository and running a `npm install; npm start` should start up the server. If you want to actually show data from your conversations, you'll need to download your account data from the [Facebook settings tab](https://www.facebook.com/settings?tab=your_facebook_information). Make sure when downloading you select `json` format! Then copy one of your message archives into the `/messages/` folder. The program should automatically pick it up and load it for you if it's the only `json` file in the folder.

### TODO
* Add interactivity - currently bots centre around talking about a common word. Make it so this word is based on user input.
* Simplify the way message files are loaded (Maybe through console argument?)
* Improve the model by switching to a proper machine learning technique (RNN?)
