import apiClient from './api';

export interface ChatRequest {
  pergunta: string;
}

export interface ChatResponse {
  resposta: string;
}

class ChatService {

  async enviarPergunta(pergunta: string): Promise<string> {
    try {
      const response = await apiClient.post<ChatResponse>('/consulta-ia/perguntar', {
        pergunta
      });

      return response.resposta;

    } catch (error) {
      console.error('Erro ao enviar pergunta:', error);
      throw new Error(
        'Desculpe, houve um erro ao processar sua pergunta. Tente novamente.'
      );
    }
  }
}

export default new ChatService();
