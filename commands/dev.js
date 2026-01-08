// Dev commands, so that you can do it from discord rather than the console.

const { getPlayer, getScore, delPlayer, getDuel, setScore , getInventory, setEmoji, addPlayer, playerExists} = require("../queries");

module.exports = {
    name: 'dev',
    description: 'dev command',
    async execute(message, args)
    {
        try {
            // Only AnimatedDisc allowed
            if (message.author.globalName !== "AnimatedDisc") return;

            // Writing check
            if (args.length < 3) {
                await message.reply(`Usage: dev [command] [id] [parameters]`);
                return;
            }
            const command = args[1].toLowerCase();

            // Checking for valid command
            const commands = [
                'add',
                'delete',
                'exists',
                'give',
                'remove',
            ]
            if (!commands.includes(args[1])) {
                await message.reply(`Unknown command ${args[1]}`);
                return;
            }
            if (message.mentions.users.size === 0) {
                await message.reply(`Usage: dev [command] [id] [parameters]`);
                return;
            }
            const id = message.mentions.members.first().id;

            switch (command) {
                case 'add':
                    if (await addPlayer(id)) await message.reply(`Player has been created.`);
                    break;
                case 'delete':
                    if (await delPlayer(id)) await message.reply(`Player has been deleted.`);
                    break;
                case 'exists':
                    if (await playerExists(id.toString())) await message.reply(`Exists`);
                    break;
                case 'give':
                    await message.reply(`Command not implemented yet`);
                    return;
                case 'remove':
                    await message.reply(`Command not implemented yet`);
                    return;
            }


        } catch (error) {
            console.error(`An error occurred in dev command.`, error);
            message.reply(`Something went wrong. Check console.`);
        }

    }
}