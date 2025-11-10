/* eslint-disable @typescript-eslint/ban-ts-comment */
// components/LeaseContractPDF.tsx
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { LeaseProps } from "@interfaces/Lease";
type GroupedItem = {
  productName: string;
  quantity: number;
  valorTotal: number;
};
// Registrar fontes
Font.register({
  family: "Times-Roman",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/timesnewroman/v15/TYRl0NzwUL_p2MvRlJBoQyA.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/timesnewroman/v15/TYRl0NzwUL_p2MvRlJBoQyA.ttf",
      fontWeight: "bold",
    },
  ],
});

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 0.5,
    textAlign: "center",
  },
  title: {
    fontSize: 10,
    marginBottom: 0.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: 12,
    marginTop: 0.5,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  section: {
    marginBottom: 1,
    marginTop: 1,
  },
  clauseTitle: {
    fontSize: 11,
    marginBottom: 2.5,
    marginTop: 2.5,
    fontWeight: "bold",
    textAlign: "left",
    // marginVertical: 2,
    textTransform: "uppercase",
    lineHeight: 0.9,
  },
  clauseText: {
    marginBottom: 2,
    marginTop: 2,
    fontSize: 10,
    textAlign: "justify",
    lineHeight: 0.9,
  },
  signatureSection: {
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    marginTop: 2,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginBottom: 2,
    height: 30,
  },
  table: {
    width: "100%",
    marginVertical: 2,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#000",
    flex: 1,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  logoContainer: {
    height: 50,
    marginVertical: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 150,
    marginVertical: 0.5,
    // height: "auto",
    maxHeight: 120, // Mantém a proporção
  },
  footer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    fontSize: 10,
  },
  pageNumber: {
    fontSize: 10,
  },
});

const logoBase64 =
  "data:image/png;base64,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";
// Funções auxiliares (mantidas as mesmas)
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

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "NÃO INFORMADO";
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR" , {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  .replace(",", "")
};

const Footer = () => (
  <View style={styles.footer} fixed>
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) =>
        `Página ${pageNumber} de ${totalPages}`
      }
    />
  </View>
);

// const numberToWords = (num: number): string => {
//   // Implementação simplificada - considere usar uma biblioteca para conversão completa
//   const units = [
//     "",
//     "um",
//     "dois",
//     "três",
//     "quatro",
//     "cinco",
//     "seis",
//     "sete",
//     "oito",
//     "nove",
//   ];
//   const teens = [
//     "dez",
//     "onze",
//     "doze",
//     "treze",
//     "quatorze",
//     "quinze",
//     "dezesseis",
//     "dezessete",
//     "dezoito",
//     "dezenove",
//   ];
//   const tens = [
//     "",
//     "dez",
//     "vinte",
//     "trinta",
//     "quarenta",
//     "cinquenta",
//     "sessenta",
//     "setenta",
//     "oitenta",
//     "noventa",
//   ];

//   if (num < 10) return units[num];
//   if (num < 20) return teens[num - 10];
//   if (num < 100)
//     return (
//       tens[Math.floor(num / 10)] +
//       (num % 10 !== 0 ? " e " + units[num % 10] : "")
//     );
//   return num.toString();
// };

