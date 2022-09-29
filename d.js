const { Client, GatewayIntentBits, Discord, REST, Routes } = require('discord.js');
const { Octokit } = require('octokit');
require('dotenv').config()
const { channel } = require('node:diagnostics_channel');
const wait = require('node:timers/promises').setTimeout;
secret = require("./secret.js");
const commands = [
	{
		name: 'test',
		description: 'testing',
	},
	{
		name: 'pulls',
		description: 'list active pull request'
	}
];

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

	const guild = await client.guilds.fetch(secret.GUILD_ID);
	const channel = guild.channels.cache.get(secret.CHANNEL_ID);
	const message = await channel.messages;

	message.channel.send("Hi! I'm Squawk! ```/pulls (to see latest pull request)``` ");

});

be_quiet = false;
client.on('messageCreate', async msg => {
	const guild = await client.guilds.fetch(secret.GUILD_ID);
	const channel = guild.channels.cache.get(secret.CHANNEL_ID);
	const message = await channel.lastMessage;

	/*simplify later*/
	console.log(msg.content);

	var user = 'skazz';

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

client.on('typingStart', (channel, user) => {
	console.log("hi");
});

client.on('interactionCreate', async interaction => {
	if(!interaction.isChatInputCommand()) return;

	if(interaction.commandName === 'test') {
		interaction.reply('Was this a good squawk?');
		const message = await interaction.fetchReply();
		message.react('😄');
		message.channel.send("OKAY");
	}

	if(interaction.commandName === 'pulls'){
		(async () => {
			try{
				const getpull =  await octokit.request('GET /repos/{owner}/{repo}/pulls',  {
					owner: 'lefth-nd',
					repo: 'Rohan'
				})
				if(getpull.data.length != 0){
					interaction.reply("New Pull Request: " + getpull.data[0].title);
					interaction.channel.send("URL: " + getpull.data[0].html_url)
					console.log(getpull);
				}else{
					interaction.channel.send("No Open Pull Requests")
				}
			}catch (error){
				console.error(error);
			}


		})();


	}



});

client.login(secret.key);
