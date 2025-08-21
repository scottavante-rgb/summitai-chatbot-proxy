export default async function handler(req, res) {
  // CORS headers - allow your Squarespace site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI assistant for Summit AI Cloud. You help with cloud infrastructure, AI solutions, and enterprise technology questions. Be professional, helpful, and concise.' 
          },
          { role: 'user', content: message }
        ],
        temperature: 0.6,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    res.status(200).json({
      response: data.choices[0].message.content,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an issue. Please try again in a moment.' 
    });
  }
}
