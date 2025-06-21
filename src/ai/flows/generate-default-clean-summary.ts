'use server';
/**
 * @fileOverview Generates a summary of default data cleaning steps.
 *
 * - generateDefaultCleanSummary - A function that generates a summary of cleaning steps.
 * - GenerateDefaultCleanSummaryInput - The input type for the function.
 * - GenerateDefaultCleanSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateDefaultCleanSummaryInputSchema = z.object({
  numericColumns: z.array(z.string()).describe('List of numeric column names.'),
  categoricalColumns: z.array(z.string()).describe('List of categorical column names.'),
  columnsWithMissingValues: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['numeric', 'categorical']),
      })
    )
    .describe('List of columns with missing values and their types.'),
});
export type GenerateDefaultCleanSummaryInput = z.infer<typeof GenerateDefaultCleanSummaryInputSchema>;

export const GenerateDefaultCleanSummaryOutputSchema = z.object({
  summary: z.string().describe('A markdown-formatted summary of default data cleaning steps that will be applied.'),
});
export type GenerateDefaultCleanSummaryOutput = z.infer<typeof GenerateDefaultCleanSummaryOutputSchema>;

export async function generateDefaultCleanSummary(
  input: GenerateDefaultCleanSummaryInput
): Promise<GenerateDefaultCleanSummaryOutput> {
  return generateDefaultCleanSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDefaultCleanSummaryPrompt',
  input: {schema: GenerateDefaultCleanSummaryInputSchema},
  output: {schema: GenerateDefaultCleanSummaryOutputSchema},
  prompt: `You are a helpful data science assistant. Based on the provided dataset schema, generate a concise summary of the default data cleaning steps that will be applied. Be clear and use bullet points in markdown format.

The default steps are:
1.  **Handle Missing Values**:
    -   Fill missing numeric values with the mean.
    -   Fill missing categorical values with the mode (most frequent value).
2.  **Encode Categorical Data**:
    -   Convert text-based categorical columns to a numerical format using One-Hot Encoding.
3.  **Scale Numerical Data**:
    -   Standardize numerical features to have a mean of 0 and a standard deviation of 1.

Based on the schema below, list the specific columns that each step will apply to. If a step does not apply to any column (e.g., no missing values), state that.

**Dataset Schema:**
-   **Numeric Columns**: {{{json numericColumns}}}
-   **Categorical Columns**: {{{json categoricalColumns}}}
-   **Columns with Missing Values**: {{{json columnsWithMissingValues}}}
`,
});

const generateDefaultCleanSummaryFlow = ai.defineFlow(
  {
    name: 'generateDefaultCleanSummaryFlow',
    inputSchema: GenerateDefaultCleanSummaryInputSchema,
    outputSchema: GenerateDefaultCleanSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
