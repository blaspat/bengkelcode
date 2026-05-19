/**
 * Ad placeholder slot — matches visual style of bengkelcode tools.
 * Place below output panel, before FABs (or at end of content for non-FAB layouts).
 */
export default function AdPlaceholder() {
  return (
    <div
      className="mx-auto flex flex-col items-center justify-center rounded-xl border-dashed"
      style={{
        width: '300px',
        height: '150px',
        border: '2px dashed #fed7aa',
        backgroundColor: '#fff7ed',
      }}
    >
      <span
        className="text-xs uppercase tracking-wider font-medium"
        style={{ color: '#fb923c' }}
      >
        Advertisement
      </span>
    </div>
  )
}