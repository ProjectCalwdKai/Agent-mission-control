/**
 * Auto-Switch Monitor
 * 
 * Monitors session token usage and automatically switches to cheaper models
 * when thresholds are exceeded.
 */

import { supabase } from './supabase';
import { switchAgentModel } from './session-chain';

export interface AutoSwitchConfig {
  // Token thresholds
  highTokenThreshold: number;      // Switch when exceeded (default: 80000)
  criticalTokenThreshold: number;  // Immediate switch (default: 100000)
  
  // Model downgrade path
  premiumModels: string[];         // Models to downgrade FROM (e.g., ['opus', 'sonnet', 'gemini-pro'])
  cheapModels: string[];           // Models to downgrade TO (e.g., ['gemini-flash', 'qwen-flash'])
  
  // Check interval
  checkIntervalMs: number;         // How often to check (default: 5 minutes)
}

const DEFAULT_CONFIG: AutoSwitchConfig = {
  highTokenThreshold: 80000,
  criticalTokenThreshold: 100000,
  premiumModels: ['opus', 'sonnet', 'gemini-pro', 'qwen'],
  cheapModels: ['gemini-flash', 'qwen-flash', 'minimax'],
  checkIntervalMs: 5 * 60 * 1000, // 5 minutes
};

/**
 * Get session token usage from OpenClaw
 */
export async function getSessionTokenUsage(sessionKey: string): Promise<{
  total: number;
  inTokens: number;
  outTokens: number;
} | null> {
  try {
    const response = await fetch(`/api/sessions/status?sessionKey=${sessionKey}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch status for ${sessionKey}`);
      return null;
    }

    const data = await response.json();
    return {
      total: data.tokens?.total || 0,
      inTokens: data.tokens?.in || 0,
      outTokens: data.tokens?.out || 0
    };
  } catch (error) {
    console.error('Error fetching token usage:', error);
    return null;
  }
}

/**
 * Check if a model should be downgraded
 */
export function shouldDowngradeModel(model: string, config: AutoSwitchConfig): boolean {
  return config.premiumModels.some(pm => 
    model.toLowerCase().includes(pm.toLowerCase())
  );
}

/**
 * Get the target cheap model for downgrade
 */
export function getDowngradeTarget(currentModel: string, config: AutoSwitchConfig): string {
  // Prefer gemini-flash for most cases
  if (currentModel.toLowerCase().includes('opus') || currentModel.toLowerCase().includes('sonnet')) {
    return 'gemini-flash';
  }
  return config.cheapModels[0] || 'gemini-flash';
}

/**
 * Monitor and auto-switch threads with high token usage
 */
export async function monitorAndAutoSwitch(config: Partial<AutoSwitchConfig> = {}) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  console.log('🔍 Starting auto-switch monitor...');
  console.log(`   High threshold: ${fullConfig.highTokenThreshold.toLocaleString()} tokens`);
  console.log(`   Critical threshold: ${fullConfig.criticalTokenThreshold.toLocaleString()} tokens`);
  console.log(`   Check interval: ${fullConfig.checkIntervalMs / 1000}s`);

  try {
    // Fetch all active threads
    const { data: threads, error } = await supabase
      .from('conversation_threads')
      .select('id, current_session_key, current_model, status')
      .eq('status', 'active');

    if (error) throw error;
    if (!threads || threads.length === 0) {
      console.log('   No active threads to monitor');
      return { checked: 0, switched: 0 };
    }

    let checked = 0;
    let switched = 0;

    for (const thread of threads) {
      checked++;
      
      if (!thread.current_session_key) {
        console.log(`   ⚪ Thread ${thread.id.slice(0, 8)}: No session yet`);
        continue;
      }

      // Get token usage
      const usage = await getSessionTokenUsage(thread.current_session_key);
      
      if (!usage) {
        console.log(`   ⚪ Thread ${thread.id.slice(0, 8)}: Could not fetch usage`);
        continue;
      }

      const { total } = usage;

      // Check if downgrade needed
      if (total >= fullConfig.criticalTokenThreshold) {
        console.log(`   🔴 Thread ${thread.id.slice(0, 8)}: CRITICAL (${total.toLocaleString()} tokens)`);
        
        if (shouldDowngradeModel(thread.current_model, fullConfig)) {
          const targetModel = getDowngradeTarget(thread.current_model, fullConfig);
          console.log(`      Switching ${thread.current_model} → ${targetModel}`);
          
          const result = await switchAgentModel(
            thread.id,
            targetModel,
            'cost_optimization'
          );

          if (result.success) {
            switched++;
            console.log(`      ✅ Switched successfully`);
          } else {
            console.log(`      ❌ Switch failed: ${result.error}`);
          }
        } else {
          console.log(`      ⚪ Already on cheap model`);
        }
      } else if (total >= fullConfig.highTokenThreshold) {
        console.log(`   🟡 Thread ${thread.id.slice(0, 8)}: HIGH (${total.toLocaleString()} tokens)`);
        
        if (shouldDowngradeModel(thread.current_model, fullConfig)) {
          const targetModel = getDowngradeTarget(thread.current_model, fullConfig);
          console.log(`      Scheduling switch: ${thread.current_model} → ${targetModel}`);
          
          // Could implement a "soft" switch here (notify user first, etc.)
        }
      } else {
        console.log(`   🟢 Thread ${thread.id.slice(0, 8)}: OK (${total.toLocaleString()} tokens)`);
      }
    }

    return { checked, switched };
  } catch (error: any) {
    console.error('Auto-switch monitor failed:', error);
    return { checked: 0, switched: 0, error: error.message };
  }
}

/**
 * Start continuous monitoring (runs every checkInterval)
 */
export async function startAutoSwitchMonitor(
  config: Partial<AutoSwitchConfig> = {},
  onRun?: (result: Awaited<ReturnType<typeof monitorAndAutoSwitch>>) => void
): { stop: () => void } {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  let running = true;
  let timeoutId: NodeJS.Timeout;

  const runLoop = async () => {
    if (!running) return;

    const result = await monitorAndAutoSwitch(fullConfig);
    
    if (onRun) {
      onRun(result);
    }

    if (running) {
      timeoutId = setTimeout(runLoop, fullConfig.checkIntervalMs);
    }
  };

  // Start immediately
  runLoop();

  return {
    stop: () => {
      running = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.log('⏹️  Auto-switch monitor stopped');
    }
  };
}
