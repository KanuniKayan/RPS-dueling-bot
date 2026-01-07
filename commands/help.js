// A command to display the help section

// Imports
const { EmbedBuilder } = require("discord.js");
const { getPrefix } = require("../queries");

// Command
module.exports = {
    name:'help',
    aliases:['hlep', 'hepl'],
    description:'display the help section',
    async execute(message, args) {
        try {
            // Gather all commands
            const commands = message.client.commands;
            let reply = ''; // initialize to build full reply later

            // Get prefix
            const prefix = await getPrefix(message.guildId);

            // Command-specific help section
            if (args.length > 1) {
                // Save command
                let help_command = args[1];
                if (help_command.startsWith(prefix)) help_command = help_command.substring(1);

                // Display respective command description
                for (const command of commands) {
                    if (!command.name) {
                        if (command[0] === help_command || command[1].name === help_command) {
                            reply = `${prefix}${command[1].name}: ${command[1].description}`;
                            break;
                        } else {
                            // No command found
                            reply = `Command '${help_command}' not found. Try ${prefix}help`;
                        }
                    }
                }
            }
            // General help section
            else {
                // Place commands into array
                const commandArray = [];
                const slashCommandArray = [];
                commands.forEach(command => {
                    if (command.name) // message commands
                    {
                        if (!commandArray.includes(command.name)) {
                            commandArray.push(command.name);
                        }
                    } else if (command.data.name) // slash commands
                    {
                        if (!slashCommandArray.includes(command.data.name)) {
                            slashCommandArray.push(command.data.name);
                        }
                    } else {
                        console.log(`Something went wrong looking for commands...`);
                    }

                });

                // Build reply string
                reply = "--------- The help section ---------\n" +
                    "Here is a list of all available commands:\n"

                // message section
                for (let i = 0; i < commandArray.length; i++) {
                    // Check for wrapping
                    const wrapAt = 6;
                    if ((i % wrapAt === 0)) {
                        reply += `\n`;
                    }
                    reply += `${prefix}${commandArray[i]} `
                }

                reply += `\n`;

                // slash commands section
                for (let i = 0; i < slashCommandArray.length; i++) {
                    const wrapAt = 6;
                    if ((i % wrapAt === 0)) {
                        reply += `\n`;
                    }
                    reply += `/${slashCommandArray[i]} `
                }

                reply += `\n\nType '${prefix}help [command]' for specifics\n------------------------------------`
            }

            // Build embed with finalized reply string
            const embed = new EmbedBuilder()
                .setTitle("Help Section")
                .addFields({name: '', value: `${reply}`})

            await message.reply({embeds: [embed]});

        } catch (error) {
            console.error(`An error occurred in help.`, error);
            message.reply(`Something went wrong. Try again later.`);
        }
    }
}