import { useEffect } from 'react';
import WordCounter from '../../components/tools/WordCounter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { BoltIcon } from '@heroicons/react/24/outline';

const WordCounterPage = () => {
  useEffect(() => {
    document.title = 'Word/Character Counter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="word-counter"
      title="Word/Character Counter"
      icon={BoltIcon}
      group="quick"
      relatedTools={['password-generator', 'text-case-converter', 'qr-code-generator']}
    >
      <WordCounter />
    </ToolPageLayout>
  );
};

export default WordCounterPage; 