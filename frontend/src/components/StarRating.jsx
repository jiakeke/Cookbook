import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div>
      {[...Array(5)].map((star, i) => {
        const ratingValue = i + 1;
        return (
          <label key={i}>
            <input 
              type="radio" 
              name="rating" 
              value={ratingValue} 
              onClick={() => !readOnly && setRating(ratingValue)} 
              style={{ display: 'none' }}
            />
            <FaStar 
              color={ratingValue <= rating ? '#ffc107' : '#e4e5e9'} 
              size={25} 
              style={{ cursor: readOnly ? 'default' : 'pointer' }}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRating;
