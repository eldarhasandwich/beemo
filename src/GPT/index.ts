import { ChatInputCommandInteraction, TextChannel, Client } from "discord.js"

import { Command, InteractionHandler } from "../HandleInteractionCreate"
import { MessageHandler } from "../HandleMessageCreate"
import { PRIMARY_PROMPT, completePrompt } from "./GPT"

const LOGGING_ENABLED = false;

type ConversationPoint = {
    speaker: string
    text: string
}

type State = {
    isActive: boolean
    targetChannel?: string
    conversation: ConversationPoint[]
    isThinking: boolean,
    pendingNextResponse: boolean
    lastResponseTimestamp: number,
    nextAllowedResponseTimestamp: number
}

let state: State = {
    isActive: false,
    targetChannel: undefined,
    conversation: [],
    isThinking: false,
    pendingNextResponse: false,
    lastResponseTimestamp: 0,
    nextAllowedResponseTimestamp: 1
}


const debugLog = (input: any) => {

    if (!LOGGING_ENABLED) return
    console.debug(input)
}

const getNextResponseCooldown = (): number => { 

    const seconds = Math.ceil((Math.random() * 10)) + 10
    return seconds * 1000
}

const handleEnableGpt = async (interaction: ChatInputCommandInteraction) => {

    if (!!state.targetChannel && state.targetChannel !== interaction.channelId) {
        await interaction.reply('`AI module is already active in another channel.`')
        return
    }

    if (state.isActive) {
        await interaction.reply('`AI module is already active in this channel.`')
        return
    }

    const targetChannel = interaction.channelId

    state = {
        ...state,
        isActive: true,
        targetChannel,
        conversation: [],
        isThinking: false,
        pendingNextResponse: false
    }

    await interaction.reply('`AI module enabled. Say hi to Beemo!`')
}

const handleDisableGpt = async (interaction: ChatInputCommandInteraction) => {

    if (!state.isActive) {
        await interaction.reply('`AI module is already disabled.`')
        return
    }
    
    state = {
        ...state,
        isActive: false,
        targetChannel: undefined,
        conversation: [],
        isThinking: false,
        pendingNextResponse: false
    }

    await interaction.reply('`AI module disabled.`')

}

const gptSubcommands: { [key: string]: InteractionHandler } = {
    enable: handleEnableGpt,
    disable: handleDisableGpt
}

const handleGptInteraction = async (interaction: ChatInputCommandInteraction) => {

    const subcommand = interaction.options.getSubcommand()
    const handler = gptSubcommands[subcommand]

    if (!handler) return

    handler(interaction)
}

export const gptCommands: Command[] = [
    {
        name: 'ai',
        description: 'Interact with Beemo\'s AI module.',
        interactionHandler: handleGptInteraction,
        options: [
            {
                type: 1,
                name: 'enable',
                description: 'Turn on the module. Doesn\'t work if active in another channel.'
            },
            {
                type: 1,
                name: 'disable',
                description: 'Turn off the module globally.'
            }
        ]
    },
    {
        name: 'shuddup',
        description: 'Quickly kill the AI module.',
        interactionHandler: handleDisableGpt
    }
]

const generateMessage = async (): Promise<string | undefined> => {

    const response = await completePrompt(`${PRIMARY_PROMPT} ${
        state.conversation.map(c => `- [${c.speaker}]: ${c.text}`).join('\n\n')
    }`)

    let responseText
    try {
        responseText = JSON.parse(response).choices[0].text
    } catch (e) {
        console.error(e)
        
        state = {
            ...state,
            isThinking: false
        }
        return undefined
    }

    if (responseText.length === 0) {
        state = {
            ...state,
            isThinking: false
        }
        return undefined
    }

    let parsedResponse = responseText.split('[Beemo]:')

    // oops something went wrong here
    if (parsedResponse.length === 2) {
        parsedResponse = parsedResponse[1]
    } else {
        parsedResponse = responseText
    }

    return parsedResponse;
}

const sendMessage = async (message: string, client: Client): Promise<void> => {
    state = {
        ...state,
        conversation: [ ...state.conversation, {
            speaker: 'Beemo',
            text: message
        }],
        isThinking: false,
        pendingNextResponse: false,
        lastResponseTimestamp: Date.now(),
        nextAllowedResponseTimestamp: Date.now() + getNextResponseCooldown()
    }

    const c = client.channels.cache.get(state.targetChannel as string) as TextChannel
    await c.send(message)
}

const generateAndSendMessage = async (client: Client): Promise<void> => {
    const response = await generateMessage()

    if (!response) {
        return
    }

    await sendMessage(response, client)
}

export const gptMessageHandler: MessageHandler = async (message, client) => {

    debugLog('gptMessageHandler called')

    debugLog(state)

    if (!state.isActive) {
        return
    }

    debugLog('is active')

    // don't want beemo to respond to bots or itself
    if (
        message.author.bot
        || message.author.id === client.user?.id
    ) {
        return
    }

    debugLog('message not from bot')

    const { targetChannel } = state

    // shouldn't get here but just checking
    if (!targetChannel) {
        return
    }

    debugLog(`valid target channel: ${targetChannel}`)

    state = {
        ...state,
        conversation: [ ...state.conversation, {
            speaker: message.author.username,
            text: message.content
        }]
    }

    console.debug({state})

    const t = Date.now()

    if (t <= state.nextAllowedResponseTimestamp) {
        console.debug('is waiting to respond')

        if (state.pendingNextResponse) {
            return
        }

        state = {
            ...state,
            pendingNextResponse: true
        }

        setTimeout(
            () => {
                generateAndSendMessage(client)
            },
            state.nextAllowedResponseTimestamp - t
        )

        return
    }

    if (state.isThinking) {
        return
    }

    state = {
        ...state,
        isThinking: true
    }

    await generateAndSendMessage(client)

    return
}