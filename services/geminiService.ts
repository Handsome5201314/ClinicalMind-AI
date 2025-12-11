
import { GoogleGenAI, Chat } from "@google/genai";
import { CaseDetails, AIConfig, MedicalRecord, EvaluationResult, Language, VitalsData, ExamTool, BodyLocation } from "../types";

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private apiKey: string = process.env.API_KEY || '';
  private patientModel: string = 'gemini-2.5-flash';
  private tutorModel: string = 'gemini-2.5-flash';
  private baseUrl?: string;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  updateConfig(config: AIConfig) {
    this.apiKey = config.apiKey || process.env.API_KEY || '';
    this.patientModel = config.patientModel;
    this.tutorModel = config.tutorModel;
    this.baseUrl = config.baseUrl;
    
    this.ai = new GoogleGenAI({ apiKey: this.apiKey }, { baseUrl: this.baseUrl });
  }

  /**
   * Generates a random clinical case based on difficulty.
   */
  async generateCase(difficulty: string, specialty?: string, language: Language = 'en'): Promise<CaseDetails> {
    const langPrompt = language === 'zh' ? 'Respond in Simplified Chinese.' : 'Respond in English.';
    
    const prompt = `
      Generate a detailed realistic clinical case for a medical simulation.
      Difficulty: ${difficulty}.
      Specialty: ${specialty || 'General Internal Medicine'}.
      ${langPrompt}
      
      Return ONLY a JSON object with this structure (no markdown code blocks):
      {
        "title": "Short title",
        "patientInfo": "Age, Gender, Occupation",
        "chiefComplaint": "Brief quote in patient's voice",
        "history": "Detailed HPI, PMH, Meds, Allergies, Social History. Crucial for diagnosis.",
        "physicalExam": "Vitals + Detailed positive and negative findings.",
        "labsAndImaging": "Results of relevant labs/imaging (include values and units).",
        "diagnosis": "Final Diagnosis and differential diagnosis.",
        "difficulty": "${difficulty}",
        "specialty": "${specialty || 'General'}"
      }
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.tutorModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = result.text;
      if (!text) throw new Error("No content generated");
      return JSON.parse(text) as CaseDetails;
    } catch (error) {
      console.error("Error generating case:", error);
      throw error;
    }
  }

  /**
   * Parses raw unstructured text into structured CaseDetails using AI.
   */
  async parseRawCaseData(rawText: string, language: Language = 'en'): Promise<CaseDetails> {
    const langPrompt = language === 'zh' ? 'Respond in Simplified Chinese.' : 'Respond in English.';
    
    const prompt = `
      **Task**: Analyze the provided raw clinical text and extract structured case data.
      **Input Text**:
      "${rawText.substring(0, 15000)}"

      **Instructions**:
      1. Extract all relevant clinical information.
      2. If specific fields (like labs) are missing, infer "None reported" or reasonable defaults based on context.
      3. Format the 'chiefComplaint' as a first-person quote if possible.
      4. Set difficulty based on complexity (Easy/Medium/Hard).
      
      ${langPrompt}

      **Output Format**:
      Return ONLY a JSON object with this strict structure:
      {
        "title": "A short medical title",
        "patientInfo": "e.g. Male, 55 years old",
        "chiefComplaint": "Patient's primary complaint",
        "history": "HPI, PMH, Meds, etc.",
        "physicalExam": "Vitals and findings",
        "labsAndImaging": "Labs, X-Rays, CTs, etc.",
        "diagnosis": "The primary diagnosis",
        "difficulty": "Medium",
        "specialty": "Medical Specialty"
      }
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.tutorModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = result.text;
      if (!text) throw new Error("No content generated");
      const parsed = JSON.parse(text) as CaseDetails;
      
      // Enforce specific types for dropdowns if AI hallucinates
      if (!['Easy', 'Medium', 'Hard'].includes(parsed.difficulty)) {
          parsed.difficulty = 'Medium';
      }
      
      return parsed;
    } catch (error) {
      console.error("Error parsing case:", error);
      throw error;
    }
  }

  /**
   * Starts a simulation session with the given case.
   */
  startSimulation(caseDetails: CaseDetails, language: Language = 'en'): void {
    const langInstruction = language === 'zh' 
      ? 'Language: You MUST interact in Simplified Chinese. The user will ask questions in Chinese.' 
      : 'Language: You MUST interact in English.';

    const systemInstruction = `
      **Role Definition**
      You are the backend engine for a High-Fidelity Clinical Emergency Simulation.
      Your Persona: You are the PATIENT (${caseDetails.patientInfo}).

      **The Hidden Case Data:**
      - CC: ${caseDetails.chiefComplaint}
      - History: ${caseDetails.history}
      - Initial Vitals: See Physical Exam.
      
      **Core Function: Physiological Core**
      You will receive 'SYSTEM INJECTION' blocks containing your current physiological state (HR, BP, Pain, etc.).
      You MUST modulate your speech patterns, urgency, and length of response based on these vitals.
      - If Pain > 8: Speak in short, broken sentences. Groan occasionally.
      - If SpO2 < 90: Gasp for air, say you can't breathe.
      - If Consciousness is Confused: Give unreliable or nonsensical answers.

      **Core Function: Dynamic Visual Engine**
      WHENEVER the patient's condition changes (improves/deteriorates), output a JSON command \`UPDATE_VISUAL\`.
      
      **JSON Protocol**:
      \`\`\`json
      {
        "type": "UPDATE_VISUAL",
        "data": {
          "monitor_text": "Brief clinical description",
          "demographics": {
             "gender": "Male" | "Female",
             "age_group": "Young_Adult" | "Middle_Aged" | "Elderly",
             "build": "Normal" | "Obese" | "Thin"
          },
          "visual_state": {
             "consciousness": "Alert" | "Drowsy" | "Comatose" | "Agitated" | "Confused",
             "facial_expression": "Neutral" | "Pain_Grimace" | "Anxious_WideEyed" | "Slack" | "Dyspneic_Gasp",
             "eye_contact": "Direct" | "Closed" | "Avoidant",
             "skin_color": "Normal" | "Pale" | "Flushed" | "Cyanotic" | "Jaundiced" | "Mottled",
             "skin_moisture": "Dry" | "Diaphoretic" | "Clammy",
             "visible_trauma": "None" | "Bleeding_Head" | "Bruised_Chest",
             "posture": "Supine" | "Tripod" | "Clutching_Chest" | "Curled_Up",
             "equipment": ["Oxygen_Mask", "IV_Line"]
          },
          "urgency": "RED" | "YELLOW" | "GREEN",
          "vitals": {
             "HR": number,
             "BP": "120/80",
             "SpO2": number,
             "RR": number,
             "Temp": number,
             "Pain": number // 0-10
          }
        }
      }
      \`\`\`

      **Interaction Rules**:
      1. **Stay in Character**: Speak naturally.
      2. **Monitor First**: ALWAYS output the JSON block BEFORE your spoken response if there is any change.
      3. **Action Restriction**: If the user asks for tests, say: "Doctor, please use the HIS System."
      
      ${langInstruction}
    `;

    this.chatSession = this.ai.chats.create({
      model: this.patientModel,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
  }

  /**
   * Fetches specific test results.
   */
  async fetchTestResults(caseDetails: CaseDetails, tests: string[], language: Language = 'en'): Promise<string> {
    const langPrompt = language === 'zh' ? 'Output the results in Simplified Chinese.' : 'Output the results in English.';
    
    const prompt = `
      **Task**: You are the Laboratory Information System.
      
      **Case Data**:
      - Physical Findings: ${caseDetails.physicalExam}
      - Labs/Imaging: ${caseDetails.labsAndImaging}
      - Diagnosis: ${caseDetails.diagnosis}

      **User Order**: The doctor ordered: ${tests.join(', ')}.

      **Output**: 
      Provide the objective results for these specific orders based on the Case Data. 
      
      **Format**:
      Return the result in this strict block format:
      > 【HIS REPORT: NEW RESULTS】
      > **Order**: [Test Name]
      > **Result**: [Detailed Findings/Values]
      
      ${langPrompt}
    `;

    const result = await this.ai.models.generateContent({
      model: this.tutorModel,
      contents: prompt
    });

    return result.text || "No results available.";
  }

  /**
   * AMBIGUITY SYSTEM (Module 3.1)
   * Simulates a physical exam where the output depends strictly on the tool's capability.
   * Prevents premature diagnosis revelation.
   */
  async performPhysicalExam(caseDetails: CaseDetails, tool: ExamTool, location: BodyLocation, language: Language = 'en'): Promise<string> {
    const langPrompt = language === 'zh' ? 'Output in Simplified Chinese.' : 'Output in English.';
    
    const prompt = `
      **Task**: Physical Exam Simulation (Ambiguity Mode).
      
      **Context**:
      - Patient Physical Findings: ${caseDetails.physicalExam}
      - Diagnosis (Hidden): ${caseDetails.diagnosis}
      
      **Action**:
      The doctor is using **${tool}** on the **${location}**.

      **Instructions**:
      1. Describe ONLY what can be perceived with this specific tool at this location.
      2. **Stethoscope**: Report sounds (crackles, wheezes, murmurs, bowel sounds). If checking head, report nothing relevant unless bruit.
      3. **Flashlight**: Report surface appearance (pupil reaction, throat redness, skin rashes). Cannot see internal organs.
      4. **Palpation**: Report texture, tenderness, masses, temperature.
      5. **Ambiguity**: Do NOT state the diagnosis. Use descriptive terms (e.g., "Dullness to percussion" instead of "Pneumonia").
      6. **Confidence**: If the tool is wrong for the region (e.g., Stethoscope on leg), report "No significant findings" or "Normal friction sounds".

      **Format**:
      Return a single short paragraph describing the finding.
      
      ${langPrompt}
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.tutorModel,
        contents: prompt
      });
      return result.text || "No findings.";
    } catch (e) {
      return "Exam simulation failed.";
    }
  }

  /**
   * Evaluates the user's performance.
   */
  async evaluateSession(caseDetails: CaseDetails, record: MedicalRecord, chatHistory: string, language: Language = 'en'): Promise<string> {
    const langPrompt = language === 'zh' ? 'Output the feedback and analysis in Simplified Chinese.' : 'Output the feedback in English.';

    const prompt = `
      **Role**: Medical Supervisor (AI Tutor).
      **Task**: Grade the student's performance.

      **Gold Standard Case**:
      - Diagnosis: ${caseDetails.diagnosis}
      - History: ${caseDetails.history}
      - Expected Labs: ${caseDetails.labsAndImaging}

      **Student's Submission (HIS Record)**:
      - History Taken: ${record.history.chiefComplaint} / ${record.history.hpi}
      - Tests Ordered: ${record.orders.join(', ')}
      - Student's Diagnosis: ${record.diagnosis}
      - Management Plan: ${record.plan}

      **Chat Transcript**:
      ${chatHistory.substring(0, 5000)}... (truncated)

      **Evaluation Criteria**:
      1. History (30%): Did they ask key questions?
      2. Orders (30%): Did they order necessary tests?
      3. Diagnosis (40%): Is the diagnosis correct?
      4. Urgency Management (New): Did they treat critical vitals promptly?

      **Output Format**:
      Return a JSON object with this structure:
      {
        "score": number (0-100),
        "breakdown": {
          "history": number (0-30),
          "exams": number (0-30),
          "diagnosis": number (0-40)
        },
        "missed": ["List of missed critical items"],
        "feedback": "Short paragraph analyzing performance.",
        "goldStandard": "Brief summary of the correct diagnosis."
      }
      
      ${langPrompt}
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: this.tutorModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return result.text || "{}";
    } catch (e) {
      console.error("Evaluation failed", e);
      return JSON.stringify({
        score: 0,
        breakdown: { history: 0, exams: 0, diagnosis: 0 },
        missed: ["System Error in Evaluation"],
        feedback: "Failed to generate report.",
        goldStandard: "N/A"
      });
    }
  }

  /**
   * Sends a message with physiological state injection.
   */
  async sendMessage(message: string, vitals?: VitalsData): Promise<string> {
    if (!this.chatSession) throw new Error("Session not started");
    
    let finalMessage = message;
    
    // Physiological Core Injection
    if (vitals) {
       finalMessage = `
[SYSTEM INJECTION: PHYSIOLOGICAL SNAPSHOT]
The patient's current state is:
- HR: ${vitals.HR} bpm
- BP: ${vitals.BP}
- SpO2: ${vitals.SpO2}%
- RR: ${vitals.RR} rpm
- Temp: ${vitals.Temp} C
- Pain Level: ${vitals.Pain}/10

INSTRUCTION: 
Adjust your response style based on these metrics.
1. If Pain > 7: Speech should be strained, short, or groaning.
2. If SpO2 < 90 or RR > 25: Speech should be breathless, gasping.
3. If BP < 90/60 (Shock): Confused, sleepy, or slow response.

[USER MESSAGE]
${message}`;
    }

    try {
      const result = await this.chatSession.sendMessage({
        message: finalMessage
      });
      return result.text || "";
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
