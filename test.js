require('dotenv').config();
const key = process.env.GROQ_API_KEY;
console.log('Key:', key ? key.substring(0,10)+'...' : 'NOT FOUND');

import('node-fetch').then(({default:fetch}) => {
  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'Say hello in one word' }]
    })
  })
  .then(r => r.json())
  .then(d => console.log('RESULT:', JSON.stringify(d)))
  .catch(e => console.log('ERROR:', e.message));
});