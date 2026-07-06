import React, { useState, useEffect } from 'react';

// URL do nosso servidor Node.js local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/itens';

function App() {
  const [itens, setItens] = useState([]);
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const itensPorPagina = 5;

  // 1. CARREGAR DADOS DO BANCO
  useEffect(() => {
    buscarItensDoBanco();
  }, []);

  const buscarItensDoBanco = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      setItens(dados);
    } catch (erro) {
      console.error("Erro ao buscar dados do backend:", erro);
      alert("Não foi possível conectar ao servidor backend.");
    } finally {
      setCarregando(false);
    }
  };

  // 2. CRIAR ITEM
  const adicionarItem = async () => {
    const novoItem = {
      id: Math.random().toString(36).substring(2, 11),
      codigo: '',
      descricao: '',
      localidade: ''
    };

    try {
      const resposta = await fetch(`${API_URL}/salvar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoItem)
      });

      if (resposta.ok) {
        setItens([...itens, novoItem]);
      }
    } catch (erro) {
      console.error("Erro ao criar item no banco:", erro);
    }
  };

  const handleItemChangeVisual = (id, campo, valor) => {
    setItens(prev => prev.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  // 3. SALVAR ALTERAÇÃO
  const salvarAlteracaoNoBanco = async (itemModificado) => {
    try {
      await fetch(`${API_URL}/salvar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemModificado)
      });
    } catch (erro) {
      console.error("Erro ao salvar alteração:", erro);
    }
  };

  // 4. DELETAR ITEM
  const removerItem = async (id, descricaoItem) => {
    const confirmar = window.confirm(`Deseja realmente excluir permanentemente o item "${descricaoItem || 'Sem descrição'}"?`);
    
    if (confirmar) {
      try {
        const resposta = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });

        if (resposta.ok) {
          setItens(prev => prev.filter(item => item.id !== id));
          
          const totalItensAposDelecao = itens.length - 1;
          const maxPaginasAposDelecao = Math.ceil(totalItensAposDelecao / itensPorPagina) || 1;
          if (paginaAtual > maxPaginasAposDelecao) {
            setPaginaAtual(maxPaginasAposDelecao);
          }
        } else {
          alert("Erro ao remover o item do banco de dados.");
        }
      } catch (erro) {
        console.error("Erro na requisição de exclusão:", erro);
      }
    }
  };

  // Filtro de busca
  const itensFiltrados = itens.filter(item =>
    (item.codigo?.toLowerCase() || '').includes(busca.toLowerCase()) ||
    (item.descricao?.toLowerCase() || '').includes(busca.toLowerCase()) ||
    (item.localidade?.toLowerCase() || '').includes(busca.toLowerCase())
  );

  // Lógica Matemática da Paginação
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const itensDaPaginaAtual = itensFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina) || 1;

  // LÓGICA NOVA: Determinar quais os 3 botões exibir (Janela Deslizante)
  let paginasExibidas = [];
  if (totalPaginas <= 3) {
    for (let i = 1; i <= totalPaginas; i++) paginasExibidas.push(i);
  } else {
    if (paginaAtual === 1) {
      paginasExibidas = [1, 2, 3];
    } else if (paginaAtual === totalPaginas) {
      paginasExibidas = [totalPaginas - 2, totalPaginas - 1, totalPaginas];
    } else {
      paginasExibidas = [paginaAtual - 1, paginaAtual, paginaAtual + 1];
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-xl font-semibold text-slate-600 animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2 text-blue-600">Gerenciador de Pedidos</h1>
        
        {/* Busca */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 Buscar por Código, Descrição ou Localidade..."
            className="w-full md:w-2/3 p-4 border border-slate-300 rounded-xl shadow-sm focus:outline-none bg-white text-lg"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }} 
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-sm border-b border-slate-200">
                  <th className="p-4 pr-3 w-[15%]">Nº do Pedido</th>
                  <th className="p-4 px-3 w-[50%]">Descrição</th>
                  <th className="p-4 pl-10 w-[25%]">Localidade</th>
                  <th className="p-4 pl-6 w-[10%] text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 alignment-top align-top">
                {itensDaPaginaAtual.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition duration-75">
                    <td className="p-4 pr-3 align-top">
                      <input 
                        type="text" 
                        className="w-full p-3 border rounded-lg bg-white" 
                        value={item.codigo} 
                        onChange={(e) => handleItemChangeVisual(item.id, 'codigo', e.target.value)}
                        onBlur={() => salvarAlteracaoNoBanco(item)}
                      />
                    </td>
                    <td className="p-4 px-3 align-top">
                      <textarea 
                        rows={3}
                        placeholder="Digite a descrição"
                        className="w-full p-3 border rounded-lg resize-y min-h-[46px] max-h-40 font-normal text-slate-700 focus:ring-1 focus:ring-blue-500 bg-white" 
                        value={item.descricao} 
                        onChange={(e) => handleItemChangeVisual(item.id, 'descricao', e.target.value)}
                        onBlur={() => salvarAlteracaoNoBanco(item)}
                      />
                    </td>
                    <td className="p-4 pl-10 align-top">
                      <input 
                        type="text" 
                        className="w-full p-3 border rounded-lg bg-white" 
                        value={item.localidade} 
                        onChange={(e) => handleItemChangeVisual(item.id, 'localidade', e.target.value)}
                        onBlur={() => salvarAlteracaoNoBanco(item)}
                      />
                    </td>
                    <td className="p-4 pl-6 text-center align-top pt-6">
                      <button 
                        onClick={() => removerItem(item.id, item.descricao)} 
                        className="text-red-600 text-xl p-2 hover:bg-red-50 rounded-full transition"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rodapé: Paginação e Adicionar Item */}
        <div className="flex justify-between items-center mt-4">
          <button onClick={adicionarItem} className="bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl shadow hover:bg-blue-700 transition">
            + Adicionar Novo Item
          </button>

          <div className="flex items-center space-x-2">
            {/* Botão Seta para Esquerda (Anterior) */}
            <button
              onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Página Anterior"
            >
              &larr;
            </button>

            {/* Botões Numéricos (Máximo 3) */}
            {paginasExibidas.map((numero) => (
              <button
                key={numero}
                onClick={() => setPaginaAtual(numero)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  paginaAtual === numero 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {numero}
              </button>
            ))}

            {/* Botão Seta para Direita (Próxima) */}
            <button
              onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}
              className="px-4 py-2 rounded-lg font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Próxima Página"
            >
              &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;