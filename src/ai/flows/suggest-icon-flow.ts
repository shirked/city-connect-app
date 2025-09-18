'use server';

/**
 * @fileOverview Suggests an icon for a reported issue.
 *
 * - suggestIcon - A function that suggests an icon based on the issue description.
 * - SuggestIconInput - The input type for the suggestIcon function.
 * - SuggestIconOutput - The return type for the suggestIcon function.
 */

import {z} from 'genkit';

const availableIcons = [
    "Car", "SprayCan", "LightbulbOff", "Trash2", "Wrench", "TrafficCone", "Waves", "Trees", "Bug", "HelpCircle"
] as const;

const SuggestIconInputSchema = z.object({
  description: z.string().describe('The description of the reported issue.'),
});
export type SuggestIconInput = z.infer<typeof SuggestIconInputSchema>;

const SuggestIconOutputSchema = z.object({
  iconName: z.enum(availableIcons).describe('The suggested icon name from the available list.'),
});
export type SuggestIconOutput = z.infer<typeof SuggestIconOutputSchema>;

// This function now uses local logic instead of an AI call.
export async function suggestIcon(input: SuggestIconInput): Promise<SuggestIconOutput> {
  const description = input.description.toLowerCase();
  
  const iconMap: { [key: string]: (typeof availableIcons)[number] } = {
    'pothole': 'Car',
    'traffic': 'Car',
    'road': 'Car',
    'graffiti': 'SprayCan',
    'streetlight': 'LightbulbOff',
    'power': 'LightbulbOff',
    'litter': 'Trash2',
    'trash': 'Trash2',
    'dumping': 'Trash2',
    'broken': 'Wrench',
    'bench': 'Wrench',
    'sign': 'Wrench',
    'hazard': 'TrafficCone',
    'blockage': 'TrafficCone',
    'flood': 'Waves',
    'water': 'Waves',
    'leak': 'Waves',
    'tree': 'Trees',
    'overgrown': 'Trees',
    'pest': 'Bug',
    'insect': 'Bug',
  };

  for (const keyword in iconMap) {
    if (description.includes(keyword)) {
      return { iconName: iconMap[keyword] };
    }
  }

  return { iconName: 'HelpCircle' }; // Default icon
}
