import React, { useRef, useEffect } from 'react';

interface EntityModalProps {
  type: 'level' | 'milestone' | 'challenge';
  initial: { title?: string; description?: string; type?: string };
  onClose: (refresh?: boolean) => void;
  onSubmit: (values: { title: string; description?: string; type?: string }) => Promise<void>;
}

const EntityModal: React.FC<EntityModalProps> = ({ type, initial, onClose, onSubmit }) => {
  const [title, setTitle] = React.useState(initial.title || '');
  const [description, setDescription] = React.useState(initial.description || '');
  const [challengeType, setChallengeType] = React.useState(initial.type || 'project');
  const [loading, setLoading] = React.useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ title, description, type: type === 'challenge' ? challengeType : undefined });
    setLoading(false);
    onClose(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="entity-modal-title" ref={modalRef}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 id="entity-modal-title" className="text-xl font-bold mb-4">{initial.title ? `Edit ${type}` : `Add ${type}`}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input ref={firstInputRef} className="border p-2 rounded" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required aria-label={`${type} title`} />
          {(type === 'milestone' || type === 'challenge') && (
            <textarea className="border p-2 rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required aria-label={`${type} description`} />
          )}
          {type === 'challenge' && (
            <select className="border p-2 rounded" value={challengeType} onChange={e => setChallengeType(e.target.value)} aria-label="Challenge type">
              <option value="project">Project</option>
              <option value="quiz">Quiz</option>
              <option value="reading">Reading</option>
            </select>
          )}
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700" onClick={() => onClose(false)} disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{initial.title ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntityModal; 