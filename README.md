# Países e Capitais Quiz

Projeto em **React + TypeScript + Tailwind CSS + Vite**.

## Funcionalidades

- Escolha entre quiz de **bandeiras** ou **capitais**.
- Opções de tempo: sem tempo, 10 min, 20 min ou 30 min.
- Contador de acertos, erros e streak atual.
- Melhor streak salvo no `localStorage`.
- Respostas normalizadas: aceita acentos ou sem acentos.
- Layout responsivo com visual escuro, cards e efeitos com Tailwind.

## Rodando o projeto

```bash
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal, geralmente:

```bash
http://localhost:5173
```

## Build

```bash
npm run build
```

## Onde editar os países

A lista fica em:

```bash
src/data/countries.ts
```

Você pode adicionar mais países seguindo o formato:

```ts
{
  country: 'Brasil',
  capital: 'Brasília',
  flag: '🇧🇷',
  aliases: ['brasilia']
}
```
