'use server';

/**
 * @fileOverview AI-powered document suggestion flow for dentists based on their role and region.
 *
 * - suggestDocuments - A function that suggests relevant documents to a dentist.
 * - SuggestDocumentsInput - The input type for the suggestDocuments function.
 * - SuggestDocumentsOutput - The return type for the suggestDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDocumentsInputSchema = z.object({
  userRole: z
    .string()
    .describe(
      'The role of the user, e.g., dentist, landeskammer member. Should match the roles defined in the system.'
    ),
  region: z
    .string()
    .describe(
      'The region of the user. This should match the regions defined in the system.'
    ),
});
export type SuggestDocumentsInput = z.infer<typeof SuggestDocumentsInputSchema>;

const SuggestedDocumentSchema = z.object({
  title: z.string().describe('The title of the suggested document.'),
  description: z.string().describe('A brief description of the document.'),
  documentId: z.string().describe('The unique ID of the document.'),
});

const SuggestDocumentsOutputSchema = z.array(SuggestedDocumentSchema).describe('A list of suggested documents.');
export type SuggestDocumentsOutput = z.infer<typeof SuggestDocumentsOutputSchema>;

export async function suggestDocuments(input: SuggestDocumentsInput): Promise<SuggestDocumentsOutput> {
  return suggestDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDocumentsPrompt',
  input: {schema: SuggestDocumentsInputSchema},
  output: {schema: SuggestDocumentsOutputSchema},
  prompt: `You are an AI assistant specialized in suggesting relevant documents to users based on their role and region.

  Given the user's role as "{{userRole}}" and region as "{{region}}", suggest the top 3 most relevant documents from our document database.

  Ensure that the suggested documents are highly relevant to the user's role and region.

  Return the documents as a JSON array.
  Each object in the array must contain the fields "title", "description", and "documentId".
`,
});

const suggestDocumentsFlow = ai.defineFlow(
  {
    name: 'suggestDocumentsFlow',
    inputSchema: SuggestDocumentsInputSchema,
    outputSchema: SuggestDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
