// A command to show a tutorial on the game's mechanics.

// Imports
const { EmbedBuilder } = require('discord.js');

// Command
module.exports = {
    name: 'tutorial',
    description: 'display the tutorial for the game and bot',
    async execute(message, args) {

        // Full string
        const str = 'You can duel someone in rock-paper-scissors for a match of \'first to 5 wins\'.\n ' +
            'Rock beats scissors, scissors beats paper, and paper beats rock.\n' +
            'Each game gives one exp, while a win gives two.\n On average, ' +
            'you\'ll play three matches for a level-up,\n' +
            'which gives you a token to exchange a roll with the exchange command (ex for short). ' +
            'For every duplicate you roll, you get duplidust up\n' +
            'to a max of six per roll. You can exchange 8 duplidust for one roll.\n' +
            'There are five rarities for emoji\'s. Common, Uncommon, Rare, Epic, and Legendary.\n' +
            'You can use the set command to set an emoji as your charm or banner.\n\n' +
            'Use the help command for all commands, and help [command-here] for specific help.';

        // Create embed with string
        const embed = new EmbedBuilder()
            .setTitle('Tutorial')
            .setDescription('This tutorial explains the game and surrounding mechanics')
            .setFields(
                {name: '', value: `${str}`},
            )

        // Display embed
        await message.reply({embeds: [embed]});
    }
}