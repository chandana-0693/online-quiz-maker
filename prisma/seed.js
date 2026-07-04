const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create or get default user
  const adminEmail = 'team@quizverse.com';
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    admin = await prisma.user.create({
      data: {
        username: 'QuizVerseTeam',
        email: adminEmail,
        passwordHash: hashedPassword,
        xp: 1500,
        level: 3
      }
    });
    console.log('Admin user created:', admin.username);
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Define initial quizzes
  const initialQuizzes = [
    {
      title: "JavaScript Core Principles",
      description: "Test your understanding of closures, promises, event loop, hoisting, and modern ES6+ features.",
      topic: "Technology",
      difficulty: "Medium",
      duration: 10,
      authorName: admin.username,
      authorId: admin.id,
      questions: [
        {
          text: "What is the correct way to declare a block-scoped variable in modern JavaScript?",
          options: ["var", "let", "define", "global"],
          correctAnswer: 1,
          explanation: "'let' and 'const' are block-scoped declarations introduced in ES6, whereas 'var' is function-scoped."
        },
        {
          text: "Which of the following creates a shallow copy of an array filtered by a condition?",
          options: ["array.map()", "array.forEach()", "array.filter()", "array.reduce()"],
          correctAnswer: 2,
          explanation: "The filter() method creates a new array with all elements that pass the test implemented by the provided function."
        },
        {
          text: "What is the result of evaluates typeof null in JavaScript?",
          options: ["'null'", "'undefined'", "'object'", "'boolean'"],
          correctAnswer: 2,
          explanation: "This is a historical bug in JavaScript. typeof null evaluates to 'object' because of the binary representation of values in initial versions."
        },
        {
          text: "Which function executes a callback after a specified duration (in milliseconds)?",
          options: ["setInterval()", "setTimeout()", "delay()", "wait()"],
          correctAnswer: 1,
          explanation: "setTimeout(callback, duration) schedules a single execution of the callback after the elapsed time."
        },
        {
          text: "What is the state of a Promise when it is initialized and pending resolution?",
          options: ["fulfilled", "rejected", "pending", "resolved"],
          correctAnswer: 2,
          explanation: "A Promise starts in the 'pending' state and later transitions to either 'fulfilled' or 'rejected'."
        }
      ]
    },
    {
      title: "Astronomy & Solar System",
      description: "Embark on a celestial voyage. Test your facts about planetary bodies, stars, and space exploration.",
      topic: "Science",
      difficulty: "Easy",
      duration: 8,
      authorName: admin.username,
      authorId: admin.id,
      questions: [
        {
          text: "Which planet is famously known as the 'Red Planet'?",
          options: ["Venus", "Mars", "Jupiter", "Mercury"],
          correctAnswer: 1,
          explanation: "Mars has a reddish tint due to the iron oxide (rust) covering its surface."
        },
        {
          text: "What is the hottest planet in our solar system?",
          options: ["Mercury", "Venus", "Mars", "Saturn"],
          correctAnswer: 1,
          explanation: "Venus is the hottest planet because its thick carbon dioxide atmosphere traps heat in a runaway greenhouse effect."
        },
        {
          text: "Which galaxy is closest to our Milky Way galaxy?",
          options: ["Andromeda", "Triangulum", "Sombrero", "Centaurus A"],
          correctAnswer: 0,
          explanation: "The Andromeda Galaxy (M31) is the nearest major galaxy to the Milky Way, located about 2.5 million light-years away."
        },
        {
          text: "How long does it take for light from the Sun to reach Earth?",
          options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
          correctAnswer: 1,
          explanation: "Light travels at approx 300,000 km/s, and since the Earth is 150 million km away, it takes roughly 8 minutes and 20 seconds."
        }
      ]
    },
    {
      title: "Major Events of World War II",
      description: "Evaluate your memory of historical battles, key dates, turning points, and political leaders during WWII.",
      topic: "History",
      difficulty: "Hard",
      duration: 12,
      authorName: admin.username,
      authorId: admin.id,
      questions: [
        {
          text: "In which year did World War II officially conclude?",
          options: ["1943", "1944", "1945", "1946"],
          correctAnswer: 2,
          explanation: "WWII ended on September 2, 1945, when Japan signed surrender documents onboard the USS Missouri."
        },
        {
          text: "Who was the British Prime Minister during the majority of World War II?",
          options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"],
          correctAnswer: 1,
          explanation: "Winston Churchill served as UK Prime Minister from 1940 to 1945, steering the country through its wartime crisis."
        },
        {
          text: "What code name was assigned to the Allied invasion of Normandy (D-Day)?",
          options: ["Operation Barbarossa", "Operation Overlord", "Operation Sea Lion", "Operation Torch"],
          correctAnswer: 1,
          explanation: "Operation Overlord was the official code name for the D-Day landings in France on June 6, 1944."
        }
      ]
    },
    {
      title: "Global Geography Masterclass",
      description: "Locate capitals, identify landmarks, and prove your geographic mastery of our world's layout.",
      topic: "Geography",
      difficulty: "Medium",
      duration: 10,
      authorName: admin.username,
      authorId: admin.id,
      questions: [
        {
          text: "What is the capital city of Australia?",
          options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
          correctAnswer: 3,
          explanation: "Canberra was selected as a compromise capital between rivals Sydney and Melbourne in 1908."
        },
        {
          text: "Which river is recognized as the longest in the entire world?",
          options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
          correctAnswer: 1,
          explanation: "Historically, the Nile is classified as the longest at 6,650 km, though some recent studies argue the Amazon holds the title."
        },
        {
          text: "Which country is bordered by both the Atlantic Ocean and the Indian Ocean?",
          options: ["Australia", "India", "South Africa", "Brazil"],
          correctAnswer: 2,
          explanation: "South Africa sits at the southern tip of the African continent, bordering both oceans near Cape Agulhas."
        }
      ]
    }
  ];

  // 3. Seed quizzes and questions
  for (const qData of initialQuizzes) {
    const existing = await prisma.quiz.findFirst({
      where: { title: qData.title }
    });

    if (!existing) {
      const createdQuiz = await prisma.quiz.create({
        data: {
          title: qData.title,
          description: qData.description,
          topic: qData.topic,
          difficulty: qData.difficulty,
          duration: qData.duration,
          authorName: qData.authorName,
          authorId: qData.authorId
        }
      });

      console.log(`Seeded quiz: "${qData.title}"`);

      for (const question of qData.questions) {
        await prisma.question.create({
          data: {
            quizId: createdQuiz.id,
            text: question.text,
            options: JSON.stringify(question.options),
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
          }
        });
      }
    } else {
      console.log(`Quiz "${qData.title}" already exists, skipping.`);
    }
  }

  // 4. Seed initial attempts for admin user
  const adminAttempts = await prisma.attempt.findMany({
    where: { userId: admin.id }
  });

  if (adminAttempts.length === 0) {
    const astronomyQuiz = await prisma.quiz.findFirst({ where: { title: "Astronomy & Solar System" } });
    const jsQuiz = await prisma.quiz.findFirst({ where: { title: "JavaScript Core Principles" } });

    if (astronomyQuiz) {
      await prisma.attempt.create({
        data: {
          userId: admin.id,
          quizId: astronomyQuiz.id,
          quizTitle: astronomyQuiz.title,
          topic: astronomyQuiz.topic,
          score: 4,
          totalQuestions: 4,
          timeTaken: "02:15"
        }
      });
    }

    if (jsQuiz) {
      await prisma.attempt.create({
        data: {
          userId: admin.id,
          quizId: jsQuiz.id,
          quizTitle: jsQuiz.title,
          topic: jsQuiz.topic,
          score: 4,
          totalQuestions: 5,
          timeTaken: "03:40"
        }
      });
    }
    console.log('Seeded initial quiz attempts for admin.');
  }

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
