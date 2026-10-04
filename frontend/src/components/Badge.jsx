export default function Badge({ value }) {
  return <span className={`badge badge-${value || 'pending'}`}>{value || 'pending'}</span>;
}
