import { useState } from 'react'

function AddQuestModal({ onAdd, onClose, editData = null }) {
  const [title, setTitle] = useState(editData ? editData.title : '')
  const [type, setType] = useState(editData ? editData.type : 'plus')
  const [hours, setHours] = useState(editData ? Math.floor(editData.targetTime / 3600) : 0)
  const [minutes, setMinutes] = useState(editData ? Math.floor((editData.targetTime % 3600) / 60) : 30)

  const handleSubmit = (e) => {
    e.preventDefault()
    const h = parseInt(hours) || 0
    const m = parseInt(minutes) || 0
    
    if (!title.trim() || (h === 0 && m === 0)) {
      alert('유효한 목표와 시간을 입력하세요.')
      return
    }
    
    const targetTimeInSeconds = (h * 3600) + (m * 60)

    onAdd({
      title: title.trim(),
      type: type,
      targetTime: targetTimeInSeconds
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">{editData ? '퀘스트 수정' : '새 퀘스트 추가'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>제목</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="예: 영어 단어 100개 외우기" 
              autoFocus 
              required
            />
          </div>

          <div className="input-group">
            <label>유형 (Type) {editData && "(유형은 수정할 수 없습니다)"}</label>
            <select value={type} onChange={e => setType(e.target.value)} disabled={!!editData}>
              <option value="plus">🟢 달성 목표 (Target : 채워야 할 시간)</option>
              <option value="minus">🔴 제한 한도 (Limit : 방어해야 할 시간)</option>
            </select>
            <p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem'}}>
              {type === 'plus' 
                ? '0초부터 시작해서 설정한 시간까지 게이지를 채워나가는 생산적인 목표입니다.' 
                : '허용된 잉여 시간을 깎아나가며 일정 한도 안에서 절제하는 목표입니다.'}
            </p>
          </div>

          <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>시간</label>
              <input 
                type="number" 
                min="0" 
                value={hours} 
                onChange={e => setHours(e.target.value)} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>분</label>
              <input 
                type="number" 
                min="0" 
                max="59" 
                value={minutes} 
                onChange={e => setMinutes(e.target.value)} 
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary">{editData ? '수정하기' : '추가하기'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddQuestModal
