// The rolling command! Roll tokens for emoji's which you can customize your dueling field with

// Imports
const { EmbedBuilder } = require('discord.js');
const { getRolls, setRolls } = require("../queries");

// Command
module.exports = {
    name: 'roll',
    aliases: ['rol'],
    description: 'roll a cosmetics lootbox',
    async execute(message, args) {
        try {
            // Get player's info
            const id = message.author.id;
            const player = await getRolls(id);
            const charm = player.charm || '';

            // Check if player has enough to roll
            if (player.rolls < 1) {
                message.reply(`No rolls available. Get more with 'exchange'!`);
                return;
            }

            // Take a roll away
            player.rolls--;

            // Get rolls
            let rolls = [];
            for (let i = 0; i < 5; i++) {
                rolls.push(getRandomNumber(0, 100));
            }
            // Sort from most common to rarest
            rolls.sort((a, b) => a - b);


            // Collect items
            let items = [];
            rolls.forEach((roll) => {
                items.push(getItem(roll));
            })

            // Add rarity emojis for embed
            let rarity = [];
            items.forEach((item) => {
                if (item.rarity === 'legendary') {
                    rarity.push('🟧');
                } else if (item.rarity === 'epic') {
                    rarity.push('🟪');
                } else if (item.rarity === 'rare') {
                    rarity.push('🟦');
                } else if (item.rarity === 'uncommon') {
                    rarity.push('🟩');
                } else {
                    rarity.push('⬜');
                }
            });


            // check for duplicates
            let duplidust = 0;
            let duplidustAdd = 2; // How many duplidust per duplicate
            let duplidustMax = 6; // Maximum amount of duplidust per roll
            items.forEach((item) => {
                let respectiveInv;
                // Decide which rarity of player inventory to check
                switch (item.rarity) {
                    case 'common':
                        respectiveInv = player.commons;
                        break;
                    case 'uncommon':
                        respectiveInv = player.uncommons;
                        break;
                    case 'rare':
                        respectiveInv = player.rares;
                        break;
                    case 'epic':
                        respectiveInv = player.epics;
                        break;
                    case 'legendary':
                        respectiveInv = player.legendaries;
                        break;
                }

                // If item is not found in player's inventory, add.
                if (!(respectiveInv || []).includes(item.emoji)) {
                    respectiveInv.push(item.emoji);
                }
                // Else, don't add and instead add to duplidust
                else {
                    if (!(duplidust >= duplidustMax)) {
                        duplidust += duplidustAdd;
                    }
                }
            });
            // Insert unique's into player's inventory
            player.duplidust += duplidust;

            // Update to database
            await setRolls(player);

            // Initial reply
            let embed = new EmbedBuilder()
                .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                .addFields(
                    {name: '', value: 'Items:: [ X ] [ X ] [ X ] [ X ] [ X ]'},
                    {name: '', value: 'Rarity: [ X ] [ X ] [ X ] [ X ] [ X ]'}
                );
            const initialMessage = await message.reply({embeds: [embed]});

            // First reveal
            setTimeout(() => {
                embed = new EmbedBuilder()
                    .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                    .setFields(
                        {name: '', value: `Items::  [ ${items[0].emoji} ] [ X ] [ X ] [ X ] [ X ]`},
                        {name: '', value: `Rarity: [ ${rarity[0]} ] [ X ] [ X ] [ X ] [ X ]`}
                    );
                initialMessage.edit({embeds: [embed],})
            }, 1000);

            // Second reveal
            setTimeout(async () => {
                embed = new EmbedBuilder()
                    .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                    .setFields(
                        {name: '', value: `Items:: [ ${items[0].emoji} ] [ ${items[1].emoji} ] [ X ] [ X ] [ X ]`},
                        {name: '', value: `Rarity: [ ${rarity[0]} ] [ ${rarity[1]} ] [ X ] [ X ] [ X ]`}
                    );
                await initialMessage.edit({embeds: [embed],})
            }, 2000);

            // Third reveal
            setTimeout(async () => {
                embed = new EmbedBuilder()
                    .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                    .setFields(
                        {
                            name: '',
                            value: `Items:: [ ${items[0].emoji} ] [ ${items[1].emoji} ] [ ${items[2].emoji} ] [ X ] [ X ]`
                        },
                        {name: '', value: `Rarity: [ ${rarity[0]} ] [ ${rarity[1]} ] [ ${rarity[2]} ] [ X ] [ X ]`}
                    );
                await initialMessage.edit({embeds: [embed],})
            }, 3000);

            // Fourth reveal
            setTimeout(async () => {
                embed = new EmbedBuilder()
                    .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                    .setFields(
                        {
                            name: '',
                            value: `Items:: [ ${items[0].emoji} ] [ ${items[1].emoji} ] [ ${items[2].emoji} ] [ ${items[3].emoji} ] [ X ]`
                        },
                        {
                            name: '',
                            value: `Rarity: [ ${rarity[0]} ] [ ${rarity[1]} ] [ ${rarity[2]} ] [ ${rarity[3]} ] [ X ]`
                        }
                    );
                await initialMessage.edit({embeds: [embed],})
            }, 4000);
            // Fifth reveal
            setTimeout(async () => {
                embed = new EmbedBuilder()
                    .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                    .setFields(
                        {
                            name: '',
                            value: `Items:: [ ${items[0].emoji} ]  [ ${items[1].emoji} ]  [ ${items[2].emoji} ]  [ ${items[3].emoji} ]  [ ${items[4].emoji} ]`
                        },
                        {
                            name: '',
                            value: `Rarity: [ ${rarity[0]} ]  [ ${rarity[1]} ]  [ ${rarity[2]} ]  [ ${rarity[3]} ]  [ ${rarity[4]} ]`
                        }
                    );
                await initialMessage.edit({embeds: [embed],})
            }, 5200);

            // Display rolls and duplidust
            if (duplidust > 0) {
                embed = new EmbedBuilder()
                setTimeout(async () => {
                    embed = new EmbedBuilder()
                        .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                        .setFooter({text: `Check your inventory with the 'items' command`})
                        .addFields(
                            {
                                name: '',
                                value: `Items : [ ${items[0].emoji} ]  [ ${items[1].emoji} ]  [ ${items[2].emoji} ]  [ ${items[3].emoji} ]  [ ${items[4].emoji} ]`
                            },
                            {
                                name: '',
                                value: `Rarity: [ ${rarity[0]} ]  [ ${rarity[1]} ]  [ ${rarity[2]} ]  [ ${rarity[3]} ]  [ ${rarity[4]} ]`
                            },
                            {name: '', value: `You now have **${player.rolls} rolls remaining.**`},
                            {name: '', value: `*${duplidust} duplidust has been added*`}
                        );

                    await initialMessage.edit({embeds: [embed],})
                }, 6000);
            } else {
                setTimeout(async () => {
                    embed = new EmbedBuilder()
                        .setTitle(`**${charm} ${message.author.globalName} is rolling!**`)
                        .setFooter({text: `Check your inventory with the 'items' command`})
                        .addFields(
                            {
                                name: '',
                                value: `Items : [ ${items[0].emoji} ]  [ ${items[1].emoji} ]  [ ${items[2].emoji} ]  [ ${items[3].emoji} ]  [ ${items[4].emoji} ]`
                            },
                            {
                                name: '',
                                value: `Rarity: [ ${rarity[0]} ]  [ ${rarity[1]} ]  [ ${rarity[2]} ]  [ ${rarity[3]} ]  [ ${rarity[4]} ]`
                            },
                            {name: '', value: `You now have **${player.rolls} rolls remaining.**`}
                        );
                    await initialMessage.edit({embeds: [embed],})
                }, 6000);
            }


            //////////////////////////////////////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////////////////////////////////////


            // Random Number Generator
            function getRandomNumber(min, max) {
                return Math.floor(Math.random() * (max - min) + min); // Math.random() * (max - min) + min
            }

            function getItem(number) {

                // Legendary
                if (number >= 98) {
                    const legendary = ['🌸', '✨', '🙏', '❤️', '💀', '👑'];
                    return {emoji: legendary[getRandomNumber(0, legendary.length)], rarity: "legendary"};
                }
                // Epic
                else if (number >= 90) {
                    const epic = ['😎', '🥶', '🤓', '🤔', '🥴', '🤬', '🤡', '💩', '😈', '🔥','🤠','🤮','😴','⭐️'];
                    return {emoji: epic[getRandomNumber(0, epic.length)], rarity: "epic"};
                }
                // Rare
                else if (number >= 72) {
                    const rare = ['🥹', '😡', '🥸', '🤩', '🥳', '😍', '😏', '😩', '🥺', '🫡', '🧠', '💙', '💚', '🧡', '🩷', '💜', '🤍', '🖤', '🔫', '💰', '😱', '😭', '🏳️‍🌈','🌙',' 🤑','🤢','🥵','🎀','🌙'];
                    return {emoji: rare[getRandomNumber(0, rare.length)], rarity: "rare"};
                }
                // Uncommon
                else if (number >= 40) {
                    const uncommon = ['🐣', '🐱', '🐶', '🐭', '🐼', '🐸', '🦅', '🦄', '🐴', '🐬', '🐳', '🦍', '🦋', '🎄', '🌲', '🌻', '🌷', '🍄', '🥀', '☀️', '❄️', '🌈', '💦','😾','😻','😼','🧸'];
                    return {emoji: uncommon[getRandomNumber(0, uncommon.length)], rarity: "uncommon"};
                }
                // Common
                else {
                    const common = ['⚽', '🏀', '🏐', '🥏', '🛹', '🎯', '🚑', '🚀', '🏝️', '💣', '⚔️', '💵', '💰', '⌛', '🛌','☂️','🦺',' 👢','🎩','🪖','💍','🐢','🐍','🐌','🪼','🦞','🐩','☄️','🇨🇭','🇷🇸','🪐'];
                    return {emoji: common[getRandomNumber(0, common.length)], rarity: "common"};
                }
            }
        } catch (error) {
            console.error(`An error occurred in roll.`, error);
            message.reply(`Something went wrong. Try again later.`);
        }
    }
}