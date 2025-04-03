import ISSGlobe from '@/components/iss-globe';

export default function HomePage() {
  return (
    <div className="globe-container">
      <h1>ISS Tracker</h1>
      <ISSGlobe data-testid="iss-globe" />
    </div>
  );
}

