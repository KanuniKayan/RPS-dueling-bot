// A command to display a player's items

// Imports
const { EmbedBuilder } = require('discord.js');
const {getPersonals, getCurrency, getInventory} = require("../queries");

// Command
module.exports = {
    name:'items',
    aliases: ['inventory', 'inv', 'item'],
    description:'shows your items',
    async execute(message, args){
        try {
            // Get player info
            const id = message.author.id;
            const player = await getInventory(id);
            const pers = await getPersonals(id);
            const currency = await getCurrency(id);
            const charm = pers.charm || '';

            // Build item message manually
            let itemsMessage = `**Items:**\n`;
            itemsMessage += `**Commons**\n`;
            for (const item of player.commons || '') {
                itemsMessage += `[${item}] `;
            }
            itemsMessage += `\n**Uncommons**\n`
            for (const item of player.uncommons || '') {
                itemsMessage += `[${item}] `;
            }
            itemsMessage += `\n**Rares**\n`
            for (const item of player.rares || '') {
                itemsMessage += `[${item}] `;
            }
            itemsMessage += `\n**Epics**\n`
            for (const item of player.epics || '') {
                itemsMessage += `[${item}] `;
            }
            itemsMessage += `\n**Legendaries**\n`
            for (const item of player.legendaries || '') {
                itemsMessage += `[${item}] `;
            }
            itemsMessage += `\n`


            // Build embed
            const embed = new EmbedBuilder()
                .setTitle(`${charm} ${message.author.globalName}'s items`)
                .addFields(
                    {name: '', value: `${itemsMessage}`},
                    {
                        name: '',
                        value: `**Rolls:** ${currency.rolls}\n**Tokens:** ${currency.tokens}\n**Duplidust:** ${currency.duplidust}`
                    }
                )
                .setFooter({text: 'Use exchange for more rolls. Customize with set [charm/banner]!'});

            // Display items
            await message.reply({
                embeds: [embed],
            })
        } catch (error) {
            console.error(`An error occurred in items.`, error);
            message.reply(`Something went wrong. Try again later.`);
        }

    }
}