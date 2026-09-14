/**
 * English translation catalogue.
 *
 * This is the source of truth for every user-visible string. Components must
 * never hard-code copy — always go through `useTranslation()` / `getTranslator()`.
 */
export const en = {
  'app.name': 'AI FormMate',
  'app.tagline': 'Government Exam Forms — Easier, Faster, Smarter.',
  'app.positioning': 'AI-powered government application assistant.',
  'app.subPositioning': 'Your profile. Your documents. Smarter applications.',

  'common.loading': 'Loading…',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.continue': 'Continue',
  'common.back': 'Back',
  'common.retry': 'Try again',
  'common.close': 'Close',
  'common.optional': 'Optional',
  'common.required': 'Required',
  'common.notAvailable': 'Not available',
  'common.viewAll': 'View all',
  'common.comingSoon': 'Coming soon',
  'common.comingSoonBody':
    'This area is planned for a later development phase. Nothing here is functional yet.',
  'common.skipToContent': 'Skip to main content',
  'common.language': 'Language',
  'common.menu': 'Menu',
  'common.openMenu': 'Open navigation menu',
  'common.closeMenu': 'Close navigation menu',

  'nav.dashboard': 'Dashboard',
  'nav.applications': 'Applications',
  'nav.exams': 'Exams',
  'nav.profile': 'My Profile',
  'nav.documents': 'Documents',
  'nav.photoSignature': 'Photo & Signature',
  'nav.pdfTools': 'PDF Tools',
  'nav.screenshots': 'Screenshots',
  'nav.notifications': 'Notifications',
  'nav.settings': 'Settings',
  'nav.help': 'Help',
  'nav.signOut': 'Sign out',
  'nav.primary': 'Primary navigation',

  'auth.signIn': 'Sign in',
  'auth.signUp': 'Create account',
  'auth.signInTitle': 'Sign in to AI FormMate',
  'auth.signInSubtitle': 'Save your details once, reuse them for every application.',
  'auth.signUpTitle': 'Create your AI FormMate account',
  'auth.signUpSubtitle': 'Free to start. Your documents stay private to your account.',
  'auth.email': 'Email address',
  'auth.password': 'Password',
  'auth.fullName': 'Full name',
  'auth.passwordHint': 'At least 8 characters, including a letter and a number.',
  'auth.haveAccount': 'Already have an account?',
  'auth.noAccount': 'New to AI FormMate?',
  'auth.checkEmail': 'Check your email',
  'auth.checkEmailBody':
    'We sent a confirmation link to your email address. Open it to activate your account.',
  'auth.signedOut': 'You have been signed out.',
  'auth.errorGeneric': 'We could not complete that request. Please try again.',
  'auth.errorInvalidCredentials': 'That email or password did not match. Please check and retry.',
  'auth.errorEmailTaken': 'An account already exists for this email address.',
  'auth.notConfigured': 'Sign-in is unavailable',
  'auth.notConfiguredBody':
    'This deployment has no Supabase credentials configured yet. Add them to your environment file and restart.',
  'auth.consent':
    'By continuing you agree that your details are stored securely so you can reuse them across applications.',

  'dashboard.title': 'Dashboard',
  'dashboard.greeting': 'Welcome back',
  'dashboard.greetingAnonymous': 'Welcome',
  'dashboard.subtitle': 'Everything you need for your next government application.',
  'dashboard.quickActions': 'Quick actions',
  'dashboard.action.newApplication': 'New application',
  'dashboard.action.uploadDocument': 'Upload document',
  'dashboard.action.preparePhoto': 'Prepare photo',
  'dashboard.action.prepareSignature': 'Prepare signature',
  'dashboard.action.scanDocument': 'Scan document',
  'dashboard.action.createPdf': 'Create PDF',
  'dashboard.summary': 'Application summary',
  'dashboard.upcoming': 'Upcoming',
  'dashboard.upcomingEmpty': 'No deadlines or exam dates recorded yet.',
  'dashboard.recent': 'Recent applications',
  'dashboard.recentEmpty': 'You have not started an application yet.',
  'dashboard.recentEmptyBody':
    'Start by completing your candidate profile, then add your first exam application.',
  'dashboard.profileCompletion': 'Profile completion',
  'dashboard.profileCompletionBody': 'Complete your profile to speed up every future application.',
  'dashboard.completeProfile': 'Complete profile',

  'status.draft': 'Draft',
  'status.preparing': 'Preparing',
  'status.in_progress': 'In progress',
  'status.review_required': 'Review required',
  'status.payment_pending': 'Payment pending',
  'status.submitted': 'Submitted',
  'status.failed': 'Failed',
  'status.correction_required': 'Correction required',
  'status.completed': 'Completed',

  'application.number': 'Application number',
  'application.exam': 'Exam',
  'application.post': 'Post',
  'application.date': 'Application date',
  'application.deadline': 'Deadline',
  'application.documents': 'Documents',
  'application.pdf': 'PDF',
  'application.screenshot': 'Screenshot',

  'upcoming.deadline': 'Application deadline',
  'upcoming.examDate': 'Exam date',
  'upcoming.admitCard': 'Admit card',
  'upcoming.update': 'Important update',

  'trust.officialSource': 'Official source',
  'trust.aiInterpretation': 'AI interpretation',
  'trust.userEntered': 'You entered this',
  'trust.verifyNotice': 'Verify with the official notification before submission.',
  'trust.notFound': 'Not found / requires manual verification.',
  'trust.eligibilityNotice':
    'Final eligibility is decided by the official recruitment notification, not by this app.',

  'safety.manualStep': 'Please complete this step manually.',
  'safety.otpRequired': 'OTP required. Enter the OTP manually.',
  'safety.captchaRequired': 'CAPTCHA requires manual completion.',
  'safety.neverSubmitSilently': 'AI FormMate never submits an application without your approval.',

  'landing.heroTitle': 'Government exam forms — easier, faster, smarter.',
  'landing.heroBody':
    'Save your profile, education and documents once. AI FormMate helps you prepare each application accurately — you stay in control of OTP, CAPTCHA, payment and final submission.',
  'landing.ctaPrimary': 'Get started free',
  'landing.ctaSecondary': 'Sign in',
  'landing.hindiPositioning': 'एक बार जानकारी सुरक्षित करें, सरकारी आवेदन आसान बनाएं।',
  'landing.feature.profileTitle': 'Enter your details once',
  'landing.feature.profileBody':
    'Personal details, addresses, category and full education history — reusable for every form.',
  'landing.feature.vaultTitle': 'Private document vault',
  'landing.feature.vaultBody':
    'Certificates and marksheets stored in private storage, reachable only through short-lived signed links.',
  'landing.feature.mediaTitle': 'Photo & signature assistant',
  'landing.feature.mediaBody':
    'Crop, resize and compress to the exact size an exam requires — processed in your browser.',
  'landing.feature.checksTitle': 'Checks before you submit',
  'landing.feature.checksBody':
    'A clear checklist of what is missing, plus a final review screen you must approve yourself.',
  'landing.safetyTitle': 'What AI FormMate will never do',
  'landing.safety.captcha': 'Solve or bypass CAPTCHA, OTP or multi-factor authentication.',
  'landing.safety.payment': 'Store payment credentials or automate payment authentication.',
  'landing.safety.submit': 'Submit an application without your explicit approval.',
  'landing.safety.identity': 'Generate or alter your photograph or signature identity.',
  'landing.disclaimer':
    'AI FormMate is an application assistant. It does not claim support for every government website, and information extracted by AI must always be verified against the official notification.',

  'help.title': 'Help',
  'help.body':
    'AI FormMate helps you prepare government exam applications. You always complete OTP, CAPTCHA, payment and final submission yourself.',

  'error.title': 'Something went wrong',
  'error.body': 'We could not complete that action. Please try again in a moment.',
  'error.notFoundTitle': 'Page not found',
  'error.notFoundBody': 'The page you were looking for does not exist or has moved.',
  'error.backToDashboard': 'Back to dashboard',
  'error.backToHome': 'Back to home',
} as const;

export type TranslationKey = keyof typeof en;
