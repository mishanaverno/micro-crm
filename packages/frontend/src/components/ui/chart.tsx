import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
    marker?: {
      colors: string[];
    };
    hideInLegend?: boolean;
    hideInTooltip?: boolean;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a ChartContainer.');
  }

  return context;
}

function getPayloadKey(item: ChartPayloadItem) {
  return String(item.dataKey ?? item.name ?? '');
}

function getPayloadColor(item: ChartPayloadItem, config: ChartConfig) {
  const key = getPayloadKey(item);

  return config[key]?.color ?? item.color ?? item.fill ?? 'hsl(var(--foreground))';
}

function ChartMarker({
  color,
  colors,
}: {
  color?: string;
  colors?: string[];
}) {
  if (colors?.length) {
    return (
      <span className="flex h-3 w-2.5 shrink-0 flex-col overflow-hidden rounded-[2px]">
        {colors.map((itemColor) => (
          <span
            className="min-h-0 flex-1"
            key={itemColor}
            style={{ backgroundColor: itemColor }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
      style={{ backgroundColor: color }}
    />
  );
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  const chartId = React.useId().replace(/:/g, '');
  const cssVariables = Object.entries(config).reduce(
    (variables, [key, item]) => {
      if (item.color) {
        variables[`--color-${key}`] = item.color;
      }

      return variables;
    },
    {} as React.CSSProperties & Record<`--color-${string}`, string>,
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          'flex aspect-video justify-center text-xs text-muted-foreground [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-legend-item-text]:text-foreground [&_.recharts-tooltip-cursor]:fill-muted',
          className,
        )}
        data-chart={chartId}
        style={cssVariables}
        {...props}
      >
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

interface ChartPayloadItem {
  color?: string;
  dataKey?: string | number;
  fill?: string;
  name?: string | number;
  payload?: {
    tooltipLabel?: string;
  } & Record<string, unknown>;
  value?: unknown;
}

interface ChartTooltipContentProps {
  active?: boolean;
  label?: string | number;
  payload?: ChartPayloadItem[];
  valueFormatter?: (value: unknown) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  label,
  payload,
  valueFormatter,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  const tooltipLabel = payload[0]?.payload?.tooltipLabel ?? label;
  const payloadItemsByKey = new Map(payload.map((item) => [getPayloadKey(item), item]));
  const tooltipItems = Object.entries(config)
    .filter(([, itemConfig]) => !itemConfig.hideInTooltip)
    .map(([key, itemConfig]) => ({
      key,
      itemConfig,
      item: payloadItemsByKey.get(key),
      value: payloadItemsByKey.get(key)?.value ?? payload[0]?.payload?.[key],
    }))
    .filter((item) => item.value != null);

  return (
    <div className="grid min-w-[12rem] gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md">
      {tooltipLabel ? <p className="font-medium text-foreground">{tooltipLabel}</p> : null}
      <div className="grid gap-1.5">
        {tooltipItems.map(({ key, itemConfig, item, value }) => {
          const color = item ? getPayloadColor(item, config) : itemConfig.color;

          return (
            <div className="flex items-center gap-2" key={key}>
              <ChartMarker color={color} colors={itemConfig.marker?.colors} />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {itemConfig.label ?? item?.name ?? key}
              </span>
              <span className="font-mono font-medium text-foreground">
                {valueFormatter ? valueFormatter(value) : String(value ?? '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ChartLegendContentProps {
  payload?: ChartPayloadItem[];
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  const { config } = useChart();
  const legendItems = Object.entries(config).filter(([, itemConfig]) => !itemConfig.hideInLegend);

  if (!legendItems.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
      {legendItems.map(([key, itemConfig]) => {
        const item = payload?.find((payloadItem) => getPayloadKey(payloadItem) === key);
        const color = item ? getPayloadColor(item, config) : itemConfig.color;

        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" key={key}>
            <ChartMarker color={color} colors={itemConfig.marker?.colors} />
            <span>{String(itemConfig.label ?? item?.value ?? item?.name ?? key)}</span>
          </div>
        );
      })}
    </div>
  );
}
