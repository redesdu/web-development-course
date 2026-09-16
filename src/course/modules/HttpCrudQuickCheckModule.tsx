import { ExchangeComposer, type ComposerField } from '@/components/ExchangeComposer';
import { KnowledgeCheck, type KnowledgeCheckOption } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import { SequenceOrder, type SequenceItem } from '@/components/SequenceOrder';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

/**
 * Scenario-based practice for Lecture 1.
 *
 * Each item puts the student inside a situation and asks them to decide
 * something, rather than asking which sentence matches a definition. The wrong
 * options are answers a student could reasonably defend, so choosing well needs
 * interpretation of the case and not recognition of familiar wording.
 */

interface ScenarioItem {
  id: string;
  title: string;
  scenario: string;
  question: string;
  hint: string;
  options: KnowledgeCheckOption[];
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'web-app-tradeoff',
    title: 'Argue the trade-off, not the slogan',
    scenario:
      'A department wants a booking tool for lab equipment. Staff use Windows, macOS, and Linux machines, and several want to book from a phone between classes. One developer proposes a desktop application installed on each machine; another proposes a web application. The department has one small server and expects most bookings in the ten minutes before each lab starts.',
    question: 'Which statement describes a real trade-off the department is accepting by choosing the web application?',
    hint: 'Both proposals have costs. Look for the statement that names something the department gives up, not something it gains.',
    options: [
      {
        id: 'concurrency-cost',
        label: 'Bookings concentrate on one server, so the team now has to think about handling many users at the same moment.',
        correct: true,
        feedback:
          'That is the trade-off. The browser gives every platform access without an install, but the work moves to a shared server, and the ten-minute rush is exactly the concurrency and scalability concern the lecture raises.',
      },
      {
        id: 'no-install-benefit',
        label: 'Students will not need to install anything, which makes the web application the better choice.',
        feedback:
          'This is true and it is a reason to choose the web, but the question asks what the department gives up. A benefit is not a trade-off.',
      },
      {
        id: 'server-never-executes',
        label: 'The browser runs all the booking logic, so the small server stays idle and capacity is not a concern.',
        feedback:
          'Booking data is shared between users, so it has to live on the server and the server has to execute the logic that protects it. This is the misconception that the visible interface is the whole application.',
      },
      {
        id: 'security-solved',
        label: 'Because the browser uses HTTPS, booking data is no longer a security concern for the team.',
        feedback:
          'HTTPS protects the message in transit. It does not decide who is allowed to cancel someone else\'s booking. Sending data over the internet is a reason security needs more attention here, not less.',
      },
    ],
  },
  {
    id: 'message-structure-diagnosis',
    title: 'Read a message that does not work',
    scenario:
      'A student is testing an endpoint by hand and pastes this request into a tool:\n\nPOST /reservations HTTP/1.1\nHost: equipment.example\nContent-Type: application/json\n{ "itemId": 17 }\n\nThe server answers with a 400, and the student insists the JSON is valid. The JSON is valid.',
    question: 'What is wrong with this request?',
    hint: 'Compare the shape of this message with a worked example from the lesson, line by line, before reading any of the words.',
    options: [
      {
        id: 'missing-blank-line',
        label: 'The blank line between the headers and the body is missing, so the server cannot tell where the headers end.',
        correct: true,
        feedback:
          'Exactly. The blank line is part of the message structure, not formatting. Without it the server reads the JSON as another header line, which is why a valid body still produces a 400.',
      },
      {
        id: 'wrong-method',
        label: 'POST cannot carry a body, so the student should use PUT instead.',
        feedback:
          'POST carries a body routinely, and that is how a new reservation is submitted. Changing the method would change the intent without fixing the structure.',
      },
      {
        id: 'missing-content-length',
        label: 'The request has no Content-Length header, so the server rejects it.',
        feedback:
          'A missing length header can cause problems, but it is not the structural break here. The server never reaches the body at all, because nothing marks where the headers stopped.',
      },
      {
        id: 'status-is-server-fault',
        label: 'A 400 means the server failed, so the request itself is fine and the endpoint is broken.',
        feedback:
          'A 400 sits in the 4xx family, which reports a problem with the request. A failure on the server side would be reported in the 5xx family instead.',
      },
    ],
  },
  {
    id: 'url-reading',
    title: 'Two URLs, one difference that matters',
    scenario:
      'A team is reviewing an API. One endpoint is https://equipment.example/reservations and another is https://equipment.example/reservations/582. A developer says the two are interchangeable because they both start with the same protocol and host.',
    question: 'What do the two URLs actually identify?',
    hint: 'The protocol and host answer "which server". Ask what the rest of the URL answers.',
    options: [
      {
        id: 'collection-and-item',
        label: 'The same server, but one names the whole set of reservations and the other names one specific reservation.',
        correct: true,
        feedback:
          'That is the distinction. Protocol and host locate the server; the path locates the resource. A request to a collection and a request to one item mean different things even when the method is identical.',
      },
      {
        id: 'same-resource',
        label: 'The same resource, because 582 is only a display detail that the server ignores.',
        feedback:
          'The path is how the server identifies the resource. The number is the resource identity, not decoration.',
      },
      {
        id: 'protocol-difference',
        label: 'Different protocols, because the longer path implies a secure sub-request.',
        feedback:
          'Both URLs use https. The path length has nothing to do with the protocol.',
      },
      {
        id: 'port-difference',
        label: 'Different ports, because the path segment after the host selects the port.',
        feedback:
          'A port is written after the host with a colon, as in :443. A path segment never selects a port.',
      },
    ],
  },
  {
    id: 'status-as-evidence',
    title: 'Use the status as evidence',
    scenario:
      'Users report that deleting a saved restaurant "does nothing". A developer checks the browser network panel and finds the request was sent and the server answered 204. The list on screen still shows the restaurant until the page is reloaded, after which it is gone.',
    question: 'What does this evidence point to?',
    hint: 'The status tells you how far the request got. Ask which of the five steps in the exchange is the only one left.',
    options: [
      {
        id: 'browser-update',
        label: 'The server did the work and reported success, so the fault is in what the browser does with the response.',
        correct: true,
        feedback:
          'That is the reading. A 2xx says the server handled the request, and the reload confirms the data really changed. The last step of the exchange, the browser updating what the user sees, is the one that did not happen.',
      },
      {
        id: 'server-failed-silently',
        label: 'The server failed silently, because an empty response body means nothing was deleted.',
        feedback:
          'A 204 reports success with no content to return, which is a normal answer to a delete. An empty body is not evidence of failure.',
      },
      {
        id: 'wrong-method',
        label: 'The wrong method was used, since a successful delete would have returned 200 with the deleted item.',
        feedback:
          'Both 200 and 204 are success statuses, and either can follow a delete. The family is the evidence here, not the exact number.',
      },
      {
        id: 'needs-reload',
        label: 'Nothing is wrong. A deletion always requires a page reload before the interface can change.',
        feedback:
          'The browser receives the response and decides what to show. Needing a manual reload is the symptom being reported, not the expected behaviour.',
      },
    ],
  },
  {
    id: 'crud-intent',
    title: 'Same screen, different intent',
    scenario:
      'A profile screen has two controls. "Change photo" replaces the single image on the profile. "Add to album" puts a new image into the user\'s album, which can hold many images. A developer wants to use the same request for both because "they both send an image".',
    question: 'Which pairing of intent and method fits the lecture\'s CRUD map?',
    hint: 'Ask what exists after each action. One action leaves the same number of things; the other leaves one more.',
    options: [
      {
        id: 'update-and-create',
        label: 'Change photo is an update to an existing resource; add to album creates a new entry in a collection.',
        correct: true,
        feedback:
          'That is the distinction the map is for. Changing the photo modifies a resource that already exists, so it is an update. Adding to the album submits a new entity to a collection, so it is a creation, and the two target different paths.',
      },
      {
        id: 'both-create',
        label: 'Both are creations, because in each case the server receives an image it did not have before.',
        feedback:
          'The new bytes are not the point. After changing the photo the profile still has exactly one photo, so nothing was added to a collection.',
      },
      {
        id: 'both-update',
        label: 'Both are updates, because in each case the user\'s profile ends up different from before.',
        feedback:
          'By that reasoning every action is an update, which makes the map useless. The question is whether a new entity joins a collection.',
      },
      {
        id: 'method-by-size',
        label: 'The method should be chosen by payload size, with POST for large images and PATCH for small ones.',
        feedback:
          'Methods communicate intent, not size. A large update is still an update.',
      },
    ],
  },
  {
    id: 'incoherent-request',
    title: 'Diagnose a request that contradicts itself',
    scenario:
      'A log line shows this exchange against a working API:\n\nGET /reservations/582/delete HTTP/1.1\n\nHTTP/1.1 200 OK\n\nThe reservation is gone afterwards. A reviewer says the code must be correct because the status is 200 and the result is what the user wanted.',
    question: 'What is incoherent here, even though it appears to work?',
    hint: 'A 200 says the server did something and considered it fine. It does not say the message described that something honestly.',
    options: [
      {
        id: 'method-contradicts-effect',
        label: 'The method says retrieve while the effect removes data, so the message misrepresents what the request does.',
        correct: true,
        feedback:
          'That is the contradiction. GET communicates an intent to read, and anything that may follow a link or repeat a request can now delete data by accident. The action belongs in the method, not in the path.',
      },
      {
        id: 'status-should-be-204',
        label: 'The only problem is the status: the server should have answered 204 instead of 200.',
        feedback:
          'Either status can report success. Changing the number would leave a read request that destroys data, which is the real problem.',
      },
      {
        id: 'nothing-wrong',
        label: 'Nothing is incoherent. The path names the operation clearly, which is what matters.',
        feedback:
          'The path names the resource; the method names the operation. Moving the verb into the path hides the intent from everything that reads the method, including caches and crawlers.',
      },
      {
        id: 'missing-body',
        label: 'The request is incoherent because a deletion must always carry a body identifying the item.',
        feedback:
          'The path already identifies reservation 582, and a delete commonly carries no body at all. The mismatch is in the method.',
      },
    ],
  },
];

