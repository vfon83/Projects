// extract-information.ts
'use server';
/**
 * Extracts key information from construction plans.
 *
 * extractInformation - A function that handles the extraction process.
 * ExtractInformationInput - The input type for the extractInformation function.
 * ExtractInformationOutput - The return type for the extractInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInformationInputSchema = z.object({
  planDataUri: z
    .string()
    .describe(
      "A construction plan document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  planType: z
    .enum(['Construction', 'MEP', 'Code/Specification'])
    .describe('The type of construction plan document.'),
});
export type ExtractInformationInput = z.infer<typeof ExtractInformationInputSchema>;

const ExtractInformationOutputSchema = z.object({
  materialSchedules: z.string().describe('Extracted material schedules.'),
  equipmentSpecifications: z.string().describe('Extracted equipment specifications.'),
  spatialDimensions: z.string().describe('Extracted spatial dimensions.'),
});
export type ExtractInformationOutput = z.infer<typeof ExtractInformationOutputSchema>;

export async function extractInformation(input: ExtractInformationInput): Promise<ExtractInformationOutput> {
  return extractInformationFlow(input);
}

const extractInformationPrompt = ai.definePrompt({
  name: 'extractInformationPrompt',
  input: {schema: ExtractInformationInputSchema},
  output: {schema: ExtractInformationOutputSchema},
  prompt: `You are an expert construction project manager. Your task is to extract key information from construction plans.

You will be provided with a construction plan document and its type. Your goal is to extract the following information:
- Material Schedules
- Equipment Specifications
- Spatial Dimensions

Plan Type: {{{planType}}}
Plan Document: {{media url=planDataUri}}

Please provide the extracted information in a structured format.
`,
});

const extractInformationFlow = ai.defineFlow(
  {
    name: 'extractInformationFlow',
    inputSchema: ExtractInformationInputSchema,
    outputSchema: ExtractInformationOutputSchema,
  },
  async input => {
    const {output} = await extractInformationPrompt(input);
    return output!;
  }
);
