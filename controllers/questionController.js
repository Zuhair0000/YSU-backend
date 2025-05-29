const db = require("../db/db"); // your MySQL connection pool
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.askQuestion = async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // Use FULLTEXT search to find the most relevant cached answer
    const [cachedResults] = await db.query(
      `SELECT answer_text FROM knowledge_base 
   WHERE question_keywords LIKE CONCAT('%', ?, '%') 
   LIMIT 1`,
      [question]
    );

    if (cachedResults.length > 0) {
      return res.json({
        answer: cachedResults[0].answer_text,
        source: "cache",
      });
    }

    // If no cached answer, get from OpenAI
    const systemPrompt = `You are a helpful assistant for Yemeni students at UTHM. Answer clearly, kindly, and in detail. Topics include: visa renewal, registration, courses, hostel, immigration.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const answer = completion.choices[0].message.content;

    // Insert question keywords and AI answer into the knowledge_base
    // For question_keywords, you can store the question itself or keywords extracted from it
    await db.query(
      "INSERT INTO knowledge_base (question_keywords, answer_text) VALUES (?, ?)",
      [question, answer]
    );

    res.json({ answer, source: "ai" });
  } catch (error) {
    console.error("Error in askQuestion:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};
