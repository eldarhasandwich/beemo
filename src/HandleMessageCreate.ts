import { Client, Message } from "discord.js"
import { gptMessageHandler } from "./GPT";

export type MessageHandler = (message: Message, client: Client) => Promise<void>; 

const handleMessageCreate: MessageHandler = async (message: Message, client: Client) => {
        
    if (message.content === 'give me a story') {

        message.reply('Kibōchi City, a bustling metropolis filled with neon lights and a vibrant atmosphere, was just like any other city at first glance. However, beneath its surface, a hidden world awaited those who possessed the potential to see beyond the ordinary. Akira "Kazuki" Yamamoto, a transfer student to Kibōchi High School, stood at the entrance of his new school, taking in the sights and sounds. He couldnt help but feel a sense of anticipation tinged with a hint of unease. Something was about to change, he could feel it in his bones. As the morning bell rang, Kazuki entered the classroom, catching the attention of his classmates. Among them was his childhood friend, Aiko Tanaka. She smiled warmly at him, gesturing for him to take the empty seat beside her. "Hey, Kazuki, glad you made it," Aiko whispered as he settled into his seat. "Are you ready for your first day?" Kazuki nodded, a determined look in his eyes. "Yeah, Im ready. Lets see what this new school has in store for us." The day progressed like any other, with classes and introductions to teachers. But as the final bell rang, signaling the end of the day, a strange incident occurred. The classroom suddenly shook, causing everyone to stumble and grab onto their desks for support. "Whats happening?!" Kazuki exclaimed, his heart racing. He looked around, and to his surprise, he saw a dark, swirling vortex forming in the center of the classroom.')

        return
    }

    gptMessageHandler(message, client)
}

export default handleMessageCreate