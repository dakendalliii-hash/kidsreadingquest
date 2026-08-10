export default function ActionButton({ label }: { label: string }) {
  return (
    <button
      className="btn-blue full-card-button"
      type="submit"
    >
      {label}
    </button>
  );
}
