import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // Agora temos apenas uma única lista global de itens
  const [itens, setItens] = useState([
    { id: uuidv4(), codigo: '101', descricao: 'Produto Exemplo', ncm: '1234.56.78', qtd: 2, valorUnit: 50.00, total: '100.00' }
  ]);
  
  const [busca, setBusca] = useState('');
  
  // Configuração de Paginação (Itens por página)
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5; 

  // Atualização de campos com cálculo automático de total
  const handleItemChange = (id, campo, valor) => {
    setItens(prevItens => 
      prevItens.map(item => {
        if (item.id === id) {
          const novoItem = { ...item, [campo]: valor };
          novoItem.total = (Number(novoItem.qtd) * Number(novoItem.valorUnit)).toFixed(2);
          return novoItem;
        }
        return item;
      })
    );
  };

  // Adiciona um novo item individual à lista
  const adicionarItem = () => {
    const novoItem = {
      id: uuidv4(),
      codigo: '',
      descricao: '',
      ncm: '',
      qtd: 0,
      valorUnit: 0,
      total: '0.00'
    };
    setItens([...itens, novoItem]);
  };

  // Remoção de item com confirmação nativa
  const removerItem = (id, descricao) => {
    const confirmar = window.confirm(`Deseja excluir o item "${descricao || 'Sem descrição'}"?`);
    if (confirmar) {
      setItens(prevItens => prevItens.filter(item => item.id !== id));
      // A integração com o backend para exclusão física é disparada aqui
    }
  };

  // BUSCA GLOBAL: Verifica se o texto bate com QUALQUER um dos campos do item
  const itensFiltrados = itens.filter(item => {
    const termo = busca.toLowerCase();
    return (
      item.codigo.toLowerCase().includes(termo) ||
      item.descricao.toLowerCase().includes(termo) ||
      item.ncm.toLowerCase().includes(termo) ||
      item.qtd.toString().includes(termo) ||
      item.valorUnit.toString().includes(termo) ||
      item.total.toString().includes(termo)
    );
  });

  // Cálculo de Índices para a Paginação de Itens
  const indiceUltimoItem = paginaAtual * itensPorPagina;
  const indicePrimeiroItem = indiceUltimoItem - itensPorPagina;
  const itensDaPaginaAtual = itensFiltrados.slice(indicePrimeiroItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Gerenciador de Itens</h1>
        
        {/* Barra de Busca Global */}
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="🔍 Buscar por código, descrição, NCM, valores..."
            className="w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1); }} 
          />
        </div>

        {/* Tabela de Itens Única */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wider border-b border-gray-200">
                <th className="p-3 w-32">Código</th>
                <th className="p-3 w-72">Descrição</th> {/* Tamanho fixo estipulado */}
                <th className="p-3 w-36">NCM</th>
                <th className="p-3 w-24">Qtd</th>
                <th className="p-3 w-36">Valor Unit.</th>
                <th className="p-3 w-36">Total</th>
                <th className="p-3 w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {itensDaPaginaAtual.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-2">
                    <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={item.codigo} onChange={(e) => handleItemChange(item.id, 'codigo', e.target.value)} />
                  </td>
                  <td className="p-2">
                    {/* Alterado de volta para input type="text" com largura controlada */}
                    <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none truncate" title={item.descricao} value={item.descricao} onChange={(e) => handleItemChange(item.id, 'descricao', e.target.value)} />
                  </td>
                  <td className="p-2">
                    <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={item.ncm} onChange={(e) => handleItemChange(item.id, 'ncm', e.target.value)} />
                  </td>
                  <td className="p-2">
                    <input type="number" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={item.qtd} onChange={(e) => handleItemChange(item.id, 'qtd', e.target.value)} />
                  </td>
                  <td className="p-2">
                    <input type="number" className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none" value={item.valorUnit} onChange={(e) => handleItemChange(item.id, 'valorUnit', e.target.value)} />
                  </td>
                  <td className="p-3 font-medium text-sm text-gray-900">
                    R$ {item.total}
                  </td>
                  <td className="p-2 text-center">
                    <button 
                      onClick={() => removerItem(item.id, item.descricao)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"
                      title="Excluir Linha"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botão de Adicionar Item */}
        <div className="mt-4">
          <button 
            onClick={adicionarItem}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow transition"
          >
            + Adicionar Novo Item
          </button>
        </div>

        {/* Paginação de Itens */}
        {totalPaginas > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-1">
            <button 
              disabled={paginaAtual === 1}
              onClick={() => setPaginaAtual(prev => prev - 1)}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            
            {Array.from({ length: totalPaginas }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setPaginaAtual(index + 1)}
                className={`px-3 py-1.5 text-sm rounded font-medium transition ${
                  paginaAtual === index + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button 
              disabled={paginaAtual === totalPaginas}
              onClick={() => setPaginaAtual(prev => prev - 1)}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;