import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || "";
    const { cgpa, income, statement, fieldOfStudy, industry } = body;

    if (
      typeof cgpa !== "number" ||
      typeof income !== "number" ||
      typeof statement !== "string" ||
      typeof fieldOfStudy !== "string" ||
      typeof industry !== "string"
    ) {
      return NextResponse.json({ error: "Invalid input types" }, { status: 400 });
    }

    try {
        const parsedGPA = Math.round((cgpa / 4.0) * 100);
        const parsedIncome = income;

        // Initialize the Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
    
        // Use the correct model version
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Call Gemini to score the personal statement
        const statementResult = await model.generateContent([
        `Rate the following scholarship personal statement that the user provides on a scale of 1 to 100. The statement should reflect on why the user deserves the scholarship. As a screener, your job is to evaluate and give a scoring. Only return the number.\n\n"${statement}"`
        ]);

        const statementScoreRaw = statementResult.response.text();
        const statementScore = parseFloat(statementScoreRaw.match(/\d+(\.\d+)?/)?.[0] || "0");

        const fieldRelevanceScore = await model.generateContent([
            `Rate the relevance of the user's field of study "${fieldOfStudy}" to the industry "${industry}" on a scale of 1 to 100. Only return the number.`
        ]);

        const fieldRelevanceScoreRaw = fieldRelevanceScore.response.text();
        const fieldRelevanceScoreParsed = parseFloat(fieldRelevanceScoreRaw.match(/\d+(\.\d+)?/)?.[0] || "0");

        const payload = {
            "gpa": parsedGPA,
            "householdIncome": parsedIncome,
            "fieldRelevance": fieldRelevanceScoreParsed,
            "statementScore": statementScore,
        }
        return NextResponse.json({status: "200", message: "Success", data: { payload }}, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}