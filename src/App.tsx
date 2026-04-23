import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Search, 
  WifiOff, 
  Mic, 
  Camera, 
  History, 
  Settings, 
  BookOpen, 
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Stethoscope,
  Wind
} from 'lucide-react';
import { analyzeCrop } from './services/geminiService';
import { Diagnosis, HistoryItem, Language } from './types';
import { TRANSLATIONS, DAILY_TIPS, COMMON_DISEASES } from './constants';

export default function App() {
  const [lang, setLang] = useState<Language>('FR');
  const [issue, setIssue] = useState('');
  const [selectedCulture, setSelectedCulture] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'library' | 'settings'>('home');
  const [climate, setClimate] = useState('pluie'); // Default for demo

  const t = TRANSLATIONS[lang];

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Input Setup
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'FR' ? 'fr-FR' : lang === 'EN' ? 'en-US' : 'fr-FR'; // Default to FR for FUL as proxy or if not supported
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIssue(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load history
    const saved = localStorage.getItem('agrismart_history');
    if (saved) setHistory(JSON.parse(saved));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('agrismart_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    if (!issue.trim() && !selectedImage) return;
    setIsAnalyzing(true);
    
    const res = await analyzeCrop(issue, selectedCulture, history, climate, selectedImage || undefined);
    setResult(res);
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      culture: selectedCulture || 'Inconnu',
      issue: issue || "Analyse d'image",
      diagnosis: res
    };
    setHistory(prev => [newItem, ...prev].slice(0, 10));
    setIsAnalyzing(false);
  };

  const getUrgencyColor = (urgency: string) => {
    const u = urgency.toLowerCase();
    if (u.includes('haute') || u.includes('high') || u.includes('immediate')) return 'bg-red-100 text-red-800 border-red-200';
    if (u.includes('moyenne') || u.includes('medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const dayTip = useMemo(() => DAILY_TIPS[Math.floor(Date.now() / 86400000) % DAILY_TIPS.length], []);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-emerald-800 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-emerald-300" />
            <div>
              <h1 className="text-xl font-bold leading-tight">{t.title}</h1>
              <p className="text-[10px] uppercase tracking-wider opacity-80">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isOffline && (
              <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
                <WifiOff className="w-3 h-3 text-amber-300" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">OFFLINE</span>
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 bg-emerald-900 z-40 text-white pt-24 px-8 overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 text-2xl font-medium">
              <button onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }} className="flex items-center gap-4">
                <Sprout /> {t.title}
              </button>
              <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className="flex items-center gap-4">
                <History /> {t.history}
              </button>
              <button onClick={() => { setActiveTab('library'); setIsMenuOpen(false); }} className="flex items-center gap-4">
                <BookOpen /> {t.library}
              </button>
              <button onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }} className="flex items-center gap-4 text-emerald-300 mt-10">
                <Settings /> {t.settings}
              </button>
            </nav>
            <div className="mt-12 pt-8 border-t border-emerald-800/50">
              <p className="text-sm opacity-60">Version 1.0.4</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        {activeTab === 'home' && (
          <>
            {/* Daily Tip */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-sm"
            >
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-emerald-800 text-sm uppercase tracking-wide">{t.dailyTip}</h3>
              </div>
              <p className="text-emerald-900 italic font-medium">{dayTip}</p>
            </motion.div>

            {/* Main Input Form */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
              <div className="mb-6">
                <label className="block text-stone-500 text-xs font-bold uppercase tracking-widest mb-3">{t.quickActions}</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.entries(t.cultures).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCulture(label)}
                      className={`px-4 py-3 rounded-2xl flex-shrink-0 transition-all font-bold text-sm ${
                        selectedCulture === label 
                        ? 'bg-emerald-800 text-white shadow-md scale-105' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    id="issue-input"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder={t.describeIssue}
                    className="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl p-4 min-h-[120px] focus:border-emerald-500 focus:ring-0 transition-colors text-lg font-medium outline-none resize-none"
                  />
                  
                  {selectedImage && (
                    <div className="mt-4 relative inline-block">
                      <img src={selectedImage} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-emerald-500" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <button 
                      onClick={toggleListening}
                      className={`p-3 rounded-full transition-all relative ${
                        isListening 
                        ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                        : 'bg-stone-100 text-stone-400 hover:text-emerald-600'
                      }`}
                    >
                      {isListening && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="absolute inset-0 bg-red-400 rounded-full"
                        />
                      )}
                      <Mic className="relative z-10" />
                    </button>
                    <label className="p-3 bg-stone-100 rounded-full text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer">
                      <Camera />
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (!issue.trim() && !selectedImage)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-black py-5 rounded-2xl text-xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-wider active:scale-95"
                >
                  {isAnalyzing ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Search />
                      {t.analyze}
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Results Mapping */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pb-10"
                >
                  <div className="flex items-center gap-2 px-2">
                    <Stethoscope className="text-emerald-600" />
                    <h2 className="text-2xl font-black text-stone-800">{t.diagnosisLabel}</h2>
                  </div>

                  {/* Diagnosis Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-100">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                         <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">{t.diagnosisLabel}</span>
                         <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getUrgencyColor(result.urgency)}`}>
                           {t.urgencyLabel}: {result.urgency}
                         </div>
                      </div>
                      <p className="text-2xl font-bold text-stone-900">{result.probableDiagnosis}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">{t.causesLabel}</p>
                        <p className="text-stone-800 font-medium leading-relaxed">{result.causes}</p>
                      </div>

                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">{t.solutionsLabel}</p>
                        <p className="text-stone-800 font-medium leading-relaxed">{result.solutions}</p>
                      </div>

                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">{t.preventionLabel}</p>
                        <p className="text-stone-800 font-medium leading-relaxed">{result.prevention}</p>
                      </div>

                      {/* Health Score */}
                      <div className="pt-4 border-t border-stone-100">
                         <div className="flex justify-between items-center mb-3">
                           <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{t.healthScoreLabel}</span>
                           <span className="text-2xl font-black text-emerald-600">{result.healthScore}/10</span>
                         </div>
                         <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden mb-3">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.healthScore * 10}%` }}
                              className={`h-full ${result.healthScore > 7 ? 'bg-emerald-500' : result.healthScore > 4 ? 'bg-amber-500' : 'bg-red-500'}`}
                           />
                         </div>
                         <p className="text-xs text-stone-500 font-medium italic">{result.healthScoreExplanation}</p>
                      </div>

                      <button className="w-full bg-stone-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 uppercase tracking-widest hover:bg-stone-800 active:scale-95 transition-all">
                        <AlertCircle className="w-5 h-5 text-emerald-400" />
                        {t.immediateAction}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-stone-800 px-2">{t.history}</h2>
            {history.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-stone-400 font-medium italic">
                Aucun historique disponible.
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} onClick={() => { setResult(item.diagnosis); setActiveTab('home'); }} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 cursor-pointer hover:border-emerald-300 transition-all flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-stone-800">{item.culture}</p>
                    <p className="text-sm text-stone-500 line-clamp-1">{item.issue}</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="text-stone-300" />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-stone-800 px-2">{t.library}</h2>
            <div className="grid gap-4">
              {COMMON_DISEASES.map((disease, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-lg text-stone-800">{disease.name}</h3>
                    <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{disease.culture}</span>
                  </div>
                  <p className="text-sm text-stone-600 mb-3 font-medium"><span className="font-bold text-stone-400 uppercase text-[9px] block">Symptômes:</span> {disease.symptoms}</p>
                  <p className="text-sm text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100"><span className="font-bold text-emerald-600 uppercase text-[9px] block">Solution:</span> {disease.solution}</p>
                </div>
              ))}
            </div>
            {isOffline && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm font-medium flex items-center gap-3">
                <WifiOff className="w-5 h-5 flex-shrink-0" />
                {t.offlineMode}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-stone-800 px-2">{t.settings}</h2>
            
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-3">Langue / Language</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['FR', 'FUL', 'EN'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`py-4 rounded-xl font-black text-lg transition-all ${lang === l ? 'bg-emerald-800 text-white shadow-md' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100">
                <label className="block text-xs font-black uppercase tracking-widest text-stone-400 mb-3">Saison Actuelle</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setClimate('pluie')}
                    className={`py-3 rounded-xl font-bold flex flex-col items-center gap-1 ${climate === 'pluie' ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}
                  >
                    <span>Pluie</span>
                    <span className="text-[10px] opacity-60 uppercase">En cours</span>
                  </button>
                  <button 
                    onClick={() => setClimate('seche')}
                    className={`py-3 rounded-xl font-bold flex flex-col items-center gap-1 ${climate === 'seche' ? 'bg-orange-100 text-orange-800 border-2 border-orange-500' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}
                  >
                    <span>Sèche</span>
                    <span className="text-[10px] opacity-60 uppercase">Harmattan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navbar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 h-20 px-6 flex justify-between items-center z-40 pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-emerald-600' : 'text-stone-300'}`}>
          <Sprout className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Accueil</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-emerald-600' : 'text-stone-300'}`}>
          <History className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">{t.history}</span>
        </button>
        <button onClick={() => setActiveTab('library')} className={`flex flex-col items-center gap-1 ${activeTab === 'library' ? 'text-emerald-600' : 'text-stone-300'}`}>
          <BookOpen className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Deftere</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-emerald-600' : 'text-stone-300'}`}>
          <Settings className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Settuji</span>
        </button>
      </nav>
    </div>
  );
}
