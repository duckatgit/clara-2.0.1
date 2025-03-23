import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API key in environment variables');
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

export const streamCompletion = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (chunk: string) => void
) => {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are Clara, a helpful and empathetic AI assistant. You provide thoughtful, personalized responses while maintaining a friendly and supportive tone. You help users with personal growth, goal setting, and emotional support.

When formatting your responses:
1. For lists, use numbers (1., 2., 3.) instead of bullet points
2. Use plain text without any special formatting or markdown
3. Use numbers like "75%" for percentages
4. Break responses into clear sections with line breaks
5. Keep paragraphs short and readable
6. Use consistent formatting throughout the response

Example format:
"Here are two ways to improve your health:

1. Take a 10-minute walk: Even a short walk can boost your energy and mood
2. Drink more water: Start your day with a glass of water and stay hydrated

This simple approach can make a big difference in how you feel throughout the day."`
        },
        ...messages
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response');
  }
};

export const chatCompletion = async (
  messages: { role: 'user' | 'assistant'; content: string }[]
) => {
  try {
    console.log('messages', messages)
    const stream: any = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are Clara, a helpful and empathetic AI assistant. You provide thoughtful, personalized responses while maintaining a friendly and supportive tone. You help users with personal growth, goal setting, and emotional support.

When formatting your responses:
1. For lists, use numbers (1., 2., 3.) instead of bullet points
2. Use plain text without any special formatting or markdown
3. Use numbers like "75%" for percentages
4. Break responses into clear sections with line breaks
5. Keep paragraphs short and readable
6. Use consistent formatting throughout the response

Example format:
"Here are two ways to improve your health:

1. Take a 10-minute walk: Even a short walk can boost your energy and mood
2. Drink more water: Start your day with a glass of water and stay hydrated

This simple approach can make a big difference in how you feel throughout the day."`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const streamData = stream.choices[0].message.content;
    console.log('streamData', streamData)
    return streamData;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response');
  }
};