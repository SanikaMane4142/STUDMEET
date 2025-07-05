
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudentData } from '@/hooks/useStudentData';
import { Video, Activity, BarChart3, BookOpen, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StudentDashboard: React.FC = () => {
  const { 
    courses, 
    upcomingClasses, 
    completedClasses, 
    attendedClasses, 
    averageEngagement, 
    recentActivities,
    loading
  } = useStudentData();

  if (loading) {
    return <div className="flex justify-center items-center py-10">Loading student data...</div>;
  }

  // Format date for display
  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'quiz':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'engagement':
        return <BarChart3 className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendedClasses}</div>
            <p className="text-xs text-muted-foreground">Total attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEngagement}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>Your scheduled learning sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center space-x-4">
                  <div className={`bg-${classItem.date === today ? 'blue' : 'purple'}-100 text-${classItem.date === today ? 'blue' : 'purple'}-800 p-3 rounded-lg`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{classItem.courseName}</h4>
                    <p className="text-xs text-gray-500">
                      {classItem.date === today ? 'Today' : 
                        classItem.date === new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] ? 'Tomorrow' : 
                        classItem.date}, {classItem.startTime} - {classItem.endTime}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={classItem.date !== today}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest classroom interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.courseName}</span>
                      <span className="text-gray-500"> - {activity.description}</span>
                    </p>
                    <p className="text-xs text-gray-500">{formatActivityTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Engagement Metrics</CardTitle>
          <CardDescription>How focused you've been in recent classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{course.name}</div>
                  <div className={`text-sm font-medium ${
                    course.engagementScore >= 80 ? 'text-green-600' : 
                    course.engagementScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {course.engagementScore}%
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      course.engagementScore >= 80 ? 'bg-green-500' : 
                      course.engagementScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    } rounded-full`} 
                    style={{ width: `${course.engagementScore}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default StudentDashboard;
