'use server';

/**
 * @fileOverview A flow for configuring security thresholds for asset value classification.
 *
 * - configureSecurityThresholds - A function that handles the configuration of security thresholds.
 * - ConfigureSecurityThresholdsInput - The input type for the configureSecurityThresholds function.
 * - ConfigureSecurityThresholdsOutput - The return type for the configureSecurityThresholds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigureSecurityThresholdsInputSchema = z.object({
  highThreshold: z
    .number()
    .describe('The minimum score for an asset to be classified as High value.'),
  mediumThreshold: z
    .number()
    .describe(
      'The minimum score for an asset to be classified as Medium value.'
    ),
  lowThreshold: z
    .number()
    .describe('The maximum score for an asset to be classified as Low value.'),
  highDescription: z
    .string()
    .describe(
      'A description of what it means for an asset to be classified as High value.'
    ),
  mediumDescription: z
    .string()
    .describe(
      'A description of what it means for an asset to be classified as Medium value.'
    ),
  lowDescription: z
    .string()
    .describe(
      'A description of what it means for an asset to be classified as Low value.'
    ),
});
export type ConfigureSecurityThresholdsInput = z.infer<
  typeof ConfigureSecurityThresholdsInputSchema
>;

const ConfigureSecurityThresholdsOutputSchema = z.object({
  confirmationMessage: z
    .string()
    .describe(
      'A confirmation message indicating that the thresholds have been successfully configured.'
    ),
});
export type ConfigureSecurityThresholdsOutput = z.infer<
  typeof ConfigureSecurityThresholdsOutputSchema
>;

export async function configureSecurityThresholds(
  input: ConfigureSecurityThresholdsInput
): Promise<ConfigureSecurityThresholdsOutput> {
  return configureSecurityThresholdsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configureSecurityThresholdsPrompt',
  input: {schema: ConfigureSecurityThresholdsInputSchema},
  output: {schema: ConfigureSecurityThresholdsOutputSchema},
  prompt: `You are an administrator configuring the security thresholds for asset value classification.

Based on the following input, generate a confirmation message indicating that the thresholds have been successfully configured.

High Threshold: {{{highThreshold}}}
Medium Threshold: {{{mediumThreshold}}}
Low Threshold: {{{lowThreshold}}}

High Description: {{{highDescription}}}
Medium Description: {{{mediumDescription}}}
Low Description: {{{lowDescription}}}

Confirmation Message:`, // The prompt should provide a clear instruction
});

const configureSecurityThresholdsFlow = ai.defineFlow(
  {
    name: 'configureSecurityThresholdsFlow',
    inputSchema: ConfigureSecurityThresholdsInputSchema,
    outputSchema: ConfigureSecurityThresholdsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
