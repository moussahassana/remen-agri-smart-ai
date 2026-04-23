import { Translation } from './types';

export const TRANSLATIONS: Record<string, Translation> = {
  FR: {
    title: "AgriSmart AI",
    subtitle: "L’agronome dans ta poche",
    describeIssue: "Décris ton problème (ex: Maïs jaunit)",
    analyze: "Analyser",
    quickActions: "Cultures rapides",
    diagnosisLabel: "Diagnostic probable",
    causesLabel: "Causes",
    solutionsLabel: "Solutions locales",
    urgencyLabel: "Urgence",
    preventionLabel: "Prévention",
    healthScoreLabel: "Score de santé",
    offlineMode: "Mode hors ligne actif",
    dailyTip: "Conseil du jour",
    library: "Bibliothèque locale",
    immediateAction: "Action immédiate",
    voiceMode: "Mode vocal",
    takePhoto: "Prendre une photo",
    history: "Historique",
    settings: "Réglages",
    cultures: {
      maize: "Maïs",
      millet: "Mil",
      okra: "Gombo",
      sorghum: "Sorgho",
      cotton: "Coton"
    }
  },
  FUL: {
    title: "AgriSmart AI",
    subtitle: "Nyamande agronome e beelu ma",
    describeIssue: "Wolwan mbon nande ma (bana: Kamana oolake)",
    analyze: "Fasita",
    quickActions: "Demal jaawngal",
    diagnosisLabel: "Ko laatii e mbon nande",
    causesLabel: "Saabeji",
    solutionsLabel: "Dawalji nokkuure",
    urgencyLabel: "Yaawugo",
    preventionLabel: "Reenugo",
    healthScoreLabel: "Sanda yamdele",
    offlineMode: "Mode offline ɗon huuwa",
    dailyTip: "Keesu hande",
    library: "Deftere mbon nande",
    immediateAction: "Kuugal jaawngal",
    voiceMode: "Wolwugo",
    takePhoto: "Hoosa hoto",
    history: "Ko saali",
    settings: "Settuji",
    cultures: {
      maize: "Kamana",
      millet: "Mayeeri",
      okra: "Takko",
      sorghum: "Gawri",
      cotton: "Hottollo"
    }
  },
  EN: {
    title: "AgriSmart AI",
    subtitle: "The agronomist in your pocket",
    describeIssue: "Describe your problem (e.g., Maize yellowing)",
    analyze: "Analyze",
    quickActions: "Quick Crops",
    diagnosisLabel: "Probable Diagnosis",
    causesLabel: "Causes",
    solutionsLabel: "Local Solutions",
    urgencyLabel: "Urgency",
    preventionLabel: "Prevention",
    healthScoreLabel: "Health Score",
    offlineMode: "Offline mode active",
    dailyTip: "Daily Tip",
    library: "Local Library",
    immediateAction: "Immediate Action",
    voiceMode: "Voice Mode",
    takePhoto: "Take a photo",
    history: "History",
    settings: "Settings",
    cultures: {
      maize: "Maize",
      millet: "Millet",
      okra: "Okra",
      sorghum: "Sorghum",
      cotton: "Cotton"
    }
  }
};

export const DAILY_TIPS = [
  "Pensez à pailler vos cultures pour garder l'humidité du sol pendant la saison sèche.",
  "Utilisez les feuilles de neem macérées pour lutter naturellement contre les criquets.",
  "La rotation des cultures aide à prévenir l'épuisement des nutriments du sol.",
  "L'apport de fumier bien décomposé renforce la résistance de vos plantes.",
  "Désherbez tôt pour éviter que les mauvaises herbes ne volent l'eau de vos cultures."
];

export const COMMON_DISEASES = [
  {
    culture: "Maïs",
    name: "Chenille Légionnaire d'Automne",
    symptoms: "Feuilles dentelées, présence de déjections",
    solution: "Ramassage manuel ou extraits de piment/neem."
  },
  {
    culture: "Mil",
    name: "Mildiou",
    symptoms: "Dépôt blanc sur les feuilles, épis déformés",
    solution: "Arracher et brûler les plants infectés pour éviter la propagation."
  },
  {
    culture: "Gombo",
    name: "Oïdium",
    symptoms: "Poudre blanche sur les feuilles",
    solution: "Solution d'eau et savon de Marseille ou soufre si disponible."
  }
];

export const SYSTEM_PROMPT = `
Tu es un expert agronome spécialisé dans les cultures d’Afrique de l’Ouest (Sénégal, Mali, Niger, Burkina Faso, Tchad, Nord Cameroun).
Ton objectif est d'aider les petits agriculteurs avec des solutions locales, peu coûteuses et accessibles.

Instructions :
1. Analyse le problème décrit par l'agriculteur.
2. Si mentionné, tiens compte du contexte climatique (chaleur intense, saison sèche ou pluies).
3. Utilise un langage simple, évite le jargon.
4. Réponds STRICTEMENT au format JSON suivant :
{
  "probableDiagnosis": "string",
  "causes": "string",
  "solutions": "string",
  "urgency": "string",
  "prevention": "string",
  "healthScore": number (0-10),
  "healthScoreExplanation": "string"
}

Rappelle-toi des cultures et problèmes précédents si fournis dans l'historique pour faire des liens pertinents.
`;
