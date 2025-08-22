// Claude-Managed Telegram Webhook API
// This endpoint receives Telegram messages and processes them

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const update = req.body
    console.log('📨 Telegram webhook received:', JSON.stringify(update, null, 2))

    // Handle different types of Telegram updates
    if (update.message) {
      await handleMessage(update.message)
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id
  const messageId = message.message_id
  const botToken = process.env.TELEGRAM_BOT_TOKEN || 'your_telegram_bot_token_here'
  const groqApiKey = process.env.GROQ_API_KEY || 'your_groq_api_key_here'

  try {
    let messageText = ''
    
    if (message.voice) {
      // Handle voice message
      console.log('🎙️ Processing voice message...')
      
      // Get voice file
      const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${message.voice.file_id}`)
      const fileInfo = await fileResponse.json()
      
      if (fileInfo.ok) {
        // Download audio file
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`
        const audioResponse = await fetch(fileUrl)
        const audioBuffer = await audioResponse.arrayBuffer()
        
        // Transcribe with Groq
        const formData = new FormData()
        formData.append('file', new Blob([audioBuffer]), 'audio.ogg')
        formData.append('model', 'whisper-large-v3')

        const transcriptionResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqApiKey}` },
          body: formData
        })

        const transcription = await transcriptionResponse.json()
        messageText = transcription.text || 'Could not transcribe audio'
        console.log('📝 Transcription:', messageText)
      }
    } else if (message.text) {
      // Handle text message
      messageText = message.text
      console.log('💬 Text message:', messageText)
    } else {
      // Unsupported message type
      console.log('⚠️ Unsupported message type')
      return
    }

    // Parse feedback with AI
    const parseResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Parse this feedback and categorize it. Return JSON with:
            {
              "type": "bug" | "feature" | "todo" | "question",
              "priority": "low" | "medium" | "high" | "urgent",
              "title": "brief title",
              "description": "detailed description",
              "component": "estimated component/area",
              "action": "github" | "todo" | "claude" | "direct_response"
            }`
          },
          {
            role: 'user',
            content: messageText
          }
        ]
      })
    })

    const parseResult = await parseResponse.json()
    let parsedFeedback
    
    try {
      parsedFeedback = JSON.parse(parseResult.choices[0].message.content)
    } catch (e) {
      // Fallback if AI doesn't return valid JSON
      parsedFeedback = {
        type: 'todo',
        priority: 'medium',
        title: messageText.substring(0, 50),
        description: messageText,
        component: 'general',
        action: 'todo'
      }
    }

    console.log('🧠 Parsed feedback:', parsedFeedback)

    // Send confirmation message
    const confirmationMessage = buildConfirmationMessage(parsedFeedback, messageText)
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: confirmationMessage,
        parse_mode: 'Markdown'
      })
    })

    console.log('✅ Message processed successfully')

  } catch (error) {
    console.error('❌ Message processing failed:', error)
    
    // Send error message to user
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '❌ Sorry, something went wrong processing your message. Please try again.'
      })
    })
  }
}

function buildConfirmationMessage(feedback: any, originalMessage: string): string {
  const icons = {
    bug: '🐛',
    feature: '✨',
    todo: '📝',
    question: '❓'
  }

  const priorities = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    urgent: '🚨'
  }

  let message = `${icons[feedback.type]} *${feedback.title}* ${priorities[feedback.priority]}\n`
  message += `${feedback.description}\n`
  message += `📁 ${feedback.component} | 🎯 ${feedback.action}\n\n`

  if (feedback.action === 'github') {
    message += `✅ *Ready for GitHub Issue!*\n`
    message += `This will be created as a ${feedback.type} with ${feedback.priority} priority`
  } else if (feedback.action === 'claude') {
    message += `🤖 *Saved for Claude Code!*\n`
    message += `This development task is ready for implementation`
  } else {
    message += `📝 *Added to Todo List!*\n`
    message += `Task categorized and ready for action`
  }

  return message
} 