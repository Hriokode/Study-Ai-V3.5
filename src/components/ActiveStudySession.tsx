import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, RotateCcw, Clock, Coffee, Brain, Target, Volume2, VolumeX } from "lucide-react";
import { StudySessionTemplate } from "./StudySessionSelector";
import { useAppContext } from "@/contexts/AppContext";
import { toast } from "sonner";

interface ActiveStudySessionProps {
  template: StudySessionTemplate;
  studyTopic?: string;
  onBack: () => void;
  onComplete: () => void;
}

const ActiveStudySession = ({ template, studyTopic, onBack, onComplete }: ActiveStudySessionProps) => {
  const { 
    activeSessionType, 
    timeRemaining, 
    isSessionActive, 
    sessionPhase,
    sessionsCompletedToday,
    startStudySession,
    pauseStudySession,
    resumeStudySession,
    resetStudySession,
    completeStudySession
  } = useAppContext();

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize session when component mounts
  useEffect(() => {
    if (!activeSessionType) {
      startStudySession(template, studyTopic);
    }
  }, []);

  // Handle session completion
  useEffect(() => {
    if (timeRemaining === 0 && isSessionActive) {
      handlePhaseComplete();
    }
  }, [timeRemaining, isSessionActive]);

  const handlePhaseComplete = () => {
    if (soundEnabled) {
      playNotificationSound();
    }

    if (template.phases && currentPhaseIndex < template.phases.length - 1) {
      // Move to next phase
      const nextPhaseIndex = currentPhaseIndex + 1;
      const nextPhase = template.phases[nextPhaseIndex];
      
      setCurrentPhaseIndex(nextPhaseIndex);
      toast.success(`${template.phases[currentPhaseIndex].name} complete! Starting ${nextPhase.name}`);
      
      // Auto-start next phase after a brief pause
      setTimeout(() => {
        startStudySession({
          ...template,
          duration: nextPhase.duration
        }, studyTopic);
      }, 2000);
    } else {
      // Session complete
      completeStudySession();
      toast.success("🎉 Study session completed! Great work!");
      onComplete();
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!template.phases) {
      const totalDuration = template.duration * 60;
      return ((totalDuration - (timeRemaining || 0)) / totalDuration) * 100;
    }
    
    const currentPhase = template.phases[currentPhaseIndex];
    const phaseDuration = currentPhase.duration * 60;
    return ((phaseDuration - (timeRemaining || 0)) / phaseDuration) * 100;
  };

  const getCurrentPhase = () => {
    if (!template.phases) return null;
    return template.phases[currentPhaseIndex];
  };

  const getPhaseColor = (phaseType: string) => {
    switch (phaseType) {
      case 'focus':
        return 'from-blue-500 to-purple-600';
      case 'shortBreak':
        return 'from-green-500 to-emerald-600';
      case 'longBreak':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const currentPhase = getCurrentPhase();
  const IconComponent = template.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Dynamic Background based on session phase */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br ${currentPhase ? getPhaseColor(currentPhase.type) : template.color}/20 rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br ${currentPhase ? getPhaseColor(currentPhase.type) : template.color}/20 rounded-full blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="glass-card p-6 animate-fadeInUp">
            <div className="flex items-center justify-between">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Sound
                </Button>
              </div>
            </div>
          </Card>

          {/* Main Timer Display */}
          <Card className="glass-card p-8 md:p-12 text-center animate-fadeInScale">
            <div className="space-y-8">
              {/* Session Info */}
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${currentPhase ? getPhaseColor(currentPhase.type) : template.color} shadow-xl pulse-glow`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                    {currentPhase ? `${template.title} - ${currentPhase.name}` : template.title}
                  </h1>
                </div>
                
                <p className="text-xl text-gray-600 mb-2">
                  {currentPhase 
                    ? `${currentPhase.type === 'focus' ? 'Stay focused with' : 'Take a break with'} the proven ${template.title.toLowerCase()} technique`
                    : `Stay focused with the proven ${template.title.toLowerCase()} technique`
                  }
                </p>
                
                {studyTopic && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-4 py-2">
                    Studying: {studyTopic}
                  </Badge>
                )}
              </div>

              {/* Phase Buttons (for multi-phase sessions) */}
              {template.phases && (
                <div className="flex justify-center gap-2 flex-wrap">
                  {template.phases.map((phase, index) => (
                    <Button
                      key={index}
                      variant={index === currentPhaseIndex ? "default" : "outline"}
                      size="sm"
                      className={index === currentPhaseIndex ? `bg-gradient-to-r ${getPhaseColor(phase.type)} text-white` : ""}
                      disabled
                    >
                      {phase.name}
                    </Button>
                  ))}
                </div>
              )}

              {/* Timer Display */}
              <div className="space-y-6">
                <div className="text-8xl md:text-9xl font-bold text-gray-800 font-mono tracking-wider">
                  {formatTime(timeRemaining || 0)}
                </div>
                
                <div className="text-lg text-gray-600">
                  {currentPhase ? currentPhase.name : 'Focus Time'}
                </div>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <Progress 
                    value={getProgressPercentage()} 
                    className="h-4 bg-gray-200 rounded-full overflow-hidden"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Progress</span>
                    <span>{Math.round(getProgressPercentage())}%</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={isSessionActive ? pauseStudySession : resumeStudySession}
                  className={`bg-gradient-to-r ${currentPhase ? getPhaseColor(currentPhase.type) : template.color} hover:shadow-lg text-white px-8 py-4 text-lg font-semibold`}
                >
                  {isSessionActive ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      {timeRemaining === (template.duration * 60) ? 'Start' : 'Resume'}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetStudySession}
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold border-2"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Session Stats */}
              <div className="text-center">
                <p className="text-gray-600">
                  Sessions completed today: <span className="font-bold text-blue-600">{sessionsCompletedToday}</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Study Tips */}
          <Card className="glass-card p-6 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Study Tips for Maximum Focus
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>

            {/* Additional Focus Tips */}
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Pro Focus Tips
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Put your phone in another room or use airplane mode</li>
                <li>• Close all unnecessary browser tabs and applications</li>
                <li>• Have water and healthy snacks nearby</li>
                <li>• Use noise-canceling headphones or white noise</li>
                <li>• Set a specific goal for this study session</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActiveStudySession;