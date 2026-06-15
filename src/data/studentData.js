export const studentSummary = [
  {
    label: 'Active Courses',
    value: '4',
    hint: 'Across design, web, AI, and databases',
  },
  {
    label: 'Average Progress',
    value: '78%',
    hint: 'Steady improvement this week',
  },
  {
    label: 'Attendance Rate',
    value: '92%',
    hint: 'Above the class target',
  },
  {
    label: 'Pending Tasks',
    value: '5',
    hint: 'Two are due this week',
  },
]

export const studentCourses = [
  {
    id: 'frontend-engineering',
    code: 'CS 341',
    title: 'Frontend Engineering Studio',
    instructor: 'Dr. Salma Nabil',
    progress: 82,
    schedule: 'Sun and Tue, 10:00 AM',
    nextLesson: 'Responsive dashboards and routing patterns',
    dueDate: 'Prototype review on April 28',
    status: 'On track',
    lessons: 24,
    completedLessons: 19,
    description:
      'Build modern web interfaces with reusable components, routing, responsive layouts, and polished user experience patterns.',
    modules: [
      'Project setup and component architecture',
      'Routing and guarded navigation',
      'Responsive dashboard composition',
      'UI refinement and accessibility',
    ],
    resources: ['Design brief PDF', 'Weekly lab recordings', 'Starter wireframe board'],
    tasks: ['Finish routing assignment', 'Refine dashboard hero section', 'Submit card component review'],
  },
  {
    id: 'database-systems',
    code: 'CS 322',
    title: 'Database Systems',
    instructor: 'Dr. Omar Khaled',
    progress: 74,
    schedule: 'Mon and Wed, 12:30 PM',
    nextLesson: 'Normalization and transaction control',
    dueDate: 'Quiz opens on April 30',
    status: 'Needs focus',
    lessons: 20,
    completedLessons: 15,
    description:
      'Understand relational modeling, normalization, transactions, indexing, and the principles behind reliable data systems.',
    modules: [
      'Entity relationship modeling',
      'SQL querying and joins',
      'Normalization and integrity',
      'Transactions and concurrency',
    ],
    resources: ['SQL practice sheet', 'Lecture notes', 'Normalization cheat sheet'],
    tasks: ['Practice advanced joins', 'Review lecture 7', 'Prepare for in-class quiz'],
  },
  {
    id: 'artificial-intelligence',
    code: 'AI 305',
    title: 'Artificial Intelligence Basics',
    instructor: 'Dr. Mariam Adel',
    progress: 69,
    schedule: 'Tue and Thu, 2:00 PM',
    nextLesson: 'Search algorithms and heuristics',
    dueDate: 'Reflection post on May 2',
    status: 'In progress',
    lessons: 18,
    completedLessons: 12,
    description:
      'Explore intelligent agents, search strategies, knowledge representation, and the practical foundations of AI systems.',
    modules: [
      'Intelligent agents',
      'Problem solving with search',
      'Heuristic design',
      'Knowledge representation',
    ],
    resources: ['Problem set archive', 'Recommended readings', 'Office hours board'],
    tasks: ['Solve search algorithm exercise', 'Post discussion reflection'],
  },
  {
    id: 'ux-research',
    code: 'DS 210',
    title: 'UX Research and Testing',
    instructor: 'Dr. Laila Tarek',
    progress: 88,
    schedule: 'Thu, 9:00 AM',
    nextLesson: 'Usability testing reports',
    dueDate: 'Interview synthesis due May 4',
    status: 'Excellent',
    lessons: 16,
    completedLessons: 14,
    description:
      'Learn how to research user needs, test interfaces, analyze findings, and transform insights into design decisions.',
    modules: [
      'Research planning',
      'Interview methods',
      'Usability testing',
      'Insight reporting',
    ],
    resources: ['Interview script template', 'Usability checklist', 'Research report sample'],
    tasks: ['Submit interview notes', 'Prepare usability script'],
  },
]

