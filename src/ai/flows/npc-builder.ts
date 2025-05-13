'use server';
/**
 * @fileOverview NPC Builder AI agent.
 *
 * - generateNpc - A function that handles the NPC generation process.
 * - GenerateNpcInput - The input type for the generateNpc function.
 * - GenerateNpcOutput - The return type for the generateNpc function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNpcInputSchema = z.object({
  name: z.string().describe('The name of the NPC.'),
  race: z.string().describe('The race of the NPC.'),
  occupation: z.string().describe('The occupation of the NPC.'),
  setting: z.string().describe('The setting in which the NPC exists.'),
  additionalDetails: z
    .string()
    .optional()
    .describe('Any additional details to consider when creating the NPC.'),
});
export type GenerateNpcInput = z.infer<typeof GenerateNpcInputSchema>;

const GenerateNpcOutputSchema = z.object({
  description: z.string().describe('A detailed description of the NPC.'),
  personalityTraits: z.string().describe('A list of personality traits.'),
  backstory: z.string().describe('A compelling backstory for the NPC.'),
  motivations: z.string().describe('The NPC\'s motivations and goals.'),
});
export type GenerateNpcOutput = z.infer<typeof GenerateNpcOutputSchema>;

export async function generateNpc(input: GenerateNpcInput): Promise<GenerateNpcOutput> {
  return generateNpcFlow(input);
}

const generateNpcPrompt = ai.definePrompt({
  name: 'generateNpcPrompt',
  input: {schema: GenerateNpcInputSchema},
  output: {schema: GenerateNpcOutputSchema},
  prompt: `You are an experienced Dungeon Master known for creating memorable NPCs.

  Based on the details provided, craft a unique and compelling NPC.

  Name: {{{name}}}
  Race: {{{race}}}
  Occupation: {{{occupation}}}
  Setting: {{{setting}}}
  Additional Details: {{{additionalDetails}}}

  Description:
  Personality Traits:
  Backstory:
  Motivations: `,
});

const generateNpcFlow = ai.defineFlow(
  {
    name: 'generateNpcFlow',
    inputSchema: GenerateNpcInputSchema,
    outputSchema: GenerateNpcOutputSchema,
  },
  async input => {
    const {output} = await generateNpcPrompt(input);
    return output!;
  }
);
