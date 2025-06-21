'use server';

/**
 * @fileOverview Generates a summary report of the transformations applied during the auto-cleaning process.
 *
 * - generateAutoCleanReport - A function that generates the auto-cleaning report.
 * - AutoCleanReportInput - The input type for the generateAutoCleanReport function.
 * - AutoCleanReportOutput - The return type for the generateAutoCleanReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoCleanReportInputSchema = z.object({
  originalDataSummary: z
    .string()
    .describe('A summary of the original dataset, including datatypes and missing values.'),
  cleanedDataSummary: z
    .string()
    .describe('A summary of the cleaned dataset, including datatypes and missing values.'),
  transformationsApplied: z
    .string()
    .describe('A description of the transformations applied during the auto-cleaning process.'),
});
export type AutoCleanReportInput = z.infer<typeof AutoCleanReportInputSchema>;

const AutoCleanReportOutputSchema = z.object({
  report: z
    .string()
    .describe('A detailed report summarizing the transformations applied during the auto-cleaning process and their impact on the data.'),
});
export type AutoCleanReportOutput = z.infer<typeof AutoCleanReportOutputSchema>;

export async function generateAutoCleanReport(input: AutoCleanReportInput): Promise<AutoCleanReportOutput> {
  return autoCleanReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoCleanReportPrompt',
  input: {schema: AutoCleanReportInputSchema},
  output: {schema: AutoCleanReportOutputSchema},
  prompt: `You are an expert data scientist. You have automatically cleaned a dataset and need to generate a report summarizing the transformations applied.

  Original Data Summary: {{{originalDataSummary}}}
  Cleaned Data Summary: {{{cleanedDataSummary}}}
  Transformations Applied: {{{transformationsApplied}}}

  Based on the information above, generate a comprehensive report that explains the transformations applied, the reasoning behind them, and their impact on the dataset. The report should be detailed and easy to understand for a non-technical audience.
  Make sure that the report has a title, introduction, and summary.
  `,
});

const autoCleanReportFlow = ai.defineFlow(
  {
    name: 'autoCleanReportFlow',
    inputSchema: AutoCleanReportInputSchema,
    outputSchema: AutoCleanReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
