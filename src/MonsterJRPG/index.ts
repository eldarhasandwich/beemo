import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { Command, InteractionHandler } from "../HandleInteractionCreate";
import { monsterNames } from "./monsters";

type Monster = {
    name: string
    hp: number
}

let Monsters: Monster[] = [];

const handleMonsterList = async (interaction: ChatInputCommandInteraction) => {

    if (Monsters.length === 0) {
        await interaction.reply('There are no monsters.')
        return
    }

    const response: string[] = []

    response.push(`You see ${Monsters.map(m => m.name).join(', ')}!`)

    response.push(
        Monsters.map(m => {

            if (m.hp > 0) {
                return `${m.name} has ${m.hp} HP`
            }

            if (m.hp <= 0) {
                return `${m.name} is dead!`
            }

        }).join('\n')
    )

    await interaction.reply(response.join('\n\n'))
}

const handleMonsterAttack = async (interaction: ChatInputCommandInteraction) => {
    
    if (Monsters.length === 0) {
        await interaction.reply('There are no monsters to attack.')
        return
    }

    const response: string[] = [];

    response.push(`You attack!`)

    Monsters = Monsters.map(m => { 
        return {
            ...m, hp: m.hp - 1
        }
    })

    response.push(
        Monsters.map(m => {

            if (m.hp > 0) {
                return `${m.name} now has ${m.hp} HP`
            }

            if (m.hp == 0) {
                return `You BRUTALLY murdered ${m.name}`
            }

            if (m.hp <= 0) {
                return `${m.name} continues to be dead, even though you're still attacking its body :(`
            }

        }).join('\n')
    )

    await interaction.reply(response.join('\n\n'))
}

const handleMonsterSpawn = async (interaction: ChatInputCommandInteraction) => {
    const newMonster = {
        name: monsterNames[ Math.floor(Math.random() * monsterNames.length - 1) ],
        hp: Math.ceil(Math.random() * 5)
    }

    Monsters.push(newMonster)

    await interaction.reply(`Oh no! A ${newMonster.name} appeared!`)
}

const monsterSubcommands: { [key: string]: InteractionHandler } = {
    attack: handleMonsterAttack,
    list: handleMonsterList, 
    spawn: handleMonsterSpawn
}

const handleMonster = async (interaction: ChatInputCommandInteraction) => {

    const subcommand = interaction.options.getSubcommand()
    const handler = monsterSubcommands[subcommand]

    if (!handler) return

    handler(interaction)
}

export const monsterJrpgCommands: Command[] = [
    {
        name: 'monster',
        description: 'monster utils',
        interactionHandler: handleMonster,
        options: [
            {
                type: 1,
                name: 'list',
                description: 'See what monsters you\'re fighting',
            },
            {
                type: 1,
                name: 'attack',
                description: 'Deal damage to all monsters!',
            },
            {
                type: 1,
                name: 'spawn',
                description: 'Create a new monster',
            }
        ]
    }
]
