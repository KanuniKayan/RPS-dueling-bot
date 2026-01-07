// Displaying ready state of client

// Imports
const { Events } = require('discord.js');
const { getDiscordUsers } = require('../queries.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        await getDiscordUsers(client);
        console.log(`Bot online!`);
    }
}