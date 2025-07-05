
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Video, Users, BarChart3, CheckCircle } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero-section py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 animate-fade-in">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Next Generation Virtual Classroom
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Transform Online Learning With StudMeet
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Connect teachers and students through immersive video conferencing enhanced with
                  real-time engagement analytics and personalized learning experiences.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="mx-auto relative rounded-xl overflow-hidden shadow-xl animate-fade-in">
                <div className="glass-card p-4 aspect-video relative">
                  <div className="absolute inset-0 animated-gradient opacity-10"></div>
                  <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-6">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="rounded-lg bg-gray-900 aspect-video relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/10 to-purple-800/10"></div>
                        <div className="absolute bottom-2 left-2 bg-gray-900/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-md">
                          Teacher
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-900 aspect-video relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/10 to-purple-800/10"></div>
                        <div className="absolute bottom-2 left-2 bg-gray-900/70 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-md">
                          Student
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-gray-700" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-gray-700" />
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Powerful Features</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Everything you need for effective virtual classrooms and student engagement tracking
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
              <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">HD Video Conferencing</h3>
                <p className="text-gray-500">
                  Crystal clear video and audio for seamless communication between teachers and students.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Engagement Analytics</h3>
                <p className="text-gray-500">
                  AI-powered emotion detection to measure student engagement and attentiveness.
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Interactive Learning</h3>
                <p className="text-gray-500">
                  Customized activities based on engagement levels to maximize learning effectiveness.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudMeet
              </span>
              <p className="text-sm text-gray-500 mt-1">© 2023 StudMeet. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
