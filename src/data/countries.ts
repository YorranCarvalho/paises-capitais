import countriesData from 'world-countries';
import { Country } from '../types/quiz';

export const countries: Country[] = countriesData
  .filter((country) => country.capital?.[0] && country.cca2)
  .map((country) => ({
    country: country.translations?.por?.common || country.name.common,
    capital: country.capital[0],
    code: country.cca2,
    flag: country.cca2,
    region: country.region,
    aliases: [
      country.name.common,
      country.name.official,
      ...(country.altSpellings || []),
    ],
  }));