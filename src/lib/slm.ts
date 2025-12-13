/**
 * Small Language Model (SLM) for Weak Area Analysis
 * Analyzes quiz attempts to identify weak areas and learning gaps
 */

interface QuizAnswer {
  questionId: string;
  topic: string;
  isCorrect: boolean;
}

interface WeakArea {
  topic: string;
  incorrectCount: number;
  totalCount: number;
  weaknessPercentage: number;
}

export class SLMAnalyzer {
  /**
   * Analyze quiz attempt to identify weak areas
   */
  static analyzeWeakAreas(
    answers: QuizAnswer[],
    allQuestions: { topic: string }[]
  ): string[] {
    const topicStats = new Map<string, { correct: number; total: number }>();

    // Count correct and total per topic
    answers.forEach((answer) => {
      const stats = topicStats.get(answer.topic) || { correct: 0, total: 0 };
      stats.total++;
      if (answer.isCorrect) {
        stats.correct++;
      }
      topicStats.set(answer.topic, stats);
    });

    // Identify weak areas (< 60% accuracy)
    const weakAreas: WeakArea[] = [];
    topicStats.forEach((stats, topic) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy < 60) {
        weakAreas.push({
          topic,
          incorrectCount: stats.total - stats.correct,
          totalCount: stats.total,
          weaknessPercentage: 100 - accuracy,
        });
      }
    });

    // Sort by weakness percentage (highest first)
    weakAreas.sort((a, b) => b.weaknessPercentage - a.weaknessPercentage);

    return weakAreas.map((area) => area.topic);
  }

  /**
   * Generate personalized learning recommendations
   */
  static generateRecommendations(weakAreas: string[]): string[] {
    const recommendations: string[] = [];

    if (weakAreas.length === 0) {
      recommendations.push(
        'Great job! You\'ve mastered all topics in this quiz.',
        'Consider taking advanced quizzes to challenge yourself further.',
        'Review concepts periodically to maintain your understanding.'
      );
      return recommendations;
    }

    recommendations.push(
      `Focus on improving your understanding of: ${weakAreas.join(', ')}`,
      'Review the knowledge base materials for these topics',
      'Practice more questions in your weak areas',
      'Consider watching video tutorials or reading additional resources'
    );

    if (weakAreas.length > 3) {
      recommendations.push(
        'Start with one or two topics to avoid feeling overwhelmed',
        'Set specific learning goals for each weak area'
      );
    }

    return recommendations;
  }

  /**
   * Calculate overall performance metrics
   */
  static calculatePerformanceMetrics(
    score: number,
    totalQuestions: number,
    weakAreas: string[]
  ) {
    const percentage = (score / totalQuestions) * 100;
    let performanceLevel: string;
    let message: string;

    if (percentage >= 90) {
      performanceLevel = 'Excellent';
      message = 'Outstanding performance! Keep up the great work!';
    } else if (percentage >= 75) {
      performanceLevel = 'Good';
      message = 'Good job! A little more practice will make you excellent.';
    } else if (percentage >= 60) {
      performanceLevel = 'Average';
      message = 'You\'re on the right track. Focus on your weak areas.';
    } else if (percentage >= 40) {
      performanceLevel = 'Below Average';
      message = 'More practice needed. Review the concepts thoroughly.';
    } else {
      performanceLevel = 'Needs Improvement';
      message = 'Don\'t worry! Start with basics and build gradually.';
    }

    return {
      percentage: Math.round(percentage),
      performanceLevel,
      message,
      weakAreasCount: weakAreas.length,
      strengthsCount: totalQuestions - weakAreas.length,
    };
  }

  /**
   * Predict difficulty level for next recommended quiz
   */
  static recommendNextDifficulty(
    currentDifficulty: string,
    score: number,
    totalQuestions: number
  ): string {
    const percentage = (score / totalQuestions) * 100;

    if (currentDifficulty === 'EASY') {
      return percentage >= 80 ? 'MEDIUM' : 'EASY';
    } else if (currentDifficulty === 'MEDIUM') {
      if (percentage >= 85) return 'HARD';
      if (percentage < 60) return 'EASY';
      return 'MEDIUM';
    } else {
      // HARD
      return percentage < 60 ? 'MEDIUM' : 'HARD';
    }
  }
}