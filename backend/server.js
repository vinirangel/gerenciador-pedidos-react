const express = require('express');
const cors = require('cors');
app.use(cors())
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Substitua pelas credenciais obtidas no painel do seu projeto Supabase
const SUPABASE_URL = 'https://xvdlxyqotbiujwyyfduw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AbUzE75nEIemDtQpdeQULg_HQtdnaue';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ROTA 1: Buscar todos os itens salvos no Banco de Dados
app.get('/api/itens', async (req, res) => {
  const { data, error } = await supabase
    .from('itens_tabela')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
});

// ROTA 2: Salvar ou Atualizar um item no Banco de Dados (Persistência Anual)
app.post('/api/itens/salvar', async (req, res) => {
  const { id, codigo, descricao, localidade } = req.body;

  // O método upsert insere o registro caso não exista ou o atualiza caso o ID já conste na tabela
  const { data, error } = await supabase
    .from('itens_tabela')
    .upsert([{ id, codigo, descricao, localidade }])
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'Item persistido com sucesso!', data });
});

// ROTA 3: Deletar item definitivamente através da Lixeira
app.delete('/api/itens/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('itens_tabela')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'Item removido permanentemente do banco de dados.' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com persistência de dados na porta ${PORT}`);
});