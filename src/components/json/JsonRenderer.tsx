import React from 'react';
import { StyleProp } from 'react-native';

type JsonValue = string | number | boolean | null;

export interface JsonNode {
  type: string;
  props?: Record<string, any>;
  style?: any;
  children?: Array<JsonNode | JsonValue>;
  text?: JsonValue | { $: string } | { $fn: string; args?: any[] };
  slot?: string;
  condition?: string | boolean;
  repeat?: {
    data: string;
    itemName?: string;
    key?: string;
  };
}

interface JsonRendererProps {
  node: JsonNode | JsonNode[];
  context: Record<string, any>;
  registry: Record<string, React.ComponentType<any>>;
}

const isObject = (value: any) => value !== null && typeof value === 'object' && !Array.isArray(value);

const getByPath = (obj: any, path: string) => {
  if (!path) return obj;
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const resolveValue = (value: any, ctx: Record<string, any>): any => {
  if (Array.isArray(value)) {
    return value.map(item => resolveValue(item, ctx));
  }
  if (!isObject(value)) return value;

  if ('$' in value) {
    return getByPath(ctx, value.$);
  }
  if ('$fn' in value) {
    const fn = getByPath(ctx, value.$fn);
    if (typeof fn !== 'function') return undefined;
    const args = (value.args ?? []).map((arg: any) => resolveValue(arg, ctx));
    return fn(...args);
  }

  const resolved: Record<string, any> = {};
  Object.entries(value).forEach(([key, val]) => {
    resolved[key] = resolveValue(val, ctx);
  });
  return resolved;
};

const resolveStyle = (style: any, ctx: Record<string, any>): StyleProp<any> => {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    return style
      .map(entry => resolveStyle(entry, ctx))
      .filter(Boolean);
  }
  if (typeof style === 'string') {
    return ctx.styles?.[style] ?? undefined;
  }
  return resolveValue(style, ctx);
};

const renderNode = (
  node: JsonNode,
  ctx: Record<string, any>,
  registry: Record<string, React.ComponentType<any>>,
  key?: string | number
) => {
  const condition =
    typeof node.condition === 'string' ? getByPath(ctx, node.condition) : node.condition;
  if (node.condition !== undefined && !condition) return null;

  if (node.repeat) {
    const data = getByPath(ctx, node.repeat.data) ?? [];
    const itemName = node.repeat.itemName ?? 'item';
    return data.map((item: any, index: number) => {
      const childCtx = { ...ctx, [itemName]: item, index };
      const itemKey = node.repeat?.key ? item?.[node.repeat.key] : index;
      return renderNode({ ...node, repeat: undefined }, childCtx, registry, itemKey);
    });
  }

  const Component = registry[node.type];
  if (!Component) return null;

  const props = resolveValue(node.props ?? {}, ctx) ?? {};
  const style = resolveStyle(node.style, ctx);
  if (style) {
    props.style = props.style ? [style, props.style] : style;
  }

  const slotChildren: Record<string, React.ReactNode> = {};
  const children = (node.children ?? []).flatMap(child => {
    if (child === null || child === undefined) return [];
    if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
      return [child as any];
    }
    if ((child as JsonNode).slot) {
      const rendered = renderNode(child as JsonNode, ctx, registry);
      if (rendered) slotChildren[(child as JsonNode).slot as string] = rendered;
      return [];
    }
    const rendered = renderNode(child as JsonNode, ctx, registry);
    return rendered ? [rendered] : [];
  });

  Object.entries(slotChildren).forEach(([slot, value]) => {
    props[slot] = value;
  });

  if (node.text !== undefined && children.length === 0) {
    return <Component key={key} {...props}>{resolveValue(node.text, ctx)}</Component>;
  }

  return (
    <Component key={key} {...props}>
      {children}
    </Component>
  );
};

export const JsonRenderer: React.FC<JsonRendererProps> = ({ node, context, registry }) => {
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((item, index) => renderNode(item, context, registry, index))}
      </>
    );
  }
  return <>{renderNode(node, context, registry)}</>;
};
