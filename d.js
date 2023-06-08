const { Client, GatewayIntentBits, Discord, REST, Routes } = require('discord.js');
const { Octokit } = require('octokit');
const { channel } = require('node:diagnostics_channel');
const wait = require('node:timers/promises').setTimeout;
const { SlashCommandBuilder } = require('@discordjs/builders');
secret = require("./secret.js");
require('dotenv').config()

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const commands = [
	{
		name: 'test',
		description: 'testing',
	},
	{
		name: 'pulls',
		description: 'list active pull request'
	},
    {
        name: 'arg',
        description: 'list args'
    },
	{
		name: 'gist',
		description: 'list your github gists'
	},
];

//is this the best way to do this?
const timey = {
	m5m: 300000,
	m10m: 600000,
	m15m: 900000,
	m20m: 1200000,
	m25m: 1500000,
	m30m: 1800000,
	m1m: 60000  // for test
}

const octokit = new Octokit({auth: process.env.gitToken});

const rest = new REST({ version :'10' }).setToken(secret.key);

(async () => {
	try {
		console.log('Started (/) commands.');

		await rest.put(Routes.applicationCommands(secret.CLIENT_ID), { body: commands });

		console.log('Reloaded');
	}catch (error) {
		console.error(error);
	}
})();

const client = new Client(
	{intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.MessageContent, 
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildWebhooks
	]}
);

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}`);

	//const guild = await client.guilds.fetch(secret.GUILD_ID);
	//const channel = guild.channels.cache.get(secret.CHANNEL_ID);
	//const message = await channel.messages;

	/* this is annoying - bot intro welcome msg
	message.channel.send("Hi! I'm Squawk! ```/pulls (to see latest pull request)``` ");
	*/

});

/*cos debugging*/
be_quiet = true;

client.on('messageCreate', async msg => {

	const guild = await client.guilds.fetch(secret.GUILD_ID);
	const channel = guild.channels.cache.get(secret.CHANNEL_ID);
	const message = await channel.lastMessage;

    const prefix = "!";

	/* simplify later */

	/* prefix commands using ! */

    if(message.content.startsWith(prefix)){
        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        if(command === 'argtest'){
            message.channel.send(`Your arg: ${args[0]}`);
        }

        if(command === 'timer'){
            if(args[0] === '?'){
                message.channel.send(`Timer Help Menu:`);
                message.channel.send(`example: !timer 5m`);
                message.channel.send(`sets timer for 5 minutes`);
            }
            if(args[0].match(/[1-9]m/)){
				let prefix_ = "m"; //dictionary prefix
                message.channel.send(`Timer set for ${args[0]}`);
				setTimeout(timerFinished, timey[prefix_.concat(args[0])]);
            }

			function timerFinished() {
                message.channel.send(`Times Up!`);
			}
        }

		/* chat bot thing */

		if(command === 'chat'){
			const args = message.content.slice(prefix.length).trim().split(' ');
			const prompts = args.slice(1)
			const hello = prompts.join(" ")

			var api_key = secret.OPENAPIKEY
			var address = "https://api.openai.com/v1/completions" 

			var str = `${address} -H "Content-Type: application/json" -H "Authorization: Bearer ${api_key}" -d '{"model": "text-davinci-003", "prompt": "${prompts}", "temperature": 0, "max_tokens": 360}'`
			const requestData = {
				model: 'text-davinci-003',
				prompt: hello,
				temperature: 0,
				max_tokens: 360
			};

			(async () => {
				const res = await fetch(address, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + api_key
					},
					body: JSON.stringify(requestData)
				})
				//const res = await fetch("https://www.google.com")
				const answer = await res.json()
				const reply = answer.choices[0].text
				msg.channel.send(reply)

			})()
		}
	}

	//for testing msg reply

	var user = 'skazz'; //username

	if(message.author.username === user && message.content === 'squawk' && !be_quiet) {
		message.react('😄');
	}else if(message.author.username === user && !be_quiet && message.content != 'be quiet'){
		msg.reply('squawk!');
		msg.channel.send('say the magic word');
		msg.react('😡');
	}
	
	if(message.content === 'be quiet'){
		msg.channel.send('Okay!');
		be_quiet = true;
	}
});


/*TODO explore this later
client.on('typingStart', (channel, user) => {
	console.log("hi");
});
*/

client.on('interactionCreate', async interaction => {
    const guild = await client.guilds.fetch(secret.GUILD_ID);
    const channel = guild.channels.cache.get(secret.CHANNEL_ID);
    const message = await channel.lastMessage;

    //const args = message.content.slice(prefix.length).trim().split(' ');
	
	const data = new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with your input')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo')
				.setRequired(true));

	if(!interaction.isChatInputCommand()) return;

	if(interaction.commandName === 'test') {
		interaction.reply('Was this a good squawk?');
		const message = await interaction.fetchReply();
		message.react('😄');
		message.channel.send("OKAY");

	}

	if(interaction.commandName === 'gist'){
		const gist = octokit.rest.gists.list();
		console.log(gist);
		interaction.channel.send("Here's the gist");
	}

    if(interaction.commandName === 'arg'){
        interaction.channel.send("arguments");
    }

	/* display pull requests */

	if(interaction.commandName === 'pulls'){
		(async () => {
			try{
				const getpull =  await octokit.request('GET /repos/{owner}/{repo}/pulls',  {
					owner: 'lefth-nd',
					repo: 'Rohan'  // for test
				})
				if(getpull.data.length != 0){
					interaction.reply("New Pull Request: " + getpull.data[0].title);
					interaction.channel.send("URL: " + getpull.data[0].html_url)
					console.log(getpull);
				}else{
					interaction.channel.send("No Open PULL Requests")
				}
			}catch (error){
				console.error(error);
			}
		})();
	}
});
client.login(secret.key);
