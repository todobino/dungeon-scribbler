
'use server';
/**
 * @fileOverview A Genkit flow to generate character portraits.
 *
 * - generateCharacterPortrait - A function that generates an image for a character.
 * - CharacterPortraitInput - The input type for the function.
 * - CharacterPortraitOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CharacterPortraitInputSchema = z.object({
  characterName: z.string().describe("The name of the character."),
  characterRace: z.string().describe("The race of the character (e.g., Elf, Dwarf, Human)."),
  characterClass: z.string().describe("The class of the character (e.g., Fighter, Wizard, Rogue)."),
  appearanceDescription: z.string().describe("A detailed description of the character's appearance, features, clothing, and equipment."),
  artStyle: z.string().describe("The desired art style for the portrait (e.g., photorealistic, fantasy oil painting, anime sketch, pixel art)."),
});
export type CharacterPortraitInput = z.infer<typeof CharacterPortraitInputSchema>;

export const CharacterPortraitOutputSchema = z.object({
  generatedImageDataUri: z.string().describe("The generated character portrait as a base64 encoded data URI, including MIME type."),
  revisedPrompt: z.string().optional().describe("The revised prompt that was actually sent to the image generation model, if any.")
});
export type CharacterPortraitOutput = z.infer<typeof CharacterPortraitOutputSchema>;

export async function generateCharacterPortrait(
  input: CharacterPortraitInput
): Promise<CharacterPortraitOutput> {
  return characterPortraitGeneratorFlow(input);
}

const characterPortraitGeneratorFlow = ai.defineFlow(
  {
    name: 'characterPortraitGeneratorFlow',
    inputSchema: CharacterPortraitInputSchema,
    outputSchema: CharacterPortraitOutputSchema,
  },
  async (input) => {
    const promptText = `Generate a character portrait.
Character Name: ${input.characterName}
Race: ${input.characterRace}
Class: ${input.characterClass}
Appearance: ${input.appearanceDescription}
Art Style: ${input.artStyle}

Create a visually appealing and detailed portrait based on these characteristics. Focus on a clear depiction of the character's face and upper body.`;

    try {
      const {media, prompt} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Ensure this is the correct model for image generation
        prompt: promptText,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // Must provide both
        },
      });

      if (!media || !media.url) {
        throw new Error('AI failed to generate an image. No media URL returned.');
      }
      
      // The model might return a revised prompt if it modified the input for safety/clarity
      const finalPromptText = typeof prompt === 'string' ? prompt : (Array.isArray(prompt) && typeof prompt[0] === 'object' && 'text' in prompt[0]) ? (prompt[0] as {text: string}).text : promptText;


      return {
        generatedImageDataUri: media.url, // This should be the data URI
        revisedPrompt: finalPromptText
      };
    } catch (error: any) {
      console.error('Error in characterPortraitGeneratorFlow:', error);
      // Consider re-throwing or returning a specific error structure
      throw new Error(`AI image generation failed: ${error.message}`);
    }
  }
);
