const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        console.log('Command: ' + command);

        if (!command) {
            await interaction.reply(`${interaction.commandName} not found`);
            return;
        }

        command.execute(interaction);
    }
}