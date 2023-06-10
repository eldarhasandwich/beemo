
import {  REST, Routes, Client, GatewayIntentBits } from 'discord.js';

import handleMessageCreate from './HandleMessageCreate';
import handleInteractionCreate, { commands, commandListToPutCommandBody } from './HandleInteractionCreate';

const { discordApiToken, discordClientId } = require('../secret.json');

const main = async () => {
    
    const rest = new REST({ version: '10' }).setToken(discordApiToken);
    
    try {
      console.log('Started refreshing application (/) commands.');
    
      await rest.put(Routes.applicationCommands(discordClientId), { body: commandListToPutCommandBody(commands) });
    
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
    
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, 'GuildMessages'] });
    
    client.on('ready', () => {
      console.log(`Logged in as ${client?.user?.tag}!`);
    });
    
    client.on('interactionCreate', async interaction => {

        handleInteractionCreate(interaction)

    });

    client.on('messageCreate', async message => {

        handleMessageCreate(message, client)

    });
    
    // Log in to Discord with your client's token
    client.login(discordApiToken);
}

main()