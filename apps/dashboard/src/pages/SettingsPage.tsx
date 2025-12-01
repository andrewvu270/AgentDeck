import { useState, useEffect } from 'react';
import { Key, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface APIKey {
  id: string;
  provider: string;
  name: string;
  created_at: string;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [formData, setFormData] = useState({
    provider: 'openai',
    apiKey: '',
    name: 'default',
  });
  
  useEffect(() => {
    loadApiKeys();
  }, []);
  
  const loadApiKeys = async () => {
    try {
      const { data } = await api.get('/keys');
      setApiKeys(data);
    } catch (error) {
      toast.error('Failed to load API keys');
    }
  };
  
  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post('/keys', formData);
      toast.success('API key added successfully');
      setShowAddKey(false);
      setFormData({ provider: 'openai', apiKey: '', name: 'default' });
      loadApiKeys();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to add API key');
    }
  };
  
  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      await api.delete(`/keys/${id}`);
      toast.success('API key deleted');
      loadApiKeys();
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your API keys and preferences</p>
      </div>
      
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">API Keys</h2>
            <p className="text-text-secondary text-sm mt-1">Add your LLM provider API keys</p>
          </div>
          <button
            onClick={() => setShowAddKey(!showAddKey)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
          >
            <Plus size={20} />
            Add Key
          </button>
        </div>
        
        {showAddKey && (
          <form onSubmit={handleAddKey} className="mb-6 p-4 bg-bg-tertiary rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary"
                placeholder="sk-..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddKey(false)}
                className="px-4 py-2 bg-bg-secondary text-text-secondary rounded-lg hover:bg-bg-primary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
              >
                Add Key
              </button>
            </div>
          </form>
        )}
        
        <div className="space-y-3">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Key size={48} className="mx-auto mb-4 opacity-50" />
              <p>No API keys added yet</p>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Key size={20} className="text-text-secondary" />
                  <div>
                    <div className="text-text-primary font-medium">{key.provider}</div>
                    <div className="text-text-secondary text-sm">{key.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
