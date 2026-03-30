import { z } from 'zod';

// From ai-complaint-categorization-and-routing.ts
export const ComplaintCategorizationAndRoutingInputSchema = z.object({
  title: z.string().describe('The title or subject of the complaint.'),
  description: z.string().describe('A detailed description of the complaint.'),
  currentDate: z.string().datetime().describe('The current date and time in ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ"), used to calculate deadlines.'),
  photoDataUri: z.string().describe("A photo of the complaint, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.").optional(),
});
export type ComplaintCategorizationAndRoutingInput = z.infer<typeof ComplaintCategorizationAndRoutingInputSchema>;

export const ComplaintCategorizationAndRoutingOutputSchema = z.object({
  category: z.enum(["Infrastructure", "Utility", "Health", "Environment", "Water Department", "Road Department", "Electricity", "Other"]).describe('The category of the complaint.'),
  tags: z.array(z.string()).describe('A list of relevant keywords or tags for the complaint.'),
  recommendedDepartmentNames: z.array(z.string()).describe('A list of recommended departments or agencies that should handle this complaint.'),
  priority: z.enum(["Low", "Medium", "High"]).describe('The urgency of the complaint, indicating how quickly it needs attention.'),
  severity: z.enum(["Critical", "High", "Medium", "Low"]).describe('The impact or seriousness of the problem described in the complaint.'),
  deadline: z.string().datetime().describe('The suggested deadline for resolving the complaint, in ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ"). Calculated based on the severity and category.'),
});
export type ComplaintCategorizationAndRoutingOutput = z.infer<typeof ComplaintCategorizationAndRoutingOutputSchema>;


// From translate-text-flow.ts
export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated English text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;
