import { CategoryChallenge } from '@/components/CategoryChallenge';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export default function ExampleModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();
  const steps: LearningFlowStep[] = [
    {
      id: 'commit',
      title: 'A choice matters when it reveals how a student is thinking',
      sectionLabel: 'Commit before the answer appears',
      autoComplete: true,
      render: () => (
        <>
          <p>
            Read a situation and make a choice. The explanation should appear after you commit, while you still
            remember the reason for your answer. This is a disposable template example rather than course content.
          </p>
          <div className="principle-grid">
            <div><span>01</span><h3>Think</h3><p>Give the learner a real choice before showing the rule.</p></div>
            <div><span>02</span><h3>Check</h3><p>Explain the consequence of the choice in plain language.</p></div>
            <div><span>03</span><h3>Try again</h3><p>Use a fresh case so the learner must rebuild the reasoning.</p></div>
          </div>
        </>
      ),
    },
    {
      id: 'classify',
      title: 'Make the learner’s rule visible',
      sectionLabel: 'Perform the distinction',
      render: ({ completeStep }) => (
        <CategoryChallenge
          title="Which action makes the student think?"
          introduction="Classify each study action. Focus on what the learner must produce before receiving feedback."
          categories={['Makes thinking visible', 'Mostly exposure']}
          storageKey="example-explanation-category"
          onComplete={completeStep}
          items={[
            {
              id: 'predict-run-explain',
              prompt: 'A student predicts the output of an algorithm, runs it, and explains the mismatch.',
              answer: 'Makes thinking visible',
              explanation: 'The student retrieves a model, tests it, and uses feedback to revise their understanding.',
            },
            {
              id: 'reread-only',
              prompt: 'A student re-reads the same highlighted paragraph three times without trying to recall it.',
              answer: 'Mostly exposure',
              explanation: 'Exposure can feel fluent, but this activity does not require the student to produce or apply the idea.',
            },
            {
              id: 'compare-solutions',
              prompt: 'A student compares two worked solutions and identifies the first step where they diverge.',
              answer: 'Makes thinking visible',
              explanation: 'Comparison makes the learner discriminate between approaches and articulate a consequential difference.',
            },
          ]}
        />
      ),
    },
    {
      id: 'transfer',
      title: 'Use the simplest tool that exposes the reasoning',
      sectionLabel: 'Transfer the rule',
      render: ({ completeStep }) => (
        <>
          <p>
            A button does not make a lesson active by itself. The useful moment is the learner’s prediction,
            comparison, or explanation. If a diagram communicates the idea more clearly, use the diagram.
          </p>
          <blockquote>
            Ask what the student must think about, then build the smallest interaction that makes that thinking visible.
          </blockquote>
          <KnowledgeCheck
            storageKey="example-explanation-transfer"
            onCorrect={completeStep}
            question="Which activity gives the instructor useful evidence about the learner's reasoning?"
            options={[
              {
                id: 'animate-headings',
                label: 'Animate every heading as it enters the screen.',
                feedback: "The animation changes the presentation, but it reveals nothing about the learner's reasoning.",
              },
              {
                id: 'predict-graph',
                label: 'Ask students to predict what one changed value will do before updating the graph.',
                correct: true,
                feedback: "The prediction records the learner's current rule. The graph then gives evidence they can use to revise it.",
              },
              {
                id: 'click-to-reveal',
                label: 'Hide each definition behind a card that opens when clicked.',
                feedback: 'Opening a card proves that the student clicked it. It does not show whether they can use the definition.',
              },
            ]}
          />
        </>
      ),
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="example-explanation-flow"
        steps={steps}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
