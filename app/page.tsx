'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ================= INICIALIZAÇÃO DO SUPABASE =================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fantasma.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'chave_fantasma';
const supabase = createClient(supabaseUrl, supabaseKey);

// ================= DADOS PADRÃO DO KANBAN =================
const defaultKanbanCards = [
  { titulo: 'CNPJ (JUCEPAR)', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 0 },
  { titulo: 'Inscrição Municipal', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 1 },
  { titulo: 'Alvará Prefeitura', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 2 },
  { titulo: 'CRF-PR', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 3 },
  { titulo: 'Anvisa (AFE)', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 4 },
  { titulo: 'PGRSS', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 5 },
  { titulo: 'Bombeiros', area: 'Administrativo', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 6 },
  { titulo: 'Contratação RT', area: 'RH', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 0 },
  { titulo: 'Folha de Pagamento', area: 'RH', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 1 },
  { titulo: 'Treinamento Equipe', area: 'RH', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 2 },
  { titulo: 'Uniformes', area: 'RH', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 3 },
  { titulo: 'Escala de Trabalho', area: 'RH', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 4 },
  { titulo: '1. Desmobilização (Limpeza/Caçamba)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 0 },
  { titulo: '2. Infra Bruta (Elétrica/Lógica/Drenos)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 1 },
  { titulo: '3. Gesso / Forro (Recortes)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 2 },
  { titulo: '4. Pintura e Massa Corrida', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 3 },
  { titulo: '5. Fachada (ACM/Vidro/Iluminação)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 4 },
  { titulo: '6. Climatização (Evaporadoras)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 5 },
  { titulo: '7. Elétrica Fina (Tomadas/Luminárias)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 6 },
  { titulo: '8. Instalação de Piso e Rodapé', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 7 },
  { titulo: '9. Mobiliário (Gôndolas/Balcão/Caixa)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 8 },
  { titulo: '10. TI (Computadores/PDV/Impressoras)', area: 'Infraestrutura', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 9 },
  { titulo: 'Equipamentos', area: 'Suprimentos', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 0 },
  { titulo: 'Sistema (PDV)', area: 'Suprimentos', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 1 },
  { titulo: 'Estoque Inicial', area: 'Suprimentos', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 2 },
  { titulo: 'Fornecedores Base', area: 'Suprimentos', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 3 },
  { titulo: 'Tripasse', area: 'Financeiro', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 0 },
  { titulo: 'Aluguel', area: 'Financeiro', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 1 },
  { titulo: 'Contabilidade', area: 'Financeiro', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 2 },
  { titulo: 'Fluxo de Caixa', area: 'Financeiro', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 3 },
  { titulo: 'Parcelamentos', area: 'Financeiro', inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: 4 },
];

export default function Home() {
  const [saldoEmConta, setSaldoEmConta] = useState<string>('24000000');
  const [abaAtiva, setAbaAtiva] = useState<'contas' | 'kanban' | 'clientes' | 'fornecedores'>('kanban');

  // ================= ESTADOS CONECTADOS =================
  const [contasAPagar, setContasAPagar] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  const [dataInauguracao, setDataInauguracao] = useState('');
  const [cardsExpandidos, setCardsExpandidos] = useState<Record<string, boolean>>({});
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // ================= BUSCA DE DADOS =================
  useEffect(() => {
    const dataSalva = localStorage.getItem('dataInauguracao');
    if (dataSalva) {
      setDataInauguracao(dataSalva);
    }

    async function carregarDados() {
      const { data: contasDB } = await supabase.from('contas_pagar').select('*').order('vencimento', { ascending: true });
      if (contasDB) setContasAPagar(contasDB);

      const { data: clientesDB } = await supabase.from('clientes').select('*').order('created_at', { ascending: false });
      if (clientesDB) setClientes(clientesDB);

      const { data: fornDB } = await supabase.from('fornecedores').select('*').order('created_at', { ascending: false });
      if (fornDB) setFornecedores(fornDB);

      const { data: cardsDB, error } = await supabase.from('kanban_cards').select('*');
      if (error) {
        console.error("Erro ao carregar Kanban:", error);
      } else if (cardsDB && cardsDB.length > 0) {
        setCards(cardsDB);
      } else {
        const { data: inseridos } = await supabase.from('kanban_cards').insert(defaultKanbanCards).select();
        if (inseridos) setCards(inseridos);
      }
    }
    carregarDados();
  }, []);

  const atualizarDataInauguracao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = e.target.value;
    setDataInauguracao(novaData);
    localStorage.setItem('dataInauguracao', novaData);
  };

  const toggleCard = (id: string) => {
    setCardsExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // ================= EXPORTAÇÃO PARA EXCEL =================
  const exportarParaExcel = (dados: any[], colunas: {key: string, label: string}[], titulo: string) => {
    const tableHeader = colunas.map(c => `<th style="background-color: #009e90; color: white; padding: 10px; border: 1px solid #ddd;">${c.label}</th>`).join('');
    
    const tableRows = dados.map(row => 
      `<tr>${colunas.map(c => `<td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${row[c.key] || ''}</td>`).join('')}</tr>`
    ).join('');
    
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style> table { border-collapse: collapse; width: 100%; font-family: sans-serif; } </style>
      </head>
      <body>
        <h2 style="color: #e8601c;">Relatório - ${titulo}</h2>
        <table>
          <thead><tr>${tableHeader}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_${titulo.replace(/\s+/g, '_')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ================= LÓGICA FINANCEIRA =================
  const [novaConta, setNovaConta] = useState({ descricao: '', vencimento: '', valor: '', parcelas: '1', status: 'Pagar' });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tempEdit, setTempEdit] = useState({ descricao: '', vencimento: '', valor: '', status: 'Pagar' });

  const maskCurrency = (value: string) => {
    let v = value.replace(/\D/g, ''); 
    if (v === '') return '';
    v = (Number(v) / 100).toFixed(2);
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return v;
  };

  const parseCurrency = (value: string) => {
    if (!value) return 0;
    return Number(value.replace(/\./g, '').replace(',', '.'));
  };

  const salvarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    const numParcelas = parseInt(novaConta.parcelas) || 1;
    const novasParcelas = [];
    const dataBase = new Date(novaConta.vencimento + 'T12:00:00');

    for (let i = 0; i < numParcelas; i++) {
      const dataVenc = new Date(dataBase);
      dataVenc.setMonth(dataBase.getMonth() + i);
      const dataString = dataVenc.toISOString().split('T')[0];

      novasParcelas.push({
        descricao: numParcelas > 1 ? `${novaConta.descricao} (${i + 1}/${numParcelas})` : novaConta.descricao,
        vencimento: dataString,
        valor_str: novaConta.valor.replace(/\D/g, ''),
        valor_num: parseCurrency(maskCurrency(novaConta.valor)),
        mes_index: dataVenc.getMonth(),
        status: novaConta.status
      });
    }

    const { data: inseridos, error } = await supabase.from('contas_pagar').insert(novasParcelas).select();
    if (error) alert("Erro ao salvar conta: " + error.message);
    if (inseridos) {
      setContasAPagar([...contasAPagar, ...inseridos].sort((a, b) => a.vencimento.localeCompare(b.vencimento)));
    }
    setNovaConta({ descricao: '', vencimento: '', valor: '', parcelas: '1', status: 'Pagar' });
  };

  const confirmarEdicao = async (id: string) => {
    const [ano, mes] = tempEdit.vencimento.split('-');
    const updatedData = { 
      descricao: tempEdit.descricao, 
      vencimento: tempEdit.vencimento, 
      valor_str: tempEdit.valor.replace(/\D/g, ''), 
      valor_num: parseCurrency(tempEdit.valor), 
      mes_index: parseInt(mes, 10) - 1, 
      status: tempEdit.status 
    };

    const { error } = await supabase.from('contas_pagar').update(updatedData).eq('id', id);
    if (error) alert("Erro ao editar: " + error.message);
    else {
      setContasAPagar(contasAPagar.map(c => c.id === id ? { ...c, ...updatedData } : c).sort((a, b) => a.vencimento.localeCompare(b.vencimento)));
      setEditandoId(null);
    }
  };

  const excluirConta = async (id: string) => {
    const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
    if (error) alert("Erro ao excluir: " + error.message);
    else setContasAPagar(contasAPagar.filter(c => c.id !== id));
  };

  const capital = parseCurrency(maskCurrency(saldoEmConta));
  const mesesInfo = [
    { nome: 'Maio', idx: 4 }, { nome: 'Junho', idx: 5 }, { nome: 'Julho', idx: 6 }, 
    { nome: 'Agosto', idx: 7 }, { nome: 'Setembro', idx: 8 }, { nome: 'Outubro', idx: 9 },
    { nome: 'Novembro', idx: 10 }, { nome: 'Dezembro', idx: 11 }
  ];

  let caixaAcumulado = capital;
  const gastosPreMaio = contasAPagar.filter(c => c.mes_index < 4).reduce((acc, curr) => acc + curr.valor_num, 0);
  caixaAcumulado -= gastosPreMaio;

  const projecao = mesesInfo.map((mesObj) => {
    const detalhesMes = contasAPagar.filter(c => c.mes_index === mesObj.idx);
    
    const totalGastoRealNum = detalhesMes.filter(c => c.status !== 'Em orçamento').reduce((acc, curr) => acc + curr.valor_num, 0);
    const totalOrcamentoNum = detalhesMes.filter(c => c.status === 'Em orçamento').reduce((acc, curr) => acc + curr.valor_num, 0);
    const totalSaidasMes = totalGastoRealNum + totalOrcamentoNum;

    caixaAcumulado -= totalSaidasMes;
    
    return { 
      ...mesObj, 
      totalSaidasMes,
      totalGastoRealNum,
      totalOrcamentoNum,
      saldoFinal: caixaAcumulado, 
      detalhesGastoReal: detalhesMes.filter(c => c.status !== 'Em orçamento'),
      detalhesOrcamento: detalhesMes.filter(c => c.status === 'Em orçamento')
    };
  });

  // ================= 2. LÓGICA CRM (Clientes) =================
  const [novoCliente, setNovoCliente] = useState({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });
  const [editandoCliId, setEditandoCliId] = useState<string | null>(null);
  const [tempEditCli, setTempEditCli] = useState({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });

  const salvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('clientes').insert([novoCliente]).select();
    if (error) alert("Erro ao salvar cliente: " + error.message);
    else if (data) setClientes([...clientes, ...data]);
    setNovoCliente({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });
  };

  const iniciarEdicaoCli = (cli: any) => {
    setEditandoCliId(cli.id);
    setTempEditCli({ nome: cli.nome, whatsapp: cli.whatsapp, compras: cli.compras, atendimento: cli.atendimento, tipo: cli.tipo });
  };

  const confirmarEdicaoCli = async (id: string) => {
    const { error } = await supabase.from('clientes').update(tempEditCli).eq('id', id);
    if (error) alert("Erro ao editar cliente: " + error.message);
    else {
      setClientes(clientes.map(c => c.id === id ? { ...c, ...tempEditCli } : c));
      setEditandoCliId(null);
    }
  };

  const excluirCliente = async (id: string) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) alert("Erro ao excluir cliente: " + error.message);
    else setClientes(clientes.filter(c => c.id !== id));
  };

  // ================= LÓGICA FORNECEDORES =================
  const [novoFornecedor, setNovoFornecedor] = useState({ nome: '', contato: '', compras: '', observacoes: '' });
  const [editandoFornId, setEditandoFornId] = useState<string | null>(null);
  const [tempEditForn, setTempEditForn] = useState({ nome: '', contato: '', compras: '', observacoes: '' });

  const salvarFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('fornecedores').insert([novoFornecedor]).select();
    if (error) alert("Erro ao salvar fornecedor: " + error.message);
    else if (data) setFornecedores([...fornecedores, ...data]);
    setNovoFornecedor({ nome: '', contato: '', compras: '', observacoes: '' });
  };

  const iniciarEdicaoForn = (forn: any) => {
    setEditandoFornId(forn.id);
    setTempEditForn({ nome: forn.nome, contato: forn.contato, compras: forn.compras, observacoes: forn.observacoes });
  };

  const confirmarEdicaoForn = async (id: string) => {
    const { error } = await supabase.from('fornecedores').update(tempEditForn).eq('id', id);
    if (error) alert("Erro ao editar fornecedor: " + error.message);
    else {
      setFornecedores(fornecedores.map(f => f.id === id ? { ...f, ...tempEditForn } : f));
      setEditandoFornId(null);
    }
  };

  const excluirFornecedor = async (id: string) => {
    const { error } = await supabase.from('fornecedores').delete().eq('id', id);
    if (error) alert("Erro ao excluir fornecedor: " + error.message);
    else setFornecedores(fornecedores.filter(f => f.id !== id));
  };


  // ================= 3. LÓGICA KANBAN =================
  const colunasKanban = ['A Fazer', 'Em andamento', 'Aguardando terceiros', 'Concluído'];
  const tagsSetores = ['Administrativo', 'RH', 'Infraestrutura', 'Suprimentos', 'Financeiro'];

  const adicionarCard = async (colunaArea: string) => {
    const novaOrdem = cards.filter(c => c.area === colunaArea).length;
    const novoCard = { titulo: 'Nova Tarefa', area: colunaArea, inicio: null, fim: null, status: 'A Fazer', bloqueado: false, ordem: novaOrdem };
    const { data, error } = await supabase.from('kanban_cards').insert([novoCard]).select();
    if (error) alert("Erro ao criar tarefa: " + error.message);
    else if (data) {
      setCards([...cards, ...data]);
      setCardsExpandidos(prev => ({ ...prev, [data[0].id]: true }));
    }
  };

  const atualizarCard = async (id: string, campo: string, valor: any) => {
    let valorFinal = valor;
    if ((campo === 'inicio' || campo === 'fim') && valor === '') {
      valorFinal = null;
    }

    setCards(cards.map(c => c.id === id ? { ...c, [campo]: valorFinal } : c));
    const { error } = await supabase.from('kanban_cards').update({ [campo]: valorFinal }).eq('id', id);
    if (error) alert(`Erro ao atualizar: ${error.message}`);
  };

  const excluirCard = async (id: string) => {
    const { error } = await supabase.from('kanban_cards').delete().eq('id', id);
    if (error) alert("Erro ao excluir tarefa: " + error.message);
    else setCards(cards.filter(c => c.id !== id));
  };

  const handleDrop = async (targetCardId: string, area: string) => {
    if (!draggedCardId || draggedCardId === targetCardId) return;

    const areaCards = cards.filter(c => c.area === area).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    const draggedIdx = areaCards.findIndex(c => c.id === draggedCardId);
    const targetIdx = areaCards.findIndex(c => c.id === targetCardId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newAreaCards = Array.from(areaCards);
    const [removed] = newAreaCards.splice(draggedIdx, 1);
    newAreaCards.splice(targetIdx, 0, removed);

    const updatedCards = newAreaCards.map((c, idx) => ({ ...c, ordem: idx }));

    const otherCards = cards.filter(c => c.area !== area);
    setCards([...otherCards, ...updatedCards]);

    for (const c of updatedCards) {
      await supabase.from('kanban_cards').update({ ordem: c.ordem }).eq('id', c.id);
    }
    setDraggedCardId(null);
  };

  const getTagColor = (area: string) => {
    switch (area) {
      case 'Administrativo': return 'bg-blue-100 text-blue-700';
      case 'RH': return 'bg-purple-100 text-purple-700';
      case 'Infraestrutura': return 'bg-orange-100 text-orange-700';
      case 'Suprimentos': return 'bg-teal-100 text-teal-700';
      case 'Financeiro': return 'bg-[#eaf8f1] text-[#009e90]';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const totalCards = cards.length;
  const concluidosCards = cards.filter(c => c.status === 'Concluído').length;
  const progressoGeral = totalCards === 0 ? 0 : Math.round((concluidosCards / totalCards) * 100);

  let semaforo = { cor: 'bg-slate-200 text-slate-700', texto: 'Inauguração: Sem Data' };
  if (dataInauguracao) {
    const hoje = new Date();
    const dataMeta = new Date(dataInauguracao + 'T23:59:59');
    const temAtraso = cards.some(c => c.fim && new Date(c.fim + 'T23:59:59') < hoje && c.status !== 'Concluído');
    
    if (progressoGeral === 100) {
      semaforo = { cor: 'bg-green-500 text-white', texto: 'Pronto para Inaugurar!' };
    } else if (temAtraso || (hoje > dataMeta && progressoGeral < 100)) {
      semaforo = { cor: 'bg-red-500 text-white', texto: 'Atrasos Detectados (Crítico)' };
    } else {
      semaforo = { cor: 'bg-yellow-500 text-white', texto: 'Operação no Prazo' };
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-10 text-slate-800 overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="bg-[#009e90] text-white p-4 shadow-md flex justify-between items-center border-b-4 border-[#e8601c]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Transição - Associadas</h1>
          <p className="text-sm opacity-90">Unidade Maringá, PR • Gestão Operacional Integrada</p>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-4 py-3 flex space-x-3 shadow-sm overflow-x-auto hide-scrollbar">
        <button onClick={() => setAbaAtiva('kanban')} className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'kanban' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>📋</span> BOARD OPERACIONAL</button>
        <button onClick={() => setAbaAtiva('contas')} className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'contas' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>💸</span> CONTAS A PAGAR</button>
        <button onClick={() => setAbaAtiva('clientes')} className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'clientes' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>👥</span> GESTÃO DE CLIENTES</button>
        <button onClick={() => setAbaAtiva('fornecedores')} className={`shrink-0 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'fornecedores' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>🚚</span> FORNECEDORES</button>
      </div>

      <main className="flex-1 p-4 md:p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* RESUMO SIMPLIFICADO NO TOPO - APENAS NA ABA DE CONTAS */}
        {abaAtiva === 'contas' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#eaf8f1] p-5 rounded-2xl border border-[#009e90]/30 shadow-sm">
                <p className="text-[10px] text-[#009e90] font-bold uppercase mb-1">Saldo Base (240k)</p>
                <div className="flex items-center text-2xl font-black text-[#009e90]">
                  <span className="mr-1">R$</span>
                  <input type="text" value={maskCurrency(saldoEmConta)} onChange={(e) => setSaldoEmConta(e.target.value)} className="bg-transparent w-full outline-none" />
                </div>
              </div>
              {projecao.slice(0, 3).map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${p.totalGastoRealNum > 0 ? 'bg-red-400' : p.totalOrcamentoNum > 0 ? 'bg-blue-400' : 'bg-[#e8601c]/50'}`}></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Previsão em {p.nome}</p>
                  <div className='flex gap-3'>
                    {p.totalGastoRealNum > 0 && (
                      <p className="text-xl font-bold text-red-600">R$ {maskCurrency((p.totalGastoRealNum * 100).toString())} <span className="text-[10px] text-red-400">(Real)</span></p>
                    )}
                    {p.totalOrcamentoNum > 0 && (
                      <p className="text-xl font-bold text-blue-600">R$ {maskCurrency((p.totalOrcamentoNum * 100).toString())} <span className="text-[10px] text-blue-400">(Orç)</span></p>
                    )}
                    {p.totalSaidasMes === 0 && (
                      <p className="text-2xl font-black text-[#e8601c]">R$ 0,00</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* KANBAN */}
        {abaAtiva === 'kanban' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col w-full">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4 border-[#009e90] gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Board Principal de Implantação</h2>
                <p className="text-xs text-slate-500 mt-1">Destrave o cadeado e arraste o post-it para priorizar.</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 flex-1 md:flex-none">
                  <label className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Inauguração:</label>
                  <input type="date" value={dataInauguracao} onChange={atualizarDataInauguracao} className="text-sm bg-transparent font-black outline-none text-[#009e90] w-full" />
                </div>
                <div className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex-1 md:flex-none text-center ${semaforo.cor}`}>
                  {semaforo.texto}
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Progresso Global</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
                <div className="bg-[#009e90] h-full transition-all duration-500" style={{ width: `${progressoGeral}%` }}></div>
              </div>
              <span className="text-sm font-black text-[#009e90]">{progressoGeral}%</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 items-start snap-x">
              {tagsSetores.map(areaColuna => (
                <div key={areaColuna} className="snap-center min-w-[85vw] md:min-w-[320px] flex-1 bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col max-h-[750px]">
                  
                  <h3 className="font-bold text-white bg-[#009e90] px-4 py-3 rounded-xl mb-3 flex justify-between items-center shadow-md">
                    {areaColuna}
                    <span className="bg-white text-[#009e90] rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-sm">
                      {cards.filter(c => c.area === areaColuna).length}
                    </span>
                  </h3>
                  
                  <div className="overflow-y-auto pr-1 flex-1 space-y-2">
                    {cards
                      .filter(c => c.area === areaColuna)
                      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
                      .map(card => {
                        const isExpanded = cardsExpandidos[card.id] || false;

                        return (
                          <div 
                            key={card.id} 
                            draggable={!card.bloqueado}
                            onDragStart={() => setDraggedCardId(card.id)}
                            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                            onDrop={(e) => { e.preventDefault(); handleDrop(card.id, card.area); }}
                            className={`p-3 rounded-xl shadow-sm border-l-4 border-y border-r border-slate-200 bg-white transition-all hover:shadow-md flex flex-col ${card.status === 'Concluído' ? 'border-l-[#009e90]' : 'border-l-[#e8601c]'} ${!card.bloqueado ? 'cursor-move' : ''}`}
                          >
                            
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCard(card.id)}>
                              <div className="flex items-center gap-2 overflow-hidden">
                                 <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap ${getTagColor(card.area)}`}>{card.status}</span>
                                 <span className={`text-xs font-bold truncate ${card.status === 'Concluído' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                   {card.titulo || 'Nova Tarefa'}
                                 </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                 <button onClick={(e) => { e.stopPropagation(); atualizarCard(card.id, 'bloqueado', !card.bloqueado); }} className="text-slate-300 hover:text-slate-500 text-xs">{card.bloqueado ? '🔒' : '🔓'}</button>
                                 <span className="text-slate-400 text-[10px] ml-1">{isExpanded ? '▲' : '▼'}</span>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                                <textarea 
                                  disabled={card.bloqueado}
                                  value={card.titulo} 
                                  onChange={(e) => atualizarCard(card.id, 'titulo', e.target.value)}
                                  className={`font-bold text-sm w-full bg-slate-50 p-2 rounded-lg resize-none outline-none border border-slate-200 focus:border-[#009e90] ${card.status === 'Concluído' ? 'text-slate-400' : 'text-slate-800'}`}
                                  rows={2}
                                  placeholder="Nome da Tarefa..."
                                />
                                
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-400 uppercase">Início</span><input disabled={card.bloqueado} type="date" value={card.inicio || ''} onChange={(e) => atualizarCard(card.id, 'inicio', e.target.value)} className="text-[10px] border-b border-slate-200 outline-none text-slate-700 bg-transparent"/></div>
                                  <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-400 uppercase">Previsão</span><input disabled={card.bloqueado} type="date" value={card.fim || ''} onChange={(e) => atualizarCard(card.id, 'fim', e.target.value)} className="text-[10px] border-b border-slate-200 outline-none text-slate-700 bg-transparent"/></div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2">
                                  <select 
                                    disabled={card.bloqueado}
                                    value={card.status} 
                                    onChange={(e) => atualizarCard(card.id, 'status', e.target.value)}
                                    className={`text-[10px] font-bold p-1.5 rounded-lg border outline-none cursor-pointer w-[65%] ${card.status === 'Concluído' ? 'bg-[#eaf8f1] text-[#009e90] border-[#009e90]/20' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                                  >
                                    {colunasKanban.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                  </select>
                                  {!card.bloqueado && <button onClick={() => excluirCard(card.id)} className="text-red-400 text-[10px] font-bold hover:underline">Excluir</button>}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                    })}
                  </div>

                  <button onClick={() => adicionarCard(areaColuna)} className="w-full mt-3 py-2 text-[10px] font-bold text-[#e8601c] bg-[#e8601c]/10 hover:bg-[#e8601c]/20 rounded-xl transition-all">
                    + Adicionar Tarefa
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CONTAS A PAGAR */}
        {abaAtiva === 'contas' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90] text-[#009e90]">Novo Lançamento Financeiro</h2>
              <form onSubmit={salvarDespesa} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição</label>
                  <input type="text" value={novaConta.descricao} onChange={(e) => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-[#009e90]" placeholder="Ex: Conta de Luz, RT, Fornecedor..." required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vencimento (1ª Parc)</label>
                  <input type="date" value={novaConta.vencimento} onChange={(e) => setNovaConta({...novaConta, vencimento: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-[#009e90]" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                  <input type="text" value={maskCurrency(novaConta.valor)} onChange={(e) => setNovaConta({...novaConta, valor: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm text-right font-bold outline-none focus:border-[#009e90]" placeholder="0,00" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Parc / Status</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" max="48" value={novaConta.parcelas} onChange={(e) => setNovaConta({...novaConta, parcelas: e.target.value})} className="w-16 border rounded-xl p-2.5 text-sm text-center outline-none focus:border-[#009e90]" />
                    <select value={novaConta.status} onChange={(e) => setNovaConta({...novaConta, status: e.target.value})} className="flex-1 border rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-[#009e90]">
                      <option value="Pagar">Gasto Real (Vermelho)</option>
                      <option value="Em orçamento">Em orçamento (Azul)</option>
                    </select>
                    <button type="submit" className="bg-[#e8601c] hover:bg-[#d05315] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">SALVAR</button>
                  </div>
                </div>
              </form>
            </section>

            <details className="bg-white rounded-2xl shadow-sm border border-slate-200 group" open>
              <summary className="p-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-50 outline-none border-b border-transparent group-open:border-slate-100 flex justify-between items-center list-none [&::-webkit-details-marker]:hidden transition-all">
                <span className="flex items-center gap-2">
                  <span className="text-[#009e90] text-xs transform group-open:rotate-180 transition-transform duration-200">▼</span> 
                  Histórico de Lançamentos
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-bold">{contasAPagar.length} registos</span>
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="bg-[#eaf8f1] border-b border-[#009e90]/20 text-[10px] uppercase font-bold text-[#009e90]">
                    <tr>
                      <th className="px-6 py-4">Vencimento</th>
                      <th className="px-6 py-4">Descrição da Despesa</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Valor (R$)</th>
                      <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contasAPagar.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-400 italic">Nenhum lançamento efetuado.</td></tr>
                    )}
                    {contasAPagar.map((conta) => (
                      <tr key={conta.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-3">
                          {editandoId === conta.id ? 
                            <input type="date" value={tempEdit.vencimento} onChange={(e) => setTempEdit({...tempEdit, vencimento: e.target.value})} className="border rounded p-1.5 text-xs outline-none focus:border-[#009e90]" /> : 
                            <span className="font-mono font-bold text-slate-600">{conta.vencimento.split('-').reverse().join('/')}</span>
                          }
                        </td>
                        <td className="px-6 py-3">
                          {editandoId === conta.id ? 
                            <input type="text" value={tempEdit.descricao} onChange={(e) => setTempEdit({...tempEdit, descricao: e.target.value})} className="border rounded p-1.5 w-full text-xs outline-none focus:border-[#009e90]" /> : 
                            <span className="font-bold text-slate-800">{conta.descricao}</span>
                          }
                        </td>
                        <td className="px-6 py-3">
                          {editandoId === conta.id ? (
                             <select value={tempEdit.status} onChange={(e) => setTempEdit({...tempEdit, status: e.target.value})} className="text-[10px] font-bold border rounded p-1 outline-none">
                                <option value="Pagar">Pagar</option>
                                <option value="Em orçamento">Em orçamento</option>
                             </select>
                          ) : (
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${conta.status === 'Em orçamento' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                              {conta.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {editandoId === conta.id ? 
                            <input type="text" value={tempEdit.valor} onChange={(e) => setTempEdit({...tempEdit, valor: maskCurrency(e.target.value)})} className="border rounded p-1.5 text-right text-xs font-bold outline-none focus:border-[#009e90]" /> : 
                            <span className={`font-black ${conta.status === 'Em orçamento' ? 'text-blue-600' : 'text-red-600'}`}>R$ {maskCurrency(conta.valor_str)}</span>
                          }
                        </td>
                        <td className="px-6 py-3 text-center space-x-3">
                          {editandoId === conta.id ? (
                            <>
                              <button onClick={() => confirmarEdicao(conta.id)} className="text-[#009e90] font-bold text-xs uppercase hover:underline">Salvar</button>
                              <button onClick={() => setEditandoId(null)} className="text-slate-400 font-bold text-xs uppercase hover:underline">Cancelar</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditandoId(conta.id); setTempEdit({ descricao: conta.descricao, vencimento: conta.vencimento, valor: maskCurrency(conta.valor_str), status: conta.status || 'Pagar' }); }} className="text-[#009e90] font-bold text-xs uppercase hover:underline">Editar</button>
                              <button onClick={() => excluirConta(conta.id)} className="text-red-400 font-bold text-xs uppercase hover:underline">Excluir</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            <div className="overflow-x-auto pb-4 snap-x">
              <div className="flex gap-4 min-w-max">
                {projecao.map((p) => (
                  <div key={p.idx} className={`snap-start w-64 bg-white p-5 rounded-2xl border shadow-sm flex flex-col ${p.saldoFinal < 0 ? 'bg-red-50 border-red-200' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center border-b pb-2 mb-3 border-slate-100">
                      <span className="font-black text-[#009e90] text-lg">{p.nome}</span>
                      <span className="text-[10px] bg-[#e8601c]/10 text-[#e8601c] px-2 py-1 rounded-lg font-bold">Saída R$ {maskCurrency((p.totalSaidasMes * 100).toString())}</span>
                    </div>
                    
                    <details className="group mb-4 flex-1">
                      <summary className="text-[11px] text-[#e8601c] font-bold cursor-pointer hover:underline outline-none mb-2">Ver Relação Lançada ▾</summary>
                      <div className="space-y-1.5 mt-2 h-32 overflow-y-auto pr-1 border-l-2 border-slate-100 pl-2">
                        {p.detalhesGastoReal.length > 0 && (
                          <div className='mb-2 border-b pb-1 border-slate-100'>
                            <p className='text-[9px] font-bold text-red-500 mb-1 uppercase'>Saídas Reais</p>
                            {p.detalhesGastoReal.map((c: any) => (
                              <div key={c.id} className="flex justify-between text-[10px] font-medium text-slate-600 pb-0.5"><span className="truncate w-32">{c.descricao}</span><span className="font-bold text-slate-800">R$ {maskCurrency(c.valor_str)}</span></div>
                            ))}
                          </div>
                        )}
                        {p.detalhesOrcamento.length > 0 && (
                          <div className='border-b border-slate-100 pb-1'>
                            <p className='text-[9px] font-bold text-blue-500 mb-1 uppercase'>Em Orçamento</p>
                            {p.detalhesOrcamento.map((c: any) => (
                              <div key={c.id} className="flex justify-between text-[10px] font-medium text-blue-600 pb-0.5"><span className="truncate w-32">{c.descricao}</span><span className="font-bold text-blue-800">R$ {maskCurrency(c.valor_str)}</span></div>
                            ))}
                          </div>
                        )}
                        {p.totalSaidasMes === 0 && <span className="text-[10px] italic text-slate-400">Sem contas lançadas neste mês.</span>}
                      </div>
                    </details>

                    <div className="border-t border-slate-100 pt-3 mt-auto">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Saldo Final Projetado</p>
                      <p className={`text-xl font-black ${p.saldoFinal < 0 ? 'text-red-600' : 'text-[#009e90]'}`}>R$ {maskCurrency((p.saldoFinal * 100).toString())}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CLIENTES CRM */}
        {abaAtiva === 'clientes' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2 border-[#009e90]">
                <h2 className="text-lg font-bold text-[#009e90]">Novo Paciente / Cliente VIP</h2>
                {/* BOTÃO EXPORTAR EXCEL (CLIENTES) */}
                <button 
                  onClick={() => exportarParaExcel(clientes, [{key:'nome',label:'Nome'}, {key:'whatsapp',label:'WhatsApp'}, {key:'tipo',label:'Medicação'}, {key:'compras',label:'Compras'}, {key:'atendimento',label:'Perfil de Atendimento'}], 'Clientes_VIP')}
                  className="bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 hover:bg-[#009e90] hover:text-white transition-all px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  📥 Exportar Excel
                </button>
              </div>
              <form onSubmit={salvarCliente} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Nome do Cliente" value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" required />
                <input placeholder="WhatsApp (DDD+Número)" value={novoCliente.whatsapp} onChange={e => setNovoCliente({...novoCliente, whatsapp: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" required />
                <input placeholder="Tipo (Contínuo, Manipulação...)" value={novoCliente.tipo} onChange={e => setNovoCliente({...novoCliente, tipo: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" />
                <input placeholder="O que mais compra?" value={novoCliente.compras} onChange={e => setNovoCliente({...novoCliente, compras: e.target.value})} className="border rounded-xl p-2.5 text-sm md:col-span-2 focus:border-[#009e90] outline-none" />
                <textarea placeholder="Perfil de Atendimento (ex: Gosta de explicações, quer brinde...)" value={novoCliente.atendimento} onChange={e => setNovoCliente({...novoCliente, atendimento: e.target.value})} className="border rounded-xl p-2.5 text-sm md:col-span-3 h-20 resize-none focus:border-[#009e90] outline-none" />
                <div className="md:col-span-3 text-right"><button type="submit" className="bg-[#e8601c] hover:bg-[#d05315] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">SALVAR CLIENTE</button></div>
              </form>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.length === 0 && <p className="text-slate-400 text-sm italic col-span-full text-center">Nenhum cliente cadastrado no momento.</p>}
              {clientes.map(cli => (
                <div key={cli.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:border-[#009e90] transition-all">
                  
                  {editandoCliId === cli.id ? (
                    <div className="flex flex-col gap-3 flex-1">
                       <input value={tempEditCli.nome} onChange={e => setTempEditCli({...tempEditCli, nome: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="Nome Completo"/>
                       <input value={tempEditCli.whatsapp} onChange={e => setTempEditCli({...tempEditCli, whatsapp: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="WhatsApp"/>
                       <input value={tempEditCli.tipo} onChange={e => setTempEditCli({...tempEditCli, tipo: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="Tipo de Medicação"/>
                       <input value={tempEditCli.compras} onChange={e => setTempEditCli({...tempEditCli, compras: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="O que mais compra?"/>
                       <textarea value={tempEditCli.atendimento} onChange={e => setTempEditCli({...tempEditCli, atendimento: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90] resize-none h-20" placeholder="Perfil de Atendimento"/>
                       <div className="flex gap-2 mt-2">
                         <button onClick={() => confirmarEdicaoCli(cli.id)} className="bg-[#009e90] text-white font-bold text-xs px-3 py-2 rounded-lg flex-1 hover:bg-[#007a6f]">Salvar</button>
                         <button onClick={() => setEditandoCliId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex-1 hover:bg-slate-300">Cancelar</button>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3 border-b pb-3 border-slate-100">
                        <h3 className="font-black text-[#009e90] text-lg">{cli.nome}</h3>
                        <a 
                          href={`https://wa.me/55${cli.whatsapp.replace(/\D/g,'')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-[#eaf8f1] text-[#009e90] px-3 py-1.5 rounded-full shadow-sm hover:bg-[#009e90] hover:text-white transition-all flex items-center justify-center text-xs font-bold"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                      <div className="space-y-2 text-xs flex-1">
                        <p><span className="text-slate-400 font-bold uppercase tracking-tighter">Tipo:</span> {cli.tipo}</p>
                        <p><span className="text-slate-400 font-bold uppercase tracking-tighter">Compras:</span> {cli.compras}</p>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                          <span className="text-slate-400 font-bold uppercase block mb-1">Perfil:</span>
                          <p className="text-slate-600 italic">"{cli.atendimento}"</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                         <button onClick={() => iniciarEdicaoCli(cli)} className="text-[#009e90] font-bold text-xs hover:underline">Editar</button>
                         <button onClick={() => excluirCliente(cli.id)} className="text-red-400 font-bold text-xs hover:underline">Excluir</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FORNECEDORES */}
        {abaAtiva === 'fornecedores' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4 border-b pb-2 border-[#009e90]">
                <h2 className="text-lg font-bold text-[#009e90]">Novo Fornecedor</h2>
                {/* BOTÃO EXPORTAR EXCEL (FORNECEDORES) */}
                <button 
                  onClick={() => exportarParaExcel(fornecedores, [{key:'nome',label:'Fornecedor'}, {key:'contato',label:'Contato'}, {key:'compras',label:'O que vendem?'}, {key:'observacoes',label:'Observações Gerais'}], 'Fornecedores')}
                  className="bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 hover:bg-[#009e90] hover:text-white transition-all px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  📥 Exportar Excel
                </button>
              </div>
              <form onSubmit={salvarFornecedor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Nome do Fornecedor" value={novoFornecedor.nome} onChange={e => setNovoFornecedor({...novoFornecedor, nome: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" required />
                <input placeholder="Contato (Telefone / Email)" value={novoFornecedor.contato} onChange={e => setNovoFornecedor({...novoFornecedor, contato: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" />
                <input placeholder="O que eles vendem?" value={novoFornecedor.compras} onChange={e => setNovoFornecedor({...novoFornecedor, compras: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" />
                <textarea placeholder="Informações adicionais, prazos, observações..." value={novoFornecedor.observacoes} onChange={e => setNovoFornecedor({...novoFornecedor, observacoes: e.target.value})} className="border rounded-xl p-2.5 text-sm md:col-span-3 h-20 resize-none focus:border-[#009e90] outline-none" />
                <div className="md:col-span-3 text-right"><button type="submit" className="bg-[#e8601c] hover:bg-[#d05315] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">SALVAR FORNECEDOR</button></div>
              </form>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fornecedores.length === 0 && <p className="text-slate-400 text-sm italic col-span-full text-center">Nenhum fornecedor cadastrado no momento.</p>}
              {fornecedores.map(forn => (
                <div key={forn.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:border-[#009e90] transition-all">
                  
                  {editandoFornId === forn.id ? (
                    <div className="flex flex-col gap-3 flex-1">
                       <input value={tempEditForn.nome} onChange={e => setTempEditForn({...tempEditForn, nome: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="Nome do Fornecedor"/>
                       <input value={tempEditForn.contato} onChange={e => setTempEditForn({...tempEditForn, contato: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="Contato"/>
                       <input value={tempEditForn.compras} onChange={e => setTempEditForn({...tempEditForn, compras: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90]" placeholder="O que vendem?"/>
                       <textarea value={tempEditForn.observacoes} onChange={e => setTempEditForn({...tempEditForn, observacoes: e.target.value})} className="border p-2 rounded-lg text-sm outline-none focus:border-[#009e90] resize-none h-20" placeholder="Observações"/>
                       <div className="flex gap-2 mt-2">
                         <button onClick={() => confirmarEdicaoForn(forn.id)} className="bg-[#009e90] text-white font-bold text-xs px-3 py-2 rounded-lg flex-1 hover:bg-[#007a6f]">Salvar</button>
                         <button onClick={() => setEditandoFornId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex-1 hover:bg-slate-300">Cancelar</button>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3 border-b pb-3 border-slate-100">
                        <h3 className="font-black text-[#009e90] text-lg">{forn.nome}</h3>
                        <span className="bg-[#eaf8f1] text-[#009e90] px-2 py-1 rounded-md text-[10px] font-bold uppercase">Fornecedor</span>
                      </div>
                      <div className="space-y-2 text-xs flex-1">
                        <p><span className="text-slate-400 font-bold uppercase tracking-tighter">Contato:</span> {forn.contato}</p>
                        <p><span className="text-slate-400 font-bold uppercase tracking-tighter">Fornece:</span> {forn.compras}</p>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                          <span className="text-slate-400 font-bold uppercase block mb-1">Info:</span>
                          <p className="text-slate-600 italic">"{forn.observacoes}"</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                         <button onClick={() => iniciarEdicaoForn(forn)} className="text-[#009e90] font-bold text-xs hover:underline">Editar</button>
                         <button onClick={() => excluirFornecedor(forn.id)} className="text-red-400 font-bold text-xs hover:underline">Excluir</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}