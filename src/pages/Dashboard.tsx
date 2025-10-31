import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scan, Brain, Video, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'OCR Scan',
      description: 'Upload images to extract text from nutrition labels, workout plans, or exercise notes',
      icon: Scan,
      href: '/ocr',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'AI Coach',
      description: 'Get personalized workout suggestions and form feedback from our AI coach',
      icon: Brain,
      href: '/ai',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Video Library',
      description: 'Watch professional exercise tutorials and learn proper form',
      icon: Video,
      href: '/videos',
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.full_name || 'Athlete'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to crush your fitness goals today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} to={feature.href}>
              <Card className="glass hover:shadow-glow transition-smooth cursor-pointer h-full group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full">
                    Get Started →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Quick Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">OCR Scans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">AI Consultations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Videos Watched</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;