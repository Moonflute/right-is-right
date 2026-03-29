import { X } from 'lucide-react'

function HistoryModal({ history, onClose }) {
  // history: [{ date: '2023-11-01', score: 85, items: [{ title: '...', percent: 100, type: 'plus' }] }]
  
  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ marginBottom: 0 }}>기록 (History)</h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="history-list">
          {sortedHistory.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '2rem 0' }}>아직 기록된 일일 데이터가 없습니다.</p>
          ) : (
            sortedHistory.map((entry, idx) => (
              <div key={idx} className="history-card">
                <div className="history-card-header">
                  <h3>{entry.date}</h3>
                  <span className="history-score" style={{ color: `hsl(${Math.floor((entry.score / 100) * 120)}, 80%, 60%)` }}>
                    Total {entry.score.toFixed(1)}%
                  </span>
                </div>
                <div className="history-items">
                  {entry.items.map((item, iDx) => (
                    <div key={iDx} className="history-item">
                      <span className="history-item-title">
                        {item.type === 'plus' ? '🟢' : '🔴'} {item.title}
                      </span>
                      <span className="history-item-percent">
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryModal
