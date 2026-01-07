// A command to customize your charm or banner

// Imports
const { EmbedBuilder } = require('discord.js'); // For future -> incase I want to add a preview display
const { getPersonals, getInventory, setPers } = require("../queries");

// Command
module.exports = {
    name: 'set',
    description: 'Change your personalizations! set [charm/banner] [emoji]',
    async execute(message, args) {
        try {

            // Command Checks
            if (args.length !== 3) {
                await message.reply("Usage: set [charm/banner] [emoji]");
                return;
            }
            let type = args[1].toLowerCase();
            if (type !== 'charm' && type !== 'banner') {
                await message.reply("Usage: set [charm/banner] [emoji]");
                return;
            }
            if (typeof (args[2]) !== 'string') {
                await message.reply("Must be a valid emoji");
                return;
            }
            const emoji = args[2];

            // Get personalization
            const id = message.author.id;
            const inv = await getInventory(id);

            // Removing duplicate id column from object
            delete inv.user_id;

            // Find emoji
            for (const rarity of Object.values(inv)) {
                if (rarity.includes(emoji)) {
                    // Set emoji
                    if (await setPers(type, emoji, id)) {
                        type = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize first character
                        await message.reply(`${type} ${emoji} has successfully been set`);
                        return;
                    }
                }
            }
            await message.reply("Item not found in inventory.");

        } catch (error) {
            console.error(`An error occurred in set personalization.`, error);
            await message.reply(`Something went wrong. Try again later`);
        }

    }
}