// components/dashboard/VoiceForm.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useToast } from '../ui/Toast';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Mic, 
  PenTool, 
  Camera, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Choice Lists mapping from Kobo Survey
const GENDER_OPTIONS = [
  { name: 'male', labelEn: 'Male', labelHi: 'पुरुष', labelBn: 'পুরুষ' },
  { name: 'female', labelEn: 'Female', labelHi: 'महिला', labelBn: 'মহিলা' },
  { name: 'other', labelEn: 'Other', labelHi: 'अन्य', labelBn: 'অন্যান্য' }
];

const ORPHAN_OPTIONS = [
  { name: 'both_alive', labelEn: 'Both parents alive', labelHi: 'दोनों माता-पिता जीवित', labelBn: 'উভয় পিতা-মাতা জীবিত' },
  { name: 'single_orphan', labelEn: 'Single orphan (one parent deceased)', labelHi: 'एकल अनाथ (एक माता-पिता का निधन)', labelBn: 'একক অनाथ (একজন পিতা-মাতা মৃত)' },
  { name: 'double_orphan', labelEn: 'Double orphan (both parents deceased)', labelHi: 'दोहरा अनाथ (दोनों माता-पिता का निधन)', labelBn: 'দ্বিগুণ অনাথ (উভয় পিতা-মাতা মৃত)' }
];

const RELATION_OPTIONS = [
  { name: 'mother', labelEn: 'Mother', labelHi: 'माँ', labelBn: 'মা' },
  { name: 'father', labelEn: 'Father', labelHi: 'पिता', labelBn: 'বাবা' },
  { name: 'grandparent', labelEn: 'Grandparent', labelHi: 'दादा-दादी / नाना-नानी', labelBn: 'দাদু-দিদিমা / ঠাকুরদা-ঠাকুরমা' },
  { name: 'legal_guardian', labelEn: 'Legal Guardian', labelHi: 'कानूनी संरक्षक', labelBn: 'আইনগত অভিভাবক' },
  { name: 'other', labelEn: 'Other', labelHi: 'अन्य', labelBn: 'অন্যান্য' }
];

const EDUCATION_STATUS_OPTIONS = [
  { name: 'school_going', labelEn: 'School Going', labelHi: 'स्कूल जाने वाले', labelBn: 'বিদ্যালয়ে যায়' },
  { name: 'dropout', labelEn: 'Dropout', labelHi: 'स्कूल छोड़ चुके (ड्रॉपआउट)', labelBn: 'বিদ্যালয়ছুট' },
  { name: 'never_enrolled', labelEn: 'Never Enrolled', labelHi: 'कभी नामांकित नहीं हुए', labelBn: 'কখনও ভর্তি হয়নি' },
  { name: 'other', labelEn: 'Other', labelHi: 'अन्य', labelBn: 'অন্যান্য' }
];

const APPETITE_OPTIONS = [
  { name: 'good', labelEn: 'Good', labelHi: 'अच्छी', labelBn: 'ভালো' },
  { name: 'fair', labelEn: 'Fair', labelHi: 'सामान्य', labelBn: 'মোটামুটি' },
  { name: 'poor', labelEn: 'Poor', labelHi: 'कम / खराब', labelBn: 'খারাপ' }
];

const SCHOOL_TYPE_OPTIONS = [
  { name: 'government', labelEn: 'Government School', labelHi: 'सरकारी स्कूल', labelBn: 'सरकारी বিদ্যালয়' },
  { name: 'private', labelEn: 'Private School', labelHi: 'निजी स्कूल', labelBn: 'বেসরকারি বিদ্যালয়' },
  { name: 'aided', labelEn: 'Government Aided', labelHi: 'सरकारी सहायता प्राप्त', labelBn: 'सरकारी সাহায্যপ্রাপ্ত' }
];

const ATTENDANCE_OPTIONS = [
  { name: 'regular', labelEn: 'Regular (>80%)', labelHi: 'नियमित (>80%)', labelBn: 'নিয়মিত (>৮০%)' },
  { name: 'irregular', labelEn: 'Irregular (<80%)', labelHi: 'अनियमित (<80%)', labelBn: 'অনিয়মিত (<৮০%)' }
];

const STATE_OPTIONS = [
  { name: 'west_bengal', labelEn: 'West Bengal', labelHi: 'पश्चिम बंगाल', labelBn: 'পশ্চিমবঙ্গ' },
  { name: 'madhya_pradesh', labelEn: 'Madhya Pradesh', labelHi: 'मध्य प्रदेश', labelBn: 'মধ্যপ্রদেশ' },
  { name: 'maharashtra', labelEn: 'Maharashtra', labelHi: 'महाराष्ट्र', labelBn: 'মহারাষ্ট্র' },
  { name: 'uttar_pradesh', labelEn: 'Uttar Pradesh', labelHi: 'उत्तर प्रदेश', labelBn: 'উত্তরপ্রদেশ' },
  { name: 'delhi', labelEn: 'Delhi', labelHi: 'दिल्ली', labelBn: 'দিল্লি' }
];

