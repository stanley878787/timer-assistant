import React, { useEffect, useRef } from 'react';

const Timeline = ({ sequence, currentIndex, startTime }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            const activeItem = scrollRef.current.children[currentIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [currentIndex]);

    const calculateTimeRange = (startStr, index) => {
        if (!startStr) return '';

        const [startHour, startMinute] = startStr.split(':').map(Number);
        let currentSeconds = startHour * 3600 + startMinute * 60;

        // Add duration of previous items
        for (let i = 0; i < index; i++) {
            currentSeconds += sequence[i].duration;
        }

        const format = (totalSeconds) => {
            const h = Math.floor(totalSeconds / 3600) % 24;
            const m = Math.floor((totalSeconds % 3600) / 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const itemStart = format(currentSeconds);
        const itemEnd = format(currentSeconds + sequence[index].duration);

        return `${itemStart} - ${itemEnd}`;
    };

    return (
        <div className="timeline-container">
            <div className="timeline" ref={scrollRef}>
                {sequence.map((item, index) => (
                    <div
                        key={index}
                        className={`timeline-item ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'completed' : ''}`}
                    >
                        <span className="time-marker">{index + 1}</span>
                        <div className="content">
                            <span className="name">{item.name}</span>
                            <span className="duration">{Math.floor(item.duration / 60)}分</span>
                            {startTime && (
                                <span className="absolute-time">{calculateTimeRange(startTime, index)}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
