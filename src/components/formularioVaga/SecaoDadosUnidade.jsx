import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CIDADES_POR_MACRO } from "@/components/data/cidadesParaiba";
import { UNIDADES_POR_MACRO_CIDADE } from "@/components/data/unidadesSaude";
import { UF_MUNICIPIOS, UFS } from "@/components/data/ufMunicipios";

export default function SecaoDadosUnidade({ formData, setFormData, paciente }) {
  const [isOutroEstado, setIsOutroEstado] = useState(!!formData.local_nascimento_uf);
  const [ufOrigem, setUfOrigem] = useState(formData.uf_origem || "");
  const [usarOutraUnidade, setUsarOutraUnidade] = useState(false);
  const [outraUnidade, setOutraUnidade] = useState("");

  const macro = formData.macrorregiao || "";
  const cidade = formData.cidade || "";

  return (
    <div>
      <h3 className="text-base font-bold mb-3 border-b pb-2 text-blue-900">DADOS DA UNIDADE</h3>
      {paciente ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 grid md:grid-cols-3 gap-3">
          <div>
            <span className="text-xs text-blue-600 font-semibold uppercase">Unidade Solicitante</span>
            <p className="font-bold text-gray-900">{paciente.unidade_saude || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-blue-600 font-semibold uppercase">Macrorregião</span>
            <p className="font-bold text-gray-900">{paciente.macrorregiao || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-blue-600 font-semibold uppercase">Data e Horário da Admissão</span>
            <p className="text-gray-900">{paciente.data_hora_chegada ? new Date(paciente.data_hora_chegada).toLocaleString('pt-BR') : '—'}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-teal-900 block mb-2">Macrorregião de Saúde *</Label>
            <div className="flex gap-3">
              {["Macro 1", "Macro 2", "Macro 3"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setIsOutroEstado(false); setUfOrigem(""); setFormData({ ...formData, macrorregiao: m, cidade: "", unidade_solicitante: "", uf_origem: "" }); setUsarOutraUnidade(false); setOutraUnidade(""); }}
                  className={`flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-colors ${
                    macro === m && !isOutroEstado
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-teal-300 text-teal-700 hover:bg-teal-50"
                  } cursor-pointer`}
                >
                  {m}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setIsOutroEstado(true); setUfOrigem(""); setUsarOutraUnidade(false); setOutraUnidade(""); setFormData({ ...formData, macrorregiao: "Macro 1", cidade: "", unidade_solicitante: "", uf_origem: "" }); }}
                className={`flex-1 py-3 rounded-lg border-2 font-bold text-sm transition-colors ${
                  isOutroEstado
                    ? "bg-orange-600 border-orange-600 text-white"
                    : "bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
                } cursor-pointer`}
              >
                OUTRO
              </button>
            </div>
          </div>

          {isOutroEstado ? (
            <div className="space-y-4 bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-orange-900">UF (Estado) *</Label>
                <select
                  value={ufOrigem}
                  onChange={(e) => { const val = e.target.value; setUfOrigem(val); setFormData({ ...formData, uf_origem: val, cidade: "" }); }}
                  className="flex h-10 w-full rounded-md border-2 border-orange-400 bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Selecione o Estado</option>
                  {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-orange-900">Cidade da Unidade de Saúde *</Label>
                <select
                  value={cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="flex h-10 w-full rounded-md border-2 border-orange-400 bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!ufOrigem}
                >
                  <option value="">{ufOrigem ? "Selecione a cidade" : "Selecione o Estado primeiro"}</option>
                  {(UF_MUNICIPIOS[ufOrigem] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-orange-900">Nome da Unidade de Saúde *</Label>
                <Input
                  value={formData.unidade_solicitante}
                  onChange={(e) => setFormData({ ...formData, unidade_solicitante: e.target.value })}
                  placeholder="Digite o nome da unidade de saúde"
                  className="text-base border-2 border-orange-400"
                  required
                />
                <p className="text-xs text-orange-700 mt-1 font-medium">
                  ⚠️ Unidade de outro estado — será direcionada para a CERH Macro 1
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-teal-900">Cidade da Unidade de Saúde *</Label>
                <select
                  value={cidade}
                  onChange={(e) => { setFormData({ ...formData, cidade: e.target.value, unidade_solicitante: "" }); setUsarOutraUnidade(false); setOutraUnidade(""); }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!macro}
                >
                  <option value="">{macro ? "Selecione a cidade" : "Selecione a macrorregião primeiro"}</option>
                  {(CIDADES_POR_MACRO[macro] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {cidade && (
                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-teal-900">Nome da Unidade de Saúde *</Label>
                  {!usarOutraUnidade ? (
                    <select
                      value={formData.unidade_solicitante}
                      onChange={(e) => {
                        if (e.target.value === "__outra__") {
                          setUsarOutraUnidade(true);
                          setOutraUnidade("");
                          setFormData({ ...formData, unidade_solicitante: "" });
                        } else {
                          setFormData({ ...formData, unidade_solicitante: e.target.value });
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Selecione a unidade</option>
                      {(UNIDADES_POR_MACRO_CIDADE[macro]?.[cidade] || []).map(u => <option key={u} value={u}>{u}</option>)}
                      <option value="__outra__">+ Outra unidade</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={outraUnidade}
                        onChange={(e) => { setOutraUnidade(e.target.value); setFormData({ ...formData, unidade_solicitante: e.target.value }); }}
                        placeholder="Digite o nome da unidade"
                        className="text-base"
                      />
                      <button type="button" onClick={() => { setUsarOutraUnidade(false); setOutraUnidade(""); setFormData({ ...formData, unidade_solicitante: "" }); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                        Voltar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div>
            <Label>Data e Horário da Admissão</Label>
            <Input type="datetime-local" value={formData.data_hora_admissao} onChange={(e) => setFormData({ ...formData, data_hora_admissao: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}