// Importing modules
const config = require('./config.json');
const Discord = require('discord.js');
const Helpers = require('./helpers');
const path = require('path');
const schedule = require('node-schedule');

/*
	+------------------------+
	|INITIALIZING DISCORD BOT|
	+------------------------+
*/
const client = new Discord.Client();

client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);

	const rule = new schedule.RecurrenceRule();
	rule.hour = config.uploadHr;
	rule.minute = config.uploadMin;

	// eslint-disable-next-line no-unused-vars
	const scheduledDailyUpload = schedule.scheduleJob(rule, function() {
		console.log('Executed uploadCatImage on scheduled time at ' + new Date() + '\n');
		uploadCatImage();
	});

	// eslint-disable-next-line no-unused-vars
	const intervalRule15s = '*/30 * * * * *';
/*
	// eslint-disable-next-line no-unused-vars
	const intervalUpload = schedule.scheduleJob(intervalRule15s, function() {
		console.log('Executed uploadCatImage on 15 second interval at ' + new Date() + '\n');
		uploadCatImage();
	}); */
});

/*
	+-----------------------------------+
	|FUNCTIONS FOR HANDLING BOT COMMANDS|
	+-----------------------------------+
*/
/*
!help: Lists out all available commands the bot has.
NOTE FOR FUTURE IMPROVEMENT: add command that allows user to specify a specific command to get more information on. For example, a user could type out '!help [some-command-without-prefix]' to get more information about how a specific command works.
*/
client.on('message', msg => {
	if (msg.content === `${config.prefix}help`) {
		const commandsStr = config.commands.map(command => config.prefix + command).join(', ');
		const helpMsg = `These are all the available commands you can use for this bot: ${commandsStr}`;
		msg.channel.send(helpMsg);
	}
});

/*
!info: Logs the frequency of cat pics uploaded per day, at what time the cat pics are uploaded, and how many cat pics have been uploaded so far (over bot lifetime).
*/
client.on('message', msg => {
	if (msg.content === `${config.prefix}info`) {
		const totalCatPicsStr = `Number of cat pics uploaded in total: ${config.totalCatPicsUploaded}`;
		const uploadTimeStr = `Time of uploads: ${config.uploadTime}`;
		const catPicsStr = `Number of cat pics uploaded per day: ${config.picsPerUpload}`;
		const formattedInfoStr = `${totalCatPicsStr}\n${uploadTimeStr}\n${catPicsStr}`;

		const embed = new Discord.MessageEmbed()
			.setTitle('Bot settings and statistics')
			.setDescription(formattedInfoStr);
		msg.channel.send({ embed });
	}
});

/*
	+------------------------------------------+
	|FUNCTIONS FOR UPLOADING DAILY CAT PICTURES|
	+------------------------------------------+
*/
const uploadCatImage = function() {
	// Get a list of all the images that haven't been sent yet in this cycle
	const imgFileNames = Helpers.pullImgFileNames(config.srcImgFolder);
	// console.log(`imgNames: ${imgFileNames}`);

	// Get random image from list of available images
	const randCatImageFileName = Helpers.selectRandImg(imgFileNames);

	// Create embedded message with cat image attached
	const attachment = new Discord.MessageAttachment(path.join(config.pathToImgs, randCatImageFileName), randCatImageFileName);
	const embed = new Discord.MessageEmbed()
		.attachFiles(attachment)
		.setImage(`attachment://${randCatImageFileName}`);

	// Send embedded message to text channel
	client.channels.cache.get(config.targetChannelId).send({ embed })
		// eslint-disable-next-line no-unused-vars
		.then(message => {
			Helpers.moveImg(randCatImageFileName, config.srcImgFolder, config.destinationImgFolder);

			// If all the images have been sent before in this current cycle, reset source image folder
			if (imgFileNames.length === 1) {
				Helpers.resetAllImgs();
				console.log('Resetting image upload cycle');
			}
		})
		.catch(console.error);
};

// For instant testing of uploadCatImage()
client.on('message', msg => {
	if (msg.content === `${config.prefix}testUpload`) {
		uploadCatImage();
	}
});

// Logs bot into the Discord server
client.login(config.token);