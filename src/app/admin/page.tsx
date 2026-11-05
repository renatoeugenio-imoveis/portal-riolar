"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  PlusCircle, 
  Trash2, 
  Home, 
  LogOut, 
  Calendar, 
  Plus, 
  X, 
  Image as ImageIcon,
  Tag,
  Sparkles,
  Clock,
  Images,
  Info,
  Upload,
  Loader2
} from "lucide-react";

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

interface Imovel {
  id: string;
  nome: string;
  regiao: string;
  cidade: string;
  endereco?: string;
  faixa_preco: number;
  preco_promocional?: number;
  selo_promocional?: string;
  unidade_promocional?: string;
  data_fim_promocao?: string;
  quartos: string;
  status_obra: string;
  previsao_entrega?: string;
  imagem_capa: string;
  video_url?: string;
  fotos_galeria?: string;
  descricao: string;
  ativo?: boolean;
}

export default function AdminPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [subindoCapa, setSubindoCapa] = useState(false);
  const [subindoGaleria, setSubindoGaleria] = useState(false);
  const router = useRouter();

  const inputFileCapaRef = useRef<HTMLInputElement>(null);
  const inputFileGaleriaRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("");
  const [regiao, setRegiao] = useState("");
  const [cidade, setCidade] = useState("Rio de Janeiro");
  const [endereco, setEndereco] = useState("");
  const [statusObra, setStatusObra] = useState("Em obras");
  const [previsaoEntrega, setPrevisaoEntrega] = useState("2029-10");
  const [imagemCapa, setImagemCapa] = useState("");
  const [descricao, setDescricao] = useState("");

  const [fotosGaleria, setFotosGaleria] = useState<string[]>([]);
  const [novaFotoUrl, setNovaFotoUrl] = useState("");
  const [videosYoutube, setVideosYoutube] = useState<string[]>([]);
  const [novoVideo, setNovoVideo] = useState("");

  const [precoFormatado, setPrecoFormatado] = useState("");
  const [precoPromocionalFormatado, setPrecoPromocionalFormatado] = useState("");
  const [seloPromocional, setSeloPromocional] = useState("");
  const [unidadePromocional, setUnidadePromocional] = useState("");
  const [dataFimPromocao, setDataFimPromocao] = useState("");

  const [tipologias, setTipologias] = useState<string[]>(["1 Quarto", "2 Quartos"]);
  const [novaTipologia, setNovaTipologia] = useState("");

  const sugestoesSelos = [
    "🔥 Condição Exclusiva do Mês",
    "🎉 Feirão da Casa Própria",
    "⚡ Últimas Unidades Promocionais",
    "🎁 Entrada Facilitada + Bônus"
  ];

  const sugestoesUnidade = [
    "1 Quarto sem vaga",
    "1 Quarto com varanda",
    "2 Quartos sem vaga",
    "2 Quartos com vaga",
    "Studio compacto"
  ];

  useEffect(() => {
    verificarSessao();
    carregarImoveis();
  }, []);

  async function verificarSessao() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
    }
  }

  async function carregarImoveis() {
    try {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setImoveis(data);
    } catch (err) {
      console.error("Erro ao carregar lista de imóveis:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function handleUploadArquivo(e: React.ChangeEvent<HTMLInputElement>, tipo: "capa" | "galeria") {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (tipo === "capa") setSubindoCapa(true);
    else setSubindoGaleria(true);

    try {
      const extensao = arquivo.name.split(".").pop();
      const nomeUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extensao}`;
      
      const { error: erroUpload } = await supabase.storage
        .from("imoveis")
        .upload(nomeUnico, arquivo, { cacheControl: "3600", upsert: false });

      if (erroUpload) throw erroUpload;

      const { data: dadosPublicos } = supabase.storage.from("imoveis").getPublicUrl(nomeUnico);

      if (tipo === "capa") {
        setImagemCapa(dadosPublicos.publicUrl);
      } else {
        setFotosGaleria((prev) => [...prev, dadosPublicos.publicUrl]);
      }
    } catch (err: any) {
      console.error("Erro no upload:", err);
      alert("Erro ao enviar imagem para o Supabase: " + err.message);
    } finally {
      if (tipo === "capa") setSubindoCapa(false);
      else setSubindoGaleria(false);
      e.target.value = "";
    }
  }

  function formatarMoedaInput(valorInput: string, setter: (val: string) => void) {
    const limpo = valorInput.replace(/\D/g, "");
    if (!limpo) {
      setter("");
      return;
    }
    const numero = Number(limpo) / 100;
    setter(numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  }

  function adicionarTipologia() {
    const texto = novaTipologia.trim();
    if (texto && !tipologias.includes(texto)) {
      setTipologias([...tipologias, texto]);
      setNovaTipologia("");
    }
  }

  function removerTipologia(item: string) {
    setTipologias(tipologias.filter((t) => t !== item));
  }

  function adicionarFotoUrl() {
    const url = novaFotoUrl.trim();
    if (url && !fotosGaleria.includes(url)) {
      setFotosGaleria([...fotosGaleria, url]);
      setNovaFotoUrl("");
    }
  }

  function removerFoto(url: string) {
    setFotosGaleria(fotosGaleria.filter((f) => f !== url));
  }

  function adicionarVideo() {
    const url = novoVideo.trim();
    if (url && !videosYoutube.includes(url)) {
      setVideosYoutube([...videosYoutube, url]);
      setNovoVideo("");
    }
  }

  function removerVideo(url: string) {
    setVideosYoutube(videosYoutube.filter((v) => v !== url));
  }

  function calcularMesesRestantes(anoMes: string) {
    if (!anoMes) return 0;
    const [ano, mes] = anoMes.split("-").map(Number);
    const hoje = new Date();
    const meses = (ano - hoje.getFullYear()) * 12 + (mes - (hoje.getMonth() + 1));
    return meses > 0 ? meses : 0;
  }

  function isPromocaoAtiva(imovel: Imovel) {
    if (!imovel.preco_promocional || imovel.preco_promocional <= 0) return false;
    if (!imovel.data_fim_promocao) return true;
    const dataLimite = new Date(`${imovel.data_fim_promocao}T23:59:59`);
    return dataLimite >= new Date();
  }

  async function handleSalvarImovel(e: React.FormEvent) {
    e.preventDefault();
    if (tipologias.length === 0) {
      alert("Adicione pelo menos uma opção de quarto/planta para este imóvel.");
      return;
    }

    setSalvando(true);

    try {
      const slug = nome.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      
      const numeroTabela = precoFormatado
        ? parseFloat(precoFormatado.replace(/[^\d,]/g, "").replace(",", "."))
        : 0;

      const numeroPromocional = precoPromocionalFormatado
        ? parseFloat(precoPromocionalFormatado.replace(/[^\d,]/g, "").replace(",", "."))
        : 0;

      const payload: any = {
        nome,
        slug,
        regiao,
        cidade,
        endereco,
        faixa_preco: numeroTabela,
        preco_promocional: numeroPromocional > 0 ? numeroPromocional : null,
        selo_promocional: seloPromocional.trim() || null,
        unidade_promocional: unidadePromocional.trim() || null,
        data_fim_promocao: dataFimPromocao || null,
        quartos: tipologias.join(" e "),
        status_obra: statusObra,
        previsao_entrega: previsaoEntrega,
        imagem_capa: imagemCapa.trim() || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
        video_url: videosYoutube.join("|||"),
        fotos_galeria: fotosGaleria.join("|||"),
        descricao,
        ativo: true, // Garante que o empreendimento é visível na vitrine imediatamente
      };

      const { error } = await supabase.from("imoveis").insert([payload]);

      if (error) {
        delete payload.endereco;
        delete payload.previsao_entrega;
        delete payload.video_url;
        delete payload.fotos_galeria;
        delete payload.preco_promocional;
        delete payload.selo_promocional;
        delete payload.unidade_promocional;
        delete payload.data_fim_promocao;
        const fallback = await supabase.from("imoveis").insert([payload]);
        if (fallback.error) throw fallback.error;
      }

      setNome("");
      setRegiao("");
      setEndereco("");
      setPrecoFormatado("");
      setPrecoPromocionalFormatado("");
      setSeloPromocional("");
      setUnidadePromocional("");
      setDataFimPromocao("");
      setImagemCapa("");
      setFotosGaleria([]);
      setVideosYoutube([]);
      setDescricao("");
      setTipologias(["1 Quarto", "2 Quartos"]);
      await carregarImoveis();
      alert("Empreendimento cadastrado e ativado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao registrar imóvel:", err);
      alert("Erro ao cadastrar: " + (err.message || "Verifique os dados"));
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverImovel(id: string) {
    if (!confirm("Deseja realmente remover este empreendimento da vitrine?")) return;

    try {
      const { error } = await supabase.from("imoveis").delete().eq("id", id);
      if (error) throw error;
      setImoveis(imoveis.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erro ao remover:", err);
    }
  }

  async function handleSair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const parcelasHoje = calcularMesesRestantes(previsaoEntrega);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      <header className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-xl font-black text-orange-500">RioLar</span>
            <span className="text-xs text-slate-400 block font-semibold">Painel de Gestão do Corretor</span>
          </div>
          <button
            onClick={handleSair}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-orange-600" /> Cadastrar Empreendimento
          </h2>

          <form onSubmit={handleSalvarImovel} noValidate className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Nome do Empreendimento
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Dona Ivone Lara"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Bairro / Região
                </label>
                <input
                  type="text"
                  required
                  value={regiao}
                  onChange={(e) => setRegiao(e.target.value)}
                  placeholder="Ex: Porto Maravilha / Santo Cristo"
                  className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  required
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Endereço do Empreendimento
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Rua Geógrafo Milton Santos, 300 - Santo Cristo"
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Opções de Quartos e Plantas Disponíveis */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Opções de Quartos / Plantas Disponíveis
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={novaTipologia}
                  onChange={(e) => setNovaTipologia(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarTipologia(); } }}
                  placeholder="Digite ex: 1 Quarto, 2 Quartos..."
                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={adicionarTipologia}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {tipologias.length === 0 ? (
                  <span className="text-[11px] text-slate-400">Nenhuma opção de quarto adicionada.</span>
                ) : (
                  tipologias.map((tip) => (
                    <span
                      key={tip}
                      className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 font-bold text-xs px-2.5 py-1 rounded-md border border-orange-200"
                    >
                      {tip}
                      <button
                        type="button"
                        onClick={() => removerTipologia(tip)}
                        className="text-orange-600 hover:text-orange-950"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Bloco de Preços, Promoções e Prazos */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Preço de Tabela (A partir de)
                  </label>
                  <input
                    type="text"
                    value={precoFormatado}
                    onChange={(e) => formatarMoedaInput(e.target.value, setPrecoFormatado)}
                    placeholder="R$ 319.000,00"
                    className="w-full px-3 py-2 text-xs font-semibold border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Valor fixo de referência</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-orange-700 uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-orange-600" /> Valor Promocional do Mês
                  </label>
                  <input
                    type="text"
                    value={precoPromocionalFormatado}
                    onChange={(e) => formatarMoedaInput(e.target.value, setPrecoPromocionalFormatado)}
                    placeholder="R$ 299.000,00"
                    className="w-full px-3 py-2 text-xs font-bold border rounded-lg border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400">Opcional</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-orange-600" /> Unidade / Referência da Promoção (Opcional)
                </label>
                <input
                  type="text"
                  value={unidadePromocional}
                  onChange={(e) => setUnidadePromocional(e.target.value)}
                  placeholder="Ex: 1 Quarto sem vaga (unidade promocional)"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white mb-1.5"
                />
                
                <div className="flex flex-wrap gap-1">
                  {sugestoesUnidade.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setUnidadePromocional(item)}
                      className="text-[10px] bg-white hover:bg-orange-50 text-slate-600 hover:text-orange-700 border border-slate-200 px-2 py-0.5 rounded transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-orange-600" /> Selo da Campanha
                  </label>
                  <input
                    type="text"
                    value={seloPromocional}
                    onChange={(e) => setSeloPromocional(e.target.value)}
                    placeholder="Ex: 🔥 Condição Exclusiva do Mês"
                    className="w-full px-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white mb-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-600" /> Válido Até (Data Limite)
                  </label>
                  <input
                    type="date"
                    value={dataFimPromocao}
                    onChange={(e) => setDataFimPromocao(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-slate-700"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {sugestoesSelos.map((sugestao) => (
                  <button
                    type="button"
                    key={sugestao}
                    onClick={() => setSeloPromocional(sugestao)}
                    className="text-[10px] bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 px-2 py-1 rounded-md transition font-medium"
                  >
                    {sugestao}
                  </button>
                ))}
                {seloPromocional && (
                  <button
                    type="button"
                    onClick={() => setSeloPromocional("")}
                    className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-md hover:bg-slate-300 transition"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Fase da Obra & Previsão de Entrega */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Fase da Obra
                </label>
                <select
                  value={statusObra}
                  onChange={(e) => setStatusObra(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                >
                  <option value="Breve Lançamento">Breve Lançamento</option>
                  <option value="Lançamento">Lançamento</option>
                  <option value="Em obras">Em obras</option>
                  <option value="Pronto para Morar">Pronto para Morar</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-orange-600" /> Previsão de Entrega
                </label>
                <input
                  type="month"
                  required
                  value={previsaoEntrega}
                  onChange={(e) => setPrevisaoEntrega(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white text-slate-800"
                />
                <span className="text-[10px] text-orange-700 font-bold block mt-1">
                  Calculado: {parcelasHoje > 0 ? `${parcelasHoje}x parceladas` : "Chaves / À Vista"}
                </span>
              </div>
            </div>

            {/* BOTÃO E CAMPO: IMAGEM PRINCIPAL (CAPA) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-600" /> Imagem Principal / Fachada (Capa da Vitrine)
                </span>
                {imagemCapa && (
                  <button
                    type="button"
                    onClick={() => setImagemCapa("")}
                    className="text-[10px] text-red-600 hover:underline lowercase font-normal"
                  >
                    remover capa
                  </button>
                )}
              </label>

              <input
                type="file"
                ref={inputFileCapaRef}
                onChange={(e) => handleUploadArquivo(e, "capa")}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={subindoCapa}
                  onClick={() => inputFileCapaRef.current?.click()}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition shadow-sm shrink-0"
                >
                  {subindoCapa ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-orange-400" />
                      Selecionar Imagem do Computador
                    </>
                  )}
                </button>

                <input
                  type="text"
                  value={imagemCapa}
                  onChange={(e) => setImagemCapa(e.target.value)}
                  placeholder="Ou cole o caminho / link..."
                  className="flex-1 px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                />
              </div>

              {imagemCapa && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 mt-2">
                  <img
                    src={imagemCapa}
                    alt="Prévia da Capa"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-950/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Pré-visualização
                  </span>
                </div>
              )}
            </div>

            {/* BOTÃO E CAMPO: FOTOS ADICIONAIS (GALERIA) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                <Images className="w-3.5 h-3.5 text-orange-600" /> Fotos Adicionais (Decorado, Plantas, Lazer)
              </label>

              <input
                type="file"
                ref={inputFileGaleriaRef}
                onChange={(e) => handleUploadArquivo(e, "galeria")}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={subindoGaleria}
                  onClick={() => inputFileGaleriaRef.current?.click()}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0"
                >
                  {subindoGaleria ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-orange-400" />
                      Anexar Foto do PC
                    </>
                  )}
                </button>

                <input
                  type="text"
                  value={novaFotoUrl}
                  onChange={(e) => setNovaFotoUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarFotoUrl(); } }}
                  placeholder="Ou cole o link..."
                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={adicionarFotoUrl}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {fotosGaleria.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {fotosGaleria.map((foto, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-300 h-16 bg-slate-200">
                      <img src={foto} alt={`Foto extra ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removerFoto(foto)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition shadow"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vídeos do YouTube */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <YoutubeIcon className="w-3.5 h-3.5 text-red-600" /> Vídeos do YouTube (Tour Virtual / Apresentação)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={novoVideo}
                  onChange={(e) => setNovoVideo(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionarVideo(); } }}
                  placeholder="Cole o link do YouTube (ex: https://youtu.be/...) e adicione..."
                  className="flex-1 px-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={adicionarVideo}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Vídeo
                </button>
              </div>

              {videosYoutube.length > 0 && (
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {videosYoutube.map((vid, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-white border border-red-100 rounded text-[11px] text-slate-700">
                      <span className="truncate max-w-[280px]">{vid}</span>
                      <button
                        type="button"
                        onClick={() => removerVideo(vid)}
                        className="text-red-500 hover:text-red-700 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Descrição Comercial (Gatilho para Visita ao Stand)
              </label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: O samba está recebendo sua nova casa, condomínio com lazer e localização estratégica..."
                className="w-full px-3 py-2 text-xs border rounded-lg border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-xs transition uppercase tracking-wider shadow-lg shadow-orange-600/20"
            >
              {salvando ? "Publicando..." : "Publicar Empreendimento na Vitrine"}
            </button>
          </form>
        </section>

        {/* Lista de Empreendimentos Ativos */}
        <section className="lg:col-span-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span>Empreendimentos Ativos ({imoveis.length})</span>
          </h2>

          {carregando ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
              Carregando empreendimentos...
            </div>
          ) : imoveis.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500 space-y-2">
              <Home className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Nenhum empreendimento ativo cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {imoveis.map((item) => {
                const promoAtiva = isPromocaoAtiva(item);
                const totalFotosExtras = item.fotos_galeria ? item.fotos_galeria.split("|||").filter(Boolean).length : 0;
                const totalVideos = item.video_url ? item.video_url.split("|||").filter(Boolean).length : 0;

                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{item.nome}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                          {item.status_obra}
                        </span>
                        {promoAtiva && item.selo_promocional && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            {item.selo_promocional}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.regiao} • {item.cidade}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {item.quartos.split(" e ").map((q) => (
                          <span key={q} className="text-[10px] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-semibold border border-orange-100">
                            {q}
                          </span>
                        ))}
                        {totalFotosExtras > 0 && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold border border-blue-100 flex items-center gap-1">
                            <Images className="w-3 h-3" /> +{totalFotosExtras} fotos
                          </span>
                        )}
                        {totalVideos > 0 && (
                          <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-semibold border border-red-100 flex items-center gap-1">
                            <YoutubeIcon className="w-3 h-3 text-red-600" /> {totalVideos} vídeo(s)
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5">
                        {promoAtiva && item.preco_promocional ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 line-through">
                                {item.faixa_preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                              <span className="text-xs font-black text-orange-700">
                                Por {item.preco_promocional.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            </div>
                            {item.unidade_promocional && (
                              <span className="text-[10px] text-orange-950 font-bold block bg-orange-50/70 px-1.5 py-0.5 rounded border border-orange-200/60 w-fit">
                                📌 Ref: {item.unidade_promocional}
                              </span>
                            )}
                            {item.data_fim_promocao && (
                              <span className="text-[10px] text-amber-700 font-semibold block">
                                ⏳ Válido até {new Date(`${item.data_fim_promocao}T00:00:00`).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-slate-700">
                            {item.faixa_preco > 0 
                              ? `A partir de ${item.faixa_preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` 
                              : "Consulte condições"}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoverImovel(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Remover imóvel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}