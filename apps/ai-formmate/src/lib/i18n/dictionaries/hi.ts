import type { TranslationKey } from './en';

/**
 * Hindi translation catalogue.
 *
 * Typed as a complete record so a missing key fails type checking rather than
 * silently falling back at runtime.
 */
export const hi: Record<TranslationKey, string> = {
  'app.name': 'AI FormMate',
  'app.tagline': 'सरकारी परीक्षा फॉर्म — आसान, तेज़, स्मार्ट।',
  'app.positioning': 'AI-संचालित सरकारी आवेदन सहायक।',
  'app.subPositioning': 'आपकी जानकारी। आपके दस्तावेज़। स्मार्ट आवेदन।',

  'common.loading': 'लोड हो रहा है…',
  'common.save': 'सहेजें',
  'common.cancel': 'रद्द करें',
  'common.continue': 'आगे बढ़ें',
  'common.back': 'वापस',
  'common.retry': 'फिर कोशिश करें',
  'common.close': 'बंद करें',
  'common.optional': 'वैकल्पिक',
  'common.required': 'आवश्यक',
  'common.notAvailable': 'उपलब्ध नहीं',
  'common.viewAll': 'सभी देखें',
  'common.comingSoon': 'जल्द आ रहा है',
  'common.comingSoonBody': 'यह भाग आगे के चरण में बनाया जाएगा। अभी यह कार्यशील नहीं है।',
  'common.skipToContent': 'मुख्य सामग्री पर जाएँ',
  'common.language': 'भाषा',
  'common.menu': 'मेन्यू',
  'common.openMenu': 'नेविगेशन मेन्यू खोलें',
  'common.closeMenu': 'नेविगेशन मेन्यू बंद करें',

  'nav.dashboard': 'डैशबोर्ड',
  'nav.applications': 'आवेदन',
  'nav.exams': 'परीक्षाएँ',
  'nav.profile': 'मेरी प्रोफ़ाइल',
  'nav.documents': 'दस्तावेज़',
  'nav.photoSignature': 'फ़ोटो और हस्ताक्षर',
  'nav.pdfTools': 'PDF टूल',
  'nav.screenshots': 'स्क्रीनशॉट',
  'nav.notifications': 'सूचनाएँ',
  'nav.settings': 'सेटिंग्स',
  'nav.help': 'सहायता',
  'nav.signOut': 'साइन आउट',
  'nav.primary': 'मुख्य नेविगेशन',

  'auth.signIn': 'साइन इन',
  'auth.signUp': 'खाता बनाएँ',
  'auth.signInTitle': 'AI FormMate में साइन इन करें',
  'auth.signInSubtitle': 'जानकारी एक बार सहेजें, हर आवेदन में दोबारा उपयोग करें।',
  'auth.signUpTitle': 'अपना AI FormMate खाता बनाएँ',
  'auth.signUpSubtitle': 'शुरू करना निःशुल्क है। आपके दस्तावेज़ केवल आपके खाते तक सीमित रहते हैं।',
  'auth.email': 'ईमेल पता',
  'auth.password': 'पासवर्ड',
  'auth.fullName': 'पूरा नाम',
  'auth.passwordHint': 'कम से कम 8 अक्षर, जिनमें एक अक्षर और एक अंक हो।',
  'auth.haveAccount': 'पहले से खाता है?',
  'auth.noAccount': 'AI FormMate पर नए हैं?',
  'auth.checkEmail': 'अपना ईमेल देखें',
  'auth.checkEmailBody': 'हमने आपके ईमेल पते पर पुष्टि लिंक भेजा है। खाता सक्रिय करने के लिए उसे खोलें।',
  'auth.signedOut': 'आप साइन आउट हो चुके हैं।',
  'auth.errorGeneric': 'हम यह अनुरोध पूरा नहीं कर सके। कृपया फिर कोशिश करें।',
  'auth.errorInvalidCredentials': 'यह ईमेल या पासवर्ड मेल नहीं खाया। कृपया जाँचकर फिर कोशिश करें।',
  'auth.errorEmailTaken': 'इस ईमेल पते के लिए खाता पहले से मौजूद है।',
  'auth.notConfigured': 'साइन-इन अभी उपलब्ध नहीं है',
  'auth.notConfiguredBody':
    'इस परिनियोजन में अभी Supabase क्रेडेंशियल कॉन्फ़िगर नहीं हैं। इन्हें environment फ़ाइल में जोड़कर पुनः प्रारंभ करें।',
  'auth.consent':
    'आगे बढ़ने पर आप सहमत हैं कि आपकी जानकारी सुरक्षित रूप से सहेजी जाए ताकि आप इसे कई आवेदनों में उपयोग कर सकें।',

  'dashboard.title': 'डैशबोर्ड',
  'dashboard.greeting': 'वापसी पर स्वागत है',
  'dashboard.greetingAnonymous': 'स्वागत है',
  'dashboard.subtitle': 'आपके अगले सरकारी आवेदन के लिए ज़रूरी सब कुछ।',
  'dashboard.quickActions': 'त्वरित कार्य',
  'dashboard.action.newApplication': 'नया आवेदन',
  'dashboard.action.uploadDocument': 'दस्तावेज़ अपलोड करें',
  'dashboard.action.preparePhoto': 'फ़ोटो तैयार करें',
  'dashboard.action.prepareSignature': 'हस्ताक्षर तैयार करें',
  'dashboard.action.scanDocument': 'दस्तावेज़ स्कैन करें',
  'dashboard.action.createPdf': 'PDF बनाएँ',
  'dashboard.summary': 'आवेदन सारांश',
  'dashboard.upcoming': 'आगामी',
  'dashboard.upcomingEmpty': 'अभी कोई अंतिम तिथि या परीक्षा तिथि दर्ज नहीं है।',
  'dashboard.recent': 'हाल के आवेदन',
  'dashboard.recentEmpty': 'आपने अभी तक कोई आवेदन शुरू नहीं किया है।',
  'dashboard.recentEmptyBody':
    'पहले अपनी उम्मीदवार प्रोफ़ाइल पूरी करें, फिर अपना पहला परीक्षा आवेदन जोड़ें।',
  'dashboard.profileCompletion': 'प्रोफ़ाइल पूर्णता',
  'dashboard.profileCompletionBody': 'हर आगामी आवेदन तेज़ बनाने के लिए अपनी प्रोफ़ाइल पूरी करें।',
  'dashboard.completeProfile': 'प्रोफ़ाइल पूरी करें',

  'status.draft': 'ड्राफ़्ट',
  'status.preparing': 'तैयारी में',
  'status.in_progress': 'प्रगति पर',
  'status.review_required': 'समीक्षा आवश्यक',
  'status.payment_pending': 'भुगतान शेष',
  'status.submitted': 'जमा किया गया',
  'status.failed': 'असफल',
  'status.correction_required': 'सुधार आवश्यक',
  'status.completed': 'पूर्ण',

  'application.number': 'आवेदन संख्या',
  'application.exam': 'परीक्षा',
  'application.post': 'पद',
  'application.date': 'आवेदन तिथि',
  'application.deadline': 'अंतिम तिथि',
  'application.documents': 'दस्तावेज़',
  'application.pdf': 'PDF',
  'application.screenshot': 'स्क्रीनशॉट',

  'upcoming.deadline': 'आवेदन की अंतिम तिथि',
  'upcoming.examDate': 'परीक्षा तिथि',
  'upcoming.admitCard': 'प्रवेश पत्र',
  'upcoming.update': 'महत्वपूर्ण अपडेट',

  'trust.officialSource': 'आधिकारिक स्रोत',
  'trust.aiInterpretation': 'AI व्याख्या',
  'trust.userEntered': 'आपके द्वारा दर्ज',
  'trust.verifyNotice': 'जमा करने से पहले आधिकारिक अधिसूचना से जाँच करें।',
  'trust.notFound': 'नहीं मिला / मैन्युअल सत्यापन आवश्यक।',
  'trust.eligibilityNotice':
    'अंतिम पात्रता आधिकारिक भर्ती अधिसूचना से तय होती है, इस ऐप से नहीं।',

  'safety.manualStep': 'कृपया यह चरण स्वयं पूरा करें।',
  'safety.otpRequired': 'OTP आवश्यक है। OTP स्वयं दर्ज करें।',
  'safety.captchaRequired': 'CAPTCHA स्वयं पूरा करना आवश्यक है।',
  'safety.neverSubmitSilently': 'AI FormMate आपकी स्वीकृति के बिना कोई आवेदन जमा नहीं करता।',

  'landing.heroTitle': 'सरकारी परीक्षा फॉर्म — आसान, तेज़, स्मार्ट।',
  'landing.heroBody':
    'अपनी प्रोफ़ाइल, शिक्षा और दस्तावेज़ एक बार सहेजें। AI FormMate हर आवेदन सही ढंग से तैयार करने में मदद करता है — OTP, CAPTCHA, भुगतान और अंतिम सबमिशन आपके नियंत्रण में रहते हैं।',
  'landing.ctaPrimary': 'निःशुल्क शुरू करें',
  'landing.ctaSecondary': 'साइन इन',
  'landing.hindiPositioning': 'एक बार जानकारी सुरक्षित करें, सरकारी आवेदन आसान बनाएं।',
  'landing.feature.profileTitle': 'जानकारी एक बार भरें',
  'landing.feature.profileBody':
    'व्यक्तिगत विवरण, पते, श्रेणी और पूरी शैक्षिक जानकारी — हर फ़ॉर्म में पुनः उपयोग योग्य।',
  'landing.feature.vaultTitle': 'निजी दस्तावेज़ वॉल्ट',
  'landing.feature.vaultBody':
    'प्रमाणपत्र और अंकपत्र निजी स्टोरेज में सुरक्षित, केवल अल्पकालिक साइन किए गए लिंक से पहुँच योग्य।',
  'landing.feature.mediaTitle': 'फ़ोटो और हस्ताक्षर सहायक',
  'landing.feature.mediaBody':
    'परीक्षा की सटीक आवश्यकता के अनुसार क्रॉप, आकार और कम्प्रेशन — आपके ब्राउज़र में ही।',
  'landing.feature.checksTitle': 'जमा करने से पहले जाँच',
  'landing.feature.checksBody':
    'क्या-क्या शेष है इसकी स्पष्ट सूची, और अंतिम समीक्षा स्क्रीन जिसे आपको स्वयं स्वीकृत करना होता है।',
  'landing.safetyTitle': 'AI FormMate कभी नहीं करेगा',
  'landing.safety.captcha': 'CAPTCHA, OTP या मल्टी-फ़ैक्टर प्रमाणीकरण को हल या बायपास करना।',
  'landing.safety.payment': 'भुगतान क्रेडेंशियल सहेजना या भुगतान प्रमाणीकरण स्वचालित करना।',
  'landing.safety.submit': 'आपकी स्पष्ट स्वीकृति के बिना आवेदन जमा करना।',
  'landing.safety.identity': 'आपकी फ़ोटो या हस्ताक्षर की पहचान बनाना या बदलना।',
  'landing.disclaimer':
    'AI FormMate एक आवेदन सहायक है। यह हर सरकारी वेबसाइट के समर्थन का दावा नहीं करता, और AI द्वारा निकाली गई जानकारी को हमेशा आधिकारिक अधिसूचना से सत्यापित करना आवश्यक है।',

  'help.title': 'सहायता',
  'help.body':
    'AI FormMate सरकारी परीक्षा आवेदन तैयार करने में मदद करता है। OTP, CAPTCHA, भुगतान और अंतिम सबमिशन आप स्वयं पूरा करते हैं।',

  'error.title': 'कुछ गड़बड़ हो गई',
  'error.body': 'हम यह कार्य पूरा नहीं कर सके। कृपया थोड़ी देर बाद फिर कोशिश करें।',
  'error.notFoundTitle': 'पेज नहीं मिला',
  'error.notFoundBody': 'आप जो पेज खोज रहे थे वह मौजूद नहीं है या हटा दिया गया है।',
  'error.backToDashboard': 'डैशबोर्ड पर वापस',
  'error.backToHome': 'होम पर वापस',
};
