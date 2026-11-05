"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  Calendar, 
  MessageCircle, 
  Sparkles, 
  Search,
  CheckCircle2
} from "lucide-react";

interface Imovel {
  id: string;
  nome: string;
  regiao: string;
  cidade: string;
  endereco?: string;
  faixa_preco: number;
  quartos: string;
  status_obra: string;
  previsao_entrega?: string;
  imagem_capa: string;
  descricao: string;
}

export default function VitrinePage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroQuartos, setFiltroQuartos] = useState("Todos");

  // Seu número do WhatsApp para receber os leads diretamente (com DDD)
  const telefoneWhatsApp = "5521999999999"; 

  useEffect(() => {
    carregarImoveis();
  }, []);

  async function carregarImoveis() {
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setImoveis(data);
    } catch (err) {
      console.error("Erro ao carregar imóveis na vitrine:", err);
    } finally {
      setCarregando(false);
    }
  }

  // Cálculo automático do parcelamento regressivo
  function calcularParcelas(anoMes?: string) {
    if (!anoMes) return 0;
    const [ano, mes] = anoMes.split("-").map(Number);
    const hoje = new Date();
    const meses = (ano - hoje.getFullYear()) * 12 + (mes - (hoje.getMonth() + 1));
    return meses > 0 ? meses : 0;
  }

  function gerarLinkWhatsApp(nomeImovel: string) {
    const texto = `Olá! Vi o empreendimento *${nomeImovel}* na RioLar e gostaria de agendar uma visita ao stand para conhecer o decorado e fazer uma simulação personalizada.`;
    return `https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent(texto)}`;
  }

  const imoveisFiltrados = imoveis.filter((imovel) => {
    const matchBusca = 
      imovel.nome.toLowerCase().includes(busca.toLowerCase()) ||
      imovel.regiao.toLowerCase().includes(busca.toLowerCase()) ||
      imovel.cidade.toLowerCase().includes(busca.toLowerCase());

    const matchQuartos = 
      filtroQuartos === "Todos" || imovel.quartos.includes(filtroQuartos);

    return matchBusca && matchQuartos;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Topo / Navbar */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-500" />
            <span className="text-xl font-black text-white tracking-tight">
              Rio<span className="text-orange-500">Lar</span>
            </span>
          </div>

          <a
            href={`https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent("Olá! Gostaria de falar com um corretor sobre os lançamentos no Rio de Janeiro.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar com Corretor</span>
          </a>
        </div>
      </header>

      {/* Banner Principal com Gatilhos Comerciais */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white py-14 px-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Lançamentos com Condições Especiais
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Seu novo apartamento no Rio com <span className="text-orange-500">entrada facilitada</span>.
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Agende sua visita exclusiva ao stand de vendas. Conheça as plantas, visite o apartamento decorado e descubra o plano que cabe no seu bolso.
          </p>

          {/* Barra de Filtros Rápida */}
          <div className="pt-6 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Busque por bairro, cidade ou nome do empreendimento..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={filtroQuartos}
                onChange={(e) => setFiltroQuartos(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Todos">Todas as Plantas</option>
                <option value="1 Quarto">1 Quarto</option>
                <option value="2 Quartos">2 Quartos</option>
                <option value="3 Quartos">3 Quartos</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Vitrine de Imóveis */}
      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Empreendimentos em Destaque</h2>
            <p className="text-xs text-slate-500 mt-0.5">Encontre as melhores opções selecionadas para você</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white border px-3 py-1.5 rounded-lg shadow-sm">
            {imoveisFiltrados.length} disponíveis
          </span>
        </div>

        {carregando ? (
          <div className="text-center py-20 text-xs text-slate-500">
            Carregando os melhores empreendimentos...
          </div>
        ) : imoveisFiltrados.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border text-center space-y-3 max-w-md mx-auto shadow-sm">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum empreendimento encontrado</h3>
            <p className="text-xs text-slate-500">Tente ajustar os filtros ou fale com a nossa equipe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveisFiltrados.map((imovel) => {
              const parcelas = calcularParcelas(imovel.previsao_entrega);

              return (
                <div 
                  key={imovel.id} 
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Foto de Capa + Badge de Obra */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={imovel.imagem_capa || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80"}
                      alt={imovel.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        {imovel.status_obra}
                      </span>
                    </div>

                    {parcelas > 0 && (
                      <div className="absolute bottom-3 right-3 bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Entrada em até {parcelas}x
                      </div>
                    )}
                  </div>

                  {/* Informações Comerciais */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition">
                        {imovel.nome}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="truncate">{imovel.endereco || `${imovel.regiao} • ${imovel.cidade}`}</span>
                      </p>

                      {/* Tags de Plantas / Quartos */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {imovel.quartos.split(" e ").map((q) => (
                          <span
                            key={q}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100"
                          >
                            <BedDouble className="w-3 h-3" /> {q}
                          </span>
                        ))}
                      </div>

                      {/* Descrição resumida */}
                      {imovel.descricao && (
                        <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                          {imovel.descricao}
                        </p>
                      )}
                    </div>

                    {/* Preço de Entrada e Botão de Ação */}
                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">A partir de</span>
                        <span className="text-sm font-black text-slate-900">
                          {imovel.faixa_preco > 0
                            ? imovel.faixa_preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "Sob Consulta"}
                        </span>
                      </div>

                      <a
                        href={gerarLinkWhatsApp(imovel.nome)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-orange-600/20 shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Agendar no Stand</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}