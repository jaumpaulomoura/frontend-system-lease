// components/pdf/FaturaPdfLayout.tsx
import React from "react";

interface Cliente {
  name: string;
  endereco?: string;
}

interface LeaseData {
  id_locacao: number;
  data_inicio: string;
  data_prevista_devolucao: string;
  cliente: Cliente;
  rua_locacao: string;
  numero_locacao: string;
  bairro_locacao: string;
  cidade_locacao: string;
  estado_locacao: string;
}

const FaturaPdfLayout = ({ lease }: { lease: LeaseData }) => {
  return (
    <div
      id={`fatura-print-${lease.id_locacao}`}
      style={{
        width: "210mm",
        padding: "20mm",
        backgroundColor: "white",
        color: "black",
        fontSize: "11px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td
              rowSpan={3}
              style={{
                width: 60,
                textAlign: "center",
                border: "1px solid black",
              }}
            >
              <strong>FC</strong>
            </td>
            <td
              colSpan={3}
              style={{ textAlign: "center", border: "1px solid black" }}
            >
              <strong>FANTINI E CRUZ EQUIPAMENTOS PARA CONSTRUÇÃO LTDA</strong>
              <br />
              AV PAULO ROBERTO CAVALHEIRO COELHO, 891 - PARQUE CASTELO - CEP:
              14403-200
              <br />
              FONE: (16) 3720-1585 - FRANCA - SP
              <br />
              CNPJ: 22.442.280/0001-20 - INSC. EST.: 509.911.648.111
              <br />
              E-MAIL: financeiro@fcequipamentos.com.br - SITE:
              fcequipamentos.com.br
            </td>
            <td
              rowSpan={3}
              style={{
                width: 80,
                textAlign: "center",
                border: "1px solid black",
              }}
            >
              <strong>FATURA DE LOCAÇÃO</strong>
              <br />
              Nº <strong>{lease.id_locacao}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: "1px solid black" }}>
              &nbsp;
            </td>
          </tr>
          <tr>
            <td colSpan={3} style={{ border: "1px solid black" }}>
              &nbsp;
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}
      >
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", width: "30%" }}>
              PERÍODO DE REFERÊNCIA
            </td>
            <td colSpan={2} style={{ border: "1px solid black" }}>
              {lease.data_inicio} até {lease.data_prevista_devolucao}
            </td>
            <td style={{ border: "1px solid black" }}>NATUREZA DA OPERAÇÃO</td>
            <td style={{ border: "1px solid black" }}>
              Locação de bens móveis
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black" }}>TOMADOR</td>
            <td colSpan={4} style={{ border: "1px solid black" }}>
              {lease.cliente?.name}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black" }}>ENDEREÇO</td>
            <td colSpan={4} style={{ border: "1px solid black" }}>
              {lease.cliente?.endereco || "Endereço não informado"}
            </td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black" }}>ENTREGA OBRA</td>
            <td colSpan={4} style={{ border: "1px solid black" }}>
              {lease.rua_locacao}, {lease.numero_locacao} -{" "}
              {lease.bairro_locacao}, {lease.cidade_locacao} -{" "}
              {lease.estado_locacao}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default FaturaPdfLayout;
