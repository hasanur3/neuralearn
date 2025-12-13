import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { SLMAnalyzer } from '@/lib/slm';

// POST submit quiz attempt
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quizId, answers } = body;

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: 'Quiz ID and answers are required' },
        { status: 400 }
      );
    }

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Calculate score and analyze answers
    let score = 0;
    const analysisData = quiz.questions.map((question, index) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;

      return {
        questionId: question.id,
        topic: question.topic,
        isCorrect,
      };
    });

    // Use SLM to identify weak areas
    const weakAreas = SLMAnalyzer.analyzeWeakAreas(
      analysisData,
      quiz.questions
    );

    // Save quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        answers: answers,
        score,
        totalQuestions: quiz.questions.length,
        weakAreas,
      },
    });

    // Generate performance metrics
    const metrics = SLMAnalyzer.calculatePerformanceMetrics(
      score,
      quiz.questions.length,
      weakAreas
    );

    // Generate recommendations
    const recommendations = SLMAnalyzer.generateRecommendations(weakAreas);

    // Recommend next difficulty
    const nextDifficulty = SLMAnalyzer.recommendNextDifficulty(
      quiz.difficulty,
      score,
      quiz.questions.length
    );

    return NextResponse.json({
      message: 'Quiz attempt submitted successfully',
      attempt: {
        id: attempt.id,
        score,
        totalQuestions: quiz.questions.length,
        weakAreas,
        completedAt: attempt.completedAt,
      },
      analysis: {
        metrics,
        recommendations,
        nextDifficulty,
      },
    });
  } catch (error) {
    console.error('Quiz attempt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET user's quiz attempts
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    const userId = searchParams.get('userId') || session.user.id;

    // Check authorization for viewing other user's attempts
    if (userId !== session.user.id && session.user.role === 'STUDENT') {
      return NextResponse.json(
        { error: 'You can only view your own attempts' },
        { status: 403 }
      );
    }

    const where: any = { userId };
    if (quizId) {
      where.quizId = quizId;
    }

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            difficulty: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Fetch attempts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}