import React, { useState } from 'react';

const ControlPanel = ({ onStartPhase }) => {
    const [startTime, setStartTime] = useState('');

    return (
        <div className="control-panel">
            <h2>選擇測驗項目</h2>
            <div className="input-group">
                <label>開始時間 (選填)</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
            </div>

            <div className="button-group">
                <button onClick={() => onStartPhase('reading', startTime)} className="btn-primary">
                    開始閱讀測驗
                </button>
                <button onClick={() => onStartPhase('math', startTime)} className="btn-primary">
                    開始數學測驗
                </button>
                <button onClick={() => onStartPhase('chinese', startTime)} className="btn-primary">
                    開始國字測驗
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;
