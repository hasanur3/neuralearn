import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neuralearn.com' },
    update: {},
    create: {
      email: 'admin@neuralearn.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@neuralearn.com' },
    update: {},
    create: {
      email: 'instructor@neuralearn.com',
      name: 'Dr. Sarah Johnson',
      password: hashedPassword,
      role: 'INSTRUCTOR',
    },
  });
  console.log('✅ Instructor created:', instructor.email);

  // Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@neuralearn.com' },
    update: {},
    create: {
      email: 'student@neuralearn.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });
  console.log('✅ Student created:', student.email);

  // Create Quiz 1: Data Structures
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Data Structures Fundamentals',
      description: 'Test your knowledge of basic data structures',
      subject: 'Data Structures',
      difficulty: 'MEDIUM',
      createdBy: instructor.id,
      questions: {
        create: [
          {
            question: 'What is the time complexity of inserting an element at the beginning of a linked list?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
            correctAnswer: 0,
            topic: 'Linked Lists',
          },
          {
            question: 'Which data structure uses LIFO (Last In First Out) principle?',
            options: ['Queue', 'Stack', 'Tree', 'Graph'],
            correctAnswer: 1,
            topic: 'Stack',
          },
          {
            question: 'What is the best case time complexity of Binary Search?',
            options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
            correctAnswer: 1,
            topic: 'Searching Algorithms',
          },
          {
            question: 'In a binary tree, what is the maximum number of nodes at level 3?',
            options: ['4', '8', '16', '32'],
            correctAnswer: 1,
            topic: 'Trees',
          },
          {
            question: 'Which of the following is NOT a linear data structure?',
            options: ['Array', 'Linked List', 'Tree', 'Queue'],
            correctAnswer: 2,
            topic: 'Data Structure Types',
          },
        ],
      },
    },
  });
  console.log('✅ Quiz 1 created:', quiz1.title);

  // Create Quiz 2: Algorithms
  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Algorithm Analysis',
      description: 'Understanding algorithm complexity and optimization',
      subject: 'Algorithms',
      difficulty: 'HARD',
      createdBy: instructor.id,
      questions: {
        create: [
          {
            question: 'What is the time complexity of Merge Sort?',
            options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
            correctAnswer: 1,
            topic: 'Sorting Algorithms',
          },
          {
            question: 'Which algorithm uses a divide-and-conquer approach?',
            options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
            correctAnswer: 2,
            topic: 'Algorithm Paradigms',
          },
          {
            question: 'What is the space complexity of recursive algorithms primarily dependent on?',
            options: ['Input size', 'Recursion depth', 'Number of variables', 'Loop iterations'],
            correctAnswer: 1,
            topic: 'Space Complexity',
          },
          {
            question: 'Which of these problems is NP-Complete?',
            options: ['Binary Search', 'Matrix Multiplication', 'Traveling Salesman Problem', 'Merge Sort'],
            correctAnswer: 2,
            topic: 'Computational Complexity',
          },
          {
            question: 'Dynamic Programming is based on which principle?',
            options: ['Greedy Choice', 'Divide and Conquer', 'Memoization', 'Backtracking'],
            correctAnswer: 2,
            topic: 'Dynamic Programming',
          },
        ],
      },
    },
  });
  console.log('✅ Quiz 2 created:', quiz2.title);

  // Create Knowledge Base entries
  const kb1 = await prisma.knowledgeBase.create({
    data: {
      topic: 'Linked Lists',
      subject: 'Data Structures',
      difficulty: 'MEDIUM',
      keywords: ['linked list', 'nodes', 'pointers', 'insertion', 'deletion'],
      content: `Linked Lists are linear data structures where elements are stored in nodes. Each node contains data and a reference (pointer) to the next node.

**Types of Linked Lists:**
1. Singly Linked List - Each node points to the next node
2. Doubly Linked List - Each node has pointers to both next and previous nodes
3. Circular Linked List - Last node points back to the first node

**Time Complexities:**
- Insertion at beginning: O(1)
- Insertion at end: O(n) for singly, O(1) for doubly with tail pointer
- Deletion: O(1) if node is given, O(n) to search
- Search: O(n)

**Advantages:**
- Dynamic size
- Efficient insertions/deletions
- No memory waste

**Disadvantages:**
- Random access not possible
- Extra memory for pointers
- Not cache friendly`,
    },
  });

  const kb2 = await prisma.knowledgeBase.create({
    data: {
      topic: 'Stack',
      subject: 'Data Structures',
      difficulty: 'EASY',
      keywords: ['stack', 'LIFO', 'push', 'pop', 'peek'],
      content: `A Stack is a linear data structure that follows the Last In First Out (LIFO) principle.

**Basic Operations:**
1. Push - Add element to top (O(1))
2. Pop - Remove element from top (O(1))
3. Peek/Top - View top element without removing (O(1))
4. isEmpty - Check if stack is empty (O(1))

**Applications:**
- Function call management (call stack)
- Expression evaluation
- Backtracking algorithms
- Undo/Redo functionality
- Browser history

**Implementation Methods:**
1. Array-based implementation
2. Linked list-based implementation

**Example Use Cases:**
- Balanced parentheses checking
- Postfix expression evaluation
- Depth-First Search (DFS)
- Tower of Hanoi`,
    },
  });

  const kb3 = await prisma.knowledgeBase.create({
    data: {
      topic: 'Sorting Algorithms',
      subject: 'Algorithms',
      difficulty: 'HARD',
      keywords: ['sorting', 'merge sort', 'quick sort', 'time complexity', 'comparison'],
      content: `Sorting algorithms arrange elements in a specific order (ascending or descending).

**Comparison-based Sorting:**

1. **Merge Sort**
   - Time: O(n log n) in all cases
   - Space: O(n)
   - Stable, Divide-and-conquer
   - Best for linked lists

2. **Quick Sort**
   - Time: O(n log n) average, O(n²) worst
   - Space: O(log n)
   - Not stable, Divide-and-conquer
   - In-place sorting

3. **Heap Sort**
   - Time: O(n log n) in all cases
   - Space: O(1)
   - Not stable, uses heap data structure

**Simple Sorting (O(n²)):**
- Bubble Sort
- Selection Sort
- Insertion Sort (efficient for small/nearly sorted data)

**Choosing the Right Algorithm:**
- Small datasets: Insertion Sort
- General purpose: Quick Sort or Merge Sort
- Guaranteed O(n log n): Merge Sort or Heap Sort
- Limited memory: Heap Sort`,
    },
  });

  const kb4 = await prisma.knowledgeBase.create({
    data: {
      topic: 'Trees',
      subject: 'Data Structures',
      difficulty: 'HARD',
      keywords: ['tree', 'binary tree', 'BST', 'traversal', 'height'],
      content: `Trees are hierarchical data structures with a root node and child nodes forming parent-child relationships.

**Binary Tree Properties:**
- Maximum nodes at level L: 2^L
- Maximum nodes in tree of height h: 2^(h+1) - 1
- Minimum height with n nodes: log₂(n+1) - 1

**Types of Binary Trees:**
1. Full Binary Tree - Every node has 0 or 2 children
2. Complete Binary Tree - All levels filled except possibly last
3. Perfect Binary Tree - All internal nodes have 2 children, leaves at same level
4. Binary Search Tree (BST) - Left < Root < Right

**Tree Traversals:**
1. Inorder (Left-Root-Right) - gives sorted order in BST
2. Preorder (Root-Left-Right) - useful for copying tree
3. Postorder (Left-Right-Root) - useful for deleting tree
4. Level Order - BFS approach

**Applications:**
- File systems
- Database indexing (B-trees)
- Expression parsing
- Decision making (Decision Trees)`,
    },
  });

  const kb5 = await prisma.knowledgeBase.create({
    data: {
      topic: 'Dynamic Programming',
      subject: 'Algorithms',
      difficulty: 'HARD',
      keywords: ['dynamic programming', 'memoization', 'optimization', 'subproblems'],
      content: `Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them into simpler overlapping subproblems.

**Key Principles:**
1. **Optimal Substructure** - Optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems** - Same subproblems solved multiple times

**Approaches:**

1. **Memoization (Top-Down)**
   - Recursive approach
   - Store results of subproblems
   - Solve on demand

2. **Tabulation (Bottom-Up)**
   - Iterative approach
   - Build table from base cases
   - Solve all subproblems

**Classic DP Problems:**
- Fibonacci sequence
- Longest Common Subsequence (LCS)
- 0/1 Knapsack Problem
- Matrix Chain Multiplication
- Edit Distance
- Coin Change Problem

**Steps to Solve DP:**
1. Identify if problem has optimal substructure
2. Define state and recurrence relation
3. Identify base cases
4. Decide between memoization or tabulation
5. Implement and optimize space if possible`,
    },
  });

  console.log('✅ Knowledge Base entries created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@neuralearn.com / password123');
  console.log('Instructor: instructor@neuralearn.com / password123');
  console.log('Student: student@neuralearn.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });