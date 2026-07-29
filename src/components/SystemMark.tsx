export function SystemMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`system-mark ${small ? 'system-mark--small' : ''}`} aria-hidden="true">
      <span className="system-mark__ring" />
      <span className="system-mark__core" />
    </span>
  );
}