const DISTRICT_MAPPING: Record<string, { name: string; labelEn: string; labelHi: string; labelBn: string }[]> = {
  west_bengal: [
    { name: 'kolkata', labelEn: 'Kolkata', labelHi: 'कोलकाता', labelBn: 'কলকাতা' },
    { name: 'howrah', labelEn: 'Howrah', labelHi: 'हावड़ा', labelBn: 'হাওড়া' },
    { name: 'darjeeling', labelEn: 'Darjeeling', labelHi: 'दार्जিলिंग', labelBn: 'দার্জিলিং' },
    { name: 'north_24_parganas', labelEn: 'North 24 Parganas', labelHi: 'उत्तर 24 परगना', labelBn: 'উত্তর ২৪ পরগনা' },
    { name: 'south_24_parganas', labelEn: 'South 24 Parganas', labelHi: 'दक्षिण 24 परगना', labelBn: 'দক্ষিণ ২৪ পরগনা' }
  ],
  madhya_pradesh: [
    { name: 'indore', labelEn: 'Indore', labelHi: 'इंदौर', labelBn: 'ইন্দোর' },
    { name: 'bhopal', labelEn: 'Bhopal', labelHi: 'भोपाल', labelBn: 'ভোপাল' },
    { name: 'jabalpur', labelEn: 'Jabalpur', labelHi: 'जबलपुर', labelBn: 'জবলপুর' },
    { name: 'ujjain', labelEn: 'Ujjain', labelHi: 'उज्जयिनी', labelBn: 'উজ্জয়িনী' }
  ],
  maharashtra: [
    { name: 'mumbai_city', labelEn: 'Mumbai City', labelHi: 'मुंबई शहर', labelBn: 'মুম্বাই শহর' },
    { name: 'pune', labelEn: 'Pune', labelHi: 'पुणे', labelBn: 'পুনে' },
    { name: 'nagpur', labelEn: 'Nagpur', labelHi: 'নাগপুর', labelBn: 'নাগপুর' }
  ],
  uttar_pradesh: [
    { name: 'lucknow', labelEn: 'Lucknow', labelHi: 'लखनऊ', labelBn: 'লখনউ' },
    { name: 'kanpur', labelEn: 'Kanpur', labelHi: 'कानपुर', labelBn: 'কানপুর' },
    { name: 'varanasi', labelEn: 'Varanasi', labelHi: 'वाराणसी', labelBn: 'বারাণসী' }
  ],
  delhi: [
    { name: 'new_delhi', labelEn: 'New Delhi', labelHi: 'नई दिल्ली', labelBn: 'নয়াদিল্লি' }
  ]
};

