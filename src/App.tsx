import HUD from './components/HUD';
import GameMap from './components/GameMap';

export default function App() {
  return (
    <div className="paper-bg min-h-screen w-full flex">
      <HUD />
      <main className="flex-1 relative overflow-hidden">
        <GameMap />
      </main>
    </div>
  );
}
