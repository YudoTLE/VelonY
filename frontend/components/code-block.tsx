import React, { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

import { Copy } from 'lucide-react';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import go from 'highlight.js/lib/languages/go';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import markdown from 'highlight.js/lib/languages/markdown';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/github-dark.css'; // theme

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('html', html);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('go', go);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);

interface CodeBlockProps {
  code: string
  language?: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const ref = useRef<HTMLElement>(null);

  const effectiveLanguage = language === 'mermaid' ? 'yaml' : language;

  const handleCopy = () => {
    if (!ref.current) return;

    const el = ref.current;
    navigator.clipboard.writeText(el.textContent ?? '');
  };

  useEffect(() => {
    if (ref.current) {
      try {
        hljs.highlightElement(ref.current);
      }
      catch (error) {
        console.error('Highlight.js error:', error);
        if (ref.current) {
          ref.current.textContent = code;
        }
      }
    }
  }, [code, effectiveLanguage]);

  return (
    <div className="-mb-[21px]">
      <div className="bg-border ring ring-border px-3 py-0.5 flex justify-between -mb-[21px]">
        {language}
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="xs"
        >
          <Copy />
          Copy
        </Button>
      </div>

      <pre className="m-0 p-0 rounded-t-none">
        <code
          ref={ref}
          className={cn(
            effectiveLanguage && `language-${effectiveLanguage}`,
          )}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
