
import React, { useState, useRef, useEffect } from 'react';
import { StructuredReport } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface ChatViewProps {
  reports: StructuredReport[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ChatView: React.FC<ChatViewProps> = ({ reports }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! Smart 주간업무 AJ AI 기반 지식베이스 챗봇입니다. 특정 주차의 실적이나, 반복되는 이슈에 대해 질문해 주세요. (예: "지난달 A본부의 주요 리스크는 무엇이었어?")'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await geminiService.chatWithKnowledgeBase(input, reports);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '죄송합니다. Smart 주간업무 AJ AI가 답변을 생성하는 중 오류가 발생했습니다.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Smart 주간업무 AJ AI</h3>
            <p className="text-[10px] text-blue-300 font-medium tracking-wider uppercase">Active Search in {reports.length} Reports</p>
          </div>
        </div>
        <Sparkles size={18} className="text-yellow-400" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'assistant' 
                  ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                  : 'bg-blue-600 text-white rounded-tr-none'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-600" size={16} />
                <span className="text-sm text-gray-500">Smart 주간업무 AJ AI가 근거를 찾는 중...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="질문을 입력하세요..."
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
