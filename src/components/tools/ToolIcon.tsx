import {
  DocumentDuplicateIcon,
  TableCellsIcon,
  CodeBracketIcon,
  PhotoIcon,
  BoltIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

const ICONS: Record<string, any> = {
  'csv-to-json': TableCellsIcon,
  'word-to-markdown': DocumentDuplicateIcon,
  'excel-joiner': TableCellsIcon,
  'excel-splitter': TableCellsIcon,
  'csv-merger': TableCellsIcon,
  'json-formatter': CodeBracketIcon,
  'image-sharpener': PhotoIcon,
  'qr-code-generator': BoltIcon,
  'unit-converter': ArrowsRightLeftIcon,
  // ...add more as needed
};

type ToolIconProps = { tool: string; className?: string };
const ToolIcon = ({ tool, className }: ToolIconProps) => {
  const Icon = ICONS[tool] || DocumentDuplicateIcon;
  return <Icon className={className} />;
};

export default ToolIcon; 