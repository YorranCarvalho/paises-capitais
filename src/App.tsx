import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Award, Clock, Flag, Globe2, Home, Trophy } from 'lucide-react';
import { countries } from './data/countries';
import {
  BestScores,
  Country,
  QuizMode,
  RegionOption,
  TimeOption,
} from './types/quiz';
import { formatTime, getRandomCountry, isCorrectAnswer } from './utils';
import 'flag-icons/css/flag-icons.min.css';

const BEST_SCORES_KEY = 'paises-capitais.bestScores';

const timeOptions: TimeOption[] = [
  { label: 'Sem tempo', minutes: null },
  { label: '10 min', minutes: 10 },
  { label: '20 min', minutes: 20 },
  { label: '30 min', minutes: 30 },
];

const defaultScores: BestScores = {
  flags: 0,
  capitals: 0,
};

const regionOptions: {
  id: RegionOption;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'world',
    title: 'Mundo todo',
    description: 'Todos os países disponíveis.',
    icon: '🌎',
  },
  {
    id: 'americas',
    title: 'América',
    description: 'América do Sul, Norte e Central.',
    icon: '🌎',
  },
  {
    id: 'europe',
    title: 'Europa',
    description: 'Países europeus.',
    icon: '🇪🇺',
  },
  {
    id: 'africa',
    title: 'África',
    description: 'Países africanos.',
    icon: '🌍',
  },
  {
    id: 'asia',
    title: 'Ásia',
    description: 'Países asiáticos.',
    icon: '🌏',
  },
  {
    id: 'oceania',
    title: 'Oceania',
    description: 'Austrália, Nova Zelândia e ilhas do Pacífico.',
    icon: '🏝️',
  },
];

function getStoredBestScores(): BestScores {
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    if (!raw) return defaultScores;

    const parsed = JSON.parse(raw) as Partial<BestScores>;

    return {
      flags: Number(parsed.flags || 0),
      capitals: Number(parsed.capitals || 0),
    };
  } catch {
    return defaultScores;
  }
}

function saveStoredBestScores(scores: BestScores) {
  localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(scores));
}

