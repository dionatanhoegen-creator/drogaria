'use client';

import React, { useState } from 'react';

export default function Home() {
  // ================= 1. ESTADOS FINANCEIROS =================
  const [saldoEmConta, setSaldoEmConta] = useState<string>('24000000');
  const [abaAtiva, setAbaAtiva] = useState<'contas' | 'kanban' | 'clientes' | 'ia'>('kanban');

  // Lançamentos Zerados
  const [contasAPagar, setContasAPagar] = useState<any[]>([]);

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
    { nome: 'Agosto', idx: 7 }, { nome: 'Setembro', idx: 8 }, { nome: 'Outubro', idx: 9 },
    { nome: 'Novembro', idx: 10 }, { nome: 'Dezembro', idx: 11 }
  ];

  let caixaAcumulado = capital;
  const gastosPreMaio = contasAPagar.filter(c => c.mesIndex < 4).reduce((acc, curr) => acc + curr.valorNum, 0);
  caixaAcumulado -= gastosPreMaio;

  const projecao = mesesInfo.map((mesObj) => {
    const totalMes = somarMes(mesObj.idx);
    caixaAcumulado -= totalMes;
    return { ...mesObj, totalMes, saldoFinal: caixaAcumulado, detalhes: contasAPagar.filter(c => c.mesIndex === mesObj.idx) };
  });

  // ================= 2. ESTADOS DE CLIENTES (CRM) =================
  // Lista Zerada
  const [clientes, setClientes] = useState<any[]>([]);
  const [novoCliente, setNovoCliente] = useState({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });

  // Estados para edição do Cliente
  const [editandoCliId, setEditandoCliId] = useState<number | null>(null);
  const [tempEditCli, setTempEditCli] = useState({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });

  const salvarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    setClientes([...clientes, { id: Date.now(), ...novoCliente }]);
    setNovoCliente({ nome: '', whatsapp: '', compras: '', atendimento: '', tipo: '' });
  };

  const iniciarEdicaoCli = (cli: any) => {
    setEditandoCliId(cli.id);
    setTempEditCli({ nome: cli.nome, whatsapp: cli.whatsapp, compras: cli.compras, atendimento: cli.atendimento, tipo: cli.tipo });
  };

  const confirmarEdicaoCli = (id: number) => {
    setClientes(clientes.map(c => c.id === id ? { ...c, ...tempEditCli } : c));
    setEditandoCliId(null);
  };

  // ================= 3. KANBAN 360º (BOARD PRINCIPAL) =================
  const colunasKanban = ['Backlog', 'Em andamento', 'Aguardando terceiros', 'Concluído'];
  const tagsSetores = ['Administrativo', 'RH', 'Infraestrutura', 'Suprimentos', 'Financeiro'];
  const [dataInauguracao, setDataInauguracao] = useState('');

  // Kanban Zerado
  const [cards, setCards] = useState<any[]>([]);

  const adicionarCard = (status: string) => {
    setCards([...cards, { id: Date.now(), titulo: 'Nova Tarefa', area: 'Infraestrutura', status, bloqueado: false }]);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-10 text-slate-800">
      
      {/* CABEÇALHO */}
      <header className="bg-[#009e90] text-white p-4 shadow-md flex justify-between items-center border-b-4 border-[#e8601c]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Transição - Associadas</h1>
          <p className="text-sm opacity-90">Unidade Maringá, PR • Gestão Operacional Integrada</p>
        </div>
      </header>

      {/* NAVEGAÇÃO ESTILO YELLOWLEAF CRM */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex space-x-4 shadow-sm overflow-x-auto">
        <button onClick={() => setAbaAtiva('kanban')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'kanban' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>📋</span> BOARD OPERACIONAL</button>
        <button onClick={() => setAbaAtiva('contas')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'contas' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>💸</span> CONTAS A PAGAR</button>
        <button onClick={() => setAbaAtiva('clientes')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${abaAtiva === 'clientes' ? 'bg-[#eaf8f1] text-[#009e90] border border-[#009e90]/20 shadow-sm' : 'text-gray-500 hover:bg-slate-100'}`}><span>👥</span> GESTÃO DE CLIENTES</button>
      </div>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* RESUMO SIMPLIFICADO NO TOPO */}
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

        {/* ================= ABA 1: BOARD OPERACIONAL (KANBAN) ================= */}
        {abaAtiva === 'kanban' && (
          <section className="flex gap-4 overflow-x-auto pb-6 items-start h-full">
            {colunasKanban.map(coluna => (
              <div key={coluna} className="min-w-[320px] flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                
                <h3 className="font-bold text-white bg-[#009e90] px-4 py-3 rounded-xl mb-4 flex justify-between items-center shadow-md">
                  {coluna}
                  <span className="bg-white text-[#009e90] rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-sm">
                    {cards.filter(c => c.status === coluna).length}
                  </span>
                </h3>

                {cards.filter(c => c.status === coluna).map(card => (
                  <div key={card.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-[#e8601c] border-y border-r border-slate-200 mb-3 group transition-all hover:border-[#009e90] hover:shadow-md">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getTagColor(card.area)}`}>{card.area}</span>
                    <p className="font-bold text-sm mt-2 text-slate-800">{card.titulo}</p>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
                       <button className="text-[10px] text-slate-500 hover:text-[#e8601c] font-bold transition-colors">📅 Definir Prazo</button>
                       <button onClick={() => setCards(cards.map(c => c.id === card.id ? {...c, status: 'Concluído'} : c))} className="text-[10px] text-white bg-[#009e90] px-3 py-1.5 rounded-full font-bold hover:bg-[#007a6f] transition-colors shadow-sm">✓ Finalizar</button>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => adicionarCard(coluna)} className="w-full mt-2 py-3 border-2 border-dashed border-[#009e90]/40 rounded-xl text-[#009e90] text-xs font-bold hover:bg-[#eaf8f1] transition-all">
                  + Nova Tarefa
                </button>
              </div>
            ))}
          </section>
        )}

        {/* ================= ABA 2: CONTAS A PAGAR ================= */}
        {abaAtiva === 'contas' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90] text-[#009e90]">Novo Lançamento Financeiro</h2>
              <form onSubmit={salvarDespesa} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
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
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nº Parcelas</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" max="48" value={novaConta.parcelas} onChange={(e) => setNovaConta({...novaConta, parcelas: e.target.value})} className="w-full border rounded-xl p-2.5 text-sm text-center outline-none focus:border-[#009e90]" />
                    <button type="submit" className="bg-[#e8601c] hover:bg-[#d05315] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">SALVAR</button>
                  </div>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#eaf8f1] border-b border-[#009e90]/20 text-[10px] uppercase font-bold text-[#009e90]">
                  <tr>
                    <th className="px-6 py-4">Vencimento</th>
                    <th className="px-6 py-4">Descrição da Despesa</th>
                    <th className="px-6 py-4 text-right">Valor (R$)</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contasAPagar.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-slate-400 italic">Nenhum lançamento efetuado.</td></tr>
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
                      <td className="px-6 py-3 text-right">
                        {editandoId === conta.id ? 
                          <input type="text" value={tempEdit.valor} onChange={(e) => setTempEdit({...tempEdit, valor: maskCurrency(e.target.value)})} className="border rounded p-1.5 text-right text-xs font-bold outline-none focus:border-[#009e90]" /> : 
                          <span className="font-black text-[#e8601c]">R$ {maskCurrency(conta.valorStr)}</span>
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
                            <button onClick={() => { setEditandoId(conta.id); setTempEdit({ descricao: conta.descricao, vencimento: conta.vencimento, valor: maskCurrency(conta.valorStr) }); }} className="text-[#009e90] font-bold text-xs uppercase hover:underline">Editar</button>
                            <button onClick={() => setContasAPagar(contasAPagar.filter(c => c.id !== conta.id))} className="text-red-400 font-bold text-xs uppercase hover:underline">Excluir</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {projecao.map((p) => (
                  <div key={p.idx} className={`w-64 bg-white p-5 rounded-2xl border shadow-sm flex flex-col ${p.saldoFinal < 0 ? 'bg-red-50 border-red-200' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-center border-b pb-2 mb-3 border-slate-100">
                      <span className="font-black text-[#009e90] text-lg">{p.nome}</span>
                      <span className="text-[10px] bg-[#e8601c]/10 text-[#e8601c] px-2 py-1 rounded-lg font-bold">Saída R$ {maskCurrency((p.totalMes * 100).toString())}</span>
                    </div>
                    
                    <details className="group mb-4 flex-1">
                      <summary className="text-[11px] text-[#e8601c] font-bold cursor-pointer hover:underline outline-none mb-2">Ver Relação Lançada ▾</summary>
                      <div className="space-y-2 mt-2 max-h-32 overflow-y-auto pr-1 border-l-2 border-slate-100 pl-2">
                        {p.detalhes.map(c => (
                          <div key={c.id} className="flex justify-between text-[10px] font-medium text-slate-600">
                            <span className="truncate w-32">{c.descricao}</span>
                            <span className="font-bold text-slate-800">R$ {maskCurrency(c.valorStr)}</span>
                          </div>
                        ))}
                        {p.detalhes.length === 0 && <span className="text-[10px] italic text-slate-400">Sem contas lançadas neste mês.</span>}
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

        {/* ================= ABA 3: GESTÃO DE CLIENTES ================= */}
        {abaAtiva === 'clientes' && (
          <div className="flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold mb-4 border-b pb-2 border-[#009e90] text-[#009e90]">Novo Paciente / Cliente VIP</h2>
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
              {clientes.length === 0 && <p className="text-slate-400 text-sm italic col-span-full">Nenhum cliente cadastrado no momento.</p>}
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
                        {/* LINK DO WHATSAPP CORRIGIDO (TAG A) */}
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