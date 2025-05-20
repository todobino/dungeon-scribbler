
'use server';
/**
 * @fileOverview A Genkit flow to assist with campaign creation by generating ideas.
 *
 * - generateCampaignIdea - A function that generates an idea for a specific campaign field.
 * - GenerateCampaignIdeaInput - The input type for the function.
 * - GenerateCampaignIdeaOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // Changed from 'genkit'

// Define which fields the AI can provide suggestions for
const SuggestibleCampaignFieldsSchema = z.enum([
    "campaignConcept",
    "factionTypes"
]);

const GenerateCampaignIdeaInputSchema = z.object({ // Keep as local constant
  currentName: z.string().optional().describe("The current draft name of the campaign, if any."),
  currentConcept: z.string().optional().describe("The current overall concept of the campaign, if any."),
  currentTone: z.string().optional().describe("The current selected tone, if any."),
  currentWorldStyle: z.string().optional().describe("The current selected world style, if any."),
  currentRegionFocus: z.string().optional().describe("The current selected region focus, if any."),
  customRegionFocus: z.string().optional().describe("The custom region focus if 'Other' was selected."),
  currentTechnologyLevel: z.string().optional().describe("The current selected technology level, if any."),
  currentFactionTypes: z.string().optional().describe("The current faction types, if any."),
  currentPowerBalance: z.string().optional().describe("The current power balance, if any."),
  currentLength: z.string().optional().describe("The current campaign length/commitment, if any."),
  playerLevelStart: z.number().optional().describe("The starting player level."),
  playerLevelEnd: z.number().optional().describe("The ending player level."),
  fieldToSuggest: SuggestibleCampaignFieldsSchema.describe("The specific campaign aspect for which an idea is requested."),
});
export type GenerateCampaignIdeaInput = z.infer<typeof GenerateCampaignIdeaInputSchema>;

const GenerateCampaignIdeaOutputSchema = z.object({ // Keep as local constant
  suggestedValue: z.string().describe("The AI-generated suggestion for the requested field."),
});
export type GenerateCampaignIdeaOutput = z.infer<typeof GenerateCampaignIdeaOutputSchema>;


export async function generateCampaignIdea(
  input: GenerateCampaignIdeaInput
): Promise<GenerateCampaignIdeaOutput> {
  // MOCK IMPLEMENTATION
  // await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500)); // Simulate delay

  // let suggestion = `Mock suggestion for ${input.fieldToSuggest}.`;
  // if (input.currentName) suggestion += ` Considering campaign name: "${input.currentName}".`;
  
  // if (input.fieldToSuggest === "factionTypes") {
  //   if (input.currentWorldStyle === "Steampunk") {
  //     suggestion = "Clockwork Artisans Guild (Inventors pushing dangerous tech)\nSky-Pirate Confederacy (Rebels ruling the airwaves)\nAlchemists' Collective (Seekers of forbidden knowledge)";
  //   } else if (input.currentConcept) {
  //       suggestion = `The Silent Watchers (Guardians of ancient secrets)\nThe Crimson Banner Mercenaries (Sellswords with a surprisingly strict code of honor)\nThe Scholars of the Lost Age (Academics obsessed with forgotten lore for "${input.currentConcept.substring(0,20)}...")`;
  //   } else {
  //       suggestion = "The Midnight Circle (Practitioners of dark magic)\nKeepers of the Green (Protectors of the natural world)\nGuild of Iron (Master crafters and traders)";
  //   }
  // } else if (input.fieldToSuggest === "campaignConcept" && input.currentName) {
  //   suggestion = `A thrilling adventure where heroes must uncover the secrets of the ${input.currentName} to save the land from an ancient evil.`;
  // } else if (input.fieldToSuggest === "campaignConcept") {
  //   suggestion = `The players awaken with amnesia in a world on the brink of magical catastrophe.`;
  // }

  // return { suggestedValue: suggestion };
  return campaignWizardFlow(input); // Actual flow call
}

const promptTemplate = `
You are an expert Dungeon Master and world-building assistant.
The user is creating a new TTRPG campaign and needs a suggestion for the field: {{{fieldToSuggest}}}.

Current campaign details provided by the user:
{{#if currentName}}- Campaign Name: {{{currentName}}}{{/if}}
{{#if currentConcept}}- Campaign Concept: {{{currentConcept}}}{{/if}}
{{#if currentLength}}- Campaign Length: {{{currentLength}}}{{/if}}
{{#if currentTone}}- Tone: {{{currentTone}}}{{/if}}
{{#if playerLevelStart}}- Starting Player Level: {{{playerLevelStart}}}{{/if}}
{{#if playerLevelEnd}}- Ending Player Level: {{{playerLevelEnd}}}{{/if}}
{{#if currentWorldStyle}}- World Style: {{{currentWorldStyle}}}{{/if}}
{{#if currentRegionFocus}}{{#if customRegionFocus}}- Region Focus: {{{customRegionFocus}}} (Custom){{else}}- Region Focus: {{{currentRegionFocus}}}{{/if}}{{/if}}
{{#if currentTechnologyLevel}}- Technology Level: {{{currentTechnologyLevel}}}{{/if}}
{{#if currentFactionTypes}}- Faction Types: {{{currentFactionTypes}}}{{/if}}
{{#if currentPowerBalance}}- Power Balance: {{{currentPowerBalance}}}{{/if}}

Based on the existing details (if any), provide a creative suggestion for "{{fieldToSuggest}}".

If "{{fieldToSuggest}}" is "campaignConcept", provide a 1-2 sentence high-level concept.
If "{{fieldToSuggest}}" is "factionTypes", list 2-3 distinct faction names. Each name should be followed by a concise (5-10 word) parenthetical description of their archetype or core concept. Example: 'The Silent Watchers (Guardians of ancient secrets), The Crimson Banner Mercenaries (Sellswords with a surprisingly strict code of honor)'. Each faction should be on a new line.

Be creative and inspiring.
`;

const campaignWizardPrompt = ai.definePrompt({
  name: 'campaignWizardPrompt',
  input: {schema: GenerateCampaignIdeaInputSchema},
  output: {schema: GenerateCampaignIdeaOutputSchema},
  prompt: promptTemplate,
});

const campaignWizardFlow = ai.defineFlow(
  {
    name: 'campaignWizardFlow',
    inputSchema: GenerateCampaignIdeaInputSchema,
    outputSchema: GenerateCampaignIdeaOutputSchema,
  },
  async (input) => {
    const {output} = await campaignWizardPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate a campaign idea.");
    }
    return output;
  }
);
