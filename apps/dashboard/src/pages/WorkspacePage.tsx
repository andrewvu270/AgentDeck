import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Agent {
  id: string;
  name: string;
  role_type: string;
  status: string;
  role_avatar_color: string;
}

interface Conversation {
  id: string;
  name?: string;
  mode: string;
  status: string;
  message_count: number;
  total_tokens: number;
  token_budget: number;
  updated_at: string;
}

interface Message {
  id: string;
  sender_type: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export default function WorkspacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:3000/api/workspace/conversations/${selectedConversation}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Loading agents...');
      // Load agents
      const agentsRes = await fetch('http://localhost:3000/api/agents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (agentsRes.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
        return;
      }
      
      if (!agentsRes.ok) {
        const errorText = await agentsRes.text();
        console.error('Agents API error:', agentsRes.status, errorText);
        setAgents([]);
      } else {
        const agentsData = await agentsRes.json();
        console.log('Loaded agents:', agentsData);
        setAgents(Array.isArray(agentsData) ? agentsData : []);
      }

      console.log('Loading conversations...');
      // Load conversations
      const convsRes = await fetch('http://localhost:3000/api/workspace/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!convsRes.ok) {
        console.error('Conversations API error:', convsRes.status, await convsRes.text());
      } else {
        const convsData = await convsRes.json();
        console.log('Loaded conversations:', convsData);
        setConversations(Array.isArray(convsData) ? convsData : []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load workspace:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (roleType: string) => {
    const labels: Record<string, string> = {
      sales: 'Sales',
      marketing: 'Marketing',
      cx: 'CX',
      data: 'Data',
      strategy: 'Strategy',
      operations: 'Operations',
      product: 'Product',
      cto: 'CTO',
    };
    return labels[roleType] || roleType;
  };

  const setupDefaultAgents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const defaultAgents = [
        { role_type: 'sales', name: 'Sales Agent', color: '#10b981' },
        { role_type: 'marketing', name: 'Marketing Agent', color: '#f59e0b' },
        { role_type: 'cx', name: 'CX Agent', color: '#3b82f6' },
        { role_type: 'data', name: 'Data Agent', color: '#8b5cf6' },
        { role_type: 'strategy', name: 'Strategy Agent', color: '#ec4899' },
        { role_type: 'operations', name: 'Operations Agent', color: '#14b8a6' },
        { role_type: 'product', name: 'Product Agent', color: '#f97316' },
        { role_type: 'cto', name: 'CTO Agent', color: '#6366f1' },
      ];

      setLoading(true);
      
      for (const agent of defaultAgents) {
        await fetch('http://localhost:3000/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: agent.name,
            description: `${agent.role_type} specialist agent`,
            provider: 'openai',
            model: 'gpt-4o',
            system_prompt: `You are a ${agent.role_type} specialist.`,
            role_type: agent.role_type,
            role_avatar_color: agent.color,
          }),
        });
      }

      await loadData();
    } catch (error) {
      console.error('Failed to setup agents:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Use all available agents for the conversation
      const agentIds = agents.map(a => a.id);
      
      const response = await fetch('http://localhost:3000/api/workspace/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'New Conversation',
          mode: 'sequential',
          token_budget: 100000,
          participating_agents: agentIds,
        }),
      });

      if (response.ok) {
        const newConv = await response.json();
        setConversations([...conversations, newConv]);
        setSelectedConversation(newConv.id);
      } else {
        const error = await response.json();
        console.error('Failed to create conversation:', error);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://localhost:3000/api/workspace/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
        }),
      });
      setMessage('');
      await loadMessages(); // Reload messages after sending
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar - Agents */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Agents</h2>
          <p className="text-sm text-gray-400">{agents.length} active</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {agents.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="text-gray-400 text-sm mb-2">No agents yet</div>
              <div className="text-gray-500 text-xs mb-4">Create agents to start collaborating</div>
              <button
                onClick={setupDefaultAgents}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm mb-2"
              >
                Quick Setup (8 Team Agents)
              </button>
              <div className="text-gray-500 text-xs mt-2">or</div>
              <button
                onClick={() => navigate('/app/agents')}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm mt-2"
              >
                Create Custom Agent
              </button>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: agent.role_avatar_color || '#667eea' }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{agent.name}</div>
                    <div className="text-xs text-gray-400">
                      {agent.role_type ? getRoleLabel(agent.role_type) : 'Generic'}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => navigate('/app/agents')}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Manage Agents
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold">Workspace</h1>
            <p className="text-sm text-gray-400">Collaborate with your AI team</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={createNewConversation}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm"
            >
              + New Conversation
            </button>
            <div className="text-sm">
              <span className="text-gray-400">Token Usage:</span>
              <span className="ml-2 font-semibold">
                {conversations.reduce((sum, c) => sum + c.total_tokens, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          msg.sender_type === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-800 text-gray-100'
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">{msg.sender_name}</div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className="text-xs opacity-50 mt-2">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">No conversations yet</div>
                <button
                  onClick={createNewConversation}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-4">Select a conversation to start chatting</div>
                <div className="grid gap-3 max-w-md">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-left"
                    >
                      <div className="font-semibold">{conv.name || 'Untitled Conversation'}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="capitalize">{conv.mode} mode</span>
                        <span>{conv.message_count} messages</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
