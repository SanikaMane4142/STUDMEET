
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define types for our student data
export interface CourseData {
  id: string;
  name: string;
  completed: boolean;
  attendedClasses: number;
  totalClasses: number;
  engagementScore: number;
  user_id?: string;
}

export interface ClassData {
  id: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  course_id?: string;
  user_id?: string;
}

export interface ActivityData {
  id: string;
  type: 'attendance' | 'quiz' | 'engagement';
  courseName: string;
  description: string;
  timestamp: string;
  score?: number;
  engagementRating?: string;
  user_id?: string;
}

// Mock data for development and testing
const mockCourses: CourseData[] = [
  {
    id: '1',
    name: 'Introduction to Computer Science',
    completed: false,
    attendedClasses: 8,
    totalClasses: 12,
    engagementScore: 85,
    user_id: 'mock-user'
  },
  {
    id: '2',
    name: 'Data Structures and Algorithms',
    completed: false,
    attendedClasses: 5,
    totalClasses: 10,
    engagementScore: 76,
    user_id: 'mock-user'
  },
  {
    id: '3',
    name: 'Web Development Fundamentals',
    completed: true,
    attendedClasses: 10,
    totalClasses: 10,
    engagementScore: 92,
    user_id: 'mock-user'
  },
  {
    id: '4',
    name: 'Machine Learning Basics',
    completed: false,
    attendedClasses: 3,
    totalClasses: 8,
    engagementScore: 65,
    user_id: 'mock-user'
  }
];

const mockClasses: ClassData[] = [
  {
    id: '1',
    courseName: 'Introduction to Computer Science',
    date: new Date().toISOString().split('T')[0], // Today
    startTime: '14:00',
    endTime: '15:30',
    attended: false,
    course_id: '1',
    user_id: 'mock-user'
  },
  {
    id: '2',
    courseName: 'Data Structures and Algorithms',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow
    startTime: '10:00',
    endTime: '11:30',
    attended: false,
    course_id: '2',
    user_id: 'mock-user'
  },
  {
    id: '3',
    courseName: 'Web Development Fundamentals',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // Day after tomorrow
    startTime: '13:00',
    endTime: '14:30',
    attended: false,
    course_id: '3',
    user_id: 'mock-user'
  }
];

const mockActivities: ActivityData[] = [
  {
    id: '1',
    type: 'attendance',
    courseName: 'Introduction to Computer Science',
    description: 'Attended class lecture',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 3)).toISOString(),
    user_id: 'mock-user'
  },
  {
    id: '2',
    type: 'quiz',
    courseName: 'Data Structures and Algorithms',
    description: 'Completed weekly assessment',
    score: 85,
    timestamp: new Date(new Date().setHours(new Date().getHours() - 24)).toISOString(),
    user_id: 'mock-user'
  },
  {
    id: '3',
    type: 'engagement',
    courseName: 'Web Development Fundamentals',
    description: 'Participated in group discussion',
    engagementRating: 'High',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 48)).toISOString(),
    user_id: 'mock-user'
  }
];

export function useStudentData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassData[]>([]);
  const [completedClasses, setCompletedClasses] = useState<number>(0);
  const [attendedClasses, setAttendedClasses] = useState<number>(0);
  const [averageEngagement, setAverageEngagement] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [useRealData, setUseRealData] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Function to fetch all student data
    const fetchStudentData = async () => {
      try {
        // Check if the tables exist in Supabase
        const { data: tablesData, error: tablesError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (tablesError) {
          console.log('Error checking tables:', tablesError);
          setUseRealData(false);
        } else {
          // We have at least profiles table, attempt to check for courses
          try {
            const { error: coursesCheckError } = await supabase
              .rpc('check_table_exists', { table_name: 'courses' });
            
            setUseRealData(!coursesCheckError);
          } catch {
            setUseRealData(false);
          }
        }

        if (useRealData) {
          // Attempt to fetch real data
          console.log('Attempting to fetch real data from Supabase');
          
          // This code would work if the tables exist in Supabase
          // For now, it's commented out as it causes TypeScript errors
          /*
          // Fetch courses
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .eq('user_id', user.id);

          if (coursesError) throw coursesError;

          // Fetch upcoming classes
          const today = new Date().toISOString().split('T')[0];
          const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('*, courses(name)')
            .eq('user_id', user.id)
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(3);

          if (classesError) throw classesError;

          // Fetch recent activities
          const { data: activitiesData, error: activitiesError } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false })
            .limit(3);

          if (activitiesError) throw activitiesError;

          // Process data
          if (coursesData) {
            setCourses(coursesData);
            
            // Calculate metrics
            const totalAttended = coursesData.reduce((sum, course) => sum + course.attendedClasses, 0);
            const avgEngagement = coursesData.reduce((sum, course) => sum + course.engagementScore, 0) / coursesData.length || 0;
            const completedCoursesCount = coursesData.filter(course => course.completed).length;
            
            setCompletedClasses(completedCoursesCount);
            setAttendedClasses(totalAttended);
            setAverageEngagement(Math.round(avgEngagement));
          }

          if (classesData) {
            // Format the class data
            const formattedClasses = classesData.map(cls => ({
              id: cls.id,
              courseName: cls.courses?.name || 'Unknown Course',
              date: cls.date,
              startTime: cls.start_time,
              endTime: cls.end_time,
              attended: cls.attended
            }));
            
            setUpcomingClasses(formattedClasses);
          }

          if (activitiesData) {
            setRecentActivities(activitiesData);
          }
          */
        } else {
          // Use mock data
          console.log('Using mock data for student dashboard');
          
          // Set user ID to mock data
          const userMockCourses = mockCourses.map(course => ({
            ...course,
            user_id: user.id
          }));
          
          const userMockClasses = mockClasses.map(cls => ({
            ...cls,
            user_id: user.id
          }));
          
          const userMockActivities = mockActivities.map(activity => ({
            ...activity,
            user_id: user.id
          }));
          
          // Set the state with mock data
          setCourses(userMockCourses);
          setUpcomingClasses(userMockClasses);
          setRecentActivities(userMockActivities);
          
          // Calculate metrics from mock data
          const totalAttended = userMockCourses.reduce((sum, course) => sum + course.attendedClasses, 0);
          const avgEngagement = userMockCourses.reduce((sum, course) => sum + course.engagementScore, 0) / userMockCourses.length;
          const completedCoursesCount = userMockCourses.filter(course => course.completed).length;
          
          setCompletedClasses(completedCoursesCount);
          setAttendedClasses(totalAttended);
          setAverageEngagement(Math.round(avgEngagement));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching student data:', error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load your student data.",
        });
        
        // Fall back to mock data on error
        setCourses(mockCourses);
        setUpcomingClasses(mockClasses);
        setRecentActivities(mockActivities);
        
        // Calculate metrics from mock data
        const totalAttended = mockCourses.reduce((sum, course) => sum + course.attendedClasses, 0);
        const avgEngagement = mockCourses.reduce((sum, course) => sum + course.engagementScore, 0) / mockCourses.length;
        const completedCoursesCount = mockCourses.filter(course => course.completed).length;
        
        setCompletedClasses(completedCoursesCount);
        setAttendedClasses(totalAttended);
        setAverageEngagement(Math.round(avgEngagement));
        
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStudentData();
    
    // Skip real-time subscriptions for now since we're using mock data
    
  }, [user, toast]);

  return {
    courses,
    upcomingClasses,
    completedClasses,
    attendedClasses,
    averageEngagement,
    recentActivities,
    loading
  };
}
