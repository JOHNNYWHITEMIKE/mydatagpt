'use server';

import {
  dataQueryFromPrompt,
  type DataQueryFromPromptInput,
  type DataQueryFromPromptOutput,
} from '@/ai/flows/data-query-from-prompt';
import {
  suggestDataTypesToUpload,
  type SuggestDataTypesToUploadInput,
  type SuggestDataTypesToUploadOutput,
} from '@/ai/flows/suggest-data-types-to-upload';

export async function handleQuery(
  input: DataQueryFromPromptInput
): Promise<DataQueryFromPromptOutput> {
  try {
    const result = await dataQueryFromPrompt(input);
    return result;
  } catch (error) {
    console.error('Error in handleQuery:', error);
    return {
      relevantData: 'An error occurred while processing your request.',
    };
  }
}

export async function getUploadSuggestions(
  input: SuggestDataTypesToUploadInput
): Promise<SuggestDataTypesToUploadOutput> {
  try {
    const result = await suggestDataTypesToUpload(input);
    return result;
  } catch (error) {
    console.error('Error in getUploadSuggestions:', error);
    return {
      suggestedDataTypes: 'Contacts, Photos, Documents',
    };
  }
}
