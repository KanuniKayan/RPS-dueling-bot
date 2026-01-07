// A simple hello command

// Command
module.exports = {
    name: 'hello',
    aliases: ['hi', 'hey', 'yo', 'wassup', 'wsg', 'sup', 'hallo', 'wys'],
    description: 'say hi to the bot',
    execute(message, args) {
        try {
            message.channel.send(`Hello ${message.author.globalName}!`);
        } catch (error) {
            console.error(`An error occurred in hello.`, error);
        }
    }
}