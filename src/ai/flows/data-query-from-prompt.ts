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
  // In a real application, this would interact with a secure, encrypted virtual file system.
  // For now, we'll simulate the output.
  console.log(`Executing terminal command: ${input.command}`);
  
  const [commandName, ...args] = input.command.trim().split(' ');

  switch (commandName) {
    case 'ls':
      if (args.includes('-l')) {
        return 'Simulating ls -l:\n-rw-r--r-- 1 user user 1024 Jan 1 12:00 my_secrets.txt\ndrwxr-xr-x 2 user user 4096 Jan 1 12:00 photos';
      }
       if (args.includes('-a')) {
        return 'Simulating ls -a:\n.\n..\n.hidden_file\nmy_secrets.txt\nphotos';
      }
      return 'Simulating ls:\nmy_secrets.txt\nphotos';
    case 'cat':
      if (args[0]) {
        return `Simulating 'cat ${args[0]}': This is the content of the file.`;
      }
      return 'Usage: cat <filename>';
    case 'head':
      if (args[0]) {
        return `Simulating 'head ${args[0]}': This is the beginning of the file.`;
      }
      return 'Usage: head <filename>';
    case 'tail':
       if (args[0]) {
        return `Simulating 'tail ${args[0]}': This is the end of the file.`;
      }
      return 'Usage: tail <filename>';
    case 'less':
       if (args[0]) {
        return `Simulating 'less ${args[0]}': (Viewer is active, press 'q' to quit)`;
      }
      return 'Usage: less <filename>';
    case 'mkdir':
    case 'touch':
    case 'cp':
    case 'mv':
    case 'rm':
    case 'rmdir':
    case 'cd':
      // These commands succeed quietly in a terminal
      return '';
    case 'pwd':
      return '/home/user/documents';
    case 'whoami':
      return 'user';
    case 'date':
      return new Date().toString();
    default:
      return `Simulated execution of '${input.command}'. Unrecognized command.`;
  }
});

const prompt = ai.definePrompt({
  name: 'dataQueryFromPromptPrompt',
  input: {schema: DataQueryFromPromptInputSchema},
  output: {schema: DataQueryFromPromptOutputSchema},
  tools: [terminalTool],
  prompt: `You are a dual-purpose AI assistant with two modes: "Ollama Mode" and "MyDataGPT Mode".

**Ollama Mode (Default Behavior):**
- You are a standard, helpful AI assistant like ChatGPT. Your knowledge is general, and you have no memory of past conversations after the app closes.
- In this mode, you MUST NOT use any tools or acknowledge the existence of a secure terminal, file system, or "MyDataGPT". You are just a generic chatbot.

**MyDataGPT Mode (Private Data Vault):**
- This mode is activated ONLY when the user's query starts with the word "mygpt".
- In this mode, you act as a simulated Linux terminal environment for a secure, persistent database called MyDataGPT.
- When you recognize a command within MyDataGPT mode (e.g., "mygpt ls -l", "mygpt cat my_secrets.txt"), you MUST use the \`terminalTool\` to execute the command part (e.g., "ls -l", "cat my_secrets.txt").
- Your primary role is to pass the user's command string (without the "mygpt" prefix) to the \`terminalTool\`.
- The output should look exactly like it would in a real terminal.
- If the user types just "mygpt", you should list available commands: --add, --edit, --delete, --show.
- If the user types "mygpt --add", you should ask what they want to add (contact, document, image, etc.) and guide them. This is a conversational interaction and does NOT use the terminalTool.

**Conversation History (Represents Terminal State in MyDataGPT Mode):**
{{#if history}}
{{#each history}}
- {{sender}}: {{text}}
{{/each}}
{{/if}}

**IMPORTANT:** If the query does not start with "mygpt", you MUST remain in Ollama Mode.

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
    
    const trimmedQuery = input.query.trim();

    if (trimmedQuery.toLowerCase() === 'clear') {
        return { relevantData: 'CLEAR_SCREEN' };
    }
     if (trimmedQuery.toLowerCase() === 'exit') {
        return { relevantData: 'EXIT_SESSION' };
    }

    const llmResponse = await ai.generate({
        prompt: prompt.compile({input}),
        model: 'googleai/gemini-pro',
        tools: [terminalTool]
    });
    
    const toolRequest = llmResponse.toolRequest();
    // Check if the model is trying to use the terminalTool.
    // The prompt instructs it to only do this in "MyDataGPT" mode.
    if (toolRequest?.tool === 'terminalTool' && typeof toolRequest.input.command === 'string') {
        const toolOutput = await terminalTool({ command: toolRequest.input.command });
        return { relevantData: toolOutput };
    }
    
    // Default to conversational response if no tool is called
    if (llmResponse.text) {
         return {
            relevantData: llmResponse.text,
        };
    }

    // Fallback for cases where the model fails to generate text or a tool call.
    return {
        relevantData: "Sorry, I'm not sure how to handle that request.",
    };
  }
);
