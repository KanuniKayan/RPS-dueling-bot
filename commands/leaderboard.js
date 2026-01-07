// A command to display the global top 10 leaderboard

// Imports
const { EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require("../queries");

// Command
module.exports = {
    name: 'leaderboard',
    aliases: ['leader', 'board', 'top', 'scoreboard', 'scores'],
    description: 'shows the leaderboard',
    async execute(message, args) {
        try {
            // Set temporary embed while loading leaderboard
            const loadingEmbed = new EmbedBuilder()
                .setTitle(`Loading leaderboard`)
                .addFields({name: '', value: `...`});

            const initialReply = await message.reply({
                embeds: [loadingEmbed],
            });
            console.log('Loading leaderboard');

            // Get leaderboard
            const leaderboard = await getLeaderboard();

            let string = ''; // Initialize string for building
            // Insert top 10 into embed
            for (let i = 0; i < leaderboard.length; i++) {
                string += `**${i + 1} - ${leaderboard[i].name} [Level ${leaderboard[i].level}]**\nWins: ${leaderboard[i].wins} - Total Duels: ${leaderboard[i].duels}\n`;
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle("Top Players")
                .addFields({name: '', value: `${string}`});

            await initialReply.edit({
                embeds: [embed]
            });

            console.log(`Leaderboard shown`);
        } catch (error) {
            console.error(`An error occurred in leaderboard.`, error);
            message.reply(`Something went wrong. Try again later.`);
        }
    }
}