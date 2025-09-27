'use server';

/**
 * @fileOverview A dual-purpose AI agent that functions as a standard chatbot
 * and a secure, simulated terminal for private data management.
 *
 * - dataQueryFromPrompt - A function that handles the data query process.
 * - DataQueryFromPromptInput - The input type for the dataQueryFromprompt function.
 * - DataQueryFromPromptOutput - The return type for the dataQueryFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return dataQueryFromPromptFlow(input);
}

const terminalTool = ai.defineTool({
  name: 'terminalTool',
  description: 'A tool that simulates a Linux terminal for the MyDataGPT database. It can manage a virtual file system including creating, reading, and deleting files and directories. This is the ONLY tool that can interact with the user\'s private MyDataGPT database.',
  inputSchema: z.object({
    command: z.string().describe('The full command to execute, e.g., "ls -l /documents".'),
  }),
  outputSchema: z.string().describe('The simulated output of the command, as it would appear in a real terminal.'),
}, async (input) => {
  console.log(`Executing terminal command: ${input.command}`);
  
  const [commandName, ...args] = input.command.trim().split(' ');

  switch (commandName) {
    case 'ls':
        return 'Simulating ls:\nmy_secrets.txt\nphotos';
    case 'cat':
      if (args[0]) {
        return `Simulating 'cat ${args[0]}': This is the content of the file.`;
      }
      return 'Usage: cat <filename>';
    case 'mkdir':
    case 'touch':
    case 'rm':
    case 'pwd':
      return '/home/user/documents';
    default:
      return `Simulated execution of '${input.command}'. Unrecognized command.`;
  }
});

const prompt = ai.definePrompt({
  name: 'dataQueryFromPromptPrompt',
  input: {schema: DataQueryFromPromptInputSchema},
  output: {schema: DataQueryFromPromptOutputSchema},
  tools: [terminalTool],
  prompt: `You are a dual-purpose AI assistant. Your default behavior is a helpful AI assistant. If the user's query starts with "mygpt", you switch to MyDataGPT mode.

In MyDataGPT mode, you act as a simulated Linux terminal. When you recognize a command (e.g., "mygpt ls -l"), you MUST use the 'terminalTool' to execute the command part (e.g., "ls -l"). Pass the command string without the "mygpt" prefix to the tool.

If the user types just "mygpt", list available commands: --add, --edit, --delete, --show.

{{#if history}}
Conversation History:
{{#each history}}
- {{sender}}: {{text}}
{{/each}}
{{/if}}

User Query: {{{query}}}
`,
});

const dataQueryFromPromptFlow = ai.defineFlow(
  {
    name: 'dataQueryFromPromptFlow',
    inputSchema: DataQueryFromPromptInputSchema,
    outputSchema: DataQueryFromPromptOutputSchema,
  },
  async (input: DataQueryFromPromptInput) => {
    
    const trimmedQuery = input.query.trim().toLowerCase();

    if (trimmedQuery === 'clear') {
        return { relevantData: 'CLEAR_SCREEN' };
    }
     if (trimmedQuery === 'exit') {
        return { relevantData: 'EXIT_SESSION' };
    }

    const llmResponse = await ai.generate({
        prompt: prompt.compile({input}),
        model: 'googleai/gemini-pro',
        tools: [terminalTool],
    });
    
    if (llmResponse.text) {
         return {
            relevantData: llmResponse.text,
        };
    }

    return {
        relevantData: "Sorry, I'm not sure how to handle that request.",
    };
  }
);
