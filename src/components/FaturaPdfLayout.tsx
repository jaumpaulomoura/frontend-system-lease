// components/pdf/FaturaPdfLayout.tsx
import React from "react";
import { LeaseProps } from "@interfaces/Lease";

const FaturaPdfLayout = ({ lease }: { lease: LeaseProps }) => {
  // Formatar datas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Agrupar itens por produto
  const agruparPorProduto = () => {
    const grupos: {
      [key: string]: {
        nome: string;
        marca: string;
        dias: number;
        quantidade: number;
        valorUnitario: number;
        valorTotal: number;
      }
    } = {};

    lease.leaseItems.forEach((item) => {
      const produtoNome = item.patrimonio?.produto?.name || "N/A";
      const produtoMarca = item.patrimonio?.produto?.marca || "";
      const chave = `${produtoNome}_${produtoMarca}`;

      // Pega o valor negociado conforme o período
      const periodo = item.periodo_cobranca || item.periodo || "diario";
      const valorNegociado = Number(
        periodo === "diario"
          ? item.valor_negociado_diario
          : periodo === "semanal"
          ? item.valor_negociado_semanal
          : periodo === "quinzenal"
          ? item.valor_negociado_quinzenal
          : periodo === "mensal"
          ? item.valor_negociado_mensal
          : item.valor_negociado_anual
      );

      if (!grupos[chave]) {
        grupos[chave] = {
          nome: produtoNome,
          marca: produtoMarca,
          dias: Number(item.quantidade_dias || 1),
          quantidade: 0,
          valorUnitario: valorNegociado, // Valor unitário é o valor negociado do período
          valorTotal: 0,
        };
      }

      // Calcula o valor total deste item
      let valorItem: number;

      // Se valor_total foi editado manualmente, usa ele
      if (item.valor_total != null && item.valor_total > 0) {
        valorItem = Number(item.valor_total);
      } else {
        // Senão, usa o cálculo automático (valor_negociado × dias)
        const dias = Number(item.quantidade_dias || 1);
        valorItem = valorNegociado * dias;
      }

      grupos[chave].quantidade += 1;
      grupos[chave].valorTotal += valorItem;
    });

    return Object.values(grupos);
  };

  const itensAgrupados = agruparPorProduto();
  const subtotal = itensAgrupados.reduce(
    (total, item) => total + item.valorTotal,
    0
  );
  const total = subtotal + Number(lease.valor_frete || 0) + Number(lease.valor_multa || 0) - Number(lease.valor_desconto || 0);

  return (
    <div
      id={`fatura-print-${lease.id_locacao}`}
      style={{
        width: "210mm",
        padding: "15mm",
        backgroundColor: "white",
        color: "black",
        fontSize: "10px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* CABEÇALHO */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td
              rowSpan={2}
              style={{
                width: "120px",
                textAlign: "center",
                border: "2px solid black",
                padding: "10px",
                verticalAlign: "middle",
              }}
            >
              <img
                src="/logo.png"
                alt="Logo Ferreira Aluguel"
                style={{
                  width: "100px",
                  height: "auto",
                  maxHeight: "100px",
                  objectFit: "contain",
                }}
              />
            </td>
            <td
              style={{
                textAlign: "center",
                border: "2px solid black",
                padding: "8px",
                backgroundColor: "#f5f5f5",
                wordWrap: "break-word",
                overflow: "hidden",
              }}
            >
              <strong style={{ fontSize: "13px" }}>
                FERREIRA ALUGUEL DE MÁQUINAS PARA CONSTRUÇÃO CIVIL
              </strong>
              <br />
              <span style={{ fontSize: "8px", lineHeight: "1.4" }}>
                Rua Jorge Tabah, 2950 - Jardim Angela Rosa
                <br />
                CEP: 14.403-615 - Franca/SP - CNPJ: 51.101.682/0001-60
                <br />
                Tel: (16) 99353-4031
              </span>
            </td>
            <td
              rowSpan={2}
              style={{
                width: "120px",
                textAlign: "center",
                border: "2px solid black",
                padding: "10px",
                verticalAlign: "middle",
              }}
            >
              <strong style={{ fontSize: "12px" }}>FATURA DE LOCAÇÃO</strong>
              <br />
              <strong style={{ fontSize: "16px" }}>
                Nº {String(lease.id_locacao).padStart(6, "0")}
              </strong>
              <br />
              <span style={{ fontSize: "8px" }}>
                Data: {formatDate(lease.createdAt)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* INFORMAÇÕES DO CLIENTE E PERÍODO */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                width: "25%",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              PERÍODO DE LOCAÇÃO
            </td>
            <td
              colSpan={2}
              style={{ border: "1px solid black", padding: "5px" }}
            >
              {formatDate(lease.data_inicio)} até{" "}
              {formatDate(lease.data_prevista_devolucao)}
            </td>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              NATUREZA DA OPERAÇÃO
            </td>
            <td style={{ border: "1px solid black", padding: "5px" }}>
              Locação de Bens Móveis
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              CLIENTE
            </td>
            <td
              colSpan={4}
              style={{ border: "1px solid black", padding: "5px" }}
            >
              <strong>{lease.cliente?.name}</strong>
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              CPF/CNPJ
            </td>
            <td
              colSpan={2}
              style={{ border: "1px solid black", padding: "5px" }}
            >
              {lease.cliente?.cpf_cnpj}
            </td>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              TELEFONE
            </td>
            <td style={{ border: "1px solid black", padding: "5px" }}>
              {lease.cliente?.telefone}
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              ENDEREÇO DE COBRANÇA
            </td>
            <td
              colSpan={4}
              style={{ border: "1px solid black", padding: "5px" }}
            >
              {lease.cliente?.rua_cobranca}, {lease.cliente?.numero_cobranca}
              {lease.cliente?.complemento_cobranca
                ? ` - ${lease.cliente.complemento_cobranca}`
                : ""}{" "}
              - {lease.cliente?.bairro_cobranca}
              <br />
              {lease.cliente?.cidade_cobranca}/{lease.cliente?.estado_cobranca}{" "}
              - CEP: {lease.cliente?.cep_cobranca}
            </td>
          </tr>
          <tr>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
              }}
            >
              LOCAL DE ENTREGA/OBRA
            </td>
            <td
              colSpan={4}
              style={{ border: "1px solid black", padding: "5px" }}
            >
              {lease.rua_locacao}, {lease.numero_locacao}
              {lease.complemento_locacao ? ` - ${lease.complemento_locacao}` : ""} - {lease.bairro_locacao}
              <br />
              {lease.cidade_locacao}/{lease.estado_locacao} - CEP:{" "}
              {lease.cep_locacao}
            </td>
          </tr>
        </tbody>
      </table>

      {/* TABELA DE EQUIPAMENTOS */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#333", color: "white" }}>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
                width: "5%",
              }}
            >
              ITEM
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
                width: "40%",
              }}
            >
              EQUIPAMENTO
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
                width: "10%",
              }}
            >
              QTD
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
                width: "12%",
              }}
            >
              DIAS
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
                width: "15%",
              }}
            >
              VALOR UNITÁRIO
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
                width: "18%",
              }}
            >
              VALOR TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {itensAgrupados.map((item, index) => {
            return (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "center",
                  }}
                >
                  {index + 1}
                </td>
                <td style={{ border: "1px solid black", padding: "5px" }}>
                  {item.nome}
                  {item.marca && (
                    <span style={{ fontSize: "8px", color: "#666" }}>
                      <br />
                      Marca: {item.marca}
                    </span>
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "center",
                  }}
                >
                  {item.quantidade}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "center",
                  }}
                >
                  {item.dias}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(item.valorUnitario)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "5px",
                    textAlign: "right",
                  }}
                >
                  {formatCurrency(item.valorTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* RESUMO FINANCEIRO */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px",
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: "70%" }}>&nbsp;</td>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
                textAlign: "right",
              }}
            >
              SUBTOTAL:
            </td>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {formatCurrency(subtotal)}
            </td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                fontWeight: "bold",
                backgroundColor: "#e8e8e8",
                textAlign: "right",
              }}
            >
              FRETE:
            </td>
            <td
              style={{
                border: "1px solid black",
                padding: "5px",
                textAlign: "right",
              }}
            >
              {formatCurrency(lease.valor_frete)}
            </td>
          </tr>
          {lease.valor_multa > 0 && (
            <tr>
              <td>&nbsp;</td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  fontWeight: "bold",
                  backgroundColor: "#e8e8e8",
                  textAlign: "right",
                }}
              >
                MULTA:
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "right",
                  color: "red",
                }}
              >
                {formatCurrency(lease.valor_multa)}
              </td>
            </tr>
          )}
          {lease.valor_desconto && lease.valor_desconto > 0 && (
            <tr>
              <td>&nbsp;</td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  fontWeight: "bold",
                  backgroundColor: "#e8e8e8",
                  textAlign: "right",
                }}
              >
                DESCONTO:
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "5px",
                  textAlign: "right",
                  color: "red",
                }}
              >
                - {formatCurrency(lease.valor_desconto)}
              </td>
            </tr>
          )}
          <tr>
            <td>&nbsp;</td>
            <td
              style={{
                border: "2px solid black",
                padding: "8px",
                fontWeight: "bold",
                backgroundColor: "#333",
                color: "white",
                textAlign: "right",
                fontSize: "12px",
              }}
            >
              TOTAL:
            </td>
            <td
              style={{
                border: "2px solid black",
                padding: "8px",
                textAlign: "right",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              {formatCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* RODAPÉ - ASSINATURAS */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ textAlign: "center", width: "45%" }}>
          <div
            style={{
              borderTop: "1px solid black",
              paddingTop: "5px",
              marginTop: "40px",
            }}
          >
            <strong>FERREIRA ALUGUEL DE MÁQUINAS</strong>
            <br />
            Locador
          </div>
        </div>
        <div style={{ textAlign: "center", width: "45%" }}>
          <div
            style={{
              borderTop: "1px solid black",
              paddingTop: "5px",
              marginTop: "40px",
            }}
          >
            <strong>{lease.cliente?.name}</strong>
            <br />
            Locatário
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaturaPdfLayout;
