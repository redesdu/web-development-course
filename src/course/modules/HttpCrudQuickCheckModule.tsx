import { KnowledgeCheck, type KnowledgeCheckOption } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

interface McqItem {
  id: string;
  title: string;
  question: string;
  options: KnowledgeCheckOption[];
}

const QUESTIONS: McqItem[] = [
  {
    id: 'web-app-definition',
    title: 'What makes it a web app?',
    question: 'Which description best matches a web application?',
    options: [
      { id: 'browser-remote-server', label: 'Software on a remote server that a browser accesses.', correct: true, feedback: 'A web app uses web technologies and the browser accesses software running on a remote server.' },
      { id: 'installed-only', label: 'Software that only runs after a local installation.', feedback: 'A locally installed application can be useful, but local installation does not define a web app.' },
      { id: 'offline-document', label: 'A document that never communicates over a network.', feedback: 'The lesson describes web apps as browser access to remote software over the internet.' },
    ],
  },
  {
    id: 'web-app-benefit',
    title: 'A reason to use web technology',
    question: 'Which benefit of web applications does the lecture name?',
    options: [
      { id: 'browser-platform', label: 'Modern browsers make the app usable across platforms.', correct: true, feedback: 'A browser provides a shared way to access the application on different platforms.' },
      { id: 'no-server-work', label: 'The server never needs to execute application code.', feedback: 'The lecture identifies server execution as part of a web app and as a possible performance concern.' },
      { id: 'no-security-risk', label: 'Data sent over the internet has no security concerns.', feedback: 'Security matters precisely because web apps send data over the internet.' },
    ],
  },
  {
    id: 'client-starts-request',
    title: 'Who starts the exchange?',
    question: 'In the ordinary HTTP request-response pattern from the lesson, who initiates communication?',
    options: [
      { id: 'browser-client', label: 'The browser, acting as the client.', correct: true, feedback: 'The client sends a request first. The server then handles it and returns a response.' },
      { id: 'server', label: 'The server, before the browser does anything.', feedback: 'In the ordinary request-response model taught here, the server waits for a client request.' },
      { id: 'proxy', label: 'A proxy, even when the browser makes the request.', feedback: 'A proxy can relay messages, but it does not replace the browser as the initiating client.' },
    ],
  },
  {
    id: 'get-retrieves',
    title: 'Choose the method',
    question: 'Which HTTP method commonly retrieves a resource?',
    options: [
      { id: 'get', label: 'GET', correct: true, feedback: 'GET requests a resource so the client can retrieve data.' },
      { id: 'post', label: 'POST', feedback: 'POST commonly submits a new entity to a collection.' },
      { id: 'delete', label: 'DELETE', feedback: 'DELETE communicates an intent to remove an entity.' },
    ],
  },
  {
    id: 'status-client-error',
    title: 'Read the status family',
    question: 'Which response status family indicates a client error?',
    options: [
      { id: 'two-xx', label: '2xx', feedback: 'A 2xx status reports success.' },
      { id: 'four-xx', label: '4xx', correct: true, feedback: 'A 4xx status reports a problem with the client request.' },
      { id: 'five-xx', label: '5xx', feedback: 'A 5xx status reports a server error.' },
    ],
  },
  {
    id: 'message-separator',
    title: 'Read the message structure',
    question: 'What separates HTTP headers from an optional message body?',
    options: [
      { id: 'blank-line', label: 'A blank line.', correct: true, feedback: 'The blank line marks where the headers end and an optional body begins.' },
      { id: 'status-code', label: 'A status code.', feedback: 'A status code belongs in a response start line. It does not separate headers from the body.' },
      { id: 'host-name', label: 'A host name.', feedback: 'A host name identifies a server. It does not separate parts of one HTTP message.' },
    ],
  },
  {
    id: 'url-hostname',
    title: 'Read a URL',
    question: 'In a URL, which part names the server?',
    options: [
      { id: 'protocol', label: 'The protocol.', feedback: 'The protocol names how the resource is accessed, such as https.' },
      { id: 'hostname', label: 'The hostname.', correct: true, feedback: 'The hostname is the DNS domain name or IP address of the server.' },
      { id: 'path', label: 'The path.', feedback: 'The path names the location of a resource on the server.' },
    ],
  },
  {
    id: 'post-creates',
    title: 'Map CRUD to HTTP',
    question: 'A site creates a new comment. Which method is the usual starting choice from the lecture’s CRUD map?',
    options: [
      { id: 'get', label: 'GET', feedback: 'GET retrieves a resource. It does not communicate the intent to create a new comment.' },
      { id: 'post', label: 'POST', correct: true, feedback: 'POST submits a new entity, so it fits creating a new comment.' },
      { id: 'delete', label: 'DELETE', feedback: 'DELETE communicates an intent to remove an entity.' },
    ],
  },
  {
    id: 'web-app-challenge',
    title: 'Name the web-app challenge',
    question: 'Which concern arises when many users use the same server at the same time?',
    options: [
      { id: 'scalability', label: 'Scalability.', correct: true, feedback: 'Scalability concerns how the system handles multiple users at the same time.' },
      { id: 'hostname', label: 'Hostname.', feedback: 'A hostname identifies a server. It does not describe handling many users.' },
      { id: 'hypertext', label: 'Hypertext.', feedback: 'Hypertext refers to text with links. It does not describe concurrent users.' },
    ],
  },
];

export default function HttpCrudQuickCheckModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();
  const steps: LearningFlowStep[] = QUESTIONS.map((item) => ({
    id: item.id,
    title: item.title,
    sectionLabel: 'Quick check',
    render: ({ completeStep }) => (
      <KnowledgeCheck
        storageKey={`http-crud-quick-check-${item.id}`}
        question={item.question}
        options={item.options}
        onCorrect={completeStep}
      />
    ),
  }));

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow storageKey="http-crud-quick-check" steps={steps} onFinish={() => setCompleted(module.slug, true)} />
    </LearningModuleLayout>
  );
}
