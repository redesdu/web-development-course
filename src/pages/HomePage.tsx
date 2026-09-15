import { ArrowRight, BookOpenCheck, Clock3, Layers3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseJourney } from '@/components/CourseJourney';
import { COURSE } from '@/course/course.config';
import { COURSE_MODULES } from '@/course/modules';
import { useCourseProgress } from '@/hooks/useCourseProgress';

export default function HomePage() {
  const { completedSlugs } = useCourseProgress();
  const completed = COURSE_MODULES.filter((module) => completedSlugs.includes(module.slug)).length;
  const percentage = COURSE_MODULES.length === 0 ? 0 : Math.round((completed / COURSE_MODULES.length) * 100);

  return (
    <div className="home-page">
      <section className="home-intro">
        <div className="home-intro-copy">
          <p className="eyebrow"><Sparkles size={16} /> Interactive course companion</p>
          <h1>{COURSE.title}</h1>
          <p className="home-lead">{COURSE.description}</p>
          <div className="hero-actions">
            {COURSE_MODULES[0] && (
              <Link className="button button-primary" to={`/modules/${COURSE_MODULES[0].slug}`}>
                Start learning <ArrowRight size={16} />
              </Link>
            )}
            <a
              className="button button-secondary"
              href="#modules"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById('modules')?.scrollIntoView();
              }}
            >
              Browse modules
            </a>
          </div>
        </div>
        <aside className="home-progress-card" aria-label="Course progress">
          <div className="home-progress-top"><span>{COURSE.code}</span><span>{COURSE.term}</span></div>
          <div className="home-progress-value"><strong>{percentage}%</strong><span>Your progress</span></div>
          <div className="home-progress-track"><span style={{ width: `${percentage}%` }} /></div>
          <p>{completed} of {COURSE_MODULES.length} modules completed</p>
          <div className="home-progress-stats">
            <span><Layers3 size={15} /> {COURSE_MODULES.length} modules</span>
            <span><Clock3 size={15} /> {COURSE_MODULES.reduce((sum, item) => sum + item.estimatedMinutes, 0)} min</span>
            <span><BookOpenCheck size={15} /> Ungraded</span>
          </div>
        </aside>
      </section>

      <section className="module-catalog journey-section" id="modules">
        <div className="section-heading">
          <div><p className="eyebrow">Your course journey</p><h2>Follow the path</h2></div>
          <p>Lessons build the idea. Exercises give you another case to solve.</p>
        </div>
        <CourseJourney modules={COURSE_MODULES} completedSlugs={completedSlugs} />
      </section>
    </div>
  );
}
