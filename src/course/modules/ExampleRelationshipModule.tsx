import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { PriceExplorer } from './examples/PriceExplorer';

export default function ExampleRelationshipModule({ module }: ModulePageProps) {
  return (
    <LearningModuleLayout module={module}>
      <section>
        <p className="eyebrow">Start with the receipt</p>
        <h2>Some costs are already there. Others grow with time.</h2>
        <p>
          A bicycle hire begins with a starting fee. Riding for longer adds the hourly price again and again.
          Keep those two parts separate and the graph becomes easier to read.
        </p>
      </section>

      <PriceExplorer />

      <section>
        <p className="eyebrow">Name the two jobs</p>
        <h2>The starting value sets the height. The rate sets the tilt.</h2>
        <p>
          Move one slider at a time. Watch what stays fixed. This simple habit helps students connect a formula,
          a graph, and a familiar situation without asking them to memorize three separate rules.
        </p>
      </section>

      <KnowledgeCheck
        question="The starting fee rises while the hourly price stays fixed. What happens to the line?"
        options={[
          {
            id: 'moves-up',
            label: 'The line moves upward without changing its tilt.',
            correct: true,
            feedback: 'Every ride now costs the same extra amount. The difference between one hour and the next stays unchanged.',
          },
          {
            id: 'steeper',
            label: 'The line becomes steeper.',
            feedback: 'A steeper line means the price per hour changed. Here only the starting fee changed.',
          },
          {
            id: 'final-point',
            label: 'Only the final point moves.',
            feedback: 'The starting fee belongs to every possible ride length, so every point moves.',
          },
        ]}
      />
    </LearningModuleLayout>
  );
}
