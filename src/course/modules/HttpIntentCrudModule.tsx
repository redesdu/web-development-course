import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { WrittenAnswer } from '@/components/WrittenAnswer';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';
import { MINIMUM_ANSWER_WORDS, meetsWordMinimum } from '@/lib/wordCount';

const METHODS = [
  { id: 'get', label: 'GET' },
  { id: 'post', label: 'POST' },
  { id: 'patch', label: 'PATCH' },
  { id: 'delete', label: 'DELETE' },
] as const;

const PATHS = [
  { id: 'reservation-collection', label: '/reservations' },
  { id: 'reservation-item', label: '/reservations/582' },
  { id: 'student-account', label: '/students/me' },
] as const;

const STATUSES = [
  { id: 'success', label: '2xx success', example: '201 Created' },
  { id: 'client-error', label: '4xx client error', example: '400 Bad Request' },
  { id: 'server-error', label: '5xx server error', example: '500 Internal Server Error' },
] as const;

interface ExchangeState {
  methodId: string | null;
  pathId: string | null;
  statusId: string | null;
  submitted: boolean;
}

const emptyExchange: ExchangeState = {
  methodId: null,
  pathId: null,
  statusId: null,
  submitted: false,
};

const exchangeStorageKey = courseStorageKey('http-exchange-builder', 'reservation-create');

function parseExchangeState(value: unknown): ExchangeState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  const methodIds = new Set<string>(METHODS.map((option) => option.id));
  const pathIds = new Set<string>(PATHS.map((option) => option.id));
  const statusIds = new Set<string>(STATUSES.map((option) => option.id));
  const methodId = typeof saved.methodId === 'string' && methodIds.has(saved.methodId) ? saved.methodId : null;
  const pathId = typeof saved.pathId === 'string' && pathIds.has(saved.pathId) ? saved.pathId : null;
  const statusId = typeof saved.statusId === 'string' && statusIds.has(saved.statusId) ? saved.statusId : null;
  if (saved.version !== 1 || typeof saved.submitted !== 'boolean') return null;
  if ((saved.methodId !== null && methodId === null) || (saved.pathId !== null && pathId === null) || (saved.statusId !== null && statusId === null)) return null;
  return { methodId, pathId, statusId, submitted: saved.submitted };
}

function loadExchangeState() {
  return readStorageJson(exchangeStorageKey, parseExchangeState) ?? emptyExchange;
}

function optionLabel(options: readonly { id: string; label: string }[], id: string | null, fallback: string) {
  return options.find((option) => option.id === id)?.label ?? fallback;
}

function statusExample(id: string | null) {
  return STATUSES.find((option) => option.id === id)?.example ?? 'STATUS';
}

