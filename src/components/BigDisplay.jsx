import React from 'react';

const BigDisplay = ({ taskName, timeLeft, isActive }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="big-display">
            <h1 className="task-name">{taskName || '準備開始'}</h1>
            <div className={`timer ${isActive ? 'active' : ''}`}>
                {formatTime(timeLeft)}
            </div>
        </div>
    );
};

export default BigDisplay;
