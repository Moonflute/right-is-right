import { Play, Pause, RotateCcw, Trash2, Plus, Minus, ChevronUp, ChevronDown, Edit2 } from 'lucide-react'

// Convert seconds to HH:MM:SS format
const formatTime = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function QuestItem({ quest, index, totalItems, onToggle, onReset, onAdjust, onDelete, onReorder, onEdit }) {
  const { title, type, targetTime, currentTime, isRunning } = quest
  
  let barWidth = "0%"
  let barColor = ""
  let isCompleted = false
  let timeText = ""
  let timeColor = "var(--text-secondary)"

  if (type === 'plus') {
    let percent = (currentTime / targetTime) * 100
    if (percent > 100) percent = 100
    barWidth = `${percent}%`
    isCompleted = currentTime >= targetTime
    timeText = `${formatTime(currentTime)} / ${formatTime(targetTime)}`
    barColor = "linear-gradient(90deg, #34d399, var(--accent-plus))"
    if (isCompleted) timeColor = "var(--accent-plus)"
  } else if (type === 'minus') {
    const phaseColors = [
      "linear-gradient(270deg, #34d399, var(--accent-plus))",   // Phase 0: Green
      "linear-gradient(270deg, #f87171, var(--accent-minus))",  // Phase 1: Red
      "linear-gradient(270deg, #c084fc, #a855f7)",              // Phase 2: Purple
      "linear-gradient(270deg, #fb923c, #f97316)",              // Phase 3: Orange
      "linear-gradient(270deg, #facc15, #eab308)",              // Phase 4: Yellow
      "linear-gradient(270deg, #ef4444, #991b1b)"               // Phase 5: Dark Red
    ]
    
    const phase = Math.floor(currentTime / targetTime)
    const percent = ((currentTime % targetTime) / targetTime) * 100
    
    if (phase === 0) {
      // Phase 0: Shirnks to the right limit (100% -> 0%)
      barWidth = `${100 - percent}%`
      barColor = phaseColors[0]
      timeText = `${formatTime(targetTime - currentTime)} 남음 / ${formatTime(targetTime)}`
    } else {
      // Phase 1+: Overtime, grows from right (0% -> 100%)
      barWidth = `${percent}%`
      barColor = phaseColors[Math.min(phase, phaseColors.length - 1)]
      timeText = `+${formatTime(currentTime - targetTime)} 오버! / ${formatTime(targetTime)}`
      timeColor = "var(--accent-minus)" // Turn text red when overtime
    }
  }

  return (
    <div className={`quest-item type-${type}`}>
      <div className="quest-header">
        <div className="quest-info">
          <div className="quest-title">{title}</div>
          <div className="quest-time" style={{ color: timeColor }}>
            {timeText}
          </div>
          
          <div className="time-adj-group">
            <button className="time-adj-btn" onClick={() => onAdjust(-1)} title="-1 Min" disabled={currentTime <= 0}>
              <Minus size={14} />
            </button>
            <button className="time-adj-btn" onClick={() => onAdjust(1)} title="+1 Min" disabled={isCompleted}>
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="quest-controls">
          <div className="reorder-group">
            <button className="reorder-btn" disabled={index === 0} onClick={() => onReorder(-1)} title="위로 올리기">
              <ChevronUp size={14} />
            </button>
            <button className="reorder-btn" disabled={index === totalItems - 1} onClick={() => onReorder(1)} title="아래로 내리기">
              <ChevronDown size={14} />
            </button>
          </div>
          <button className="btn-icon play" onClick={onToggle} disabled={isCompleted}>
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="btn-icon reset" onClick={onReset} title="초기화">
            <RotateCcw size={20} />
          </button>
          <button className="btn-icon reset" onClick={onEdit} title="수정하기">
            <Edit2 size={20} />
          </button>
          <button className="btn-icon reset" onClick={onDelete} title="삭제하기">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: barWidth, background: barColor }}></div>
      </div>
    </div>
  )
}

export default QuestItem
