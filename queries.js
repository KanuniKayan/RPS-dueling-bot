// File for all queries.
// Seperated by getters and setters

// Requires a database connection
const { query } = require('./database.js');

let client;

 /*
    Reminder for id usage:
    Id's used by discord and the bot's client is a snowflake number.
    The id's used to query the database must be a string.
 */


// Add/Create a player
async function addPlayer(id) {
    try {
        const id_string = id.toString();

        // Fetch discord name
        const user = await client.users.fetch(id);
        const name = user.globalName;

        // Create a new player
        await query("BEGIN;");
        try {
            await query("INSERT INTO players VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;", [id_string, name]);
            await query("INSERT INTO scores(user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING;", [id_string]);
            await query("INSERT INTO currencies(user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING;", [id_string]);
            await query("INSERT INTO inventories(user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING;", [id_string]);
            await query("INSERT INTO personalizations(user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING;", [id_string]);
            await query("COMMIT;");
            console.log(`Added player to database`);
        } catch (error) {
            // Rollback begin-commit-query if aborted
            await query("ROLLBACK;");
            console.error(`An error occurred trying to add a player.`, error);
            return null;
        }

        return true;
    } catch (error) {
        console.error(`An error occurred trying to add player.`, error);
        return null;
    }
}

// Delete a player
async function delPlayer(id) {
    const id_string = id.toString();

    // If player exists, delete
    if (await playerExists(id_string)) {
        try {
            // Because of cascading tables, everything else of the player gets deleted too
            await query("DELETE FROM players WHERE id = $1;", [id_string]);
            return true;
        } catch (error) {
            console.error(`An error occurred trying to delete a player.`, error);
            return null;
        }
    }
    else
    {
        console.log(`No player with id ${id_string} found`);
        return true;
    }
}

// Get both players' info for a duel
async function getDuel(id1, id2) {
    try {
        const id1_string = id1.toString();
        const id2_string = id2.toString();

        // If players do not exist, add them first
        if (!(await playerExists(id1_string))) await addPlayer(id1);
        if (!(await playerExists(id2_string))) await addPlayer(id2);

        // Query all stats required for the duel
        const players = await query(
            "SELECT p.*, s.wins, s.losses, s.duels, s.rounds, per.charm, per.banner, c.tokens " +
            "FROM players p " +
            "JOIN scores s ON s.user_id = p.id " +
            "JOIN personalizations per ON per.user_id = p.id " +
            "JOIN currencies c ON c.user_id = p.id " +
            "WHERE p.id = $1 OR p.id = $2;", [id1_string, id2_string]);
        return players.rows;
    } catch (error) {
        console.error(`An error occurred trying to get both players for duel.`, error);
    }

    return false;
}

//
// Getters
//

// Query execution for getting
async function getQuery(queryString, id) {
    try {
        // Change snowflake id to string (varchar) for database
        const id_string = id.toString();

        // Add player if not existent already
        if (!(await playerExists(id_string))) await addPlayer(id);

        // return values of query
        const result = await query(queryString, [id_string]);
        if (result.rows.length > 0) {
            return result.rows[0];
        } else return false;
    } catch (error) {
        console.error(`An error occurred trying to execute a 'get' query.`, error);
        return false;
    }
}

async function getPlayer(id) {
    return getQuery("SELECT * " +
        "FROM players p " +
        "JOIN scores s ON s.user_id = p.id " +
        "JOIN currencies c ON c.user_id = p.id " +
        "JOIN inventories inv ON inv.user_id = p.id " +
        "JOIN personalizations prs ON prs.user_id = p.id " +
        "WHERE p.id = $1;", id);
}

async function getRolls(id) {
    return getQuery(
        "SELECT c.rolls, c.duplidust, inv.*, per.charm " +
        "FROM inventories inv " +
        "JOIN currencies c ON c.user_id = inv.user_id " +
        "JOIN personalizations per ON per.user_id = inv.user_id " +
        "WHERE inv.user_id = $1;", id
    );
}

