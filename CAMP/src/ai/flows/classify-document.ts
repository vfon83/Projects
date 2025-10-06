'use server';
/**
 * Classifies a construction document into categories like 'Construction,' 'MEP,' or 'Code/Specification'.
 *
 * - classifyConstructionDocument - A function that classifies the document.
 * - ClassifyConstructionDocumentInput - The input type for the classifyConstructionDocument function.
 * - ClassifyConstructionDocumentOutput - The return type for the classifyConstructionDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyConstructionDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A construction document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyConstructionDocumentInput = z.infer<typeof ClassifyConstructionDocumentInputSchema>;

const ClassifyConstructionDocumentOutputSchema = z.object({
  category: z
    .enum(['Construction', 'MEP', 'Code/Specification'])
    .describe('The classified category of the construction document.'),
});
export type ClassifyConstructionDocumentOutput = z.infer<typeof ClassifyConstructionDocumentOutputSchema>;

export async function classifyConstructionDocument(
  input: ClassifyConstructionDocumentInput
): Promise<ClassifyConstructionDocumentOutput> {
  return classifyConstructionDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyConstructionDocumentPrompt',
  input: {schema: ClassifyConstructionDocumentInputSchema},
  output: {schema: ClassifyConstructionDocumentOutputSchema},
  prompt: `You are an expert construction document classifier.  You will classify the construction document as either "Construction", "MEP", or "Code/Specification".\n\nDocument: {{media url=documentDataUri}}`,
});

const classifyConstructionDocumentFlow = ai.defineFlow(
  {
    name: 'classifyConstructionDocumentFlow',
    inputSchema: ClassifyConstructionDocumentInputSchema,
    outputSchema: ClassifyConstructionDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
