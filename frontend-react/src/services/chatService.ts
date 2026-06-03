const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  pergunta: string;
}

export interface ChatResponse {
  resposta: string;
}

class ChatService {
  private baseUrl = `${API_BASE_URL}/consulta-ia`;

  async enviarPergunta(pergunta: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/perguntar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pergunta }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      return data.resposta;
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      throw new Error(
        'Desculpe, houve um erro ao processar sua pergunta. Tente novamente.'
      );
    }
  }
}

export default new ChatService();
