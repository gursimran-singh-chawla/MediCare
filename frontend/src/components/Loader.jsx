export default function Loader({ label = 'Loading', fullscreen = false }) {
  return (
    <div className={`loader ${fullscreen ? 'loader-fullscreen' : ''}`} role="status">
      <span className="loader-ring" />
      <span className="loader-label">{label}…</span>
    </div>
  );
}
