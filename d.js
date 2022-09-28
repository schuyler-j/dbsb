const { Client, GatewayIntentBits, Discord, REST, Routes } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
secret = require("./secret.js");
const commands = [
	{
		name: 'test',
		description: 'testing',
	},
];

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
	{intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions]}
);


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', msg => {
	if(msg.content === 'h') {
		msg.reply('squawk');
		console.log('got it');
	}else{
		console.log('nope');
		msg.react('😡');
	}
});

/*hmm>?
client.on('typingStart', (channel, user) => {
	console.log("hi");
})
*/


client.on('interactionCreate', async interaction => {
	if(!interaction.isChatInputCommand()) return;

	if(interaction.commandName === 'test') {
		interaction.reply('Was this a good squawk?');
		const message = await interaction.fetchReply();
		message.react('😄');
	}
});

client.login(secret.key);
