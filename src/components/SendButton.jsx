import './SendButton.css';

export function SendButton({ onClick, disabled, isSending }) {
  return (
    <button
      type="button"
      className={`send-button ${isSending ? 'send-button--sending' : ''}`}
      onClick={onClick}
      disabled={disabled || isSending}
    >
      {isSending ? (
        <>
          <span className="send-button__spinner" />
          Sending...
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send Bulk SMS
        </>
      )}
    </button>
  );
}






