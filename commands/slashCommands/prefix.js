// A slash command that allows you to set a prefix for your server

// Imports
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { setPrefix} = require('../../queries');

// Command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('change prefix for commands')
        .addStringOption((option) => option
            .setName('prefix')
            .setDescription('Change prefix for commands')
            .setRequired(true)
        ),
    async execute(interaction) {

        // Allow only administrators of servers to use this command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))
        {
            console.log('Missing permissions');
            interaction.reply(`Missing permissions`);
            return;
        }

        // Collect id and prefix
        const server_id = interaction.guildId;
        const prefix = interaction.options.getString('prefix');
        if (prefix.length > 3)
        {
            console.log('Prefix too long');
            interaction.reply(`Prefix must be 3 characters or less.`);
            return;
        }

        try {
            // Apply prefix
            const result = await setPrefix(server_id, prefix);
            if (result)
            {
                await interaction.reply(`Prefix has been changed to ${prefix}`);
                console.log(`Prefix for server ${interaction.guildId} has been changed to ${prefix}`);
            }
            else
            {
                await interaction.reply(`Something went wrong applying this prefix`);
                console.log(`Could not change prefix for server ${interaction.guildId} with prefix ${prefix}`);
            }
        } catch {
            console.log(`Something went wrong applying prefix ${prefix} for server ${interaction.guildId}`);
        }
    }
}