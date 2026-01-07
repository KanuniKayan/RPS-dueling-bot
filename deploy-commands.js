// Code taken from: https://discordjs.guide/legacy/app-creation/deploying-commands
// This code pushes and updates the slash commands to discord.
// Because discord limits the amount of times you can do it, it's best done this way to keep it under that amount.
// In the last section, you can choose between updating it for a specific server or all servers the bot is in.
// This distinction is great for changing it only in a test environment

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier

const foldersPath = path.join(__dirname, 'commands');
const commandsPath = path.join(foldersPath, 'slashCommands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        // For specific server
        const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        // For entire bot
        // const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();