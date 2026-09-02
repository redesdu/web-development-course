import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { RouteExplorer } from './examples/RouteExplorer';

export default function ExampleRouteModule({ module }: ModulePageProps) {
  return (
    <LearningModuleLayout module={module}>
      <section>
        <p className="eyebrow">Look past the first turn</p>
        <h2>A good first step can still lead to a long route</h2>
        <p>
          People often choose the road that looks shortest near the start. A route problem asks a different question.
          Add the whole journey before deciding.
        </p>
      </section>

      <RouteExplorer />

      <section>
        <p className="eyebrow">The useful mistake</p>
        <h2>Local choices and complete paths are not the same thing</h2>
        <p>
          The park sits close to home, which makes that route tempting. The remaining road is long. The map lets a
          learner make that mistake safely, see the full distance, and revise the rule they used.
        </p>
      </section>

      <KnowledgeCheck
        question="Route A has sections of 2 km and 6 km. Route B has sections of 4 km and 3 km. Which route is shorter?"
        options={[
          {
            id: 'route-a',
            label: 'Route A, because its first section is shorter.',
            feedback: 'The first section is only part of the trip. Route A covers 8 km in total.',
          },
          {
            id: 'route-b',
            label: 'Route B, because its complete distance is 7 km.',
            correct: true,
            feedback: 'Route B begins with the longer section but finishes after 7 km, one kilometre before Route A.',
          },
          {
            id: 'equal-sections',
            label: 'They are equal because both have two sections.',
            feedback: 'The number of sections does not determine distance. Add the lengths inside each route.',
          },
        ]}
      />
    </LearningModuleLayout>
  );
}
