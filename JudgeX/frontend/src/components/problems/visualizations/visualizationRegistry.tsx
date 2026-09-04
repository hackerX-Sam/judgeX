import React from 'react';
import ArrayVisualization from './ArrayVisualization';
import TwoPointerVisualization from './TwoPointerVisualization';
import BinarySearchVisualization from './BinarySearchVisualization';
import LinkedListVisualization from './LinkedListVisualization';
import TreeVisualization from './TreeVisualization';
import StackQueueVisualization from './StackQueueVisualization';
import DPMatrixVisualization from './DPMatrixVisualization';
import type { VisualizationType } from '../../../services/problemParser';

interface VisProps {
  elements?: any[];
  target?: any;
}

const StackVis = (props: VisProps) => <StackQueueVisualization {...props} mode="stack" />;
const QueueVis = (props: VisProps) => <StackQueueVisualization {...props} mode="queue" />;

export const visualizationRegistry: Record<VisualizationType, React.ComponentType<VisProps>> = {
  'array': ArrayVisualization,
  'two-pointer': TwoPointerVisualization,
  'sliding-window': TwoPointerVisualization,
  'binary-search': BinarySearchVisualization,
  'linked-list': LinkedListVisualization,
  'tree': TreeVisualization,
  'graph': TreeVisualization,
  'stack': StackVis,
  'queue': QueueVis,
  'dp': DPMatrixVisualization,
  'matrix': DPMatrixVisualization,
  'string': ArrayVisualization,
  'none': ArrayVisualization
};

export function getVisualizationComponent(type: VisualizationType): React.ComponentType<VisProps> {
  return visualizationRegistry[type] || ArrayVisualization;
}
