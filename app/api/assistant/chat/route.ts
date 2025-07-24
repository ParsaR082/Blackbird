export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/server-utils'
import { connectToDatabase } from '@/lib/mongodb'
import { 
  AssistantUsage, 
  AssistantAccess,
  getTodayString,
  isUserLocked
} from '@/lib/models/assistant-usage'
import { 
  callStudyPlanAdvanced,
  callStudySuggestions,
  callFeedbackSend,
  StudyPlanAdvPayload,
  StudySuggestionsPayload,
  FeedbackSendPayload
} from '@/lib/n8n-service'

// Content filtering function
function isContentAppropriate(message: string): { appropriate: boolean; reason?: string } {
  const inappropriatePatterns = [
    // Political content
    /\b(politics|political|election|vote|democrat|republican|liberal|conservative|government policy|political party)\b/i,
    // Explicit content
    /\b(sex|sexual|porn|explicit|nude|naked|intimate|erotic)\b/i,
    // Harmful content
    /\b(suicide|self-harm|violence|weapon|bomb|kill|murder|hate|racist|discrimination)\b/i,
    // Inappropriate requests
    /\b(hack|illegal|drugs|cheat|plagiarism|academic dishonesty)\b/i
  ]

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(message)) {
      return { 
        appropriate: false, 
        reason: 'This request contains content that is not related to academic assistance or violates our guidelines.' 
      }
    }
  }

  return { appropriate: true }
}

// Parse n8n action from LLM response
function parseActionFromMessage(message: string): { 
  isAction: boolean; 
  action?: string; 
  payload?: any;
} {
  try {
    // Try to extract JSON from the message using regex
    const match = message.match(/\{.*"action".*\}/s);
    if (!match) return { isAction: false };
    
    // Parse the JSON
    const data = JSON.parse(match[0]);
    
    // Check if it's a valid action
    if (data.action && data.payload) {
      return {
        isAction: true,
        action: data.action,
        payload: data.payload
      };
    }
    
    return { isAction: false };
  } catch (error) {
    console.log('Failed to parse action:', error);
    return { isAction: false };
  }
}

