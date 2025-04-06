export function cpfCnpjMask(value: string | undefined | null): string {
  const numbers = (value || "").replace(/\D/g, "");
  return numbers.length <= 11
    ? "999.999.999-99" // CPF
    : "99.999.999/9999-99"; // CNPJ
}