async function getScore(id) {
    return getQuery("SELECT s.*, p.*, per.charm FROM scores s JOIN players p ON p.id = s.user_id JOIN personalizations per ON per.user_id = s.user_id WHERE s.user_id = $1;", id);
}

async function getCurrency(id) {
    return getQuery("SELECT * FROM currencies WHERE user_id = $1;", id);
}

async function getInventory(id) {
    return getQuery("SELECT * FROM inventories WHERE user_id = $1;", id);
}

async function getPersonals(id) {
    return getQuery("SELECT * FROM personalizations WHERE user_id = $1;", id);
}

async function getLeaderboard() {
    try {
        const result = await query(
            "SELECT p.name, p.level, s.wins, s.duels " +
            "FROM players p " +
            "JOIN scores s ON s.user_id = p.id " +
            "ORDER BY s.wins DESC LIMIT 10;"
        );
        return result.rows;
    } catch (error) {
        console.error(`An error occurred trying to get leaderboard.`, error);
        return false;
    }
}

// Fetch the specified prefix of a server
async function getPrefix(server_id) {
    try {
        let result = await query("SELECT * FROM settings WHERE server_id = $1;", [server_id]);
        // If prefix exists, return that. Else, set default prefix.
        if (result.rows.length > 0) {
            return result.rows[0].prefix;
        }
        else
        {
            await setPrefix(server_id, '.');
        }
    } catch (error) {
        console.error(`An error occurred trying to get prefix.`, error);
        return false;
    }
}

async function getRestriction(server_id) {
    try {
        const result = await query("SELECT restriction FROM settings WHERE server_id = $1;", [server_id])
        if (result.rows.length > 0) return result.rows[0].restriction;
        else return false;
    } catch (error) {
        console.error(`An error occurred trying to get restrictions.`, error);
        return false;
    }
}


// Setters

// Query execution for setting
// Requires proper alignment of parameters (the array to set)
async function setQuery(queryString, parameters) {
    try {
        // Check id
        if (!parameters[0]) return false;
        if (typeof (parameters[0]) !== 'string') parameters[0] = parameters[0].toString();
        if(!(await playerExists(parameters[0]))) return false;

        await query(queryString, parameters);

        return true;
    } catch (error) {
        console.error(`An error occurred trying to execute a 'set' query`, error);
    }
}

// Setting score, levels and tokens from duel
async function setDuel(score) {
    try {
        const scoreParams = [score.id, score.wins, score.losses, score.duels, score.rounds];
        const levelParams = [score.id, score.level, score.exp];
        const currencyParams = [score.id, score.tokens];

        // Start transaction
        await query('BEGIN;');
        // Score
        // Using typecasting in this query due to int and text being mixed
        await setQuery("UPDATE scores " +
            "SET " +
            "wins = CASE WHEN $2::int IS NOT NULL THEN $2::int ELSE wins END, " +
            "losses = CASE WHEN $3::int IS NOT NULL THEN $3::int ELSE losses END, " +
            "duels = CASE WHEN $4::int IS NOT NULL THEN $4::int ELSE duels END, " +
            "rounds = CASE WHEN $5::int IS NOT NULL THEN $5::int ELSE rounds END " +
            "WHERE user_id = $1::text;", scoreParams);
        // Level
        await setQuery(
            "UPDATE players SET level = $2::INT, exp = $3::INT WHERE id = $1::TEXT;", levelParams
        );
        // Currency
        await setQuery(
          "UPDATE currencies SET tokens = $2::INT WHERE user_id = $1::TEXT;", currencyParams
        );
        await query("COMMIT;");
        return true;
    } catch (error) {
        await query('ROLLBACK;');
        console.error(`An error occurred trying to set duel query.`, error);
    }
}

