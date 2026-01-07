const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('bye').setDescription('say bye to the bot'),
    async execute(interaction) {
        await interaction.reply(`bye, ${interaction.user.globalName}!`);
    }
}