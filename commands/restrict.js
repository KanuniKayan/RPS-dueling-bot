// A command to restrict the usage of commands to a specific channel

// Imports
const { PermissionsBitField } = require('discord.js');
const { setRestriction } = require("../queries");

// Commands
module.exports = {
    name: 'restrict',
    description: 'restrict the bot to a specific channel',
    async execute(message, args) {
        try {
            // Check for permission
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
            {
                console.log('Missing permissions');
                message.reply(`Missing permissions`);
                return;
            }

            // Restrict to specific channel
            const result = await setRestriction(message.guildId, message.channelId);
            if (result) {
                message.reply(`Restriction sucessfully set`);
            }
            else
            {
                message.reply(`Could not set restriction.`);
            }
        } catch (error) {
            await message.reply(`Something went wrong restriction to this channel.`);
            console.error(`Something went wrong with restricting to channel.`, error);
        }
    }
}