const UPDATE_FIELDS: ComposerField[] = [
  {
    name: 'method',
    label: 'HTTP method',
    correctId: 'patch',
    choices: [
      { id: 'get', label: 'GET' },
      { id: 'post', label: 'POST' },
      { id: 'patch', label: 'PATCH' },
      { id: 'delete', label: 'DELETE' },
    ],
    whenCorrect: 'PATCH communicates a partial change to something that already exists, which is what changing one field is.',
    whenIncorrect:
      'The reservation already exists and only its time changes. POST would submit a new entity, and GET would only read one.',
  },
  {
    name: 'target',
    label: 'Target path',
    correctId: 'reservation-item',
    choices: [
      { id: 'reservation-collection', label: '/reservations' },
      { id: 'reservation-item', label: '/reservations/582' },
      { id: 'reservation-update', label: '/reservations/582/update' },
    ],
    whenCorrect: 'The item path names the one reservation being changed.',
    whenIncorrect:
      'Target the reservation being changed, not the whole collection, and keep the operation in the method rather than adding a verb to the path.',
  },
  {
    name: 'status',
    label: 'Response status family',
    correctId: 'success',
    choices: [
      { id: 'success', label: '2xx success' },
      { id: 'client-error', label: '4xx client error' },
      { id: 'server-error', label: '5xx server error' },
    ],
    whenCorrect: 'A 2xx status reports that the server accepted and applied the change.',
    whenIncorrect: 'The scenario says the change was applied, so the response has to report success rather than a failure.',
  },
];

