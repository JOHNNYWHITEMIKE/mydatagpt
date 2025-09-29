'use server';

import {z} from 'zod';

const DataQueryFromPromptInputSchema = z.object({
  query: z.string().describe('The natural language query or terminal command from the user.'),
  history: z
    .array(
      z.object({
        sender: z.enum(['user', 'bot']),
        text: z.string(),
      })
    )
    .optional()
    .describe('The conversation history, which represents the state of the simulated terminal.'),
});
export type DataQueryFromPromptInput = z.infer<typeof DataQueryFromPromptInputSchema>;

const DataQueryFromPromptOutputSchema = z.object({
  relevantData: z
    .string()
    .describe('The data retrieved based on the user query, or a standard chatbot response.'),
});
export type DataQueryFromPromptOutput = z.infer<typeof DataQueryFromPromptOutputSchema>;

export async function dataQueryFromPrompt(input: DataQueryFromPromptInput): Promise<DataQueryFromPromptOutput> {
    const response = await fetch('http://localhost:80/personal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        return {
            relevantData: 'An error occurred while processing your request.',
        };
    }

    const result = await response.json();
    return result;
}
