
'use server';
/**
 * @fileOverview A Genkit flow to generate an introduction scene for a faction.
 *
 * - generateFactionIntroduction - A function that generates an introduction scene.
 * - GenerateFactionIntroductionInput - The input type for the function.
 * - GenerateFactionIntroductionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateFactionIntroductionInputSchema = z.object({
  factionName: z.string().describe('The name of the faction.'),
  factionGoals: z.string().describe('The primary goals or objectives of the faction.'),
  factionPhilosophy: z.string().optional().describe('The core beliefs, ideology, or methods of the faction.'),
  factionLeader: z.string().optional().describe('The name or description of the faction\'s leader.'),
  factionLieutenant: z.string().optional().describe('The name or description of the faction\'s lieutenant or second-in-command.'),
  factionSupportingCast: z.string().optional().describe('Key members, notable figures, or contacts within the faction.'),
  factionReputation: z.number().optional().describe('The party\'s current reputation with the faction (scale of -5 to 5, where -5 is Sworn Enemy and 5 is Sworn Ally). This can influence the tone of the introduction.'),
  campaignSetting: z.string().optional().describe('The name or a brief description of the campaign setting or world.'),
});
export type GenerateFactionIntroductionInput = z.infer<typeof GenerateFactionIntroductionInputSchema>;

export const GenerateFactionIntroductionOutputSchema = z.object({
  introductionScene: z.string().describe('A compelling and descriptive introduction scene for how the party might first encounter or learn about this faction. This should be a few paragraphs long.'),
});
export type GenerateFactionIntroductionOutput = z.infer<typeof GenerateFactionIntroductionOutputSchema>;

export async function generateFactionIntroduction(
  input: GenerateFactionIntroductionInput
): Promise<GenerateFactionIntroductionOutput> {
  return factionIntroductionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'factionIntroductionGeneratorPrompt',
  input: {schema: GenerateFactionIntroductionInputSchema},
  output: {schema: GenerateFactionIntroductionOutputSchema},
  prompt: `You are a creative Dungeon Master assistant. Your task is to write a compelling introduction scene for a faction based on the provided details. The scene should describe how a party of adventurers might first encounter or learn about this faction. Consider the faction's goals, leadership, philosophy, and reputation with the party to set the right tone.

Faction Details:
- Name: {{{factionName}}}
- Primary Goals: {{{factionGoals}}}
{{#if factionPhilosophy}}
- Philosophy/Ideology: {{{factionPhilosophy}}}
{{/if}}
{{#if factionLeader}}
- Leader: {{{factionLeader}}}
{{/if}}
{{#if factionLieutenant}}
- Lieutenant: {{{factionLieutenant}}}
{{/if}}
{{#if factionSupportingCast}}
- Supporting Cast/Notable Figures: {{{factionSupportingCast}}}
{{/if}}
{{#if factionReputation}}
- Current Reputation with Party (Scale -5 to 5): {{{factionReputation}}}
  (-5: Sworn Enemy, 0: Neutral, 5: Sworn Ally. Use this to influence the tone and nature of the first encounter.)
{{/if}}
{{#if campaignSetting}}
- Campaign Setting: {{{campaignSetting}}}
{{/if}}

Based on these details, craft an engaging introduction scene (2-3 paragraphs). Describe the setting of the encounter, who or what the party interacts with, and the initial impression the faction makes.
If the reputation is negative, the encounter might be tense, threatening, or an observation of their nefarious deeds.
If positive, it could be an offer of aid, a plea for help, or witnessing a benevolent act.
If neutral, it could be an intriguing rumor, a mysterious event, or an impartial observation.
Ensure the scene is vivid and provides clear hooks or implications for the party.
`,
});

const factionIntroductionGeneratorFlow = ai.defineFlow(
  {
    name: 'factionIntroductionGeneratorFlow',
    inputSchema: GenerateFactionIntroductionInputSchema,
    outputSchema: GenerateFactionIntroductionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate an introduction scene.");
    }
    return output;
  }
);