// Generate AI response using OpenRouter API with DeepSeek R1
async function generateAIResponse(message: string, actionType?: string): Promise<{ response: string; tokensUsed: number }> {
  const API_KEY = process.env.GEMINI_API_KEY
  
  // Debug logging
  console.log('API_KEY check:', API_KEY ? `Found (${API_KEY.substring(0, 10)}...)` : 'Not found')
  console.log('Using DeepSeek R1 model via OpenRouter')
  
  try {
    if (!API_KEY) {
      throw new Error('API_KEY not configured')
    }

    let systemPrompt = `You are Blackbird Assistant, an AI academic companion for university students. You provide helpful, educational support while maintaining a professional, friendly tone. Always stay focused on academic topics and refuse non-educational requests politely.

If a DB/calendar/teacher-inbox action is needed, respond ONLY with:

{ "action": "<one_of: study_plan_adv | study_suggestions_simple | feedback_send>", "payload": { ... } }

Otherwise, answer normally.`

    if (actionType === 'daily-routine' || actionType === 'study-schedule-planning') {
      systemPrompt += ` The user wants help creating a daily study routine. Ask for their courses, study preferences, available time, challenging subjects, and deadlines. Provide personalized study schedules.`
    } else if (actionType === 'study-suggestions' || actionType === 'course-recommendation') {
      systemPrompt += ` The user wants study suggestions and course recommendations. Ask about their major, completed courses, goals, struggles, and planning timeline. Provide academic insights.`
    } else if (actionType === 'feedback-analyzer' || actionType === 'feedback-enhancement') {
      systemPrompt += ` The user wants help refining academic feedback. Help them make their feedback professional, constructive, and well-structured for instructors.`
    } else if (actionType === 'result-predictor' || actionType === 'performance-analysis') {
      systemPrompt += ` The user wants academic performance analysis and predictions. Ask for GPA, grades, attendance, study habits, and upcoming challenges. Provide performance insights.`
    } else if (actionType === 'academic-goal-setting') {
      systemPrompt += ` The user wants help setting academic goals. Guide them through SMART goal setting for their studies.`
    } else if (actionType === 'time-management') {
      systemPrompt += ` The user wants time management help for their studies. Provide strategies for better academic time management.`
    }

    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
    
    const requestBody = {
      model: 'deepseek/deepseek-r1-distill-llama-70b:free',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7
    }

    console.log('Making OpenRouter API request to:', apiUrl)
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Blackbird Assistant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error response:', errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenRouter API response:', JSON.stringify(data, null, 2))
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponse = data.choices[0].message.content
      const tokensUsed = data.usage?.total_tokens || Math.floor(aiResponse.length * 0.75) + Math.floor(message.length * 0.25)
      
      return { response: aiResponse, tokensUsed }
    } else if (data.error) {
      throw new Error(`OpenRouter API error: ${data.error.message}`)
    } else {
      console.error('Unexpected OpenRouter API response structure:', data)
      throw new Error('Invalid response from OpenRouter API')
    }

  } catch (error: any) {
    console.error('OpenRouter API error:', error.message)
    
    // Provide a reasonable fallback response
    let fallbackResponse = `I'm sorry, but I'm having trouble connecting to my knowledge system at the moment. Please try again in a few minutes.`
    
    if (actionType === 'daily-routine' || actionType === 'study-schedule-planning') {
      fallbackResponse = `I'd be happy to help you create a study routine! To get started, please tell me:

1. What courses are you currently taking?
2. When are your free time slots during the week?
3. Do you have any upcoming exams or deadlines?
4. Are there any subjects you find particularly challenging?
5. Do you prefer studying in short bursts or longer sessions?

Once you provide this information, I can help you create a personalized study schedule.`
    } else if (actionType === 'study-suggestions' || actionType === 'course-recommendation') {
      fallbackResponse = `I'd be happy to provide study suggestions and course recommendations! To give you the most relevant advice, could you please tell me:

1. What is your major or field of study?
2. Which courses have you already completed?
3. What are your academic goals?
4. Are there any subjects you struggle with or particularly enjoy?
5. What timeframe are you planning for?

With this information, I can provide personalized recommendations for your academic journey.`
    } else if (actionType === 'feedback-analyzer' || actionType === 'feedback-enhancement') {
      fallbackResponse = `Hello! I'm Blackbird Assistant, your academic feedback specialist.

I'll help you craft professional, constructive feedback for your courses and instructors. Here's how we can work together:

**🔧 Feedback Improvement Process:**
1. **Share your draft** - Tell me about the course/instructor and your main points
2. **Tone analysis** - I'll help ensure your feedback is respectful and professional
3. **Structure enhancement** - We'll organize your thoughts clearly
4. **Impact focus** - Make sure your feedback is actionable and helpful

**📝 Types of feedback I can help with:**
- Course evaluations
- Instructor feedback
- Curriculum suggestions
- Learning experience improvements
- Academic concern communications

**💡 Best practices I'll guide you through:**
- Using constructive language
- Providing specific examples
- Balancing positive and improvement areas
- Maintaining academic professionalism

What feedback would you like to work on today? Just share your initial thoughts and I'll help you refine them!`
    } else if (actionType === 'result-predictor' || actionType === 'performance-analysis') {
      fallbackResponse = `I'd be happy to help analyze your academic performance and provide predictions! To give you meaningful insights, please share:

1. Your current GPA or recent grades
2. Your attendance record
3. Your study habits (hours per week, methods used)
4. Any upcoming assessments or challenges
5. Your target goals or desired outcomes

Once you provide this information, I can help you assess your academic trajectory and suggest strategies for improvement.`
    } else if (actionType === 'academic-goal-setting') {
      fallbackResponse = `I'd be happy to help you set effective academic goals! Let's create SMART goals together:

- **Specific**: What exactly do you want to achieve?
- **Measurable**: How will you track progress?
- **Achievable**: Is it realistic given your circumstances?
- **Relevant**: Does it align with your larger academic plans?
- **Time-bound**: What's your timeline?

What academic areas would you like to focus on? Some examples might be improving your GPA, mastering specific subjects, developing study skills, or preparing for future opportunities.`
    } else if (actionType === 'time-management') {
      fallbackResponse = `I'd be happy to help you improve your time management for academic success! Let's explore some strategies:

1. **Assessment**: How are you currently managing your study time?
2. **Challenges**: What specific time management issues are you facing?
3. **Schedule**: What does your typical week look like?
4. **Priorities**: Which courses or tasks need the most attention?
5. **Learning Style**: Do you prefer studying in long blocks or short sessions?

Once you share this information, I can provide personalized time management strategies tailored to your academic needs.`
    } else {
      fallbackResponse = `Hello! I'm Blackbird Assistant, your dedicated academic companion for university success!

**🎓 How I Can Help You:**

**📚 Study Support:**
- Personalized study routines and schedules
- Learning technique recommendations
- Time management strategies
- Academic goal setting and tracking

**📝 Academic Planning:**
- Course selection guidance
- Semester planning assistance
- Career-aligned academic paths
- Prerequisite and timeline mapping

**📊 Performance Enhancement:**
- Study habit analysis and improvement
- Grade prediction and planning
- Learning efficiency optimization
- Academic challenge preparation

**💬 Communication Skills:**
- Professional feedback writing
- Academic correspondence
- Presentation preparation
- Professional networking guidance

**🔧 Practical Tools:**
- Study schedule templates
- Goal tracking systems
- Priority management frameworks
- Academic resource recommendations

I focus exclusively on educational support and maintain strict academic integrity. I'm here to help you succeed in your studies while developing valuable skills for your future career.

**Quick Actions Available:**
📅 Daily Study Routine Planning
🎯 Study Suggestions & Course Recommendations  
📝 Feedback Analysis & Enhancement
📊 Academic Performance Prediction
⏰ Time Management Strategies
🎯 Academic Goal Setting

What would you like to work on today? Feel free to ask specific questions or choose one of the quick actions above!`
    }

    return { response: fallbackResponse, tokensUsed: Math.floor(fallbackResponse.length * 0.1) }
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, actionType } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Content filtering
    const contentCheck = isContentAppropriate(message)
    if (!contentCheck.appropriate) {
      return NextResponse.json({
        error: 'Content Policy Violation',
        message: `I'm sorry, but I cannot process this request. ${contentCheck.reason} I'm here to help with academic-related questions and maintain a focus on educational support. Please feel free to ask me about your studies, courses, assignments, or any other academic matters!`,
        filtered: true
      }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user has access (admins automatically have access)
    if (user.role !== 'ADMIN') {
      const access = await AssistantAccess.findOne({ userId: user.id })
      if (!access || !access.isApproved) {
        return NextResponse.json({ 
          error: 'Assistant access not approved',
          message: 'Your access to Blackbird Assistant is pending admin approval. Please contact your administrator to request access.',
          hasAccess: false 
        }, { status: 403 })
      }
    }

    // Check current usage and lock status
    const today = getTodayString()
    let usage = await AssistantUsage.findOne({ 
      userId: user.id, 
      date: today 
    })

    if (!usage) {
      usage = new AssistantUsage({
        userId: user.id,
        date: today,
        tokensUsed: 0,
        interactionCount: 0
      })
      await usage.save()
    }

    // Check if user is locked
    if (isUserLocked(usage)) {
      const lockExpires = new Date(usage.lockExpiresAt!)
      const hoursRemaining = Math.ceil((lockExpires.getTime() - Date.now()) / (1000 * 60 * 60))
      
      return NextResponse.json({
        error: 'Daily limit exceeded',
        message: `You've reached your daily token limit of 20,000. Your access will be restored in approximately ${hoursRemaining} hours. Thank you for using Blackbird Assistant responsibly!`,
        isLocked: true,
        lockExpiresAt: usage.lockExpiresAt,
        tokensUsed: usage.tokensUsed
      }, { status: 429 })
    }

    // Generate AI response
    const { response: aiResponse, tokensUsed } = await generateAIResponse(message, actionType)

    // Check if the response is an action command
    const parsedAction = parseActionFromMessage(aiResponse)
    let finalResponse = aiResponse
    let finalTokensUsed = tokensUsed
    let n8nResult: any = null

    // If it's an action, process it with n8n
    if (parsedAction.isAction) {
      console.log('Detected n8n action:', parsedAction.action);
      
      try {
        switch(parsedAction.action) {
          case 'study_plan_adv': {
            n8nResult = await callStudyPlanAdvanced(
              user.id, 
              parsedAction.payload as StudyPlanAdvPayload
            );
            finalResponse = `I've created your study plan! ${n8nResult.summary}`;
            finalTokensUsed += 50; // Token usage for the n8n call
            break;
          }
          
          case 'study_suggestions_simple': {
            n8nResult = await callStudySuggestions(
              user.id, 
              parsedAction.payload as StudySuggestionsPayload
            );
            
            const suggestionsList = n8nResult.suggestions
              .map((s: any) => `- **${s.course}**: ${s.reason}`)
              .join('\n');
              
            finalResponse = `Here are my course suggestions based on your profile:\n\n${suggestionsList}\n\n${n8nResult.note || ''}`;
            finalTokensUsed += 50;
            break;
          }
          
          case 'feedback_send': {
            n8nResult = await callFeedbackSend(
              user.id, 
              parsedAction.payload as FeedbackSendPayload
            );
            
            finalResponse = "I've processed and delivered your feedback to the instructor. It has been enhanced for clarity and professionalism while preserving your original points and sentiment. The instructor will receive this in their feedback inbox.";
            finalTokensUsed += 50;
            break;
          }
          
          default:
            console.log('Unknown action type:', parsedAction.action);
            // Keep the original response if action type is unknown
        }
      } catch (error) {
        console.error('Error processing n8n action:', error);
        
        // Log the error to the error tracking system
        try {
          fetch('/api/logging/error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'n8n-integration',
              error: error instanceof Error ? error.message : 'Unknown error',
              context: { action: parsedAction.action, userId: user.id }
            })
          }).catch(logError => console.error('Error logging failed:', logError));
        } catch (logError) {
          console.error('Failed to log error:', logError);
        }
        
        // Provide specific fallback messages for different actions
        if (parsedAction.action === 'study_plan_adv') {
          finalResponse = "I apologize, but I couldn't create your study plan at the moment. Our scheduling service is temporarily unavailable. Please try again later, or I can help you manually plan your study schedule now.";
        } else if (parsedAction.action === 'study_suggestions_simple') {
          finalResponse = "I'm sorry, but I couldn't retrieve personalized course suggestions at the moment. Our recommendation service is temporarily unavailable. However, I can still discuss your academic goals and interests to provide general advice.";
        } else if (parsedAction.action === 'feedback_send') {
          finalResponse = "I apologize, but I couldn't process your feedback at this time. Our feedback system is temporarily unavailable. You can try again later, or submit your feedback directly through the university portal.";
        } else {
          finalResponse = "I apologize, but I encountered an issue while processing your request. Please try again later or contact support if the problem persists.";
        }
      }
    }

    // Update usage
    usage.tokensUsed += finalTokensUsed;
    usage.interactionCount += 1;
    usage.lastInteraction = new Date();

    // Check if limit exceeded after this interaction
    if (usage.tokensUsed >= 20000) {
      usage.isLocked = true;
      usage.lockExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    await usage.save();

    return NextResponse.json({
      response: finalResponse,
      tokensUsed: usage.tokensUsed,
      remainingTokens: Math.max(0, 20000 - usage.tokensUsed),
      interactionCount: usage.interactionCount,
      isLocked: usage.isLocked,
      lockExpiresAt: usage.lockExpiresAt,
      n8nResult: n8nResult // Include the n8n result for debugging or UI purposes
    });

  } catch (error) {
    console.error('Assistant chat error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'I apologize, but I encountered an error processing your request. Please try again in a moment.'
    }, { status: 500 })
  }
} 