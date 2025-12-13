/**
 * RAG (Retrieval Augmented Generation) System
 * Retrieves relevant knowledge base materials based on weak areas
 */

import { prisma } from './prisma';

interface KnowledgeDocument {
  id: string;
  topic: string;
  subject: string;
  content: string;
  difficulty: string;
  keywords: string[];
  relevanceScore: number;
}

export class RAGSystem {
  /**
   * Retrieve relevant knowledge base materials for weak areas
   */
  static async retrieveRelevantMaterials(
    weakAreas: string[],
    subject?: string,
    limit: number = 5
  ): Promise<KnowledgeDocument[]> {
    if (weakAreas.length === 0) {
      return [];
    }

    // Fetch all knowledge base entries
    const allDocuments = await prisma.knowledgeBase.findMany({
      where: subject ? { subject } : undefined,
    });

    // Calculate relevance score for each document
    const scoredDocuments = allDocuments.map((doc) => {
      const relevanceScore = this.calculateRelevanceScore(doc, weakAreas);
      return {
        ...doc,
        relevanceScore,
      };
    });

    // Sort by relevance and return top results
    return scoredDocuments
      .filter((doc) => doc.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Calculate relevance score based on topic matching and keywords
   */
  private static calculateRelevanceScore(
    document: any,
    weakAreas: string[]
  ): number {
    let score = 0;

    // Direct topic match (highest priority)
    weakAreas.forEach((weakArea) => {
      const normalizedWeakArea = weakArea.toLowerCase();
      const normalizedTopic = document.topic.toLowerCase();

      if (normalizedTopic.includes(normalizedWeakArea) || 
          normalizedWeakArea.includes(normalizedTopic)) {
        score += 10;
      }

      // Keyword matching
      document.keywords.forEach((keyword: string) => {
        if (normalizedWeakArea.includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(normalizedWeakArea)) {
          score += 3;
        }
      });

      // Content relevance (check if weak area appears in content)
      if (document.content.toLowerCase().includes(normalizedWeakArea)) {
        score += 2;
      }
    });

    return score;
  }

  /**
   * Generate semantic search query for weak areas
   */
  static generateSearchQuery(weakAreas: string[]): string {
    if (weakAreas.length === 0) return '';
    
    const topics = weakAreas.join(', ');
    return `Explain concepts related to: ${topics}`;
  }

  /**
   * Extract key concepts from knowledge base content
   */
  static extractKeyConcepts(content: string): string[] {
    const concepts: string[] = [];
    
    // Extract text between ** (bold markers)
    const boldMatches = content.match(/\*\*(.*?)\*\*/g);
    if (boldMatches) {
      boldMatches.forEach((match) => {
        const concept = match.replace(/\*\*/g, '').trim();
        if (concept.length > 0) {
          concepts.push(concept);
        }
      });
    }

    // Extract numbered/bulleted items
    const listItems = content.match(/^[\d\-\*]\.\s+(.+)$/gm);
    if (listItems) {
      listItems.forEach((item) => {
        const concept = item.replace(/^[\d\-\*]\.\s+/, '').trim();
        if (concept.length > 0 && concept.length < 100) {
          concepts.push(concept);
        }
      });
    }

    return [...new Set(concepts)].slice(0, 10);
  }

  /**
   * Format recommendations with relevant materials
   */
  static formatRecommendations(
    materials: KnowledgeDocument[],
    weakAreas: string[]
  ): {
    summary: string;
    materials: Array<{
      title: string;
      topic: string;
      difficulty: string;
      preview: string;
      keyConcepts: string[];
    }>;
  } {
    const summary = weakAreas.length > 0
      ? `Based on your performance, we recommend focusing on: ${weakAreas.join(', ')}. Here are curated materials to help you improve:`
      : 'Great job! Here are some materials to further enhance your knowledge:';

    const formattedMaterials = materials.map((material) => ({
      title: material.topic,
      topic: material.topic,
      difficulty: material.difficulty,
      preview: material.content.substring(0, 200) + '...',
      keyConcepts: this.extractKeyConcepts(material.content),
    }));

    return {
      summary,
      materials: formattedMaterials,
    };
  }

  /**
   * Create a personalized study plan
   */
  static createStudyPlan(
    weakAreas: string[],
    materials: KnowledgeDocument[]
  ): Array<{
    day: number;
    focus: string;
    materials: string[];
    activities: string[];
  }> {
    if (weakAreas.length === 0) {
      return [];
    }

    const studyPlan = weakAreas.slice(0, 7).map((area, index) => {
      const relevantMaterials = materials
        .filter((m) => m.topic.toLowerCase().includes(area.toLowerCase()))
        .slice(0, 2)
        .map((m) => m.topic);

      return {
        day: index + 1,
        focus: area,
        materials: relevantMaterials,
        activities: [
          `Read knowledge base material on ${area}`,
          `Practice 5-10 questions on ${area}`,
          `Take notes on key concepts`,
          `Review and summarize your understanding`,
        ],
      };
    });

    return studyPlan;
  }
}