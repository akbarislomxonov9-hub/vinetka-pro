import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Image as KImage, Transformer } from "react-konva";
import type Konva from "konva";

import { CANVAS_H, CANVAS_W, backgroundOf, useVinetka, type Page, type Photo } from "@/lib/vinetka-store";
import { stageRegistry } from "./stage-registry";

function useImg(src: string | null) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => setImg(image);
    return () => {
      image.onload = null;
    };
  }, [src]);
  return img;
}

function PhotoCard({
  photo,
  frame,
  textColor,
  selected,
  interactive,
  onSelect,
}: {
  photo: Photo;
  frame: string;
  textColor: string;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
}) {
  const img = useImg(photo.src);
  const updatePhoto = useVinetka((s) => s.updatePhoto);
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [appear, setAppear] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setAppear(1), 20);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (selected && interactive && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, interactive]);

  const labelH = 34;
  const imgH = photo.height - labelH;

  return (
    <>
      <Group
        ref={groupRef}
        x={photo.x}
        y={photo.y}
        opacity={appear}
        scaleX={appear ? 1 : 0.9}
        scaleY={appear ? 1 : 0.9}
        draggable={interactive}
        onMouseDown={onSelect}
        onTouchStart={onSelect}
        onDragEnd={(e) => updatePhoto(photo.id, { x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current;
          if (!node) return;
          const sx = node.scaleX();
          const sy = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          updatePhoto(photo.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(80, photo.width * sx),
            height: Math.max(100, photo.height * sy),
          });
        }}
      >
        <Rect
          width={photo.width}
          height={photo.height}
          fill="rgba(255,255,255,0.06)"
          stroke={frame}
          strokeWidth={photo.isMain ? 3 : 1.5}
          cornerRadius={10}
          shadowColor="black"
          shadowBlur={photo.isMain ? 24 : 12}
          shadowOpacity={0.35}
        />
        {img ? (
          <KImage
            image={img}
            x={6}
            y={6}
            width={photo.width - 12}
            height={imgH - 6}
            cornerRadius={7}
          />
        ) : (
          <Rect x={6} y={6} width={photo.width - 12} height={imgH - 6} fill="rgba(255,255,255,0.12)" cornerRadius={7} />
        )}
        <Text
          text={photo.name || "Ism"}
          x={4}
          y={photo.height - labelH + 8}
          width={photo.width - 8}
          align="center"
          fontSize={photo.isMain ? 19 : 15}
          fontStyle={photo.isMain ? "bold" : "normal"}
          fontFamily="Georgia, serif"
          fill={textColor}
        />
      </Group>
      {selected && interactive ? (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          anchorSize={10}
          anchorStroke={frame}
          borderStroke={frame}
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 80 || newBox.height < 100 ? oldBox : newBox)}
        />
      ) : null}
    </>
  );
}

export function PageStage({
  page,
  interactive,
  scale,
}: {
  page: Page;
  interactive: boolean;
  scale: number;
}) {
  const bg = backgroundOf(page);
  const custom = useImg(page.customBackground);
  const selectedId = useVinetka((s) => s.selectedId);
  const select = useVinetka((s) => s.select);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    if (stageRef.current) stageRegistry.set(page.id, stageRef.current);
    return () => {
      stageRegistry.delete(page.id);
    };
  }, [page.id]);

  return (
    <Stage
      ref={stageRef}
      width={CANVAS_W * scale}
      height={CANVAS_H * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) select(null);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) select(null);
      }}
      style={{ borderRadius: 12, overflow: "hidden" }}
    >
      <Layer listening={false}>
        <Rect
          width={CANVAS_W}
          height={CANVAS_H}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: CANVAS_W, y: CANVAS_H }}
          fillLinearGradientColorStops={bg.stops}
        />
        {custom ? <KImage image={custom} width={CANVAS_W} height={CANVAS_H} /> : null}
        <Rect
          x={22}
          y={22}
          width={CANVAS_W - 44}
          height={CANVAS_H - 44}
          stroke={bg.frame}
          strokeWidth={2}
          cornerRadius={8}
        />
        <Rect
          x={32}
          y={32}
          width={CANVAS_W - 64}
          height={CANVAS_H - 64}
          stroke={bg.frame}
          strokeWidth={0.8}
          opacity={0.6}
          cornerRadius={6}
        />
        <Text
          text={page.title}
          x={0}
          y={52}
          width={CANVAS_W}
          align="center"
          fontSize={38}
          fontStyle="bold"
          fontFamily="Georgia, serif"
          fill={bg.frame}
        />
        <Text
          text={page.subtitle}
          x={0}
          y={98}
          width={CANVAS_W}
          align="center"
          fontSize={20}
          fontFamily="Georgia, serif"
          fill={bg.text}
        />
      </Layer>
      <Layer>
        {page.photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            frame={bg.frame}
            textColor={bg.text}
            selected={selectedId === photo.id}
            interactive={interactive}
            onSelect={() => select(photo.id)}
          />
        ))}
      </Layer>
    </Stage>
  );
}

export default PageStage;
