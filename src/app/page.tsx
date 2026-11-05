"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle, ShieldCheck, Home, MapPin, BedDouble, CheckCircle2, PhoneCall } from "lucide-react";
import Image from "next/image";

interface Imovel {
  id: string;
  nome: string;
  slug: string;
  construtora: string;
  regiao: string;
  cidade: string;
  faixa_preco: number;
  subsidio_maximo: number;
  quartos: string;
  metragem: string;
  descricao: string;
  imagem_capa: string;
  status_obra: string;
}

export default function VitrineRioLar() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário de Simulação rápida
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [renda, setRenda] = useState("");
  const [imovelDesejado, setImovelDesejado] = useState("Geral / Não Definido");
  const [enviado, setEnviado] = useState(false);
  const [enviandoLead, setEnviandoLead] = useState(false);

  // 🔴 COLOQUE AQUI O SEU NÚMERO COM DDD (Ex: 5521999999999)
  const SEU_WHATSAPP = "5521999999999"; 

  useEffect(() => {
    async function carregarImoveis() {
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setImoveis(data);
      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarImoveis();
  }, []);

  const handleSimulacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviandoLead(true);

    try {
      const { error } = await supabase.from("leads").insert([
        {
          nome,
          telefone,
          renda_familiar: parseFloat(renda) || 0,
          imovel_interesse: imovelDesejado,
          origem_campanha: "Vitrine Principal",
        },
      ]);

      if (error) throw error;

      setEnviado(true);

      const msg = encodeURIComponent(
        `Olá Renato! Meu nome é ${nome}. Tenho renda aproximada de R$ ${renda} e gostaria de simular as condições para o imóvel: ${imovelDesejado}. (Portal RioLar)`
      );
      window.open(`https://wa.me/${SEU_WHATSAPP}?text=${msg}`, "_blank");
    } catch (err) {
      console.error("Erro ao salvar simulação:", err);
      alert("Houve um imprevisto ao enviar. Fale direto comigo pelo WhatsApp!");
    } finally {
      setEnviandoLead(false);
    }
  };

  const abrirConversaDireta = (nomeDoImovel: string) => {
    const texto = encodeURIComponent(
      `Olá Renato! Gostaria de mais detalhes, fotos e condições de pagamento do empreendimento ${nomeDoImovel}.`
    );
    window.open(`https://wa.me/${SEU_WHATSAPP}?text=${texto}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Topo Comercial com Marca Proporcional e Selo Oficial de Segurança */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center">
            {/* Altura ampliada de h-12 para h-14/h-16 garantindo excelente leitura de RENATO EUGENIO */}
            <Image 
              src="/logo.png" 
              alt="RioLar Imóveis • Renato Eugenio" 
              width={260} 
              height={80} 
              priority
              className="object-contain h-14 sm:h-16 w-auto"
            />
          </div>

          {/* Selo Legal com Destaque de Autoridade */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Corretor Credenciado</span>
              <span className="text-sm font-black text-slate-800 tracking-tight">CRECI-RJ 112.398</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="sm:hidden font-extrabold">CRECI 112.398</span>
              <span className="hidden sm:inline">Cadastro Ativo</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero / Apresentação Comercial de Alta Conversão */}
      <section className="bg-slate-950 text-white py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="bg-orange-600 text-white text-xs font-black px-3.5 py-1.5 rounded-md uppercase tracking-wider shadow-sm">
              Lançamentos & Oportunidades
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Encontre o seu apartamento no Rio e Grande Rio com condições facilitadas.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Apartamentos na planta e prontos para morar com subsídios do Minha Casa Minha Vida, uso do FGTS e parcelamento de entrada facilitado com atendimento personalizado.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Análise e Aprovação Caixa Rápida</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem Custo de Consultoria</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Vantagens de Entrada e ITBI*</div>
            </div>
          </div>

          {/* Card de Simulação Rápida Caixa */}
          <div className="lg:col-span-5 bg-white text-slate-900 p-6 sm:p-7 rounded-2xl shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900">Simulador de Financiamento</h3>
            <p className="text-xs text-slate-500 mb-4">Descubra seu valor de subsídio estimado e o valor das parcelas.</p>

            {enviado ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-emerald-800 text-sm">Simulação Iniciada!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  O atendimento direto com <strong>Renato Eugenio</strong> foi aberto no seu WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulacao} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none transition"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp com DDD (Ex: 21 99999-9999)"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none transition"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    required
                    placeholder="Renda Familiar Aproximada (Ex: 3500)"
                    value={renda}
                    onChange={(e) => setRenda(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-600 focus:outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={enviandoLead}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition duration-200 shadow-lg shadow-orange-600/30 active:scale-[0.99]"
                >
                  <MessageCircle className="w-4 h-4" />
                  {enviandoLead ? "Processando..." : "Receber Simulação Gratuita"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Catálogo de Imóveis Ativos */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-orange-600 text-xs font-black uppercase tracking-wider">Catálogo Selecionado</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Empreendimentos em Destaque</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Lançamentos selecionados no Rio e Grande Rio
          </span>
        </div>

        {carregando ? (
          <div className="py-20 text-center text-slate-400 text-sm">Carregando carteira de imóveis...</div>
        ) : imoveis.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
            <Home className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-extrabold text-slate-800 text-base">Nenhum imóvel cadastrado no momento</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Acesse a área administrativa para cadastrar os primeiros empreendimentos com fotos e detalhes completos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveis.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition duration-200 flex flex-col"
              >
                <div className="relative h-48 bg-slate-100">
                  {item.imagem_capa ? (
                    <img
                      src={item.imagem_capa}
                      alt={item.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Sem foto
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    {item.status_obra || "Lançamento"}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-slate-500 gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span>{item.regiao} • {item.cidade}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {item.nome}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                      <BedDouble className="w-4 h-4 text-slate-400" />
                      <span>{item.quartos}</span>
                    </div>

                    {item.descricao && (
                      <p className="text-xs text-slate-500 line-clamp-2 pt-1">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">A partir de</span>
                      <span className="text-base font-black text-slate-900">
                        {item.faixa_preco > 0
                          ? item.faixa_preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "Consulte valor"}
                      </span>
                    </div>

                    <button
                      onClick={() => abrirConversaDireta(item.nome)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Quero Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rodapé Oficial com CRECI Legalizado */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-3">
          <p className="font-black text-slate-100 text-sm tracking-wide">
            RioLar Imóveis • Renato Eugenio
          </p>
          <p className="text-slate-300 font-medium">
            Corretor de Imóveis Credenciado • <strong>CRECI-RJ 112.398</strong>
          </p>
          <p className="text-slate-500 max-w-xl mx-auto text-[11px] leading-relaxed">
            Consultoria e intermediação imobiliária especializada em lançamentos residenciais, avaliação de crédito Caixa Econômica Federal e uso do FGTS.
          </p>
          <p className="text-slate-600 text-[10px] pt-4">© {new Date().getFullYear()} RioLar Imóveis. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}