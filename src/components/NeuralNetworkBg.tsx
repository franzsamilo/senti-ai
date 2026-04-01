"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COUNT = 40;
const MAX_VELOCITY = 0.5;
const CONNECTION_DISTANCE = 150;
const NODE_COLOR = "rgba(255, 50, 82, 0.3)";
const LINE_MAX_OPACITY = 0.15;

function randomVelocity(): number {
  return (Math.random() - 0.5) * MAX_VELOCITY * 2;
}

function createNodes(width: number, height: number): Node[] {
  return Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomVelocity(),
    vy: randomVelocity(),
  }));
}

export default function NeuralNetworkBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialise nodes on resize so they stay within bounds
      nodesRef.current = createNodes(canvas.width, canvas.height);
    }

    resize();

    function draw() {
      if (!canvas || !ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;

      // Update positions and bounce
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) {
          node.x = 0;
          node.vx = Math.abs(node.vx);
        } else if (node.x > width) {
          node.x = width;
          node.vx = -Math.abs(node.vx);
        }

        if (node.y < 0) {
          node.y = 0;
          node.vy = Math.abs(node.vy);
        } else if (node.y > height) {
          node.y = height;
          node.vy = -Math.abs(node.vy);
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = LINE_MAX_OPACITY * (1 - dist / CONNECTION_DISTANCE);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255, 50, 82, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = NODE_COLOR;
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
