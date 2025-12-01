import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Execution {
  id: string;
  agent_id: string;
  input: string;
  output: string;
  status: string;
  tokens_used: number;
  cost_usd: number;
  latency_ms: number;
  created_at: string;
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  
  useEffect(() => {
    loadExecutions();
  }, []);
  
  const loadExecutions = async () => {
    try {
      const { data } = await api.get('/executions');
      setExecutions(data);
    } catch (error) {
      toast.error('Failed to load executions');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="text-text-secondary">Loading...</div>;
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Executions</h1>
        <p className="text-text-secondary mt-1">View your agent execution history</p>
      </div>
      
      {executions.length === 0 ? (
        <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
          <p className="text-text-secondary">No executions yet</p>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Input</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Tokens</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Cost</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {executions.map((execution) => (
                <tr
                  key={execution.id}
                  onClick={() => setSelectedExecution(execution)}
                  className="hover:bg-bg-tertiary cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-text-primary">
                    <div className="max-w-md truncate">{execution.input}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      execution.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : execution.status === 'failed'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-primary">{execution.tokens_used || 0}</td>
                  <td className="px-6 py-4 text-text-primary">${execution.cost_usd ? Number(execution.cost_usd).toFixed(6) : '0.000000'}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">
                    {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedExecution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedExecution(null)}>
          <div className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-text-primary mb-4">Execution Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Input</label>
                <div className="px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary">{selectedExecution.input}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Output</label>
                <div className="px-4 py-3 bg-bg-tertiary rounded-lg text-text-primary whitespace-pre-wrap">{selectedExecution.output}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="px-4 py-3 bg-bg-tertiary rounded-lg">
                  <div className="text-text-secondary text-sm">Tokens</div>
                  <div className="text-text-primary font-medium">{selectedExecution.tokens_used}</div>
                </div>
                <div className="px-4 py-3 bg-bg-tertiary rounded-lg">
                  <div className="text-text-secondary text-sm">Cost</div>
                  <div className="text-text-primary font-medium">${selectedExecution.cost_usd ? Number(selectedExecution.cost_usd).toFixed(6) : '0.000000'}</div>
                </div>
                <div className="px-4 py-3 bg-bg-tertiary rounded-lg">
                  <div className="text-text-secondary text-sm">Latency</div>
                  <div className="text-text-primary font-medium">{selectedExecution.latency_ms}ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
