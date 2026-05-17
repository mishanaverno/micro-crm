import * as React from 'react';
import { cn } from '@/lib/utils';

const LANE_WIDTH = 12;
const LANE_CENTER = 6;
const GRAPH_STROKE_PX = 2.5;
const HALF_SEGMENT_OFFSET_PX = 18;
const GRAPH_COLUMN_GAP_PX = 1;
const CARD_TO_MARKER_GAP_PX = 12;

interface EventGraphRowProps {
  laneCount: number;
  laneIndex: number;
  activeLanes: Array<{
    laneIndex: number;
    railClassName?: string;
    segment?: 'full' | 'top' | 'bottom' | 'split';
  }>;
  branchFromMain?: boolean;
  mergeToMain?: boolean;
  branchClassName?: string;
  nodeBorderClassName?: string;
  children: React.ReactNode;
}

export function EventGraphRow({
  laneCount,
  laneIndex,
  activeLanes,
  branchFromMain = false,
  mergeToMain = false,
  branchClassName,
  nodeBorderClassName,
  children,
}: EventGraphRowProps) {
  const railWidth = Math.max(laneCount, 1) * LANE_WIDTH;
  const branchWidth = Math.max(laneIndex, 0) * LANE_WIDTH;
  const markerLaneIndex = branchFromMain || mergeToMain ? 0 : laneIndex;
  const markerX = markerLaneIndex * LANE_WIDTH + LANE_CENTER;
  const contentOffsetPx = Math.max(
    0,
    railWidth + GRAPH_COLUMN_GAP_PX - (markerX + CARD_TO_MARKER_GAP_PX),
  );
  const branchStartX = laneIndex * LANE_WIDTH + LANE_CENTER;
  const baseX = LANE_CENTER;
  const branchStartY = 50 - HALF_SEGMENT_OFFSET_PX;
  const mergeStartY = 50 + HALF_SEGMENT_OFFSET_PX;
  const cornerRadius = Math.min(12, Math.max(6, branchWidth * 0.7));
  const horizontalJoinX = Math.max(baseX + 2, branchStartX - cornerRadius);
  const branchCurvePath =
    branchFromMain && laneIndex > 0
      ? `M ${branchStartX} ${branchStartY}
         Q ${branchStartX} 50 ${horizontalJoinX} 50
         L ${baseX} 50`
      : mergeToMain && laneIndex > 0
        ? `M ${branchStartX} ${mergeStartY}
           Q ${branchStartX} 50 ${horizontalJoinX} 50
           L ${baseX} 50`
        : null;

  return (
    <div className="grid grid-cols-[auto,minmax(0,1fr)] items-stretch gap-4">
      <div aria-hidden="true" className="relative" style={{ width: railWidth }}>
        {activeLanes.map(({ laneIndex: activeLaneIndex, railClassName, segment = 'full' }) => {
          const segmentClassName = segment === 'full' ? 'inset-y-0' : undefined;
          const segmentStyles =
            segment === 'top'
              ? [
                  {
                    top: 0,
                    height: `calc(50% - ${HALF_SEGMENT_OFFSET_PX}px)`,
                  },
                ]
              : segment === 'bottom'
                ? [
                    {
                      bottom: 0,
                      height: `calc(50% - ${HALF_SEGMENT_OFFSET_PX}px)`,
                    },
                  ]
                : segment === 'split'
                  ? [
                      {
                        top: 0,
                        height: `calc(50% - ${HALF_SEGMENT_OFFSET_PX}px)`,
                      },
                      {
                        bottom: 0,
                        height: `calc(50% - ${HALF_SEGMENT_OFFSET_PX}px)`,
                      },
                    ]
                  : [undefined];

          return segmentStyles.map((segmentStyle, segmentPartIndex) => (
            <span
              className={cn(
                'absolute w-0.5 -translate-x-1/2 bg-border/80 transition-[background-color,height,top,bottom] duration-300 ease-out',
                segmentClassName,
                railClassName,
              )}
              key={`${activeLaneIndex}-${segment}-${segmentPartIndex}`}
              style={{
                left: activeLaneIndex * LANE_WIDTH + LANE_CENTER,
                ...segmentStyle,
              }}
            />
          ));
        })}

        {branchCurvePath ? (
          <svg
            className="absolute inset-0 overflow-visible"
            height="100%"
            preserveAspectRatio="none"
            viewBox={`0 0 ${railWidth} 100`}
            width={railWidth}
          >
            <path
              className={cn('fill-none transition-colors duration-300 ease-out', branchClassName)}
              d={branchCurvePath}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={GRAPH_STROKE_PX}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : null}

        <span
          className={cn(
            'absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-card shadow-sm transition-[border-color,left,background-color] duration-300 ease-out',
            nodeBorderClassName,
          )}
          style={{ left: markerLaneIndex * LANE_WIDTH + LANE_CENTER }}
        />
      </div>

      <div
        className="relative min-w-0 mt-2 mb-2"
        style={{ left: `${-contentOffsetPx}px` }}
      >
        {children}
      </div>
    </div>
  );
}
