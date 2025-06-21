'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically cleaning data.
 *
 * - autoCleanData - A function that triggers the automatic data cleaning process.
 * - AutoCleanDataInput - The input type for the autoCleanData function, which includes the data as a CSV string.
 * - AutoCleanDataOutput - The return type for the autoCleanData function, which includes the cleaned data as a CSV string, and a cleaning report.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoCleanDataInputSchema = z.object({
  csvData: z
    .string()
    .describe('The data to clean, as a CSV string.'),
});
export type AutoCleanDataInput = z.infer<typeof AutoCleanDataInputSchema>;

const AutoCleanDataOutputSchema = z.object({
  cleanedCsvData: z
    .string()
    .describe('The cleaned data, as a CSV string.'),
  cleaningReport: z
    .string()
    .describe('A summary report of the transformations applied during data cleaning.'),
});
export type AutoCleanDataOutput = z.infer<typeof AutoCleanDataOutputSchema>;

export async function autoCleanData(input: AutoCleanDataInput): Promise<AutoCleanDataOutput> {
  return autoCleanDataFlow(input);
}

const autoCleanDataPrompt = ai.definePrompt({
  name: 'autoCleanDataPrompt',
  input: {schema: AutoCleanDataInputSchema},
  output: {schema: AutoCleanDataOutputSchema},
  prompt: `You are an expert data scientist specializing in automatically cleaning datasets.

You will receive a CSV dataset. You will clean the data by handling missing values, encoding categorical variables, scaling features, and detecting outliers.

Return the cleaned CSV data, and a summary report of the transformations you applied.

Dataset:
{{csvData}}`,
});

const autoCleanDataFlow = ai.defineFlow(
  {
    name: 'autoCleanDataFlow',
    inputSchema: AutoCleanDataInputSchema,
    outputSchema: AutoCleanDataOutputSchema,
  },
  async input => {
    const {output} = await autoCleanDataPrompt(input);
    return output!;
  }
);
