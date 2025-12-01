import { useState } from 'react';
import { X, Play } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Props {
  agent: { id: string; name: string };
  onClose: () => void;
}

export default function ExecuteAgentModal({ agent, onClose }: Props) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [cost, setCost] = useState(0);
  
  const handleExecute = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setOutput('');
    
    try {
      const { data } = await api.post('/executions', {
        agentId: agent.id,
        input: input.trim(),
      });
      
      setOutput(data.output);
      setTokens(data.tokens_used);
      setCost(data.cost_usd);
      toast.success('Execution completed');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Execution failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Execute: {agent.name}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              rows={4}
              placeholder="Enter your message..."
            />
          </div>
          
          <button
            onClick={handleExecute}
            disabled={isLoading || !input.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Play size={20} />
            {isLoading ? 'Executing...' : 'Execute'}
          </button>
          
          {output && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Output</label>
                <div className="px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary whitespace-pre-wrap">
                  {output}
                </div>
              </div>
              
              <div className="flex gap-4 text-sm">
                <div className="px-4 py-2 bg-bg-tertiary rounded-lg">
                  <span className="text-text-secondary">Tokens: </span>
                  <span className="text-text-primary font-medium">{tokens}</span>
                </div>
                <div className="px-4 py-2 bg-bg-tertiary rounded-lg">
                  <span className="text-text-secondary">Cost: </span>
                  <span className="text-text-primary font-medium">${cost.toFixed(6)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
