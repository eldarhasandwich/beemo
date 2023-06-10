import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { monsterJrpgCommands } from "./MonsterJRPG";
import { gptCommands } from "./GPT";

export type InteractionHandler = (interaction: ChatInputCommandInteraction) => Promise<void>

type CommandOption = {
    type: number
    name: string
    description: string
}

export type Command = {
    name: string
    description: string
    interactionHandler: InteractionHandler
    options?: CommandOption[]
}

const handlePing = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply('Pong!');
}

const handleCoinFlip = async (interaction: ChatInputCommandInteraction) => {
    const p = Math.random()

    await interaction.reply(`You flipped ${
        p > 0.5 ? 'heads': 'tails'
    }`)
}

const handleDiceRoll = async (interaction: ChatInputCommandInteraction) => {
    const p = Math.random()
    const roll = Math.ceil(p * 6)

    await interaction.reply(`You rolled ${roll}`)
}

const handleD20 = async (interaction: ChatInputCommandInteraction) => {
    const p = Math.random()
    const roll = Math.ceil(p * 20)

    await interaction.reply(`You rolled ${roll}`)
}

export const commands: Command[] = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
        interactionHandler: handlePing,
    },
    {
        name: 'coinflip',
        description: '50/50 chance coin flip',
        interactionHandler: handleCoinFlip
    },
    {
        name: 'diceroll',
        description: '1-6 dice roll',
        interactionHandler: handleDiceRoll
    },
    {
        name: 'd20',
        description: '1-20 dice roll',
        interactionHandler: handleD20
    },
    ...monsterJrpgCommands,
    ...gptCommands
];

export const commandListToPutCommandBody = (commands: Command[]) => {
    return commands.map(cd => { return { ...cd, interactionHandler: undefined }})
} 

const handleInteractionCreate = async (interaction: Interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const command = commands.find(cd => {
        return interaction.commandName === cd.name
    })

    if (command) {
        command.interactionHandler(interaction)
    }
}

export default handleInteractionCreate