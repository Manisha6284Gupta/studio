"use server";

import { categorizeComplaint, ComplaintCategorizationAndRoutingInput } from "@/ai/flows/ai-complaint-categorization-and-routing";

export async function runCategorizeComplaint(input: Omit<ComplaintCategorizationAndRoutingInput, 'currentDate'>) {
    try {
        const result = await categorizeComplaint(input);
        return result;
    } catch (error) {
        console.error("Error in categorizeComplaint flow:", error);
        throw new Error("Failed to categorize complaint.");
    }
}
