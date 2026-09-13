import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ value = 0, onChange, readOnly = false, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
      {stars.map((star) => {
        const isFilled = star <= value;
        return (
          <button
            type="button"
            key={star}
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: readOnly ? 'default' : 'pointer',
              padding: '0.1rem',
              display: 'flex',
              alignItems: 'center',
              color: isFilled ? '#f59e0b' : '#374151'
            }}
          >
            <Star size={size} fill={isFilled ? '#f59e0b' : 'none'} />
          </button>
        );
      })}
      {readOnly && value > 0 && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', marginLeft: '0.3rem' }}>
          {value}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
