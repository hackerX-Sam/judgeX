export interface ParsedExample {
  id: number;
  input: string;
  output: string;
  explanation?: string;
  parsedInputMap?: Record<string, string>;
  arrayData?: any[];
  targetData?: any;
}

export type VisualizationType = 
  | 'array'
  | 'two-pointer'
  | 'sliding-window'
  | 'binary-search'
  | 'linked-list'
  | 'tree'
  | 'graph'
  | 'stack'
  | 'queue'
  | 'dp'
  | 'matrix'
  | 'string'
  | 'none';

export interface ParsedProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  timeLimit: number;
  memoryLimit: number;
  descriptionHtml: string;
  cleanDescription: string;
  examples: ParsedExample[];
  constraints: string[];
  followUp?: string;
  hints: string[];
  topics: string[];
  visualizationType: VisualizationType;
  visualizationData?: {
    elements?: any[];
    target?: any;
    rawInputMap?: Record<string, string>;
  };
}

/**
 * Universal Problem Parser & Normalizer
 * Converts legacy raw HTML, Markdown, or structured API problem payload into a uniform ParsedProblem model.
 */
export function parseProblem(rawProblem: any): ParsedProblem {
  if (!rawProblem) {
    return {
      id: '',
      title: 'Unknown Problem',
      slug: '',
      difficulty: 'Medium',
      timeLimit: 1000,
      memoryLimit: 256,
      descriptionHtml: '',
      cleanDescription: '',
      examples: [],
      constraints: [],
      hints: [],
      topics: ['General'],
      visualizationType: 'none'
    };
  }

  const title = rawProblem.title || 'Untitled Challenge';
  const slug = rawProblem.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const difficulty = rawProblem.difficulty || 'Medium';
  const timeLimit = rawProblem.timeLimit || 1000;
  const memoryLimit = rawProblem.memoryLimit || 256;
  const rawDesc = rawProblem.description || '';

  // Extract Topics / Tags
  const topics = extractTopics(title, rawDesc, rawProblem.topics);

  // Extract Constraints
  const constraints = extractConstraints(rawDesc, rawProblem.constraints);

  // Extract Follow-up
  const followUp = extractFollowUp(rawDesc, rawProblem.followUp);

  // Extract Hints
  const hints = extractHints(rawDesc, rawProblem.hints);

  // Extract Examples & Testcases
  const examples = extractExamples(rawDesc, rawProblem.testCases);

  // Clean description HTML (strip explicit Example & Constraint sections for dedicated card rendering)
  const cleanDescription = extractMainDescription(rawDesc);

  // Determine Visualization Type dynamically
  const visualizationType = determineVisualizationType(title, topics, rawDesc);

  // Extract Live Visualization Data from first example
  const visualizationData = extractVisualizationData(examples, visualizationType);

  return {
    id: rawProblem.id || slug,
    title,
    slug,
    difficulty,
    timeLimit,
    memoryLimit,
    descriptionHtml: rawDesc,
    cleanDescription,
    examples,
    constraints,
    followUp,
    hints,
    topics,
    visualizationType,
    visualizationData
  };
}

/**
 * Auto-detect problem topics based on title & text keywords if not explicitly provided
 */
function extractTopics(title: string, desc: string, explicitTopics?: string[]): string[] {
  if (explicitTopics && Array.isArray(explicitTopics) && explicitTopics.length > 0) {
    return explicitTopics;
  }

  const text = (title + ' ' + desc).toLowerCase();
  const detected: string[] = [];

  const topicKeywords: Record<string, string[]> = {
    'Array': ['array', 'sub-array', 'subarray', 'nums', 'indices', 'vector'],
    'Hash Table': ['hash', 'map', 'dictionary', 'key-value', 'frequency', 'count'],
    'Two Pointers': ['two pointer', 'two pointers', 'left pointer', 'right pointer', 'opposite directions', 'pair sum'],
    'Sliding Window': ['sliding window', 'window size', 'substring of length', 'contiguous subarray'],
    'Binary Search': ['binary search', 'sorted array', 'log n', 'logarithmic time', 'search space'],
    'String': ['string', 'substring', 'character', 'anagram', 'palindrome', 'prefix', 'suffix'],
    'Linked List': ['linked list', 'head node', 'next pointer', 'singly linked', 'doubly linked'],
    'Tree': ['binary tree', 'tree node', 'root node', 'inorder', 'preorder', 'postorder', 'bst', 'depth-first'],
    'Graph': ['graph', 'vertex', 'vertices', 'edges', 'bfs', 'dfs', 'adjacency list', 'shortest path'],
    'Stack': ['stack', 'push', 'pop', 'valid parentheses', 'monotonic stack'],
    'Queue': ['queue', 'enqueue', 'dequeue', 'level order'],
    'Dynamic Programming': ['dynamic programming', 'dp', 'memoization', 'tabulation', 'optimal substructure'],
    'Greedy': ['greedy', 'locally optimal', 'intervals', 'max profit'],
    'Math': ['math', 'prime', 'modulus', 'factorial', 'gcd', 'lcm', 'integer']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      detected.push(topic);
    }
  }

  return detected.length > 0 ? detected.slice(0, 4) : ['Algorithm', 'Data Structure'];
}

