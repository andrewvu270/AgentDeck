import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAgentModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: 'openai',
    model: 'gpt-4o',
    system_prompt: '',
    role_type: '',
    role_avatar_color: '#667eea',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        role_type: formData.role_type || undefined,
        role_avatar_color: formData.role_type ? formData.role_avatar_color : undefined,
      };
      await api.post('/agents', payload);
      toast.success('Agent created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Create Agent</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Role Type <span className="text-text-secondary text-xs">(optional)</span>
            </label>
            <select
              value={formData.role_type}
              onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="">Generic Agent (No Role)</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="cx">Customer Experience (CX)</option>
              <option value="data">Data</option>
              <option value="strategy">Strategy</option>
              <option value="operations">Operations</option>
              <option value="product">Product</option>
              <option value="cto">CTO</option>
            </select>
          </div>

          {formData.role_type && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Avatar Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.role_avatar_color}
                  onChange={(e) => setFormData({ ...formData, role_avatar_color: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.role_avatar_color}
                  onChange={(e) => setFormData({ ...formData, role_avatar_color: e.target.value })}
                  className="flex-1 px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary font-mono"
                  placeholder="#667eea"
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Model</label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">System Prompt</label>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              className="w-full px-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary font-mono text-sm"
              rows={6}
              placeholder="You are a helpful assistant..."
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-bg-tertiary text-text-secondary rounded-lg hover:bg-bg-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
