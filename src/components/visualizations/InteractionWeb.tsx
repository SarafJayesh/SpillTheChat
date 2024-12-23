// src/components/visualizations/InteractionWeb.tsx

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  value: number;
  label: string;
  group?: string;
}

interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  value: number;
}

interface InteractionWebProps {
  nodes: NodeData[];
  links: LinkData[];
  width?: number;
  height?: number;
}

export const InteractionWeb: React.FC<InteractionWebProps> = ({
  nodes,
  links,
  width = 600,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create force simulation
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force("link", d3.forceLink<NodeData, LinkData>(links)
        .id(d => d.id)
        .strength(d => d.value * 0.001))
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Create the links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Create the nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, NodeData>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles to nodes
    node.append("circle")
      .attr("r", d => Math.sqrt(d.value) * 2)
      .attr("fill", "#69b3a2");

    // Add labels to nodes
    node.append("text")
      .text(d => d.label)
      .attr("x", 8)
      .attr("y", 3)
      .style("font-size", "10px");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as NodeData).x!)
        .attr("y1", d => (d.source as NodeData).y!)
        .attr("x2", d => (d.target as NodeData).x!)
        .attr("y2", d => (d.target as NodeData).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, NodeData, unknown>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, NodeData, unknown>, d: NodeData) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, NodeData, unknown>, d: NodeData) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default InteractionWeb;