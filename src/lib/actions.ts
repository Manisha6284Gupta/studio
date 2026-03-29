"use server";

import { categorizeComplaint, ComplaintCategorizationAndRoutingInput } from "@/ai/flows/ai-complaint-categorization-and-routing";
import { translateTextToEnglish, TranslateTextInput } from "@/ai/flows/translate-text-flow";

export async function runCategorizeComplaint(input: Omit<ComplaintCategorizationAndRoutingInput, 'currentDate'>) {
    try {
        const result = await categorizeComplaint(input);
        return result;
    } catch (error) {
        console.error("Error in categorizeComplaint flow:", error);
        throw error;
    }
}

export async function runTranslateText(input: TranslateTextInput) {
    try {
        const result = await translateTextToEnglish(input);
        return result;
    } catch (error) {
        console.error("Error in translateText flow:", error);
        throw error;
    }
}
