import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const InfoGraph = () => {
  const chartRef =useRef<HTMLCanvasElement | null>(null);
  InfoGraphElement: document.getElementById('infoGraphContainer')

  useEffect(() => {
    console.log("TEST INFO GRAPH"); 
    if (chartRef && chartRef.current) {
      console.log("TEST INFO GRAPH"); 
      const ctx = chartRef.current.getContext('2d');
      
      const RelativeHumStepSize = 6;

      // Define the chart data
      
      const data = {
        lables: {count: RelativeHumStepSize, min: 0, max: 100} ,
        datasets: [
          {
            label: 'Line 1',
            data: [0, 5, 10, 15, 20],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            yAxisID: 'y',
            tension: 0.4,
          },
          {
            label: 'Line 2',
            data: [100, 8, 6, 4, 2],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            yAxisID: 'y1',
            tension: 0.4,
          },
        ],
      };

      // Define the chart options
      const options = {
        responsive: true,
        interaction: {
        mode: 'index' as 'index', // Cast mode to a valid type
          intersect: false,
        },
        stacked: false,
        plugins: {
          title: {
            display: true,
            text: 'Moisture Content k, C',
          },
        },
        scales: {
          y: {
            type: 'linear' as 'linear', // Cast type to a valid type
            display: true,
            position: 'left' as 'left',
            title: {
              display: true,
              text: 'Moisture Content by Mass [%]',
            },
          },
          y1: {
            type: 'linear' as 'linear', // Cast type to a valid type
            display: true,
            position: 'right' as 'right',
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      };

// Create the chart
      if (ctx) {
        // Create the chart
        new Chart(ctx, {
          type: 'line', // Change this to 'bar', 'scatter', etc., as needed
          data: data,
          options: options,
        });
      }
    }
  }, []);

};

export default InfoGraph;
