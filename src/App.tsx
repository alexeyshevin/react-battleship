import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher';
import { ModeSelection } from './components/ModeSelection/ModeSelection';
import { GameSession } from './components/GameSession/GameSession';
import type { GameMode } from './shared/types';
import './App.css';

const App = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<GameMode | null>(null);

  return (
    <main className="game">
      <LanguageSwitcher />
      <h1>{t('app.title')}</h1>
      {mode === null ? (
        <ModeSelection onSelect={setMode} />
      ) : (
        <GameSession key={mode} mode={mode} onBack={() => setMode(null)} />
      )}
    </main>
  );
};

export default App;
