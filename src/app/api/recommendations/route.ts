import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { RAGSystem } from '@/lib/rag';

// GET personalized recommendations based on weak areas
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weakAreasParam = searchParams.get('weakAreas');
    const subject = searchParams.get('subject') || undefined;
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!weakAreasParam) {
      return NextResponse.json(
        { error: 'Weak areas parameter is required' },
        { status: 400 }
      );
    }

    const weakAreas = weakAreasParam.split(',').map((area) => area.trim());

    // Retrieve relevant materials using RAG
    const materials = await RAGSystem.retrieveRelevantMaterials(
      weakAreas,
      subject,
      limit
    );

    // Format recommendations
    const formattedRecommendations = RAGSystem.formatRecommendations(
      materials,
      weakAreas
    );

    // Create personalized study plan
    const studyPlan = RAGSystem.createStudyPlan(weakAreas, materials);

    // Generate search query for additional resources
    const searchQuery = RAGSystem.generateSearchQuery(weakAreas);

    return NextResponse.json({
      weakAreas,
      summary: formattedRecommendations.summary,
      materials: formattedRecommendations.materials,
      studyPlan,
      searchQuery,
      totalMaterialsFound: materials.length,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}