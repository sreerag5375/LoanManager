import React from 'react';

const Keypad = ({ onNumber, onDelete, onClear }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            if (key === '⌫') onDelete();
            else onNumber(key);
          }}
          className={`
            h-20 rounded-3xl text-2xl font-semibold transition-all active:scale-95 active:bg-slate-200
            ${key === '⌫' ? 'text-slate-400 bg-slate-50' : 'text-slate-900 bg-slate-50 hover:bg-slate-100'}
          `}
        >
          {key}
        </button>
      ))}
    </div>
  );
};

export default Keypad;
