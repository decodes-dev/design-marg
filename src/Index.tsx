import { useRef, useEffect } from "react";
import "./styles.css";

const scaleFactor = window.innerWidth / 1400;

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

const Dot = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let rectDefaultWidth = 32 / scaleFactor;
  let rectDefaultHeight = 32 / scaleFactor;
  const scale = useRef({ width: rectDefaultWidth, height: rectDefaultHeight });
  const pos = useRef({ x: 0, y: 0 });
  const targetPos = useRef({ x: 0, y: 0 }); // the target position (cursor's position)
  const targetRectPos = useRef({ x: 0, y: 0 });

  const lerpSpeed = 0.4; // adjust this to change the speed of the dot

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

    let isDotHoveringButton = false;
    let hideDot = false;
    let rect: any;

    let canvasRect = canvas.getBoundingClientRect();
    let scaleX = canvas.width / canvasRect.width; // relationship bitmap vs. element for X
    let scaleY = canvas.height / canvasRect.height; // relationship bitmap vs. element for Y

    let dotColor = "#030F26";

    const updateMousePosition = (event: any) => {
      canvasRect = canvas.getBoundingClientRect();
      scaleX = canvas.width / canvasRect.width; // relationship bitmap vs. element for X
      scaleY = canvas.height / canvasRect.height; // relationship bitmap vs. element for Y

      const x = (event.clientX - canvasRect.left) * scaleX; // scale mouse coordinates after they have
      const y = (event.clientY - canvasRect.top) * scaleY; // been adjusted to be relative to element

      targetPos.current = { x, y };

      isDotHoveringButton = event.target.closest(".absorb-dot") !== null;
      hideDot = event.target.closest(".hide-dot") !== null;

      rect = event.target.getBoundingClientRect();
    };

    let animationFrameId: any = null;

    const updateDotPosition = () => {
      if (isDotHoveringButton) {
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

      // lerp the scale and position of the dot
      scale.current.width +=
        ((isDotHoveringButton ? rect.width * scaleX : rectDefaultWidth) -
          scale.current.width) *
        lerpSpeed;
      scale.current.height +=
        ((isDotHoveringButton ? rect.height * scaleY : rectDefaultHeight) -
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
        isDotHoveringButton ? rectX : rectX + rectDefaultWidth / 10,
        isDotHoveringButton ? rectY : rectY + rectDefaultHeight / 8,
        outsideCanvas ? 0 : rectWidth,
        outsideCanvas ? 0 : rectHeight,
        outsideCanvas ? 0 : radius,
        isDotHoveringButton ? 1 : scaleFactor
      );
      context.strokeStyle = dotColor;
      context.lineWidth = 3 * scaleFactor;

      if (!hideDot) {
        context.stroke();
      }

      animationFrameId = window.requestAnimationFrame(updateDotPosition);
    };

    window.addEventListener("mousemove", updateMousePosition);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    animationFrameId = window.requestAnimationFrame(updateDotPosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="canvas-for-cursor-dot"
      width={window.innerWidth * window.devicePixelRatio}
      height={window.innerHeight * window.devicePixelRatio}
    />
  );
};

export default Dot;
