// Whenever a message is sent, this event is fired off and checks if it's a command, and then executes said command

// Imports
const { Events } = require('discord.js');
const { getPrefix, getRestriction } = require('../queries.js');

// Command
module.exports = {
    name: Events.MessageCreate,
    async execute(message, arguments) {
        // Early exits
        // Check channel restriction
        if (message.author.bot) return; // is bot
        const prefix = await getPrefix(message.guildId);
        // A message with prefix is a command
        if (!message.content.startsWith(prefix)) return;
        if (message.content.startsWith('..')) return;

        // Get args
        const args = message.content.toLowerCase().split(" ");

        // Find command and arguments
        const commandName= args[0].substring(prefix.length).toLowerCase();
        const command = message.client.commands.get(commandName);
        // Check existence of command
        if (!command)
        {
            const del = await message.reply(`${message.content} does not exist`)
            setTimeout(() => {del.delete()}, 3000);
        }
        else
        {
            // Call restrict command regardless of channel
            if (commandName === 'restrict')
            {
                await command.execute(message, args);
                return
            }

            // Check if message in right channel
            const restriction = await getRestriction(message.guildId, message.channelId);
            if (restriction) // Allow restrict command in any channel
            {
                if (message.channelId != restriction)
                {
                    const sentMessage = await message.reply("Wrong channel. Use the restrict command to change it");
                    setTimeout(() => { sentMessage.delete(); }, 5000)
                    return
                }


            }
            // call commands
            await command.execute(message, args);
        }

        // Log user's command
        console.log(`User '${message.author.username}' executed: '${commandName}'`);
    }
}