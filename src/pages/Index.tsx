import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  name: string;
  email: string;
}

interface MoodEntry {
  id: string;
  date: string;
  emotion: string;
  stress: number;
  note: string;
}

interface TestResult {
  id: string;
  date: string;
  testName: string;
  score: number;
  level: string;
  recommendations: string[];
}

interface Technique {
  id: string;
  title: string;
  category: string;
  description: string;
  instructions: string[];
}

const emotions = [
  { value: 'happy', label: '😊 Радость', color: 'bg-yellow-200' },
  { value: 'calm', label: '😌 Спокойствие', color: 'bg-green-200' },
  { value: 'sad', label: '😔 Грусть', color: 'bg-blue-200' },
  { value: 'anxious', label: '😰 Тревога', color: 'bg-orange-200' },
  { value: 'angry', label: '😠 Гнев', color: 'bg-red-200' },
  { value: 'tired', label: '😴 Усталость', color: 'bg-purple-200' },
];

const tests = [
  {
    id: 'anxiety',
    name: 'Тест на тревожность',
    questions: [
      'Я часто ощущаю внутреннее напряжение',
      'Меня беспокоят мысли о будущем',
      'Мне трудно расслабиться',
      'Я быстро устаю',
      'У меня бывает учащенное сердцебиение',
    ],
  },
  {
    id: 'stress',
    name: 'Тест на уровень стресса',
    questions: [
      'Я чувствую себя перегруженным делами',
      'У меня проблемы со сном',
      'Я раздражаюсь по мелочам',
      'Мне сложно концентрироваться',
      'Я избегаю общения с людьми',
    ],
  },
  {
    id: 'burnout',
    name: 'Тест на выгорание',
    questions: [
      'Я чувствую эмоциональное истощение',
      'Работа перестала приносить удовольствие',
      'Я циничен по отношению к своим обязанностям',
      'У меня снизилась продуктивность',
      'Я чувствую себя опустошенным',
    ],
  },
];

const techniques: Technique[] = [
  {
    id: '1',
    title: 'Дыхание 4-7-8',
    category: 'Дыхательные практики',
    description: 'Техника глубокого дыхания для быстрого успокоения',
    instructions: [
      'Вдохните через нос на 4 счета',
      'Задержите дыхание на 7 счетов',
      'Выдохните через рот на 8 счетов',
      'Повторите 4 раза',
    ],
  },
  {
    id: '2',
    title: 'Прогрессивная мышечная релаксация',
    category: 'Релаксация',
    description: 'Снятие физического напряжения через последовательное расслабление мышц',
    instructions: [
      'Сядьте или лягте в удобной позе',
      'Напрягите мышцы стоп на 5 секунд, затем расслабьте',
      'Двигайтесь вверх по телу: икры, бедра, живот',
      'Продолжайте с руками, плечами, шеей и лицом',
      'Почувствуйте разницу между напряжением и расслаблением',
    ],
  },
  {
    id: '3',
    title: 'Заземление 5-4-3-2-1',
    category: 'Осознанность',
    description: 'Техника для возвращения в настоящий момент',
    instructions: [
      'Назовите 5 вещей, которые вы видите',
      'Назовите 4 вещи, которые вы можете потрогать',
      'Назовите 3 звука, которые вы слышите',
      'Назовите 2 запаха, которые вы чувствуете',
      'Назовите 1 вкус во рту',
    ],
  },
  {
    id: '4',
    title: 'Позитивные аффирмации',
    category: 'Когнитивные техники',
    description: 'Укрепление позитивного мышления',
    instructions: [
      'Выберите спокойное место',
      'Повторяйте: "Я достоин любви и уважения"',
      'Повторяйте: "Я справляюсь с трудностями"',
      'Повторяйте: "Я позволяю себе отдыхать"',
      'Произносите каждую фразу медленно и осознанно',
    ],
  },
];

