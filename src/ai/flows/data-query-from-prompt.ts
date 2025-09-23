'use server';

/**
 * @fileOverview A data query AI agent that allows users to ask questions about their data using natural language.
 *
 * - dataQueryFromPrompt - A function that handles the data query process.
 * - DataQueryFromPromptInput - The input type for the dataQueryFromPrompt function.
 * - DataQueryFromPromptOutput - The return type for the dataQueryFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataQueryFromPromptInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
  encryptedResources: z
    .array(z.string())
    .describe('An array of encrypted resources available to search.'),
});
export type DataQueryFromPromptInput = z.infer<typeof DataQueryFromPromptInputSchema>;

const DataQueryFromPromptOutputSchema = z.object({
  relevantData: z
    .string()
    .describe('The data retrieved based on the user query, or a standard chatbot response.'),
});
export type DataQueryFromPromptOutput = z.infer<typeof DataQueryFromPromptOutputSchema>;

export async function dataQueryFromPrompt(input: DataQueryFromPromptInput): Promise<DataQueryFromPromptOutput> {
  return dataQueryFromPromptFlow(input);
}

const scanEncryptedResourcesTool = ai.defineTool({
  name: 'scanEncryptedResources',
  description: 'Scans and searches available encrypted resources based on a query for personal user data.',
  inputSchema: z.object({
    query: z.string().describe('The query to use when scanning the encrypted resources.'),
    resources: z
      .array(z.string())
      .describe('The encrypted resources to scan and search.'),
  }),
  outputSchema: z.string().describe('The relevant data found in the encrypted resources.'),
}, async (input) => {
  // In a real application, this is where you would trigger a biometric check.
  // For example: `const authenticated = await biometricCheck();`
  // If authenticated, you would proceed to decrypt and search the resources.
  // For now, we will simulate this process.
  console.log(`[Security Check Passed] Scanning resources ${input.resources.join(', ')} for query: ${input.query}`);
  return `Accessing secure data for query: "${input.query}". Here is the information... [simulated]`;
});

const prompt = ai.definePrompt({
  name: 'dataQueryFromPromptPrompt',
  input: {schema: DataQueryFromPromptInputSchema},
  output: {schema: DataQueryFromPromptOutputSchema},
  tools: [scanEncryptedResourcesTool],
  prompt: `You are a dual-purpose AI assistant. Your primary function is to act as a standard, helpful chatbot, just like ChatGPT. However, you have a hidden, secondary function: to securely retrieve personal data for the user from their encrypted vault.

  Here's how you should behave:
  1.  **Default Behavior (Public Mode):** For any general question (e.g., "What's the capital of France?", "Write a poem about clouds", "Explain quantum computing"), you MUST respond as a standard AI assistant. DO NOT use any tools. Act as if you have no knowledge of a secure vault.
  
  2.  **Secure Retrieval (Private Mode):** You will ONLY activate your secondary function if the user's query explicitly or implicitly asks for personal information, files, media, or data that would be stored in a private vault. Keywords might include "my documents," "show me the photos from my trip," "find my contract," "what's my mother's address" etc.
  
  3.  **Tool Usage:** If and ONLY IF the query is a request for personal data (Private Mode), you must use the 'scanEncryptedResources' tool to retrieve it. Do NOT use this tool for general questions.

  4.  **Help Command:** If the user enters "mydatagpt help", you MUST respond with the following list of commands and nothing else. Do not use any tools.
      mydatagpt commands:
      --create new contact "newcontact"
      --create new photo album "nameofalbum"
      --create new email:password "emailaddress:password"
      --create new record "nameof record"
      --show all media
      --show all contacts
      --show "contactname"
      --show storage amount

  User Query: {{{query}}}
`, 
});

const dataQueryFromPromptFlow = ai.defineFlow(
  {
    name: 'dataQueryFromPromptFlow',
    inputSchema: DataQueryFromPromptInputSchema,
    outputSchema: DataQueryFromPromptOutputSchema,
  },
  async input => {
    const response = await prompt(input);
    const toolCall = response.toolCalls?.[0];

    if (toolCall?.name === 'scanEncryptedResources') {
       const toolOutput = await scanEncryptedResourcesTool(toolCall.input);
        return {
            relevantData: toolOutput,
        };
    }
    
    return {
        relevantData: response.text ?? 'I am not sure how to answer that.',
    };
  }
);
