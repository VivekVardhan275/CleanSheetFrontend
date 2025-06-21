'use server';
/**
 * @fileOverview An AI flow to generate an Exploratory Data Analysis (EDA) report.
 *
 * - generateEda - A function that orchestrates the EDA generation.
 * - EdaInput - The input type for the generateEda function.
 * - EdaResult - The return type for the generateEda function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const EdaInputSchema = z.object({
  jsonData: z.string().describe('The dataset in JSON format (array of objects).'),
});
export type EdaInput = z.infer<typeof EdaInputSchema>;

const EdaResultSchema = z.object({
  dataTypeDistribution: z.array(z.object({
    name: z.string().describe('The data type (e.g., Numeric, Categorical)'),
    value: z.number().describe('The count of columns of this type'),
  })).describe('Distribution of column data types.'),
  
  nullValueAnalysis: z.array(z.object({
    name: z.string().describe('The column name.'),
    missing: z.number().describe('The count of missing values in this column.'),
  })).describe('Analysis of missing (null) values for columns that have them.'),

  valueDistributions: z.array(z.object({
    column: z.string().describe('The numeric column for which distribution is calculated.'),
    distribution: z.array(z.object({
      name: z.string().describe('The bin or range for the distribution (e.g., "20-25").'),
      count: z.number().describe('The number of values in this bin.'),
    })).describe('Histogram data for the column.'),
  })).describe('Value distribution for the top 1-2 most important numeric columns.'),

  correlationHeatmapDataUri: z.string().describe("A correlation heatmap image for numeric columns, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type EdaResult = z.infer<typeof EdaResultSchema>;

export async function generateEda(input: EdaInput): Promise<EdaResult> {
  return generateEdaFlow(input);
}

const edaPrompt = ai.definePrompt({
  name: 'edaAnalysisPrompt',
  input: { schema: EdaInputSchema },
  output: { schema: EdaResultSchema.omit({ correlationHeatmapDataUri: true }) },
  prompt: `You are an expert data analyst. Analyze the following dataset and provide a structured Exploratory Data Analysis (EDA).
  
  Your analysis should include:
  1.  **Data Type Distribution**: Count how many columns are numeric and how many are categorical.
  2.  **Null Value Analysis**: Identify all columns that contain null/missing values and count how many missing values are in each. Only include columns that have missing values.
  3.  **Value Distributions**: For the most significant numeric column in the dataset, generate a histogram distribution. Group the values into reasonable bins. If there are no numeric columns, return an empty array.

  Dataset:
  \`\`\`json
  {{{jsonData}}}
  \`\`\`
  `,
});

const generateEdaFlow = ai.defineFlow(
  {
    name: 'generateEdaFlow',
    inputSchema: EdaInputSchema,
    outputSchema: EdaResultSchema,
  },
  async (input) => {
    const textEdaPromise = edaPrompt(input);

    const imagePromise = ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Based on the following JSON data, generate a correlation heatmap for the numeric columns. The heatmap should be visually appealing, use a modern color palette, and be easy to interpret. Do not include a title on the image itself. Data: ${input.jsonData}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const [textEdaResponse, imageResponse] = await Promise.all([textEdaPromise, imagePromise]);
    
    const textEdaOutput = textEdaResponse.output;
    const heatmapUri = imageResponse.media?.url;

    if (!textEdaOutput || !heatmapUri) {
      throw new Error('Failed to generate complete EDA report.');
    }
    
    return {
      ...textEdaOutput,
      correlationHeatmapDataUri: heatmapUri,
    };
  }
);
