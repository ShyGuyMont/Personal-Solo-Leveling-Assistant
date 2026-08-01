import { Heart } from 'lucide-react';

export function FavoriteMessageButton({
  active,
  onToggle,
  label = 'Save this message',
}: {
  active: boolean;
  onToggle: () => void | Promise<void>;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`favorite-message-button ${active ? 'is-favorite' : ''}`}
      onClick={() => void onToggle()}
      aria-label={active ? 'Remove from Words to Carry' : label}
      aria-pressed={active}
      title={active ? 'Saved to Words to Carry' : label}
    >
      <Heart size={16} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}
