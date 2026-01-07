// A command to display a player's score with

// Imports
const { EmbedBuilder } = require('discord.js');
const { getScore } = require("../queries");

// Command
module.exports = {
    name: 'score',
    aliases: ['level', 'lvl', 'info', 'profile'],
    description: 'display your rock-paper-scissor score',
    async execute(message, args) {
        try {
            // Get score
            const id = message.author.id;
            const score = await getScore(id);
            const charm = score.charm || '';

            // Build string
            const string = `*[Level ${score.level}] [Exp: ${score.exp}/5]*\n**Duels:** ${score.duels}\n**Wins:** ${score.wins}\n` +
                `**Losses:** ${score.losses}\n**Rounds:** ${score.rounds}`;

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(`${charm} ${message.author.globalName}'s score`)
                .addFields(
                    {name: '', value: `${string}`},
                );

            // Show embed
            await message.reply({embeds: [embed]});
        } catch (error) {
            console.error(`An error occurred in score.`, error);
            message.reply(`Something went wrong. Try again later.`);
        }
    }
}