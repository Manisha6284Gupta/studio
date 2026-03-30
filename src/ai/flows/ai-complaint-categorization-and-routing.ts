'use server';
/**
 * @fileOverview A Genkit flow for analyzing citizen complaints to automatically categorize them,
 * suggest tags, recommend departments, and propose initial priority, severity, and deadline.
 *
 * - categorizeComplaint - A function that handles the complaint categorization and routing process.
 * - ComplaintCategorizationAndRoutingInput - The input type for the categorizeComplaint function.
 * - ComplaintCategorizationAndRoutingOutput - The return type for the categorizeComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ComplaintCategorizationAndRoutingInputSchema = z.object({
  title: z.string().describe('The title or subject of the complaint.'),
  description: z.string().describe('A detailed description of the complaint.'),
  currentDate: z.string().datetime().describe('The current date and time in ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ"), used to calculate deadlines.'),
  photoDataUri: z.string().describe("A photo of the complaint, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.").optional(),
});
export type ComplaintCategorizationAndRoutingInput = z.infer<typeof ComplaintCategorizationAndRoutingInputSchema>;

const ComplaintCategorizationAndRoutingOutputSchema = z.object({
  category: z.enum(["Infrastructure", "Utility", "Health", "Environment", "Water Department", "Road Department", "Electricity", "Other"]).describe('The category of the complaint.'),
  tags: z.array(z.string()).describe('A list of relevant keywords or tags for the complaint.'),
  recommendedDepartmentNames: z.array(z.string()).describe('A list of recommended departments or agencies that should handle this complaint.'),
  priority: z.enum(["Low", "Medium", "High"]).describe('The urgency of the complaint, indicating how quickly it needs attention.'),
  severity: z.enum(["Critical", "High", "Medium", "Low"]).describe('The impact or seriousness of the problem described in the complaint.'),
  deadline: z.string().datetime().describe('The suggested deadline for resolving the complaint, in ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ"). Calculated based on the severity and category.'),
});
export type ComplaintCategorizationAndRoutingOutput = z.infer<typeof ComplaintCategorizationAndRoutingOutputSchema>;

export async function categorizeComplaint(input: Omit<ComplaintCategorizationAndRoutingInput, 'currentDate'>): Promise<ComplaintCategorizationAndRoutingOutput> {
  const now = new Date();
  const inputWithDate = { ...input, currentDate: now.toISOString() };
  return complaintCategorizationAndRoutingFlow(inputWithDate);
}

const prompt = ai.definePrompt({
  name: 'categorizeComplaintPrompt',
  input: { schema: ComplaintCategorizationAndRoutingInputSchema },
  output: { schema: ComplaintCategorizationAndRoutingOutputSchema },
  prompt: `You are an expert civic complaint analyst system. Your task is to analyze a citizen's complaint and provide a structured categorization and routing recommendation.
Consider the current date: {{{currentDate}}} when calculating the deadline. Use this date as a reference to calculate the deadline in the future.
{{#if photoDataUri}}
You have also been provided with an image of the complaint. Use the visual information from this image in combination with the text to make a more accurate assessment. The image is crucial for determining the severity of the issue (e.g., the size of a pothole, the extent of illegal dumping).
Photo: {{media url=photoDataUri}}
{{/if}}

Based on the provided title, description, and image (if available), perform the following:
1.  **Categorize** the complaint into one of the following types: Infrastructure, Utility, Health, Environment, Water Department, Road Department, Electricity, Other.
2.  Suggest a list of **tags** (keywords) that accurately describe the complaint. These should be concise and relevant.
3.  Recommend the **department(s)** or agencies best suited to handle this complaint. Your recommendation for the \`recommendedDepartmentNames\` field MUST be an array containing one or more strings from the following exact list: ["Public Works", "Utilities", "Health", "Environment", "Water Department", "Road Department", "Electricity"]. Do NOT append " Department" to names unless it is already present in the list.
4.  Determine the **priority** (Low, Medium, High) of the complaint.
5.  Assess the **severity** (Critical, High, Medium, Low) of the problem.
6.  Propose a **deadline** for resolution in ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ"). The deadline should be calculated based on the priority, severity, and the current date. For example, Critical/High severity complaints might have deadlines within 24-72 hours, Medium within 3-7 days, and Low within 1-2 weeks. Ensure the deadline is a future date.

Complaint Title: {{{title}}}
Complaint Description: {{{description}}}`,
});

const complaintCategorizationAndRoutingFlow = ai.defineFlow(
  {
    name: 'complaintCategorizationAndRoutingFlow',
    inputSchema: ComplaintCategorizationAndRoutingInputSchema,
    outputSchema: ComplaintCategorizationAndRoutingOutputSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const output = response.output;
    if (!output) {
      console.error("Categorization flow failed to produce structured output. Raw text:", response.text);
      throw new Error("AI failed to generate a valid categorization structure.");
    }
    return output;
  }
);