// Insert items received from rolls into inventory and currencies
async function setRolls(player) {
    try {
        await query('BEGIN;');
        await query('UPDATE currencies SET rolls = $2::INT, duplidust = $3::INT WHERE user_id = $1::TEXT;',
            [player.user_id, player.rolls, player.duplidust]);
        await query('UPDATE inventories ' +
            'SET commons = CASE WHEN $2::TEXT[] IS NOT NULL THEN $2::TEXT[] ELSE commons END, ' +
            'uncommons = CASE WHEN $3::TEXT[] IS NOT NULL THEN $3::TEXT[] ELSE uncommons END, ' +
            'rares = CASE WHEN $4::TEXT[] IS NOT NULL THEN $4::TEXT[] ELSE rares END, ' +
            'epics = CASE WHEN $5::TEXT[] IS NOT NULL THEN $5::TEXT[] ELSE epics END, ' +
            'legendaries = CASE WHEN $6::TEXT[] IS NOT NULL THEN $6::TEXT[] ELSE legendaries END ' +
            'WHERE user_id = $1::TEXT;',
            [player.user_id, player.commons, player.uncommons, player.rares, player.epics, player.legendaries]);
        await query('COMMIT;')
        return true;
    } catch (error) {
        await query('ROLLBACK;')
        console.error(`An error occurred setting player's roll info.`, error);
        return false;
    }
}

async function setCurrency(currency) {
    const params = [
        currency.user_id,
        currency.rolls,
        currency.tokens,
        currency.duplidust,
    ]
    return await setQuery(
        "UPDATE currencies " +
        "SET rolls = $2::INT, " +
        "tokens = $3::INT, " +
        "duplidust = $4::INT " +
        "WHERE user_id = $1::TEXT;", params);
}

// Set personalizations
async function setPers(type, emoji, id) {
    if (type === 'charm') return await setQuery("UPDATE personalizations SET charm = $2 WHERE user_id = $1;",[id, emoji]);
    else if (type === 'banner') return await setQuery("UPDATE personalizations SET banner = $2 WHERE user_id = $1;",[id, emoji])
}

// Change a server's prefix
async function setPrefix(server_id, prefix) {
    try {
        // Gather server
        const result = await query("SELECT * FROM settings WHERE server_id = $1;", [server_id]);
        // If exists, insert into, else update existing
        if (result.rows.length > 0)
        {
            await query("UPDATE settings SET prefix = $2 WHERE server_id = $1;", [server_id, prefix]);
        }
        else
        {
            await query("INSERT INTO settings VALUES ($1, $2);", [server_id, prefix]);
        }

        return true;
    } catch (error) {
        console.error(`An error occurred trying to set a server's prefix.`, error);
        return false;
    }
}

// Set restrictions on which channels commands can be used in
async function setRestriction(server_id, channel_id) {
    try {
        let result
        // if server has restriction, overwrite. Else, make
        if (getRestriction(server_id) != false) {
            result = await query("UPDATE settings SET restriction = $2 WHERE server_id = $1;", [server_id, channel_id]);
        }
        else
        {
            result = await query("INSERT INTO settings(restriction) VALUES ($2) WHERE server_id = $1;", [server_id, channel_id]);
        }

        return true;

    } catch (error) {
        console.error(`An error occurred trying to set restrictions.`, error);
        return false;
    }
}



// Check for player existence
async function playerExists(id_string) {
    try {
        const result = await query("SELECT id FROM players WHERE id = $1", [id_string]);
        return result.rows.length > 0;
    } catch (error) {
        console.error(`An error occurred trying to check for player existence.`, error);
        return false;
    }
}



// Fetching client after bot is fully ready
async function getDiscordUsers(cl) {
    client = cl;
    console.log(`Client retrieved for queries`);
}

// Accessible from other code
module.exports = {
    playerExists,
    getPlayer,
    addPlayer,
    delPlayer,
    getDuel,
    getScore,
    getCurrency,
    getInventory,
    getLeaderboard,
    getPersonals,
    getRolls,
    getDiscordUsers,
    getPrefix,
    getRestriction,
    setDuel,
    setRolls,
    setCurrency,
    setPers,
    setPrefix,
    setRestriction,
};