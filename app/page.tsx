'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  // ================= 1. ESTADOS FINANCEIROS (FLUXO COMPLETO) =================
  const [saldoEmConta, setSaldoEmConta] = useState<string>('24000000');
  const [abaAtiva, setAbaAtiva] = useState<'kanban' | 'contas' | 'clientes'>('kanban');

  // Listas Iniciando Zeradas para Supabase
  const [contasAPagar, setContasAPagar] = useState<any[]>([]);
  
  const [novaConta, setNovaConta] = useState({ descricao: '', vencimento: '', valor: '', parcelas: '1' });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tempEdit, setTempEdit] = useState({ descricao: '', vencimento: '', valor: '' });

  // Mascaras de Moeda
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

  // Lógica de Salvar com Parcelamento Automático
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

  // Cálculo da Projeção de Caixa
  const capital = parseCurrency(maskCurrency(saldoEmConta));
  const somarMes = (mIdx: number) => contasAPagar.filter(c => c.mesIndex === mIdx).reduce((acc, curr) => acc + curr.valorNum, 0);

  const mesesInfo = [
    { nome: 'Maio', idx: 4 }, { nome: 'Junho', idx: 5 }, { nome: 'Julho', idx: 6 }, 
    { nome: 'Agosto', idx: 7 }, { nome: 'Setembro', idx: 8 }, { nome: 'Outubro', idx: 9 },
    { nome: 'Novembro', idx: 10 }, { nome: 'Dezembro', idx: 11 }
  ];

  let caixaAcumulado = capital;
  const projecao = mesesInfo.map((mesObj) => {
    const totalMes = somarMes(mesObj.idx);
    caixaAcumulado -= totalMes;
    return { ...mesObj, totalMes, saldoFinal: caixaAcumulado, detalhes: contasAPagar.filter(c => c.mesIndex === mesObj.idx) };
  });

  // ================= 2. ESTADOS DE CLIENTES (CRM COMPLETO) =================
  const [clientes, setClientes] = useState<any[]>([]);
  const [novoCliente, setNovoCliente] = useState({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });
  
  // Edição de Cliente
  const [editandoCliId, setEditandoCliId] = useState<number | null>(null);
  const [tempEditCli, setTempEditCli] = useState({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });

  const salvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    setClientes([...clientes, { id: Date.now(), ...novoCliente }]);
    setNovoCliente({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });
  };

  const iniciarEdicaoCli = (cli: any) => {
    setEditandoCliId(cli.id);
    setTempEditCli({ ...cli });
  };

  const confirmarEdicaoCli = (id: number) => {
    setClientes(clientes.map(c => c.id === id ? { ...c, ...tempEditCli } : c));
    setEditandoCliId(null);
  };

  // ================= 3. KANBAN POR SETORES (SISTEMA DE RAIAS COMPLETO) =================
  const setoresKanban = ['Administrativo', 'RH', 'Infraestrutura', 'Suprimentos', 'Financeiro'];
  const statusOptions = ['A Fazer', 'Em andamento', 'Aguardando terceiros', 'Concluído'];
  const [dataInauguracao, setDataInauguracao] = useState('');

  // Cards Iniciados Vazios para você alimentar o banco
  const [cards, setCards] = useState<any[]>([]);

  const adicionarCard = (setor: string) => {
    setCards([...cards, { id: Date.now(), titulo: 'Nova Atividade', setor, inicio: '', fim: '', status: 'A Fazer', bloqueado: false }]);
  };

  const atualizarCard = (id: number, campo: string, valor: any) => {
    setCards(cards.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  };

  const getTagColor = (area: string) => {
    switch (area) {
      case 'Administrativo': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'RH': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Infraestrutura': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Suprimentos': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Financeiro': return 'bg-[#eaf8f1] text-[#009e90] border-[#009e90]/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Semáforo de Progresso
  const totalCards = cards.length;
  const concluidosCards = cards.filter(c => c.status === 'Concluído').length;
  const progressoGeral = totalCards === 0 ? 0 : Math.round((concluidosCards / totalCards) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-10 text-slate-800">
      
      {/* CABEÇALHO ASSOCIADAS */}
      <header className="bg-[#009e90] text-white p-4 shadow-md flex justify-between items-center border-b-4 border-[#e8601c]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Transição - Associadas</h1>
          <p className="text-sm opacity-90">Unidade Maringá, PR • Gestão Operacional Integrada</p>
        </div>
      </header>

      {/* NAVEGAÇÃO */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex space-x-4 shadow-sm overflow-x-auto">
        <button onClick={() => setAbaAtiva('kanban')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'kanban' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}>📋 BOARD OPERACIONAL</button>
        <button onClick={() => setAbaAtiva('contas')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'contas' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}>💸 CONTAS A PAGAR</button>
        <button onClick={() => setAbaAtiva('clientes')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'clientes' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>👥</span> GESTÃO DE CLIENTES</button>
      </div>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* RESUMO DE CAIXA NO TOPO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#eaf8f1] p-5 rounded-2xl border border-[#009e90]/30 shadow-sm">
              <p className="text-[10px] text-[#009e90] font-bold uppercase mb-1">Saldo Base (240k)</p>
              <div className="flex items-center text-2xl font-black text-[#009e90]">
                <span className="mr-1">R$</span>
                <input type="text" value={maskCurrency(saldoEmConta)} onChange={(e) => setSaldoEmConta(e.target.value)} className="bg-transparent w-full outline-none" />
              </div>
            </div>
            {projecao.slice(0, 3).map((p, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-[#e8601c]/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#e8601c]/50"></div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Pagar em {p.nome}</p>
                <p className="text-2xl font-black text-[#e8601c]">R$ {maskCurrency((p.totalMes * 100).toString())}</p>
              </div>
            ))}
        </div>

        {/* ================= ABA 1: KANBAN POR SETORES ================= */}
        {abaAtiva === 'kanban' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-6 border-b pb-4 border-[#009e90]">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Board Principal de Implantação</h2>
                <p className="text-xs text-slate-500 mt-1">Gestão dividida por Macro Áreas (Setores).</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Meta Inauguração:</label>
                  <input type="date" value={dataInauguracao} onChange={(e) => setDataInauguracao(e.target.value)} className="text-sm bg-transparent font-black outline-none text-[#009e90]" />
                </div>
                <div className="px-4 py-2 rounded-xl text-xs font-bold bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20">
                  Progresso: {progressoGeral}%
                </div>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 items-start h-full">
              {setoresKanban.map(setor => (
                <div key={setor} className="min-w-[320px] flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner flex flex-col max-h-[750px]">
                  <h3 className="font-bold text-white bg-[#009e90] px-4 py-3 rounded-xl mb-4 flex justify-between items-center shadow-md">
                    {setor}
                    <span className="bg-white text-[#009e90] rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-sm">
                      {cards.filter(c => c.setor === setor).length}
                    </span>
                  </h3>

                  <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                    {cards.filter(c => c.setor === setor).map(card => (
                      <div key={card.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-[#e8601c] border-y border-r border-slate-200 group">
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getTagColor(card.setor)}`}>{card.setor}</span>
                           <button onClick={() => atualizarCard(card.id, 'bloqueado', !card.bloqueado)} className="text-slate-400 text-xs">{card.bloqueado ? '🔒' : '🔓'}</button>
                        </div>
                        <textarea 
                          disabled={card.bloqueado} 
                          value={card.titulo} 
                          onChange={(e) => atualizarCard(card.id, 'titulo', e.target.value)}
                          className="font-bold text-sm w-full bg-transparent resize-none outline-none border-b border-transparent focus:border-[#009e90]"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                           <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-400 uppercase">Início</span><input type="date" value={card.inicio} onChange={(e) => atualizarCard(card.id, 'inicio', e.target.value)} className="text-[10px] border-b outline-none"/></div>
                           <div className="flex flex-col"><span className="text-[8px] font-bold text-slate-400 uppercase">Fim</span><input type="date" value={card.fim} onChange={(e) => atualizarCard(card.id, 'fim', e.target.value)} className="text-[10px] border-b outline-none"/></div>
                        </div>
                        <select 
                           value={card.status} 
                           onChange={(e) => atualizarCard(card.id, 'status', e.target.value)}
                           className="w-full mt-4 text-[10px] font-bold bg-slate-50 p-1.5 rounded border outline-none"
                        >
                          {statusOptions.map(op => <option key={op} value={op}>{op}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => adicionarCard(setor)} className="w-full mt-4 py-2 border-2 border-dashed border-[#009e90]/40 rounded-xl text-[#009e90] text-xs font-bold hover:bg-[#eaf8f1] transition-all">+ Nova Atividade</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= ABA 2: CONTAS A PAGAR (FORMATO COMPLETO) ================= */}
        {abaAtiva === 'contas' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90] text-[#009e90]">Novo Lançamento Financeiro</h2>
              <form onSubmit={salvarDespesa} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase">Descrição</label><input type="text" value={novaConta.descricao} onChange={(e) => setNovaConta({...novaConta, descricao: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" required /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase">1ª Parcela</label><input type="date" value={novaConta.vencimento} onChange={(e) => setNovaConta({...novaConta, vencimento: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm outline-none" required /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase">Valor Parcela</label><input type="text" value={maskCurrency(novaConta.valor)} onChange={(e) => setNovaConta({...novaConta, valor: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm text-right font-bold" placeholder="0,00" required /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase">Qtd Parc</label><div className="flex gap-2"><input type="number" min="1" value={novaConta.parcelas} onChange={(e) => setNovaConta({...novaConta, parcelas: e.target.value})} className="w-full border rounded-xl p-2.5 text-center text-sm"/><button type="submit" className="bg-[#e8601c] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow hover:bg-[#d05315]">SALVAR</button></div></div>
              </form>
            </section>

            <div className="overflow-x-auto pb-4 flex gap-4">
              {projecao.map((p) => (
                <div key={p.idx} className={`min-w-[260px] bg-white p-5 rounded-2xl border shadow-sm flex flex-col ${p.saldoFinal < 0 ? 'bg-red-50 border-red-200' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-center border-b pb-2 mb-3 border-slate-100">
                    <span className="font-black text-[#009e90] text-lg">{p.nome}</span>
                    <span className="text-[10px] bg-[#e8601c]/10 text-[#e8601c] px-2 py-1 rounded-lg font-bold">Pagar R$ {maskCurrency((p.totalMes * 100).toString())}</span>
                  </div>
                  <div className="space-y-1.5 mb-4 h-36 overflow-y-auto pr-1">
                    {p.detalhes.map(c => (
                      <div key={c.id} className="flex justify-between text-[10px] font-medium text-slate-600 border-b border-slate-50 pb-1">
                        <span className="truncate w-32">{c.descricao}</span>
                        <span className="font-bold text-slate-800">R$ {maskCurrency(c.valorStr)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-auto"><p className="text-[9px] font-bold text-slate-400 uppercase">Saldo Projetado</p><p className={`text-xl font-black ${p.saldoFinal < 0 ? 'text-red-600' : 'text-[#009e90]'}`}>R$ {maskCurrency((p.saldoFinal * 100).toString())}</p></div>
                </div>
              ))}
            </div>

            <details className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
               <summary className="p-4 font-bold text-slate-700 cursor-pointer outline-none hover:bg-slate-50">📂 Editar/Excluir Lançamentos Individuais</summary>
               <table className="w-full text-sm text-left border-t border-slate-100">
                  <thead className="bg-[#eaf8f1] text-[#009e90] text-[10px] uppercase font-bold">
                    <tr><th className="p-4">Data</th><th className="p-4">Descrição</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contasAPagar.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-4 font-mono">{c.vencimento.split('-').reverse().join('/')}</td>
                        <td className="p-4 font-bold">{c.descricao}</td>
                        <td className="p-4 text-right text-red-600 font-black">R$ {maskCurrency(c.valorStr)}</td>
                        <td className="p-4 text-center space-x-3">
                          <button onClick={() => setContasAPagar(contasAPagar.filter(x => x.id !== c.id))} className="text-red-400 font-bold text-xs uppercase hover:underline">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </details>
          </div>
        )}

        {/* ================= ABA 3: GESTÃO DE CLIENTES (CRM DEFINITIVO) ================= */}
        {abaAtiva === 'clientes' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90] text-[#009e90]">Novo Cliente Associado</h2>
              <form onSubmit={salvarCliente} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Nome do Cliente" value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" required />
                <input placeholder="WhatsApp (44999998888)" value={novoCliente.whatsapp} onChange={e => setNovoCliente({...novoCliente, whatsapp: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" required />
                <input placeholder="Medicação / Tipo" value={novoCliente.tipo} onChange={e => setNovoCliente({...novoCliente, tipo: e.target.value})} className="border rounded-xl p-2.5 text-sm focus:border-[#009e90] outline-none" />
                <textarea placeholder="Perfil e Preferências de Atendimento..." value={novoCliente.atendimento} onChange={e => setNovoCliente({...novoCliente, atendimento: e.target.value})} className="border rounded-xl p-2.5 text-sm md:col-span-3 h-20 resize-none outline-none focus:border-[#009e90]" />
                <div className="md:col-span-3 text-right"><button type="submit" className="bg-[#e8601c] hover:bg-[#d05315] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">CADASTRAR CLIENTE</button></div>
              </form>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes.map(cli => (
                <div key={cli.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col group hover:border-[#009e90] transition-all relative">
                  
                  {editandoCliId === cli.id ? (
                    <div className="space-y-3">
                      <input value={tempEditCli.nome} onChange={e => setTempEditCli({...tempEditCli, nome: e.target.value})} className="w-full border p-2 rounded text-sm"/>
                      <input value={tempEditCli.whatsapp} onChange={e => setTempEditCli({...tempEditCli, whatsapp: e.target.value})} className="w-full border p-2 rounded text-sm"/>
                      <div className="flex gap-2">
                        <button onClick={() => confirmarEdicaoCli(cli.id)} className="bg-[#009e90] text-white text-xs font-bold p-2 rounded flex-1">Salvar</button>
                        <button onClick={() => setEditandoCliId(null)} className="bg-slate-200 text-xs font-bold p-2 rounded flex-1">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3 border-b pb-3 border-slate-100">
                        <h3 className="font-black text-[#009e90] text-lg">{cli.nome}</h3>
                        {/* LINK WHATSAPP FIXO (<a> garante abertura no browser) */}
                        <a 
                          href={`https://wa.me/55${cli.whatsapp.replace(/\D/g,'')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-[#eaf8f1] text-[#009e90] p-2.5 rounded-full shadow-sm hover:bg-[#009e90] hover:text-white transition-all flex items-center justify-center text-xs font-bold"
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                      <div className="space-y-2 text-xs flex-1">
                        <p><span className="text-slate-400 font-bold uppercase tracking-tighter">Medicação:</span> {cli.tipo}</p>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                          <span className="text-slate-400 font-bold uppercase block mb-1">Perfil:</span>
                          <p className="text-slate-600 italic">"{cli.atendimento}"</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                         <button onClick={() => iniciarEdicaoCli(cli)} className="text-[#009e90] font-bold text-xs hover:underline">Editar</button>
                         <button onClick={() => setClientes(clientes.filter(c => c.id !== cli.id))} className="text-red-400 font-bold text-xs hover:underline">Excluir</button>
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