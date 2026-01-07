// The main command.
// Dueling other players in rock paper scissors.

// Imports
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');
const { getPrefix, getDuel } = require('../queries');

// Command
module.exports = {
    name: 'duel',
    aliases: ['deul', 'd'],
    description: 'duel a person in rock paper scissors! duel @person goal',
    async execute(message, args) {
        try {
            // Get prefix
            const prefix = getPrefix(message.guildId);

            // Check command usage
            if (args.length !== 2) {
                await message.reply(`Usage: ${prefix}duel @person`);
                return;
            }

            // Establish players
            const player1 = message.author;
            let player2;
            try {
                player2 = message.mentions.members.first().user;
            } catch {
                await message.reply(`Usage: ${prefix}duel @person`);
                return;
            }

            // Check user validity
            if (player2) {
                if (player2.bot) {
                    await message.reply(`Cannot duel a bot`);
                    return;
                }
            }
            else
            {
                await message.reply(`Cannot find mentioned user.`);
                return;
            }

            // Building Displays
            // Build Pick Buttons
            const rockButton = new ButtonBuilder().setCustomId('rock-button').setLabel('Rock').setEmoji('🪨').setStyle(ButtonStyle.Success);
            const paperButton = new ButtonBuilder().setCustomId('paper-button').setLabel('Paper').setEmoji('📜').setStyle(ButtonStyle.Success);
            const scissorsButton = new ButtonBuilder().setCustomId('scissors-button').setLabel('Scissors').setEmoji('✂️').setStyle(ButtonStyle.Success);

            // Build filler buttons
            const filler1 = new ButtonBuilder().setCustomId('filler1').setLabel('...').setStyle(ButtonStyle.Secondary).setDisabled(true);
            const filler2 = new ButtonBuilder().setCustomId('filler2').setLabel('...').setStyle(ButtonStyle.Secondary).setDisabled(true);
            const filler3 = new ButtonBuilder().setCustomId('filler3').setLabel('...').setStyle(ButtonStyle.Secondary).setDisabled(true);
            const filler4 = new ButtonBuilder().setCustomId('filler4').setLabel('...').setStyle(ButtonStyle.Secondary).setDisabled(true);

            // Build 'Play Again' button
            const playAgainButton = new ButtonBuilder().setCustomId('play-again').setLabel('Play Again').setStyle(ButtonStyle.Secondary);

            // Build Container
            const gameRow = new ActionRowBuilder().addComponents(rockButton, paperButton, scissorsButton);
            const playAgainRow = new ActionRowBuilder().addComponents(playAgainButton);


            // Get players from database
            const players = await getDuel(player1.id, player2.id);
            if (!players) {
                message.reply(`Something went wrong. Try again`);
                return;
            }
            // Order players according to their id's
            let player1row;
            let player2row;
            if (players.length > 1) {
                for (const player of players) {
                    if (players[0].id === (player1.id).toString())
                    {
                        player1row = players[0];
                        player2row = players[1];
                    } else {
                        player1row = players[1];
                        player2row = players[0];
                    }
                }
            }
            else
            {
                // For when battling yourself (This won't add to scores cuz it's always a tie);
                player1row = players[0];
                player2row = players[0];
            }

            // Set winning amount
            let winAmount = 5;

            // Amount of EXP gained after end
            const winExp = 2;
            const lossExp = 1;
            const requiredExp = 5;

            // Player scores of this match
            let player1score = 0;
            let player2score = 0;

            // Set player charm. Using OR operator to assign default value if found null or undefined
            let player1charm = player1row.charm || '';
            let player2charm = player2row.charm || '';

            // Set player banner
            const banner = player1row.banner || '';

            // Set banner sizing
            const headerLength = (`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`).length;
            const bannerFiller = -8;
            const bannerLength = (headerLength / 2) + bannerFiller;
            let bannerTop = '';
            for (let i = 0; i < bannerLength; i++) {
                bannerTop += `${banner} `;
            }


            // Build Starting Embed
            let embed = new EmbedBuilder()
                .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                .addFields(
                    {name: '', value: `${bannerTop}`},
                    {name: '', value: `First to ${winAmount} wins! Click a button to pick!`},
                    {name: '', value: `${bannerTop}`},
                );

            // Initialize picks
            let pick1 = '';
            let pick2 = '';
            let pick1emoji = '';
            let pick2emoji = '';

            // Display Container
            let initialMessage = await message.reply({
                embeds: [embed],
                components: [gameRow],
                withResponse: true,
            });

            console.log(`${player1.globalName} is dueling ${player2.globalName}`);

            // Standard round embed
            embed = new EmbedBuilder()
                .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                .addFields(
                    {name: '', value: `${bannerTop}`},
                    {name: '', value: `Pick your pick!`},
                    {name: '', value: `${bannerTop}`},
                );

            // Collection is done in a way to restart the timer.
            // Collector filter
            let collector;
            const collectorFilter = (i) => {
                return i.message.id === initialMessage.id;
            }

            function startCollector() {
                // Response collector
                collector = message.channel.createMessageComponentCollector({filter: collectorFilter, componentType: ComponentType.Button, time: 60_000})

                collector.on('collect', async (i) => {
                    // Check for correct players
                    if (i.user.id === player1.id || i.user.id === player2.id) {
                        // Start game again from scratch
                        if (i.component.data.label === 'Play Again')
                        {
                            await playAgain(i);
                        }
                        else
                        {
                            // Picking phase
                            // Player 1 has picked
                            if (i.user.id === player1.id) {
                                pick1 = i.component.data.label;
                                pick1emoji = i.component.data.emoji.name;

                                embed = new EmbedBuilder()
                                    .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                                    .addFields(
                                        {name: '', value: `${bannerTop}`},
                                        {name: '', value: `${player1.globalName} has picked`},
                                        {name: '', value: `${bannerTop}`},
                                    );
                            }
                            // Player 2 has picked
                            if (i.user.id === player2.id) {
                                pick2 = i.component.data.label;
                                pick2emoji = i.component.data.emoji.name;
                                embed = new EmbedBuilder()
                                    .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                                    .addFields(
                                        {name: '', value: `${bannerTop}`},
                                        {name: '', value: `${player2.globalName} has picked`},
                                        {name: '', value: `${bannerTop}`},
                                    );
                            }

                            // Both have picked
                            if (pick1 !== '' && pick2 !== '') {
                                await playGame(i, player1.globalName, player2.globalName, pick1, pick2, pick1emoji, pick2emoji);
                            }
                            else
                            {
                                // Refreshing interaction to catch pick
                                await i.update({
                                    embeds: [embed],
                                })
                            }
                        }
                    }
                    else
                    {
                        // Not a player
                        await i.reply({
                            content: 'This is not your duel',
                            flags: MessageFlags.Ephemeral,
                        });
                    }
                });

                // Time reached
                collector.on('end', async (collected, reason) => {

                    if (reason === 'time') {
                        // Display who wins
                        let embed;
                        if (player1score > player2score) {
                            embed = new EmbedBuilder()
                                .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                                .addFields(
                                    {name: '', value: `${bannerTop}`},
                                    {name: '', value: `${player1charm} ${player1.globalName} has won!`},
                                    {name: '', value: `${bannerTop}`},
                                );
                        }
                        else if (player1score < player2score) {
                            embed = new EmbedBuilder()
                                .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                                .addFields(
                                    {name: '', value: `${bannerTop}`},
                                    {name: '', value: `${player2charm} ${player2.globalName} has won!`},
                                    {name: '', value: `${bannerTop}`},
                                );
                        }
                        else if (player1score === player2score) {
                            embed = new EmbedBuilder()
                                .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                                .addFields(
                                    {name: '', value: `${bannerTop}`},
                                    {name: '', value: `Game finished in a tie!`},
                                    {name: '', value: `${bannerTop}`},
                                );
                        }
                        else {
                            embed = new EmbedBuilder()
                                .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                                .addFields(
                                    {name: '', value: `${bannerTop}`},
                                    {name: '', value: `Game has ended`},
                                    {name: '', value: `${bannerTop}`},
                                );
                        }

                        try {
                            initialMessage.edit({
                                embeds: [embed],
                                components: [],
                            });
                        } catch {
                            console.log(`Could not update initial message`);
                        }

                        console.log(`Collection ended: ${reason}`);
                    }
                    else if (reason === 'win') {
                        // Check for level-ups
                        if (player1row.exp === requiredExp)
                        {
                            player1row.level += 1;
                            player1row.exp = 0;
                            player1row.tokens += 1;
                            await message.channel.send(`${player1row.name} has leveled up to ${player1row.level}!`);
                        }
                        else if (player1row.exp > requiredExp)
                            // If for some reason it is greater than 6, I'm choosing not to add more,
                            // but rather keep the +1
                        {
                            player1row.level += 1;
                            player1row.exp = 1;
                            player1row.tokens += 1;
                            await message.channel.send(`${player1row.name} has leveled up to ${player1row.level}!`);
                        }

                        if (player2row.exp === requiredExp)
                        {
                            player2row.level += 1;
                            player2row.exp = 0;
                            player2row.tokens += 1;
                            await message.channel.send(`${player2row.name} has leveled up to ${player2row.level}!`);
                        }
                        else if (player2row.exp > requiredExp)
                        {
                            player2row.level += 1;
                            player2row.exp = 1;
                            player2row.tokens += 1;
                            await message.channel.send(`${player2row.name} has leveled up to ${player2row.level}!`);
                        }

                        // Update scores in database
                        await setDuel(player1row);
                        await setDuel(player2row);

                        // setLevel()
                        console.log(`Collection ended: ${reason}`);
                    }
                })
            }

            startCollector();

            async function playGame(i, player1name, player2name, pk1, pk2)
            {
                // Determine round winner
                let reply = ''
                if (
                    pk1 === 'Rock' && pk2 === 'Scissors' ||
                    pk1 === 'Scissors' && pk2 === 'Paper' ||
                    pk1 === 'Paper' && pk2 === 'Rock'
                ) {
                    // Player 1 wins
                    reply = `**${player1charm} ${player1.globalName}** wins!`;
                    player1score++;
                }
                else if (pk1 === pk2) {
                    // Tied
                    reply = `It's a **tie!**`
                }
                else {
                    // Player 2 wins
                    reply = `**${player2charm} ${player2.globalName}** wins!`
                    player2score++;
                }

                // Add round to players' stats
                player1row.rounds++;
                player2row.rounds++;

                reply += ` ${pick1emoji}**${pk1}** vs. **${pk2}**${pick2emoji}`

                // Match won or go next round
                if (player1score >= winAmount || player2score >= winAmount) {
                    // Decide match winner
                    let gameWinner;
                    if (player1score >= winAmount) {
                        gameWinner = `${player1charm} ${player1name}`; // Display
                        player1row.wins++; // Add to stats
                        player1row.exp += winExp;

                        player2row.losses++;
                        player2row.exp += lossExp;
                    }
                    else if (player2score >= winAmount) {
                        gameWinner = `${player2charm} ${player2name}`;
                        player1row.losses++;
                        player1row.exp += lossExp;

                        player2row.wins++;
                        player2row.exp += winExp;
                    }

                    // Add to total duels played stat
                    player1row.duels++;
                    player2row.duels++;

                    // Display winner
                    const embed = new EmbedBuilder()
                        .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                        .addFields(
                            {name: '', value: `${bannerTop}`},
                            {name: '', value: `**${gameWinner}** has won the match!`},
                            {name: '', value: `**${pick1emoji}${pk1} vs. ${pk2}${pick2emoji}**`},
                            {name: '', value: `${bannerTop}`},
                        );

                    // Stop collector from win to initialize saving to database
                    collector.stop('win');
                    startCollector();

                    // Display 'Play Again' option
                    await i.update({
                        embeds: [embed],
                        components: [playAgainRow],
                    });
                }
                // Go to next round
                else
                {
                    let embed = new EmbedBuilder()
                        .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                        .addFields(
                            {name: '', value: `${bannerTop}`},
                            {name: '', value: `${reply}`},
                            {name: '', value: `${bannerTop}`},
                        );

                    const fillerRow = new ActionRowBuilder()
                        .addComponents(filler1, filler2, filler3, filler4);

                    // Update game display
                    await i.update({
                        embeds: [embed],
                        components: [fillerRow],
                        withResponse: true,
                    });

                    embed = new EmbedBuilder()
                        .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                        .setFields(
                            {name: '', value: `${bannerTop}`},
                            {name: '', value: `Pick your pick!`},
                            {name: '', value: `${bannerTop}`},
                        );

                    // Reset picks
                    pick1 = '';
                    pick2 = '';

                    setTimeout(async () => {
                        collector.stop('refresh');
                        startCollector();
                        await i.editReply({
                            embeds: [embed],
                            components: [gameRow],
                        })
                    }, 2500);
                }


            }

            // Play again function. Reset scores and update embed. Restart the game.
            async function playAgain(i) {
                collector.stop('restart');
                pick1 = '';
                pick2 = '';
                player1score = 0;
                player2score = 0;

                const embed = new EmbedBuilder()
                    .setTitle(`**${player1charm} ${player1.globalName} - ${player1score} VS ${player2score} - ${player2.globalName} ${player2charm}**`)
                    .addFields(
                        {name: '', value: `${bannerTop}`},
                        {name: '', value: `First to ${winAmount} wins! Click a button to pick!`},
                        {name: '', value: `${bannerTop}`},
                    );
                i.update({
                        embeds: [embed],
                    components: [gameRow],
                    withResponse: true,
                });
                startCollector();
            }

        } catch (error) {
            console.error(`Something went wrong in duel.js`, error);
        }
    }
}