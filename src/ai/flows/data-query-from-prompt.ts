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
  description: 'A tool that simulates a Linux terminal. It can manage a virtual file system including creating, reading, and deleting files and directories. This is the ONLY tool that can interact with the user\'s private virtual file system.',
  inputSchema: z.object({
    command: z.string().describe('The full command to execute, e.g., "ls -l /documents".'),
  }),
  outputSchema: z.string().describe('The simulated output of the command, as it would appear in a real terminal.'),
}, async (input) => {
  // In a real application, this would interact with a secure, encrypted virtual file system.
  // For now, we'll simulate the output.
  console.log(`Executing terminal command: ${input.command}`);
  
  const [commandName, ...args] = input.command.split(' ');

  if (commandName === 'ls') {
    return 'Simulating ls: \n-rw-r--r-- 1 user user 1024 Jan 1 12:00 my_secrets.txt\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 photos';
  }
  if (commandName === 'cat') {
      if (args[0]) {
        return `Simulating 'cat ${args[0]}': This is the content of your secret file.`;
      }
      return 'Usage: cat <filename>';
  }
  if (commandName === 'mkdir' || commandName === 'touch') {
    return ``; // Successful creation commands have no output
  }
  if (commandName === 'rm' || commandName === 'rmdir') {
    return ``; // Successful deletion commands have no output
  }
  if (commandName === 'pwd') {
      return '/home/user';
  }
   if (commandName === 'whoami') {
      return 'user';
  }
    if (commandName === 'date') {
      return new Date().toString();
  }

  return `Simulated execution of '${input.command}'.`;
});

const prompt = ai.definePrompt({
  name: 'dataQueryFromPromptPrompt',
  input: {schema: DataQueryFromPromptInputSchema},
  output: {schema: DataQueryFromPromptOutputSchema},
  tools: [terminalTool],
  prompt: `You are a dual-purpose AI assistant with a strict security protocol.

**Public Mode (Default Behavior):**
- You are a helpful, harmless AI assistant like ChatGPT.
- For any general question that is NOT a recognized terminal command (e.g., "What's the capital of France?", "Write a poem"), you MUST respond as a standard AI assistant.
- In Public Mode, you MUST NOT use any tools or acknowledge the existence of a secure terminal or file system. Your responses should be generic and helpful.

**Private Mode (Simulated Terminal):**
- Private Mode is activated when the user's query looks like a standard Linux/Unix terminal command.
- Recognized commands include: \`ls\`, \`cd\`, \`pwd\`, \`mkdir\`, \`rmdir\`, \`touch\`, \`cp\`, \`mv\`, \`rm\`, \`cat\`, \`less\`, \`head\`, \`tail\`, \`whoami\`, \`date\`, \`clear\`, \`exit\`.
- When you recognize a terminal command, you MUST use the \`terminalTool\` to execute it.
- You must maintain the state of the virtual file system (current directory, file structure) based on the history of commands.
- The output should look exactly like it would in a real terminal. Do not add conversational text unless the command is invalid or an error occurs.
- If the command is \`clear\`, you must output the single word "CLEAR_SCREEN".
- If the command is \`exit\`, you must output the single word "EXIT_SESSION".

**Conversation History (Represents Terminal State):**
{{#if history}}
{{#each history}}
- {{sender}}: {{text}}
{{/each}}
{{/if}}

**Example Flow (Private Mode):**
- User: "ls -a"
- You: (Call terminalTool({ command: 'ls -a' })) -> Output the result from the tool.
- User: "mkdir my_new_folder"
- You: (Call terminalTool({ command: 'mkdir my_new_folder' })) -> Return no output, just wait for next prompt.
- User: "ls"
- You: (Call terminalTool({ command: 'ls' })) -> Output should now include 'my_new_folder'.

**IMPORTANT:** If you are not confident that the user input is a terminal command, you MUST default to Public Mode. Only act as a terminal if the command is unambiguous.

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
    
    if (input.query.trim().toLowerCase() === 'clear') {
        return { relevantData: 'CLEAR_SCREEN' };
    }

    const llmResponse = await ai.generate({
        prompt: prompt.compile({input}),
        model: 'googleai/gemini-pro',
        tools: [terminalTool],
        forceTool: { tool: 'terminalTool' }
    });
    
    const toolRequest = llmResponse.toolRequest();
    if (toolRequest?.tool === 'terminalTool') {
       const toolOutput = await terminalTool(toolRequest.input);
       return { relevantData: toolOutput };
    }
    
    return {
        relevantData: llmResponse.text,
    };
  }
);
