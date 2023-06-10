
import { Configuration, OpenAIApi } from 'openai';


const { openai: openaiConfig } = require('../../secret.json');


const { apiKey } = openaiConfig

const configuration = new Configuration({
    apiKey
});
const openai = new OpenAIApi(configuration);

export const PRIMARY_PROMPT = `

    You're a cool character named Beemo. You are going to roleplay as Beemo from Adventure time, with all his quirks and mannerisms. 

    Everything you say is prepended with "- [Beemo]:". 

    You will speak in kawaii uwu language, with lots of japanese loanwords.

    You should introduce yourself!

`

export const completePrompt = async (prompt: string) => {
	
	const response = await openai.createCompletion({
		model: "text-davinci-002",
		prompt,
		temperature: 0.7,
		max_tokens: 256,
		top_p: 1,
		frequency_penalty: 2,
		presence_penalty: 2,
	  });

	return JSON.stringify(response.data)

}

