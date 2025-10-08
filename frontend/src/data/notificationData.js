// In a real app, this would come from a database.
export const studentNotifications = [
  {
    id: 'sn1',
    type: 'grade', // 'grade', 'assignment', 'announcement'
    title: 'New Grade Posted',
    message: 'Your Mathematics Quiz has been graded. You scored 95%!',
    link: '/results/1',
    read: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sn2',
    type: 'assignment',
    title: 'New Assignment Assigned',
    message: 'A new assignment, "The Solar System," has been posted for your Science course.',
    link: '/lesson/2',
    read: false,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  {
    id: 'sn3',
    type: 'announcement',
    title: 'School Holiday Announcement',
    message: 'Please note that the school will be closed tomorrow for a national holiday.',
    link: '#',
    read: true,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
    {
    id: 'sn4',
    type: 'grade',
    title: 'New Grade Posted',
    message: 'Your English essay "My Hero" has been graded. Great work!',
    link: '/results/3',
    read: true,
    timestamp: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
  },
];