function App() {
  const [selectedTime, setSelectedTime] = useState<TimeOption>(timeOptions[0]);
  const [selectedMode, setSelectedMode] = useState<QuizMode | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionOption | null>(
    null
  );

  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentCountry, setCurrentCountry] = useState<Country>(
    () => countries[0]
  );
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestScores, setBestScores] = useState<BestScores>(() =>
    getStoredBestScores()
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const titleByMode = useMemo(() => {
    if (mode === 'flags') return 'Acerte o país pela bandeira';
    if (mode === 'capitals') return 'Acerte o país pela capital';
    return 'Países e Capitais';
  }, [mode]);

  const bestCurrentMode = mode ? bestScores[mode] : 0;

  const handleSelectMode = (nextMode: QuizMode) => {
    setSelectedMode(nextMode);
    setSelectedRegion(null);
  };

  const startGame = (nextMode: QuizMode, region: RegionOption) => {
    setMode(nextMode);
    setSelectedMode(nextMode);
    setSelectedRegion(region);
    setCurrentCountry(getRandomCountry(undefined, region));
    setAnswer('');
    setFeedback(null);
    setCorrectCount(0);
    setWrongCount(0);
    setCurrentStreak(0);
    setIsFinished(false);
    setRemainingSeconds(selectedTime.minutes ? selectedTime.minutes * 60 : null);
  };

  const handleSelectRegion = (region: RegionOption) => {
    if (!selectedMode) return;

    startGame(selectedMode, region);
  };

  const finishGame = () => {
    if (!mode) return;

    setIsFinished(true);
    setFeedback(null);

    setBestScores((oldScores) => {
      const nextScores = {
        ...oldScores,
        [mode]: Math.max(oldScores[mode], currentStreak),
      };

      saveStoredBestScores(nextScores);
      return nextScores;
    });
  };

  const resetToHome = () => {
    setMode(null);
    setSelectedMode(null);
    setSelectedRegion(null);
    setIsFinished(false);
    setAnswer('');
    setFeedback(null);
    setRemainingSeconds(null);
  };

  const nextQuestion = () => {
    setCurrentCountry((oldCountry) =>
      getRandomCountry(oldCountry, selectedRegion ?? 'world')
    );
    setAnswer('');
  };

  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!mode || isFinished || !answer.trim()) return;

    const isCorrect = isCorrectAnswer(answer, currentCountry, mode);

    if (isCorrect) {
      const nextStreak = currentStreak + 1;

      setCorrectCount((value) => value + 1);
      setCurrentStreak(nextStreak);
      setFeedback('Boa! Resposta correta 🔥');

      setBestScores((oldScores) => {
        const nextScores = {
          ...oldScores,
          [mode]: Math.max(oldScores[mode], nextStreak),
        };

        saveStoredBestScores(nextScores);
        return nextScores;
      });
    } else {
      setWrongCount((value) => value + 1);
      setCurrentStreak(0);
      setFeedback(`Errou! A resposta certa era ${currentCountry.country}.`);
    }

    window.setTimeout(nextQuestion, 850);
  };

  useEffect(() => {
    if (!mode || isFinished || remainingSeconds === null) return;

    if (remainingSeconds <= 0) {
      finishGame();
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => (seconds === null ? null : seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [mode, isFinished, remainingSeconds]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
              <Globe2 size={16} />
              Quiz de geografia
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              {titleByMode}
            </h1>

            <p className="mt-3 max-w-2xl text-base text-slate-300 md:text-lg">
              Escolha o modo, responda o máximo que conseguir e tente bater seu
              melhor streak.
            </p>
          </div>

          {mode && (
            <button
              onClick={resetToHome}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              <Home size={18} />
              Início
            </button>
          )}
        </header>

        {!mode && (
          <div className="grid flex-1 place-items-center">
            <div className="w-full">
              <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur md:p-6">
                <div className="mb-4 flex items-center gap-2 font-bold text-slate-100">
                  <Clock size={20} />
                  Tempo de jogo
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {timeOptions.map((option) => {
                    const active = selectedTime.label === option.label;

                    return (
                      <button
                        key={option.label}
                        onClick={() => setSelectedTime(option)}
                        className={`rounded-2xl border px-4 py-4 font-bold transition ${
                          active
                            ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30'
                            : 'border-white/10 bg-slate-950/60 text-white hover:bg-white/10'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <button
                  onClick={() => handleSelectMode('flags')}
                  className={`group rounded-3xl border p-8 text-left shadow-2xl backdrop-blur transition hover:-translate-y-1 ${
                    selectedMode === 'flags'
                      ? 'border-cyan-300 bg-cyan-300/20'
                      : 'border-white/10 bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                    <Flag size={34} />
                  </div>

                  <h2 className="text-3xl font-black">Bandeiras</h2>

                  <p className="mt-3 text-slate-300">
                    Veja a bandeira, digite o nome do país e tente manter o
                    streak.
                  </p>

                  <div className="mt-8 inline-flex rounded-full bg-slate-950/70 px-4 py-2 text-sm font-bold text-cyan-200">
                    Melhor streak: {bestScores.flags}
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode('capitals')}
                  className={`group rounded-3xl border p-8 text-left shadow-2xl backdrop-blur transition hover:-translate-y-1 ${
                    selectedMode === 'capitals'
                      ? 'border-emerald-300 bg-emerald-300/20'
                      : 'border-white/10 bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-300 text-slate-950">
                    <Globe2 size={34} />
                  </div>

                  <h2 className="text-3xl font-black">Capitais</h2>

                  <p className="mt-3 text-slate-300">
                    Veja a capital, digite qual país ela pertence e some pontos.
                  </p>

                  <div className="mt-8 inline-flex rounded-full bg-slate-950/70 px-4 py-2 text-sm font-bold text-emerald-200">
                    Melhor streak: {bestScores.capitals}
                  </div>
                </button>
              </div>

              {selectedMode && (
                <section className="mt-8 animate-fade-in">
                  <div className="mb-4">
                    <h2 className="text-2xl font-black text-white">
                      Escolha uma região
                    </h2>

                    <p className="text-sm text-slate-300">
                      Agora escolha de onde virão as perguntas do quiz.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {regionOptions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => handleSelectRegion(region.id)}
                        className="group rounded-3xl border border-white/10 bg-white/10 p-5 text-left shadow-xl transition hover:-translate-y-1 hover:border-cyan-300/70 hover:bg-cyan-300/10"
                      >
                        <div className="mb-4 text-4xl">{region.icon}</div>

                        <h3 className="text-xl font-black text-white">
                          {region.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-300">
                          {region.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {mode && !isFinished && (
          <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_340px]">
            <section className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur md:p-8">
              <div className="w-full max-w-2xl text-center">
                <div className="mb-8 flex min-h-[280px] items-center justify-center rounded-3xl bg-slate-950/70 p-8 shadow-inner">
                  {mode === 'flags' ? (
                    <span
                      aria-label={`Bandeira de ${currentCountry.country}`}
                      className={`fi fi-${currentCountry.code.toLowerCase()} !block !h-48 !w-80 rounded-2xl shadow-2xl md:!h-64 md:!w-[28rem]`}
                    />
                  ) : (
                    <div>
                      <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-emerald-200">
                        Capital
                      </p>

                      <h2 className="text-5xl font-black md:text-7xl">
                        {currentCountry.capital}
                      </h2>
                    </div>
                  )}
                </div>

                <form onSubmit={submitAnswer} className="space-y-4">
                  <input
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    autoFocus
                    placeholder="Digite o nome do país..."
                    className="w-full rounded-2xl border border-white/10 bg-white px-5 py-4 text-center text-xl font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/30"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-cyan-300 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-200"
                  >
                    Responder
                  </button>
                </form>

                {feedback && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/80 px-5 py-4 text-lg font-bold">
                    {feedback}
                  </div>
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur md:p-6">
              <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-950/70 p-4">
                <span className="font-bold text-slate-300">Tempo</span>

                <span className="text-2xl font-black text-cyan-200">
                  {remainingSeconds === null
                    ? '∞'
                    : formatTime(Math.max(remainingSeconds, 0))}
                </span>
              </div>

              <div className="grid gap-4">
                <ScoreCard label="Streak atual" value={currentStreak} highlight />
                <ScoreCard label="Acertos" value={correctCount} />
                <ScoreCard label="Erros" value={wrongCount} />
                <ScoreCard
                  label="Melhor streak"
                  value={bestCurrentMode}
                  icon={<Award size={20} />}
                />
              </div>

              <button
                onClick={finishGame}
                className="mt-5 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 font-black text-white transition hover:bg-slate-900"
              >
                Encerrar jogo
              </button>
            </aside>
          </div>
        )}

        {mode && isFinished && (
          <div className="grid flex-1 place-items-center">
            <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30">
                <Trophy size={40} />
              </div>

              <h2 className="text-4xl font-black">Resultado final</h2>

              <p className="mt-3 text-slate-300">
                Seu resultado foi salvo no navegador.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ScoreCard label="Acertos" value={correctCount} />
                <ScoreCard label="Erros" value={wrongCount} />
                <ScoreCard
                  label="Melhor streak"
                  value={bestScores[mode]}
                  highlight
                />
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => startGame(mode, selectedRegion ?? 'world')}
                  className="rounded-2xl bg-cyan-300 px-5 py-4 font-black text-slate-950 transition hover:bg-cyan-200"
                >
                  Jogar novamente
                </button>

                <button
                  onClick={resetToHome}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 font-black text-white transition hover:bg-slate-900"
                >
                  Voltar ao início
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

type ScoreCardProps = {
  label: string;
  value: number;
  highlight?: boolean;
  icon?: ReactNode;
};

function ScoreCard({ label, value, highlight, icon }: ScoreCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? 'border-cyan-300/40 bg-cyan-300 text-slate-950'
          : 'border-white/10 bg-slate-950/70 text-white'
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-sm font-bold opacity-80">
        <span>{label}</span>
        {icon}
      </div>

      <strong className="text-4xl font-black">{value}</strong>
    </div>
  );
}

export default App;