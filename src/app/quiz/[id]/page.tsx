'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: string;
  question: string;
  options: string[];
  topic: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  questions: Question[];
}

interface Result {
  score: number;
  totalQuestions: number;
  weakAreas: string[];
  metrics: {
    percentage: number;
    performanceLevel: string;
    message: string;
  };
  recommendations: string[];
  nextDifficulty: string;
}

export default function QuizAttempt() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && quizId) {
      fetchQuiz();
    }
  }, [status, router, quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz?id=${quizId}`);
      if (!response.ok) {
        throw new Error('Quiz not found');
      }
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Quiz not found');
      router.push('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const unanswered = quiz.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered questions. Submit anyway?`
      );
      if (!confirm) return;
    }

    try {
      const response = await fetch('/api/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
        }),
      });

      const data = await response.json();
      setResult({
        score: data.attempt.score,
        totalQuestions: data.attempt.totalQuestions,
        weakAreas: data.attempt.weakAreas,
        metrics: data.analysis.metrics,
        recommendations: data.analysis.recommendations,
        nextDifficulty: data.analysis.nextDifficulty,
      });
      setSubmitted(true);

      // Fetch recommendations if there are weak areas
      if (data.attempt.weakAreas.length > 0) {
        fetchRecommendations(data.attempt.weakAreas);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const fetchRecommendations = async (weakAreas: string[]) => {
    try {
      const response = await fetch(
        `/api/recommendations?weakAreas=${weakAreas.join(',')}&subject=${quiz?.subject}`
      );
      const data = await response.json();
      setMaterials(data.materials);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (!session || !quiz) {
    return null;
  }

  if (submitted && result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600">Here are your results</p>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white text-center mb-8">
            <div className="text-6xl font-bold mb-2">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-2xl mb-2">{result.metrics.percentage}%</div>
            <div className="text-xl font-semibold">{result.metrics.performanceLevel}</div>
            <p className="mt-4 text-lg">{result.metrics.message}</p>
          </div>

          {/* Weak Areas */}
          {result.weakAreas.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Areas for Improvement</h2>
              <div className="flex flex-wrap gap-2">
                {result.weakAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-6 w-6 text-green-500 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Materials */}
          {materials.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recommended Study Materials
              </h2>
              <div className="grid gap-4">
                {materials.map((material, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{material.title}</h3>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                        {material.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{material.preview}</p>
                    {material.keyConcepts.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {material.keyConcepts.slice(0, 5).map((concept: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
            <p className="text-blue-700 text-sm">
              Based on your performance, we recommend trying a{' '}
              <span className="font-semibold">{result.nextDifficulty}</span> difficulty
              quiz next.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link
              href="/quiz"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Browse More Quizzes
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
              {quiz.subject}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(question.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[question.id] === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[question.id] === index
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[question.id] === index && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} / {quiz.questions.length} answered
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}