export const VoiceForm: React.FC = () => {
  const addRecord = useStore((s) => s.addRecord);
  const { toast } = useToast();

  const [language, setLanguage] = React.useState<'en' | 'hi' | 'bn'>('en');
  const [step, setStep] = React.useState<number>(1);
  const [isSpeaking, setIsSpeaking] = React.useState<boolean>(false);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);

  // Form Field States
  const [formData, setFormData] = React.useState<any>({
    consent_obtained: '',
    thumb_impression: '',
    visitdate: new Date().toISOString().split('T')[0],
    childname: '',
    dateofbirth: '',
    gender: '',
    orphanstatus: '',
    caregivername: '',
    caregiverrelation: '',
    caregivercontact: '',
    address: '',
    addressstate: '',
    addressdistrict: '',
    householdmembers: 0,
    noofchildren: 0,
    householdincomemonthly: 0,
    incomesource: '',
    current_weight: 0,
    current_height: 0,
    bmicalc: 0,
    bmicategory: 'Normal',
    hemoglobin: 0,
    hb_category: 'Normal',
    comorbidities: '',
    comorbidities_other: '',
    appetite: '',
    mealsperday: 0,
    educationstatus: '',
    educationstatus_other: '',
    schoolname: '',
    schooltype: '',
    currentclass: '',
    attendancestatus: '',
    eduschoolfees: 0,
    private_tution_fee: 0,
    edubooks: 0,
    edustationery: 0,
    eduuniform: 0,
    edutransport: 0,
    eduother: 0,
    edutotalannual: 0,
    school_fee_receipt: '',
    marksheet_prev_year: '',
    reqschoolfees: 0,
    reqbooks: 0,
    reqstationery: 0,
    requniform: 0,
    reqtransport: 0,
    reqother: 0,
    reqtotalsupport: 0,
    reviewconfirmed: '',
    organization_name: '',
    organization_email: ''
  });

  const [submitting, setSubmitting] = React.useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  // Auto-calculation logic for age, BMI, Haemoglobin and Totals
  React.useEffect(() => {
    const weight = Number(formData.current_weight || 0);
    const height = Number(formData.current_height || 0);
    let bmi = 0;
    let bmicat = 'Normal';

    if (weight > 0 && height > 0) {
      bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
      if (bmi < 16) bmicat = 'Severely Underweight';
      else if (bmi < 17) bmicat = 'Moderately Underweight';
      else if (bmi < 18.5) bmicat = 'Mildly Underweight';
      else if (bmi < 25) bmicat = 'Normal';
      else if (bmi < 30) bmicat = 'Overweight';
      else bmicat = 'Obese';
    }

    const hb = Number(formData.hemoglobin || 0);
    let hbcat = 'Normal';
    if (hb > 0) {
      if (hb < 7) hbcat = 'Severe Anaemia';
      else if (hb < 10) hbcat = 'Moderate Anaemia';
      else if (hb < 11) hbcat = 'Mild Anaemia';
      else if (hb <= 16) hbcat = 'Normal';
      else hbcat = 'High — Review Advised';
    }

    const feePeriod = formData.school_fee_period || 'annual';
    let annualizedSchoolFees = Number(formData.eduschoolfees || 0);
    if (feePeriod === 'quarterly') {
      annualizedSchoolFees *= 4;
    } else if (feePeriod === 'monthly') {
      annualizedSchoolFees *= 12;
    }

    const eduTotal = 
      annualizedSchoolFees +
      Number(formData.private_tution_fee || 0) +
      Number(formData.edubooks || 0) +
      Number(formData.edustationery || 0) +
      Number(formData.eduuniform || 0) +
      Number(formData.edutransport || 0) +
      Number(formData.eduother || 0);

    const supportTotal = 
      Number(formData.reqschoolfees || 0) +
      Number(formData.reqbooks || 0) +
      Number(formData.reqstationery || 0) +
      Number(formData.requniform || 0) +
      Number(formData.reqtransport || 0) +
      Number(formData.reqother || 0);

    setFormData((prev: any) => ({
      ...prev,
      bmicalc: bmi,
      bmicategory: bmicat,
      hb_category: hbcat,
      edutotalannual: eduTotal,
      reqtotalsupport: supportTotal
    }));
  }, [
    formData.current_weight, 
    formData.current_height, 
    formData.hemoglobin,
    formData.eduschoolfees,
    formData.school_fee_period,
    formData.private_tution_fee,
    formData.edubooks,
    formData.edustationery,
    formData.eduuniform,
    formData.edutransport,
    formData.eduother,
    formData.reqschoolfees,
    formData.reqbooks,
    formData.reqstationery,
    formData.requniform,
    formData.reqtransport,
    formData.reqother
  ]);

  // Audio Speech Synthesis Engine
  const speakText = React.useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Terminate active speeches
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US';
    utterance.rate = 0.95; // Slightly slower, more natural human pace

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(language === 'hi' ? 'hi' : language === 'bn' ? 'bn' : 'en'));
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  }, [language, isMuted]);

  // Text builder based on step for voice guidance
  const speakStepQuestion = React.useCallback(() => {
    let script = '';
    if (language === 'en') {
      switch (step) {
        case 1:
          script = "Section 1. Consent Details. Please review the welcome note. Do you agree to participate in this survey? If yes, please draw your signature on the screen to continue.";
          break;
        case 2:
          script = "Section 2. Child and Caregiver Personal Details. Please fill in the child's full name, date of birth, gender, and the caregiver's relationship and contact info.";
          break;
        case 3:
          script = "Section 3. Household and Financial Status. Enter the total family members, number of children under 18, and main monthly income details.";
          break;
        case 4:
          script = "Section 4. Health and Nutrition. Enter the child's current weight in kilograms and height in centimeters. Let us know about their appetite and meals per day.";
          break;
        case 5:
          script = "Section 5. Education status and expenses. Select the current enrollment status of the child, and upload receipts if there are active education costs.";
          break;
        case 6:
          script = "Section 6. Final Review. Please confirm that all details are correct. Enter your organization name and email before submitting.";
          break;
      }
    } else if (language === 'hi') {
      switch (step) {
        case 1:
          script = "खंड 1. सहमति विवरण। कृपया स्वागत नोट की समीक्षा करें। क्या आप इस सर्वेक्षण में भाग लेने के लिए सहमत हैं? यदि हाँ, तो आगे बढ़ने के लिए स्क्रीन पर अपना हस्ताक्षर करें।";
          break;
        case 2:
          script = "खंड 2. बच्चे और देखभालकर्ता का व्यक्तिगत विवरण। कृपया बच्चे का पूरा नाम, जन्म तिथि, लिंग, और देखभालकर्ता का संबंध और संपर्क विवरण भरें।";
          break;
        case 3:
          script = "खंड 3. घरेलू और वित्तीय स्थिति। परिवार के कुल सदस्यों की संख्या, 18 वर्ष से कम उम्र के बच्चों की संख्या, और मुख्य मासिक आय का विवरण दर्ज करें।";
          break;
        case 4:
          script = "खंड 4. स्वास्थ्य और पोषण। किलोग्राम में बच्चे का वजन और सेंटीमीटर में लंबाई दर्ज करें। हमें उनकी भूख और प्रति दिन भोजन के बारे में बताएं।";
          break;
        case 5:
          script = "खंड 5. शिक्षा की स्थिति और खर्च। बच्चे के वर्तमान नामांकन की स्थिति का चयन करें, और यदि कोई सक्रिय शिक्षा लागत है तो रसीদें अपलोड करें।";
          break;
        case 6:
          script = "खंड 6. अंतिम समीक्षा। कृपया पुष्टि करें कि सभी विवरण सही हैं। जमा करने से पहले अपने संगठन का नाम और ईमेल दर्ज करें।";
          break;
      }
    } else {
      switch (step) {
        case 1:
          script = "বিভাগ ১. সম্মতি বিবরণ। অনুগ্রহ করে স্বাগত বার্তাটি পড়ুন। আপনি কি এই সমীক্ষায় অংশগ্রহণ করতে সম্মত আছেন? যদি হ্যাঁ হয়, তবে অনুগ্রহ করে এগিয়ে যেতে স্ক্রিনে আপনার স্বাক্ষর করুন।";
          break;
        case 2:
          script = "বিভাগ ২. শিশু এবং অভিভাবকের ব্যক্তিগত বিবরণ। অনুগ্রহ করে শিশুর পুরো নাম, জন্মতারিখ, লিঙ্গ এবং অভিভাবকের সাথে সম্পর্ক এবং যোগাযোগের তথ্য পূরণ করুন।";
          break;
        case 3:
          script = "বিভাগ ৩. পারিবারিক এবং আর্থিক অবস্থা। পরিবারের মোট সদস্য সংখ্যা, ১৮ বছরের কম বয়সী শিশুর সংখ্যা এবং মূল মাসিক আয়ের বিবরণ লিখুন।";
          break;
        case 4:
          script = "বিভাগ ৪. স্বাস্থ্য এবং পুষ্টি। শিশুর বর্তমান ওজন কিলোগ্রামে এবং উচ্চতা সেন্টিমিটারে লিখুন। আমাদের তাদের ক্ষুধা এবং প্রতিদিনের খাবারের সংখ্যা জানান।";
          break;
        case 5:
          script = "বিভাগ ৫. শিক্ষার অবস্থা এবং খরচ। শিশুর বর্তমান স্কুলে ভর্তির অবস্থা নির্বাচন করুন এবং যদি কোনো শিক্ষার খরচ থাকে তবে রসিদ আপলোড করুন।";
          break;
        case 6:
          script = "বিভাগ ৬. চূড়ান্ত পর্যালোচনা। অনুগ্রহ করে নিশ্চিত করুন যে সমস্ত বিবরণ সঠিক আছে। জমা দেওয়ার আগে আপনার সংস্থার নাম এবং ইমেল ঠিকানা লিখুন।";
          break;
      }
    }
    speakText(script);
  }, [step, language, speakText]);

  // Speak questions when step shifts or language changes
  React.useEffect(() => {
    // Wait slightly to allow user interface load
    const timer = setTimeout(() => {
      speakStepQuestion();
    }, 400);
    return () => clearTimeout(timer);
  }, [step, language, speakStepQuestion]);

  // Signature Canvas Drawing Logic
  React.useEffect(() => {
    if (step === 1 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    
    // Save image to state
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setFormData((prev: any) => ({ ...prev, thumb_impression: dataUrl }));
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFormData((prev: any) => ({ ...prev, thumb_impression: '' }));
    }
  };

  // Base64 file reader helper
  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, [field]: val };
      
      // If education status is changed to something else than school_going, clear all school-related fields
      if (field === 'educationstatus' && val !== 'school_going') {
        updated.schoolname = '';
        updated.schooltype = '';
        updated.currentclass = '';
        updated.attendancestatus = '';
        updated.eduschoolfees = 0;
        updated.school_fee_period = 'annual';
        updated.private_tution_fee = 0;
        updated.edubooks = 0;
        updated.edustationery = 0;
        updated.eduuniform = 0;
        updated.edutransport = 0;
        updated.eduother = 0;
        updated.edutotalannual = 0;
        updated.school_fee_receipt = '';
        updated.marksheet_prev_year = '';
        updated.reqschoolfees = 0;
        updated.reqbooks = 0;
        updated.reqstationery = 0;
        updated.requniform = 0;
        updated.reqtransport = 0;
        updated.reqother = 0;
        updated.reqtotalsupport = 0;
      }
      
      return updated;
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (formData.consent_obtained !== 'yes') {
        toast({ type: 'error', message: language === 'hi' ? 'जारी रखने के लिए सहमति आवश्यक है।' : 'Consent is required to continue.' });
        return false;
      }
      if (!formData.thumb_impression) {
        toast({ type: 'error', message: language === 'hi' ? 'कृपया स्क्रीन पर हस्ताक्षर करें।' : 'Please sign on the canvas.' });
        return false;
      }
    }
    if (step === 2) {
      if (!formData.childname || !formData.dateofbirth || !formData.gender || !formData.orphanstatus || !formData.caregivername || !formData.addressstate || !formData.addressdistrict) {
        toast({ type: 'error', message: language === 'hi' ? 'कृपया सभी अनिवार्य व्यक्तिगत फ़ील्ड भरें।' : 'Please fill all mandatory personal details.' });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.reviewconfirmed !== 'yes_all_correct') {
      toast({ type: 'error', message: language === 'hi' ? 'कृपया जमा करने से पहले समीक्षा की पुष्टि करें।' : 'Please confirm details correctness to submit.' });
      return;
    }
    setSubmitting(true);
    try {
      await addRecord(formData);
      toast({ type: 'success', title: 'Data Saved', message: language === 'hi' ? 'बच्चे का पोषण डेटा सफलतापूर्वक सहेजा गया।' : 'Child nutrition record saved successfully.' });
      // Reset form
      setStep(1);
      setFormData({
        consent_obtained: '',
        thumb_impression: '',
        visitdate: new Date().toISOString().split('T')[0],
        childname: '',
        dateofbirth: '',
        gender: '',
        orphanstatus: '',
        caregivername: '',
        caregiverrelation: '',
        caregivercontact: '',
        address: '',
        addressstate: '',
        addressdistrict: '',
        householdmembers: 0,
        noofchildren: 0,
        householdincomemonthly: 0,
        incomesource: '',
        current_weight: 0,
        current_height: 0,
        bmicalc: 0,
        bmicategory: 'Normal',
        hemoglobin: 0,
        hb_category: 'Normal',
        comorbidities: '',
        comorbidities_other: '',
        appetite: '',
        mealsperday: 0,
        educationstatus: '',
        educationstatus_other: '',
        schoolname: '',
        schooltype: '',
        currentclass: '',
        attendancestatus: '',
        eduschoolfees: 0,
        private_tution_fee: 0,
        edubooks: 0,
        edustationery: 0,
        eduuniform: 0,
        edutransport: 0,
        eduother: 0,
        edutotalannual: 0,
        school_fee_receipt: '',
        marksheet_prev_year: '',
        reqschoolfees: 0,
        reqbooks: 0,
        reqstationery: 0,
        requniform: 0,
        reqtransport: 0,
        reqother: 0,
        reqtotalsupport: 0,
        reviewconfirmed: '',
        organization_name: '',
        organization_email: ''
      });
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 select-none animate-slide-up">
      {/* Premium Header Controller */}
      <div className="glass-card p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            {t('Child Nutrition Registry Portal', 'बाल पोषण डेटा संग्रह', 'শিশু পুষ্টি নিবন্ধীকরণ পোর্টাল')}
          </h2>
          <p className="text-xs text-zinc-500">
            {t('Voice-guided data mapping & record collection console', 'सक्रिय आवाज मार्गदर्शन और द्विभाषी इंटरैक्टिव मोड', 'ভয়েস-নির্দেশিত ডেটা ম্যাপিং এবং রেকর্ড সংগ্রহের কনসোল')}
          </p>
        </div>

        {/* Audio / Translation console */}
        <div className="flex items-center gap-3">
          {/* Language Switch */}
          <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-white shadow text-blue-600' : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'hi' ? 'bg-white shadow text-blue-600' : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'bn' ? 'bg-white shadow text-blue-600' : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Voice Indicator Wave / Repeat Button */}
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="text-blue-600 hover:text-blue-800 outline-none cursor-pointer"
              title={isMuted ? "Unmute voice guidance" : "Mute voice guidance"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            {/* Visual sound wave representation */}
            {!isMuted && isSpeaking && (
              <div className="flex items-end gap-0.5 h-3 px-1.5">
                <span className="w-0.5 bg-blue-500 rounded animate-bounce" style={{ height: '70%', animationDelay: '0.1s' }} />
                <span className="w-0.5 bg-blue-500 rounded animate-bounce" style={{ height: '100%', animationDelay: '0.2s' }} />
                <span className="w-0.5 bg-blue-500 rounded animate-bounce" style={{ height: '40%', animationDelay: '0.3s' }} />
              </div>
            )}
            
            <button
              onClick={speakStepQuestion}
              className="text-[10px] font-bold text-blue-700 ml-1 hover:underline outline-none cursor-pointer"
            >
              {t('Replay', 'पुनः सुनें', 'পুনরায় শুনুন')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-step Content */}
      <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden min-h-[450px]">
        
        {/* Step Progress bar */}
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            {t(`Step ${step} of 6`, `चरण ${step} / 6`, `ধাপ ${step} / ৬`)}
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <span
                key={s}
                className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-blue-500' : s < step ? 'bg-blue-300' : 'bg-zinc-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col gap-6"
          >
            {/* STEP 1: CONSENT */}
            {step === 1 && (
              <div className="flex flex-col gap-5 text-left">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-zinc-700 text-xs leading-relaxed">
                  <h4 className="font-bold text-blue-900 mb-1">
                    {t('Important Welcome Note', 'महत्वपूर्ण सूचना', 'গুরুত্বপূর্ণ ঘোষণা')}
                  </h4>
                  {t(
                    "This form collects confidential information about the child's health, nutrition, and education. All information is kept strictly confidential.",
                    "यह फॉर्म बच्चे के स्वास्थ्य, पोषण और शिक्षा से संबंधित गोपनीय जानकारी एकत्र करता है। सभी जानकारी पूर्णतः गोपनीय रखी जाएगी।",
                    "এই ফর্মটি শিশুর স্বাস্থ্য, পুষ্টি এবং শিক্ষা সম্পর্কিত গোপনীয় তথ্য সংগ্রহ করে। সমস্ত তথ্য কঠোরভাবে গোপন রাখা হবে।"
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-700">
                    {t('Do you agree to participate? *', 'क्या आप भाग लेने के लिए सहमत हैं? *', 'আপনি কি সমীক্ষায় অংশগ্রহণ করতে সম্মত? *')}
                  </label>
                  <Select
                    value={formData.consent_obtained}
                    onValueChange={(val) => handleInputChange('consent_obtained', val)}
                  >
                    <SelectTrigger className="bg-white border border-zinc-200 text-zinc-900 h-10 rounded-xl">
                      <SelectValue placeholder={t('Select consent', 'चुनें', 'সম্মতি নির্বাচন করুন')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('Yes', 'हाँ (Yes)', 'হ্যাঁ (Yes)')}</SelectItem>
                      <SelectItem value="no">{t('No', 'नहीं (No)', 'না (No)')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.consent_obtained === 'yes' && (
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-blue-500" />
                      {t('Caregiver Signature / Thumb Impression *', 'देखभालकर्ता के हस्ताक्षर / अंगूठे का निशान *', 'অভিভাবকের স্বাক্ষর / বুড়ো আঙুলের ছাপ *')}
                    </label>
                    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 relative flex flex-col items-center">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="bg-white cursor-crosshair max-w-full"
                      />
                      <div className="w-full flex justify-between p-2 bg-zinc-100 border-t border-zinc-200 text-[10px] text-zinc-500">
                        <span>{t('Draw inside the canvas block', 'हस्ताक्षर करने के लिए माउस/फिंगर का उपयोग करें', 'স্বাক্ষর করতে মাউস বা আঙুল ব্যবহার করুন')}</span>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="font-bold text-red-500 hover:underline outline-none cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          {t('Clear Canvas', 'साफ़ करें', 'ক্যানভাস পরিষ্কার করুন')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: DEMOGRAPHICS */}
            {step === 2 && (
              <div className="flex flex-col gap-4 text-left">
                <h3 className="text-sm font-bold text-zinc-700 border-b border-zinc-100 pb-2">
                  {t('Child & Caregiver Personal Details', 'बच्चे और देखभालकर्ता का व्यक्तिगत विवरण', 'শিশু এবং অভিভাবকের ব্যক্তিগত বিবরণ')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('Visit Date *', 'भेंट की तारीख *', 'পরিদর্শনের তারিখ *')}
                    type="date"
                    value={formData.visitdate}
                    onChange={(e) => handleInputChange('visitdate', e.target.value)}
                  />
                  <Input
                    label={t("Child's Full Name *", 'बच्चे का पूरा नाम *', 'শিশুর পুরো নাম *')}
                    placeholder={t('Official record name', 'दस्तावेज़ों के अनुसार', 'নথিপত্র অনুযায়ী নাম')}
                    value={formData.childname}
                    onChange={(e) => handleInputChange('childname', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('Date of Birth *', 'जन्म तिथि *', 'জন্ম তারিখ *')}
                    type="date"
                    value={formData.dateofbirth}
                    onChange={(e) => handleInputChange('dateofbirth', e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">{t('Gender *', 'लिंग *', 'লিঙ্গ *')}</label>
                    <Select value={formData.gender} onValueChange={(val) => handleInputChange('gender', val)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">{t('Orphan Status *', 'अनाथ स्थिति *', 'অনাথ অবস্থা *')}</label>
                    <Select value={formData.orphanstatus} onValueChange={(val) => handleInputChange('orphanstatus', val)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORPHAN_OPTIONS.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
                  <Input
                    label={t("Caregiver's Full Name *", 'देखभालकर्ता का पूरा नाम *', 'অভিভাবকের পুরো নাম *')}
                    value={formData.caregivername}
                    onChange={(e) => handleInputChange('caregivername', e.target.value)}
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">
                      {t("Caregiver's Relationship *", 'देखभालकर्ता से संबंध *', 'অভিভাবকের সাথে সম্পর্ক *')}
                    </label>
                    <Select value={formData.caregiverrelation} onValueChange={(val) => handleInputChange('caregiverrelation', val)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATION_OPTIONS.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Input
                    label={t('Contact Number', 'संपर्क नंबर', 'যোগাযোগের নম্বর')}
                    placeholder="10-digit mobile"
                    value={formData.caregivercontact}
                    onChange={(e) => handleInputChange('caregivercontact', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-1 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">{t('State *', 'राज्य *', 'রাজ্য *')}</label>
                    <Select 
                      value={formData.addressstate} 
                      onValueChange={(val) => {
                        handleInputChange('addressstate', val);
                        handleInputChange('addressdistrict', ''); // Reset district
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATE_OPTIONS.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">{t('District *', 'जिला *', 'জেলা *')}</label>
                    <Select 
                      value={formData.addressdistrict} 
                      onValueChange={(val) => handleInputChange('addressdistrict', val)}
                      disabled={!formData.addressstate}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.addressstate && DISTRICT_MAPPING[formData.addressstate]?.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-1">
                    <Input
                      label={t('Full Address *', 'पूरा पता *', 'সম্পূর্ণ ঠিকানা *')}
                      placeholder="Village/Ward details"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: HOUSEHOLD & FINANCIAL */}
            {step === 3 && (
              <div className="flex flex-col gap-4 text-left">
                <h3 className="text-sm font-bold text-zinc-700 border-b border-zinc-100 pb-2">
                  {t('Household & Financial Details', 'परिवार और वित्तीय विवरण', 'পারিবারিক এবং আর্থিক বিবরণ')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('Total Family Members', 'कुल परिवार के सदस्य', 'পরিবারের মোট সদস্য সংখ্যা')}
                    type="number"
                    value={formData.householdmembers || ''}
                    onChange={(e) => handleInputChange('householdmembers', Number(e.target.value))}
                  />
                  <Input
                    label={t('Number of Children (≤18 yrs)', 'बच्चों की संख्या (≤18 वर्ष)', '১৮ বছর বা তার কম বয়সী শিশুর সংখ্যা')}
                    type="number"
                    value={formData.noofchildren || ''}
                    onChange={(e) => handleInputChange('noofchildren', Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('Monthly Income (Rs.)', 'मासिक आय (रु.)', 'মাসিক আয় (টাকা)')}
                    type="number"
                    value={formData.householdincomemonthly || ''}
                    onChange={(e) => handleInputChange('householdincomemonthly', Number(e.target.value))}
                  />
                  <Input
                    label={t('Main Source of Income', 'आय का मुख्य स्रोत', 'আয়ের প্রধান উৎস')}
                    placeholder="e.g. Agriculture, Labour"
                    value={formData.incomesource}
                    onChange={(e) => handleInputChange('incomesource', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: CLINICAL & NUTRITION */}
            {step === 4 && (
              <div className="flex flex-col gap-4 text-left">
                <h3 className="text-sm font-bold text-zinc-700 border-b border-zinc-100 pb-2">
                  {t('Health & Nutrition Status', 'स्वास्थ्य और पोषण की स्थिति', 'স্বাস্থ্য এবং পুষ্টির অবস্থা')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('Current Weight (kg) *', 'वज़न (कि.ग्रा.) *', 'বর্তমান ওজন (কেজি) *')}
                    type="number"
                    step="0.1"
                    value={formData.current_weight || ''}
                    onChange={(e) => handleInputChange('current_weight', Number(e.target.value))}
                  />
                  <Input
                    label={t('Current Height (cm) *', 'ऊँचाई (से.मी.) *', 'বর্তমান উচ্চতা (সেমি) *')}
                    type="number"
                    value={formData.current_height || ''}
                    onChange={(e) => handleInputChange('current_height', Number(e.target.value))}
                  />
                  
                  {/* Auto BMI Display block */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Body Mass Index (BMI)</span>
                    <span className="text-lg font-extrabold text-zinc-800">
                      {formData.bmicalc ? `${formData.bmicalc} kg/m²` : 'N/A'}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      formData.bmicategory.includes('Underweight') ? 'text-amber-600 animate-pulse' : 'text-emerald-600'
                    }`}>
                      {formData.bmicategory}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <Input
                    label={t('Haemoglobin (g/dL)', 'हीमोग्लोबिन (g/dL)', 'হিমোগ্লোবিন (g/dL)')}
                    type="number"
                    step="0.1"
                    value={formData.hemoglobin || ''}
                    onChange={(e) => handleInputChange('hemoglobin', Number(e.target.value))}
                  />
                  
                  {/* Hb classification block */}
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Haemoglobin Category</span>
                    <span className={`text-sm font-extrabold ${
                      formData.hb_category.includes('Severe') ? 'text-red-600' : 'text-zinc-800'
                    }`}>
                      {formData.hb_category || 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">
                      {t("Child's Appetite", 'बच्चे की भूख', 'শিশুর ক্ষুধা')}
                    </label>
                    <Select value={formData.appetite} onValueChange={(val) => handleInputChange('appetite', val)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder={t('Select Appetite', 'भूख का चयन करें', 'ক্ষুধা নির্বাচন করুন')} />
                      </SelectTrigger>
                      <SelectContent>
                        {APPETITE_OPTIONS.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Input
                    label={t('Meals Per Day', 'प्रतिदिन भोजन संख्या', 'প্রতিদিনের খাবারের সংখ্যা')}
                    type="number"
                    value={formData.mealsperday || ''}
                    onChange={(e) => handleInputChange('mealsperday', Number(e.target.value))}
                  />
                  <Input
                    label={t('Other Health Conditions', 'अन्य स्वास्थ्य जटिलताएं', 'অন্যান্য স্বাস্থ্য জটিলতা')}
                    placeholder="e.g. Asthma, Tuberculosis"
                    value={formData.comorbidities}
                    onChange={(e) => handleInputChange('comorbidities', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 5: EDUCATION DETAILS */}
            {step === 5 && (
              <div className="flex flex-col gap-4 text-left">
                <h3 className="text-sm font-bold text-zinc-700 border-b border-zinc-100 pb-2">
                  {t('Education Status & Current Expenses', 'शिक्षा और संबद्ध व्यय', 'শিক্ষাগত অবস্থা এবং বর্তমান খরচ')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-zinc-700">{t('Education Status *', 'शिक्षा की स्थिति *', 'শিক্ষার অবস্থা *')}</label>
                    <Select value={formData.educationstatus} onValueChange={(val) => handleInputChange('educationstatus', val)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder={t('Select status', 'स्थिति चुनें', 'অবস্থা নির্বাচন করুন')} />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.name} value={opt.name}>
                            {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.educationstatus === 'school_going' && (
                    <Input
                      label={t('School Name', 'स्कूल का नाम', 'বিদ্যালয়ের নাম')}
                      value={formData.schoolname}
                      onChange={(e) => handleInputChange('schoolname', e.target.value)}
                    />
                  )}
                </div>

                {formData.educationstatus === 'school_going' && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">{t('School Type', 'स्कूल का प्रकार', 'বিদ্যালয়ের প্রকার')}</label>
                        <Select value={formData.schooltype} onValueChange={(val) => handleInputChange('schooltype', val)}>
                          <SelectTrigger className="h-10 rounded-xl">
                            <SelectValue placeholder={t('Select Type', 'प्रकार चुनें', 'ধরণ নির্বাচন করুন')} />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHOOL_TYPE_OPTIONS.map(opt => (
                              <SelectItem key={opt.name} value={opt.name}>
                                {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        label={t('Current Class / Grade', 'वर्तमान कक्षा / ग्रेड', 'বর্তমান শ্রেণী / গ্রেড')}
                        value={formData.currentclass}
                        onChange={(e) => handleInputChange('currentclass', e.target.value)}
                      />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">{t('Attendance Status', 'उपस्थिति स्थिति', 'উপস্থিতির অবস্থা')}</label>
                        <Select value={formData.attendancestatus} onValueChange={(val) => handleInputChange('attendancestatus', val)}>
                          <SelectTrigger className="h-10 rounded-xl">
                            <SelectValue placeholder={t('Select Attendance', 'उपस्थिति चुनें', 'উপস্থিতি নির্বাচন করুন')} />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_OPTIONS.map(opt => (
                              <SelectItem key={opt.name} value={opt.name}>
                                {opt[language === 'hi' ? 'labelHi' : language === 'bn' ? 'labelBn' : 'labelEn']}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-100 pt-3">
                      <Input
                        label={t('School Fees', 'स्कूल शुल्क', 'স্কুল ফি')}
                        type="number"
                        value={formData.eduschoolfees || ''}
                        onChange={(e) => handleInputChange('eduschoolfees', Number(e.target.value))}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-700">
                          t('Billing Period', 'भुगतान अवधि', 'ফি প্রদানের সময়কাল')
                        </label>
                        <Select 
                          value={formData.school_fee_period || 'annual'} 
                          onValueChange={(val) => handleInputChange('school_fee_period', val)}
                        >
                          <SelectTrigger className="h-10 rounded-xl">
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">{t('Annual', 'वार्षिक (Annual)', 'বার্ষিক')}</SelectItem>
                            <SelectItem value="quarterly">{t('Quarterly', 'तिमाही (Quarter)', 'ত্রৈমাসিক')}</SelectItem>
                            <SelectItem value="monthly">{t('Monthly', 'मासिक (Month)', 'মাসিক')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        label={t('Private Tuition Fee', 'निजी ट्यूशन शुल्क', 'গৃহশিক্ষকের ফি')}
                        type="number"
                        value={formData.private_tution_fee || ''}
                        onChange={(e) => handleInputChange('private_tution_fee', Number(e.target.value))}
                      />
                      <Input
                        label={t('Books & Stationery', 'किताबें / स्टेशनरी खर्च', 'বই এবং খাতা খরচ')}
                        type="number"
                        value={formData.edubooks || ''}
                        onChange={(e) => handleInputChange('edubooks', Number(e.target.value))}
                      />
                      <Input
                        label={t('Transport Expenses', 'यातायात / परिवहन खर्च', 'যাতায়াত খরচ')}
                        type="number"
                        value={formData.edutransport || ''}
                        onChange={(e) => handleInputChange('edutransport', Number(e.target.value))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                          <Camera className="w-4 h-4 text-blue-500" />
                          {t('School Fee Receipt (Upload photo)', 'स्कूल फीस रसीद (फोटो अपलोड करें)', 'স্কুল ফির রসিদ (ছবি আপলোড করুন)')}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('school_fee_receipt', e)}
                          className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {formData.school_fee_receipt && (
                          <img src={formData.school_fee_receipt} alt="Fee Receipt" className="h-16 w-16 object-cover rounded-lg border mt-1" />
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1">
                          <Camera className="w-4 h-4 text-blue-500" />
                          {t('Previous Marksheet (Upload photo)', 'पिछले वर्ष की मार्कशीट (फोटो अपलोड करें)', 'গত বছরের মার্কশিট (ছবি আপলোড করুন)')}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('marksheet_prev_year', e)}
                          className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {formData.marksheet_prev_year && (
                          <img src={formData.marksheet_prev_year} alt="Marksheet" className="h-16 w-16 object-cover rounded-lg border mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(formData.educationstatus === 'dropout' || formData.educationstatus === 'never_enrolled') && (
                  <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4 animate-fade-in">
                    <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {t('Support Required for Re-enrollment', 'पुनः नामांकन के लिए आवश्यक वित्तीय सहायता', 'পুনরায় ভর্তির জন্য প্রয়োজনীয় সহায়তা')}
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Input
                        label={t('Required: School Fees', 'आवश्यक: स्कूल फीस', 'প্রয়োজনীয়: বিদ্যালয় ফি')}
                        type="number"
                        value={formData.reqschoolfees || ''}
                        onChange={(e) => handleInputChange('reqschoolfees', Number(e.target.value))}
                      />
                      <Input
                        label={t('Required: Books & Stationery', 'आवश्यक: किताबें/स्टेशनरी', 'প্রয়োজনীয়: বই এবং খাতা')}
                        type="number"
                        value={formData.reqbooks || ''}
                        onChange={(e) => handleInputChange('reqbooks', Number(e.target.value))}
                      />
                      <Input
                        label={t('Required: Uniform', 'आवश्यक: वर्दी (Uniform)', 'প্রয়োজনীয়: ইউনিফর্ম')}
                        type="number"
                        value={formData.requniform || ''}
                        onChange={(e) => handleInputChange('requniform', Number(e.target.value))}
                      />
                      <Input
                        label={t('Required: Transport', 'आवश्यक: यातायात खर्च', 'প্রয়োজনীয়: যাতায়াত')}
                        type="number"
                        value={formData.reqtransport || ''}
                        onChange={(e) => handleInputChange('reqtransport', Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: FINAL REVIEW & SUBMIT */}
            {step === 6 && (
              <div className="flex flex-col gap-4 text-left">
                <h3 className="text-sm font-bold text-zinc-700 border-b border-zinc-100 pb-2">
                  {t('Section 6 — Final Review & Submission', 'अंतिम समीक्षा और पुष्टि', 'বিভাগ ৬ — চূড়ান্ত পর্যালোচনা এবং জমাদান')}
                </h3>

                {/* Summarized Details */}
                <div className="bg-zinc-50 border p-4 rounded-2xl text-xs flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 border-b pb-2">
                    <span className="font-bold text-zinc-500">{t("Child's Name:", 'बच्चे का नाम:', 'শিশুর নাম:')}</span>
                    <span className="font-extrabold text-zinc-800">{formData.childname}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b pb-2">
                    <span className="font-bold text-zinc-500">{t('DOB / Gender:', 'जन्मतिथि / लिंग:', 'জন্মতারিখ / লিঙ্গ:')}</span>
                    <span className="text-zinc-800">{formData.dateofbirth} / {formData.gender}</span>
                  </div>
                  <div className="grid grid-cols-2 border-b pb-2">
                    <span className="font-bold text-zinc-500">{t('Caregiver:', 'देखभालकर्ता:', 'অভিভাবক:')}</span>
                    <span className="text-zinc-800">{formData.caregivername} ({formData.caregiverrelation})</span>
                  </div>
                  <div className="grid grid-cols-2 border-b pb-2">
                    <span className="font-bold text-zinc-500">{t('Clinical Assessment:', 'स्वास्थ्य विवरण:', 'ক্লিনিকাল মূল্যায়ন:')}</span>
                    <span className="font-bold text-zinc-800">
                      BMI: {formData.bmicalc} ({formData.bmicategory}) | Hb: {formData.hemoglobin || 'N/A'}
                    </span>
                  </div>
                  {formData.educationstatus === 'school_going' ? (
                    <div className="grid grid-cols-2">
                      <span className="font-bold text-zinc-500">{t('Total Annual Education Cost:', 'कुल वार्षिक शिक्षा खर्च:', 'মোট বার্ষিক শিক্ষার খরচ:')}</span>
                      <span className="font-bold text-blue-600">Rs. {formData.edutotalannual}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2">
                      <span className="font-bold text-zinc-500">{t('Total Required Support:', 'कुल आवश्यक वित्तीय सहायता:', 'মোট প্রয়োজনীয় সহায়তা:')}</span>
                      <span className="font-bold text-amber-600">Rs. {formData.reqtotalsupport}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-100 pt-4">
                  <Input
                    label={t('Organization Name *', 'संगठन का नाम *', 'সংস্থার নাম *')}
                    value={formData.organization_name}
                    onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  />
                  <Input
                    label={t('Organization Email ID *', 'संगठन की ईमेल आईडी *', 'সংস্থার ইমেল আইডি *')}
                    type="email"
                    value={formData.organization_email}
                    onChange={(e) => handleInputChange('organization_email', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-bold text-zinc-700">
                    {t('Is all information correct and complete? *', 'क्या सभी जानकारी सही और पूर्ण है? *', 'সব তথ্য কি সঠিক এবং সম্পূর্ণ? *')}
                  </label>
                  <Select value={formData.reviewconfirmed} onValueChange={(val) => handleInputChange('reviewconfirmed', val)}>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes_all_correct">
                        {t('Yes, all information is correct', 'हाँ, सभी जानकारी सही है', 'হ্যাঁ, সব তথ্য সঠিক')}
                      </SelectItem>
                      <SelectItem value="no_need_fix">
                        {t('No, need to correct details', 'नहीं, सुधार की आवश्यकता है', 'না, তথ্য সংশোধন করা প্রয়োজন')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Controls */}
        <div className="flex justify-between items-center border-t border-zinc-100 pt-6 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrev}
            disabled={step === 1 || submitting}
            className="cursor-pointer rounded-xl h-10 px-5 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('Back', 'पीछे', 'পিছনে')}
          </Button>

          {step < 6 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="cursor-pointer rounded-xl h-10 px-5 flex items-center gap-1"
            >
              {t('Next', 'आगे बढ़ें', 'পরবর্তী')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="cursor-pointer rounded-xl h-10 px-6 flex items-center gap-1.5 bg-blue-600 text-white font-bold hover:bg-blue-700"
            >
              <Check className="w-4 h-4" />
              {t('Submit Entry', 'सबमिट करें', 'দাখিল করুন')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

VoiceForm.displayName = 'VoiceForm';
export default VoiceForm;
