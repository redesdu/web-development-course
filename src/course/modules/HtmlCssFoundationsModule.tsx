import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { CategoryChallenge, type ChallengeItem } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

const SEMANTIC_OPTIONS = ['div', 'nav', 'main', 'article', 'footer'] as const;

interface SemanticState {
  navigation: string;
  primary: string;
  story: string;
  submitted: boolean;
}

const emptySemantic: SemanticState = { navigation: '', primary: '', story: '', submitted: false };
const semanticStorageKey = courseStorageKey('html-css-semantic-builder', 'news-page');

function parseSemanticState(value: unknown): SemanticState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  const valid = new Set<string>(SEMANTIC_OPTIONS);
  if (saved.version !== 1 || typeof saved.submitted !== 'boolean') return null;
  if (typeof saved.navigation !== 'string' || typeof saved.primary !== 'string' || typeof saved.story !== 'string') return null;
  if ([saved.navigation, saved.primary, saved.story].some((choice) => choice !== '' && !valid.has(choice))) return null;
  return { navigation: saved.navigation, primary: saved.primary, story: saved.story, submitted: saved.submitted };
}

export function SemanticBuilder({ onComplete, onReset }: { onComplete: () => void; onReset: () => void }) {
  const titleId = useId();
  const [state, setState] = useState<SemanticState>(() => readStorageJson(semanticStorageKey, parseSemanticState) ?? emptySemantic);
  const reported = useRef(false);
  const complete = state.navigation === 'nav' && state.primary === 'main' && state.story === 'article';
  const allSelected = Boolean(state.navigation && state.primary && state.story);

  useEffect(() => {
    writeStorageJson(semanticStorageKey, { version: 1, ...state });
  }, [state]);
  useEffect(() => {
    if (!state.submitted || !complete) {
      reported.current = false;
      return;
    }
    if (!reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [complete, onComplete, state.submitted]);

  const update = (field: 'navigation' | 'primary' | 'story', value: string) => {
    setState((current) => ({ ...current, [field]: value, submitted: false }));
  };

  const reset = () => {
    removeStorageValue(semanticStorageKey);
    setState(emptySemantic);
    onReset();
  };

  return (
    <section className="html-css-task" aria-labelledby={titleId}>
      <p className="eyebrow">Construction and diagnosis</p>
      <h3 id={titleId}>Give a news page meaningful structure</h3>
      <p>A visual layout can look the same with generic containers. Choose elements that also describe each region's purpose.</p>
      <div className="html-css-select-grid">
        <label>Site navigation
          <select value={state.navigation} onChange={(event) => update('navigation', event.target.value)}>
            <option value="">Choose an element</option>
            {SEMANTIC_OPTIONS.map((option) => <option key={option} value={option}>{`<${option}>`}</option>)}
          </select>
        </label>
        <label>Primary page content
          <select value={state.primary} onChange={(event) => update('primary', event.target.value)}>
            <option value="">Choose an element</option>
            {SEMANTIC_OPTIONS.map((option) => <option key={option} value={option}>{`<${option}>`}</option>)}
          </select>
        </label>
        <label>Independent news story
          <select value={state.story} onChange={(event) => update('story', event.target.value)}>
            <option value="">Choose an element</option>
            {SEMANTIC_OPTIONS.map((option) => <option key={option} value={option}>{`<${option}>`}</option>)}
          </select>
        </label>
      </div>
      <div className="html-css-actions">
        <button type="button" className="button button-primary" disabled={!allSelected || state.submitted} onClick={() => setState((current) => ({ ...current, submitted: true }))}>Check structure</button>
        {state.submitted && <button type="button" className="button button-quiet" onClick={() => setState((current) => ({ ...current, submitted: false }))}>Revise</button>}
        <button type="button" className="button button-quiet" onClick={reset}><RotateCcw size={15} /> Reset</button>
      </div>
      {state.submitted && (
        <div className={`html-css-feedback ${complete ? 'is-correct' : 'is-incorrect'}`} role="status">
          <strong>{complete ? 'The structure communicates each region’s purpose.' : 'One or more choices hide useful meaning.'}</strong>
          <ul>
            <li><code>&lt;nav&gt;</code> identifies the major navigation links.</li>
            <li><code>&lt;main&gt;</code> identifies the page’s primary content.</li>
            <li><code>&lt;article&gt;</code> fits a story that can stand on its own.</li>
          </ul>
        </div>
      )}
    </section>
  );
}

const LAYOUT_CASES: ChallengeItem[] = [
  { id: 'toolbar', prompt: 'A toolbar needs controls arranged along one row.', answer: 'Flexbox', explanation: 'Flexbox controls alignment and distribution along one main axis, which fits a toolbar.' },
  { id: 'gallery', prompt: 'A gallery needs coordinated rows and columns.', answer: 'Grid', explanation: 'Grid provides two-dimensional control over rows and columns.' },
  { id: 'removed', prompt: 'A closed dialog must disappear and leave no layout space.', answer: 'display: none', explanation: 'display: none removes the element from layout.' },
  { id: 'reserved-space', prompt: 'A placeholder must become invisible while preserving its space.', answer: 'visibility: hidden', explanation: 'visibility: hidden hides the element but retains its layout box.' },
];

function FoundationsExplanation() {
  return (
    <div className="html-css-explanation">
      <p>A course news page needs both structure and presentation. HTML says what each part is. CSS selects those parts and describes how they should look or participate in layout.</p>
      <div className="html-css-roles" role="list" aria-label="HTML and CSS responsibilities">
        <div role="listitem"><strong>HTML</strong><span>Document structure, elements, content, attributes, forms, and meaning.</span></div>
        <div role="listitem"><strong>CSS</strong><span>Selectors, declarations, spacing, visibility, alignment, and layout.</span></div>
      </div>
      <pre className="html-css-code"><code>{`<article class="news-card">\n  <h2>Lab room change</h2>\n  <p>The session moves to room U45.</p>\n</article>\n\n.news-card { padding: 1rem; }`}</code></pre>
      <blockquote>Changing every container to <code>&lt;div&gt;</code> may preserve the appearance, but it removes meaning that browsers and assistive technology can use.</blockquote>
    </div>
  );
}

function CssRuleExplanation() {
  return (
    <div className="html-css-explanation">
      <p>A CSS rule answers two questions. The selector says which elements are candidates. The declarations say which property values to apply.</p>
      <div className="css-rule-anatomy" aria-label="Parts of a CSS rule">
        <code><mark>p.notice</mark> {'{'} <b>color</b>: <i>navy</i>; {'}'}</code>
        <span><mark>selector</mark><b>property</b><i>value</i></span>
      </div>
      <p>If several rules target the same property, the cascade resolves the conflict. In the limited case below, the more specific selector wins. Equal-specificity rules are decided by source order.</p>
      <pre className="html-css-code"><code>{`p { color: black; }\n.notice { color: rust; }\np.notice { color: navy; }`}</code></pre>
    </div>
  );
}

interface PlanState {
  wrapper: string;
  selector: string;
  layout: string;
  explanation: string;
  submitted: boolean;
}

const emptyPlan: PlanState = { wrapper: '', selector: '', layout: '', explanation: '', submitted: false };
const planStorageKey = courseStorageKey('html-css-transfer', 'course-announcements');

function parsePlanState(value: unknown): PlanState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1 || typeof saved.wrapper !== 'string' || typeof saved.selector !== 'string' || typeof saved.layout !== 'string' || typeof saved.explanation !== 'string' || typeof saved.submitted !== 'boolean') return null;
  if (!['', 'article', 'div', 'span'].includes(saved.wrapper) || !['', '.announcement', '#announcement', 'announcement'].includes(saved.selector) || !['', 'grid', 'flex', 'inline'].includes(saved.layout)) return null;
  if (saved.submitted && saved.explanation.trim().length < 35) return null;
  return { wrapper: saved.wrapper, selector: saved.selector, layout: saved.layout, explanation: saved.explanation, submitted: saved.submitted };
}

