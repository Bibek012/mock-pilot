

import React, { useState, useEffect, createContext, useContext } from "react";

import { db, auth, appId } from "./firebase";

import {
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";
import { 
  BookOpen, Clock, CheckCircle2, XCircle, PlayCircle, UploadCloud, 
  ChevronRight, ChevronLeft, Menu, TrainFront, Landmark, 
  Building, GraduationCap, FileText, AlertCircle, Home, FileQuestion, Upload, X
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
// import { signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
// import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

// --- FIREBASE SETUP ---


// --- INITIAL DUMMY DATA ---
const EXAMS_DATA = [
  { id: 'ssc', name: 'SSC Exams', icon: 'Building' },
  { id: 'railway', name: 'Railway Exams', icon: 'TrainFront' },
  { id: 'banking', name: 'Banking Exams', icon: 'Landmark' },
  { id: 'upsc', name: 'UPSC', icon: 'GraduationCap' },
  { id: 'state', name: 'State Exams', icon: 'BookOpen' }
];

const POSTS_DATA = {
  'railway': [
    { id: 'group-d', name: 'RRB Group D' },
    { id: 'ntpc', name: 'RRB NTPC' },
    { id: 'alp', name: 'RRB ALP' },
    { id: 'technician', name: 'RRB Technician' }
  ],
  'ssc': [
    { id: 'cgl', name: 'SSC CGL' },
    { id: 'chsl', name: 'SSC CHSL' },
    { id: 'mts', name: 'SSC MTS' },
    { id: 'gd', name: 'SSC GD' }
  ],
  'banking': [
    { id: 'po', name: 'IBPS PO' },
    { id: 'clerk', name: 'IBPS Clerk' }
  ],
  'upsc': [
    { id: 'cse', name: 'UPSC CSE' },
    { id: 'nda', name: 'NDA' }
  ],
  'state': [
    { id: 'police', name: 'State Police' },
    { id: 'patwari', name: 'Patwari' }
  ]
};

const SUBJECTS_LIST = [
  { id: 'full-test', name: 'Full Test' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'reasoning', name: 'Reasoning' },
  { id: 'general-awareness', name: 'General Awareness' },
  { id: 'english', name: 'English' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
];

const INITIAL_TESTS = [
  {
    testId: "railway-math-01",
    title: "Group D Mathematics Set 1",
    exam: "railway",
    post: "group-d",
    subject: "mathematics",
    duration: 600, // 10 minutes in seconds
    totalMarks: 10,
    marksPerQuestion: 2,
    negativeMarking: 0.5,
    questions: [
      { id: "q1", question: "If the cost price of 12 articles is equal to the selling price of 10 articles, the profit percentage is:", options: ["16.67%", "20%", "25%", "22.5%"], correctAnswer: 1, explanation: "Let CP of 1 article = Rs. 1. CP of 10 articles = Rs. 10. SP of 10 articles = CP of 12 articles = Rs. 12. Profit = 12 - 10 = 2. Profit % = (2/10)*100 = 20%." },
      { id: "q2", question: "What is the LCM of 24, 36, and 40?", options: ["120", "240", "360", "480"], correctAnswer: 2, explanation: "Prime factorization: 24 = 2^3 * 3, 36 = 2^2 * 3^2, 40 = 2^3 * 5. LCM = 2^3 * 3^2 * 5 = 8 * 9 * 5 = 360." }
    ]
  }
];

// --- CONTEXTS ---
const DataContext = createContext(null);
const RouterContext = createContext(null);

// --- ICONS MAPPING ---
const IconMap = { Building, TrainFront, Landmark, GraduationCap, BookOpen };

// --- UI COMPONENTS ---
const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${onClick ? 'cursor-pointer transition-all hover:shadow-md hover:border-blue-300' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-green-600 text-white hover:bg-green-700"
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Custom Modal (To replace window.confirm)
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="success" onClick={onConfirm}>Confirm Submit</Button>
        </div>
      </div>
    </div>
  );
};


// --- VIEWS ---

// 1. Home View (Categories)
const HomeView = () => {
  const { navigate } = useContext(RouterContext);

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Select Your Exam Goal</h1>
        <p className="text-slate-500 mt-2 text-lg">Choose an exam category to explore mock tests.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXAMS_DATA.map(exam => {
          const IconComponent = IconMap[exam.icon] || FileText;
          return (
            <Card key={exam.id} onClick={() => navigate('posts', { examId: exam.id })} className="group p-6 flex flex-col items-center justify-center text-center gap-4 hover:-translate-y-1">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <IconComponent size={36} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{exam.name}</h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1 group-hover:text-blue-600 transition-colors">
                  View Posts <ChevronRight size={14} />
                </p>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

// 2. Posts View
const PostsView = ({ params }) => {
  const { navigate } = useContext(RouterContext);
  
  const exam = EXAMS_DATA.find(e => e.id === params.examId);
  const examPosts = POSTS_DATA[params.examId] || [];

  if (!exam) return <div className="p-8 text-center text-slate-500">Exam not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in slide-in-from-right-8 duration-300">
      <div className="mb-8 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('home')} className="rounded-full w-10 h-10 p-0">
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{exam.name} Posts</h1>
          <p className="text-slate-500 mt-1">Select a specific post to view tests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {examPosts.map(post => (
          <Card key={post.id} onClick={() => navigate('tests', { examId: exam.id, postId: post.id })} className="p-5 flex items-center justify-between group">
            <span className="font-semibold text-slate-700 text-lg">{post.name}</span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <ChevronRight size={18} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// 3. Subject Selection & Test List View
const TestsView = ({ params }) => {
  const { tests, localResults } = useContext(DataContext);
  const { navigate } = useContext(RouterContext);
  const [activeSubject, setActiveSubject] = useState('full-test');

  const exam = EXAMS_DATA.find(e => e.id === params.examId);
  const post = POSTS_DATA[params.examId]?.find(p => p.id === params.postId);

  // Filter tests based on exam, post, and selected subject tab
  const postTests = tests.filter(t => t.exam === params.examId && t.post === params.postId && t.subject === activeSubject);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    return `${m} mins`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in slide-in-from-right-8 duration-300">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('posts', { examId: params.examId })} className="rounded-full w-10 h-10 p-0">
          <ChevronLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{post?.name} Mock Tests</h1>
          <p className="text-slate-500 mt-1">Select Subject and start practicing</p>
        </div>
      </div>

      {/* Subject Tabs - Always Visible */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
        {SUBJECTS_LIST.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubject(sub.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
              activeSubject === sub.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {postTests.length > 0 ? postTests.map(test => (
          <Card key={test.testId} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {SUBJECTS_LIST.find(s => s.id === test.subject)?.name || test.subject}
                </span>
                <div className="flex items-center text-slate-500 text-sm gap-1 bg-slate-100 px-2 py-1 rounded-md">
                  <Clock size={14} /> {formatTime(test.duration)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{test.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-4">
                <span className="flex items-center gap-1.5"><FileQuestion size={16}/> {test.questions.length} Questions</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={16}/> {test.totalMarks} Marks</span>
                <span className="flex items-center gap-1.5"><AlertCircle size={16}/> -{test.negativeMarking} Negative</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              {localResults.find(r => r.testId === test.testId) ? (
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2 text-md" size="lg" variant="outline" onClick={() => navigate('test_engine', { testId: test.testId })}>
                    <PlayCircle size={18} /> Reattempt
                  </Button>
                  <Button className="flex-1 gap-2 text-md" size="lg" variant="secondary" onClick={() => navigate('analyse', { testId: test.testId })}>
                    <FileText size={18} /> Analysis
                  </Button>
                </div>
              ) : (
                <Button className="w-full gap-2 text-md" size="lg" onClick={() => navigate('test_engine', { testId: test.testId })}>
                  <PlayCircle size={18} /> Start Test
                </Button>
              )}
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="flex justify-center mb-3 text-slate-300">
              <FileText size={48} />
            </div>
            <p className="text-lg font-medium text-slate-600">No mock tests available for this subject.</p>
            <p>Admin can upload tests using the Upload Questions tab.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 4. Test Engine View
const TestEngineView = ({ params }) => {
  const { tests, saveLocalResult } = useContext(DataContext);
  const { navigate } = useContext(RouterContext);
  const test = tests.find(t => t.testId === params.testId);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({});
  const [timeLeft, setTimeLeft] = useState(test?.duration || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);

  useEffect(() => {
    if (!test) return;
    const initialStatus = { [test.questions[0].id]: 'not_answered' };
    setStatus(prev => ({ ...initialStatus, ...prev }));

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test]);

  if (!test) return <div className="p-8 text-center text-red-500 font-bold">Test not found in database.</div>;

  const currentQ = test.questions[currentQIndex];

  const handleOptionSelect = (optIndex) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optIndex }));
    updateStatus(currentQ.id, status[currentQ.id] === 'marked' || status[currentQ.id] === 'marked_answered' ? 'marked_answered' : 'answered');
  };

  const updateStatus = (qId, newStatus) => {
    setStatus(prev => ({ ...prev, [qId]: newStatus }));
  };

  const goToNext = () => {
    if (!status[currentQ.id] || status[currentQ.id] === 'not_visited') {
       updateStatus(currentQ.id, 'not_answered');
    }
    if (currentQIndex < test.questions.length - 1) {
      const nextQId = test.questions[currentQIndex + 1].id;
      if (!status[nextQId]) updateStatus(nextQId, 'not_answered');
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
    }
  };

  const handleClear = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQ.id];
    setAnswers(newAnswers);
    updateStatus(currentQ.id, 'not_answered');
  };

  const handleMarkReview = () => {
    const isAnswered = answers[currentQ.id] !== undefined;
    updateStatus(currentQ.id, isAnswered ? 'marked_answered' : 'marked');
    goToNext();
  };

  // Click Submit button shows the custom popup Modal instead of window.confirm
  const onAttemptSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const handleSubmitTest = (autoSubmit = false) => {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    test.questions.forEach(q => {
      const ans = answers[q.id];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const score = (correct * test.marksPerQuestion) - (wrong * test.negativeMarking);
    const timeTaken = test.duration - timeLeft;

    const result = {
      testId: test.testId,
      timestamp: new Date().toISOString(),
      score,
      correct,
      wrong,
      unattempted,
      timeTaken,
      answers,
      totalMarks: test.totalMarks,
      totalQuestions: test.questions.length
    };

    saveLocalResult(result);
    navigate('analyse', { testId: test.testId });
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (st) => {
    switch(st) {
      case 'answered': return 'bg-emerald-500 text-white border-emerald-600';
      case 'not_answered': return 'bg-red-500 text-white border-red-600';
      case 'marked': return 'bg-purple-500 text-white border-purple-600';
      case 'marked_answered': return 'bg-purple-600 text-white border-purple-700 ring-2 ring-emerald-400 ring-offset-1';
      default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
    }
  };

  const counts = {
    answered: Object.values(status).filter(s => s === 'answered' || s === 'marked_answered').length,
    not_answered: Object.values(status).filter(s => s === 'not_answered').length,
    marked: Object.values(status).filter(s => s === 'marked' || s === 'marked_answered').length,
    not_visited: test.questions.length - Object.keys(status).length
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col h-screen">
      {/* Submit Confirmation Modal */}
      <ConfirmModal 
        isOpen={showSubmitModal}
        title="Submit Test?"
        message="Are you sure you want to submit the test? You cannot change answers after submission."
        onCancel={() => setShowSubmitModal(false)}
        onConfirm={() => handleSubmitTest(false)}
      />

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div>
          <h2 className="font-bold text-slate-800 text-base md:text-lg leading-none">{test.title}</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">{test.questions.length} Questions | {test.totalMarks} Marks</p>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className={`flex items-center gap-2 font-mono text-lg md:text-xl font-bold px-3 md:px-4 py-1.5 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-800'}`}>
            <Clock size={18} /> {formatTimer(timeLeft)}
          </div>
          <Button variant="success" onClick={onAttemptSubmitClick} disabled={isSubmitting} className="hidden md:inline-flex">
            Submit Test
          </Button>
          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={() => setShowMobilePalette(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Palette Drawer */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobilePalette(false)} />
          {/* Drawer Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <span className="font-bold text-slate-800">Question Palette</span>
              <button onClick={() => setShowMobilePalette(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            {/* Legend */}
            <div className="p-3 grid grid-cols-2 gap-2 text-xs font-medium border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-emerald-500 flex items-center justify-center text-[10px] text-white">{counts.answered}</div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-red-500 flex items-center justify-center text-[10px] text-white">{counts.not_answered}</div> Not Ans</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-white border border-slate-300 flex items-center justify-center text-[10px] text-slate-600">{counts.not_visited}</div> Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-purple-500 flex items-center justify-center text-[10px] text-white">{counts.marked}</div> Marked</div>
            </div>
            {/* Question Numbers */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((q, idx) => {
                  const qStatus = status[q.id] || 'not_visited';
                  const isActive = currentQIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        if (!status[currentQ.id]) updateStatus(currentQ.id, 'not_answered');
                        setCurrentQIndex(idx);
                        if (!status[q.id]) updateStatus(q.id, 'not_answered');
                        setShowMobilePalette(false);
                      }}
                      className={`h-10 w-full rounded-md font-bold text-sm border flex items-center justify-center transition-all
                        ${getStatusColor(qStatus)}
                        ${isActive ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 z-10' : 'hover:opacity-80'}
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Submit Button in Drawer */}
            <div className="p-4 border-t border-slate-200 shrink-0">
              <Button variant="success" className="w-full" size="lg" onClick={() => { setShowMobilePalette(false); onAttemptSubmitClick(); }} disabled={isSubmitting}>
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Engine Area */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <span className="text-lg font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
                  Question {currentQIndex + 1} <span className="text-slate-400 font-normal">/ {test.questions.length}</span>
                </span>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-4">
                  <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={16}/> +{test.marksPerQuestion}</span>
                  <span className="flex items-center gap-1 text-red-500"><XCircle size={16}/> -{test.negativeMarking}</span>
                </span>
              </div>
              
              <div className="text-xl text-slate-800 font-medium leading-relaxed mb-8">
                {currentQ.question}
              </div>

              <div className="space-y-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <label 
                      key={idx} 
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 shrink-0 transition-colors ${
                        isSelected ? 'border-blue-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                      </div>
                      <span className="text-slate-700 text-lg">{opt}</span>
                      <input 
                        type="radio" 
                        name={`q-${currentQ.id}`} 
                        className="hidden" 
                        checked={isSelected}
                        onChange={() => handleOptionSelect(idx)}
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleMarkReview} className="border-purple-200 text-purple-700 hover:bg-purple-50 text-xs sm:text-sm">
                Mark Review
              </Button>
              <Button variant="ghost" onClick={handleClear} disabled={answers[currentQ.id] === undefined} className="text-xs sm:text-sm">
                Clear
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={goToPrev} disabled={currentQIndex === 0} className="text-xs sm:text-sm">
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button onClick={goToNext} className="text-xs sm:text-sm">
                Save & Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Palette (Desktop only) */}
        <div className="hidden md:flex w-full md:w-80 bg-slate-50 border-t md:border-l md:border-t-0 border-slate-200 flex-col shrink-0 md:h-full">
          <div className="p-3 grid grid-cols-2 gap-2 text-xs font-medium border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-emerald-500 flex items-center justify-center text-[10px] text-white">{counts.answered}</div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-red-500 flex items-center justify-center text-[10px] text-white">{counts.not_answered}</div> Not Ans</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-white border border-slate-300 flex items-center justify-center text-[10px] text-slate-600">{counts.not_visited}</div> Not Visited</div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-md bg-purple-500 flex items-center justify-center text-[10px] text-white">{counts.marked}</div> Marked</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-6 md:grid-cols-5 gap-2">
              {test.questions.map((q, idx) => {
                const qStatus = status[q.id] || 'not_visited';
                const isActive = currentQIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (!status[currentQ.id]) updateStatus(currentQ.id, 'not_answered');
                      setCurrentQIndex(idx);
                      if (!status[q.id]) updateStatus(q.id, 'not_answered');
                    }}
                    className={`h-10 w-full rounded-md font-bold text-sm border flex items-center justify-center transition-all
                      ${getStatusColor(qStatus)}
                      ${isActive ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 z-10' : 'hover:opacity-80'}
                    `}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Result / Analyse View
const AnalyseView = ({ params }) => {
  const { localResults, tests } = useContext(DataContext);
  const { navigate } = useContext(RouterContext);
  
  const result = localResults.find(r => r.testId === params.testId) || (() => {
    try {
      const stored = localStorage.getItem('mocktest_results');
      if (stored) {
        const all = JSON.parse(stored);
        return all.find(r => r.testId === params.testId);
      }
    } catch {}
    return null;
  })();
  const test = tests.find(t => t.testId === params.testId);

  if (!result || !test) return <div className="p-8 text-center mt-10 text-slate-500">Result not found. Please take the test first.</div>;

  const accuracy = result.correct + result.wrong > 0 
    ? Math.round((result.correct / (result.correct + result.wrong)) * 100) 
    : 0;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Performance Analysis</h1>
          <p className="text-slate-500 mt-1">{test.title}</p>
        </div>
        <Button onClick={() => navigate('home')} variant="outline">Back to Home</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Score</span>
          <span className="text-4xl font-black text-blue-700">{result.score.toFixed(2)}<span className="text-xl text-blue-400 font-medium">/{result.totalMarks}</span></span>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Accuracy</span>
          <span className="text-3xl font-bold text-slate-800">{accuracy}%</span>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Attempted</span>
          <span className="text-3xl font-bold text-slate-800">{result.correct + result.wrong}<span className="text-xl text-slate-400 font-medium">/{result.totalQuestions}</span></span>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Time Taken</span>
          <span className="text-3xl font-bold text-slate-800">{formatTime(result.timeTaken)}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
         <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2"><CheckCircle2/> Correct Answers</span>
            <span className="text-2xl font-bold">{result.correct}</span>
         </div>
         <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2"><XCircle/> Wrong Answers</span>
            <span className="text-2xl font-bold">{result.wrong}</span>
         </div>
         <div className="bg-slate-100 text-slate-600 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2"><AlertCircle/> Unattempted</span>
            <span className="text-2xl font-bold">{result.unattempted}</span>
         </div>
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-6">Detailed Solutions</h3>
      <div className="space-y-6">
        {test.questions.map((q, idx) => {
          const userAnswer = result.answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isAttempted = userAnswer !== undefined;

          return (
            <Card key={q.id} className="p-6">
              <div className="flex gap-4 mb-4">
                <div className="shrink-0 mt-1">
                  {isCorrect ? <CheckCircle2 className="text-emerald-500" size={24} /> : 
                   isAttempted ? <XCircle className="text-red-500" size={24} /> : 
                   <AlertCircle className="text-slate-400" size={24} />}
                </div>
                <div className="w-full">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4"><span className="text-slate-400 mr-2">Q{idx + 1}.</span>{q.question}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {q.options.map((opt, optIdx) => {
                      let bgClass = "bg-slate-50 border-slate-200 text-slate-700";
                      let icon = null;

                      if (optIdx === q.correctAnswer) {
                        bgClass = "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium";
                        icon = <CheckCircle2 size={16} className="text-emerald-600"/>;
                      } else if (optIdx === userAnswer && !isCorrect) {
                        bgClass = "bg-red-50 border-red-300 text-red-800";
                        icon = <XCircle size={16} className="text-red-600"/>;
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border flex items-center justify-between ${bgClass}`}>
                           <span>{opt}</span>
                           {icon}
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <span className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2 block">Explanation</span>
                    <p className="text-slate-700 text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

// 6. Upload Questions View (Detailed Form with File Upload & Firebase integration)
const UploadView = () => {
  const { navigate } = useContext(RouterContext);
  
  const [formData, setFormData] = useState({
    title: '',
    exam: 'railway',
    post: 'group-d',
    subject: 'mathematics',
    duration: '30', // minutes
    marksPerQuestion: '2',
    negativeMarking: '0.5',
  });
  
  const [questionsFile, setQuestionsFile] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Update available posts when exam changes
  const availablePosts = POSTS_DATA[formData.exam] || [];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuestionsFile(file);
    }
  };

  const handleUpload = async () => {
    if (!db) {
      setMsg({ text: "Database (Firebase) connect nahi hai.", type: 'error' });
      return;
    }
    if (!formData.title || !questionsFile) {
      setMsg({ text: "Test Name aur Questions JSON file jaruri hai!", type: 'error' });
      return;
    }

    setIsUploading(true);
    setMsg({ text: 'Uploading to server...', type: 'info' });

    try {
      const fileText = await questionsFile.text();
      let questionsArray = JSON.parse(fileText);

      // Validation
      if (!Array.isArray(questionsArray)) {
        throw new Error("JSON file must contain an Array of questions.");
      }

      const testId = `test-${Date.now()}`;
      
      const newTest = {
        testId,
        title: formData.title,
        exam: formData.exam,
        post: formData.post,
        subject: formData.subject,
        duration: parseInt(formData.duration) * 60, // convert min to sec
        marksPerQuestion: parseFloat(formData.marksPerQuestion),
        negativeMarking: parseFloat(formData.negativeMarking),
        totalMarks: questionsArray.length * parseFloat(formData.marksPerQuestion),
        questions: questionsArray,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore permanently
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'mock_tests', testId), newTest);

      setMsg({ text: "Test successfully server par upload ho gaya! Hamesha ke liye save ho gaya.", type: 'success' });
      
      setTimeout(() => {
        navigate('tests', { examId: formData.exam, postId: formData.post });
      }, 2000);

    } catch (e) {
      setMsg({ text: "Error: " + e.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const demoJson = `[
  {
    "id": "q1",
    "question": "The capital of India is?",
    "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
    "correctAnswer": 1,
    "explanation": "New Delhi is the capital of India."
  }
]`;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UploadCloud className="text-blue-600" /> Upload Mock Test (Server)
        </h1>
        <p className="text-slate-500 mt-2">Test create karein aur questions ka JSON file upload karein. Ye database me hamesha save rahega.</p>
      </div>

      <Card className="p-6 mb-8 border-t-4 border-t-blue-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Test Name (Title)</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E.g. Group D Practice Set 5" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Exam Category</label>
            <select name="exam" value={formData.exam} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {EXAMS_DATA.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Post Selection</label>
            <select name="post" value={formData.post} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {availablePosts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
            <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              {SUBJECTS_LIST.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Duration (in Minutes)</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">Marks / Ques.</label>
              <input type="number" step="0.5" name="marksPerQuestion" value={formData.marksPerQuestion} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2">-ve Marking</label>
              <input type="number" step="0.1" name="negativeMarking" value={formData.negativeMarking} onChange={handleInputChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
           <label className="block text-sm font-bold text-slate-700 mb-2">Upload Questions File (.json)</label>
           <input type="file" accept=".json" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
        </div>

        {msg.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium mb-6 ${msg.type === 'error' ? 'bg-red-100 text-red-700' : msg.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {msg.text}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleUpload} size="lg" className="w-full sm:w-auto gap-2" disabled={isUploading}>
            {isUploading ? "Uploading..." : <><Upload size={18}/> Save Test to Database</>}
          </Button>
        </div>
      </Card>

      <div className="bg-slate-800 text-slate-300 rounded-xl p-6 overflow-hidden shadow-inner">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><FileText size={18}/> JSON Format (Array of Questions only)</h3>
        <p className="text-xs text-slate-400 mb-4">Note: Make sure your JSON file only contains the questions array. ID, Question, Options array, Correct Answer Index (0,1,2,3) and Explanation.</p>
        <pre className="text-xs font-mono overflow-x-auto">
          <code>{demoJson}</code>
        </pre>
      </div>
    </div>
  );
};


// --- LAYOUT & NAVIGATION ---
const Navbar = () => {
  const { navigate, currentRoute } = useContext(RouterContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleNav = (route) => {
    navigate(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => handleNav('home')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-700 transition-colors">
              <CheckCircle2 className="text-white" size={20} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              Mock-<span className="text-blue-600">Pilot</span>
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant={currentRoute === 'home' ? 'secondary' : 'ghost'} onClick={() => handleNav('home')} className="gap-2">
              <Home size={18} /> Home
            </Button>
            <Button variant={currentRoute === 'upload' ? 'secondary' : 'ghost'} onClick={() => handleNav('upload')} className="gap-2">
              <UploadCloud size={18} /> Upload Questions
            </Button>
          </div>
          
          {/* Mobile Hamburger Icon */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="sm" className="px-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg absolute w-full left-0 animate-in slide-in-from-top-2">
          <Button variant={currentRoute === 'home' ? 'secondary' : 'ghost'} onClick={() => handleNav('home')} className="w-full justify-start gap-2">
            <Home size={18} /> Home
          </Button>
          <Button variant={currentRoute === 'upload' ? 'secondary' : 'ghost'} onClick={() => handleNav('upload')} className="w-full justify-start gap-2">
            <UploadCloud size={18} /> Upload Questions
          </Button>
        </div>
      )}
    </nav>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Global Firebase State
  const [user, setUser] = useState(null);
  const [firestoreTests, setFirestoreTests] = useState([]);
  
  // Local State - initialize from localStorage
  const [localResults, setLocalResults] = useState(() => {
    try {
      const stored = localStorage.getItem('mocktest_results');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [currentRoute, setCurrentRoute] = useState('home');
  const [routeParams, setRouteParams] = useState({});

  // 1. Firebase Authentication
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data from Firestore
 useEffect(() => {
  // Check karein ki kya appId sahi se aa raha hai
  if (!user || !db || !appId) {
    console.error("Missing requirements:", { user: !!user, db: !!db, appId });
    return;
  }

  try {
    const testsRef = collection(db, 'artifacts', appId, 'public', 'data', 'mock_tests');
    
    const unsubscribe = onSnapshot(testsRef, (snapshot) => {
      const loadedTests = [];
      snapshot.forEach(doc => {
        loadedTests.push({ ...doc.data(), testId: doc.id });
      });
      setFirestoreTests(loadedTests);
    }, (error) => {
      // Agar yahan error aata hai, toh Firestore rules ka issue hai
      console.error("Firestore Error:", error.message);
    });

    return () => unsubscribe();
  } catch (err) {
    console.error("Path Error:", err.message);
  }
}, [user, appId]);

  // Combine Hardcoded initial tests with Database tests
  const allTests = [...INITIAL_TESTS, ...firestoreTests];
  // Remove duplicates just in case (prefer firestore)
  const uniqueTestsMap = new Map();
  allTests.forEach(t => uniqueTestsMap.set(t.testId, t));
  const activeTests = Array.from(uniqueTestsMap.values());

  const navigate = (route, params = {}) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentRoute(route);
    setRouteParams(params);
  };

  const saveLocalResult = (result) => {
    setLocalResults(prev => {
      const updated = [...prev.filter(r => r.testId !== result.testId), result];
      try { localStorage.setItem('mocktest_results', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const routerContextValue = { currentRoute, params: routeParams, navigate };
  const dataContextValue = { tests: activeTests, localResults, saveLocalResult };

  const renderRoute = () => {
    switch (currentRoute) {
      case 'home': return <HomeView />;
      case 'posts': return <PostsView params={routeParams} />;
      case 'tests': return <TestsView params={routeParams} />;
      case 'test_engine': return <TestEngineView params={routeParams} />;
      case 'analyse': return <AnalyseView params={routeParams} />;
      case 'upload': return <UploadView />;
      default: return <HomeView />;
    }
  };

  return (
    <RouterContext.Provider value={routerContextValue}>
      <DataContext.Provider value={dataContextValue}>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
          {currentRoute !== 'test_engine' && <Navbar />}
          <main className={currentRoute !== 'test_engine' ? "pb-20 pt-4" : ""}>
            {renderRoute()}
          </main>
        </div>
      </DataContext.Provider>
    </RouterContext.Provider>
  );
}