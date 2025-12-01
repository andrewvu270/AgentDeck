import { useState } from 'react';
import { Copy, Check, Code, Zap, Book } from 'lucide-react';

export default function IntegrationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const apiUrl = 'http://localhost:3000/api';
  const token = localStorage.getItem('accessToken') || 'YOUR_ACCESS_TOKEN';

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CodeBlock = ({ code, section }: { code: string; section: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, section)}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition"
      >
        {copiedSection === section ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Integration</h1>
        <p className="text-gray-400">
          Integrate AgentDeck agents into your applications using our REST API
        </p>
      </div>

      {/* Quick Start */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold text-white">Quick Start</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">1. Get Your Access Token</h3>
            <p className="text-sm text-gray-400 mb-2">
              Your access token is stored in localStorage after login. You can find it in your browser's developer tools.
            </p>
            <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 font-mono">
              {token}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">2. Make Your First Request</h3>
            <CodeBlock
              section="quickstart"
              code={`curl -X GET ${apiUrl}/agents \\
  -H "Authorization: Bearer ${token}"`}
            />
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">Authentication</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          All API requests require authentication using a Bearer token in the Authorization header.
        </p>
        <CodeBlock
          section="auth"
          code={`Authorization: Bearer YOUR_ACCESS_TOKEN`}
        />
      </section>

      {/* List Agents */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">List All Agents</h2>
        <p className="text-sm text-gray-400 mb-4">
          Get all agents in your account.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Request</h3>
            <CodeBlock
              section="list-agents"
              code={`GET ${apiUrl}/agents`}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Example (cURL)</h3>
            <CodeBlock
              section="list-agents-curl"
              code={`curl -X GET ${apiUrl}/agents \\
  -H "Authorization: Bearer ${token}"`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Example (JavaScript)</h3>
            <CodeBlock
              section="list-agents-js"
              code={`const response = await fetch('${apiUrl}/agents', {
  headers: {
    'Authorization': 'Bearer ${token}'
  }
});
const agents = await response.json();
console.log(agents);`}
            />
          </div>
        </div>
      </section>

      {/* Execute Agent */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Execute an Agent</h2>
        <p className="text-sm text-gray-400 mb-4">
          Send a message to an agent and get a response.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Request</h3>
            <CodeBlock
              section="execute"
              code={`POST ${apiUrl}/executions`}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Request Body</h3>
            <CodeBlock
              section="execute-body"
              code={`{
  "agentId": "agent-id-here",
  "input": "Your message to the agent"
}`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Example (cURL)</h3>
            <CodeBlock
              section="execute-curl"
              code={`curl -X POST ${apiUrl}/executions \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent-id-here",
    "input": "What is the capital of France?"
  }'`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Example (JavaScript)</h3>
            <CodeBlock
              section="execute-js"
              code={`const response = await fetch('${apiUrl}/executions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${token}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: 'agent-id-here',
    input: 'What is the capital of France?'
  })
});
const result = await response.json();
console.log(result.output); // Agent's response`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Response</h3>
            <CodeBlock
              section="execute-response"
              code={`{
  "id": "exec-123",
  "agentId": "agent-456",
  "input": "What is the capital of France?",
  "output": "The capital of France is Paris.",
  "status": "completed",
  "tokens": 45,
  "cost": 0.00023,
  "createdAt": "2024-01-15T10:30:00Z"
}`}
            />
          </div>
        </div>
      </section>

      {/* Multi-Agent Conversations */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Multi-Agent Conversations</h2>
        <p className="text-sm text-gray-400 mb-4">
          Create conversations where multiple agents discuss and collaborate.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Create Conversation</h3>
            <CodeBlock
              section="create-conv"
              code={`POST ${apiUrl}/workspace/conversations`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Request Body</h3>
            <CodeBlock
              section="create-conv-body"
              code={`{
  "name": "Product Strategy Discussion",
  "mode": "sequential",
  "token_budget": 100000,
  "participating_agents": ["agent-1", "agent-2", "agent-3"]
}`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Collaboration Modes</h3>
            <div className="bg-gray-900 p-4 rounded space-y-2 text-sm">
              <div className="text-gray-300">
                <span className="font-mono text-purple-400">sequential</span> - Agents respond one after another, seeing previous responses
              </div>
              <div className="text-gray-300">
                <span className="font-mono text-purple-400">parallel</span> - All agents respond simultaneously
              </div>
              <div className="text-gray-300">
                <span className="font-mono text-purple-400">debate</span> - Agents challenge each other's viewpoints
              </div>
              <div className="text-gray-300">
                <span className="font-mono text-purple-400">brainstorm</span> - Agents build on each other's ideas
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Send Message to Conversation</h3>
            <CodeBlock
              section="send-message"
              code={`POST ${apiUrl}/workspace/conversations/:conversationId/messages

{
  "content": "What should our Q1 strategy be?"
}`}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Get Conversation Messages</h3>
            <CodeBlock
              section="get-messages"
              code={`GET ${apiUrl}/workspace/conversations/:conversationId`}
            />
          </div>
        </div>
      </section>

      {/* SDK Examples */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Book className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-semibold text-white">Integration Examples</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Node.js / Express</h3>
            <CodeBlock
              section="nodejs"
              code={`const express = require('express');
const app = express();

app.post('/chat', async (req, res) => {
  const { message, agentId } = req.body;
  
  const response = await fetch('${apiUrl}/executions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${token}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      agentId: agentId,
      input: message
    })
  });
  
  const result = await response.json();
  res.json({ reply: result.output });
});

app.listen(3000);`}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">Python / Flask</h3>
            <CodeBlock
              section="python"
              code={`from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    
    response = requests.post(
        '${apiUrl}/executions',
        headers={
            'Authorization': 'Bearer ${token}',
            'Content-Type': 'application/json'
        },
        json={
            'agentId': data['agentId'],
            'input': data['message']
        }
    )
    
    result = response.json()
    return jsonify({'reply': result['output']})

if __name__ == '__main__':
    app.run(port=3000)`}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-3">React / Next.js</h3>
            <CodeBlock
              section="react"
              code={`import { useState } from 'react';

export default function ChatWidget({ agentId }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    const res = await fetch('${apiUrl}/executions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ${token}',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: agentId,
        input: message
      })
    });
    
    const data = await res.json();
    setResponse(data.output);
  };

  return (
    <div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask the agent..."
      />
      <button onClick={sendMessage}>Send</button>
      {response && <div>{response}</div>}
    </div>
  );
}`}
            />
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Rate Limits</h2>
        <div className="bg-gray-900 p-4 rounded space-y-2 text-sm text-gray-300">
          <div>100 requests per minute per user</div>
          <div>Token usage depends on your LLM provider's limits</div>
          <div>Conversation token budgets can be configured per conversation</div>
        </div>
      </section>

      {/* Error Handling */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Error Handling</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Error Response Format</h3>
            <CodeBlock
              section="error"
              code={`{
  "error": {
    "message": "Agent not found",
    "code": "AGENT_NOT_FOUND",
    "status": 404
  }
}`}
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Common Error Codes</h3>
            <div className="bg-gray-900 p-4 rounded space-y-2 text-sm text-gray-300">
              <div><span className="font-mono text-red-400">401</span> - Unauthorized (invalid or missing token)</div>
              <div><span className="font-mono text-red-400">404</span> - Resource not found</div>
              <div><span className="font-mono text-red-400">429</span> - Rate limit exceeded</div>
              <div><span className="font-mono text-red-400">500</span> - Internal server error</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
