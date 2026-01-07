const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'rpsscore',
    description: 'display your rock-paper-scissor score vs bot',
    execute(message, args) {

        // Get Players JSON
        const playersPath = path.join(__dirname, '..', 'players.json');
        const rawdata = fs.readFileSync(playersPath, 'utf-8');
        const players = JSON.parse(rawdata);

        // Get user's ID
        const id = message.author.id;
        const score = players[id]['score'];

        let reply = `` +
            `Your Score:\n` +
            `----------------------\n` +
            `Wins: ${score['wins']}\n` +
            `Ties: ${score['ties']}\n` +
            `Losses: ${score['losses']}\n` +
            `----------------------`;

        message.reply(reply);
    }
}