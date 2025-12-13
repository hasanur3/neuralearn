import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              NeuraLearn
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            AI-Powered Personalized Learning Platform for CSE Students
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Master computer science concepts with intelligent quiz analysis,
            personalized recommendations, and adaptive learning paths powered by
            advanced AI technology.
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <Link
              href="/register"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg hover:shadow-xl border-2 border-indigo-600"
            >
              Sign In
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Intelligent Quiz System
              </h3>
              <p className="text-gray-600">
                Take comprehensive quizzes on various CSE topics and receive
                instant feedback with detailed analysis.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Weak Area Analysis
              </h3>
              <p className="text-gray-600">
                Our SLM-powered system identifies your weak areas and provides
                targeted improvement strategies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                RAG-Based Recommendations
              </h3>
              <p className="text-gray-600">
                Get personalized study materials and resources based on your
                performance and learning needs.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              Key Features
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Role-Based Access</h4>
                  <p className="text-gray-600 text-sm">
                    Separate dashboards for Students, Instructors, and Admins
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Performance Analytics</h4>
                  <p className="text-gray-600 text-sm">
                    Visual charts and metrics to track your learning progress
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🎓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Personalized Study Plans</h4>
                  <p className="text-gray-600 text-sm">
                    AI-generated study plans based on your weak areas
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🔒</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Secure Authentication</h4>
                  <p className="text-gray-600 text-sm">
                    Industry-standard security with encrypted passwords
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-gray-600">
            <p className="text-sm">
              Demo Credentials: student@neuralearn.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}