const LeaseContractPDF = ({ lease }: { lease?: LeaseProps | null }) => {
  console.log(lease);
  if (!lease) {
    return (
      <Document>
        <Page size="A4">
          <Text>Contrato não disponível</Text>
        </Page>
      </Document>
    );
  }

  // Calcula o total de dias e valor total
  // const startDate = lease.data_inicio ? new Date(lease.data_inicio) : null;
  // const endDate = lease.data_prevista_devolucao
  //   ? new Date(lease.data_prevista_devolucao)
  //   : null;
  // const days =
  //   startDate && endDate
  //     ? Math.ceil(
  //         (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  //       )
  //     : 0;
  // const totalValue = lease.valor_total || 0;

  function parseToNumber(value: string | number | undefined | null): number {
    return Number(value) || 0;
  }

  const groupedItems = lease.leaseItems?.reduce<Record<string, GroupedItem>>(
    (acc, item) => {
      const productName = item.patrimonio?.produto?.name || "-";

      // Calcula o valor total do item
      let valorTotalPorItem: number;

      // Se valor_total foi editado manualmente, usa ele
      if (item.valor_total != null && item.valor_total > 0) {
        valorTotalPorItem = parseToNumber(item.valor_total);
      } else {
        // Senão, calcula baseado no período de cobrança
        const periodo = item.periodo_cobranca || item.periodo || "diario";
        const valorNegociado =
          periodo === "diario" ? parseToNumber(item.valor_negociado_diario) :
          periodo === "semanal" ? parseToNumber(item.valor_negociado_semanal) :
          periodo === "quinzenal" ? parseToNumber(item.valor_negociado_quinzenal) :
          periodo === "mensal" ? parseToNumber(item.valor_negociado_mensal) :
          parseToNumber(item.valor_negociado_anual);

        const dias = item.quantidade_dias || 1;
        valorTotalPorItem = valorNegociado * dias;
      }

      if (!acc[productName]) {
        acc[productName] = {
          productName,
          quantity: 0,
          valorTotal: 0,
        };
      }

      acc[productName].quantity += 1;
      acc[productName].valorTotal += valorTotalPorItem;

      return acc;
    },
    {}
  );

  const groupedArray = Object.values(groupedItems);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            LOCAÇÃO DE EQUIPAMENTOS PARA CONSTRUÇÃO CIVIL
          </Text>

          <View
            style={{
              height: 40,
              marginVertical: 0,
              // border: "1px dashed #000",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={styles.logoContainer}>
              <Image
                style={styles.logoImage}
                src={logoBase64}
                // @ts-expect-error
                alt="Logo da empresa"
              />
            </View>
          </View>
          <Text style={styles.mainTitle}>
            CONTRATO DE LOCAÇÃO DE BENS MÓVEIS
          </Text>
        </View>

        {/* Numeração do contrato */}
        <View style={styles.section}>
          {/* NUMERO_CONTRATO */}
          <Text style={{ fontWeight: "bold" }}>
            CONTRATO Nº {String(lease.id_locacao).padStart(4, "0")}
          </Text>
          {/*<Text>{String(lease.id_locacao).padStart(4, '0')}</Text>*/}
        </View>

        {/*  DO CONTRATO */}
        <Text style={styles.clauseText}>
          Pelo presente instrumento particular de um lado{" "}
          <Text style={{ fontWeight: "bold" }}>
            FERREIRA ALUGUEL DE MÁQUINAS PARA CONSTRUÇÃO CIVIL
          </Text>
          , devidamente inscrita no CNPJ sob nº
          <Text style={{ fontWeight: "bold" }}>51.101.682/0001-60</Text> e
          Inscrição Estadual nº
          <Text style={{ fontWeight: "bold" }}>137.058.217.115</Text>
          com sede na Rua Jorge Tabah, 2950, Jardim Angela Rosa – CEP:
          14.403-615 – Franca/SP com seu representante legal infra-assinado, ora
          denominada <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> e, de
          outro lado, o abaixo identificado, denominado como{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>, convencionam a
          locação de Bens Móveis, mediante as seguintes clausulas e condições
          que se obrigam, constantes e obrigações deste contrato:
        </Text>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>
            PEDIDO: {String(lease.id_locacao).padStart(4, "0")}{" "}
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            LOCATÁRIA: {lease.cliente?.name || "NÃO INFORMADO"}
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            DOCUMENTO: {lease.cliente?.cpf_cnpj || "NÃO INFORMADO"}
          </Text>
          <Text style={{ fontWeight: "bold" }}>ENDEREÇO:{" "} 
            {[
              lease.cliente.rua || "NÃO INFORMADO",
              lease.cliente.numero,
              lease.cliente.complemento,
              lease.cliente.bairro,
              `${lease.cliente.cidade || "CIDADE NÃO INFORMADA"}/${
                lease.cliente.estado || "UF"
              }`,
              `CEP: ${lease.cliente.cep || "NÃO INFORMADO"}`,
            ]
              .filter(Boolean)
              .join(" - ")}
          </Text>
          {/*  DO OBJETO */}
          <Text style={styles.clauseTitle}>DO OBJETO</Text>
          <Text style={{ fontWeight: "bold" }}>EQUIPAMENTOS:</Text>
        </View>

        {/*  TABELA DE EQUIPAMENTOS */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Equipamento</Text>
            <Text style={styles.tableCell}>Qtd</Text>
            <Text style={styles.tableCell}>Valor Total</Text>
          </View>

          {groupedArray.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{item.productName}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                {formatCurrency(item.valorTotal)}
              </Text>
            </View>
          ))}
        </View>
        


        {/*  Cláusula 1ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 1ª</Text>- O presente
          Instrumento tem como objeto a locação pela{" "}
          <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> à{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> do bem(ns)
          móvel(eis) de sua propriedade, nos termos do artigo 565 e seguintes do
          Código Civil, conforme discriminadas abaixo:
        </Text>
        {/* DO PRAZO DA LOCAÇÃO */}
        {/*  Cláusula 2ª */}
        <Text style={styles.clauseTitle}>DO PRAZO DA LOCAÇÃO</Text>
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 2ª</Text>- A locação
          será por dias corridos, incluindo sábados, domingos e feriados,
          vigorando pelo prazo certo de{" "}
          <Text style={{ fontWeight: "bold" }}>
          <Text>{formatDateTime(lease.data_inicio)}</Text>{" à "}
          <Text>{formatDateTime(lease.data_prevista_devolucao)}</Text></Text>, ou até a efetiva
          retirada ou a devolução de todos os bem(ns) no depósito da{" "}
          <Text style={{ fontWeight: "bold" }}>LOCADORA</Text>.
        </Text>
        {/*  Cláusula 3ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 3ª</Text>- Caso a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> continue na
          posse dos equipamentos após o término da vigência inicialmente
          pactuada, o presente contrato ficará automaticamente prorrogado por
          prazo indeterminado, nas mesmas condições previstas na proposta de
          locação, observando-se o reajuste anual pelo índice IGM-P (índice
          Geral de Preços do Mercado), calculado pela Fundação Getúlio Vargas (
          FGV), vigorando a locação até a efetiva devolução dos bem(ns), devendo
          a{" "}
          <Text style={{ fontWeight: "bold" }}>
            <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>{" "}
          </Text>{" "}
          arcar com os valores da locação e de eventuais despesas pelo período
          em que permanecer na posse dos equipamentos.
        </Text>

        {/* DO PREÇO E FORMA DE PAGAMENTO */}
        {/*  Cláusula 4ª */}
        <Text style={styles.clauseTitle}>DO PREÇO E FORMA DE PAGAMENTO</Text>
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 4ª</Text>- A{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> pagará à{" "}
          <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> o valor de R$
          <Text>{lease.valor_total}</Text> referente ao aluguel na modalidade
          mensal, cuja a cobrança dar-se-á mediante a emissão do procedimento de
          retirada assinado.
        </Text>
        {/* DO INADIMPLEMENTO */}
        {/*  Cláusula 5ª */}
        <Text style={styles.clauseTitle}>DO INADIMPLEMENTO</Text>
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 5ª</Text>- Não ocorrendo
          o pagamento na data avençada, após a retirada ou a devolução dos
          bem(ns), o valor do débito será acrescido de multa moratória de 2%
          (dois por cento), correção monetária pela Tabela DEPRE Tribunal de
          Justiça do Estado de São Paulo e juros de mora de 1% (um por cento) ao
          mês pro rata die (proporcional ao dia) até a sua efetiva compensação,
          com incidência de multa compensatória de 20% (vinte por cento), além
          das custas processuais e honorários advocatícios de 20% (vinte por
          cento), constituindo-se automaticamente a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> em mora,
          independentemente de qualquer notificação prévia, autorizando a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> a rescisão do
          presente contrato, de pleno direito, promover a execução do presente
          instrumento.
        </Text>
        {/*  Cláusula 6ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 6ª</Text>- Na
          impossibilidade de reaver os bem(ns) locados ou ocorrendo extravios,
          furtos ou por terceiro desconhecido dos bem(ns) locados e entregues, a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> responderá pela
          indenização correspondente ao valor real de cada equipamento (valor
          unitário de indenização) conforme descrito na Cláusula 1ª, do
          procedimento de retirada assinado, sem qualquer abatimento, além dos
          valores locatícios descritos no contrato em aberto e seus encargos
          conforme previstos na Cláusula 5ª, sem prejuízo de eventuais perdas e
          danos sofridos pela LOCADORA, nos termos do artigo 570 do Código Civil
        </Text>
        {/* DA RETIRADA E DEVOLUÇÃO DOS BENS LOCADOS */}
        {/*  Cláusula 7ª */}
        <Text style={styles.clauseTitle}>
          DA RETIRADA E DEVOLUÇÃO DOS BENS LOCADOS
        </Text>
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 7ª</Text>- A{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> receberá os bens
          locados em perfeito estado de funcionamento e de condições de uso,
          devidamente testados, no momento da entrega e compromete a zelar pela
          sua guarda e conservação, sendo vedado realizar qualquer tipo de
          modificação ou adaptação nas características e estruturas dos bens,
          obrigando-se a restituí-los, às suas expensas, no mesmo local em que
          os retirou, ou na entrega, devidamente limpos e prontos para uso, sem
          danos ou avaria de qualquer espécie, ressalvado o desgaste decorrente
          do uso normal, nos termos do artigo 566 do Código Civil.
        </Text>
        {/*  Cláusula 8ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 8ª</Text>- Os bens
          locados serão utilizados pela{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> exclusivamente
          na obra indicada na rua:
          <Text style={{ fontWeight: "bold" }}>
            {" "}
            {/* Endereço de entrega:{" "}*/}
            <Text style={[styles.clauseText, { fontStyle: "italic" }]}>
              {[
                lease.rua_locacao || "NÃO INFORMADO",
                lease.numero_locacao,
                lease.complemento_locacao,
                lease.bairro_locacao,
                `${lease.cidade_locacao || "CIDADE NÃO INFORMADA"}/${
                  lease.estado_locacao || "UF"
                }`,
                `CEP: ${lease.cep_locacao || "NÃO INFORMADO"}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </Text>
          sendo vedada a sua utilização em obra diversa da ora indicada, salvo
          com prévia anuência por escrito da LOCADORA, sob pena de incorrer em
          infração contratual.
        </Text>
        {/*  Cláusula 9ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 9ª</Text> - É vedado à{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> a sublocação do
          equipamento(s), emprestar ou arrendar os equipamentos constantes do
          presente contrato, ou ceder seu uso a terceiros por qualquer forma,
          ainda que a título gratuito, sob pena de descumprimento contratual.
        </Text>
        {/*  Cláusula 10ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 10ª</Text>- Na ocasião
          da devolução ou retirada dos equipamentos, os equipamentos serão
          vistoriados para conferência e aferição do estado de conservação dos
          mesmos, com a emissão do Comprovante de Devolução (protocolo de
          remoção), que deverá ser assinado pela{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> ou por qualquer
          pessoa por ela enviada no momento da devolução do bem(ns) locados,
          considerando-se esta como Preposta, o que desde já resta reconhecido
          para todos os fins de direito, nos termos do artigo 569 do Código
          Civil.
        </Text>
        {/*  Cláusula 11ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 11ª</Text>- Caso
          constatada pela <Text style={{ fontWeight: "bold" }}>LOCADORA</Text>{" "}
          qualquer irregularidade, dano, falha, vício ou desgaste por mal uso
          dos equipamentos, após a entrega, incorrerá a <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> no pagamento
          de todas as despesas decorrentes, a qual será comunicada em até 5
          (cinco) dias da data da vistoria (entrega ou retirada), sem prejuízo
          de posterior cobrança por vícios ocultos que porventura vierem a ser
          identificados, nos termos da legislação vigente, Lei 8.078 do Código
          de Defesa do Consumidor.
        </Text>
        {/* DA RESCISÃO */}
        {/*  Cláusula 12ª */}
        <Text style={styles.clauseTitle}>DA RESCISÃO</Text>
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 12ª</Text>- O presente
          contrato poderá ser denunciado (termino do contrato) por uma das
          partes, mediante aviso por escrito, com antecedência mínima de 15
          (quinze) dias, ressalvando-se o pagamento das obrigações locatícias
          abertas até a data apontada para o seu término.
        </Text>

        {/*  Cláusula 13ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 13ª</Text> - O presente
          contrato será rescindido automaticamente e de pleno direito, nos
          termos do artigo 472, 473 e 474 do Código Civil, independentemente de
          qualquer espécie de notificação à{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>, sendo facultada
          à <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> a imediata
          reintegração na posse do bem(ns), descrito neste contrato (locados),
          com o que desde já concorda a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>, especialmente
          nas seguintes hipóteses:
        </Text>
        <Text style={styles.clauseText}>
          a - Em caso de decretação da insolvência, recuperação judicial ou
          extrajudicial, falência ou dissolução do contrato com a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>;{"\n"}b - Se
          houver o descumprimento de qualquer cláusula deste contrato;
          {"\n"}c - Em caso de perda, extravio, dano grave, furto ou roubo de
          quaisquer dos bens objeto deste contrato.
          {"\n"}
          Parágrafo único - Ocorrendo quaisquer das hipóteses referidas nas
          alíneas acima, poderá a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> promover a
          retirada dos equipamentos locados, onde quer que estejam, independente
          de quaisquer avisos, notificações ou interpelação judicial e sem
          nenhuma formalidade, cujas despesas decorrentes de tal ato serão
          suportadas pela <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>,
          conforme previsto na Cláusula 6º.
        </Text>

        {/* DA ESPONSABILIDADE DA LOCATÁRIA POR ACIDENTES OU DANOS A TERCEIROS */}
        {/*  Cláusula 14ª */}
        <Text style={styles.clauseTitle}>
          DA ESPONSABILIDADE DA LOCATÁRIA POR ACIDENTES OU DANOS A TERCEIROS
        </Text>
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 14ª</Text>- Qualquer
          acidente ocorrido com os equipamentos ou por eles causados a
          terceiros, desde o momento da sua retirada até a sua efetiva devolução
          à <Text style={{ fontWeight: "bold" }}>LOCADORA</Text>, será de total
          e exclusiva responsabilidade da{" "}
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text>, isentando a{" "}
          <Text style={{ fontWeight: "bold" }}>LOCADORA</Text> de quaisquer
          obrigações civis, trabalhistas, criminais e outras, em decorrência
          deste contrato.
        </Text>
        {/*  Cláusula 15ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 15ª</Text>- A
          <Text style={{ fontWeight: "bold" }}>LOCATÁRIA</Text> se obriga a
          utilizar os bens em conformidade com a legislação vigente no tocante a
          Segurança e Saúde no Trabalho, em particular às Normas
          Regulamentadoras do Ministério do Trabalho e Emprego, instituídas pelo
          conjunto de normas regulamentares, a segurança e saúde no trabalho,
          Portaria 3214/78, e suas alterações posteriores.
        </Text>
        {/*  Cláusula 16ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 16ª</Text>- O presente
          instrumento constitui título executivo extrajudicial, nos termos do
          artigo 784, inciso III, do Código de Processo Civil.
        </Text>
        {/*  Cláusula 17ª */}
        <Text style={styles.clauseText}>
          <Text style={{ fontWeight: "bold" }}>CLÁUSULA 17ª</Text>- As partes
          elegem o foro da Comarca de Franca, Estado de São Paulo, como
          competente para dirimir toda e qualquer disputa decorrente do presente
          contrato.
        </Text>
        <Text style={styles.clauseText}>
          E por estarem assim, justas e contratadas, as partes firmam o presente
          contrato, elaborado em 2 (duas) vias de igual teor e conteúdo, com
          duas testemunhas.
        </Text>

        {/* Data e assinaturas */}
        <Text style={{ marginTop: 5, textAlign: "center" }}>
          Franca/SP,{" "}
          {formatDate(lease.data_inicio) ||
            new Date().toLocaleDateString("pt-BR")}
          .
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              LOCADORA
            </Text>
            <View style={styles.signatureLine}></View>
            {/* <Text style={{ textAlign: "center" }}>[Assinatura]</Text>
            <Text style={{ textAlign: "center" }}>[Nome completo e RG]</Text> */}
          </View>

          <View style={styles.signatureBox}>
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              LOCATÁRIA
            </Text>
            <View style={styles.signatureLine}></View>
            {/* <Text style={{ textAlign: "center" }}>[Assinatura]</Text>
            <Text style={{ textAlign: "center" }}>[Nome completo e RG]</Text> */}
          </View>
        </View>

        <View style={{ marginTop: 5 }}>
          <Text style={{ fontWeight: "bold" }}>TESTEMUNHAS</Text>
          {/* <Text>1. [Nome completo e RG]</Text> */}
          <View
            style={[styles.signatureLine, { width: "50%", marginTop: 5 }]}
          ></View>
          {/* <Text style={{ marginTop: 15 }}>2. [Nome completo e RG]</Text> */}
          <View
            style={[styles.signatureLine, { width: "50%", marginTop: 5 }]}
          ></View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
};

export default LeaseContractPDF;
