import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  ShieldAlert,
  Bot,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Zap,
  Lock,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { UserRole } from '../../types/risk';
import { sendChatMessage, fetchAiProviders, AiProvidersStatus } from '../../services/apiClient';

interface AiCopilotWidgetProps {
  currentRole: UserRole;
  currentScreen?: string;
  orgName?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  providerUsed?: 'ollama' | 'groq' | 'builtin';
  roleEnforced?: UserRole;
  disclaimer?: string;
}

export const AiCopilotWidget: React.FC<AiCopilotWidgetProps> = ({
  currentRole,
  currentScreen = 'WORKSPACE',
  orgName = 'Acme Financial Technologies SaaS'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  // Provider configuration
  const [provider, setProvider] = useState<'builtin' | 'ollama' | 'groq'>('builtin');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [providerStatus, setProviderStatus] = useState<AiProvidersStatus | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **AegisRisk AI Copilot**.
I am configured with strict **${currentRole} Role Guardrails**. I will answer strictly what you are authorized and need to know based on live system telemetry.

Ask me about your financial risk metrics, operational actions, or click below for interactive guidance.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      providerUsed: 'builtin',
      roleEnforced: currentRole
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll available AI providers on mount
  useEffect(() => {
    fetchAiProviders()
      .then((status) => {
        setProviderStatus(status);
        // If local ollama is available with models, default to it
        if (status.ollama.available && status.ollama.models.length > 0) {
          setOllamaModel(status.ollama.models[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Update initial message when role switches
  useEffect(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: `role-switch-${Date.now()}`,
        role: 'assistant',
        content: `🔄 **Active Role Switched to: ${currentRole}**\nGuardrails have dynamically updated. Your queries will now be constrained strictly to ${currentRole} permissions and purviews.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerUsed: provider,
        roleEnforced: currentRole
      }
    ]);
  }, [currentRole]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Interactive quick action prompt chips based on active role
  const getRoleQuickPrompts = (role: UserRole) => {
    switch (role) {
      case 'CISO':
        return [
          'What is our 95% VaR?',
          'How does Knapsack optimize our $500k budget?',
          'What are my CISO permissions?',
          'How do I use this Executive Cockpit?'
        ];
      case 'SECURITY_ANALYST':
        return [
          'Which CVE has highest financial impact?',
          'How does Virtual Patching reduce EAL?',
          'What are my Analyst permissions?',
          'Check CISA KEV active exploits'
        ];
      case 'COMPLIANCE_AUDITOR':
        return [
          'Verify SHA-256 audit log integrity',
          'Explain DORA Art. 16 concentration risk',
          'What can I do as an Auditor?',
          'SEC Rule 106 4-day checklist'
        ];
      case 'ADMIN':
        return [
          'Check 5 connectors status',
          'How do I invite a new user?',
          'What are my Admin permissions?',
          'How to configure Tenable connector?'
        ];
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage({
        message: text,
        role: currentRole,
        provider,
        ollamaModel,
        groqApiKey: groqApiKey || undefined,
        groqModel,
        history: historyPayload,
        context: {
          currentScreen,
          orgName
        }
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerUsed: res.providerUsed,
        roleEnforced: res.roleEnforced,
        disclaimer: res.disclaimer
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Error communicating with AI engine**: ${err.message}. Falling back to internal security guardrails.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          providerUsed: 'builtin',
          roleEnforced: currentRole
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. FLOATING LAUNCHER BUTTON (Bottom Right Corner)
      ────────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-cyan-500/30 flex items-center space-x-2.5 border border-cyan-400/40 transition-all transform hover:scale-105 group"
          id="ai-copilot-launcher-btn"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
          </div>
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
          <span>AI Copilot</span>
          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-cyan-300 border border-cyan-500/40">
            {currentRole}
          </span>
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. EXPANDABLE CHAT ASSISTANT DRAWER / PANEL
      ────────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all flex flex-col bg-[#0B1020] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl ${
            isExpanded
              ? 'bottom-4 right-4 w-[600px] h-[750px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]'
              : 'bottom-6 right-6 w-[410px] h-[580px] max-w-[calc(100vw-48px)]'
          }`}
          id="ai-copilot-panel"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-surface-border bg-slate-900/90 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-white tracking-tight">AegisRisk AI Copilot</h3>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentRole}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Guardrail Bounded</span>
                  <span>•</span>
                  <span className="font-mono text-[9px] text-slate-300">
                    {provider === 'ollama' ? 'Local Ollama' : provider === 'groq' ? 'Groq Cloud' : 'Built-in Engine'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button
                onClick={() => setShowPermissions(!showPermissions)}
                className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors ${
                  showPermissions ? 'text-cyan-400 bg-slate-800' : ''
                }`}
                title="View Role Permissions & Guardrails"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors ${
                  showSettings ? 'text-cyan-400 bg-slate-800' : ''
                }`}
                title="Configure LLM Provider (Ollama / Groq / Built-in)"
              >
                <Sliders className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Provider Settings Modal / Dropdown */}
          {showSettings && (
            <div className="p-3.5 bg-slate-900 border-b border-surface-border text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Inference Provider</span>
                </span>
                <span className="text-[10px] text-slate-400">Strict Role Guardrails Enforced on all</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-surface-border">
                <button
                  type="button"
                  onClick={() => setProvider('builtin')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    provider === 'builtin' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Built-in</span>
                  <span className="text-[9px] font-normal opacity-80">Instant / Zero Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('ollama')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    provider === 'ollama' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Local Ollama</span>
                  <span className="text-[9px] font-normal opacity-80">
                    {providerStatus?.ollama.available ? 'Active (Port 11434)' : 'Offline'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('groq')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 ${
                    provider === 'groq' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Groq Cloud</span>
                  <span className="text-[9px] font-normal opacity-80">Free Fast API</span>
                </button>
              </div>

              {/* Provider specifics */}
              {provider === 'ollama' && (
                <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-surface-border">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Ollama Model:</span>
                    <span className="text-cyan-400 font-mono text-[10px]">http://localhost:11434</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="llama3 / mistral / qwen2.5"
                      className="flex-1 bg-slate-900 border border-surface-border rounded-lg px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {providerStatus?.ollama.available
                      ? 'Local Ollama server is running. Ensure model is downloaded (`ollama run llama3`).'
                      : 'Ollama is not running locally. Start Ollama or use Built-in engine.'}
                  </p>
                </div>
              )}

              {provider === 'groq' && (
                <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-surface-border">
                  <label className="text-slate-300 text-[11px] block">Groq API Key (Optional / Free):</label>
                  <input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-slate-900 border border-surface-border rounded-lg px-2 py-1 text-white font-mono text-xs"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Model: {groqModel}</span>
                    <span className="text-cyan-400">Free Tier</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Role Permissions Card */}
          {showPermissions && (
            <div className="p-3.5 bg-slate-900 border-b border-surface-border text-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                  <span>Authorized Permissions: {currentRole}</span>
                </span>
                <button onClick={() => setShowPermissions(false)} className="text-slate-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Permitted Scope:</span>
                  </span>
                  <p className="text-slate-300 text-[10px] leading-tight">
                    {currentRole === 'CISO'
                      ? 'Portfolio EAL & VaR, Knapsack ROSI allocation, board appetite alignment, What-If tradeoffs, SEC 8-K readiness.'
                      : currentRole === 'SECURITY_ANALYST'
                      ? 'Vulnerability triage ordered by financial impact, CISA KEV catalog correlation, virtual patch simulation, asset register.'
                      : currentRole === 'COMPLIANCE_AUDITOR'
                      ? 'Strictly READ-ONLY assurance: SEC Rule 106 4-day checklist, DORA Art. 16 stress test, SHA-256 tamper verification.'
                      : 'Tenant setup, RBAC user provisioning, 5-category data connectors health, telemetry sync intervals.'}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Blocked Actions:</span>
                  </span>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    {currentRole === 'CISO'
                      ? 'Low-level bash scripts, packet traces, direct DB tampering.'
                      : currentRole === 'SECURITY_ANALYST'
                      ? 'Capital budget reallocation, changing org subscription plans, signing SEC legal filings.'
                      : currentRole === 'COMPLIANCE_AUDITOR'
                      ? 'ANY write action: cannot delete, patch, configure, or alter telemetry.'
                      : 'Overriding cryptographic SHA-256 logs or modifying mathematical FAIR core.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Interactive Prompt Chips */}
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-surface-border/50 bg-slate-950/40">
            {getRoleQuickPrompts(currentRole).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-[10px] font-medium text-slate-300 hover:text-cyan-300 border border-surface-border hover:border-cyan-500/50 transition-all shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-200">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono">
                    <span>{isUser ? 'You' : 'AegisRisk Copilot'}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                    {!isUser && m.providerUsed && (
                      <span className="px-1 py-0.2 rounded bg-slate-800 text-[9px] text-cyan-400 border border-surface-border">
                        {m.providerUsed}
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                        : 'bg-slate-900/90 text-slate-200 rounded-bl-none border border-surface-border shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>

                  {m.disclaimer && (
                    <span className="text-[9px] text-amber-400 font-mono px-1">
                      ℹ️ {m.disclaimer}
                    </span>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 p-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="font-mono text-[11px]">
                  Evaluating {currentRole} role guardrails on live telemetry...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-surface-border bg-slate-900/90 rounded-b-2xl flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask as ${currentRole} (e.g. VaR, ROSI, CVE, permissions)...`}
              className="flex-1 bg-slate-950 border border-surface-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              disabled={isLoading}
              id="ai-copilot-input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-md shadow-blue-600/20 transition-all"
              id="ai-copilot-send-btn"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
