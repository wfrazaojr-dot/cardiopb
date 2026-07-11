import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";

export default function SecaoEndereco({ formData, setFormData }) {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  const formatarCep = (valor) => {
    const n = valor.replace(/\D/g, "");
    if (n.length <= 5) return n;
    return `${n.slice(0, 5)}-${n.slice(5, 8)}`;
  };

  const buscarCep = async (cepRaw) => {
    const cep = cepRaw.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setBuscandoCep(true);
    setErroCep("");

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();

      if (data.erro) {
        setErroCep("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        endereco_logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        endereco_cidade: data.localidade || "",
        endereco_uf: data.uf || "",
        endereco: [data.logradouro, prev.numero, data.bairro, data.localidade, data.uf]
          .filter(Boolean)
          .join(", "),
      }));
    } catch {
      setErroCep("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e) => {
    const cepFormatado = formatarCep(e.target.value);
    setFormData((prev) => ({ ...prev, cep: cepFormatado }));

    if (cepFormatado.replace(/\D/g, "").length === 8) {
      buscarCep(cepFormatado);
    }
  };

  const atualizarCampo = (campo, valor) => {
    setFormData((prev) => {
      const atualizado = { ...prev, [campo]: valor };
      // Recompõe o endereço completo para PDF/email
      atualizado.endereco = [
        atualizado.endereco_logradouro,
        atualizado.numero,
        atualizado.complemento,
        atualizado.bairro,
        atualizado.endereco_cidade,
        atualizado.endereco_uf,
      ].filter(Boolean).join(", ");
      return atualizado;
    });
  };

  return (
    <div className="md:col-span-2 space-y-4">
      <div className="border-b pb-1">
        <Label className="text-sm font-bold text-blue-900">ENDEREÇO COMPLETO</Label>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* CEP */}
        <div className="space-y-1">
          <Label>CEP *</Label>
          <div className="relative">
            <Input
              value={formData.cep || ""}
              onChange={handleCepChange}
              maxLength={9}
              placeholder="00000-000"
            />
            {buscandoCep && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
            )}
          </div>
          {erroCep && <p className="text-xs text-red-600">{erroCep}</p>}
          {!erroCep && !buscandoCep && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Search className="w-3 h-3" /> Digite o CEP para preenchimento automático
            </p>
          )}
        </div>

        {/* Logradouro */}
        <div className="space-y-1 md:col-span-2">
          <Label>Logradouro</Label>
          <Input
            value={formData.endereco_logradouro || ""}
            onChange={(e) => atualizarCampo("endereco_logradouro", e.target.value)}
            placeholder="Rua, Avenida, Praça..."
          />
        </div>

        {/* Número */}
        <div className="space-y-1">
          <Label>Número *</Label>
          <Input
            value={formData.numero || ""}
            onChange={(e) => atualizarCampo("numero", e.target.value)}
            placeholder="Ex: 123"
          />
        </div>

        {/* Complemento */}
        <div className="space-y-1 md:col-span-2">
          <Label>Complemento</Label>
          <Input
            value={formData.complemento || ""}
            onChange={(e) => atualizarCampo("complemento", e.target.value)}
            placeholder="Apto, Bloco, Casa..."
          />
        </div>

        {/* Bairro */}
        <div className="space-y-1">
          <Label>Bairro</Label>
          <Input
            value={formData.bairro || ""}
            onChange={(e) => atualizarCampo("bairro", e.target.value)}
            placeholder="Bairro..."
          />
        </div>

        {/* Cidade */}
        <div className="space-y-1">
          <Label>Cidade</Label>
          <Input
            value={formData.endereco_cidade || ""}
            onChange={(e) => atualizarCampo("endereco_cidade", e.target.value)}
            placeholder="Cidade..."
          />
        </div>

        {/* UF */}
        <div className="space-y-1">
          <Label>UF</Label>
          <Input
            value={formData.endereco_uf || ""}
            onChange={(e) => atualizarCampo("endereco_uf", e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="UF"
          />
        </div>
      </div>
    </div>
  );
}