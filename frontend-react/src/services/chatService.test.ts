import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import chatService from './chatService';

describe('chatService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a pergunta and returns the resposta when API responds ok', async () => {
    const fakeFetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ resposta: 'Resposta IA' }),
      })
    );

    vi.stubGlobal('fetch', fakeFetch);

    const resposta = await chatService.enviarPergunta('Qual é o estoque?');

    expect(resposta).toBe('Resposta IA');
    expect(fakeFetch).toHaveBeenCalledWith(expect.stringContaining('/api/consulta-ia/perguntar'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pergunta: 'Qual é o estoque?' }),
    });
  });

  it('throws a friendly error when API returns a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, statusText: 'Bad Request' })));

    await expect(chatService.enviarPergunta('Erro')).rejects.toThrow(
      'Desculpe, houve um erro ao processar sua pergunta. Tente novamente.'
    );
  });

  it('throws a friendly error when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network fail'))));

    await expect(chatService.enviarPergunta('Falha de rede')).rejects.toThrow(
      'Desculpe, houve um erro ao processar sua pergunta. Tente novamente.'
    );
  });
});
