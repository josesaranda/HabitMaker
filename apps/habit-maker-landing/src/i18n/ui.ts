export type Lang = 'en' | 'es';

export const defaultLang: Lang = 'en';

export const languages: Record<Lang, string> = {
  en: 'English',
  es: 'Español',
};

export interface LandingCopy {
  title: string;
  description: string;
  skip: string;
  navLabel: string;
  navWhy: string;
  navScreenshots: string;
  navDocker: string;
  languageLabel: string;
  switchToEnglish: string;
  switchToSpanish: string;
  viewGithub: string;
  githubShort: string;
  heroTag: string;
  heroHeadingFirst: string;
  heroHeadingSecond: string;
  heroHighlight: string;
  heroDescription: string;
  heroImageAlt: string;
  startDocker: string;
  explore: string;
  openSource: string;
  selfHostable: string;
  littleAddsUp: string;
  daysShowingUp: string;
  oneDayAtATime: string;
  yourProgress: string;
  proofOne: string;
  proofTwo: string;
  whyEyebrow: string;
  whyHeading: string;
  features: { title: string; description: string }[];
  screenshotsEyebrow: string;
  screenshotsHeading: string;
  screenshotsIntro: string;
  screenshotsNote: string;
  previews: {
    title: string;
    description: string;
    alt: string;
  }[];
  dockerEyebrow: string;
  dockerHeading: string;
  dockerDescription: string;
  dockerPrerequisites: string;
  dockerRequirements: string;
  dockerSteps: { title: string; description: string }[];
  readSetupGuide: string;
  contributeEyebrow: string;
  contributeHeading: string;
  contributeDescription: string;
  openIssue: string;
  submitPullRequest: string;
  notSureWhereToStart: string;
  openIssues: string;
  joinConversation: string;
  readReadme: string;
  footerMadeWithCare: string;
  repository: string;
  license: string;
  backToTop: string;
}

