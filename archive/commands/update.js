const path = require("path");
const fs = require("fs");

module.exports = {
    name: 'update',
    description: 'dev command for migrating player stats',
    async execute(message, args) {

        if (message.author.globalName !== "AnimatedDisc") return;

        // Get players
        const playersPath = path.join(__dirname, '..', 'players.json');
        const playersFile = fs.readFileSync(playersPath, "utf-8");
        const players = JSON.parse(playersFile);

        // fetch name and insert new template
        if (args[1] === 'all') {
            for (const id in players) {
                // if player has the pre-profile template, copy stats and fill new template
                players[id] = {
                    "profile": {
                        "name": `${(await message.client.users.fetch(id)).globalName}`,
                    },
                    "score": {
                        "wins": players[id]['score'].wins,
                        "ties": players[id]['score'].ties,
                        "losses": players[id]['score'].losses,
                    },
                    "cosmetics": {
                        "charm": ``,
                        "banner": ``
                    },
                    "inventory": {
                        "items": [],
                        "rolls": 3,
                        "duplidust": 0,
                    }
                }
                console.log(players[id]);
                console.log(`Edited ${id} in players.json`);
                console.log(``);
            }
        }
        else
        {
            const id = '296721421038518282';
            players[id]["inventory"].items.push('💩');
            players[id]["inventory"].items.push('🤬');
            players[id]["inventory"].items.push('🤓');
        }

        // write new file
        try {
            fs.writeFileSync(playersPath, JSON.stringify(players, null, 2), "utf-8");
        } catch(error) {
            console.error(error);
        }

        console.log(`Finished going over files.`);
    }
}