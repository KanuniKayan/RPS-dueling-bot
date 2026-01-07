// Command to exchange currency for rolls

// Imports
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags} = require('discord.js');
const { rollPrice } = require('../config');
const { getCurrency, getPersonals, setCurrency } = require("../queries");

// Commands
module.exports = {
    name: 'exchange',
    aliases: ['ex'],
    description: `exchange your tokens or duplidust for rolls. 'ex' for short!`,
    async execute(message, args) {
        try {

            // Collect player stats
            const id = message.author.id;
            let currency = await getCurrency(id);
            const per = await getPersonals(id);
            const charm = per.charm || '';
            const tokenPrice = 1;

            // Build Buttons
            const tokensButton = new ButtonBuilder().setCustomId('token-exchange').setLabel(`Exchange a token`).setStyle(ButtonStyle.Success);
            const disabledTokensButton = new ButtonBuilder().setCustomId('disabled-token-exchange').setLabel('No tokens available').setStyle(ButtonStyle.Success).setDisabled(true);
            const duplidustButton = new ButtonBuilder().setCustomId('duplidust-exchange').setLabel(`Exchange ${rollPrice} duplidust`).setStyle(ButtonStyle.Success);
            const disabledDuplidustButton = new ButtonBuilder().setCustomId('disabled-duplidust-exchange').setLabel(`Not enough duplidust (${rollPrice})`).setStyle(ButtonStyle.Success).setDisabled(true);

            // Build Embed
            let embed = new EmbedBuilder()
                .setTitle(`**${charm} ${message.author.globalName}'s exchange**`)
                .addFields(
                    {name: '', value: `**Rolls:** ${currency.rolls}`},
                    {name: '', value: `**Tokens:** ${currency.tokens}\n**Duplidust:** ${currency.duplidust}`}
                );

            // Save initial interaction for editing
            let initialRow = createRow(currency);
            const initialMessage = await message.reply({
                embeds: [embed],
                components: [initialRow],
            })

            // Create message collector
            let collector;
            const collectorFilter = (i) => {
                return i.message.id === initialMessage.id && i.user.id === message.author.id;
            }
            startCollector();

            function startCollector() {
                collector = message.channel.createMessageComponentCollector({
                    filter: collectorFilter,
                    componentType: ComponentType.Button,
                    time: 60_000
                })

                collector.on('collect', async (i) => {
                    // Check for correct id
                    if (i.user.id != id)
                    {
                        await i.reply({
                            content: 'This is not your exchange',
                            flags: MessageFlags.Ephemeral,
                        });
                        return
                    }

                    // Get current currency
                    currency = await getCurrency(id);

                    // Exchange
                    if (i.component.data.custom_id === 'token-exchange') {
                        if (currency.tokens >= tokenPrice) {
                            // minus wins
                            currency.tokens -= tokenPrice;
                            // add +1 to rolls
                            currency.rolls++
                            console.log(`${message.author.globalName} exchanged ${tokenPrice} token!`);
                        }
                    }
                    if (i.component.data.custom_id === 'duplidust-exchange') {
                        if (currency.duplidust >= rollPrice) {
                            // minus duplidust
                            currency.duplidust -= rollPrice;
                            // add +1 to rolls
                            currency.rolls++
                            console.log(`${message.author.globalName} exchanged ${rollPrice} duplidust`);
                        }
                    }

                    // Set new currency for database
                    await setCurrency(currency);

                    collector.stop()

                    // Display updated embed
                    const embed = new EmbedBuilder()
                        .setTitle(`**${charm} ${message.author.globalName}'s exchange**`)
                        .addFields(
                            {name: '', value: `**Rolls:** ${currency.rolls}`},
                            {name: '', value: `**Tokens:** ${currency.tokens}\n**Duplidust:** ${currency.duplidust}`}
                        );
                    const newRow = createRow(currency);
                    await i.update({
                        embeds: [embed],
                        components: [newRow],
                    });

                    // Restart collector clock
                    startCollector();
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === 'time') {
                        console.log(`Ending exchange for ${message.author.globalName} - ${message.author.id}`);
                        const embed = new EmbedBuilder()
                            .setTitle(`**${charm} ${message.author.globalName}'s exchange**`)
                            .addFields(
                                {name: '', value: `**Rolls:** ${currency.rolls}`},
                                {
                                    name: '',
                                    value: `**Tokens:** ${currency.tokens}\n**Duplidust:** ${currency.duplidust}`
                                }
                            );
                        await initialMessage.edit({
                            embeds: [embed],
                            components: [],
                        })
                    }
                });
            }

            // Turn buttons on or off depending on amount of currencies available
            function createRow(currency) {
                let row;
                // Show active or disabled buttons depending on player's resources
                // no tokens yes duplidust
                if (currency.tokens < tokenPrice && currency.duplidust >= rollPrice) {
                    row = new ActionRowBuilder().addComponents(disabledTokensButton, duplidustButton);
                }
                // yes tokens no duplidust
                else if (currency.duplidust < rollPrice && currency.tokens >= tokenPrice) {
                    row = new ActionRowBuilder().addComponents(tokensButton, disabledDuplidustButton);
                }
                // yes both
                else if (currency.duplidust >= rollPrice && currency.tokens >= tokenPrice) {
                    row = new ActionRowBuilder().addComponents(tokensButton, duplidustButton);
                }
                // no both
                else {
                    row = new ActionRowBuilder().addComponents(disabledTokensButton, disabledDuplidustButton);
                }

                return row
            }

        } catch (error) {
            console.error(`An error occurred in exchange.`, error);
            message.reply(`Something went wrong. Try again later.`);
        }



    }
}