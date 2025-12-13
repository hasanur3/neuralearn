import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET all quizzes
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single quiz with questions
    if (id) {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      });

      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }

      return NextResponse.json(quiz);
    }

    // Get all quizzes
    const quizzes = await prisma.quiz.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new quiz (Instructor/Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'STUDENT') {
      return NextResponse.json(
        { error: 'Only instructors and admins can create quizzes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, subject, difficulty, questions } = body;

    if (!title || !subject || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Title, subject, and questions are required' },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subject,
        difficulty: difficulty || 'MEDIUM',
        createdBy: session.user.id,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Quiz created successfully',
        quiz,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Quiz creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE quiz (Instructor/Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'STUDENT') {
      return NextResponse.json(
        { error: 'Only instructors and admins can delete quizzes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Check ownership (or admin)
    if (quiz.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only delete your own quizzes' },
        { status: 403 }
      );
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    console.error('Quiz deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}