export const ui: Record<Lang, LandingCopy> = {
  en: {
    title: 'HabitMaker — Small habits, meaningful change',
    description:
      'An open-source habit tracker to help you build healthy habits, one day at a time.',
    skip: 'Skip to content',
    navLabel: 'Main navigation',
    navWhy: 'Why HabitMaker',
    navScreenshots: 'Screenshots',
    navDocker: 'Get started',
    languageLabel: 'Language',
    switchToEnglish: 'Switch language to English',
    switchToSpanish: 'Switch language to Spanish',
    viewGithub: 'View on GitHub',
    githubShort: 'GitHub',
    heroTag: 'Your open-source habit companion',
    heroHeadingFirst: 'Small habits.',
    heroHeadingSecond: 'Meaningful',
    heroHighlight: 'change',
    heroDescription:
      'Build a life that feels a little more like yours. Track the habits that matter, celebrate each day you show up, and let progress grow at its own pace.',
    heroImageAlt:
      'HabitMaker preview: your habits and the days you completed them, all in one calm home screen.',
    startDocker: 'Get started with Docker',
    explore: 'Take a look around',
    openSource: 'Free and open source',
    selfHostable: 'Open source and self-hostable',
    littleAddsUp: 'A little adds up',
    daysShowingUp: '7 days of showing up',
    oneDayAtATime: 'One day at a time',
    yourProgress: 'Your pace. Your progress.',
    proofOne: 'Made for real life, not perfect streaks',
    proofTwo: 'Built in the open, with care',
    whyEyebrow: 'A gentler kind of progress',
    whyHeading: 'Good habits grow from the days you do show up.',
    features: [
      {
        title: 'Make room for what matters',
        description:
          'Choose healthy routines that fit your life, from reading and movement to moments of rest.',
      },
      {
        title: 'Notice the progress',
        description:
          'Mark each day and revisit your calendar to see steady effort—not a demand for perfection.',
      },
      {
        title: 'A nudge, when you need one',
        description:
          'Optional daily web push reminders help your intentions find a place in your day.',
      },
      {
        title: 'Open source, by nature',
        description:
          'HabitMaker is built in public. Explore the code, share an idea, or help shape what comes next.',
      },
    ],
    screenshotsEyebrow: 'A peek inside',
    screenshotsHeading: 'Simple tools for the long game.',
    screenshotsIntro:
      'A little structure, a little encouragement, and plenty of room to find your own rhythm.',
    screenshotsNote:
      'Illustrative previews of HabitMaker’s current home, habit calendar, and reminder settings.',
    previews: [
      {
        title: 'A home for your habits',
        description: 'See your daily routines and the small wins that add up.',
        alt: 'Illustrative app preview showing a home screen with a reading habit and weekly progress.',
      },
      {
        title: 'Progress you can look back on',
        description: 'A calm calendar makes your consistency easy to spot.',
        alt: 'Illustrative app preview showing a habit calendar with completed days highlighted.',
      },
      {
        title: 'Reminders on your terms',
        description:
          'Set a daily nudge for each habit, right in your local time.',
        alt: 'Illustrative app preview showing daily reminder settings for a habit.',
      },
    ],
    dockerEyebrow: 'Your own little garden',
    dockerHeading: 'Up and growing in a few steps.',
    dockerDescription:
      'Run HabitMaker on your machine with Docker Compose. The stack includes the web app, API, and PostgreSQL database.',
    dockerPrerequisites: 'Before you begin',
    dockerRequirements:
      'Install Docker with the Docker Compose plugin. Use a unique, random JWT_SECRET and a strong POSTGRES_PASSWORD in your .env file. To create an initial admin account, also set both ADMIN_EMAIL and ADMIN_PASSWORD.',
    dockerSteps: [
      {
        title: 'Install Docker',
        description:
          'Get Docker Desktop or Docker Engine with the Docker Compose plugin.',
      },
      {
        title: 'Clone and configure',
        description:
          'Clone the repository, copy the example environment file, then set your secrets.',
      },
      {
        title: 'Build and start',
        description:
          'Build the images and run the app with its API and database.',
      },
      {
        title: 'Make it yours',
        description:
          'Open the app and start shaping a routine that feels right for you.',
      },
    ],
    readSetupGuide: 'Read the full setup guide',
    contributeEyebrow: 'Good things grow together',
    contributeHeading: 'Have an idea? There’s room to grow.',
    contributeDescription:
      'Try HabitMaker, report a bug, or help build the next small improvement. Contributions of every size are welcome.',
    openIssue: 'Open an issue',
    submitPullRequest: 'Submit a pull request',
    notSureWhereToStart: 'Not sure where to start? Browse the',
    openIssues: 'open issues',
    joinConversation: 'or join the conversation.',
    readReadme: 'Read the project README',
    footerMadeWithCare: 'Made with care, one day at a time.',
    repository: 'GitHub repository',
    license: 'MIT License',
    backToTop: 'Back to top ↑',
  },
  es: {
    title: 'HabitMaker — Pequeños hábitos, grandes cambios',
    description:
      'Un registro de hábitos de código abierto para ayudarte a crear rutinas saludables, un día a la vez.',
    skip: 'Saltar al contenido',
    navLabel: 'Navegación principal',
    navWhy: 'Por qué HabitMaker',
    navScreenshots: 'Capturas',
    navDocker: 'Cómo empezar',
    languageLabel: 'Idioma',
    switchToEnglish: 'Cambiar idioma a inglés',
    switchToSpanish: 'Cambiar idioma a español',
    viewGithub: 'Ver en GitHub',
    githubShort: 'GitHub',
    heroTag: 'Tu compañero de hábitos de código abierto',
    heroHeadingFirst: 'Pequeños hábitos.',
    heroHeadingSecond: 'Cambios que',
    heroHighlight: 'importan',
    heroDescription:
      'Construye una vida que se parezca un poco más a ti. Sigue los hábitos que te importan, celebra cada día que lo intentas y deja que el progreso crezca a su ritmo.',
    heroImageAlt:
      'Vista previa de HabitMaker: tus hábitos y los días que has completado, reunidos en una pantalla de inicio tranquila.',
    startDocker: 'Empieza con Docker',
    explore: 'Echa un vistazo',
    openSource: 'Gratis y de código abierto',
    selfHostable: 'Código abierto y autohospedable',
    littleAddsUp: 'Cada paso cuenta',
    daysShowingUp: '7 días dando lo mejor de ti',
    oneDayAtATime: 'Un día a la vez',
    yourProgress: 'A tu ritmo. A tu manera.',
    proofOne: 'Para la vida real, no para rachas perfectas',
    proofTwo: 'Creado en abierto y con cariño',
    whyEyebrow: 'Una forma más amable de avanzar',
    whyHeading: 'Los buenos hábitos crecen cada vez que vuelves a intentarlo.',
    features: [
      {
        title: 'Haz espacio para lo que importa',
        description:
          'Elige rutinas saludables que encajen en tu vida: leer, moverte o tomarte un momento para descansar.',
      },
      {
        title: 'Mira todo lo que avanzas',
        description:
          'Marca cada día y vuelve a tu calendario para ver tu constancia, sin exigirte perfección.',
      },
      {
        title: 'Un recordatorio cuando lo necesites',
        description:
          'Activa avisos web diarios opcionales para hacerle un hueco a tus propósitos.',
      },
      {
        title: 'Código abierto, por naturaleza',
        description:
          'HabitMaker se construye a la vista de todos. Explora el código, comparte una idea o ayuda a decidir qué sigue.',
      },
    ],
    screenshotsEyebrow: 'Un vistazo por dentro',
    screenshotsHeading: 'Herramientas sencillas para avanzar a largo plazo.',
    screenshotsIntro:
      'Un poco de estructura, un poco de ánimo y mucho espacio para encontrar tu propio ritmo.',
    screenshotsNote:
      'Vistas ilustrativas del inicio, el calendario de hábitos y los ajustes de recordatorios de HabitMaker.',
    previews: [
      {
        title: 'Un espacio para tus hábitos',
        description:
          'Consulta tus rutinas diarias y celebra cada pequeño logro.',
        alt: 'Vista ilustrativa del inicio con un hábito de lectura y el progreso semanal.',
      },
      {
        title: 'Un progreso que puedes repasar',
        description:
          'El calendario te ayuda a reconocer tu constancia de un vistazo.',
        alt: 'Vista ilustrativa del calendario de un hábito con los días completados resaltados.',
      },
      {
        title: 'Recordatorios a tu manera',
        description:
          'Programa un aviso diario para cada hábito en tu hora local.',
        alt: 'Vista ilustrativa de los ajustes de recordatorios diarios de un hábito.',
      },
    ],
    dockerEyebrow: 'Tu propio espacio para crecer',
    dockerHeading: 'En marcha en unos pocos pasos.',
    dockerDescription:
      'Ejecuta HabitMaker en tu equipo con Docker Compose. El entorno incluye la aplicación web, la API y una base de datos PostgreSQL.',
    dockerPrerequisites: 'Antes de empezar',
    dockerRequirements:
      'Instala Docker con el complemento Docker Compose. En el archivo .env, configura un JWT_SECRET aleatorio y único y una POSTGRES_PASSWORD segura. Para crear una cuenta administradora inicial, configura también ADMIN_EMAIL y ADMIN_PASSWORD.',
    dockerSteps: [
      {
        title: 'Instala Docker',
        description:
          'Instala Docker Desktop o Docker Engine con el complemento Docker Compose.',
      },
      {
        title: 'Clona y configura',
        description:
          'Clona el repositorio, copia el archivo de ejemplo y configura tus secretos.',
      },
      {
        title: 'Construye e inicia',
        description:
          'Construye las imágenes e inicia la aplicación, la API y la base de datos.',
      },
      {
        title: 'Empieza a crear tus hábitos',
        description: 'Abre la aplicación y crea una rutina que encaje contigo.',
      },
    ],
    readSetupGuide: 'Consulta la guía completa de instalación',
    contributeEyebrow: 'Las cosas buenas crecen en comunidad',
    contributeHeading: '¿Tienes una idea? Hagámosla crecer.',
    contributeDescription:
      'Prueba HabitMaker, informa de un error o ayuda a crear la próxima mejora. Todas las contribuciones son bienvenidas.',
    openIssue: 'Abre una incidencia',
    submitPullRequest: 'Envía una pull request',
    notSureWhereToStart: '¿No sabes por dónde empezar? Echa un vistazo a las',
    openIssues: 'incidencias abiertas',
    joinConversation: 'o únete a la conversación.',
    readReadme: 'Lee el README del proyecto',
    footerMadeWithCare: 'Creado con cariño, un día a la vez.',
    repository: 'Repositorio en GitHub',
    license: 'Licencia MIT',
    backToTop: 'Volver arriba ↑',
  },
};
