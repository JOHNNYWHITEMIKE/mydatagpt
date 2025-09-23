'use server';

/**
 * @fileOverview Suggests data types to upload to a new user.
 *
 * This flow uses an LLM to suggest data types to upload based on what the
 * app knows about the user.
 *
 * @interface SuggestDataTypesToUploadInput - The input to the suggestDataTypesToUpload function.
 * @interface SuggestDataTypesToUploadOutput - The output of the suggestDataTypesToUpload function.
 * @function suggestDataTypesToUpload - The function that suggests data types to upload.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDataTypesToUploadInputSchema = z.object({
  knownInformation: z
    .string()
    .describe(
      'Information known about the user, which can be an empty string if nothing is known.'
    ),
});
export type SuggestDataTypesToUploadInput = z.infer<
  typeof SuggestDataTypesToUploadInputSchema
>;

const SuggestDataTypesToUploadOutputSchema = z.object({
  suggestedDataTypes: z
    .string()
    .describe(
      'A comma-separated list of data types the user should upload, such as contacts, photos, and documents.'
    ),
});
export type SuggestDataTypesToUploadOutput = z.infer<
  typeof SuggestDataTypesToUploadOutputSchema
>;

export async function suggestDataTypesToUpload(
  input: SuggestDataTypesToUploadInput
): Promise<SuggestDataTypesToUploadOutput> {
  return suggestDataTypesToUploadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDataTypesToUploadPrompt',
  input: {schema: SuggestDataTypesToUploadInputSchema},
  output: {schema: SuggestDataTypesToUploadOutputSchema},
  prompt: `You are an AI assistant that suggests data types to upload to a new user of a secure data storage app.

  Based on the information you have about the user, suggest data types that would be useful for them to upload.

  Known information about the user: {{{knownInformation}}}

  Suggested data types (comma-separated):
  `,
});

const suggestDataTypesToUploadFlow = ai.defineFlow(
  {
    name: 'suggestDataTypesToUploadFlow',
    inputSchema: SuggestDataTypesToUploadInputSchema,
    outputSchema: SuggestDataTypesToUploadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
