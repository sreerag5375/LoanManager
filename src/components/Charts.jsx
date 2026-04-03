import React from 'react';

/**
 * Custom SVG Pie Chart
 * @param {Array} data - [{ label: string, value: number, color: string }]
 */
export const PieChart = ({ data, total }) => {
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const hasData = total > 0 && data.length > 0;

  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto">
      <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
        {!hasData && <circle cx="0" cy="0" r="0.8" fill="#f8fafc" stroke="#f1f5f9" strokeWidth="0.05" />}
        {hasData && data.map((slice, i) => {
          const percent = slice.value / total;
          if (percent === 0) return null;
          
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += percent;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          
          const largeArcFlag = percent > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX * 0.8} ${startY * 0.8}`,
            `A 0.8 0.8 0 ${largeArcFlag} 1 ${endX * 0.8} ${endY * 0.8}`,
            `L 0 0`,
          ].join(' ');

          return <path key={i} d={pathData} fill={slice.color} className="transition-all duration-500 hover:opacity-80" />;
        })}
        {/* Inner Hole for Donut Look */}
        <circle cx="0" cy="0" r="0.55" fill="white" />
      </svg>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total</p>
        <p className="text-lg font-semibold text-slate-900">₹{total.toLocaleString()}</p>
      </div>
    </div>
  );
};

/**
 * Custom SVG Bar Chart
 * @param {Array} data - [{ label: string, value: number }]
 */
export const BarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 120;
  
  return (
    <div className="w-full flex items-end justify-between h-[160px] px-2 gap-2">
      {data.map((item, i) => {
        const height = (item.value / maxVal) * chartHeight;
        return (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div className="relative w-full flex flex-col items-center">
                {/* Tooltip on hover */}
                <div className="absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-semibold">
                    ₹{item.value.toLocaleString()}
                </div>
                <div 
                    className="w-full bg-blue-600 rounded-t-xl transition-all duration-500 group-hover:bg-blue-700" 
                    style={{ height: `${Math.max(height, 8)}px` }}
                ></div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-3 uppercase tracking-tighter truncate w-full text-center">
                {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
