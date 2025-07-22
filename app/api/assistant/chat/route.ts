import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/server-utils'
import { connectToDatabase } from '@/lib/mongodb'
import { 
  AssistantUsage, 
  AssistantAccess,
  getTodayString,
  isUserLocked
} from '@/lib/models/assistant-usage'

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

    let systemPrompt = `You are Blackbird Assistant, an AI academic companion for university students. You provide helpful, educational support while maintaining a professional, friendly tone. Always stay focused on academic topics and refuse non-educational requests politely.`

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

  } catch (error) {
    console.error('OpenRouter API Error:', error)
    
    // Enhanced fallback responses based on action type
    let fallbackResponse = ''

    if (actionType === 'daily-routine' || actionType === 'study-schedule-planning') {
      fallbackResponse = `Hello! I'm Blackbird Assistant, and I'd be happy to help you create a personalized daily study routine.

To create an effective study plan, I'll need some information from you:

**📚 Course Information:**
- List your current courses
- Identify your most challenging subjects
- Note any upcoming exams or deadlines

**⏰ Time Preferences:**
- When do you feel most productive? (morning, afternoon, evening)
- How many hours can you dedicate to studying daily?
- What's your current class schedule?

**🎯 Study Goals:**
- What are your target grades?
- Are there specific skills you want to improve?
- Any particular study methods you prefer?

Once you share this information, I can help you create a balanced study routine that maximizes your learning while ensuring adequate rest time!

What would you like to start with?`
    } else if (actionType === 'study-suggestions' || actionType === 'course-recommendation') {
      fallbackResponse = `I'm Blackbird Assistant, ready to provide personalized study suggestions and course recommendations!

**📖 For Better Study Strategies:**
- Tell me about your current major or field of study
- Which subjects are you finding most challenging?
- What's your preferred learning style? (visual, auditory, hands-on)

**🎓 For Course Planning:**
- What courses have you already completed?
- What are your career goals?
- Are you planning for next semester or further ahead?

**📊 Academic Goals:**
- What's your target GPA?
- Any specific skills or knowledge areas you want to focus on?
- Timeline for graduation?

I can help you with:
✅ Optimal course sequencing
✅ Study technique recommendations
✅ Time management strategies
✅ Academic goal setting

What specific area would you like guidance on?`
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
      fallbackResponse = `I'm Blackbird Assistant, ready to help analyze your academic performance and predict future outcomes!

**📊 Performance Analysis Framework:**

**Current Academic Data I'll need:**
- Your current GPA and target GPA
- Individual course grades and trends
- Assignment completion rates
- Quiz/exam performance patterns
- Attendance records

**Study Habits Assessment:**
- Weekly study hours per subject
- Study methods you currently use
- Time management effectiveness
- Learning environment preferences

**External Factors:**
- Work commitments
- Extracurricular activities
- Personal challenges
- Support systems available

**📈 What I'll help you predict:**
- Semester GPA projections
- Course-specific performance forecasts
- Risk assessment for challenging subjects
- Improvement timeline estimates
- Study strategy effectiveness

**🎯 Personalized Recommendations:**
- Study schedule optimizations
- Learning technique adjustments
- Time management improvements
- Resource allocation strategies

Share your current academic situation and I'll provide detailed performance insights and predictions!`
    } else if (actionType === 'academic-goal-setting') {
      fallbackResponse = `Hello! I'm Blackbird Assistant, here to help you set and achieve meaningful academic goals using the SMART framework!

**🎯 SMART Academic Goal Setting:**

**Specific** - Clear, well-defined objectives
**Measurable** - Quantifiable progress indicators  
**Achievable** - Realistic given your resources
**Relevant** - Aligned with your career aspirations
**Time-bound** - Clear deadlines and milestones

**📚 Types of Goals We Can Set:**
- GPA targets (semester/annual)
- Course performance objectives
- Study habit improvements
- Skill development milestones
- Graduate school preparation
- Career readiness benchmarks

**📋 Goal Planning Process:**
1. Assess your current academic standing
2. Define your long-term career vision
3. Break down major goals into smaller steps
4. Create accountability measures
5. Establish reward systems
6. Plan for obstacle management

**💡 Example Goal Areas:**
- "Achieve 3.5 GPA this semester"
- "Master calculus concepts by midterm"
- "Develop research writing skills"
- "Build professional network"
- "Prepare for graduate entrance exams"

What academic goals would you like to work on? Let's start with your biggest priority!`
    } else if (actionType === 'time-management') {
      fallbackResponse = `I'm Blackbird Assistant, your time management specialist for academic success!

**⏰ Academic Time Management Strategies:**

**📅 Planning Techniques:**
- Weekly study schedule creation
- Daily prioritization methods
- Long-term project planning
- Exam preparation timelines
- Assignment deadline management

**🎯 Productivity Methods:**
- Pomodoro Technique for focused study
- Time blocking for different subjects
- Energy management (peak performance hours)
- Distraction elimination strategies
- Break optimization

**📊 Assessment Tools:**
- Time audit (where your hours actually go)
- Study efficiency evaluation
- Procrastination pattern identification
- Energy level tracking
- Goal progress monitoring

**🔧 Practical Solutions:**
- Digital calendar organization
- Study session structuring
- Multitasking vs. deep focus
- Social time integration
- Self-care scheduling

**📈 Advanced Techniques:**
- Batch processing similar tasks
- Transition time optimization
- Deadline buffer management
- Priority matrix application
- Habit stacking for consistency

What time management challenges are you facing? Let's create a personalized system that works for your schedule and learning style!`
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
    const { response, tokensUsed } = await generateAIResponse(message, actionType)

    // Update usage
    usage.tokensUsed += tokensUsed
    usage.interactionCount += 1
    usage.lastInteraction = new Date()

    // Check if limit exceeded after this interaction
    if (usage.tokensUsed >= 20000) {
      usage.isLocked = true
      usage.lockExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

    await usage.save()

    return NextResponse.json({
      response,
      tokensUsed: usage.tokensUsed,
      remainingTokens: Math.max(0, 20000 - usage.tokensUsed),
      interactionCount: usage.interactionCount,
      isLocked: usage.isLocked,
      lockExpiresAt: usage.lockExpiresAt
    })

  } catch (error) {
    console.error('Assistant chat error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'I apologize, but I encountered an error processing your request. Please try again in a moment.'
    }, { status: 500 })
  }
} 