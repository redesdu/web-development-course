import { useEffect, useId, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CategoryChallenge, type ChallengeItem } from '@/components/CategoryChallenge';
import { FlashcardDeck, type Flashcard } from '@/components/FlashcardDeck';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

const RESPONSIBILITY_CASES: ChallengeItem[] = [
  { id: 'primary-navigation', prompt: 'Identify a group of links as the page’s primary navigation.', answer: 'HTML', explanation: 'HTML gives the links structural meaning with an element such as nav.' },
  { id: 'navigation-row', prompt: 'Arrange those navigation links in one row.', answer: 'CSS', explanation: 'CSS controls presentation and layout, including arranging items with Flexbox.' },
  { id: 'independent-story', prompt: 'Mark a news story as independent content.', answer: 'HTML', explanation: 'HTML communicates meaning with an element such as article.' },
  { id: 'story-spacing', prompt: 'Add space inside every news card.', answer: 'CSS', explanation: 'CSS padding creates space between content and its border.' },
  { id: 'form-field-name', prompt: 'Give a form input the name used when its value is submitted.', answer: 'HTML', explanation: 'The name attribute belongs to the form control’s HTML.' },
  { id: 'heading-colour', prompt: 'Change the colour of all level-two headings.', answer: 'CSS', explanation: 'A CSS selector can target the headings and apply a colour declaration.' },
];

const SELECTOR_CARDS: Flashcard[] = [
  { id: 'class', prompt: 'Which selector targets elements with class="card"?', answer: '.card', explanation: 'A full stop introduces a class selector.' },
  { id: 'id', prompt: 'Which selector targets the element with id="main"?', answer: '#main', explanation: 'A hash introduces an ID selector.' },
  { id: 'child', prompt: 'What relationship does ul > li select?', answer: 'Direct li children of a ul', explanation: 'The greater-than combinator requires a direct parent-child relationship.' },
  { id: 'adjacent', prompt: 'What relationship does p + p select?', answer: 'A p immediately following another p', explanation: 'The plus combinator selects the adjacent sibling on the right.' },
  { id: 'pseudo', prompt: 'What does :hover describe?', answer: 'A temporary interaction state', explanation: 'A pseudo-class can select an element while the pointer is over it.' },
];

const SELECTOR_CASES: ChallengeItem[] = [
  { id: 'class-match', prompt: '<article class="notice"> with selector .notice', answer: 'Matches', explanation: 'The element includes the notice class, so .notice matches it.' },
  { id: 'wrong-id', prompt: '<main id="content"> with selector #main', answer: 'Does not match', explanation: 'An ID selector must match the exact id value. The element’s ID is content.' },
  { id: 'direct-child', prompt: '<ul><li>One</li></ul> with selector ul > li', answer: 'Matches', explanation: 'The li is a direct child of the ul.' },
  { id: 'nested-child', prompt: '<ul><div><li>One</li></div></ul> with selector ul > li', answer: 'Does not match', explanation: 'The div sits between ul and li, so li is not a direct child of ul.' },
  { id: 'adjacent-sibling', prompt: '<p>One</p><p>Two</p> where the second p is tested against p + p', answer: 'Matches', explanation: 'The second paragraph immediately follows another paragraph.' },
];

const LAYOUT_CASES: ChallengeItem[] = [
  { id: 'one-axis', prompt: 'Distribute navigation items along one main axis.', answer: 'Flexbox', explanation: 'Flexbox is suited to one-dimensional alignment and distribution.' },
  { id: 'two-axis', prompt: 'Coordinate a gallery across rows and columns.', answer: 'Grid', explanation: 'Grid provides two-dimensional row and column control.' },
  { id: 'inner-space', prompt: 'Create space between a card’s content and border.', answer: 'Padding', explanation: 'Padding sits inside the border.' },
  { id: 'outer-space', prompt: 'Create space between neighbouring cards.', answer: 'Margin', explanation: 'Margin sits outside the border and separates elements.' },
  { id: 'no-space', prompt: 'Hide an element and remove its layout space.', answer: 'display: none', explanation: 'display: none removes the element’s box from layout.' },
  { id: 'keep-space', prompt: 'Hide an element but preserve its layout space.', answer: 'visibility: hidden', explanation: 'visibility: hidden keeps the element’s box in layout.' },
];

interface ApplicationState {
  method: string;
  element: string;
  css: string;
  explanation: string;
  submitted: boolean;
}

const emptyApplication: ApplicationState = { method: '', element: '', css: '', explanation: '', submitted: false };
const applicationKey = courseStorageKey('html-css-practice-application', 'resource-search');

function parseApplication(value: unknown): ApplicationState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1 || typeof saved.method !== 'string' || typeof saved.element !== 'string' || typeof saved.css !== 'string' || typeof saved.explanation !== 'string' || typeof saved.submitted !== 'boolean') return null;
  if (!['', 'get', 'post'].includes(saved.method) || !['', 'form', 'div', 'span'].includes(saved.element) || !['', '.result', '#result', 'result'].includes(saved.css)) return null;
  if (saved.submitted && saved.explanation.trim().length < 30) return null;
  return { method: saved.method, element: saved.element, css: saved.css, explanation: saved.explanation, submitted: saved.submitted };
}

