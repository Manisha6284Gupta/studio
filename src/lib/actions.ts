"use server";

import { categorizeComplaint } from "@/ai/flows/ai-complaint-categorization-and-routing";
import { translateTextToEnglish } from "@/ai/flows/translate-text-flow";
import type { ComplaintCategorizationAndRoutingInput, TranslateTextInput } from "@/lib/ai-types";

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
