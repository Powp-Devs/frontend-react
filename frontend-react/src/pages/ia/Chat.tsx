import React, { useState, useEffect, useRef } from 'react';
import Header from '@/shared/components/layout/Header';
import '@/styles/chatBot.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'Qual foi o faturamento do mês passado?',
  'Quantos fornecedores estão cadastrados?',
  'Quais produtos estão com estoque baixo?',
  'Mostrar vendas da última semana',
  'Qual fornecedor tem mais produtos cadastrados?',
  'Relatório de clientes inadimplentes',
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Olá! Eu sou seu assistente IA para o ERP. Como posso ajudá-lo hoje? Posso fornecer informações sobre fornecedores, vendas, estoque, relatórios financeiros e muito mais!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simula resposta da IA (integrar com backend/API depois)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Processando sua pergunta: "${text}". Esta é uma resposta simulada. Integre com sua API de IA aqui.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="chat-page">
      <Header />
      <div className="chat-header">
        <div className="chat-header-info">
          <h1>ChatBot IA</h1>
          <p>Assistente inteligente para seu ERP</p>
        </div>
        <div className="online-status">
          <div className="status-dot"></div>
          <span>Online</span>
        </div>
      </div>

      <div className="chat-container">
        {/* Suggested Questions Sidebar */}
        <div className="suggestions-sidebar">
          <h3>Perguntas sugeridas:</h3>
          <div className="suggestions-grid">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => handleSuggestedQuestion(question)}
                title={question}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {/* Messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}-message`}>
                {message.type === 'ai' && <div className="ai-avatar">IA</div>}
                <div className="message-content">
                  <div className={`message-bubble ${message.type}-bubble`}>
                    <p>{message.content}</p>
                  </div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="message ai-message">
                <div className="ai-avatar">IA</div>
                <div className="loading-bubble">
                  <div className="loading-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre dados da empresa..."
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
              >
                Enviar
              </button>
            </div>
            <p className="tip-text">
              💡 Dica: Pergunte sobre vendas, fornecedores, estoque, relatórios financeiros e muito mais!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
