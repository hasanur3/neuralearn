'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  title: string;
}

export default function AnalyticsChart({
  type,
  data,
  title,
}: AnalyticsChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
        },
      },
    },
    scales:
      type !== 'doughnut'
        ? {
            y: {
              beginAtZero: true,
            },
          }
        : undefined,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ height: '300px' }}>
      {type === 'line' && <Line options={options} data={data} />}
      {type === 'bar' && <Bar options={options} data={data} />}
      {type === 'doughnut' && <Doughnut options={options} data={data} />}
    </div>
  );
}