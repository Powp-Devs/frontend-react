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
      throw new Error('Desculpe, houve um erro ao processar sua pergunta. Tente novamente.');
    }
  }

  async uploadDocumento(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('arquivo', file);

      const response = await apiClient.post('/consulta-ia/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = (response as any).data || response;
      return data.message;

    } catch (error: any) {
      console.error('Erro ao fazer o upload do arquivo:', error);

      const detalheErro = error.response?.data?.detail || 'Erro ao enviar o arquivo. Verifique o formato e tente novamente.';
      throw new Error(detalheErro);
    }
  }
}

export default new ChatService();