export function ExchangeBuilder({ onComplete }: { onComplete: () => void }) {
  const titleId = useId();
  const [state, setState] = useState<ExchangeState>(loadExchangeState);
  const reportedComplete = useRef(false);
  const allSelected = Boolean(state.methodId && state.pathId && state.statusId);
  const correct = state.methodId === 'post' && state.pathId === 'reservation-collection' && state.statusId === 'success';

  useEffect(() => {
    writeStorageJson(exchangeStorageKey, { version: 1, ...state });
  }, [state]);

  useEffect(() => {
    if (!state.submitted || !correct) {
      reportedComplete.current = false;
      return;
    }
    if (!reportedComplete.current) {
      reportedComplete.current = true;
      onComplete();
    }
  }, [correct, onComplete, state.submitted]);

  const update = (field: 'methodId' | 'pathId' | 'statusId', value: string) => {
    setState((current) => ({ ...current, [field]: value || null, submitted: false }));
  };

  return (
    <section className="visual-lab http-builder" aria-labelledby={titleId}>
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Construct the exchange</p>
          <h3 id={titleId}>A student reserves camera 17</h3>
        </div>
        <p className="visual-prompt">The server creates reservation 582 and reports that the operation succeeded.</p>
      </div>

      <div className="http-builder-grid">
        <label>
          <span>HTTP method</span>
          <select value={state.methodId ?? ''} onChange={(event) => update('methodId', event.target.value)}>
            <option value="">Choose a method</option>
            {METHODS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Target path</span>
          <select value={state.pathId ?? ''} onChange={(event) => update('pathId', event.target.value)}>
            <option value="">Choose a path</option>
            {PATHS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Response status family</span>
          <select value={state.statusId ?? ''} onChange={(event) => update('statusId', event.target.value)}>
            <option value="">Choose a status family</option>
            {STATUSES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </div>

      <div className="http-builder-preview" aria-label="Assembled HTTP exchange">
        <div>
          <span>Request</span>
          <code>{optionLabel(METHODS, state.methodId, 'METHOD')} {optionLabel(PATHS, state.pathId, '/target')} HTTP/1.1</code>
          <code>Content-Type: application/json</code>
          <code className="http-blank-line" aria-label="Blank line">&nbsp;</code>
          <code>{'{ "itemId": 17 }'}</code>
        </div>
        <div>
          <span>Response</span>
          <code>HTTP/1.1 {statusExample(state.statusId)}</code>
          <code>Location: /reservations/582</code>
        </div>
      </div>

      <div className="http-builder-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={!allSelected || state.submitted}
          onClick={() => setState((current) => ({ ...current, submitted: true }))}
        >
          Send this exchange
        </button>
        {state.submitted && (
          <button type="button" className="button button-quiet" onClick={() => setState((current) => ({ ...current, submitted: false }))}>
            Revise exchange
          </button>
        )}
      </div>

      {!allSelected && (
        <p className="http-builder-hint">
          This is a fresh attempt. Choose a new answer in all three menus to enable Send this exchange.
        </p>
      )}

      {state.submitted && (
        <div className={`http-diagnostic ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">
          <strong>{correct ? 'This exchange matches the intent.' : 'One or more fields change the meaning.'}</strong>
          <ul>
            <li data-result={state.methodId === 'post' ? 'correct' : 'incorrect'}>
              {state.methodId === 'post'
                ? 'POST asks the collection to create a new reservation.'
                : 'The intent is to create a new reservation. POST communicates that creation intent.'}
            </li>
            <li data-result={state.pathId === 'reservation-collection' ? 'correct' : 'incorrect'}>
              {state.pathId === 'reservation-collection'
                ? 'The collection path names the place where a new reservation belongs.'
                : 'Reservation 582 does not exist before the server creates it, so target the collection rather than an item path.'}
            </li>
            <li data-result={state.statusId === 'success' ? 'correct' : 'incorrect'}>
              {state.statusId === 'success'
                ? 'A 2xx response reports that the server handled the request successfully.'
                : 'The scenario says the operation succeeded. A 4xx or 5xx family would report a failure instead.'}
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}

interface TransferState {
  text: string;
  submitted: boolean;
  confirmed: boolean;
}

const emptyTransfer: TransferState = { text: '', submitted: false, confirmed: false };
const transferStorageKey = courseStorageKey('http-transfer', 'saved-restaurant-delete');

function parseTransferState(value: unknown): TransferState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1 || typeof saved.text !== 'string' || typeof saved.submitted !== 'boolean' || typeof saved.confirmed !== 'boolean') return null;
  if (saved.confirmed && !saved.submitted) return null;
  // An answer saved before the twenty-word minimum existed is still the
  // student's work. It is loaded as written; only a new submission is measured.
  return { text: saved.text, submitted: saved.submitted, confirmed: saved.confirmed };
}

function loadTransferState() {
  return readStorageJson(transferStorageKey, parseTransferState) ?? emptyTransfer;
}

export function TransferExplanation({ onComplete, onReset }: { onComplete: () => void; onReset?: () => void }) {
  const fieldId = useId();
  const [state, setState] = useState<TransferState>(loadTransferState);
  const reportedComplete = useRef(false);
  const longEnough = meetsWordMinimum(state.text);

  useEffect(() => {
    writeStorageJson(transferStorageKey, { version: 1, ...state });
  }, [state]);

  useEffect(() => {
    if (!state.confirmed) {
      reportedComplete.current = false;
      return;
    }
    if (!reportedComplete.current) {
      reportedComplete.current = true;
      onComplete();
    }
  }, [onComplete, state.confirmed]);

  const reset = () => {
    removeStorageValue(transferStorageKey);
    setState(emptyTransfer);
    onReset?.();
  };

  return (
    <section className="http-transfer" aria-labelledby={`${fieldId}-title`}>
      <p className="eyebrow">Fresh case</p>
      <h3 id={`${fieldId}-title`}>A user removes restaurant 42 from a saved list</h3>
      <p>
        Explain what happens from the click until the browser removes the item. Include the request, the server's work,
        the response, and the browser's final decision. Use your own words before comparing.
      </p>
      <WrittenAnswer
        label="Your explanation"
        value={state.text}
        disabled={state.submitted}
        onChange={(text) => setState({ text, submitted: false, confirmed: false })}
        placeholder="Start with what the browser sends..."
        instruction={`Write at least ${MINIMUM_ANSWER_WORDS} words. Name all four parts: the request, the server's work, the response, and the browser's decision.`}
      >
        <div className="http-transfer-actions">
          {!state.submitted ? (
            <button
              type="button"
              className="button button-primary"
              disabled={!longEnough}
              onClick={() => setState((current) => ({ ...current, submitted: true }))}
            >
              Compare explanation
            </button>
          ) : (
            <button type="button" className="button button-quiet" onClick={() => setState((current) => ({ ...current, submitted: false, confirmed: false }))}>
              Revise explanation
            </button>
          )}
          <button type="button" className="button button-quiet" onClick={reset}><RotateCcw size={15} /> Reset</button>
        </div>
      </WrittenAnswer>

      {state.submitted && (
        <div className="http-model-answer">
          <h4>Compare these four parts</h4>
          <ol>
            <li>The browser sends a request such as <code>DELETE /saved-restaurants/42</code>.</li>
            <li>The server checks the request and removes the correct saved item if the operation is allowed.</li>
            <li>The server returns a response. A 2xx status reports success in this case.</li>
            <li>The browser reads that response and updates the visible list.</li>
          </ol>
          <p>This is a model for comparison. Endpoint names can differ, but the request-response mechanism remains.</p>
          {!state.confirmed ? (
            <button type="button" className="button button-secondary" onClick={() => setState((current) => ({ ...current, confirmed: true }))}>
              I compared all four parts
            </button>
          ) : (
            <p className="http-transfer-complete" role="status"><CheckCircle2 size={18} /> Comparison complete. Your explanation remains available when you return.</p>
          )}
        </div>
      )}
    </section>
  );
}

function MechanismTrace() {
  const steps = [
    ['1', 'Browser action', 'The student presses Reserve for camera 17.'],
    ['2', 'Request', 'The browser sends an HTTP message that names the intended operation and target.'],
    ['3', 'Server work', 'The server reads the request, checks it, and runs the application logic.'],
    ['4', 'Response', 'The server returns an HTTP message that reports the outcome and may include data.'],
    ['5', 'Interface update', 'The browser reads the response and decides what the student sees next.'],
  ];

  return (
    <>
      <p>
        A campus equipment site lets a student reserve a camera. The button is only the visible start. Shared data
        lives on the server, so the browser must ask the server to perform the operation.
      </p>
      <ol className="http-trace" aria-label="A browser and server HTTP exchange">
        {steps.map(([number, title, description]) => (
          <li key={number}>
            <span>{number}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </li>
        ))}
      </ol>
      <p>
        A proxy can relay a message between client and server, but the browser still acts as the client in this
        exchange. It starts the ordinary request shown here, then waits for a response.
      </p>
      <blockquote>
        “The Reserve button creates the database row” skips the request, the server's decision, and the response.
      </blockquote>
    </>
  );
}

function MessageAnatomy() {
  return (
    <>
      <p>
        HTTP gives each message a readable structure. The first line states the request or result. Headers add
        context. A blank line separates those headers from an optional body.
      </p>
      <p className="http-example-label">New instructional example</p>
      <div className="http-message-grid">
        <figure>
          <figcaption>Request</figcaption>
          <pre><code>{`POST /reservations HTTP/1.1\nHost: equipment.example\nContent-Type: application/json\n\n{ "itemId": 17 }`}</code></pre>
        </figure>
        <figure>
          <figcaption>Response</figcaption>
          <pre><code>{`HTTP/1.1 201 Created\nLocation: /reservations/582\nContent-Type: application/json\n\n{ "reservationId": 582 }`}</code></pre>
        </figure>
      </div>

      <div className="http-url-anatomy" aria-label="Parts of a URL">
        <code>https://</code><span>protocol</span>
        <code>equipment.example</code><span>host</span>
        <code>:443</code><span>port</span>
        <code>/reservations/582</code><span>path</span>
      </div>

      <h3>Read the status as evidence</h3>
      <div className="http-status-families" role="list" aria-label="HTTP response status families">
        {[
          ['1xx', 'Information'],
          ['2xx', 'Success'],
          ['3xx', 'Redirection'],
          ['4xx', 'Client error'],
          ['5xx', 'Server error'],
        ].map(([family, meaning]) => (
          <div key={family} role="listitem"><strong>{family}</strong><span>{meaning}</span></div>
        ))}
      </div>

      <h3>Connect the message to CRUD intent</h3>
      <div className="http-table-wrap">
        <table className="http-crud-table">
          <caption>A useful starting map, not a rule that chooses every endpoint for you</caption>
          <thead><tr><th>Intent</th><th>Common method</th><th>Meaning</th></tr></thead>
          <tbody>
            <tr><td>Create</td><td><code>POST</code></td><td>Submit a new entity to a collection</td></tr>
            <tr><td>Read</td><td><code>GET</code></td><td>Retrieve a resource</td></tr>
            <tr><td>Update</td><td><code>PUT</code> or <code>PATCH</code></td><td>Replace or partially modify an entity</td></tr>
            <tr><td>Delete</td><td><code>DELETE</code></td><td>Remove an entity</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function HttpIntentCrudModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();
  const steps: LearningFlowStep[] = [
    {
      id: 'trace-mechanism',
      title: 'A click starts a conversation',
      sectionLabel: 'Trace the mechanism',
      autoComplete: true,
      render: () => <MechanismTrace />,
    },
    {
      id: 'read-messages',
      title: 'Read the evidence in the messages',
      sectionLabel: 'Worked example',
      autoComplete: true,
      render: () => <MessageAnatomy />,
    },
    {
      id: 'build-exchange',
      title: 'Build an exchange that matches the intent',
      sectionLabel: 'Construct and diagnose',
      render: ({ completeStep }) => <ExchangeBuilder onComplete={completeStep} />,
    },
    {
      id: 'transfer-explanation',
      title: 'Explain the mechanism in a fresh case',
      sectionLabel: 'Transfer',
      render: ({ completeStep, resetStep }) => <TransferExplanation onComplete={completeStep} onReset={resetStep} />,
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="http-intent-evidence-crud"
        steps={steps}
        moduleTitle={module.title}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
