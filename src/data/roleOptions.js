export const roleOptions = [
  {
    id: 'admin',
    label: 'Admin',
    eyebrow: 'Platform control',
    description:
      'Oversee platform settings, users, analytics, and academic operations from one central workspace.',
    features: ['Manage users and access', 'Review system activity', 'Monitor platform health'],
  },
  {
    id: 'instructor',
    label: 'Faculty Member',
    eyebrow: 'Teaching workspace',
    description:
      'Organize courses, communicate with students, post announcements, and manage class progress.',
    features: ['Publish course content', 'Track student progress', 'Share updates quickly'],
  },
  {
    id: 'student',
    label: 'Student',
    eyebrow: 'Learning hub',
    description:
      'Follow courses, catch announcements, monitor attendance, and ask LearnBot for help inside a focused dashboard.',
    features: ['View enrolled courses', 'Check deadlines and alerts', 'Learn with a guided dashboard'],
  },
]

export const roleContent = {
  admin: {
    heading: 'Shape the platform with clarity',
    body:
      'Admin authentication is ready now, while the dedicated admin dashboard can be added next without changing this foundation.',
  },
  instructor: {
    heading: 'Prepare a polished teaching flow',
    body:
      'Faculty Member access is available through the same auth system, so we can expand faculty tools on top of the same reusable structure.',
  },
  student: {
    heading: 'Stay on top of every learning milestone',
    body:
      'The student experience is fully designed first, with focused pages for courses, attendance, announcements, notifications, and LearnBot.',
  },
}
