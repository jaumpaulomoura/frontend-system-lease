import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { LeaseProps } from "@interfaces/Lease";
import { ReportFilters } from "./FinancialReportModal";

// Register fonts if needed
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 8,
  },
  filterInfo: {
    fontSize: 12,
    marginBottom: 5,
    color: "#444",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f8f9fa",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    marginBottom: 5,
    fontSize: 10,
    textAlign: "center",
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#666",
  },
});

interface FinancialPdfReportProps {
  leases: LeaseProps[];
  filters: ReportFilters;
}

export const FinancialPdfReport: React.FC<FinancialPdfReportProps> = ({
  leases,
  filters,
}) => {
  console.log("Leases recebidas no PDF:", leases);
  console.log("Filtros aplicados:", filters);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Calcular totais
  const totalPaid = leases
    .filter((lease) => lease.data_pagamento)
    .reduce((sum, lease) => sum + Number(lease.valor_total || 0), 0);

  const totalUnpaid = leases
    .filter((lease) => !lease.data_pagamento && lease.data_prevista_devolucao)
    .reduce((sum, lease) => sum + Number(lease.valor_total || 0), 0);

  const totalGeneral = totalPaid + totalUnpaid;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Financeiro</Text>
          <Text style={styles.subtitle}>
            Sistema de Locação - {new Date().toLocaleDateString("pt-BR")}
          </Text>
        </View>

        {/* Filtros Aplicados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtros Aplicados</Text>
          <Text style={styles.filterInfo}>
            Período: {formatDate(filters.startDate)} até{" "}
            {formatDate(filters.endDate)}
          </Text>
          {filters.clientName && (
            <Text style={styles.filterInfo}>Cliente: {filters.clientName}</Text>
          )}
          <Text style={styles.filterInfo}>
            Status:{" "}
            {filters.paymentStatus === "all"
              ? "Todos"
              : filters.paymentStatus === "paid"
              ? "Apenas Pagos"
              : "Apenas Não Pagos"}
          </Text>
        </View>

        {/* Resumo Financeiro */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumo Financeiro</Text>
          <View style={styles.summaryItem}>
            <Text>Total de Receitas Pagas:</Text>
            <Text>{formatCurrency(totalPaid)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Total de Receitas em Aberto:</Text>
            <Text>{formatCurrency(totalUnpaid)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={{ fontWeight: "bold" }}>Total Geral:</Text>
            <Text style={{ fontWeight: "bold" }}>
              {formatCurrency(totalGeneral)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Número de Locações:</Text>
            <Text>{leases.length}</Text>
          </View>
        </View>

        {/* Tabela de Locações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento das Locações</Text>

          {leases.length > 0 ? (
            <View style={styles.table}>
              {/* Header da tabela */}
              <View style={styles.tableRow}>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>ID</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Cliente</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Valor Total</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Data Pagamento</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellHeader}>Status</Text>
                </View>
              </View>

              {/* Dados da tabela */}
              {leases.map((lease) => (
                <View style={styles.tableRow} key={lease.id_locacao}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{lease.id_locacao}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {lease.cliente?.name || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {formatCurrency(Number(lease.valor_total || 0))}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {lease.data_pagamento
                        ? formatDate(lease.data_pagamento)
                        : "-"}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>
                      {lease.data_pagamento ? "Pago" : "Em Aberto"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.filterInfo}>
              Nenhuma locação encontrada para os filtros aplicados.
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Relatório gerado automaticamente pelo Sistema de Locação
        </Text>
      </Page>
    </Document>
  );
};

// Função para gerar e fazer download do PDF
export const generateFinancialReport = async (
  leases: LeaseProps[],
  filters: ReportFilters
) => {
  try {
    const doc = <FinancialPdfReport leases={leases} filters={filters} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    // Criar nome do arquivo
    const startDate = new Date(filters.startDate).toLocaleDateString("pt-BR");
    const endDate = new Date(filters.endDate).toLocaleDateString("pt-BR");
    const clientSuffix = filters.clientName ? `_${filters.clientName}` : "";
    const fileName = `relatorio_financeiro_${startDate.replace(
      /\//g,
      "-"
    )}_${endDate.replace(/\//g, "-")}${clientSuffix}.pdf`;

    // Fazer download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Erro ao gerar relatório PDF");
  }
};
