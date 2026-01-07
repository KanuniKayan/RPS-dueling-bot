const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    cooldown: 5,
    async execute(message) {
        if (!message.author.bot)
        {
            console.log(`Message has been deleted: "${message.content}"`);
            const sentMessage = await message.channel.send('Yo I saw you delete that');
            setTimeout(() => { sentMessage.delete(); }, 1000)
            console.log(`Bot message deleted`);
        }
    }
}


