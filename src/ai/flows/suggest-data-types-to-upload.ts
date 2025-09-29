'use server';

import {z} from 'zod';

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
    const response = await fetch('http://localhost:80/chatgpt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        return {
            suggestedDataTypes: 'Contacts, Photos, Documents',
        };
    }

    const result = await response.json();
    return result;

}
