
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import useDataStore from '../store/useDataStore';
import type { EnergyDataPoint } from '../types';

const EnergyChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const energyHistory = useDataStore((state) => state.energyHistory);

  useEffect(() => {
    if (!svgRef.current || energyHistory.length < 2) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 300 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(energyHistory, d => d.time) as [Date, Date])
      .range([0, width]);

    const yMax = d3.max(energyHistory, d => d.totalEnergy);
    const y = d3.scaleLinear()
      .domain([0, yMax ? yMax * 1.2 : 10])
      .range([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
      .attr("fill", "#9ca3af");
    
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
       .selectAll("text")
      .attr("fill", "#9ca3af");
      
    svg.selectAll("path.domain").attr("stroke", "#4b5563");
    svg.selectAll("line").attr("stroke", "#4b5563");

    const createLine = (accessor: (d: EnergyDataPoint) => number) =>
        d3.line<EnergyDataPoint>()
            .x(d => x(d.time))
            .y(d => y(accessor(d)))
            .curve(d3.curveMonotoneX);

    const paths = [
      { dataKey: 'kineticEnergy', color: '#f97316', label: 'Kinetic' },
      { dataKey: 'potentialEnergy', color: '#22c55e', label: 'Potential' },
      { dataKey: 'totalEnergy', color: '#eab308', label: 'Total' },
    ];

    paths.forEach(({ dataKey, color }) => {
      g.append("path")
        .datum(energyHistory)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", createLine(d => (d as any)[dataKey]));
    });

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height + margin.top + 15})`);

    paths.forEach((p, i) => {
        const legendItem = legend.append("g").attr("transform", `translate(${i * 80}, 0)`);
        legendItem.append("rect")
            .attr("x", 0)
            .attr("y", -10)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", p.color);
        legendItem.append("text")
            .attr("x", 18)
            .attr("y", 0)
            .text(p.label)
            .style("fill", "#e5e7eb")
            .style("font-size", "12px");
    });


  }, [energyHistory]);

  return (
    <div>
        <h3 className="text-md font-semibold mb-2 text-brand-text-secondary border-b border-gray-600 pb-2">System Energy</h3>
        <svg ref={svgRef} width={300} height={200}></svg>
    </div>
  );
};

export default EnergyChart;
