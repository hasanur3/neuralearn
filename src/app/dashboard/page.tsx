'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnalyticsChart from '@/components/AnalyticsChart';

interface QuizAttempt {
  id: string;
  score: number;
  totalQuestions: number;
  weakAreas: string[];
  completedAt: string;
  quiz: {
    title: string;
    subject: string;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    totalQuizzes: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const [attemptsRes, quizzesRes] = await Promise.all([
        fetch('/api/attempt'),
        fetch('/api/quiz'),
      ]);

      const attemptsData = await attemptsRes.json();
      const quizzesData = await quizzesRes.json();

      setAttempts(attemptsData);

      const totalScore = attemptsData.reduce(
        (sum: number, attempt: QuizAttempt) => sum + attempt.score,
        0
      );
      const totalQuestions = attemptsData.reduce(
        (sum: number, attempt: QuizAttempt) => sum + attempt.totalQuestions,
        0
      );
      const avgScore = totalQuestions > 0 
        ? Math.round((totalScore / totalQuestions) * 100) 
        : 0;

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      const recentActivity = attemptsData.filter(
        (attempt: QuizAttempt) =>
          new Date(attempt.completedAt) > recentDate
      ).length;

      setStats({
        totalAttempts: attemptsData.length,
        averageScore: avgScore,
        totalQuizzes: quizzesData.length,
        recentActivity,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const performanceData = {
    labels: attempts.slice(0, 10).reverse().map((_, i) => `Attempt ${i + 1}`),
    datasets: [
      {
        label: 'Score Percentage',
        data: attempts
          .slice(0, 10)
          .reverse()
          .map((attempt) =>
            Math.round((attempt.score / attempt.totalQuestions) * 100)
          ),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
      },
    ],
  };

  const subjectData = {
    labels: [...new Set(attempts.map((a) => a.quiz.subject))],
    datasets: [
      {
        label: 'Attempts by Subject',
        data: [...new Set(attempts.map((a) => a.quiz.subject))].map(
          (subject) =>
            attempts.filter((a) => a.quiz.subject === subject).length
        ),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your learning progress overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Attempts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Quizzes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Last 7 Days</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.recentActivity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <AnalyticsChart
            type="line"
            data={performanceData}
            title="Performance Over Time"
          />
          <AnalyticsChart
            type="doughnut"
            data={subjectData}
            title="Attempts by Subject"
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quiz Attempts</h2>
        {attempts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No quiz attempts yet</p>
            <Link
              href="/quiz"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Take Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weak Areas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attempts.slice(0, 5).map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.quiz.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.quiz.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attempt.score}/{attempt.totalQuestions} ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {attempt.weakAreas.length > 0 ? attempt.weakAreas.join(', ') : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/quiz" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Take a Quiz</h3>
          <p className="text-gray-600 text-sm">Test your knowledge and track your progress</p>
        </Link>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Materials</h3>
          <p className="text-gray-600 text-sm">Access personalized learning resources</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Report</h3>
          <p className="text-gray-600 text-sm">View detailed analytics of your learning journey</p>
        </div>
      </div>
    </div>
  );
}