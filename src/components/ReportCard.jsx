function ReportCard({ title, items, icon }) {
  return (
    <div className="glass-card report-card">
      <div className="card-title-row">
        <h3>{title}</h3>
        <span className="status-badge">
          {icon}
          AI reviewed
        </span>
      </div>
      <div className="report-card-list">
        {items.length ? (
          items.map((item) => (
            <div key={item.title} className={`report-item ${item.severity}`}>
              <div className="report-item-header">
                <strong>{item.title}</strong>
                <span className={`severity-badge ${item.severity}`}>{item.severity}</span>
              </div>
              <p>{item.description}</p>
            </div>
          ))
        ) : (
          <div className="report-item safe">
            <div className="report-item-header">
              <strong>No major issues detected</strong>
              <span className="severity-badge safe">safe</span>
            </div>
            <p>This category did not return a clinically important warning for the current input.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportCard;
