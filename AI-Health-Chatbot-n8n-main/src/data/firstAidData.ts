export interface FirstAidProtocol {
  id: string;
  emergency_type: string;
  title: Record<string, string>;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  icon: string;
  immediate_dos: Record<string, string[]>;
  strict_donts: Record<string, string[]>;
  helpline: string;
}

export const FIRST_AID_PROTOCOLS: FirstAidProtocol[] = [
  {
    id: "snake_bite",
    emergency_type: "Snake Bite",
    title: {
      en: "Snake Bite Protocol (Cobra, Viper, Krait)",
      hi: "सांप काटने पर प्राथमिक उपचार",
      te: "పాము కాటు అత్యవసర చికిత్స",
      or: "ସାପ କାମୁଡ଼ା ପ୍ରାଥମିକ ଚିକିତ୍ସା"
    },
    severity: "CRITICAL",
    icon: "ShieldAlert",
    immediate_dos: {
      en: [
        "Keep victim completely calm and immobile; movement speeds up venom absorption.",
        "Immobilize the bitten limb below the level of the heart with a splint or sling.",
        "Remove tight rings, bangles, watches, or restrictive clothing before swelling starts.",
        "Rush immediately to the nearest Community Health Centre (CHC) with Anti-Snake Venom (ASV).",
        "Note snake features from safe distance if possible (color, head shape) without attempting to catch it."
      ],
      hi: [
        "मरीज को शांत और स्थिर रखें; हिलने-डुलने से जहर तेजी से फैलता है।",
        "काटे हुए अंग को दिल के स्तर से नीचे रखें और स्थिर रखें।",
        "अंगूठी, चूड़ियां और तंग कपड़े तुरंत उतार दें क्योंकि सूजन आएगी।",
        "तुरंत नजदीकी सरकारी अस्पताल ले जाएं जहां एंटी-स्नेक वेनम (ASV) उपलब्ध हो।",
        "सांप को पकड़ने की कोशिश न करें, केवल दूर से पहचान याद रखें।"
      ],
      te: [
        "బాధితుడిని పూర్తిగా ప్రశాంతంగా ఉంచండి; కదలడం వల్ల విషం వేగంగా వ్యాపిస్తుంది.",
        "కాటు వేసిన భాగాన్ని గుండె కంటే తక్కువ ఎత్తులో ఉంచి స్థిరంగా ఉంచండి.",
        "వాపు రాకముందే ఉంగరాలు, గాజులు, గట్టి దుస్తులను తీసివేయండి.",
        "యాంటీ-స్నేక్ వెనమ్ (ASV) ఉన్న సమీప ఆసుపత్రికి వెంటనే తరలించండి."
      ],
      or: [
        "ରୋଗୀଙ୍କୁ ଶାନ୍ତ ଓ ସ୍ଥିର ରଖନ୍ତୁ; ଚଳପ୍ରଚଳ ହେଲେ ବିଷ ଶୀଘ୍ର ବ୍ୟାପିଥାଏ।",
        "କାମୁଡ଼ିଥିବା ଅଙ୍ଗକୁ ହୃଦୟର ସ୍ତରଠାରୁ ତଳେ ରଖନ୍ତୁ।",
        "ତୁରନ୍ତ ନିକଟସ୍ଥ ସରକାରୀ ଡାକ୍ତରଖାନାକୁ ନିଅନ୍ତୁ ଯେଉଁଠାରେ ଏଏସଭି ଉପଲବ୍ଧ ଅଛି।"
      ]
    },
    strict_donts: {
      en: [
        "DO NOT cut the wound or try to suck venom out with mouth.",
        "DO NOT apply a tight tourniquet; it causes gangrene and limb loss.",
        "DO NOT apply ice, potassium permanganate, cow dung, or herbal pastes.",
        "DO NOT waste time visiting faith healers or tantriks."
      ],
      hi: [
        "घाव पर चीरा न लगाएं और मुंह से जहर चूसने की कोशिश न करें।",
        "बहुत टाइट पट्टी (टूर्निकेट) न बांधें; इससे अंग खराब हो सकता है।",
        "बर्फ, गोबर या जड़ी-बूटियां न लगाएं।",
        "झाड़-फूंक या तांत्रिकों के चक्कर में समय बर्बाद न करें।"
      ],
      te: [
        "గాయంపై కోత పెట్టవద్దు లేదా నోటితో విషాన్ని పీల్చవద్దు.",
        "గట్టిగా కట్లు కట్టవద్దు (టూర్నికెట్); రక్త ప్రసరణ ఆగి అవయవం దెబ్బతింటుంది.",
        "మంచు, పేడ లేదా నాటు మందులు పూయవద్దు."
      ],
      or: [
        "କ୍ଷତ ସ୍ଥାନକୁ କାଟନ୍ତୁ ନାହିଁ କିମ୍ବା ପାଟିରେ ବିଷ ଟାଣନ୍ତୁ ନାହିଁ।",
        "ଅତ୍ୟଧିକ ଟାଣ କରି ବାନ୍ଧନ୍ତୁ ନାହିଁ।"
      ]
    },
    helpline: "108"
  },
  {
    id: "heat_stroke",
    emergency_type: "Heat Stroke",
    title: {
      en: "Severe Heat Stroke & Sunstroke",
      hi: "लू लगना और हीट स्ट्रोक उपचार",
      te: "వడదెబ్బ అత్యవసర ఉపశమనం",
      or: "ଅଂଶୁଘାତ ପ୍ରାଥମିକ ଚିକିତ୍ସା"
    },
    severity: "CRITICAL",
    icon: "Sun",
    immediate_dos: {
      en: [
        "Move victim to a cool shaded area or fan-cooled room immediately.",
        "Loosen clothes and sponge the body thoroughly with cool (not freezing) water.",
        "Place cold wet cloths on neck, armpits, and groin where major blood vessels run.",
        "If conscious, give Oral Rehydration Salts (ORS), coconut water, or salted buttermilk (Chhachh).",
        "Monitor breathing and rush to hospital if temperature stays above 103°F (39.5°C)."
      ],
      hi: [
        "मरीज को तुरंत छायादार या पंखे वाली ठंडी जगह पर ले जाएं।",
        "कपड़े ढीले करें और सामान्य ठंडे पानी की पट्टियां पूरे शरीर पर रखें।",
        "गर्दन, बगल (armpits) और जांघों पर ठंडी गीली पट्टी रखें।",
        "होश में होने पर ओआरएस (ORS), नारियल पानी या छाछ पिलाएं।"
      ],
      te: [
        "బాధితుడిని వెంటనే చల్లని నీడ ఉన్న ప్రదేశానికి తీసుకెళ్లండి.",
        "దుస్తులను వదులు చేసి చల్లని నీటితో శరీరాన్ని తుడవండి.",
        "స్పృహలో ఉంటే ఓఆర్ఎస్ (ORS), కొబ్బరి నీళ్లు తాగించండి."
      ],
      or: [
        "ରୋଗୀଙ୍କୁ ତୁରନ୍ତ ଛାଇ ସ୍ଥାନକୁ ନିଅନ୍ତୁ।",
        "ଶରୀରକୁ ଥଣ୍ଡା ପାଣିରେ ପୋଛି ଦିଅନ୍ତୁ ଏବଂ ଓଆରଏସ ପିଇବାକୁ ଦିଅନ୍ତୁ।"
      ]
    },
    strict_donts: {
      en: [
        "DO NOT give liquids if the patient is unconscious or drowsy (causes choking).",
        "DO NOT immerse in ice-cold water, which causes shivering and raises core heat.",
        "DO NOT give aspirin or paracetamol; they do not lower environmental heat stroke temperature."
      ],
      hi: [
        "बेहोश मरीज के मुंह में पानी या कोई तरल न डालें (दम घुट सकता है)।",
        "बर्फ वाले पानी में न डुबोएं।",
        "पैरासिटामोल या एस्पिरिन न दें; यह लू के बुखार में काम नहीं करती।"
      ],
      te: [
        "స్పృహ లేని వ్యక్తికి నీరు లేదా ద్రవాలు తాగించవద్దు.",
        "పారాసెటమాల్ ఇవ్వవద్దు; ఇది వడదెబ్బ వేడిని తగ్గించదు."
      ],
      or: [
        "ଅଚେତ ଥିବା ବ୍ୟକ୍ତିଙ୍କୁ କୌଣସି ପାନୀୟ ଦିଅନ୍ତୁ ନାହିଁ।"
      ]
    },
    helpline: "108"
  },
  {
    id: "burns",
    emergency_type: "Thermal & Fire Burns",
    title: {
      en: "Burns & Scalds Treatment",
      hi: "आग या गर्म तरल से जलने पर उपचार",
      te: "కాలిన గాయాల తక్షణ రక్షణ",
      or: "ପୋଡ଼ା ଘାଆ ପ୍ରାଥମିକ ଚିକିତ୍ସା"
    },
    severity: "HIGH",
    icon: "Flame",
    immediate_dos: {
      en: [
        "Immediately hold burned area under cool running tap water for at least 15-20 minutes.",
        "Gently remove rings or restrictive items before swelling starts.",
        "Cover the burn loosely with a clean, dry cloth or sterile cling film.",
        "Keep the patient warm with a clean blanket to prevent shock."
      ],
      hi: [
        "जले हुए हिस्से को तुरंत 15-20 मिनट तक नल के ठंडे बहते पानी के नीचे रखें।",
        "अंगूठी और गहने तुरंत निकाल लें।",
        "साफ और सूखे कपड़े या स्टेराइल पट्टी से ढीला ढकें।"
      ],
      te: [
        "కాలిన భాగాన్ని 15-20 నిమిషాల పాటు ప్రవహించే చల్లని నీటి కింద ఉంచండి.",
        "శుభ్రమైన పొడి గుడ్డతో వదులుగా కప్పండి."
      ],
      or: [
        "ପୋଡ଼ି ଯାଇଥିବା ସ୍ଥାନକୁ ୧୫-୨୦ ମିନିଟ ପର୍ଯ୍ୟନ୍ତ ଥଣ୍ଡା ପାଣିରେ ଧୁଅନ୍ତୁ।"
      ]
    },
    strict_donts: {
      en: [
        "DO NOT burst blisters; intact skin protects against fatal infections.",
        "DO NOT apply toothpaste, butter, turmeric, oil, or flour on the wound.",
        "DO NOT apply ice directly on burns; it destroys damaged tissue."
      ],
      hi: [
        "छालों (blisters) को बिल्कुल न फोड़ें; इनसे संक्रमण हो सकता है।",
        "टूथपेस्ट, घी, तेल, हल्दी या आटा बिल्कुल न लगाएं।",
        "बर्फ सीधे न लगाएं।"
      ],
      te: [
        "పొక్కులను పగలగొట్టవద్దు.",
        "టూత్‌పేస్ట్, నూనె, పసుపు లేదా పిండి రాయవద్దు."
      ],
      or: [
        "ଫୋଟକା ଗୁଡ଼ିକୁ ଫୁଟାନ୍ତୁ ନାହିଁ। ତେଲ ବା ଟୁଥପେଷ୍ଟ ଲଗାନ୍ତୁ ନାହିଁ।"
      ]
    },
    helpline: "108"
  },
  {
    id: "cpr_choking",
    emergency_type: "CPR & Cardiac Arrest",
    title: {
      en: "Hands-Only CPR & Adult Choking",
      hi: "सीपीआर (CPR) - दिल की धड़कन रुकने पर",
      te: "సీపీఆర్ (CPR) - ప్రాణరక్షణ పద్ధతి",
      or: "ସିପିଆର (CPR) - ଜୀବନ ରକ୍ଷା କୌଶଳ"
    },
    severity: "CRITICAL",
    icon: "HeartPulse",
    immediate_dos: {
      en: [
        "Check responsiveness: Shake shoulders and shout 'Are you OK?'.",
        "Call 108 immediately for an ambulance.",
        "Place heel of hand in the center of the chest; place other hand on top with fingers interlocked.",
        "Push HARD and FAST in the center of chest at a rate of 100-120 beats per minute (to the beat of 'Stayin Alive').",
        "Allow chest to rise completely between each compression. Do not stop until medical help arrives."
      ],
      hi: [
        "जांचें: मरीज के कंधे हिलाकर पूछें 'क्या आप ठीक हैं?'.",
        "तुरंत 108 नंबर पर एम्बुलेंस बुलाएं।",
        "मरीज की छाती के बीच में एक हथेली रखें, दूसरी हथेली ऊपर फंसाएं।",
        "छाती को जोर से और तेजी से दबाएं (प्रति मिनट 100-120 बार)।",
        "जब तक एम्बुलेंस न आ जाए, छाती दबाना बंद न करें।"
      ],
      te: [
        "స్పందనను తనిఖీ చేయండి: భుజాలను కదిలించి 'మీరు బాగున్నారా?' అని అడగండి.",
        "వెంటనే 108 కి కాల్ చేయండి.",
        "రొమ్ము మధ్యలో గట్టిగా మరియు వేగంగా నొక్కండి (నిమిషానికి 100-120 సార్లు)."
      ],
      or: [
        "ତୁରନ୍ତ ୧୦୮ କୁ କଲ୍ କରନ୍ତୁ ଏବଂ ଛାତି ମଝିରେ ଦ୍ରୁତ ଗତିରେ ଚାପ ଦିଅନ୍ତୁ।"
      ]
    },
    strict_donts: {
      en: [
        "DO NOT stop chest compressions for more than 10 seconds.",
        "DO NOT attempt rescue breaths if untrained; continuous hands-only CPR saves lives."
      ],
      hi: [
        "10 सेकंड से ज्यादा समय तक छाती दबाना बंद न करें।"
      ],
      te: [
        "వైద్య సహాయం అందే వరకు ఛాతీ నొక్కడం ఆపవద్దు."
      ],
      or: [
        "ଡାକ୍ତର ଆସିବା ପର୍ଯ୍ୟନ୍ତ ସିପିଆର ବନ୍ଦ କରନ୍ତୁ ନାହିଁ।"
      ]
    },
    helpline: "108"
  },
  {
    id: "severe_bleeding",
    emergency_type: "Heavy Bleeding",
    title: {
      en: "Heavy Bleeding & Deep Cuts",
      hi: "गंभीर रक्तस्राव और गहरे घाव",
      te: "తీవ్రమైన రక్తస్రావం నియంత్రణ",
      or: "ଅତ୍ୟଧିକ ରକ୍ତସ୍ରାବ ରୋକିବା"
    },
    severity: "HIGH",
    icon: "Activity",
    immediate_dos: {
      en: [
        "Apply firm, continuous direct pressure over the wound using a clean cloth or sterile pad.",
        "Keep the injured limb elevated above heart level if no fracture is suspected.",
        "If blood soaks through the cloth, DO NOT remove it; add another cloth on top and keep pressing.",
        "Wrap a firm bandage over the pads to maintain pressure during transit to hospital."
      ],
      hi: [
        "साफ कपड़े या पैड से घाव पर सीधा, लगातार दबाव बनाएं।",
        "अगर हड्डी टूटने का शक न हो तो अंग को दिल के स्तर से ऊपर उठाएं।",
        "अगर कपड़ा खून से भीग जाए तो उसे हटाएं नहीं, उसके ऊपर दूसरा कपड़ा रखकर दबाएं।"
      ],
      te: [
        "శుభ్రమైన గుడ్డతో గాయంపై గట్టిగా నొక్కి పట్టుకోండి.",
        "రక్తం కారుతున్న భాగాన్ని పైకి ఎత్తి ఉంచండి."
      ],
      or: [
        "କ୍ଷତ ସ୍ଥାନକୁ ସଫା କପଡ଼ାରେ ଜୋରରେ ଚାପି ଧରନ୍ତୁ।"
      ]
    },
    strict_donts: {
      en: [
        "DO NOT remove embedded objects (like glass or knife); stabilize them in place with rolled cloths.",
        "DO NOT remove soaked dressings as it tears away freshly forming blood clots."
      ],
      hi: [
        "घाव में फंसी हुई वस्तु (जैसे कांच या कील) को खुद न निकालें; उसके चारों तरफ कपड़ा लगाकर सहारा दें।"
      ],
      te: [
        "గాయంలో గుచ్చుకున్న వస్తువులను బయటకు లాగవద్దు."
      ],
      or: [
        "ଫସି ରହିଥିବା କାଚ ବା ଛୁରୀକୁ ବାହାର କରନ୍ତୁ ନାହିଁ।"
      ]
    },
    helpline: "108"
  }
];

export const EMERGENCY_CONTACTS = [
  { name: "Ambulance Emergency", number: "108", desc: "24/7 Free Govt Emergency Ambulance" },
  { name: "Medical Advice Helpline", number: "104", desc: "Toll-free Doctor Advice & Guidance" },
  { name: "National Emergency Service", number: "112", desc: "Police, Fire, and Medical Dispatch" },
  { name: "Disaster Management Helpline", number: "1070", desc: "State Disaster & Cyclone Response" }
];
