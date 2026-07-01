interface Props {
  onStay: () => void;
  onSignOut: () => void;
}

export default function InactivityWarningModal({ onStay, onSignOut }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="inactivity-title">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
        <h2 id="inactivity-title" className="text-lg font-semibold text-secondary-900 mb-2">
          Still there?
        </h2>
        <p className="text-sm text-secondary-600 mb-6">
          You've been inactive for 25 minutes. You'll be signed out in 5 minutes to protect your account.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStay}
            className="flex-1 btn-primary"
            autoFocus
          >
            Stay signed in
          </button>
          <button
            onClick={onSignOut}
            className="flex-1 btn-secondary"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