function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [currentMood, setCurrentMood] = useState({ emotion: '', stress: 5, note: '' });
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const [favoriteTechniques, setFavoriteTechniques] = useState<string[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedMoods = localStorage.getItem('moodEntries');
    const savedTests = localStorage.getItem('testResults');
    const savedFavorites = localStorage.getItem('favoriteTechniques');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedMoods) setMoodEntries(JSON.parse(savedMoods));
    if (savedTests) setTestResults(JSON.parse(savedTests));
    if (savedFavorites) setFavoriteTechniques(JSON.parse(savedFavorites));
  }, []);

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    toast({
      title: '✨ Добро пожаловать!',
      description: 'Начните с записи в дневник настроения',
    });
  };

  const addMoodEntry = () => {
    if (!currentMood.emotion) {
      toast({ title: 'Выберите эмоцию', variant: 'destructive' });
      return;
    }
    
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...currentMood,
    };
    
    const updated = [newEntry, ...moodEntries];
    setMoodEntries(updated);
    localStorage.setItem('moodEntries', JSON.stringify(updated));
    
    setShowMoodDialog(false);
    setCurrentMood({ emotion: '', stress: 5, note: '' });
    
    toast({
      title: '📝 Запись добавлена',
      description: 'Продолжайте отслеживать своё состояние',
    });
  };

  const startTest = (test: any) => {
    setCurrentTest(test);
    setTestAnswers([]);
    setCurrentQuestion(0);
  };

  const answerQuestion = (score: number) => {
    const newAnswers = [...testAnswers, score];
    setTestAnswers(newAnswers);

    if (currentQuestion < currentTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = (answers: number[]) => {
    const totalScore = answers.reduce((a, b) => a + b, 0);
    const avgScore = totalScore / answers.length;
    
    let level = '';
    let recommendations: string[] = [];
    
    if (avgScore <= 2) {
      level = 'Низкий уровень';
      recommendations = [
        'Ваше состояние в норме',
        'Продолжайте практики самопомощи',
        'Поддерживайте здоровый режим сна',
      ];
    } else if (avgScore <= 3.5) {
      level = 'Умеренный уровень';
      recommendations = [
        'Уделите внимание отдыху',
        'Попробуйте дыхательные практики',
        'Добавьте физическую активность',
        'Ограничьте стрессовые факторы',
      ];
    } else {
      level = 'Высокий уровень';
      recommendations = [
        'Рекомендуется консультация специалиста',
        'Используйте техники экстренной помощи',
        'Практикуйте релаксацию ежедневно',
        'Обратитесь к телефону доверия при необходимости',
      ];
    }

    const result: TestResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      testName: currentTest.name,
      score: avgScore,
      level,
      recommendations,
    };

    const updated = [result, ...testResults];
    setTestResults(updated);
    localStorage.setItem('testResults', JSON.stringify(updated));

    setCurrentTest(null);
    setActiveTab('profile');
    
    toast({
      title: '✅ Тест завершён',
      description: `Результат: ${level}`,
    });
  };

  const toggleFavorite = (id: string) => {
    const updated = favoriteTechniques.includes(id)
      ? favoriteTechniques.filter(fav => fav !== id)
      : [...favoriteTechniques, id];
    
    setFavoriteTechniques(updated);
    localStorage.setItem('favoriteTechniques', JSON.stringify(updated));
  };

  const exportData = () => {
    const data = {
      user,
      moodEntries,
      testResults,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mental-health-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: '💾 Данные экспортированы',
      description: 'Файл сохранён на ваше устройство',
    });
  };

  const deleteAllData = () => {
    if (confirm('Вы уверены? Все данные будут удалены безвозвратно.')) {
      localStorage.clear();
      setMoodEntries([]);
      setTestResults([]);
      setFavoriteTechniques([]);
      
      toast({
        title: '🗑️ Данные удалены',
        description: 'Вся информация очищена',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in gradient-card border-none shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-2">
              <span className="text-gradient">MindCare</span>
            </CardTitle>
            <CardDescription className="text-lg">
              Ваше пространство ментального здоровья
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Как к вам обращаться?" 
                  required 
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="border-purple-200"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                Начать путь к гармонии
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTest) {
    const progress = ((currentQuestion + 1) / currentTest.questions.length) * 100;
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl animate-fade-in gradient-card border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-gradient">{currentTest.name}</CardTitle>
            <CardDescription>
              Вопрос {currentQuestion + 1} из {currentTest.questions.length}
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{currentTest.questions[currentQuestion]}</p>
            <div className="space-y-3">
              {[
                { value: 1, label: 'Совсем не согласен' },
                { value: 2, label: 'Скорее не согласен' },
                { value: 3, label: 'Нейтрально' },
                { value: 4, label: 'Скорее согласен' },
                { value: 5, label: 'Полностью согласен' },
              ].map((option) => (
                <Button
                  key={option.value}
                  onClick={() => answerQuestion(option.value)}
                  variant="outline"
                  className="w-full justify-start hover:bg-purple-50 transition-all hover:scale-[1.02]"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8 animate-slide-up">
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-gradient">MindCare</span>
            </h1>
            <p className="text-muted-foreground">Привет, {user?.name}! 👋</p>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-100">
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </TabsTrigger>
              <TabsTrigger value="diary" className="data-[state=active]:bg-purple-100">
                <Icon name="BookOpen" size={18} className="mr-2" />
                Дневник
              </TabsTrigger>
              <TabsTrigger value="tests" className="data-[state=active]:bg-purple-100">
                <Icon name="ClipboardList" size={18} className="mr-2" />
                Диагностика
              </TabsTrigger>
              <TabsTrigger value="techniques" className="data-[state=active]:bg-purple-100">
                <Icon name="Heart" size={18} className="mr-2" />
                Техники
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="gradient-card border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="BookOpen" size={20} className="text-purple-500" />
                      Записей в дневнике
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gradient">{moodEntries.length}</p>
                  </CardContent>
                </Card>

                <Card className="gradient-card border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="ClipboardCheck" size={20} className="text-green-500" />
                      Пройдено тестов
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gradient">{testResults.length}</p>
                  </CardContent>
                </Card>

                <Card className="gradient-card border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon name="Star" size={20} className="text-yellow-500" />
                      Избранных техник
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-gradient">{favoriteTechniques.length}</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="gradient-card border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Lightbulb" size={24} className="text-purple-500" />
                    Начните с малого
                  </CardTitle>
                  <CardDescription>Рекомендации для вас</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setShowMoodDialog(true)}
                    className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить запись в дневник
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('tests')}
                    variant="outline"
                    className="w-full justify-start hover:bg-purple-50"
                  >
                    <Icon name="ClipboardList" size={18} className="mr-2" />
                    Пройти тест на тревожность
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('techniques')}
                    variant="outline"
                    className="w-full justify-start hover:bg-purple-50"
                  >
                    <Icon name="Heart" size={18} className="mr-2" />
                    Попробовать технику дыхания
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diary" className="space-y-6 animate-fade-in">
              <Card className="gradient-card border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="BookOpen" size={24} className="text-purple-500" />
                        Дневник настроения
                      </CardTitle>
                      <CardDescription>Отслеживайте своё эмоциональное состояние</CardDescription>
                    </div>
                    <Button onClick={() => setShowMoodDialog(true)}>
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {moodEntries.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Пока нет записей</p>
                      <Button 
                        onClick={() => setShowMoodDialog(true)} 
                        className="mt-4"
                        variant="outline"
                      >
                        Создать первую запись
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {moodEntries.map((entry) => {
                        const emotion = emotions.find(e => e.value === entry.emotion);
                        return (
                          <Card key={entry.id} className="border-l-4 border-l-purple-500">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className={emotion?.color}>{emotion?.label}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(entry.date).toLocaleDateString('ru-RU', {
                                      day: 'numeric',
                                      month: 'long',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <Badge variant="outline">Стресс: {entry.stress}/10</Badge>
                              </div>
                              {entry.note && (
                                <p className="text-sm mt-2">{entry.note}</p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests" className="space-y-6 animate-fade-in">
              <Card className="gradient-card border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ClipboardList" size={24} className="text-purple-500" />
                    Диагностика состояния
                  </CardTitle>
                  <CardDescription>Пройдите тесты для оценки своего самочувствия</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tests.map((test) => (
                    <Card key={test.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        <CardDescription>{test.questions.length} вопросов</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => startTest(test)} className="w-full">
                          Пройти тест
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="techniques" className="space-y-6 animate-fade-in">
              <Card className="gradient-card border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Heart" size={24} className="text-purple-500" />
                    Техники самопомощи
                  </CardTitle>
                  <CardDescription>Практики для улучшения самочувствия</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {techniques.map((technique) => {
                      const isFavorite = favoriteTechniques.includes(technique.id);
                      return (
                        <AccordionItem key={technique.id} value={technique.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="text-left">
                                <p className="font-semibold">{technique.title}</p>
                                <p className="text-sm text-muted-foreground">{technique.category}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(technique.id);
                                }}
                              >
                                <Icon 
                                  name={isFavorite ? "Star" : "StarOff"} 
                                  size={18}
                                  className={isFavorite ? "fill-yellow-400 text-yellow-400" : ""}
                                />
                              </Button>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <p className="text-sm text-muted-foreground">{technique.description}</p>
                              <div className="space-y-2">
                                <p className="font-medium text-sm">Инструкция:</p>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                  {technique.instructions.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-6 gradient-card border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={24} className="text-purple-500" />
                Личный кабинет
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Имя</Label>
                <p className="text-lg font-medium">{user?.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-lg font-medium">{user?.email}</p>
              </div>

              {testResults.length > 0 && (
                <div>
                  <Label className="text-base mb-3 block">Результаты тестов</Label>
                  <div className="space-y-3">
                    {testResults.map((result) => (
                      <Card key={result.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{result.testName}</p>
                              <Badge>{result.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.date).toLocaleDateString('ru-RU')}
                            </p>
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Рекомендации:</p>
                              <ul className="text-sm space-y-1">
                                {result.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <Icon name="Check" size={16} className="text-green-500 mt-0.5" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button onClick={exportData} variant="outline" className="w-full">
                  <Icon name="Download" size={18} className="mr-2" />
                  Экспорт данных
                </Button>
                <Button onClick={deleteAllData} variant="destructive" className="w-full">
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Удалить все данные
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
          <DialogContent className="gradient-card border-none">
            <DialogHeader>
              <DialogTitle>Добавить запись в дневник</DialogTitle>
              <DialogDescription>Как вы себя чувствуете сегодня?</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Эмоция</Label>
                <Select value={currentMood.emotion} onValueChange={(v) => setCurrentMood({...currentMood, emotion: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите эмоцию" />
                  </SelectTrigger>
                  <SelectContent>
                    {emotions.map((emotion) => (
                      <SelectItem key={emotion.value} value={emotion.value}>
                        {emotion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Уровень стресса: {currentMood.stress}/10</Label>
                <Slider
                  value={[currentMood.stress]}
                  onValueChange={([v]) => setCurrentMood({...currentMood, stress: v})}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label>Заметки (необязательно)</Label>
                <Textarea
                  placeholder="Опишите, что произошло сегодня..."
                  value={currentMood.note}
                  onChange={(e) => setCurrentMood({...currentMood, note: e.target.value})}
                  rows={4}
                />
              </div>

              <Button onClick={addMoodEntry} className="w-full">
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowEmergency(true)}
            size="lg"
            className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse"
          >
            <Icon name="Phone" size={24} />
          </Button>
        </div>

        <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
          <DialogContent className="gradient-card border-none">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="AlertCircle" size={24} className="text-red-500" />
                Экстренная помощь
              </DialogTitle>
              <DialogDescription>Контакты служб психологической поддержки</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="font-semibold mb-1">Телефон доверия</p>
                  <a href="tel:88002000122" className="text-2xl font-bold text-purple-600">
                    8 800 2000 122
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Круглосуточно, бесплатно</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="font-semibold mb-1">Помощь в кризисных ситуациях</p>
                  <a href="tel:051" className="text-2xl font-bold text-purple-600">
                    051
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">С мобильного телефона</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="font-semibold mb-1">Скорая психиатрическая помощь</p>
                  <a href="tel:103" className="text-2xl font-bold text-purple-600">
                    103
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">При острых состояниях</p>
                </CardContent>
              </Card>

              <div className="pt-4 text-sm text-muted-foreground">
                <p>💚 Помните: обращение за помощью — это признак силы, а не слабости</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default Index;
