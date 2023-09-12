import { useRef, useEffect, useState } from "react";
import "./styles.css";

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  scaleFactor: number
) => {
  width *= scaleFactor;
  height *= scaleFactor;
  radius *= scaleFactor;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

type RingProps = {
  ringColor?: string;
  surroundRingTo?: string;
  defaultRingSize?: number; // in px
  hideRingFor?: string;
};

const Ring = ({
  ringColor = "#030F26",
  surroundRingTo = "surround-ring",
  hideRingFor = "hide-ring",
}: RingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let rectDefaultWidth = 32;
  let rectDefaultHeight = 32;
  const scale = useRef({ width: rectDefaultWidth, height: rectDefaultHeight });
  const pos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 }); // the target position (cursor's position)
  const targetRectPos = useRef({ x: 0, y: 0 });

  const lerpSpeed = 0.4; // adjust this to change the speed of the ring

  let outsideCanvas = false;

  const handleMouseLeave = () => {
    outsideCanvas = true;
  };
  const handleMouseEnter = () => {
    outsideCanvas = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let rectWidth = rectDefaultWidth;
    let rectHeight = rectDefaultHeight;
    let rectX = pos.current.x - rectWidth / 2;
    let rectY = pos.current.y - rectWidth / 2 - 2;

    let isRingHoveringButton = false;
    let hideRing = false;
    let rect: any;

    let canvasRect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / canvasRect.width; // relationship bitmap vs. element for X
    let scaleY = canvas.height / canvasRect.height; // relationship bitmap vs. element for Y

    const updateMousePosition = (event: any) => {
      canvasRect = canvas.getBoundingClientRect();
      scaleX = canvas.width / canvasRect.width; // relationship bitmap vs. element for X
      scaleY = canvas.height / canvasRect.height; // relationship bitmap vs. element for Y

      const x = (event.clientX - canvasRect.left) * scaleX; // scale mouse coordinates after they have
      const y = (event.clientY - canvasRect.top) * scaleY; // been adjusted to be relative to element

      targetPos.current = { x, y };

      isRingHoveringButton =
        event.target.closest("." + surroundRingTo) !== null;
      hideRing = event.target.closest("." + hideRingFor) !== null;

      rect = event.target.getBoundingClientRect();
    };

    let animationFrameId: any = null;

    const updateRingPosition = () => {
      if (isRingHoveringButton) {
        targetRectPos.current = {
          x: (rect.left - canvasRect.left) * scaleX,
          y: (rect.top - canvasRect.top) * scaleY,
        };
      } else {
        targetRectPos.current = {
          x: pos.current.x - rectWidth / 2,
          y: pos.current.y - rectHeight / 2 - 2,
        };
      }

      // lerp the scale and position of the ring
      scale.current.width +=
        ((isRingHoveringButton ? rect.width * scaleX : rectDefaultWidth) -
          scale.current.width) *
        lerpSpeed;
      scale.current.height +=
        ((isRingHoveringButton ? rect.height * scaleY : rectDefaultHeight) -
          scale.current.height) *
        lerpSpeed;

      pos.current.x += (targetPos.current.x - pos.current.x) * lerpSpeed;
      pos.current.y += (targetPos.current.y - pos.current.y) * lerpSpeed;

      // lerp the position of the rectangle
      rectX += (targetRectPos.current.x - rectX) * lerpSpeed;
      rectY += (targetRectPos.current.y - rectY) * lerpSpeed;

      rectWidth = scale.current.width;
      rectHeight = scale.current.height;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const radius = rectHeight / 2;

      roundRect(
        context,
        isRingHoveringButton ? rectX : rectX + rectDefaultWidth / 10,
        isRingHoveringButton ? rectY : rectY + rectDefaultHeight / 8,
        outsideCanvas ? 0 : rectWidth,
        outsideCanvas ? 0 : rectHeight,
        outsideCanvas ? 0 : radius,
        1
      );
      context.strokeStyle = ringColor;
      context.lineWidth = 3;

      if (!hideRing) {
        context.stroke();
      }

      animationFrameId = window.requestAnimationFrame(updateRingPosition);
    };

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    animationFrameId = window.requestAnimationFrame(updateRingPosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("resize", handleResize);

      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-for-cursor-ring"
      width={window.innerWidth * window.devicePixelRatio}
      height={window.innerHeight * window.devicePixelRatio}
    />
  );
};

export default Ring;
