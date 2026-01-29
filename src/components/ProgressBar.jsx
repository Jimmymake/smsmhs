import './ProgressBar.css';

export function ProgressBar({ current, total, percent }) {
  if (total === 0) return null;

  return (
    <div className="progress-bar">
      <div className="progress-bar__header">
        <span className="progress-bar__label">Sending messages...</span>
        <span className="progress-bar__status">
          {current} of {total}
        </span>
      </div>
      
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      <div className="progress-bar__percent">{percent}%</div>
    </div>
  );
}






