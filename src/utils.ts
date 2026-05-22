import { countries } from './data/countries';
import { Country, QuizMode, RegionOption } from './types/quiz';

export const normalizeAnswer = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ');

export const getCountriesByRegion = (region: RegionOption) => {
  if (region === 'world') return countries;

  return countries.filter((country) => {
    if (region === 'americas') return country.region === 'Americas';
    if (region === 'europe') return country.region === 'Europe';
    if (region === 'africa') return country.region === 'Africa';
    if (region === 'asia') return country.region === 'Asia';
    if (region === 'oceania') return country.region === 'Oceania';

    return true;
  });
};

export const getRandomCountry = (
  current?: Country,
  region: RegionOption = 'world'
) => {
  const regionCountries = getCountriesByRegion(region);
  const options = regionCountries.filter(
    (item) => item.country !== current?.country
  );

  return options[Math.floor(Math.random() * options.length)];
};

export const isCorrectAnswer = (
  answer: string,
  country: Country,
  mode: QuizMode
) => {
  const normalized = normalizeAnswer(answer);
  const expectedCountry = normalizeAnswer(country.country);
  const aliases = country.aliases?.map(normalizeAnswer) ?? [];

  return normalized === expectedCountry || aliases.includes(normalized);
};

export const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');

  return `${min}:${sec}`;
};