const path = require("path");
const fs = require("fs");

module.exports = {
    name: 'setcharm',
    aliases: ['charm'],
    description: 'set your charm. setcharm [emoji] or setcharm none',
    async execute(message, args) {

        // Args validation
        if (args.length !== 2) {
            message.reply('Usage: .setcharm [emoji]');
            return;
        }

        // Get player info
        const playersPath = path.join(__dirname, '..', 'players.json');
        const playersFile = fs.readFileSync(playersPath, 'utf-8');
        const players = JSON.parse(playersFile);
        const id = message.author.id;
        if (!players[id]) return message.reply('User not found');
        const player = players[id];

        if (['default', 'undo', 'reset', 'none'].includes(args[1]))
        {
            try {
                players[message.author.id]['cosmetics'].charm = '';
                message.reply('Charm reset')
            } catch(error) {
                message.reply('Something went wrong resetting the charm');
                console.log(error);
            }

            try {
                fs.writeFileSync(playersPath, JSON.stringify(players, null, 2), 'utf8');
            } catch(error) {
                message.reply('Something went wrong assigning the charm');
                console.log(error);
            }
        }
        else if (player['inventory'].items.includes(args[1]))
        {
            try {
                players[message.author.id]['cosmetics'].charm = args[1];
                message.reply('Charm applied')
            } catch(error) {
                message.reply('Something went wrong assigning the charm');
                console.log(error);
            }

            try {
                fs.writeFileSync(playersPath, JSON.stringify(players, null, 2), 'utf8');
            } catch(error) {
                message.reply('Something went wrong assigning the charm');
                console.log(error);
            }
        }
        else
        {
            message.reply('Item not found in inventory. Check the items command')
        }
    }
}