const DELETE_FIELDS: ComposerField[] = [
  {
    name: 'method',
    label: 'HTTP method',
    correctId: 'delete',
    choices: [
      { id: 'get', label: 'GET' },
      { id: 'post', label: 'POST' },
      { id: 'patch', label: 'PATCH' },
      { id: 'delete', label: 'DELETE' },
    ],
    whenCorrect: 'DELETE states the intent to remove the resource, so nothing has to read the path to learn what happens.',
    whenIncorrect:
      'The intent is removal. A read or a partial change would describe the request dishonestly, even if the server still removed the row.',
  },
  {
    name: 'target',
    label: 'Target path',
    correctId: 'saved-item',
    choices: [
      { id: 'saved-collection', label: '/saved-restaurants' },
      { id: 'saved-item', label: '/saved-restaurants/42' },
      { id: 'saved-remove', label: '/saved-restaurants/remove?id=42' },
    ],
    whenCorrect: 'The item path identifies exactly which saved restaurant is removed.',
    whenIncorrect:
      'A request to the collection does not say which entry to remove, and a remove verb in the path repeats what the method already says.',
  },
  {
    name: 'status',
    label: 'Response status family',
    correctId: 'success',
    choices: [
      { id: 'success', label: '2xx success' },
      { id: 'client-error', label: '4xx client error' },
      { id: 'server-error', label: '5xx server error' },
    ],
    whenCorrect: 'A 2xx status, commonly 204 with no body, reports that the item is gone.',
    whenIncorrect: 'The removal succeeded, so a 4xx or 5xx would report a failure that did not happen.',
  },
];

const PROXY_STEPS: SequenceItem[] = [
  {
    id: 'browser-request',
    label: 'The browser sends a request for the booking page',
    note: 'The client starts the exchange. Nothing before this point involves the network.',
  },
  {
    id: 'proxy-forwards',
    label: 'The campus proxy receives that request and forwards it towards the server',
    note: 'A proxy relays the message. It sits in the path but it does not become the client, and it does not start the exchange.',
  },
  {
    id: 'server-works',
    label: 'The server checks the request and runs the booking logic',
    note: 'Only the server can read and change the shared booking data, which is why the browser had to ask at all.',
  },
  {
    id: 'proxy-returns',
    label: 'The response travels back through the proxy',
    note: 'The reply follows the same path in reverse. The proxy relays it without deciding what the page shows.',
  },
  {
    id: 'browser-updates',
    label: 'The browser reads the response and updates what the student sees',
    note: 'The interface changes last, and only because the browser decided to change it after reading the response.',
  },
];

export default function HttpCrudQuickCheckModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const scenarioSteps: LearningFlowStep[] = SCENARIOS.map((item) => ({
    id: item.id,
    title: item.title,
    sectionLabel: 'Decide and justify',
    render: ({ completeStep, outcome }) => (
      <>
        <p className="scenario-setup">{item.scenario}</p>
        <KnowledgeCheck
          storageKey={`http-crud-scenario-${item.id}`}
          question={item.question}
          options={item.options}
          hint={item.hint}
          assistedCompleted={outcome === 'assisted'}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      </>
    ),
  }));

  const steps: LearningFlowStep[] = [
    scenarioSteps[0],
    {
      id: 'proxy-sequence',
      title: 'Order an exchange that passes through a proxy',
      sectionLabel: 'Trace the sequence',
      render: ({ completeStep, outcome }) => (
        <SequenceOrder
          storageKey="http-crud-proxy-sequence"
          prompt="A student on campus opens the booking page"
          scenario={(
            <p>
              The campus network sends all outbound web traffic through a proxy. A student opens the lab booking page and
              the page appears. Put the five events in the order they actually happen.
            </p>
          )}
          items={PROXY_STEPS}
          hint="Only one of these events can happen without anything having happened first."
          assistedCompleted={outcome === 'assisted'}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      ),
    },
    ...scenarioSteps.slice(1),
    {
      id: 'build-update',
      title: 'Build the exchange that changes a booking',
      sectionLabel: 'Construct',
      render: ({ completeStep, outcome }) => (
        <ExchangeComposer
          storageKey="http-crud-update-exchange"
          title="A student moves reservation 582 to a later slot"
          scenario={(
            <p>
              Reservation 582 already exists. The student changes only its start time. The server applies the change and
              keeps everything else about the reservation as it was.
            </p>
          )}
          fields={UPDATE_FIELDS}
          hint="Nothing new is created here, and nothing is removed. Only one field of an existing resource changes."
          assistedCompleted={outcome === 'assisted'}
          preview={(selected) => (
            <>
              <div>
                <span>Request</span>
                <code>
                  {UPDATE_FIELDS[0].choices.find((c) => c.id === selected.method)?.label ?? 'METHOD'}{' '}
                  {UPDATE_FIELDS[1].choices.find((c) => c.id === selected.target)?.label ?? '/target'} HTTP/1.1
                </code>
                <code>Content-Type: application/json</code>
                <code className="http-blank-line" aria-label="Blank line">&nbsp;</code>
                <code>{'{ "startsAt": "14:00" }'}</code>
              </div>
              <div>
                <span>Response</span>
                <code>
                  HTTP/1.1 {selected.status === 'success' ? '200 OK' : selected.status === 'client-error' ? '400 Bad Request' : selected.status === 'server-error' ? '500 Internal Server Error' : 'STATUS'}
                </code>
              </div>
            </>
          )}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      ),
    },
    {
      id: 'build-delete',
      title: 'Build the exchange that removes a saved item',
      sectionLabel: 'Construct',
      render: ({ completeStep, outcome }) => (
        <ExchangeComposer
          storageKey="http-crud-delete-exchange"
          title="A user removes restaurant 42 from a saved list"
          scenario={(
            <p>
              Saved restaurant 42 exists on the user’s list. The user removes it, the server removes it, and the
              response carries no content back.
            </p>
          )}
          fields={DELETE_FIELDS}
          hint="The method should make the intent readable without anyone inspecting the path."
          assistedCompleted={outcome === 'assisted'}
          preview={(selected) => (
            <>
              <div>
                <span>Request</span>
                <code>
                  {DELETE_FIELDS[0].choices.find((c) => c.id === selected.method)?.label ?? 'METHOD'}{' '}
                  {DELETE_FIELDS[1].choices.find((c) => c.id === selected.target)?.label ?? '/target'} HTTP/1.1
                </code>
                <code>Host: dining.example</code>
              </div>
              <div>
                <span>Response</span>
                <code>
                  HTTP/1.1 {selected.status === 'success' ? '204 No Content' : selected.status === 'client-error' ? '404 Not Found' : selected.status === 'server-error' ? '500 Internal Server Error' : 'STATUS'}
                </code>
              </div>
            </>
          )}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      ),
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="http-crud-quick-check"
        steps={steps}
        moduleTitle={module.title}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
