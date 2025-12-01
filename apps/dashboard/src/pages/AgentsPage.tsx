import { useState, useEffect } from 'react';
import { Plus, Play, Trash2, Edit, Bot } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import CreateAgentModal from '../components/CreateAgentModal';
import ExecuteAgentModal from '../components/ExecuteAgentModal';

interface Agent {
  id: string;
  name: string;
  description?: string;
  model: string;
  provider: string;
  created_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  
  useEffect(() => {
    loadAgents();
  }, []);
  
  const loadAgents = async () => {
    try {
      const { data } = await api.get('/agents');
      setAgents(data);
    } catch (error) {
      toast.error('Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await api.delete(`/agents/${id}`);
      toast.success('Agent deleted');
      loadAgents();
    } catch (error) {
      toast.error('Failed to delete agent');
    }
  };
  
  const handleExecute = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowExecuteModal(true);
  };
  
  if (isLoading) {
    return <div className="text-text-secondary">Loading...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Agents</h1>
          <p className="text-text-secondary mt-1">Manage your AI agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
        >
          <Plus size={20} />
          Create Agent
        </button>
      </div>
      
      {agents.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
          <Bot size={48} className="mx-auto text-text-secondary mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No agents yet</h3>
          <p className="text-text-secondary mb-6">Create your first AI agent to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
          >
            Create Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-bg-secondary border border-border rounded-xl p-6 hover:border-primary transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">{agent.name}</h3>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {agent.description || 'No description'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-bg-tertiary text-text-secondary text-xs rounded-full">
                  {agent.provider}
                </span>
                <span className="px-3 py-1 bg-bg-tertiary text-text-secondary text-xs rounded-full">
                  {agent.model}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecute(agent)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
                >
                  <Play size={16} />
                  Execute
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  className="px-4 py-2 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAgents();
          }}
        />
      )}
      
      {showExecuteModal && selectedAgent && (
        <ExecuteAgentModal
          agent={selectedAgent}
          onClose={() => {
            setShowExecuteModal(false);
            setSelectedAgent(null);
          }}
        />
      )}
    </div>
  );
}
