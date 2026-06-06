import React, { useState, useEffect, useRef } from 'react';
import Header from '@/shared/components/layout/Header';
import chatService from '@/services/chatService';
import '@/styles/chatBot.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

//Perguntas de sugestão ao usuário
const SUGGESTED_QUESTIONS = [
  'Como faz para lançar um pedido no sistema?',
  'Quais os status que um pedido pode ter no sistema',
  'Quais os requisitos para cadastrar um fornecedor?',
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    try {
      // Chama a API da IA
      const resposta = await chatService.enviarPergunta(text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: resposta,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: error instanceof Error ? error.message : 'Desculpe, houve um erro ao processar sua pergunta.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

  //Função para fazer o upload de arquivos pro modelo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: uploadMessageId,
      type: 'user',
      content: `📎 Enviando documento: ${file.name}...`,
      timestamp: new Date().toLocaleTimeString('pt-br', { hour: '2-digit', minute: '2-digit' })
    }]);

    setIsLoading(true);

    try {
      const mensagemSucesso = await chatService.uploadDocumento(file);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `${mensagemSucesso}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);

    } catch(error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `${error.message}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          
          {/* 1. ZONA DAS MENSAGENS */}
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

          {/* 2. ZONA DE INPUT */}
          <div className="input-area">
            <div className="input-container">
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
                accept=".pdf,.docx,.xlsx,.csv,.txt"
              />
              
              <button 
                className="attach-btn" 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isLoading}
                title="Anexar documento para a IA estudar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>

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
