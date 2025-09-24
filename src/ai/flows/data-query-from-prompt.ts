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
  prompt: `You are a dual-purpose AI assistant with a strict security protocol, acting as a simulated Linux terminal environment (like Termux).

**Public Mode (Default Behavior):**
- If the user's query is NOT a recognized terminal command (e.g., "What's the capital of France?"), respond as a standard, helpful AI assistant like ChatGPT.
- In Public Mode, you MUST NOT use any tools or acknowledge the existence of a secure terminal or file system.

**Private Mode (Simulated Terminal):**
- Private Mode is activated when the user's query is a standard Linux/Unix terminal command.
- Recognized commands include: \`ls\`, \`cd\`, \`pwd\`, \`mkdir\`, \`rmdir\`, \`touch\`, \`cp\`, \`mv\`, \`rm\`, \`cat\`, \`less\`, \`head\`, \`tail\`, \`whoami\`, \`date\`, \`clear\`, \`exit\`.
- When you recognize a terminal command, you MUST use the \`terminalTool\` to execute it.
- Your primary role is to pass the user's exact command string to the \`terminalTool\`. Do not interpret it or respond conversationally.
- The output should look exactly like it would in a real terminal. Do not add conversational text unless the command is invalid or an error occurs.
- If the command is \`clear\`, you must output the single word "CLEAR_SCREEN".
- If the command is \`exit\`, you must output the single word "EXIT_SESSION".
- You must maintain the state of the virtual file system (current directory, file structure) based on the history of commands.

**Conversation History (Represents Terminal State):**
{{#if history}}
{{#each history}}
- {{sender}}: {{text}}
{{/each}}
{{/if}}

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
        tools: [terminalTool]
    });
    
    const toolRequest = llmResponse.toolRequest();
    if (toolRequest?.tool === 'terminalTool') {
       const toolOutput = await terminalTool(toolRequest.input);
       return { relevantData: toolOutput };
    }
    
    // Default to conversational response if no tool is called
    if (llmResponse.text) {
         return {
            relevantData: llmResponse.text,
        };
    }

    // If for some reason we get here, it's an unhandled case.
    // Try to force a tool call for commands that should have one.
    const potentialCommands = ['ls', 'cd', 'pwd', 'mkdir', 'rmdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'less', 'head', 'tail', 'whoami', 'date'];
    const isCommand = potentialCommands.some(cmd => trimmedQuery.startsWith(cmd));

    if (isCommand) {
        const forcedToolResponse = await terminalTool({ command: input.query.trim() });
        return { relevantData: forcedToolResponse };
    }

    return {
        relevantData: "Sorry, I'm not sure how to handle that command.",
    };
  }
);
