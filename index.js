require('dotenv').config({ path: __dirname + '/.env' });
const token = process.env.DISCORD_TOKEN;
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Create collection for commands
const client = require('./client.js');
client.commands = new Collection();

// Access commands folders
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const slashCommandsPath = path.join(commandsPath, 'slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

// Load commands
for (const file of commandFiles)
{
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.name, command);
    console.log(`Loaded command: ${command.name}`);

    // Register aliases
    if (command.aliases) {
        for (const alias of command.aliases) {
            client.commands.set(alias, command);
            console.log(`Loaded alias: ${alias}`);
        }
    }
}

// Load slash commands
for (const file of slashCommandFiles)
{
    const filePath = path.join(slashCommandsPath, file);
    const slashCommand = require(filePath);

    client.commands.set(slashCommand.data.name, slashCommand);
    console.log(`Loaded slash command: ${slashCommand.data.name}`);

    // Register aliases
    if (slashCommand.aliases) {
        for (const alias of slashCommand.data.aliases) {
            client.commands.set(alias, slashCommand);
            console.log(`Loaded alias: ${alias}`);
        }
    }
}

// Load event listeners
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token);

module.exports = { client };