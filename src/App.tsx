import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import { GameSession } from './components/GameSession/GameSession';
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher';
import { ModeSelection } from './components/ModeSelection/ModeSelection';
import type { GameMode } from './shared/types';

const App = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<GameMode | null>(null);

  const handleModeSelect = (selectedMode: GameMode) => {
    setMode(selectedMode);
  };

  const handleBack = () => {
    setMode(null);
  };

  return (
    <main className="game">
      <LanguageSwitcher />
      <h1>{t('app.title')}</h1>
      {mode === null ? (
        <ModeSelection onSelect={handleModeSelect} />
      ) : (
        <GameSession key={mode} mode={mode} onBack={handleBack} />
      )}
    </main>
  );
};

export default App;
