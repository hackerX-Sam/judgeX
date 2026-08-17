import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { setCredentials } from './store/slices/authSlice';
import axios from 'axios';
import { CheckCircle2, Circle, Lock, ChevronRight, Search, Library, Target, Compass, GraduationCap, UserCircle2, Star, Clock, Play, Sun, Moon, Terminal } from 'lucide-react';
import './index.css';
import './App.css';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Workspace from './pages/Workspace/Workspace';
import Playground from './pages/Playground/Playground';
import ActivityGraph from './components/ActivityGraph';
import { Navbar } from './components/Navbar';
import ContestsPage from './pages/Contests/ContestsPage';

// Dummy problem data removed since it is now fetched dynamically


const ProblemsPage = () => {
  const [problems, setProblems] = useState<any[]>([]);

  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/problems');
        
        let solvedIds: string[] = [];
        if (user) {
          try {
            const solvedResponse = await axios.get(`http://localhost:3000/api/submissions/solved/${user.id}`);
            solvedIds = solvedResponse.data.solvedProblemIds || [];
          } catch (e) {
            console.error('Error fetching solved problems:', e);
          }
        }

        const formattedProblems = response.data.problems.map((p: any) => ({
          ...p,
          acceptance: 'N/A',
          status: solvedIds.includes(p.id) ? 'solved' : 'todo'
        }));
        setProblems(formattedProblems);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };
    fetchProblems();
  }, [user]);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar active="problems" />

      {/* Main Content */}
      <main className="lc-main">
        {/* Top Feature Section (Study Plans etc) */}
        <div className="lc-top-section">
          <div className="lc-study-card study-card-1">
            <h3>Top Interview 150</h3>
            <p>Must-do List for Interview Prep</p>
          </div>
          <div className="lc-study-card study-card-2">
            <h3>JudgeX 75</h3>
            <p>Ace Coding Interview with 75 Qs</p>
          </div>
          <div className="lc-study-card study-card-3">
            <h3>SQL 50</h3>
            <p>Crack SQL Interview in 50 Qs</p>
          </div>
        </div>

        <div className="lc-content-grid">
          {/* Left Column: Problem List */}
          <div className="lc-problem-list">
            <div className="lc-toolbar">
              <div className="lc-dropdowns">
                <select><option>Lists</option></select>
                <select><option>Difficulty</option></select>
                <select><option>Status</option></select>
                <select><option>Tags</option></select>
              </div>
              <div className="lc-search">
                <Search size={16} />
                <input type="text" placeholder="Search questions" />
              </div>
            </div>

            <table className="lc-table">
              <thead>
                <tr>
                  <th className="col-status">Status</th>
                  <th className="col-title">Title</th>
                  <th className="col-acceptance">Acceptance</th>
                  <th className="col-difficulty">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id} className={p.id % 2 === 0 ? 'row-even' : 'row-odd'}>
                    <td className="col-status">
                      {p.status === 'solved' && <CheckCircle2 size={18} className="text-success" />}
                      {p.status === 'attempted' && <Circle size={18} className="text-warning" />}
                      {p.status === 'locked' && <Lock size={16} className="text-tertiary" />}
                    </td>
                    <td className="col-title">
                      <a href={`/problems/${p.slug}`} className="problem-link">
                        {p.title}
                      </a>
                    </td>
                    <td className="col-acceptance">{p.acceptance}</td>
                    <td className={`col-difficulty diff-${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Column: Widgets */}
          <div className="lc-sidebar">
            {user && (
              <div className="lc-widget" style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center' }}>
                <ActivityGraph userId={user.id} />
              </div>
            )}
            <div className="lc-widget">
              <div className="widget-header">
                <h4>Trending Companies</h4>
              </div>
              <div className="widget-tags">
                <span className="tag">Google <span className="tag-count">142</span></span>
                <span className="tag">Amazon <span className="tag-count">351</span></span>
                <span className="tag">Meta <span className="tag-count">284</span></span>
                <span className="tag">Microsoft <span className="tag-count">192</span></span>
                <span className="tag">Apple <span className="tag-count">87</span></span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};



const highlightCode = (code: string) => {
  if (!code) return '';
  let res = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  res = res.replace(/("[^"]*")/g, '<span class="string">$1</span>');
  const keywords = /\b(function|let|var|const|while|for|if|else|return|class|def|self|impl|pub|fn|mut|int|struct|type|func|use|std|collections|HashMap|new|vec|vector|Option|Some|None|Box|public|in|range|elif|as|len|size|make|map|range|ok)\b/g;
  res = res.replace(keywords, '<span class="keyword">$1</span>');
  const classNames = /\b([A-Z][a-zA-Z0-9_]*)\b/g;
  res = res.replace(classNames, '<span class="class-name">$1</span>');
  const numbers = /\b(\d+)\b/g;
  res = res.replace(numbers, '<span class="number">$1</span>');
  return res;
};

const problemsData: Record<string, {
  title: string;
  input: string;
  output: string;
  snippets: Record<string, string>;
}> = {
  'binary-search': {
    title: 'Binary Search',
    input: 'nums = [-1,0,3,5,9,12], target = 9',
    output: '4',
    snippets: {
      'Java': `class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}`,
      'Python': `class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        left, right = 0, len(nums) - 1\n        while left <= right:\n            mid = left + (right - left) // 2\n            if nums[mid] == target:\n                return mid\n            elif nums[mid] < target:\n                left = mid + 1\n            else:\n                right = mid - 1\n        return -1`,
      'JavaScript': `var search = function(nums, target) {\n    let left = 0, right = nums.length - 1;\n    while (left <= right) {\n        let mid = Math.floor((left + right) / 2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n};`,
      'C++': `int search(const vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
      'C': `int search(int* nums, int numsSize, int target) {\n    int left = 0, right = numsSize - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}`,
      'Go': `func search(nums []int, target int) int {\n    left, right := 0, len(nums)-1\n    for left <= right {\n        mid := left + (right - left) / 2\n        if nums[mid] == target {\n            return mid\n        }\n        if nums[mid] < target {\n            left = mid + 1\n        } else {\n            right = mid - 1\n        }\n    }\n    return -1\n}`,
      'Rust': `impl Solution {\n    pub fn search(nums: Vec<i32>, target: i32) -> i32 {\n        let mut left = 0;\n        let mut right = nums.len() as i32 - 1;\n        while left <= right {\n            let mid = left + (right - left) / 2;\n            if nums[mid as usize] == target { return mid; }\n            if nums[mid as usize] < target { left = mid + 1; }\n            else { right = mid - 1; }\n        }\n        -1\n    }\n}`
    }
  },
  'reverse-linked-list': {
    title: 'Reverse Linked List',
    input: 'head = [1,2,3,4,5]',
    output: '[5,4,3,2,1]',
    snippets: {
      'Java': `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}`,
      'Python': `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        curr = head\n        while curr:\n            next_temp = curr.next\n            curr.next = prev\n            prev = curr\n            curr = next_temp\n        return prev`,
      'JavaScript': `var reverseList = function(head) {\n    let prev = null;\n    let curr = head;\n    while (curr !== null) {\n        let nextTemp = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n};`,
      'C++': `ListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    ListNode* curr = head;\n    while (curr != nullptr) {\n        ListNode* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
      'C': `struct ListNode* reverseList(struct ListNode* head) {\n    struct ListNode* prev = NULL;\n    struct ListNode* curr = head;\n    while (curr != NULL) {\n        struct ListNode* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}`,
      'Go': `func reverseList(head *ListNode) *ListNode {\n    var prev *ListNode = nil\n    curr := head\n    for curr != nil {\n        nextTemp := curr.Next\n        curr.Next = prev\n        prev = curr\n        curr = nextTemp\n    }\n    return prev\n}`,
      'Rust': `impl Solution {\n    pub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {\n        let mut prev = None;\n        let mut curr = head;\n        while let Some(mut node) = curr {\n            curr = node.next;\n            node.next = prev;\n            prev = Some(node);\n        }\n        prev\n    }\n}`
    }
  },
  'binary-tree-inorder': {
    title: 'Binary Tree Inorder',
    input: 'root = [1,null,2,3]',
    output: '[1,3,2]',
    snippets: {
      'Java': `class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        List<Integer> res = new ArrayList<>();\n        Stack<TreeNode> stack = new Stack<>();\n        TreeNode curr = root;\n        while (curr != null || !stack.isEmpty()) {\n            while (curr != null) {\n                stack.push(curr);\n                curr = curr.left;\n            }\n            curr = stack.pop();\n            res.add(curr.val);\n            curr = curr.right;\n        }\n        return res;\n    }\n}`,
      'Python': `class Solution:\n    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:\n        res, stack = [], []\n        curr = root\n        while curr or stack:\n            while curr:\n                stack.append(curr)\n                curr = curr.left\n            curr = stack.pop()\n            res.append(curr.val)\n            curr = curr.right\n        return res`,
      'JavaScript': `var inorderTraversal = function(root) {\n    const res = [], stack = [];\n    let curr = root;\n    while (curr !== null || stack.length > 0) {\n        while (curr !== null) {\n            stack.push(curr);\n            curr = curr.left;\n        }\n        curr = stack.pop();\n        res.push(curr.val);\n        curr = curr.right;\n    }\n    return res;\n};`,
      'C++': `vector<int> inorderTraversal(TreeNode* root) {\n    vector<int> res;\n    stack<TreeNode*> s;\n    TreeNode* curr = root;\n    while (curr != nullptr || !s.empty()) {\n        while (curr != nullptr) {\n            s.push(curr);\n            curr = curr->left;\n        }\n        curr = s.top(); s.pop();\n        res.push_back(curr->val);\n        curr = curr->right;\n    }\n    return res;\n}`,
      'C': `int* inorderTraversal(struct TreeNode* root, int* returnSize) {\n    // Recursive is simpler in C\n    *returnSize = 0;\n    int* res = malloc(100 * sizeof(int));\n    void traverse(struct TreeNode* node) {\n        if (!node) return;\n        traverse(node->left);\n        res[(*returnSize)++] = node->val;\n        traverse(node->right);\n    }\n    traverse(root);\n    return res;\n}`,
      'Go': `func inorderTraversal(root *TreeNode) []int {\n    res := []int{}\n    var traverse func(*TreeNode)\n    traverse = func(node *TreeNode) {\n        if node == nil { return }\n        traverse(node.Left)\n        res = append(res, node.Val)\n        traverse(node.Right)\n    }\n    traverse(root)\n    return res\n}`,
      'Rust': `use std::cell::RefCell;\nuse std::rc::Rc;\nimpl Solution {\n    pub fn inorder_traversal(root: Option<Rc<RefCell<TreeNode>>>) -> Vec<i32> {\n        let mut res = Vec::new();\n        if let Some(node) = root {\n            res.extend(Self::inorder_traversal(node.borrow().left.clone()));\n            res.push(node.borrow().val);\n            res.extend(Self::inorder_traversal(node.borrow().right.clone()));\n        }\n        res\n    }\n}`
    }
  },
  'fibonacci': {
    title: 'Fibonacci Number',
    input: 'n = 4',
    output: '3',
    snippets: {
      'Java': `class Solution {\n    public int fib(int n) {\n        if (n <= 1) return n;\n        int a = 0, b = 1;\n        for (int i = 2; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n}`,
      'Python': `class Solution:\n    def fib(self, n: int) -> int:\n        if n <= 1:\n            return n\n        a, b = 0, 1\n        for _ in range(2, n + 1):\n            a, b = b, a + b\n        return b`,
      'JavaScript': `var fib = function(n) {\n    if (n <= 1) return n;\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) {\n        let temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n};`,
      'C++': `int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}`,
      'C': `int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}`,
      'Go': `func fib(n int) int {\n    if n <= 1 {\n        return n\n    }\n    a, b := 0, 1\n    for i := 2; i <= n; i++ {\n        a, b = b, a+b\n    }\n    return b\n}`,
      'Rust': `impl Solution {\n    pub fn fib(n: i32) -> i32 {\n        if n <= 1 { return n; }\n        let (mut a, mut b) = (0, 1);\n        for _ in 2..=n {\n            let temp = a + b;\n            a = b;\n            b = temp;\n        }\n        b\n    }\n}`
    }
  },
  'two-sum': {
    title: 'Two Sum',
    input: 'nums = [2,7,11,15], target = 9',
    output: '[0,1]',
    snippets: {
      'Java': `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
      'Python': `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        hashmap = {}\n        for i, num in enumerate(nums):\n            complement = target - num\n            if complement in hashmap:\n                return [hashmap[complement], i]\n            hashmap[num] = i\n        return []`,
      'JavaScript': `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`,
      'C++': `vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (m.count(complement)) {\n            return {m[complement], i};\n        }\n        m[nums[i]] = i;\n    }\n    return {};\n}`,
      'C': `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    int* ret = malloc(2 * sizeof(int));\n    *returnSize = 2;\n    for(int i = 0; i < numsSize; ++i) {\n        for(int j = i + 1; j < numsSize; ++j) {\n            if(nums[i] + nums[j] == target) {\n                ret[0] = i; ret[1] = j;\n                return ret;\n            }\n        }\n    }\n    return ret;\n}`,
      'Go': `func twoSum(nums []int, target int) []int {\n    m := make(map[int]int)\n    for i, num := range nums {\n        if j, ok := m[target-num]; ok {\n            return []int{j, i}\n        }\n        m[num] = i\n    }\n    return nil\n}`,
      'Rust': `use std::collections::HashMap;\nimpl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n        let mut map = HashMap::new();\n        for (i, num) in nums.iter().enumerate() {\n            let complement = target - num;\n            if let Some(&j) = map.get(&complement) {\n                return vec![j as i32, i as i32];\n            }\n            map.insert(num, i);\n        }\n        vec![]\n    }\n}`
    }
  }
};

const Welcome = () => {
  const [activeProblem, setActiveProblem] = useState('binary-search');
  const [activeLang, setActiveLang] = useState('Java');
  const [runState, setRunState] = useState<'idle' | 'running' | 'finished'>('idle');
  const user = useSelector((state: any) => state.auth.user);

  const handleRun = () => {
    if (runState === 'running') return;
    setRunState('running');
    setTimeout(() => {
      setRunState('finished');
    }, 1500);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="landing-hero">
        <Navbar active="home" transparent={true} />
        <div className="hero-content">
          <div className="hero-left">
            <div className="css-tablet">
              <div className="tablet-header">
                <div className="mac-dots">
                  <span className="mac-dot mac-close"></span>
                  <span className="mac-dot mac-minimize"></span>
                  <span className="mac-dot mac-maximize"></span>
                </div>
              </div>
              <div className="tablet-body tablet-code-bg">
                <pre className="tablet-code">
                  <code>
<span className="keyword">function</span> <span className="class-name">search</span>(nums, target) {'{\n'}
  <span className="keyword">let</span> left = <span className="number">0</span>, right = nums.length - <span className="number">1</span>;{'\n'}
  <span className="keyword">while</span> (left &lt;= right) {'{\n'}
    <span className="keyword">let</span> mid = <span className="class-name">Math</span>.floor((left + right) / <span className="number">2</span>);{'\n'}
    <span className="keyword">if</span> (nums[mid] === target) <span className="keyword">return</span> mid;{'\n'}
    <span className="keyword">if</span> (nums[mid] &lt; target) left = mid + <span className="number">1</span>;{'\n'}
    <span className="keyword">else</span> right = mid - <span className="number">1</span>;{'\n'}
  {'}\n'}
  <span className="keyword">return</span> -<span className="number">1</span>;{'\n'}
{'}'}
                  </code>
                </pre>
              </div>
            </div>
          </div>
          <div className="hero-right">
            <h1 className="hero-title">A New Way to Learn</h1>
            <p className="hero-subtitle">JudgeX is the best platform to help you enhance your skills, expand your knowledge and prepare for technical interviews.</p>
            <Link to="/register" className="btn-create-account">
              Create Account <ChevronRight size={16} />
            </Link>
          </div>
        </div>
        <div className="hero-angled-bottom"></div>
      </div>



      {/* Explore Section */}
      <div className="landing-section explore-split">
        <div className="explore-left">
          <div className="explore-heading">
            <h2>Start Exploring</h2>
            <div className="hex-icon green-hex"><GraduationCap size={24} color="white" /></div>
          </div>
          <p>Explore is a well-organized tool that helps you get the most out of JudgeX by providing structure to guide your progress towards the next step in your programming career.</p>
          <Link to="/explore" className="link-get-started">Get Started <ChevronRight size={16} /></Link>
        </div>
        <div className="explore-right">
          <div className="css-cards-stack">
            <div className="stack-card card-back-2"></div>
            <div className="stack-card card-back-1"></div>
            <div className="stack-card card-front">
               <div className="card-top-bar"></div>
               <Link to="/explore" className="card-play-btn">
                 <Play size={24} fill="var(--accent-primary)" color="var(--accent-primary)" />
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="landing-section features-split">
        <div className="feature-col">
          <div className="hex-group">
            <div className="hex-icon blue-hex">4200</div>
            <div className="hex-icon green-hex"><UserCircle2 size={20} color="white" /></div>
            <div className="hex-icon yellow-hex"><Star size={20} color="white" /></div>
          </div>
          <h3>Questions, Community & Contests</h3>
          <p>Over 4200 questions for you to practice. Come and join one of the largest tech communities with hundreds of thousands of active users and participate in our contests to challenge yourself and earn rewards.</p>
          <Link to="/problems" className="link-get-started">View Questions <ChevronRight size={16} /></Link>
        </div>
        <div className="feature-col">
          <div className="hex-group">
            <div className="hex-icon brown-hex"><Target size={20} color="white" /></div>
            <div className="hex-icon grey-hex"><Lock size={20} color="white" /></div>
          </div>
          <h3>Companies & Candidates</h3>
          <p>Not only does JudgeX prepare candidates for technical interviews, we also help companies identify top technical talent. From sponsoring contests to providing online assessments and training, we offer numerous services to businesses.</p>
          <Link to="/business" className="link-get-started">Business Opportunities <ChevronRight size={16} /></Link>
        </div>
      </div>

      {/* Developer Section */}
      <div className="landing-section developer-section">
        <div className="dev-header">
          <h2>Developer</h2>
          <p>We now support 14 popular coding languages. At our core, JudgeX is about developers. Our powerful development tools such as Playground help you test, debug and even write your own projects online.</p>
        </div>
        
        <div className="css-editor-container">
           <div className="css-editor">
             <div className="editor-top">
               <div className="editor-tabs">
                 {Object.keys(problemsData[activeProblem].snippets).map(lang => (
                   <span 
                     key={lang} 
                     className={`tab ${activeLang === lang ? 'active' : ''}`}
                     onClick={() => setActiveLang(lang)}
                   >
                     {lang}
                   </span>
                 ))}
               </div>
               <div className="editor-actions">
                 <button className="btn-editor-action"><Lock size={12}/> Copy</button>
                 <button className="btn-editor-run" onClick={handleRun}><Play size={12} fill="white" /> {runState === 'running' ? 'Running...' : 'Run'}</button>
                 <button className="btn-editor-dark"><Terminal size={12}/> Playground</button>
               </div>
             </div>
             <div className="editor-body">
               <div className="line-numbers">
                 {[...Array((problemsData[activeProblem].snippets[activeLang] || '').split('\n').length)].map((_, i) => <span key={i}>{i + 1}</span>)}
               </div>
               <div className="code-content">
                 <pre><code dangerouslySetInnerHTML={{ __html: highlightCode(problemsData[activeProblem].snippets[activeLang] || '') }} /></pre>
               </div>
             </div>
             
             {runState !== 'idle' && (
               <div className="mock-console">
                 <div className="console-header">
                   <span>Console Output</span>
                   <button onClick={() => setRunState('idle')}>✖</button>
                 </div>
                 <div className="console-output">
                   {runState === 'running' ? (
                     <span className="text-warning">Compiling and executing {activeLang} code...</span>
                   ) : (
                     <div>
                       <div className="text-success" style={{ fontWeight: 'bold', marginBottom: '8px' }}>✔ Accepted</div>
                       <div>Runtime: {Math.floor(Math.random() * 5) + 1} ms</div>
                       <div>Memory: {Math.floor(Math.random() * 10) + 40} MB</div>
                       <br/>
                       <div><span style={{ color: '#94a3b8' }}>Input:</span> {problemsData[activeProblem].input}</div>
                       <div><span style={{ color: '#94a3b8' }}>Output:</span> {problemsData[activeProblem].output}</div>
                       <div><span style={{ color: '#94a3b8' }}>Expected:</span> {problemsData[activeProblem].output}</div>
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>
           
           <div className="editor-sidebar">
             {Object.entries(problemsData).map(([key, data]) => (
                <div 
                  key={key} 
                  className={`sidebar-link ${activeProblem === key ? 'active-link' : ''}`}
                  onClick={() => setActiveProblem(key)}
                  style={{ fontWeight: activeProblem === key ? 'bold' : 'normal' }}
                >
                  <ChevronRight size={14}/> {data.title}
                </div>
             ))}
             <div className="sidebar-divider"></div>
             <Link to="/playground" className="link-get-started">Create Playground <ChevronRight size={14}/></Link>
           </div>
        </div>


      </div>

      {/* Made with Love Section */}
      <div className="landing-section made-in-sf">
        <div className="sf-header">
          <div className="hex-icon red-hex sf-hex">
             <div className="bridge-icon"></div>
          </div>
          <h2 className="made-with-love">Made with <span className="heart">♥</span> by Samiran</h2>
          <p className="sf-desc">
            At JudgeX, our mission is to help you improve yourself and land your dream job. We have a sizable repository of interview resources for many companies. In the past few years, our users have landed jobs at top companies around the world.
          </p>
        </div>

        <div className="join-team-section">
          <p>If you are passionate about tackling some of the most interesting problems around, we would love to hear from you.</p>
          <a href="#" className="link-join-team">Join Our Team <ChevronRight size={14}/></a>
        </div>
      </div>

      <footer className="landing-footer">
        <div className="footer-left">
          <span>Copyright © 2026 JudgeX</span>
        </div>
        <div className="footer-right">
          <a href="#">Download App</a> | 
          <a href="#">Help Center</a> | 
          <a href="#">Bug Bounty</a> | 
          <a href="#">Terms</a> | 
          <a href="#">Privacy Policy</a>
          <span className="region"><span className="flag">🇺🇸</span> United States</span>
        </div>
      </footer>
    </div>
  );
};

const ExploreCard = ({ title, subtitle, chapters, items, progress, bgClass }: any) => {
  return (
    <div className="explore-dark-card">
      <div className={`card-top ${bgClass}`}>
        <p className="card-subtitle">{subtitle}</p>
        <h3 className="card-title">{title}</h3>
        <button className="btn-play">
          <Play size={20} fill="white" className="play-icon" />
        </button>
      </div>
      <div className="card-bottom">
        <div className="stat">
          <span className="stat-val">{chapters}</span>
          <span className="stat-label">Chapters</span>
        </div>
        <div className="stat">
          <span className="stat-val">{items}</span>
          <span className="stat-label">Items</span>
        </div>
        <div className="stat right-align">
          <span className="stat-val">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

const ExplorePage = () => {
  return (
    <div className="explore-layout dark-theme">
      {/* Left Sidebar */}
      <aside className="explore-sidebar">
        <nav className="explore-nav">
          <a href="#" className="nav-item"><Library size={18} /> Library</a>
          <a href="#" className="nav-item"><Target size={18} /> Quest</a>
          <a href="#" className="nav-item active"><Compass size={18} /> Explore</a>
          <a href="#" className="nav-item"><GraduationCap size={18} /> Study Plan</a>
        </nav>
        <div className="sidebar-bottom">
          <p className="signin-text">Sign in to view lists and track study progress.</p>
          <button className="btn-signin"><UserCircle2 size={16} /> Sign in</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="explore-main-content">
        <header className="explore-header">
          <div>
            <span className="welcome-text">Welcome to</span>
            <h1>JudgeX Explore</h1>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Star size={18} /></button>
            <button className="icon-btn"><Clock size={18} /></button>
          </div>
        </header>

        <section className="explore-section">
          <div className="section-header-row">
            <h2>Featured</h2>
            <button className="btn-more">More</button>
          </div>
          <div className="cards-row">
            <ExploreCard 
               title="Data Structures and Algorithms"
               subtitle="JudgeX's Interview Crash Course"
               chapters={13} items={149} progress={0}
               bgClass="bg-gradient-purple"
            />
            <ExploreCard 
               title="System Design for Interviews and Beyond"
               subtitle="JudgeX's Interview Crash Course"
               chapters={16} items={81} progress={0}
               bgClass="bg-gradient-green"
            />
            <ExploreCard 
               title="The JudgeX Beginner's Guide"
               subtitle=""
               chapters={4} items={17} progress={0}
               bgClass="bg-gradient-orange"
            />
            <ExploreCard 
               title="Top Interview Questions"
               subtitle="Easy Collection"
               chapters={9} items={48} progress={0}
               bgClass="bg-gradient-darkgreen"
            />
          </div>
        </section>
        
        <section className="explore-section">
          <div className="section-header-row">
            <h2>Interview</h2>
            <button className="btn-more">More</button>
          </div>
          <div className="cards-row">
            <ExploreCard 
               title="Cheatsheets"
               subtitle="JudgeX's Interview Crash Course"
               chapters={5} items={20} progress={0}
               bgClass="bg-gradient-blue"
            />
            <ExploreCard 
               title="Data Structures and Algorithms"
               subtitle="JudgeX's Interview Crash Course"
               chapters={13} items={149} progress={0}
               bgClass="bg-gradient-purple"
            />
            <ExploreCard 
               title="System Design for Interviews and Beyond"
               subtitle="JudgeX's Interview Crash Course"
               chapters={16} items={81} progress={0}
               bgClass="bg-gradient-green"
            />
            <ExploreCard 
               title="Top Interview Questions"
               subtitle="Premium"
               chapters={10} items={50} progress={0}
               bgClass="bg-gradient-yellow"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const Splash = () => {
  const [text, setText] = useState('');
  const fullText = "Elevate your code. Master your craft.";
  
  useEffect(() => {
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    const startTyping = () => {
      setText('');
      i = 0;
      intervalId = setInterval(() => {
        setText(fullText.substring(0, i + 1));
        i++;
        if (i === fullText.length) {
          clearInterval(intervalId);
          timeoutId = setTimeout(() => {
            startTyping();
          }, 3000);
        }
      }, 100);
    };

    startTyping();
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/logo.png" alt="JudgeX Logo" className="splash-logo" />
        <div className="splash-quote-container">
           <h2 className="splash-quote">{text}<span className="cursor">|</span></h2>
        </div>
        <Link to="/home" className="btn-launch">Launch JudgeX</Link>
      </div>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check URL for OAuth token
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        
        // Dispatch to Redux store
        dispatch(setCredentials({ 
          user: { id: decoded.id, email: decoded.email, username: decoded.username || decoded.email }, 
          token 
        }));
        
        // Clean URL by removing the ?token parameter without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to decode token from URL', error);
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Welcome />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/contest" element={<ContestsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/problems/:slug" element={<Workspace />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="*" element={<div className="not-found"><h1>404 - Not Found</h1></div>} />
      </Routes>
    </Router>
  );
};

export default App;