export function TransferPlan({ onComplete, onReset }: { onComplete: () => void; onReset: () => void }) {
  const id = useId();
  const [state, setState] = useState<PlanState>(() => readStorageJson(planStorageKey, parsePlanState) ?? emptyPlan);
  const reported = useRef(false);
  const correct = state.wrapper === 'article' && state.selector === '.announcement' && state.layout === 'grid';
  const ready = Boolean(state.wrapper && state.selector && state.layout && state.explanation.trim().length >= 35);

  useEffect(() => {
    writeStorageJson(planStorageKey, { version: 1, ...state });
  }, [state]);
  useEffect(() => {
    if (!state.submitted || !correct) {
      reported.current = false;
      return;
    }
    if (!reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [correct, onComplete, state.submitted]);

  const reset = () => {
    removeStorageValue(planStorageKey);
    setState(emptyPlan);
    onReset();
  };

  return (
    <section className="html-css-task" aria-labelledby={`${id}-title`}>
      <p className="eyebrow">Fresh case</p>
      <h3 id={`${id}-title`}>Plan a responsive announcements page</h3>
      <p>Each announcement stands on its own, every card has class <code>announcement</code>, and the cards should form responsive rows and columns.</p>
      <div className="html-css-select-grid">
        <label>Element for each announcement
          <select value={state.wrapper} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, wrapper: event.target.value, submitted: false }))}>
            <option value="">Choose an element</option><option value="article">&lt;article&gt;</option><option value="div">&lt;div&gt;</option><option value="span">&lt;span&gt;</option>
          </select>
        </label>
        <label>Selector for the shared class
          <select value={state.selector} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, selector: event.target.value, submitted: false }))}>
            <option value="">Choose a selector</option><option value=".announcement">.announcement</option><option value="#announcement">#announcement</option><option value="announcement">announcement</option>
          </select>
        </label>
        <label>Layout for rows and columns
          <select value={state.layout} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, layout: event.target.value, submitted: false }))}>
            <option value="">Choose a layout</option><option value="grid">Grid</option><option value="flex">Flexbox</option><option value="inline">Inline</option>
          </select>
        </label>
      </div>
      <label className="html-css-text-label" htmlFor={`${id}-explanation`}>Why do these choices fit?</label>
      <textarea id={`${id}-explanation`} value={state.explanation} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, explanation: event.target.value, submitted: false }))} placeholder="Explain the meaning, selector, and layout choice." />
      <div className="html-css-actions">
        <button type="button" className="button button-primary" disabled={!ready || state.submitted} onClick={() => setState((current) => ({ ...current, submitted: true }))}>Check page plan</button>
        {state.submitted && <button type="button" className="button button-quiet" onClick={() => setState((current) => ({ ...current, submitted: false }))}>Revise</button>}
        <button type="button" className="button button-quiet" onClick={reset}><RotateCcw size={15} /> Reset</button>
      </div>
      {state.submitted && (
        <div className={`html-css-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">
          <strong>{correct ? 'The page plan connects meaning, matching, and layout.' : 'Revisit the field or fields that do not match the stated requirement.'}</strong>
          <p><code>&lt;article&gt;</code> communicates independent content, <code>.announcement</code> selects the shared class, and Grid coordinates rows and columns.</p>
        </div>
      )}
    </section>
  );
}

export default function HtmlCssFoundationsModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();
  const steps: LearningFlowStep[] = [
    { id: 'structure-and-style', title: 'Structure and style solve different problems', sectionLabel: 'Build the model', autoComplete: true, render: () => <FoundationsExplanation /> },
    { id: 'semantic-structure', title: 'Choose elements that describe the page', sectionLabel: 'Construct meaning', render: ({ completeStep, resetStep }) => <SemanticBuilder onComplete={completeStep} onReset={resetStep} /> },
    { id: 'selector-and-cascade', title: 'Trace which CSS rule applies', sectionLabel: 'Read the rule', render: ({ completeStep }) => <><CssRuleExplanation /><KnowledgeCheck storageKey="html-css-cascade" question="What colour applies to a paragraph with class notice?" options={[
      { id: 'navy', label: 'Navy', correct: true, feedback: 'p.notice is more specific than p or .notice in this limited same-origin, normal-rule example.' },
      { id: 'rust', label: 'Rust', feedback: '.notice matches, but p.notice is more specific.' },
      { id: 'black', label: 'Black', feedback: 'p matches every paragraph, but the more specific p.notice rule wins.' },
    ]} onCorrect={completeStep} /></> },
    { id: 'layout-behaviour', title: 'Choose the layout behaviour the page needs', sectionLabel: 'Compare mechanisms', render: ({ completeStep }) => <CategoryChallenge title="Match the requirement to the CSS mechanism" introduction="Commit to one choice, then read why it fits." categories={['Flexbox', 'Grid', 'display: none', 'visibility: hidden']} items={LAYOUT_CASES} storageKey="html-css-layout-cases" onComplete={completeStep} /> },
    { id: 'fresh-page-plan', title: 'Apply structure and style to a fresh page', sectionLabel: 'Transfer', render: ({ completeStep, resetStep }) => <TransferPlan onComplete={completeStep} onReset={resetStep} /> },
  ];

  return <LearningModuleLayout module={module} manualCompletion={false}><LearningFlow storageKey="html-css-foundations" steps={steps} onFinish={() => setCompleted(module.slug, true)} /></LearningModuleLayout>;
}
