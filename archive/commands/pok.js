const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');

module.exports = {
    name: 'pok',
    description: 'event handling environment',
    async execute(message, args) {
        // create buttons
        const activationButton = new ButtonBuilder().setCustomId('activation').setLabel('Activate').setStyle(ButtonStyle.Secondary);
        const restartButton = new ButtonBuilder().setCustomId('restart').setLabel('Restart').setStyle(ButtonStyle.Secondary);

        // create action row
        const initialRow = new ActionRowBuilder().addComponents(activationButton);
        const retryRow = new ActionRowBuilder().addComponents(restartButton);


        // Initialize count
        let count = 0

        // Initial reply
        const sentMessage = await message.reply({
            content: 'This is a message reply',
            components: [initialRow],
        });

        // Collector filter
        const collectorFilter = (i) => {
            return i.message.id === sentMessage.id;
        }

        // Start collector
        const collector = message.channel.createMessageComponentCollector({
            filter: collectorFilter,
            componentType: ComponentType.Button,
            time: 60_000
        })

        // Event listener for new interactions
        collector.on('collect', async (i) => {
            // Increase count for each interaction
            count++;

            // Change display depending on restart or activate
            if (i.component.label === 'Restart') {
                i.update({
                    content: `This is a **Restart** interaction. count: ${count}`,
                    components: [initialRow],
                })
            }
            else if (i.component.label === 'Activate') {
                i.update({
                    content: `This is a **Activate** interaction. count: ${count}`,
                    components: [retryRow],
                })
            }
        });

        collector.on('end', (collected, reason) => {
            console.log(`Collection ended: ${reason}`);
        })
    }
}