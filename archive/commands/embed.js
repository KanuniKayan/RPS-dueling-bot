const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'embed',
    description: 'display a embed',
    execute(message, args) {

        const embed = new EmbedBuilder()
            .setTitle('Title of embed')
            .setDescription(`Inside of embed`)
            .setURL('https://www.youtube.com/watch?v=MiE1inuK5tE')
            .setColor(0x00ff00)
            .setImage('https://media.hswstatic.com/eyJidWNrZXQiOiJjb250ZW50Lmhzd3N0YXRpYy5jb20iLCJrZXkiOiJnaWZcL2dldHR5aW1hZ2VzLTUwMDk0MjQ2Mi1oZXJvLmpwZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6ODI4fX19')
            .addFields(
                {name: 'Field title', value: 'Value of title field'},
                {name: 'Second field', value: 'Second Value!'}
            )
            .setTimestamp()
            .setFooter({text: 'Footer yeayea', iconURL:'https://cdn-icons-png.flaticon.com/512/535/535239.png'})
            .setAuthor({ name: `${message.author.globalName}'s Embed`, iconURL: message.author.avatarURL(), url: 'https://discord.js.org' });

        message.reply({embeds: [embed]});
    }
}