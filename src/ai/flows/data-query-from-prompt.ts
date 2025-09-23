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
  query: z.string().describe('The natural language query about the user data.'),
  encryptedResources: z
    .array(z.string())
    .describe('An array of encrypted resources available to search.'),
});
export type DataQueryFromPromptInput = z.infer<typeof DataQueryFromPromptInputSchema>;

const DataQueryFromPromptOutputSchema = z.object({
  relevantData: z
    .string()
    .describe('The data retrieved based on the user query.'),
});
export type DataQueryFromPromptOutput = z.infer<typeof DataQueryFromPromptOutputSchema>;

export async function dataQueryFromPrompt(input: DataQueryFromPromptInput): Promise<DataQueryFromPromptOutput> {
  return dataQueryFromPromptFlow(input);
}

const scanEncryptedResourcesTool = ai.defineTool({
  name: 'scanEncryptedResources',
  description: 'Scans and searches available encrypted resources based on a query.',
  inputSchema: z.object({
    query: z.string().describe('The query to use when scanning the encrypted resources.'),
    resources: z
      .array(z.string())
      .describe('The encrypted resources to scan and search.'),
  }),
  outputSchema: z.string().describe('The relevant data found in the encrypted resources.'),
}, async (input) => {
  // Placeholder implementation for scanning encrypted resources
  // In a real application, this would involve decrypting the resources
  // and searching for relevant information based on the query.
  // For now, we'll just return a canned response.
  console.log(`Scanning resources ${input.resources.join(', ')} for query: ${input.query}`);
  return `Relevant data found in encrypted resources for query: ${input.query}`;
});

const prompt = ai.definePrompt({
  name: 'dataQueryFromPromptPrompt',
  input: {schema: DataQueryFromPromptInputSchema},
  output: {schema: DataQueryFromPromptOutputSchema},
  tools: [scanEncryptedResourcesTool],
  prompt: `You are an AI assistant designed to help users retrieve information from their encrypted data.

The user will provide a query in natural language, and you should use the available tools to find the relevant data.

Available Tools:
- scanEncryptedResources: Scans and searches available encrypted resources based on a query.

User Query: {{{query}}}

Encrypted Resources: {{{encryptedResources}}}

Instructions:
1.  Determine if the user query requires accessing the encrypted resources.
2.  If so, use the scanEncryptedResources tool to scan the resources and find the relevant data.
3.  Return the relevant data found in the encrypted resources.
4.  If the query does not require accessing the encrypted resources, respond without using the tool.
`, 
});

const dataQueryFromPromptFlow = ai.defineFlow(
  {
    name: 'dataQueryFromPromptFlow',
    inputSchema: DataQueryFromPromptInputSchema,
    outputSchema: DataQueryFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      relevantData: output?.relevantData ?? 'No relevant data found.',
    };
  }
);
