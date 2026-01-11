'use client';

import React from 'react';
import styles from './WatermarkOverlay.module.css';

interface WatermarkOverlayProps {
    text: string;
    subtext?: string;
}

export const WatermarkOverlay = ({ text, subtext }: WatermarkOverlayProps) => {
    // Generate repeated pattern
    const pattern = new Array(20).fill(0);

    return (
        <div className={styles.overlayContainer}>
            {pattern.map((_, i) => (
                <div key={i} className={styles.watermarkRow}>
                    {pattern.map((_, j) => (
                        <div key={`${i}-${j}`} className={styles.watermarkItem}>
                            <span className={styles.mainText}>{text}</span>
                            {subtext && <span className={styles.subText}>{subtext}</span>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