export const dashboardSchedule = [
  {
    time: '09:00 AM',
    title: 'UX Research standup',
    note: 'Room D4',
  },
  {
    time: '12:30 PM',
    title: 'Database Systems lecture',
    note: 'Lab 2',
  },
  {
    time: '02:00 PM',
    title: 'AI tutorial session',
    note: 'Problem solving workshop',
  },
]

export const announcements = [
  {
    id: 'ann-01',
    category: 'Course update',
    title: 'Frontend Engineering prototype review moved to Tuesday',
    content:
      'The prototype review will now happen on Tuesday instead of Monday. Please upload your latest dashboard screens before 8:00 PM.',
    author: 'Dr. Salma Nabil',
    date: 'April 24, 2026',
  },
  {
    id: 'ann-02',
    category: 'Reminder',
    title: 'Database quiz revision sheet is available',
    content:
      'The revision sheet now covers joins, normalization, and constraints. Use it before the quiz window opens next week.',
    author: 'Dr. Omar Khaled',
    date: 'April 23, 2026',
  },
  {
    id: 'ann-03',
    category: 'Workshop',
    title: 'Optional AI search workshop this Saturday',
    content:
      'There will be a practice workshop focused on breadth-first, depth-first, and heuristic search problems for interested students.',
    author: 'Dr. Mariam Adel',
    date: 'April 22, 2026',
  },
]

export const notificationFeed = [
  {
    id: 'note-01',
    type: 'Unread',
    title: 'New comment on your routing assignment',
    description: 'Dr. Salma left feedback on your dashboard navigation structure.',
    time: '5 min ago',
  },
  {
    id: 'note-02',
    type: 'Upcoming',
    title: 'Database quiz opens in 6 days',
    description: 'Review normalization and joins before the assessment window starts.',
    time: '1 hour ago',
  },
  {
    id: 'note-03',
    type: 'System',
    title: 'Profile completion at 80%',
    description: 'Add your phone number and short bio to keep your account details complete.',
    time: 'Today',
  },
  {
    id: 'note-04',
    type: 'Read',
    title: 'Attendance updated for AI tutorial',
    description: 'Your attendance record was refreshed after the tutorial session.',
    time: 'Yesterday',
  },
]

export const attendanceSummary = [
  {
    label: 'Present',
    value: '23',
    tone: 'success',
  },
  {
    label: 'Late',
    value: '2',
    tone: 'warning',
  },
  {
    label: 'Absent',
    value: '1',
    tone: 'danger',
  },
]

export const attendanceRecords = [
  {
    course: 'Frontend Engineering Studio',
    session: 'April 23, 2026',
    status: 'Present',
    note: 'On time',
  },
  {
    course: 'Database Systems',
    session: 'April 22, 2026',
    status: 'Late',
    note: 'Arrived 10 minutes after start',
  },
  {
    course: 'Artificial Intelligence Basics',
    session: 'April 21, 2026',
    status: 'Present',
    note: 'Participated in workshop',
  },
  {
    course: 'UX Research and Testing',
    session: 'April 17, 2026',
    status: 'Absent',
    note: 'Excused after advisor notice',
  },
]

export const attendanceBreakdown = [
  { label: 'Week 1', value: 100 },
  { label: 'Week 2', value: 100 },
  { label: 'Week 3', value: 75 },
  { label: 'Week 4', value: 100 },
  { label: 'Week 5', value: 90 },
]

export const learnBotStarterMessages = [
  {
    id: 'bot-1',
    sender: 'assistant',
    text: 'Hello! I am LearnBot. I can help you recap lessons, plan your study week, or suggest what to review next.',
  },
  {
    id: 'bot-2',
    sender: 'assistant',
    text: 'Try asking about your courses, deadlines, attendance, or how to prepare for your next class.',
  },
]

export const learnBotSuggestions = [
  'What should I study this week?',
  'Summarize my Frontend Engineering course progress.',
  'How can I improve my attendance habits?',
]
