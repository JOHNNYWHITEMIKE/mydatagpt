'use server';

/**
 * @fileOverview A data query AI agent that allows users to ask questions about their data using natural language.
 *
 * - dataQueryFromPrompt - A function that handles the data query process.
 * - DataQueryFromPromptInput - The input type for the dataQueryFromprompt function.
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
  description: 'After a security check, this tool can scan, add, edit, or delete data from the user\'s encrypted resources. This is the ONLY tool that can interact with the user\'s private data.',
  inputSchema: z.object({
    action: z.enum(['add', 'edit', 'delete', 'show']).describe('The action to perform.'),
    dataType: z.string().optional().describe('The type of data (e.g., contact, photo album, note).'),
    query: z.string().describe('The specific query or data for the action.'),
  }),
  outputSchema: z.string().describe('The result of the operation, or a confirmation message.'),
}, async (input) => {
  // In a real application, this is where you would trigger a biometric check.
  // For example: `const authenticated = await biometricCheck();`
  // If authenticated, you would proceed to decrypt and search/modify the resources.
  console.log(`[Security Check Passed] Performing action '${input.action}' on resources.`);
  return `Simulating successful '${input.action}' action for query: "${input.query}". The user's private data has been accessed.`;
});

const prompt = ai.definePrompt({
  name: 'dataQueryFromPromptPrompt',
  input: {schema: DataQueryFromPromptInputSchema},
  output: {schema: DataQueryFromPromptOutputSchema},
  tools: [scanEncryptedResourcesTool],
  prompt: `You are a dual-purpose AI assistant with a strict security protocol.

  **Public Mode (Default Behavior):**
  - For any general question (e.g., "What's the capital of France?", "Write a poem"), you MUST respond as a standard, helpful AI assistant like ChatGPT.
  - In Public Mode, you MUST NOT use any tools or acknowledge the existence of a secure vault. Your responses should be generic and helpful.

  **Private Mode (Secure Data Management):**
  - Private Mode is activated ONLY by the user query "mydatagpt".
  - If the user query is EXACTLY "mydatagpt", you must respond with the command list and await the user's next input. Your response must be:
    "mydatagpt commands:
    --add
    --edit
    --delete
    --show"
  - After showing the commands, your NEXT response MUST be guided by the user's choice of command (--add, --edit, --delete, --show). You will now act as an interactive guide for that task.

  **Private Mode: Guided Interaction Rules:**
  1.  **Security First:** Before performing any data action, you must state that a security check is being performed.
  2.  **Be Interactive:** Guide the user. If they say "--add", ask them WHAT they want to add.
  3.  **Data Types:** You understand the following data structures:
      - **contacts**: name, phone number, address, email.
      - **documents**: title, content.
      - **images/videos**: title, album name.
      - **accounts** or **email:password**: service/website, username/email, password.
      - **notes**: title, content.
      - **reminders**: content, due date/time.
  4.  **Prompt for Details:** For each data type, you MUST ask for the necessary fields. For example, if adding a contact, ask for the name, then phone, then address, etc.
  5.  **Use Tools for Data:** ALL actions involving user data (adding, showing, etc.) MUST use the 'scanEncryptedResources' tool. Formulate the tool input based on the user's guided responses.
  6.  **Confirmation:** After a tool action, confirm with the user. For example: "I've added 'John Doe' to your contacts."

  **Example Flow (Private Mode):**
  - User: "mydatagpt"
  - You: "mydatagpt commands:\n--add\n--edit\n--delete\n--show"
  - User: "--add"
  - You: "What would you like to add? You can add contacts, documents, notes, etc."
  - User: "a new contact"
  - You: "Got it. Performing security check. What is the contact's name?"
  - User: "John Doe"
  - You: "What is John Doe's phone number?"
  - User: "555-1234"
  - You: (Continue asking for address, email... then call the tool) -> Use scanEncryptedResourcesTool({ action: 'add', dataType: 'contact', query: 'name: John Doe, phone: 555-1234, ...' })

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
    // This special handling for 'mydatagpt' is still needed to kickstart the Private Mode flow.
    if (input.query.trim().toLowerCase() === 'mydatagpt') {
      return {
        relevantData: `mydatagpt commands:
      --add
      --edit
      --delete
      --show`,
      };
    }

    const response = await prompt(input);
    
    // Check if the LLM decided to use the tool
    const toolCall = response.toolCalls?.[0];
    if (toolCall?.name === 'scanEncryptedResources') {
       // If so, execute the tool and return its output.
       const toolOutput = await scanEncryptedResourcesTool(toolCall.input);
        return {
            relevantData: toolOutput,
        };
    }
    
    // Otherwise, return the standard text response.
    return {
        relevantData: response.text ?? 'I am not sure how to answer that.',
    };
  }
);
