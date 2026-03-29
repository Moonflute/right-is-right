function MasterGauge({ score }) {
  // score is 0 to 100
  // Color interpolates from Red (bad balance) to Green (good balance) based on score
  const hue = Math.floor((score / 100) * 120); // 0 is red, 120 is green
  
  return (
    <div className="master-gauge-wrapper">
      <div className="master-gauge-header">
        <h2>오늘의 밸런스</h2>
        <div className="master-score" style={{ color: `hsl(${hue}, 80%, 60%)` }}>
          {score.toFixed(1)}%
        </div>
      </div>
      <div className="progress-container master-progress-container">
        <div 
          className="progress-bar master-bar" 
          style={{ 
            width: `${score}%`, 
            background: `linear-gradient(90deg, hsl(0, 0%, 20%), hsl(${hue}, 80%, 50%))`
          }}
        ></div>
      </div>
    </div>
  )
}

export default MasterGauge
