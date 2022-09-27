const { Client, GatewayIntentBits, Discord } = require('discord.js');

secret = require("./secret.js");

/*const myIntents = new Intents();

myIntents.add(2048);
old app?!?!?
*/

const client = new Client(
	{intents: [GatewayIntentBits.Guilds]}
);


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
	if(msg.content === 'hello') {
		msg.reply('squawk:');
	}
});


client.login(secret.key);
