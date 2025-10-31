import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Videos = () => {
  const videos = [
    {
      id: 'gEy3uqfJLGQ',
      title: 'Perfect Squat Form',
      description: 'Learn the proper technique for performing squats safely and effectively',
      category: 'Legs',
      duration: '8:42',
    },
    {
      id: '_JBiKuz3BYA',
      title: 'Bench Press Tutorial',
      description: 'Master the bench press with proper form and progression tips',
      category: 'Chest',
      duration: '12:15',
    },
    {
      id: 'IODxDxX7oi4',
      title: 'Deadlift Mastery',
      description: 'Complete guide to deadlifts - form, variations, and common mistakes',
      category: 'Back',
      duration: '10:30',
    },
    {
      id: 'n_OdXKfSp-Y',
      title: 'Pull-ups and Chin-ups',
      description: 'Build a stronger back with proper pull-up technique',
      category: 'Back',
      duration: '6:20',
    },
    {
      id: 'UwRLWMcOdwI',
      title: 'Core Workout Routine',
      description: 'Effective exercises for building a strong core',
      category: 'Core',
      duration: '15:00',
    },
    {
      id: 'qSt6LG89RWk',
      title: 'Shoulder Press Form',
      description: 'Overhead press technique for building strong shoulders',
      category: 'Shoulders',
      duration: '9:45',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
          <Video className="h-10 w-10 text-primary" />
          <span>Exercise Video Library</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Professional tutorials to help you master proper exercise form
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="glass hover:shadow-glow transition-smooth group overflow-hidden">
            <div className="relative aspect-video bg-black overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${video.id}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/80">
                  {video.duration}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight">{video.title}</CardTitle>
                <Badge className="gradient-primary text-white shrink-0">
                  {video.category}
                </Badge>
              </div>
              <CardDescription>{video.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="glass mt-12">
        <CardHeader>
          <CardTitle>Tips for Following Video Tutorials</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Watch the full video before attempting the exercise</li>
            <li>• Start with lighter weights to master form</li>
            <li>• Pause and rewatch sections if needed</li>
            <li>• Focus on controlled movements, not speed</li>
            <li>• Use a mirror to check your form</li>
            <li>• Consult the AI Coach if you have questions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Videos;