import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request) {
  console.log('CHECKPOINT 1: Route handler started');
  try {
    // STEP 1: API Key Check
    console.log('CHECKPOINT 2: Checking API key...');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('API Key exists:', !!apiKey);
    if (!apiKey) {
      throw new Error('No API key found');
    }

    // STEP 2: Request Body Parse
    console.log('CHECKPOINT 3: Parsing request body...');
    const body = await request.json();
    console.log('CHECKPOINT 4: Body parsed', { hasMessage: !!body.message });
    
    if (!body.message) {
      throw new Error('No message provided');
    }

    // STEP 3: Anthropic Client Init
    console.log('CHECKPOINT 5: Creating Anthropic client...');
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    console.log('CHECKPOINT 6: Anthropic client created');

    // STEP 4: Message Creation
    console.log('CHECKPOINT 7: Sending message to Claude...');
    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229-v1:0",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: body.message
        }
      ]
    });
    console.log('CHECKPOINT 8: Claude response received');

    // STEP 5: Response Return
    console.log('CHECKPOINT 9: Preparing response');
    return new Response(
      JSON.stringify({
        message: completion.content[0].text
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('ERROR OCCURRED AT LAST CHECKPOINT');
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({
        error: 'Error occurred',
        lastCheckpoint: 'Check console for last successful checkpoint',
        errorDetails: error.message,
        apiError: error.response?.data
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
