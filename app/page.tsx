'use client';

import React, { useState } from 'react';

export default function Home() {
  // ================= 1. ESTADOS GERAIS E NAVEGAÇÃO =================
  const [abaAtiva, setAbaAtiva] = useState<'contas' | 'kanban' | 'projecao' | 'clientes' | 'ia'>('kanban');
  const [saldoEmConta, setSaldoEmConta] = useState<string>('24000000');

  // ================= 2. FINANCEIRO DINÂMICO (ZERADO) =================
  const [contasAPagar, setContasAPagar] = useState<any[]>([]); // Array vazio para iniciar zerado

  const [novaConta, setNovaConta] = useState({ descricao: '', vencimento: '', valor: '', parcelas: '1' });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tempEdit, setTempEdit] = useState({ descricao: '', vencimento: '', valor: '' });

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

  const salvarDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    const numParcelas = parseInt(novaConta.parcelas) || 1;
    const novasParcelas = [];
    const dataBase = new Date(novaConta.vencimento + 'T12:00:00');

    for (let i = 0; i < numParcelas; i++) {
      const dataVenc = new Date(dataBase);
      dataVenc.setMonth(dataBase.getMonth() + i);
      const dataString = dataVenc.toISOString().split('T')[0];
      novasParcelas.push({
        id: Date.now() + i,
        descricao: numParcelas > 1 ? `${novaConta.descricao} (${i + 1}/${numParcelas})` : novaConta.descricao,
        vencimento: dataString,
        valorStr: novaConta.valor.replace(/\D/g, ''),
        valorNum: parseCurrency(maskCurrency(novaConta.valor)),
        mesIndex: dataVenc.getMonth()
      });
    }
    setContasAPagar([...contasAPagar, ...novasParcelas].sort((a, b) => a.vencimento.localeCompare(b.vencimento)));
    setNovaConta({ descricao: '', vencimento: '', valor: '', parcelas: '1' });
  };

  const confirmarEdicao = (id: number) => {
    setContasAPagar(contasAPagar.map(c => {
      if (c.id === id) {
        const [ano, mes] = tempEdit.vencimento.split('-');
        return { ...c, descricao: tempEdit.descricao, vencimento: tempEdit.vencimento, valorStr: tempEdit.valor.replace(/\D/g, ''), valorNum: parseCurrency(tempEdit.valor), mesIndex: parseInt(mes, 10) - 1 };
      }
      return c;
    }).sort((a, b) => a.vencimento.localeCompare(b.vencimento)));
    setEditandoId(null);
  };

  const capital = parseCurrency(maskCurrency(saldoEmConta));
  const somarMes = (mIdx: number) => contasAPagar.filter(c => c.mesIndex === mIdx).reduce((acc, curr) => acc + curr.valorNum, 0);

  const mesesInfo = [
    { nome: 'Maio', idx: 4 }, { nome: 'Junho', idx: 5 }, { nome: 'Julho', idx: 6 }, 
    { nome: 'Agosto', idx: 7 }, { nome: 'Setembro', idx: 8 }, { nome: 'Outubro', idx: 9 }
  ];

  let acumulado = capital;
  const projecaoMeses = mesesInfo.map(m => {
    const custo = somarMes(m.idx);
    acumulado -= custo;
    return { ...m, custo, saldo: acumulado, detalhes: contasAPagar.filter(c => c.mesIndex === m.idx) };
  });

  // ================= 3. CRM DE CLIENTES (ZERADO E COM EDIÇÃO) =================
  const [clientes, setClientes] = useState<any[]>([]); // Array vazio
  const [novoCli, setNovoCli] = useState({ nome: '', whats: '', compras: '', perfil: '', tipo: '' });
  
  // Estados para edição do Cliente
  const [editandoCliId, setEditandoCliId] = useState<number | null>(null);
  const [tempEditCli, setTempEditCli] = useState({ nome: '', whats: '', compras: '', perfil: '', tipo: '' });

  const salvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    setClientes([...clientes, { id: Date.now(), ...novoCli }]);
    setNovoCli({ nome: '', whats: '', compras: '', perfil: '', tipo: '' });
  };

  const iniciarEdicaoCliente = (cli: any) => {
    setEditandoCliId(cli.id);
    setTempEditCli({ nome: cli.nome, whats: cli.whats, compras: cli.compras, perfil: cli.perfil, tipo: cli.tipo });
  };

  const confirmarEdicaoCliente = (id: number) => {
    setClientes(clientes.map(c => (c.id === id ? { ...c, ...tempEditCli } : c)));
    setEditandoCliId(null);
  };

  // ================= 4. PROJEÇÃO DE INVESTIMENTO (PONTO DE EQUILÍBRIO) =================
  const [fatEstimado, setFatEstimado] = useState<{ [key: number]: string }>({ 4: '0', 5: '0', 6: '0', 7: '0', 8: '0', 9: '0' });

  const atualizarFaturamento = (idx: number, valor: string) => {
    setFatEstimado({ ...fatEstimado, [idx]: valor.replace(/\D/g, '') });
  };

  // ================= 5. KANBAN 360º (BOARD PRINCIPAL ZERADO) =================
  const colunas = ['Backlog', 'Em andamento', 'Aguardando terceiros', 'Concluído'];
  const tagsSetores = ['Administrativo', 'RH', 'Infraestrutura', 'Suprimentos', 'Financeiro'];
  const [cards, setCards] = useState<any[]>([]); // Board zerado para você organizar

  const adicionarCard = (setor: string) => {
    setCards([...cards, { id: Date.now(), titulo: 'Nova Tarefa', area: setor, status: 'A Fazer', inicio: '', fim: '', bloqueado: false }]);
  };

  const atualizarCard = (id: number, campo: string, valor: string | boolean) => {
    setCards(cards.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  };

  const getTagColor = (area: string) => {
    if (area === 'Administrativo') return 'bg-blue-100 text-blue-700';
    if (area === 'RH') return 'bg-purple-100 text-purple-700';
    if (area === 'Infraestrutura') return 'bg-orange-100 text-orange-700';
    if (area === 'Suprimentos') return 'bg-teal-100 text-teal-700';
    if (area === 'Financeiro') return 'bg-green-100 text-green-700';
    return 'bg-slate-100 text-slate-700';
  };

  // ================= 6. LEITOR IA DE PDF =================
  const [isLendo, setIsLendo] = useState(false);
  const [dadosIA, setDadosIA] = useState<any>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLendo(true);
    setTimeout(() => {
      setDadosIA({
        empresa: 'Maringá Esquadrias e Vidros',
        origem: 'Maringá/PR',
        itens: 'Vidro temperado 8mm, Fachada ACM Prata',
        total: '12.500,00',
        parcelas: '3x',
        prazo: '15 dias'
      });
      setIsLendo(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-10 text-slate-800">
      
      {/* HEADER */}
      <header className="bg-[#009e90] text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Transição - Associadas</h1>
          <p className="text-sm opacity-90">Gestão 360º • Unidade Maringá</p>
        </div>
      </header>

      {/* NAVEGAÇÃO YELLOWLEAF */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex space-x-2 shadow-sm overflow-x-auto">
        <button onClick={() => setAbaAtiva('kanban')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${abaAtiva === 'kanban' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20' : 'text-slate-500'}`}>🏗️ KANBAN OPERAÇÃO</button>
        <button onClick={() => setAbaAtiva('contas')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${abaAtiva === 'contas' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20' : 'text-slate-500'}`}>💸 CONTAS A PAGAR</button>
        <button onClick={() => setAbaAtiva('projecao')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${abaAtiva === 'projecao' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20' : 'text-slate-500'}`}>📈 PROJEÇÃO & INVESTIMENTO</button>
        <button onClick={() => setAbaAtiva('clientes')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${abaAtiva === 'clientes' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20' : 'text-slate-500'}`}>👥 CLIENTES (CRM)</button>
        <button onClick={() => setAbaAtiva('ia')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${abaAtiva === 'ia' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20' : 'text-slate-500'}`}>🤖 LEITOR IA</button>
      </div>

      <main className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* RESUMO TOPO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
              <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Saldo Base em Conta</p>
              <div className="flex items-center text-2xl font-black text-blue-800">
                <span className="mr-1">R$</span>
                <input type="text" value={maskCurrency(saldoEmConta)} onChange={(e) => setSaldoEmConta(e.target.value)} className="bg-transparent w-full outline-none" />
              </div>
            </div>
            {projecaoMeses.slice(0,3).map((p, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Saída em {p.nome}</p>
                <p className="text-2xl font-black text-red-600">R$ {maskCurrency((p.custo * 100).toString())}</p>
              </div>
            ))}
        </div>

        {/* ================= ABA: CONTAS A PAGAR ================= */}
        {abaAtiva === 'contas' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90]">Lançamento de Despesa / Obra</h2>
              <form onSubmit={salvarDespesa} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Descrição</label>
                  <input type="text" value={novaConta.descricao} onChange={(e) => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-[#009e90]" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento</label>
                  <input type="date" value={novaConta.vencimento} onChange={(e) => setNovaConta({...novaConta, vencimento: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm outline-none" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Valor R$</label>
                  <input type="text" value={maskCurrency(novaConta.valor)} onChange={(e) => setNovaConta({...novaConta, valor: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm text-right font-bold" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nº Parcelas</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" value={novaConta.parcelas} onChange={(e) => setNovaConta({...novaConta, parcelas: e.target.value})} className="w-full border rounded-xl p-2.5 text-center text-sm outline-none" />
                    <button type="submit" className="bg-[#e8601c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-[#d05315]">SALVAR</button>
                  </div>
                </div>
              </form>
            </section>

            <div className="overflow-x-auto pb-4 flex gap-4">
              {projecaoMeses.map(p => (
                <div key={p.idx} className="min-w-[240px] bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-[#009e90] border-b pb-2 mb-3">{p.nome}</h3>
                  <div className="space-y-1 mb-4 h-32 overflow-y-auto pr-1">
                    {p.detalhes.map(d => (
                      <div key={d.id} className="flex justify-between text-[10px] font-medium border-b border-slate-50 pb-1">
                        <span className="truncate w-32">{d.descricao}</span>
                        <span className="font-bold text-slate-700">R$ {maskCurrency(d.valorStr)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Saldo Projetado</p>
                    <p className={`text-xl font-black ${p.saldo < 0 ? 'text-red-600' : 'text-[#009e90]'}`}>R$ {maskCurrency((p.saldo * 100).toString())}</p>
                  </div>
                </div>
              ))}
            </div>

            <details className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <summary className="p-4 font-bold text-slate-700 cursor-pointer outline-none hover:bg-slate-50">📂 Clique para Editar Lançamentos</summary>
               <table className="w-full text-sm text-left border-t">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                    <tr><th className="p-4">Vencimento</th><th className="p-4">Descrição</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Ações</th></tr>
                  </thead>
                  <tbody>
                    {contasAPagar.length === 0 && <tr><td colSpan={4} className="text-center p-4 text-slate-400">Sem contas lançadas.</td></tr>}
                    {contasAPagar.map(c => (
                      <tr key={c.id} className="border-b">
                        <td className="p-4">
                          {editandoId === c.id ? <input type="date" value={tempEdit.vencimento} onChange={(e) => setTempEdit({...tempEdit, vencimento: e.target.value})} className="border p-1 text-xs" /> : c.vencimento.split('-').reverse().join('/')}
                        </td>
                        <td className="p-4 font-bold">
                          {editandoId === c.id ? <input type="text" value={tempEdit.descricao} onChange={(e) => setTempEdit({...tempEdit, descricao: e.target.value})} className="border p-1 w-full text-xs" /> : c.descricao}
                        </td>
                        <td className="p-4 text-right text-red-600 font-bold">
                          {editandoId === c.id ? <input type="text" value={tempEdit.valor} onChange={(e) => setTempEdit({...tempEdit, valor: maskCurrency(e.target.value)})} className="border p-1 text-right text-xs" /> : `R$ ${maskCurrency(c.valorStr)}`}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          {editandoId === c.id ? (
                            <><button onClick={() => confirmarEdicao(c.id)} className="text-green-600 font-bold text-xs">Salvar</button> <button onClick={() => setEditandoId(null)} className="text-slate-400 font-bold text-xs">Cancelar</button></>
                          ) : (
                            <><button onClick={() => { setEditandoId(c.id); setTempEdit({ descricao: c.descricao, vencimento: c.vencimento, valor: maskCurrency(c.valorStr) }); }} className="text-blue-500 font-bold text-xs">Editar</button> <button onClick={() => setContasAPagar(contasAPagar.filter(x => x.id !== c.id))} className="text-red-400 font-bold text-xs">Excluir</button></>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </details>
          </div>
        )}

        {/* ABA: KANBAN 360º */}
        {abaAtiva === 'kanban' && (
          <section className="flex gap-4 overflow-x-auto pb-6 items-start h-full">
            {colunas.map(col => (
              <div key={col} className="min-w-[300px] flex-1 bg-slate-100 p-4 rounded-2xl border shadow-inner">
                <h3 className="font-bold text-slate-600 mb-4">{col}</h3>
                {cards.filter(c => c.status === col).map(card => (
                  <div key={card.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 group">
                    <div className="flex justify-between items-start mb-2">
                      <select 
                        disabled={card.bloqueado} 
                        value={card.area} 
                        onChange={(e) => atualizarCard(card.id, 'area', e.target.value)}
                        className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg outline-none ${getTagColor(card.area)}`}
                      >
                        {tagsSetores.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button onClick={() => atualizarCard(card.id, 'bloqueado', !card.bloqueado)} className="text-slate-400 text-sm hover:text-slate-700">{card.bloqueado ? '🔒' : '🔓'}</button>
                    </div>

                    <input 
                      disabled={card.bloqueado}
                      type="text" 
                      value={card.titulo} 
                      onChange={(e) => atualizarCard(card.id, 'titulo', e.target.value)}
                      className={`font-bold text-sm mt-2 w-full bg-transparent outline-none ${card.bloqueado ? '' : 'border-b border-slate-200 focus:border-[#009e90]'}`}
                      placeholder="Descreva a tarefa..."
                    />

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 gap-2">
                       <select 
                         disabled={card.bloqueado} 
                         value={card.status} 
                         onChange={(e) => atualizarCard(card.id, 'status', e.target.value)}
                         className="text-[10px] font-bold bg-slate-50 border rounded p-1 outline-none flex-1"
                       >
                         {colunas.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       {!card.bloqueado && <button onClick={() => setCards(cards.filter(x => x.id !== card.id))} className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded hover:bg-red-100">Excluir</button>}
                    </div>
                  </div>
                ))}
                <button onClick={() => adicionarCard(col)} className="w-full py-2 border-2 border-dashed rounded-xl text-slate-400 text-xs font-bold hover:bg-white transition-all">+ Nova Tarefa</button>
              </div>
            ))}
          </section>
        )}

        {/* ABA: PROJEÇÃO & PONTO DE EQUILÍBRIO */}
        {abaAtiva === 'projecao' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
             <h2 className="text-lg font-bold mb-6 border-b pb-2 border-[#009e90]">Simulador de Ponto de Equilíbrio (Break-even)</h2>
             <div className="flex gap-6 h-64 items-end border-b border-slate-200 pb-4 overflow-x-auto">
                {projecaoMeses.map(m => {
                  const fat = parseCurrency(maskCurrency(fatEstimado[m.idx] || '0'));
                  const maxVal = Math.max(fat, m.custo, 1);
                  const hFat = (fat / maxVal) * 200;
                  const hCusto = (m.custo / maxVal) * 200;
                  return (
                    <div key={m.idx} className="flex-1 min-w-[80px] flex flex-col items-center gap-2">
                       <div className="flex gap-1 items-end">
                          <div className="w-6 bg-green-400 rounded-t shadow-sm" style={{ height: hFat }}></div>
                          <div className="w-6 bg-red-400 rounded-t shadow-sm" style={{ height: hCusto }}></div>
                       </div>
                       <p className="text-[10px] font-bold text-slate-500 uppercase">{m.nome}</p>
                       <input type="text" value={maskCurrency(fatEstimado[m.idx] || '0')} onChange={(e) => atualizarFaturamento(m.idx, e.target.value)} className="w-20 border rounded p-1 text-[10px] text-center font-bold text-green-700 bg-green-50" placeholder="Fat. Estimado" />
                    </div>
                  );
                })}
             </div>
             <p className="text-xs text-slate-500 mt-4 italic">* Digite sua meta de faturamento nos campos verdes. Quando a barra verde superar a vermelha (despesas fixas + obras daquele mês), você atingiu o Break-even.</p>
          </section>
        )}

        {/* ABA: CLIENTES (CRM) COM OPÇÕES DE EDITAR/ALTERAR */}
        {abaAtiva === 'clientes' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl border p-6 shadow-sm">
               <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90]">Novo Cliente / Paciente VIP</h2>
               <form onSubmit={salvarCliente} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Nome Completo" value={novoCli.nome} onChange={e => setNovoCli({...novoCli, nome: e.target.value})} className="border p-2.5 rounded-xl text-sm outline-none focus:border-[#009e90]" required />
                  <input placeholder="WhatsApp (DDD+Número)" value={novoCli.whats} onChange={e => setNovoCli({...novoCli, whats: e.target.value})} className="border p-2.5 rounded-xl text-sm outline-none focus:border-[#009e90]" required />
                  <input placeholder="Medicação de Uso" value={novoCli.tipo} onChange={e => setNovoCli({...novoCli, tipo: e.target.value})} className="border p-2.5 rounded-xl text-sm outline-none focus:border-[#009e90]" />
                  <textarea placeholder="Preferência de Atendimento e Compras (ex: Gosta de áudio, compra fitoterápicos...)" value={novoCli.perfil} onChange={e => setNovoCli({...novoCli, perfil: e.target.value})} className="border p-2.5 rounded-xl text-sm md:col-span-3 h-20 outline-none focus:border-[#009e90] resize-none" />
                  <button type="submit" className="bg-[#e8601c] text-white font-bold p-2.5 rounded-xl shadow hover:bg-[#d05315] md:col-span-3">CADASTRAR CLIENTE</button>
               </form>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {clientes.length === 0 && <p className="text-slate-400 text-sm italic col-span-full text-center">Nenhum cliente cadastrado.</p>}
               {clientes.map(cli => (
                 <div key={cli.id} className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col">
                    {editandoCliId === cli.id ? (
                      // MODO EDIÇÃO DO CLIENTE
                      <div className="space-y-3">
                        <input type="text" value={tempEditCli.nome} onChange={(e) => setTempEditCli({...tempEditCli, nome: e.target.value})} className="w-full border p-2 rounded text-sm font-bold" placeholder="Nome" />
                        <input type="text" value={tempEditCli.whats} onChange={(e) => setTempEditCli({...tempEditCli, whats: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="WhatsApp" />
                        <input type="text" value={tempEditCli.tipo} onChange={(e) => setTempEditCli({...tempEditCli, tipo: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Tipo" />
                        <textarea value={tempEditCli.perfil} onChange={(e) => setTempEditCli({...tempEditCli, perfil: e.target.value})} className="w-full border p-2 rounded text-sm h-16 resize-none" placeholder="Perfil" />
                        <div className="flex gap-2">
                          <button onClick={() => confirmarEdicaoCliente(cli.id)} className="bg-[#009e90] text-white text-xs font-bold px-3 py-2 rounded flex-1">Salvar</button>
                          <button onClick={() => setEditandoCliId(null)} className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded flex-1">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      // MODO VISUALIZAÇÃO DO CLIENTE
                      <>
                        <div className="flex justify-between items-start mb-3 border-b pb-2">
                           <h3 className="font-black text-slate-800 text-lg">{cli.nome}</h3>
                           {/* A Tag nativa de link (<a>) garante o direcionamento perfeito no React */}
                           <a href={`https://wa.me/55${cli.whats.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow hover:bg-green-600 transition-all flex items-center gap-1">
                             💬 Chamar
                           </a>
                        </div>
                        <p className="text-xs mt-2 text-slate-600"><strong>Medicação/Tipo:</strong> {cli.tipo}</p>
                        <p className="text-xs text-slate-500 italic mt-2 flex-1">"{cli.perfil}"</p>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-3">
                          <button onClick={() => iniciarEdicaoCliente(cli)} className="text-blue-500 font-bold text-xs hover:underline">Editar</button>
                          <button onClick={() => setClientes(clientes.filter(c => c.id !== cli.id))} className="text-red-400 font-bold text-xs hover:underline">Excluir</button>
                        </div>
                      </>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* ABA: LEITOR IA */}
        {abaAtiva === 'ia' && (
          <section className="bg-white rounded-2xl border p-12 text-center shadow-sm">
             <h2 className="text-xl font-bold mb-4 text-[#009e90]">Leitor de Orçamentos com IA</h2>
             <div 
               onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} 
               onDrop={handleDrop}
               className={`border-4 border-dashed rounded-3xl p-16 flex flex-col items-center transition-all cursor-pointer ${isLendo ? 'bg-orange-50 border-orange-400 animate-pulse' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}
             >
                <span className="text-5xl mb-4">{isLendo ? '⏳' : '📄'}</span>
                <p className="font-bold text-slate-500">{isLendo ? 'A IA está lendo os itens do orçamento...' : 'Arraste o PDF ou Word do fornecedor aqui'}</p>
             </div>

             {dadosIA && !isLendo && (
               <div className="mt-8 text-left bg-[#eaf8f1] p-6 rounded-2xl border border-[#009e90]/30 max-w-3xl mx-auto shadow-sm">
                  <h3 className="font-black text-[#009e90] text-lg mb-4">✅ Dados Extraídos com Sucesso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl">
                     <p><strong>🏢 Empresa:</strong> {dadosIA.empresa}</p>
                     <p><strong>📍 Origem:</strong> {dadosIA.origem}</p>
                     <p className="md:col-span-2"><strong>📦 Itens Cotados:</strong> {dadosIA.itens}</p>
                     <p className="text-red-600 font-bold text-lg"><strong>💰 Total:</strong> R$ {dadosIA.total}</p>
                     <p><strong>💳 Condição:</strong> {dadosIA.parcelas}</p>
                     <p><strong>🕒 Prazo:</strong> {dadosIA.prazo}</p>
                  </div>
                  <button className="mt-6 w-full bg-[#009e90] text-white font-bold py-3 rounded-xl hover:bg-[#008276] transition-colors shadow-md">
                    LANÇAR DIRETO NO CONTAS A PAGAR (EM BREVE)
                  </button>
               </div>
             )}
          </section>
        )}

      </main>
    </div>
  );
}