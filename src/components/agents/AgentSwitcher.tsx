"use client";

import { useState } from 'react';
import { RefreshCw, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { switchAgentModel, type SessionSwitchResult } from '@/lib/session-chain';

interface AgentSwitcherProps {
  threadId: string;
  currentModel: string;
  onSwitchComplete?: (result: SessionSwitchResult) => void;
}

const MODEL_OPTIONS = [
  { id: 'qwen', name: 'Qwen 3.5 Plus', description: 'Balanced, cost-effective' },
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', description: 'Fast, cheap, good for long contexts' },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', description: 'Smart, large context window' },
  { id: 'sonnet', name: 'Claude Sonnet 4', description: 'Best for complex reasoning' },
  { id: 'opus', name: 'Claude Opus 4.6', description: 'Most capable (expensive)' },
  { id: 'minimax', name: 'MiniMax M2.5', description: 'Alternative model' },
];

export default function AgentSwitcher({ threadId, currentModel, onSwitchComplete }: AgentSwitcherProps) {
  const [selectedModel, setSelectedModel] = useState('');
  const [switchReason, setSwitchReason] = useState('model_switch');
  const [isSwitching, setIsSwitching] = useState(false);
  const [result, setResult] = useState<SessionSwitchResult | null>(null);

  const handleSwitch = async () => {
    if (!selectedModel || selectedModel === currentModel) return;

    setIsSwitching(true);
    setResult(null);

    try {
      const switchResult = await switchAgentModel(threadId, selectedModel, switchReason);
      setResult(switchResult);
      
      if (switchResult.success && onSwitchComplete) {
        onSwitchComplete(switchResult);
      }
    } catch (error) {
      console.error('Switch failed:', error);
      setResult({
        success: false,
        newSessionKey: '',
        oldSessionKey: '',
        threadId,
        error: 'Unexpected error during switch'
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Switch Agent Model</h3>
        <div className="text-sm text-gray-500">
          Current: <span className="font-medium text-gray-900">{currentModel}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select New Model</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isSwitching}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">Choose a model...</option>
          {MODEL_OPTIONS.map((model) => (
            <option key={model.id} value={model.id} disabled={model.id === currentModel}>
              {model.name} {model.id === currentModel && '(current)'} - {model.description}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Reason for Switch</label>
        <select
          value={switchReason}
          onChange={(e) => setSwitchReason(e.target.value)}
          disabled={isSwitching}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="model_switch">Manual Model Switch</option>
          <option value="token_limit">Token Limit Reached</option>
          <option value="cost_optimization">Cost Optimization</option>
          <option value="task_change">Task Complexity Changed</option>
        </select>
      </div>

      <button
        onClick={handleSwitch}
        disabled={isSwitching || !selectedModel || selectedModel === currentModel}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSwitching ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Switching...</span>
          </>
        ) : (
          <>
            <ArrowRight className="h-4 w-4" />
            <span>Switch to {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name || 'Model'}</span>
          </>
        )}
      </button>

      {result && (
        <div className={`rounded-md p-3 ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            {result.success ? (
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1 text-sm">
              {result.success ? (
                <>
                  <p className="font-medium text-green-900">Switch successful!</p>
                  <p className="text-green-700 mt-1">
                    New session: <code className="bg-green-100 px-1 rounded">{result.newSessionKey.slice(0, 12)}...</code>
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-red-900">Switch failed</p>
                  <p className="text-red-700 mt-1">{result.error}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
