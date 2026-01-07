const fs = require ('fs');
const path = require ('path');

module.exports = {
    name: 'rps',
    aliases: ['rock','paper','scissor','scissors'],
    description: 'play rock paper scissors against the bot',
    cooldown: 5,
    execute(message, args) {
        try {
            const playersPath = path.join(__dirname, '..', 'players.json');
        } catch (e) {
            console.error(e)
            return;
        }

        // Get scores
        const players = getPlayers();
        if (!players) {
            message.reply("Something went wrong... Try again.");
            console.log("Scores file could not be read or parsed.");
            return;
        }
        // Get player's score
        const player_id = message.author.id;
        let player = players[`${player_id}`];
        if (!player) {
            player = createPlayer(player_id);
        }
        let score = player['score'];


        // Get player's pick:
        const playerName = message.author.globalName;
        let playerPick = message.content.substring(1).toString().toLowerCase();
        if (playerPick === 'scissor') { playerPick = 'scissors'} // adjust spelling
        // Get bot's pick:
        const random = Math.floor(Math.random() * (3 - 0) + 0); // Math.random() * (max - min) + min
        const botPick = ['rock', 'paper', 'scissors'][random];

        // Determine winner
        let winner = '';
        if (playerPick === botPick) { winner = 'tied'; }
        else if (
            (playerPick === 'rock' && botPick === 'scissors') ||
            (playerPick === 'scissors' && botPick === 'paper') ||
            (playerPick === 'paper' && botPick === 'rock')
        ) { winner = playerName; }
        else { winner = 'bot'; }

        // String builder and register score
        const playPart = `I pick ${botPick}:`
        let winnerPart = '';
        switch (winner) {
            case playerName:
                winnerPart = 'You win!';
                updateScore(score, 'win');
                break;
            case 'tied':
                winnerPart = 'Tied!';
                updateScore(score, 'tied');
                break;
            case 'bot':
                winnerPart = 'I win!';
                updateScore(score, 'loss');
                break;
            default:
                // Something went wrong -> exit early
                console.log('Error with rock-paper-scissors...')
                return;
        }

        // Reply results
        const results = `${playPart} ${winnerPart}`
        message.reply(results);

        console.log(`RPS: ${playerName} - ${playerPick} vs. Bot - ${botPick} -> ${winner} wins`);

        ///////////////////////
        ////// Functions //////
        ///////////////////////

        function getPlayers() {
            const data = fs.readFileSync(playersPath, 'utf8');
            if (!data) return;
            return JSON.parse(data);
        }

        function createPlayer(id) {
            // Create new player object
            players[[id]] = {
                "score": {
                    "wins":0,
                    "ties":0,
                    "losses":0
                }
            }
            return players[[id]];
        }

        function updateScore(score, result) {
            // Add to respective score
            switch(result) {
                case 'win':
                    score['wins']++;
                    break;
                case 'tied':
                    score['ties']++;
                    break;
                case 'loss':
                    score['losses']++;
                    break;
            }

            // Compose updated player object
            players[player_id]['score'] = score;

            // Write to JSON
            fs.writeFileSync(playersPath, JSON.stringify(players, null, 2), 'utf8');
            return;
        }
    }
}