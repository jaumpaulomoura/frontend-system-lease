// components/LeaseContractPDF.tsx
import { LeaseProps } from "@interfaces/Lease";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registrar fontes
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
    }, // normal
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc9.ttf",
      fontWeight: "bold",
    }, // bold
  ],
});

// Funções auxiliares
const formatCurrency = (value?: number | string | null): string => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
};

const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
};

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "bold",
    width: "25%",
    color: "#444",
  },
  value: {
    width: "75%",
  },
  table: {
    width: "100%",
    marginTop: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    borderTop: "1px solid #eee",
    paddingTop: 10,
  },
});

// Componente principal
const LeaseContractPDF = ({ lease }: { lease?: LeaseProps | null }) => {
  // Fallback para dados ausentes
  if (!lease) {
    return (
      <Document>
        <Page size="A4">
          <Text>Contrato não disponível</Text>
        </Page>
      </Document>
    );
  }

  // Dados seguros com fallbacks
  const safeData = {
    id_locacao: lease.id_locacao || "N/A",
    cliente: {
      name: lease.cliente?.name || "Não informado",
      id: lease.cliente_id || "N/A",
    },
    endereco: [
      lease.rua_locacao,
      lease.numero_locacao,
      lease.complemento_locacao,
    ]
      .filter(Boolean)
      .join(", "),
    cidade: `${lease.bairro_locacao ? `${lease.bairro_locacao}, ` : ""}${
      lease.cidade_locacao || "Cidade não informada"
    }${lease.estado_locacao ? `/${lease.estado_locacao}` : ""}`,
    periodo: {
      inicio: formatDate(lease.data_inicio),
      fim: formatDate(lease.data_prevista_devolucao),
    },
    valorTotal: formatCurrency(lease.valor_total),
    itens: lease.leaseItems?.length
      ? lease.leaseItems
      : [
          {
            patrimonio: { produto: {}, numero_patrimonio: "" },
            periodo: "",
            valor_negociado_diario: 0,
          },
        ],
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>CONTRATO DE LOCAÇÃO</Text>
          <Text style={styles.subtitle}>Nº {safeData.id_locacao}</Text>
        </View>

        {/* Dados do Cliente */}
        <View style={styles.section}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>
            {safeData.cliente.name} (ID: {safeData.cliente.id})
          </Text>
        </View>

        {/* Endereço */}
        <View style={styles.section}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.value}>
            {safeData.endereco} - {safeData.cidade}
          </Text>
        </View>

        {/* Período */}
        <View style={styles.section}>
          <Text style={styles.label}>Período:</Text>
          <Text style={styles.value}>
            De {safeData.periodo.inicio} até {safeData.periodo.fim}
          </Text>
        </View>

        {/* Valor Total */}
        <View style={styles.section}>
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.value}>{safeData.valorTotal}</Text>
        </View>

        {/* Itens Locados */}
        <View style={{ marginTop: 15 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Itens Locados:
          </Text>

          {lease.leaseItems?.length ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  Produto
                </Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  Patrimônio
                </Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  Valor Unitário
                </Text>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  Período
                </Text>
              </View>

              {safeData.itens.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>
                    {/* {item.patrimonio?.produto?. || "-"} */}
                  </Text>
                  <Text style={styles.tableCell}>
                    {item.patrimonio?.numero_patrimonio || "-"}
                  </Text>
                  <Text style={styles.tableCell}>
                    {formatCurrency(item.valor_negociado_diario)}
                  </Text>
                  <Text style={styles.tableCell}>{item.periodo || "-"}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontStyle: "italic" }}>Nenhum item registrado</Text>
          )}
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Emitido em: {new Date().toLocaleDateString("pt-BR")}</Text>
          <Text style={{ marginTop: 5 }}>Sistema de Gestão de Locações</Text>
        </View>
      </Page>
    </Document>
  );
};

export default LeaseContractPDF;
