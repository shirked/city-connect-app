'use server';

/**
 * @fileOverview Updates the status of a reported issue based on email updates.
 *
 * - issueStatusUpdate - A function that updates the issue status based on email content.
 * - IssueStatusUpdateInput - The input type for the issueStatusUpdate function.
 * - IssueStatusUpdateOutput - The return type for the issueStatusUpdate function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const IssueStatusUpdateInputSchema = z.object({
  emailSubject: z.string().describe('The subject of the email update.'),
  emailBody: z.string().describe('The body of the email update.'),
  issueDescription: z.string().describe('The description of the reported issue.'),
  currentStatus: z.string().describe('The current status of the issue.'),
  updateHistory: z.string().describe('A history of previous status updates.'),
});
export type IssueStatusUpdateInput = z.infer<typeof IssueStatusUpdateInputSchema>;

const IssueStatusUpdateOutputSchema = z.object({
  updatedStatus: z
    .string()
    .describe(
      'The updated status of the issue, based on the email content.  If no change, should be same as currentStatus.'
    ),
});
export type IssueStatusUpdateOutput = z.infer<typeof IssueStatusUpdateOutputSchema>;

export async function issueStatusUpdate(input: IssueStatusUpdateInput): Promise<IssueStatusUpdateOutput> {
  return issueStatusUpdateFlow(input);
}

const issueStatusUpdatePrompt = ai.definePrompt({
  name: 'issueStatusUpdatePrompt',
  input: {schema: IssueStatusUpdateInputSchema},
  output: {schema: IssueStatusUpdateOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an AI assistant that determines if the status of a reported civic issue should be updated based on an email received by the system.

Here is the current issue information:
Description: {{{issueDescription}}}
Current Status: {{{currentStatus}}}
Update History: {{{updateHistory}}}

Here is the email received:
Subject: {{{emailSubject}}}
Body: {{{emailBody}}}

Based on the email, determine if the issue status should be updated. If the email indicates a change in status, output the new status. If the email does not indicate a change, output the current status. Be as concise as possible.

Possible statuses are: Submitted, In Progress, Resolved.

Always use one of the provided statuses in your output.
`,
});

const issueStatusUpdateFlow = ai.defineFlow(
  {
    name: 'issueStatusUpdateFlow',
    inputSchema: IssueStatusUpdateInputSchema,
    outputSchema: IssueStatusUpdateOutputSchema,
  },
  async input => {
    const {output} = await issueStatusUpdatePrompt(input);
    return output!;
  }
);