export function PracticeApplication({ onComplete, onReset }: { onComplete: () => void; onReset: () => void }) {
  const id = useId();
  const [state, setState] = useState<ApplicationState>(() => readStorageJson(applicationKey, parseApplication) ?? emptyApplication);
  const reported = useRef(false);
  const correct = state.method === 'get' && state.element === 'form' && state.css === '.result';
  const ready = Boolean(state.method && state.element && state.css && state.explanation.trim().length >= 30);

  useEffect(() => {
    writeStorageJson(applicationKey, { version: 1, ...state });
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
    removeStorageValue(applicationKey);
    setState(emptyApplication);
    onReset();
  };

  return (
    <section className="html-css-task" aria-labelledby={`${id}-title`}>
      <p className="eyebrow">Short application</p>
      <h3 id={`${id}-title`}>Plan a course-resource search</h3>
      <p>The search retrieves filtered results without changing server data. Each result has class <code>result</code>.</p>
      <div className="html-css-select-grid">
        <label>Common form method
          <select value={state.method} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, method: event.target.value, submitted: false }))}>
            <option value="">Choose a method</option><option value="get">GET</option><option value="post">POST</option>
          </select>
        </label>
        <label>Element for the controls
          <select value={state.element} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, element: event.target.value, submitted: false }))}>
            <option value="">Choose an element</option><option value="form">&lt;form&gt;</option><option value="div">&lt;div&gt;</option><option value="span">&lt;span&gt;</option>
          </select>
        </label>
        <label>Selector for all results
          <select value={state.css} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, css: event.target.value, submitted: false }))}>
            <option value="">Choose a selector</option><option value=".result">.result</option><option value="#result">#result</option><option value="result">result</option>
          </select>
        </label>
      </div>
      <label className="html-css-text-label" htmlFor={`${id}-reason`}>Explain how HTML and CSS divide the work.</label>
      <textarea id={`${id}-reason`} value={state.explanation} disabled={state.submitted} onChange={(event) => setState((current) => ({ ...current, explanation: event.target.value, submitted: false }))} placeholder="HTML provides… CSS provides…" />
      <div className="html-css-actions">
        <button type="button" className="button button-primary" disabled={!ready || state.submitted} onClick={() => setState((current) => ({ ...current, submitted: true }))}>Check application</button>
        {state.submitted && <button type="button" className="button button-quiet" onClick={() => setState((current) => ({ ...current, submitted: false }))}>Revise</button>}
        <button type="button" className="button button-quiet" onClick={reset}><RotateCcw size={15} /> Reset</button>
      </div>
      {state.submitted && <div className={`html-css-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status"><strong>{correct ? 'The plan matches the stated behaviour.' : 'At least one choice does not match the requirement.'}</strong><p>A retrieval form commonly uses GET, form gives the controls meaning, and .result matches every element with the result class. GET does not make private data safe, so sensitive values still need careful design and HTTPS.</p></div>}
    </section>
  );
}

export default function HtmlCssPracticeModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();
  const steps: LearningFlowStep[] = [
    { id: 'html-or-css', title: 'Separate structure from presentation', sectionLabel: 'Classify', render: ({ completeStep }) => <CategoryChallenge title="Does HTML or CSS own this decision?" introduction="Classify each decision, then use the explanation to refine the boundary." categories={['HTML', 'CSS']} items={RESPONSIBILITY_CASES} storageKey="html-css-responsibilities" onComplete={completeStep} /> },
    { id: 'selector-recall', title: 'Recall the selector language', sectionLabel: 'Flashcards', render: ({ completeStep }) => <FlashcardDeck title="Selector symbols and relationships" cards={SELECTOR_CARDS} storageKey="html-css-selectors" onComplete={completeStep} /> },
    { id: 'form-method', title: 'Choose a method for a form', sectionLabel: 'Discriminate', render: ({ completeStep }) => <KnowledgeCheck storageKey="html-css-search-method" question="A search form retrieves matching course resources without changing server data. Which method is the usual starting choice?" options={[
      { id: 'get', label: 'GET', correct: true, feedback: 'GET fits retrieval and commonly encodes form fields in the URL query. That does not make it suitable for secrets.' },
      { id: 'post', label: 'POST', feedback: 'POST commonly submits data that changes server state. This case is explicitly retrieval-only.' },
      { id: 'delete', label: 'DELETE', feedback: 'DELETE communicates removal, not retrieval.' },
    ]} onCorrect={completeStep} /> },
    { id: 'selector-matching', title: 'Predict which elements a selector matches', sectionLabel: 'Classify', render: ({ completeStep }) => <CategoryChallenge title="Match or no match?" introduction="Read the markup and selector literally before choosing." categories={['Matches', 'Does not match']} items={SELECTOR_CASES} storageKey="html-css-selector-matches" onComplete={completeStep} /> },
    { id: 'layout-and-spacing', title: 'Choose the CSS mechanism that fits', sectionLabel: 'Classify', render: ({ completeStep }) => <CategoryChallenge title="Layout, spacing, and visibility" introduction="Choose the smallest mechanism that satisfies each requirement." categories={['Flexbox', 'Grid', 'Padding', 'Margin', 'display: none', 'visibility: hidden']} items={LAYOUT_CASES} storageKey="html-css-layout-practice" onComplete={completeStep} /> },
    { id: 'fresh-application', title: 'Apply the ideas to a fresh interface', sectionLabel: 'Transfer', render: ({ completeStep, resetStep }) => <PracticeApplication onComplete={completeStep} onReset={resetStep} /> },
  ];

  return <LearningModuleLayout module={module} manualCompletion={false}><LearningFlow storageKey="html-css-practice" steps={steps} onFinish={() => setCompleted(module.slug, true)} /></LearningModuleLayout>;
}
