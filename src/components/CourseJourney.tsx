import { BookOpen, Check, Clock3, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CourseLecture, LearningModule } from '@/course/types';

interface CourseJourneyProps {
  modules: LearningModule[];
  completedSlugs: string[];
}

interface LectureGroup extends CourseLecture {
  modules: LearningModule[];
}

export function groupModulesByLecture(modules: LearningModule[]): LectureGroup[] {
  const groups = new Map<string, LectureGroup>();

  for (const module of modules) {
    const current = groups.get(module.lecture.id);
    if (current) {
      current.modules.push(module);
      continue;
    }

    groups.set(module.lecture.id, { ...module.lecture, modules: [module] });
  }

  return [...groups.values()];
}

function JourneyItem({ module, complete }: { module: LearningModule; complete: boolean }) {
  const itemLabel = module.kind === 'practice' ? 'Exercise' : 'Lesson';

  return (
    <li className="lecture-path-item">
      <Link className="lecture-path-link" to={`/modules/${module.slug}`}>
        <span className={`lecture-path-node ${complete ? 'is-complete' : ''}`}>
          {complete ? <Check size={22} strokeWidth={3} /> : module.displayNumber}
        </span>
        <span className="lecture-path-copy">
          <small>{complete ? `${itemLabel} completed` : itemLabel}</small>
          <strong>{module.title}</strong>
          <span>{module.summary}</span>
          <span className="lecture-path-time"><Clock3 size={13} /> {module.estimatedMinutes} min</span>
        </span>
      </Link>
    </li>
  );
}

export function CourseJourney({ modules, completedSlugs }: CourseJourneyProps) {
  if (modules.length === 0) {
    return <p className="journey-empty">No modules are ready yet.</p>;
  }

  return (
    <div className="lecture-groups">
      {groupModulesByLecture(modules).map((lecture) => {
        const lessons = lecture.modules.filter((module) => module.kind !== 'practice');
        const exercises = lecture.modules.filter((module) => module.kind === 'practice');
        const minutes = lecture.modules.reduce((total, module) => total + module.estimatedMinutes, 0);

        return (
          <section className="lecture-group" key={lecture.id} aria-labelledby={`${lecture.id}-title`}>
            <header className="lecture-group-header">
              <div>
                <p className="eyebrow"><BookOpen size={15} /> Lecture {lecture.number}</p>
                <h3 id={`${lecture.id}-title`}>{lecture.title}</h3>
              </div>
              <span>{lecture.modules.length} parts · {minutes} min</span>
            </header>

            <div className="lecture-group-content">
              <div className="lecture-lessons">
                <p className="lecture-subheading">Lesson</p>
                <ol className="lecture-path-list">
                  {lessons.map((module) => (
                    <JourneyItem
                      key={module.slug}
                      module={module}
                      complete={completedSlugs.includes(module.slug)}
                    />
                  ))}
                </ol>
              </div>

              {exercises.length > 0 && (
                <section className="lecture-exercises" aria-labelledby={`${lecture.id}-exercises-title`}>
                  <header className="lecture-exercises-header">
                    <FolderOpen size={20} aria-hidden="true" />
                    <div>
                      <p>Exercises</p>
                      <h4 id={`${lecture.id}-exercises-title`}>Exercises about Lecture {lecture.number}</h4>
                    </div>
                  </header>
                  <ol className="lecture-path-list">
                    {exercises.map((module) => (
                      <JourneyItem
                        key={module.slug}
                        module={module}
                        complete={completedSlugs.includes(module.slug)}
                      />
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
