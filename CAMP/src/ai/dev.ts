import { config } from 'dotenv';
config();

import '@/ai/flows/extract-information.ts';
import '@/ai/flows/classify-document.ts';
import '@/ai/flows/summarize-document.ts';

import { ai } from './genkit';

// This file is used by genkit CLI to start the development server
// It exports the AI instance that will be used by the flows
export default ai;