/**
 * Extract constraints from description or explicit list
 */
function extractConstraints(desc: string, explicitConstraints?: string[]): string[] {
  if (explicitConstraints && Array.isArray(explicitConstraints) && explicitConstraints.length > 0) {
    return explicitConstraints;
  }

  const constraints: string[] = [];

  // Match HTML / Markdown constraint sections
  const constraintSectionMatch = desc.match(/(?:<p>|<h\d>|\*\*|#+)\s*Constraints?:?\s*(?:<\/p>|<\/h\d>|\*\*|#+)?([\s\S]*?)(?=(?:<p>|<h\d>|\*\*|#+)\s*(?:Example|Follow|Note|Hint)|$)/i);

  if (constraintSectionMatch && constraintSectionMatch[1]) {
    const rawSection = constraintSectionMatch[1];
    
    // Extract <li> elements
    const liMatches = rawSection.match(/<li>(.*?)<\/li>/gi);
    if (liMatches) {
      liMatches.forEach(li => {
        const text = htmlToMarkdown(li.replace(/<\/?li>/gi, '')).replace(/^[-*\s]+/, '').trim();
        if (text) constraints.push(text);
      });
    } else {
      // Split by code tags or bullet points
      const lines = rawSection.split(/\r?\n|<br\s*\/?>/);
      lines.forEach(line => {
        const clean = htmlToMarkdown(line).replace(/^[•\-*\d+.]\s*/, '').trim();
        if (clean && clean.length > 2 && !clean.toLowerCase().startsWith('example')) {
          constraints.push(clean);
        }
      });
    }
  }

  // Fallback defaults if no explicit constraint section found in description
  if (constraints.length === 0) {
    constraints.push('1 <= input.length <= 10^5');
    constraints.push('Time Complexity target: O(N) or O(N log N)');
    constraints.push('Space Complexity target: O(1) auxiliary space');
  }

  return constraints;
}

/**
 * Extract follow-up question
 */
function extractFollowUp(desc: string, explicitFollowUp?: string): string | undefined {
  if (explicitFollowUp) return explicitFollowUp;

  const match = desc.match(/(?:<p>|<h\d>|\*\*|#+)\s*Follow-?up:?\s*(?:<\/p>|<\/h\d>|\*\*|#+)?([\s\S]*?)(?=(?:<p>|<h\d>|\*\*|#+)|$)/i);
  if (match && match[1]) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) return text;
  }
  return undefined;
}

/**
 * Extract hints
 */
function extractHints(desc: string, explicitHints?: string[]): string[] {
  if (explicitHints && Array.isArray(explicitHints) && explicitHints.length > 0) {
    return explicitHints;
  }

  const hints: string[] = [];
  const hintMatches = desc.match(/Hint\s*\d*:?\s*(.*?)(?=\n|<br|<\/p>|$)/gi);
  if (hintMatches) {
    hintMatches.forEach(h => {
      const clean = h.replace(/^Hint\s*\d*:?\s*/i, '').replace(/<[^>]+>/g, '').trim();
      if (clean) hints.push(clean);
    });
  }

  return hints;
}

/**
 * Extract formatted examples from testCases DB array and/or raw HTML description
 */
function extractExamples(desc: string, testCases?: any[]): ParsedExample[] {
  const examples: ParsedExample[] = [];

  // Priority 1: Use testCases array if provided from DB
  if (testCases && Array.isArray(testCases) && testCases.length > 0) {
    testCases.forEach((tc, idx) => {
      if (tc.isHidden) return; // Only process public testcases as examples

      // Try to parse input map (e.g. nums = [2,7,11,15], target = 9)
      const inputMap = parseKeyValuePairs(tc.input);

      examples.push({
        id: idx + 1,
        input: tc.input,
        output: tc.expectedOutput,
        explanation: tc.explanation || undefined,
        parsedInputMap: inputMap
      });
    });
  }

  // Priority 2: Parse HTML/Markdown description for explicit "Example X:" blocks if no DB testcases
  if (examples.length === 0) {
    const exampleRegex = /(?:<p>|<h\d>|\*\*|#+)?\s*Example\s*(\d+):?\s*(?:<\/p>|<\/h\d>|\*\*|#+)?[\s\S]*?<pre>([\s\S]*?)<\/pre>/gi;
    let match;
    let exId = 1;

    while ((match = exampleRegex.exec(desc)) !== null) {
      const preContent = match[2];
      const inputMatch = preContent.match(/Input:?\s*(.*?)(?=\n|Output:|$)/i);
      const outputMatch = preContent.match(/Output:?\s*(.*?)(?=\n|Explanation:|$)/i);
      const expMatch = preContent.match(/Explanation:?\s*([\s\S]*)/i);

      if (inputMatch || outputMatch) {
        const inputStr = inputMatch ? inputMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const outputStr = outputMatch ? outputMatch[1].replace(/<[^>]+>/g, '').trim() : '';
        const expStr = expMatch ? expMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

        examples.push({
          id: exId++,
          input: inputStr,
          output: outputStr,
          explanation: expStr,
          parsedInputMap: parseKeyValuePairs(inputStr)
        });
      }
    }
  }

  // Fallback dummy structure if absolutely no examples found
  if (examples.length === 0) {
    examples.push({
      id: 1,
      input: 'n = 5',
      output: '15',
      explanation: 'Sum of first 5 natural numbers (1 + 2 + 3 + 4 + 5 = 15)'
    });
  }

  return examples;
}

/**
 * Remove explicit Examples & Constraints sections from the description body so they can be rendered as rich cards
 */
/**
 * Convert raw HTML strings (like LeetCode raw HTML outputs) into clean, standard Markdown.
 */
export function htmlToMarkdown(htmlStr: string): string {
  if (!htmlStr) return '';

  let str = htmlStr;

  // 1. Unescape common HTML entities
  str = str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&le;/gi, '<=')
    .replace(/&ge;/gi, '>=')
    .replace(/&times;/gi, '×')
    .replace(/&divide;/gi, '÷');

  // 2. Convert links
  str = str.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // 3. Convert inline code tags
  str = str.replace(/<code>([\s\S]*?)<\/code>/gi, (_match, p1) => {
    const cleanInside = p1.replace(/<sup>(.*?)<\/sup>/gi, '^$1').replace(/<sub>(.*?)<\/sub>/gi, '_$1');
    return `\`${cleanInside.trim()}\``;
  });

  // 4. Convert bold and strong
  str = str.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');

  // 5. Convert italic and em
  str = str.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // 6. Convert superscripts and subscripts outside code
  str = str.replace(/<sup>(.*?)<\/sup>/gi, '^$1');
  str = str.replace(/<sub>(.*?)<\/sub>/gi, '_$1');

  // 7. Convert pre code blocks
  str = str.replace(/<pre>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

  // 8. Convert list items
  str = str.replace(/<li>([\s\S]*?)<\/li>/gi, (_match, p1) => {
    const cleanLi = p1.replace(/<[^>]+>/g, '').trim();
    return cleanLi ? `- ${cleanLi}\n` : '';
  });
  str = str.replace(/<\/?(?:ul|ol)[^>]*>/gi, '\n');

  // 9. Convert headings
  str = str.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n### $1\n');

  // 10. Convert paragraphs & line breaks
  str = str.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  str = str.replace(/<br\s*\/?>/gi, '\n');

  // 11. Remove remaining unhandled HTML tags (like <strong class="example"> or empty tags)
  str = str.replace(/<[^>]+>/g, '');

  // 12. Cleanup multiple empty lines & trailing spaces
  str = str
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return str;
}

/**
 * Remove explicit Examples & Constraints sections from the description body so they can be rendered as rich cards
 */
function extractMainDescription(desc: string): string {
  if (!desc) return '';

  // Convert raw HTML into clean markdown first if HTML tags are detected
  const markdown = desc.includes('<') && desc.includes('>') ? htmlToMarkdown(desc) : desc;

  let clean = markdown;
  // Remove Example blocks
  clean = clean.replace(/(?:^|\n)\s*Example\s*\d+:?[\s\S]*?(?=(?:^|\n)\s*(?:Example\s*\d+|Constraints|Follow|Note|$))/gi, '');
  // Remove Constraints block
  clean = clean.replace(/(?:^|\n)\s*(?:\*\*)?Constraints:?(?:\*\*)?[\s\S]*/gi, '');

  return clean.trim();
}

/**
 * Dynamically assign optimal visualization type based on title & keywords
 */
function determineVisualizationType(title: string, topics: string[], desc: string): VisualizationType {
  const t = (title + ' ' + topics.join(' ') + ' ' + desc).toLowerCase();

  if (t.includes('two pointer') || t.includes('two sum') || t.includes('container with most water')) {
    return 'two-pointer';
  }
  if (t.includes('binary search') || t.includes('search in rotated') || t.includes('search a 2d matrix')) {
    return 'binary-search';
  }
  if (t.includes('sliding window') || t.includes('longest substring') || t.includes('min window')) {
    return 'sliding-window';
  }
  if (t.includes('linked list') || t.includes('reverse list') || t.includes('merge list')) {
    return 'linked-list';
  }
  if (t.includes('tree') || t.includes('binary tree') || t.includes('inorder') || t.includes('path sum')) {
    return 'tree';
  }
  if (t.includes('graph') || t.includes('course schedule') || t.includes('island') || t.includes('adjacency')) {
    return 'graph';
  }
  if (t.includes('stack') || t.includes('parentheses') || t.includes('histogram') || t.includes('reverse Polish')) {
    return 'stack';
  }
  if (t.includes('queue') || t.includes('level order') || t.includes('sliding window max')) {
    return 'queue';
  }
  if (t.includes('dynamic programming') || t.includes('dp') || t.includes('knapsack') || t.includes('pascal')) {
    return 'dp';
  }
  if (t.includes('array') || t.includes('vector') || t.includes('matrix')) {
    return 'array';
  }
  if (t.includes('string')) {
    return 'string';
  }

  return 'array'; // Default fallback visualization
}

/**
 * Parse input string into key-value map (e.g. "nums = [2,7,11,15], target = 9")
 */
function parseKeyValuePairs(inputStr: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!inputStr) return map;

  // Split by comma outside brackets
  const parts = inputStr.split(/,\s*(?=[a-zA-Z_]\w*\s*=)/);
  parts.forEach(part => {
    const eqIdx = part.indexOf('=');
    if (eqIdx !== -1) {
      const key = part.substring(0, eqIdx).trim();
      const val = part.substring(eqIdx + 1).trim();
      map[key] = val;
    } else {
      map['input'] = part.trim();
    }
  });

  return map;
}

/**
 * Extract live array elements and target value from first example data for dynamic visualization
 */
function extractVisualizationData(examples: ParsedExample[], type: VisualizationType) {
  if (examples.length === 0) return undefined;

  const firstEx = examples[0];
  const inputMap = firstEx.parsedInputMap || parseKeyValuePairs(firstEx.input);

  let elements: any[] = [];
  let target: any = undefined;

  // Try to locate array value in inputMap
  for (const [key, val] of Object.entries(inputMap)) {
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        // Safe JSON array parsing
        elements = JSON.parse(val);
      } catch (_e) {
        // Fallback comma split
        elements = val.replace(/[[\]]/g, '').split(',').map(s => s.trim());
      }
    } else if (key.toLowerCase().includes('target') || key.toLowerCase() === 'k' || key.toLowerCase() === 'x') {
      try {
        target = JSON.parse(val);
      } catch (_e) {
        target = val;
      }
    }
  }

  // Fallback defaults if no array found in input string
  if (elements.length === 0) {
    if (type === 'binary-search') {
      elements = [1, 3, 5, 7, 9, 11, 13, 15];
      target = target !== undefined ? target : 7;
    } else if (type === 'linked-list') {
      elements = [10, 20, 30, 40, 50];
    } else if (type === 'tree') {
      elements = [3, 9, 20, null, null, 15, 7];
    } else {
      elements = [2, 7, 11, 15];
      target = target !== undefined ? target : 9;
    }
  }

  return {
    elements,
    target,
    rawInputMap: inputMap
  };
}
