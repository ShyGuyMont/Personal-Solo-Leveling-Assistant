export function ProgressBar({
  value,
  max,
  tone = 'mint',
  label,
  compact = false,
}: {
  value: number;
  max: number;
  tone?: 'mint' | 'purple' | 'warning';
  label?: string;
  compact?: boolean;
}) {
  const percentage = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div className={`progress ${compact ? 'progress--compact' : ''}`}>
      {label && (
        <div className="progress__label">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span
          className={`progress__fill progress__fill--${tone}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
