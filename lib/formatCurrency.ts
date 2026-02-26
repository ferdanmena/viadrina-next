export function formatCurrency(
  amount: number,
  currency?: string,
  locale: string = "en-GB"
) {
  const safeCurrency = currency || "EUR";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: safeCurrency,
    currencyDisplay: "code",
  }).format(amount);
}