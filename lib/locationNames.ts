type LangMap = Record<string, string>;
type LocationMap = Record<string, LangMap>;

export const cityNames: LocationMap = {
  "Wrocław":  { es: "Breslavia", en: "Wroclaw",  pl: "Wrocław" },
  "Warsaw":   { es: "Varsovia",  en: "Warsaw",   pl: "Warszawa" },
  "Warszawa": { es: "Varsovia",  en: "Warsaw",   pl: "Warszawa" },
  "Kraków":   { es: "Cracovia",  en: "Krakow",   pl: "Kraków" },
  "Krakow":   { es: "Cracovia",  en: "Krakow",   pl: "Kraków" },
  "Berlin":   { es: "Berlín",    en: "Berlin",   pl: "Berlin" },
  "Dresden":  { es: "Dresde",    en: "Dresden",  pl: "Drezno" },
  "Leipzig":  { es: "Leipzig",   en: "Leipzig",  pl: "Lipsk" },
  "Poznań":   { es: "Poznan",    en: "Poznan",   pl: "Poznań" },
  "Potsdam":  { es: "Potsdam",   en: "Potsdam",  pl: "Poczdam" },
  "Stuttgart":{ es: "Stuttgart", en: "Stuttgart",pl: "Stuttgart" },
  "Bonn":     { es: "Bonn",      en: "Bonn",     pl: "Bonn" },
};

export const countryNames: LocationMap = {
  "Poland":  { es: "Polonia",  en: "Poland",  pl: "Polska" },
  "Germany": { es: "Alemania", en: "Germany", pl: "Niemcy" },
};

export function translateCity(city: string, lang: string): string {
  return cityNames[city]?.[lang] ?? city;
}

export function translateCountry(country: string, lang: string): string {
  return countryNames[country]?.[lang] ?? country;
}