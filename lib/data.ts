// ============================================
// TABLE 1: LEVELS - Structure de progression
// ============================================
export interface Level {
  id: number
  name: string
  name_fr: string
  unlock_criteria: number // Score % nécessaire au niveau précédent
  theme_color: string
  glow_color: string
  description: string
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Novice",
    name_fr: "Novice",
    unlock_criteria: 0,
    theme_color: "var(--neon-cyan)", // Cyan
    glow_color: "0 0 20px var(--neon-cyan)",
    description: "Découvrez les fondamentaux des biais cognitifs",
  },
  {
    id: 2,
    name: "Practitioner",
    name_fr: "Praticien",
    unlock_criteria: 70,
    theme_color: "var(--neon-orange)", // Orange néon
    glow_color: "0 0 20px var(--neon-orange)",
    description: "Appliquez vos connaissances à des cas UX réels",
  },
  {
    id: 3,
    name: "Expert",
    name_fr: "Expert",
    unlock_criteria: 70,
    theme_color: "var(--neon-purple)", // Violet néon
    glow_color: "0 0 20px var(--neon-purple)",
    description: "Maîtrisez les biais avancés et leurs implications stratégiques",
  },
]

// ============================================
// TABLE 2: QUESTIONS - Contenu du Quiz
// ============================================
export type UIInteraction = "MULTIPLE_CHOICE" | "DRAG_DROP" | "HOTSPOT" | "PRICE_GRID"

export interface QuestionOption {
  text: string
  is_correct: boolean
  bias_id: string | null
}

export interface Question {
  id: string
  level_id: number
  scenario: string
  options: QuestionOption[]
  explanation: string
  ui_interaction: UIInteraction
  experience_data?: any // Données pour les interactions spéciales
}

export const QUESTIONS: Question[] = [
  // ========== NIVEAU 1 - NOVICE ==========
  {
    id: "N1-01",
    level_id: 1,
    scenario: "Un utilisateur trouve une app très esthétique, donc il pense qu'elle est facile à utiliser.",
    options: [
      { text: "Effet de Halo", is_correct: true, bias_id: "halo_effect" },
      { text: "Preuve Sociale", is_correct: false, bias_id: "social_proof" },
      { text: "Biais de Confirmation", is_correct: false, bias_id: "confirmation_bias" },
    ],
    explanation: "L'Effet de Halo (ou Esthétique-Usabilité) : le beau est perçu comme fonctionnel.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-02",
    level_id: 1,
    scenario: "Un utilisateur ne lit que les avis qui confirment son envie d'acheter ce produit.",
    options: [
      { text: "Biais de Confirmation", is_correct: true, bias_id: "confirmation_bias" },
      { text: "Biais d'Ancrage", is_correct: false, bias_id: "anchoring" },
      { text: "Biais de Récence", is_correct: false, bias_id: "recency_bias" },
    ],
    explanation: "Le Biais de Confirmation privilégie les infos qui valident nos croyances.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-03",
    level_id: 1,
    scenario: 'Le premier prix vu est de 1000€, le second à 800€ semble alors "pas cher".',
    options: [
      { text: "Biais d'Ancrage", is_correct: true, bias_id: "anchoring" },
      { text: "Effet de Leurre", is_correct: false, bias_id: "decoy_effect" },
      { text: "Aversion à la perte", is_correct: false, bias_id: "loss_aversion" },
    ],
    explanation: "Le premier chiffre sert d'Ancre mentale pour toutes les comparaisons futures.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-04",
    level_id: 1,
    scenario: "Trop de choix tue le choix : l'utilisateur abandonne car c'est trop compliqué.",
    options: [
      { text: "Loi de Fitts", is_correct: false, bias_id: "fitts_law" },
      { text: "Loi de Hick", is_correct: true, bias_id: "hicks_law" },
      { text: "Loi de Miller", is_correct: false, bias_id: "millers_law" },
    ],
    explanation: "La Loi de Hick : le temps de décision augmente avec le nombre d'options.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-05",
    level_id: 1,
    scenario: "On retient mieux le début et la fin d'une liste que le milieu.",
    options: [
      { text: "Effet de Position Série", is_correct: true, bias_id: "serial_position" },
      { text: "Effet Von Restorff", is_correct: false, bias_id: "von_restorff" },
      { text: "Effet Zeigarnik", is_correct: false, bias_id: "zeigarnik" },
    ],
    explanation: "C'est l'Effet de Position Série (combinaison de Primauté et Récence).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-06",
    level_id: 1,
    scenario: "La peur de perdre 10€ est plus forte que la joie d'en gagner 10.",
    options: [
      { text: "Aversion à la perte", is_correct: true, bias_id: "loss_aversion" },
      { text: "Biais de Négativité", is_correct: false, bias_id: "negativity_bias" },
      { text: "Effet de Dotation", is_correct: false, bias_id: "endowment_effect" },
    ],
    explanation: "L'Aversion à la perte : la douleur de perdre est psychologiquement 2x plus forte.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-07",
    level_id: 1,
    scenario: '"Déjà 10 000 utilisateurs inscrits !" affiché sur la home page.',
    options: [
      { text: "Preuve Sociale", is_correct: true, bias_id: "social_proof" },
      { text: "Effet de Cadre", is_correct: false, bias_id: "framing" },
      { text: "Biais d'Autorité", is_correct: false, bias_id: "authority_bias" },
    ],
    explanation: "La Preuve Sociale (Bandwagon) : on suit le comportement du groupe.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-08",
    level_id: 1,
    scenario: "Dans une liste de texte noir, le bouton rouge attire l'attention.",
    options: [
      { text: "Effet Von Restorff", is_correct: true, bias_id: "von_restorff" },
      { text: "Cécité au changement", is_correct: false, bias_id: "change_blindness" },
      { text: "Effet Stroop", is_correct: false, bias_id: "stroop_effect" },
    ],
    explanation: "L'Effet Von Restorff (Isolation) : l'élément qui diffère se retient mieux.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-09",
    level_id: 1,
    scenario: "Une tâche inachevée (barre de progression à 90%) reste en tête de l'utilisateur.",
    options: [
      { text: "Effet Zeigarnik", is_correct: true, bias_id: "zeigarnik" },
      { text: "Loi de Parkinson", is_correct: false, bias_id: "parkinsons_law" },
      { text: "Effet de Récence", is_correct: false, bias_id: "recency_effect" },
    ],
    explanation: "L'Effet Zeigarnik : on se souvient mieux des tâches interrompues.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-10",
    level_id: 1,
    scenario: "Les utilisateurs s'attendent à ce que votre site fonctionne comme Amazon/Google.",
    options: [
      { text: "Loi de Jakob", is_correct: true, bias_id: "jakobs_law" },
      { text: "Loi de Moore", is_correct: false, bias_id: "moores_law" },
      { text: "Loi de Postel", is_correct: false, bias_id: "postels_law" },
    ],
    explanation: "La Loi de Jakob : les utilisateurs passent leur temps sur d'autres sites, copiez les standards.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-11",
    level_id: 1,
    scenario: "Si vous offrez un ebook gratuit, l'utilisateur se sent obligé de donner son email.",
    options: [
      { text: "Réciprocité", is_correct: true, bias_id: "reciprocity" },
      { text: "Engagement", is_correct: false, bias_id: "commitment" },
      { text: "Cohérence", is_correct: false, bias_id: "consistency" },
    ],
    explanation: "Le principe de Réciprocité : un don appelle un contre-don.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-12",
    level_id: 1,
    scenario: '"Offre valable encore 10 minutes !"',
    options: [
      { text: "Rareté (Scarcity)", is_correct: false, bias_id: "scarcity" },
      { text: "Urgence", is_correct: false, bias_id: "urgency" },
      { text: "Les deux", is_correct: true, bias_id: "scarcity_urgency" },
    ],
    explanation: "C'est le principe de Rareté couplé à l'urgence temporelle.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-13",
    level_id: 1,
    scenario: "Un expert en blouse blanche recommande ce dentifrice.",
    options: [
      { text: "Biais d'Autorité", is_correct: true, bias_id: "authority_bias" },
      { text: "Effet de Halo", is_correct: false, bias_id: "halo_effect" },
      { text: "Biais de Cadrage", is_correct: false, bias_id: "framing" },
    ],
    explanation: "Le Biais d'Autorité : on fait confiance aux figures d'autorité perçues.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-14",
    level_id: 1,
    scenario: 'Présenter un yaourt comme "90% sans matière grasse" plutôt que "10% de gras".',
    options: [
      { text: "Effet de Cadrage", is_correct: true, bias_id: "framing" },
      { text: "Ancrage", is_correct: false, bias_id: "anchoring" },
      { text: "Leurre", is_correct: false, bias_id: "decoy_effect" },
    ],
    explanation: "L'Effet de Cadrage (Framing) : la formulation change la perception positive/négative.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-15",
    level_id: 1,
    scenario: "Penser qu'une personne calme est forcément bibliothécaire plutôt qu'agriculteur.",
    options: [
      { text: "Représentativité", is_correct: false, bias_id: "representativeness" },
      { text: "Stéréotype", is_correct: false, bias_id: "stereotype" },
      { text: "Les deux", is_correct: true, bias_id: "representativeness_stereotype" },
    ],
    explanation: "L'Heuristique de Représentativité se base sur des stéréotypes pour juger.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-16",
    level_id: 1,
    scenario: "Surestimer le danger des avions car on a vu un crash aux infos hier.",
    options: [
      { text: "Biais de Disponibilité", is_correct: true, bias_id: "availability_bias" },
      { text: "Biais de Survivant", is_correct: false, bias_id: "survivorship_bias" },
      { text: "Biais de Normalité", is_correct: false, bias_id: "normalcy_bias" },
    ],
    explanation: "Le Biais de Disponibilité : on juge sur les infos récentes/marquantes en mémoire.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-17",
    level_id: 1,
    scenario: "Un débutant pense tout savoir sur l'UX après un article Medium.",
    options: [
      { text: "Dunning-Kruger", is_correct: true, bias_id: "dunning_kruger" },
      { text: "Biais d'Optimisme", is_correct: false, bias_id: "optimism_bias" },
      { text: "Excès de Confiance", is_correct: false, bias_id: "overconfidence" },
    ],
    explanation: "L'Effet Dunning-Kruger : les incompétents surestiment leur compétence.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-18",
    level_id: 1,
    scenario: 'Après 5 tirages "Rouge" à la roulette, on parie "Noir" car "ça doit sortir".',
    options: [
      { text: "L'erreur du Parieur", is_correct: true, bias_id: "gamblers_fallacy" },
      { text: "Biais de la main chaude", is_correct: false, bias_id: "hot_hand" },
      { text: "Illusion de contrôle", is_correct: false, bias_id: "illusion_control" },
    ],
    explanation: "L'Erreur du Parieur (Gambler's Fallacy) : croire que le hasard s'auto-corrige.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-19",
    level_id: 1,
    scenario: "Accorder plus de valeur à un objet simplement parce qu'il nous appartient.",
    options: [
      { text: "Effet de Dotation", is_correct: true, bias_id: "endowment_effect" },
      { text: "Aversion à la perte", is_correct: false, bias_id: "loss_aversion" },
      { text: "Coût irrécupérable", is_correct: false, bias_id: "sunk_cost" },
    ],
    explanation: "L'Effet de Dotation (Endowment Effect) : posséder augmente la valeur perçue.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N1-20",
    level_id: 1,
    scenario: "Le fait de remarquer partout la voiture qu'on vient d'acheter.",
    options: [
      { text: "Illusion de Fréquence", is_correct: true, bias_id: "frequency_illusion" },
      { text: "Biais de Confirmation", is_correct: false, bias_id: "confirmation_bias" },
      { text: "Biais d'Attention", is_correct: false, bias_id: "attention_bias" },
    ],
    explanation: "L'Illusion de Fréquence (Baader-Meinhof) : une info apprise semble apparaître partout.",
    ui_interaction: "MULTIPLE_CHOICE",
  },

  // ========== NIVEAU 2 - PRATICIEN ==========
  {
    id: "N2-01",
    level_id: 2,
    scenario: "Pour vendre l'offre Medium, on ajoute une offre Large très chère et peu intéressante.",
    options: [
      { text: "Effet de Leurre", is_correct: true, bias_id: "decoy_effect" },
      { text: "Ancrage", is_correct: false, bias_id: "anchoring" },
      { text: "Contraste", is_correct: false, bias_id: "contrast" },
    ],
    explanation: "L'Effet de Leurre (Decoy Effect) pousse vers l'option cible en créant une comparaison asymétrique.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-02",
    level_id: 2,
    scenario: 'La case "S\'abonner à la newsletter" est cochée par défaut.',
    options: [
      { text: "Statu Quo", is_correct: true, bias_id: "status_quo" },
      { text: "Opt-in", is_correct: false, bias_id: "opt_in" },
      { text: "Nudge", is_correct: false, bias_id: "nudge" },
    ],
    explanation: "Le Biais de Statu Quo : l'utilisateur a tendance à ne pas changer l'état par défaut.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-03",
    level_id: 2,
    scenario: "Grouper les champs de formulaire (Adresse, Paiement) pour réduire la fatigue.",
    options: [
      { text: "Chunking", is_correct: true, bias_id: "chunking" },
      { text: "Loi de Fitts", is_correct: false, bias_id: "fitts_law" },
      { text: "Loi de Miller", is_correct: false, bias_id: "millers_law" },
    ],
    explanation: "Le Chunking (lié à la Loi de Miller) aide à traiter l'info par petits paquets (7 ± 2 éléments).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-04",
    level_id: 2,
    scenario: "Un design épuré cache des fonctionnalités complexes, frustrant l'utilisateur expert.",
    options: [
      { text: "Aesthetic-Usability", is_correct: true, bias_id: "aesthetic_usability" },
      { text: "Form over Function", is_correct: false, bias_id: "form_function" },
      { text: "Biais de complexité", is_correct: false, bias_id: "complexity_bias" },
    ],
    explanation: "L'Effet Esthétique-Usabilité peut masquer des problèmes d'UX graves si le UI est joli.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-05",
    level_id: 2,
    scenario: 'Le "Pull-to-refresh" d\'Instagram qui donne une récompense aléatoire (nouveaux posts).',
    options: [
      { text: "Récompense Variable", is_correct: true, bias_id: "variable_reward" },
      { text: "Gamification", is_correct: false, bias_id: "gamification" },
      { text: "Hook Model", is_correct: false, bias_id: "hook_model" },
    ],
    explanation: "Le principe de Récompense Variable (comme au casino) crée une addiction (Dopamine).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-06",
    level_id: 2,
    scenario: "Montrer une barre de progression déjà remplie à 10% lors du premier login.",
    options: [
      { text: "Gradient de But", is_correct: false, bias_id: "goal_gradient" },
      { text: "Effet Zeigarnik", is_correct: false, bias_id: "zeigarnik" },
      { text: "Endowed Progress", is_correct: true, bias_id: "endowed_progress" },
    ],
    explanation: "L'Endowed Progress Effect : on est plus motivé à finir si on pense avoir déjà commencé.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-07",
    level_id: 2,
    scenario: "Un message d'erreur rouge \"VOUS AVEZ FAIT UNE FAUTE\" stresse l'utilisateur.",
    options: [
      { text: "Biais de Négativité", is_correct: true, bias_id: "negativity_bias" },
      { text: "Charge Cognitive", is_correct: false, bias_id: "cognitive_load" },
      { text: "Framing", is_correct: false, bias_id: "framing" },
    ],
    explanation:
      "Le Biais de Négativité fait que l'utilisateur retient plus l'agression que l'aide. Utilisez un wording positif.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-08",
    level_id: 2,
    scenario: "Faire culpabiliser l'utilisateur pour qu'il ne se désabonne pas (\"Non, je n'aime pas les promos\").",
    options: [
      { text: "Confirmshaming", is_correct: true, bias_id: "confirmshaming" },
      { text: "Gaslighting", is_correct: false, bias_id: "gaslighting" },
      { text: "FOMO", is_correct: false, bias_id: "fomo" },
    ],
    explanation: "Le Confirmshaming est un Dark Pattern qui exploite la honte pour manipuler.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-09",
    level_id: 2,
    scenario: "Cliquez sur l'offre que le site VEUT que vous choisissiez.",
    options: [
      { text: "Basic - 9€/mois", is_correct: false, bias_id: null },
      { text: "Pro - 19€/mois ⭐ Populaire", is_correct: true, bias_id: "center_stage" },
      { text: "Enterprise - 49€/mois", is_correct: false, bias_id: null },
    ],
    explanation:
      "L'Effet Centre-Stage : préférence pour l'option centrale dans une disposition horizontale, renforcée par le badge 'Populaire'.",
    ui_interaction: "PRICE_GRID",
    experience_data: {
      type: "pricing",
      options: [
        { name: "Basic", price: "9€/mois", features: ["1 utilisateur", "5 Go stockage"], highlighted: false },
        {
          name: "Pro",
          price: "19€/mois",
          features: ["5 utilisateurs", "50 Go stockage", "Support prioritaire"],
          highlighted: true,
          badge: "⭐ Populaire",
        },
        {
          name: "Enterprise",
          price: "49€/mois",
          features: ["Illimité", "500 Go stockage", "Support 24/7"],
          highlighted: false,
        },
      ],
    },
  },
  {
    id: "N2-10",
    level_id: 2,
    scenario: "Un bouton CTA isolé par beaucoup d'espace blanc.",
    options: [
      { text: "Effet Von Restorff", is_correct: true, bias_id: "von_restorff" },
      { text: "Loi de la Proximité", is_correct: false, bias_id: "proximity_law" },
      { text: "Loi de la Clôture", is_correct: false, bias_id: "closure_law" },
    ],
    explanation: "Utilise l'Effet d'Isolation pour attirer l'attention par le vide (White Space).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-11",
    level_id: 2,
    scenario: 'Afficher "Sophie de Paris vient d\'acheter cet article" en popup.',
    options: [
      { text: "Preuve Sociale", is_correct: true, bias_id: "social_proof" },
      { text: "Urgence", is_correct: false, bias_id: "urgency" },
      { text: "Notification", is_correct: false, bias_id: "notification" },
    ],
    explanation: "C'est une application directe de la Preuve Sociale pour rassurer.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-12",
    level_id: 2,
    scenario: "L'utilisateur tape \"Pourquoi l'iPhone est nul\" et ne trouve que des défauts.",
    options: [
      { text: "Biais de Confirmation", is_correct: true, bias_id: "confirmation_bias" },
      { text: "Biais de Recherche", is_correct: false, bias_id: "search_bias" },
      { text: "Algorithme", is_correct: false, bias_id: "algorithm" },
    ],
    explanation: "Les moteurs de recherche renforcent le Biais de Confirmation via les mots-clés saisis.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-13",
    level_id: 2,
    scenario: 'Utiliser une icône "Maison" pour l\'accueil plutôt qu\'un texte "Accueil".',
    options: [
      { text: "Reconnaissance vs Rappel", is_correct: true, bias_id: "recognition_recall" },
      { text: "Iconicité", is_correct: false, bias_id: "iconicity" },
      { text: "Affordance", is_correct: false, bias_id: "affordance" },
    ],
    explanation: "Favoriser la Reconnaissance plutôt que le Rappel : l'image universelle réduit la charge mentale.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-14",
    level_id: 2,
    scenario: 'Afficher une animation de "calcul" factice pour montrer que l\'algo travaille dur.',
    options: [
      { text: "Illusion du Labeur", is_correct: true, bias_id: "labor_illusion" },
      { text: "Attente active", is_correct: false, bias_id: "active_waiting" },
      { text: "Skeuomorphisme", is_correct: false, bias_id: "skeuomorphism" },
    ],
    explanation: "L'Illusion du Labeur : on valorise plus un service si on \"voit\" l'effort (même simulé).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-15",
    level_id: 2,
    scenario: "Permettre à l'utilisateur de personnaliser son dashboard.",
    options: [
      { text: "Effet Ikea", is_correct: true, bias_id: "ikea_effect" },
      { text: "Customization", is_correct: false, bias_id: "customization" },
      { text: "Appropriation", is_correct: false, bias_id: "appropriation" },
    ],
    explanation: "L'Effet Ikea : on aime disproportionnellement ce qu'on a co-créé ou assemblé.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-16",
    level_id: 2,
    scenario: 'Commencer par un petit "J\'aime" avant de demander un achat.',
    options: [
      { text: "Pied-dans-la-porte", is_correct: false, bias_id: "foot_in_door" },
      { text: "Cohérence", is_correct: false, bias_id: "consistency" },
      { text: "Les deux", is_correct: true, bias_id: "foot_door_consistency" },
    ],
    explanation: "Technique du Pied-dans-la-porte qui joue sur le besoin de Cohérence (Consistency).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-17",
    level_id: 2,
    scenario: "Mettre les infos les moins importantes au milieu d'une Long Page de vente.",
    options: [
      { text: "Serial Position Effect", is_correct: true, bias_id: "serial_position" },
      { text: "Hiérarchie visuelle", is_correct: false, bias_id: "visual_hierarchy" },
      { text: "F pattern", is_correct: false, bias_id: "f_pattern" },
    ],
    explanation: 'On cache le "mou" au milieu car on sait que l\'utilisateur scannera Début/Fin (Serial Position).',
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-18",
    level_id: 2,
    scenario: "Agrandir la zone cliquable d'un bouton sur mobile.",
    options: [
      { text: "Loi de Fitts", is_correct: true, bias_id: "fitts_law" },
      { text: "Loi de Touch", is_correct: false, bias_id: "touch_law" },
      { text: "Accessibilité", is_correct: false, bias_id: "accessibility" },
    ],
    explanation: "La Loi de Fitts : le temps d'accès dépend de la distance et de la taille de la cible.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-19",
    level_id: 2,
    scenario: "Une popup surgit trop vite : l'utilisateur la ferme par réflexe sans lire.",
    options: [
      { text: "Réactance", is_correct: true, bias_id: "reactance" },
      { text: "Cécité bannière", is_correct: false, bias_id: "banner_blindness" },
      { text: "Reflexe moteur", is_correct: false, bias_id: "motor_reflex" },
    ],
    explanation: "La Réactance Psychologique : résistance instinctive quand on sent notre liberté menacée (intrusion).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N2-20",
    level_id: 2,
    scenario: 'Utiliser du gris pour un bouton "Annuler" et du bleu pour "Valider".',
    options: [
      { text: "Affordance", is_correct: false, bias_id: "affordance" },
      { text: "Hiérarchie visuelle", is_correct: false, bias_id: "visual_hierarchy" },
      { text: "Biais de Saillance", is_correct: true, bias_id: "salience_bias" },
    ],
    explanation: "Le Biais de Saillance guide l'œil vers l'élément le plus visible (attention aux Dark Patterns ici).",
    ui_interaction: "MULTIPLE_CHOICE",
  },

  // ========== NIVEAU 3 - EXPERT ==========
  {
    id: "N3-01",
    level_id: 3,
    scenario: 'On continue un projet raté car "on a déjà dépensé 50k€ dessus".',
    options: [
      { text: "Coûts Irrécupérables", is_correct: true, bias_id: "sunk_cost" },
      { text: "Aversion à la perte", is_correct: false, bias_id: "loss_aversion" },
      { text: "Entêtement", is_correct: false, bias_id: "stubbornness" },
    ],
    explanation: "Le biais des Coûts Irrécupérables (Sunk Cost Fallacy) aveugle la prise de décision rationnelle.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-02",
    level_id: 3,
    scenario: "Les utilisateurs changent de comportement car ils savent qu'on les observe en test.",
    options: [
      { text: "Effet Hawthorne", is_correct: true, bias_id: "hawthorne_effect" },
      { text: "Biais de l'Observateur", is_correct: false, bias_id: "observer_bias" },
      { text: "Désirabilité Sociale", is_correct: false, bias_id: "social_desirability" },
    ],
    explanation: "L'Effet Hawthorne : l'observation modifie le comportement naturel.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-03",
    level_id: 3,
    scenario: "Analyser uniquement les feedbacks des utilisateurs actifs pour améliorer le produit.",
    options: [
      { text: "Biais du Survivant", is_correct: true, bias_id: "survivorship_bias" },
      { text: "Biais de Sélection", is_correct: false, bias_id: "selection_bias" },
      { text: "Biais d'Activité", is_correct: false, bias_id: "activity_bias" },
    ],
    explanation: "Le Biais du Survivant : on oublie d'analyser ceux qui sont partis (le churn) et pourquoi.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-04",
    level_id: 3,
    scenario: "Toute l'équipe produit est d'accord sans débat pour éviter le conflit.",
    options: [
      { text: "Pensée de Groupe", is_correct: true, bias_id: "groupthink" },
      { text: "Biais de Consensus", is_correct: false, bias_id: "consensus_bias" },
      { text: "Harmonie", is_correct: false, bias_id: "harmony" },
    ],
    explanation: "La Pensée de Groupe (Groupthink) tue l'innovation critique et ignore les risques.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-05",
    level_id: 3,
    scenario: "Faire confiance aveuglément à la suggestion de l'IA sans vérifier.",
    options: [
      { text: "Biais d'Automatisation", is_correct: true, bias_id: "automation_bias" },
      { text: "Biais Algorithmique", is_correct: false, bias_id: "algorithmic_bias" },
      { text: "Paresse cognitive", is_correct: false, bias_id: "cognitive_laziness" },
    ],
    explanation: "Le Biais d'Automatisation : la propension à croire que la machine a raison sur l'humain.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-06",
    level_id: 3,
    scenario: "Créer des frictions volontaires pour empêcher une action (ex: désinscription).",
    options: [
      { text: "Sludge", is_correct: true, bias_id: "sludge" },
      { text: "Nudge", is_correct: false, bias_id: "nudge" },
      { text: "Dark Pattern", is_correct: false, bias_id: "dark_pattern" },
    ],
    explanation: "Le Sludge (Boue) est l'inverse du Nudge : de la friction mauvaise pour l'utilisateur.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-07",
    level_id: 3,
    scenario: 'Le designer ne comprend pas que l\'utilisateur ne trouve pas le bouton "évident".',
    options: [
      { text: "Malédiction du Savoir", is_correct: true, bias_id: "curse_of_knowledge" },
      { text: "Empathie Gap", is_correct: false, bias_id: "empathy_gap" },
      { text: "Biais de Projection", is_correct: false, bias_id: "projection_bias" },
    ],
    explanation: "La Malédiction du Savoir : impossible d'imaginer ne pas savoir ce qu'on sait déjà.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-08",
    level_id: 3,
    scenario: 'Penser que "tout le monde utilise son téléphone comme moi".',
    options: [
      { text: "Faux Consensus", is_correct: true, bias_id: "false_consensus" },
      { text: "Biais de Projection", is_correct: false, bias_id: "projection_bias" },
      { text: "Solipsisme", is_correct: false, bias_id: "solipsism" },
    ],
    explanation: "L'Effet de Faux Consensus : surestimer à quel point les autres nous ressemblent.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-09",
    level_id: 3,
    scenario: "Utiliser un outil (Excel) pour tout faire, même du design, car on le connait.",
    options: [
      { text: "Déformation Professionnelle", is_correct: false, bias_id: "professional_deformation" },
      { text: "Fixité Fonctionnelle", is_correct: false, bias_id: "functional_fixedness" },
      { text: "Loi de l'Instrument", is_correct: true, bias_id: "law_of_instrument" },
    ],
    explanation: "La Loi de l'Instrument (Marteau de Maslow) : \"Si j'ai un marteau, tout ressemble à un clou\".",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-10",
    level_id: 3,
    scenario: "Une mesure devient un objectif (ex: temps passé), donc on dégrade l'UX pour l'augmenter.",
    options: [
      { text: "Loi de Goodhart", is_correct: true, bias_id: "goodharts_law" },
      { text: "Loi de Campbell", is_correct: false, bias_id: "campbells_law" },
      { text: "KPI hacking", is_correct: false, bias_id: "kpi_hacking" },
    ],
    explanation: "La Loi de Goodhart : lorsqu'une mesure devient un objectif, elle cesse d'être une bonne mesure.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-11",
    level_id: 3,
    scenario: "Préférer supprimer totalement un petit risque plutôt que réduire un grand risque.",
    options: [
      { text: "Biais de Risque Zéro", is_correct: true, bias_id: "zero_risk_bias" },
      { text: "Aversion au risque", is_correct: false, bias_id: "risk_aversion" },
      { text: "Principe de précaution", is_correct: false, bias_id: "precautionary" },
    ],
    explanation: "Le Biais de Risque Zéro : notre cerveau préfère la certitude totale (0%) à la probabilité.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-12",
    level_id: 3,
    scenario: 'Après un lancement raté, dire "Je le savais, c\'était évident !".',
    options: [
      { text: "Biais Rétrospectif", is_correct: true, bias_id: "hindsight_bias" },
      { text: "Biais de Résultat", is_correct: false, bias_id: "outcome_bias" },
      { text: "Rationalisation", is_correct: false, bias_id: "rationalization" },
    ],
    explanation: "Le Biais Rétrospectif (Hindsight Bias) : réécrire l'histoire pour se donner raison.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-13",
    level_id: 3,
    scenario: "Sous-estimer systématiquement le temps de dév d'une feature dans la roadmap.",
    options: [
      { text: "La Fallace du Planning", is_correct: true, bias_id: "planning_fallacy" },
      { text: "Loi de Hofstadter", is_correct: false, bias_id: "hofstadters_law" },
      { text: "Optimisme", is_correct: false, bias_id: "optimism" },
    ],
    explanation: "La Fallace du Planning : on sous-estime toujours le temps, même en connaissant le passé.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-14",
    level_id: 3,
    scenario: 'Créer des Personas basés sur des clichés ("La ménagère") plutôt que de la data.',
    options: [
      { text: "Stéréotypage", is_correct: true, bias_id: "stereotyping" },
      { text: "Biais de Représentativité", is_correct: false, bias_id: "representativeness" },
      { text: "Paresse", is_correct: false, bias_id: "laziness" },
    ],
    explanation: "Le Stéréotypage réduit la complexité humaine à des traits simplistes et souvent faux.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-15",
    level_id: 3,
    scenario: "Arrêter un A/B test dès que la variante B passe devant, sans attendre la significativité.",
    options: [
      { text: "Peeking Bias", is_correct: true, bias_id: "peeking_bias" },
      { text: "Biais de Résultat", is_correct: false, bias_id: "outcome_bias" },
      { text: "Impatience", is_correct: false, bias_id: "impatience" },
    ],
    explanation: "Le Peeking (regarder trop tôt) fausse les stats et mène à de fausses conclusions positives.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-16",
    level_id: 3,
    scenario: "On fait ce que dit le directeur car c'est le mieux payé, même si c'est une mauvaise idée UX.",
    options: [
      { text: "Effet HiPPO", is_correct: true, bias_id: "hippo_effect" },
      { text: "Biais d'Autorité", is_correct: false, bias_id: "authority_bias" },
      { text: "Obéissance", is_correct: false, bias_id: "obedience" },
    ],
    explanation: "HiPPO (Highest Paid Person's Opinion) : l'avis du chef écrase la data.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-17",
    level_id: 3,
    scenario: "Refuser de changer une techno obsolète par confort.",
    options: [
      { text: "Statu Quo", is_correct: true, bias_id: "status_quo" },
      { text: "Résistance au changement", is_correct: false, bias_id: "change_resistance" },
      { text: "Zone de confort", is_correct: false, bias_id: "comfort_zone" },
    ],
    explanation: "Le Biais de Statu Quo s'applique aussi aux choix techniques et organisationnels.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-18",
    level_id: 3,
    scenario: "L'équipe refuse de retirer une feature inutile par peur de décevoir 3 utilisateurs.",
    options: [
      { text: "Biais d'Omission", is_correct: false, bias_id: "omission_bias" },
      { text: "Aversion à la perte", is_correct: true, bias_id: "loss_aversion" },
      { text: "Status Quo", is_correct: false, bias_id: "status_quo" },
    ],
    explanation: "C'est une forme d'Aversion à la Perte appliquée au produit (Feature Hoarding).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-19",
    level_id: 3,
    scenario: "Juger un utilisateur \"stupide\" parce qu'il n'arrive pas à utiliser l'app.",
    options: [
      { text: "Erreur Fondamentale d'Attribution", is_correct: true, bias_id: "fundamental_attribution_error" },
      { text: "Biais de Supériorité", is_correct: false, bias_id: "superiority_bias" },
      { text: "Manque d'empathie", is_correct: false, bias_id: "lack_empathy" },
    ],
    explanation:
      "L'Erreur Fondamentale d'Attribution : attribuer l'échec à la personnalité (il est bête) plutôt qu'au contexte (l'interface est mauvaise).",
    ui_interaction: "MULTIPLE_CHOICE",
  },
  {
    id: "N3-20",
    level_id: 3,
    scenario: "Simplifier un problème complexe pour qu'il rentre dans une solution simple et séduisante.",
    options: [
      { text: "Biais de Complexité (Inverse)", is_correct: false, bias_id: "complexity_bias_inverse" },
      { text: "Loi de la simplicité", is_correct: false, bias_id: "simplicity_law" },
      { text: "Réductionnisme", is_correct: true, bias_id: "reductionism" },
    ],
    explanation: "Le Réductionnisme : ignorer les nuances nécessaires par amour de la simplicité.",
    ui_interaction: "MULTIPLE_CHOICE",
  },
]

// ============================================
// TABLE 3: BIAS_LIBRARY - Wiki intégré
// ============================================
export interface BiasEntry {
  bias_id: string
  name: string
  category: string
  definition: string
  counter_tactic: string
  level_unlocked: number
}

export const BIAS_LIBRARY: BiasEntry[] = [
  // Niveau 1 - Fondamentaux
  {
    bias_id: "halo_effect",
    name: "Effet de Halo",
    category: "Perception",
    definition:
      "Tendance à attribuer des qualités positives (comme la facilité d'utilisation) à quelque chose simplement parce qu'il est visuellement attrayant.",
    counter_tactic:
      "Testez l'usabilité indépendamment de l'esthétique. Ne laissez pas la beauté masquer les problèmes fonctionnels.",
    level_unlocked: 1,
  },
  {
    bias_id: "confirmation_bias",
    name: "Biais de Confirmation",
    category: "Cognition",
    definition:
      "Tendance à chercher, interpréter et retenir les informations qui confirment nos croyances préexistantes.",
    counter_tactic:
      "Présentez des informations équilibrées. Encouragez la confrontation avec des avis contradictoires.",
    level_unlocked: 1,
  },
  {
    bias_id: "anchoring",
    name: "Biais d'Ancrage",
    category: "Décision",
    definition:
      "Le premier élément d'information reçu (l'ancre) influence disproportionnellement les jugements ultérieurs.",
    counter_tactic:
      "Éthique : présentez d'abord la valeur réelle. Manipulation : placez un prix barré élevé avant le prix actuel.",
    level_unlocked: 1,
  },
  {
    bias_id: "hicks_law",
    name: "Loi de Hick",
    category: "UX Law",
    definition: "Le temps de décision augmente logarithmiquement avec le nombre et la complexité des choix.",
    counter_tactic: "Réduisez le nombre d'options visibles. Utilisez des filtres et une progressive disclosure.",
    level_unlocked: 1,
  },
  {
    bias_id: "serial_position",
    name: "Effet de Position Série",
    category: "Mémoire",
    definition: "Tendance à mieux retenir les premiers (primauté) et derniers (récence) éléments d'une série.",
    counter_tactic: "Placez vos informations clés au début et à la fin. Cachez le contenu moins important au milieu.",
    level_unlocked: 1,
  },
  {
    bias_id: "loss_aversion",
    name: "Aversion à la Perte",
    category: "Décision",
    definition:
      "La douleur de perdre quelque chose est environ deux fois plus forte que le plaisir de gagner la même chose.",
    counter_tactic: "Éthique : rassurez sur les garanties. Manipulation : 'Ne manquez pas...' au lieu de 'Gagnez...'",
    level_unlocked: 1,
  },
  {
    bias_id: "social_proof",
    name: "Preuve Sociale",
    category: "Social",
    definition: "Tendance à adopter les comportements et opinions que l'on perçoit comme majoritaires.",
    counter_tactic: "Affichez les compteurs d'utilisateurs, avis clients, témoignages. La foule rassure.",
    level_unlocked: 1,
  },
  {
    bias_id: "von_restorff",
    name: "Effet Von Restorff",
    category: "Perception",
    definition: "L'élément qui se distingue visuellement dans un groupe homogène est mieux mémorisé.",
    counter_tactic: "Utilisez la couleur, la taille ou l'espacement pour faire ressortir les éléments clés (CTA).",
    level_unlocked: 1,
  },
  {
    bias_id: "zeigarnik",
    name: "Effet Zeigarnik",
    category: "Mémoire",
    definition: "Les tâches inachevées restent plus présentes dans notre mémoire que les tâches terminées.",
    counter_tactic: "Utilisez des barres de progression incomplètes pour motiver à terminer un parcours.",
    level_unlocked: 1,
  },
  {
    bias_id: "jakobs_law",
    name: "Loi de Jakob",
    category: "UX Law",
    definition:
      "Les utilisateurs passent la majorité de leur temps sur d'autres sites ; ils préfèrent que votre site fonctionne de la même manière.",
    counter_tactic: "Suivez les conventions UI établies (menu hamburger, panier en haut à droite, etc.).",
    level_unlocked: 1,
  },
  {
    bias_id: "reciprocity",
    name: "Réciprocité",
    category: "Social",
    definition: "Recevoir quelque chose crée un sentiment d'obligation de rendre la pareille.",
    counter_tactic: "Offrez de la valeur gratuite (ebook, essai) avant de demander un engagement (email, achat).",
    level_unlocked: 1,
  },
  {
    bias_id: "scarcity_urgency",
    name: "Rareté & Urgence",
    category: "Persuasion",
    definition: "Un bien semble plus désirable quand sa disponibilité est limitée (quantité ou temps).",
    counter_tactic: "Compteurs de stock, timers. Attention : l'abus détruit la confiance.",
    level_unlocked: 1,
  },
  {
    bias_id: "authority_bias",
    name: "Biais d'Autorité",
    category: "Social",
    definition: "Tendance à attribuer plus de crédibilité aux figures perçues comme autoritaires ou expertes.",
    counter_tactic: "Affichez les certifications, logos de partenaires, témoignages d'experts.",
    level_unlocked: 1,
  },
  {
    bias_id: "framing",
    name: "Effet de Cadrage",
    category: "Cognition",
    definition: "La manière dont une information est présentée influence la perception et la décision.",
    counter_tactic: "'90% de satisfaction' > '10% d'insatisfaits'. Reformulez positivement.",
    level_unlocked: 1,
  },
  {
    bias_id: "availability_bias",
    name: "Biais de Disponibilité",
    category: "Cognition",
    definition: "Tendance à surestimer la probabilité des événements dont on se souvient facilement.",
    counter_tactic: "Fournissez des statistiques objectives pour contrebalancer les anecdotes marquantes.",
    level_unlocked: 1,
  },
  {
    bias_id: "dunning_kruger",
    name: "Effet Dunning-Kruger",
    category: "Métacognition",
    definition: "Les personnes peu compétentes surestiment leurs capacités, tandis que les experts les sous-estiment.",
    counter_tactic: "En recherche utilisateur : méfiez-vous des utilisateurs trop confiants dans leur expertise.",
    level_unlocked: 1,
  },
  {
    bias_id: "gamblers_fallacy",
    name: "Erreur du Parieur",
    category: "Probabilité",
    definition: "Croyance erronée que les événements aléatoires passés influencent les probabilités futures.",
    counter_tactic: "Ne créez pas de systèmes de récompense qui laissent croire à des patterns là où il n'y en a pas.",
    level_unlocked: 1,
  },
  {
    bias_id: "endowment_effect",
    name: "Effet de Dotation",
    category: "Possession",
    definition: "Tendance à accorder plus de valeur à un objet simplement parce qu'on le possède.",
    counter_tactic: "Essais gratuits, démos personnalisées : une fois 'possédé', le produit devient plus précieux.",
    level_unlocked: 1,
  },
  {
    bias_id: "frequency_illusion",
    name: "Illusion de Fréquence",
    category: "Perception",
    definition: "Une information récemment apprise semble soudain apparaître partout.",
    counter_tactic: "En marketing : le retargeting exploite cet effet en 'accompagnant' l'utilisateur.",
    level_unlocked: 1,
  },

  // Niveau 2 - Application UX
  {
    bias_id: "decoy_effect",
    name: "Effet de Leurre",
    category: "Pricing",
    definition: "Une option 'leurre' moins attractive rend l'option cible plus attrayante par comparaison.",
    counter_tactic: "Les pages de pricing à 3 colonnes utilisent souvent la colonne de droite comme leurre.",
    level_unlocked: 2,
  },
  {
    bias_id: "status_quo",
    name: "Biais du Statu Quo",
    category: "Décision",
    definition: "Préférence pour l'état actuel des choses ; résistance au changement même bénéfique.",
    counter_tactic: "Les options par défaut (opt-out) sont très puissantes. Utilisez-les éthiquement.",
    level_unlocked: 2,
  },
  {
    bias_id: "chunking",
    name: "Chunking",
    category: "Cognition",
    definition: "Technique de groupement de l'information en unités significatives pour faciliter le traitement.",
    counter_tactic: "Divisez les formulaires longs en étapes, groupez les informations liées visuellement.",
    level_unlocked: 2,
  },
  {
    bias_id: "variable_reward",
    name: "Récompense Variable",
    category: "Addiction",
    definition:
      "Les récompenses imprévisibles créent plus d'engagement que les récompenses fixes (effet slot machine).",
    counter_tactic:
      "Utilisé par les réseaux sociaux (feed infini). Éthiquement discutable si l'objectif est l'addiction.",
    level_unlocked: 2,
  },
  {
    bias_id: "endowed_progress",
    name: "Endowed Progress Effect",
    category: "Motivation",
    definition: "Les gens sont plus motivés à atteindre un objectif s'ils pensent avoir déjà progressé vers lui.",
    counter_tactic: "Pré-remplissez les barres de progression à 10-20% pour motiver la complétion.",
    level_unlocked: 2,
  },
  {
    bias_id: "negativity_bias",
    name: "Biais de Négativité",
    category: "Émotion",
    definition: "Les expériences négatives ont un impact psychologique plus fort que les positives équivalentes.",
    counter_tactic: "Messages d'erreur : évitez le ton accusateur. Proposez des solutions, pas des blâmes.",
    level_unlocked: 2,
  },
  {
    bias_id: "confirmshaming",
    name: "Confirmshaming",
    category: "Dark Pattern",
    definition: "Manipulation par la honte : formuler l'option de refus de manière humiliante.",
    counter_tactic: "⚠️ DARK PATTERN - À éviter. Détruit la confiance utilisateur à long terme.",
    level_unlocked: 2,
  },
  {
    bias_id: "center_stage",
    name: "Effet Centre-Stage",
    category: "Perception",
    definition: "Dans une série horizontale d'options, l'option centrale est perçue comme le choix recommandé.",
    counter_tactic: "Placez votre offre cible au centre. Renforcez avec un badge 'Populaire' ou 'Recommandé'.",
    level_unlocked: 2,
  },
  {
    bias_id: "recognition_recall",
    name: "Reconnaissance vs Rappel",
    category: "Mémoire",
    definition: "Il est plus facile de reconnaître quelque chose que de s'en souvenir sans indice.",
    counter_tactic: "Privilégiez les icônes universelles, les menus visibles, l'autocomplétion.",
    level_unlocked: 2,
  },
  {
    bias_id: "labor_illusion",
    name: "Illusion du Labeur",
    category: "Perception",
    definition: "Un service est perçu comme plus précieux si l'on voit l'effort investi (même simulé).",
    counter_tactic: "Animations de 'recherche en cours', messages de progression, même si instantané.",
    level_unlocked: 2,
  },
  {
    bias_id: "ikea_effect",
    name: "Effet Ikea",
    category: "Possession",
    definition: "Tendance à accorder plus de valeur aux choses que l'on a contribué à créer ou assembler.",
    counter_tactic: "Personnalisation, configurateurs, contenus générés par l'utilisateur.",
    level_unlocked: 2,
  },
  {
    bias_id: "fitts_law",
    name: "Loi de Fitts",
    category: "UX Law",
    definition: "Le temps pour atteindre une cible dépend de la distance et de la taille de celle-ci.",
    counter_tactic: "Gros boutons, zones cliquables généreuses, surtout sur mobile (min 44px).",
    level_unlocked: 2,
  },
  {
    bias_id: "reactance",
    name: "Réactance Psychologique",
    category: "Comportement",
    definition: "Résistance instinctive quand on perçoit une menace à sa liberté de choix.",
    counter_tactic: "Évitez les popups agressives, les CTA forcés. Laissez l'utilisateur sentir le contrôle.",
    level_unlocked: 2,
  },
  {
    bias_id: "salience_bias",
    name: "Biais de Saillance",
    category: "Attention",
    definition: "Tendance à se concentrer sur les éléments les plus visibles ou émotionnellement frappants.",
    counter_tactic: "Utilisez la hiérarchie visuelle pour guider l'attention. Attention aux Dark Patterns.",
    level_unlocked: 2,
  },

  // Niveau 3 - Expert & Organisation
  {
    bias_id: "sunk_cost",
    name: "Coûts Irrécupérables",
    category: "Décision",
    definition:
      "Continuer un investissement (temps, argent) basé sur ce qui a déjà été dépensé plutôt que sur les bénéfices futurs.",
    counter_tactic: "En gestion de produit : sachez tuer vos projets zombies. Le passé n'est pas un argument.",
    level_unlocked: 3,
  },
  {
    bias_id: "hawthorne_effect",
    name: "Effet Hawthorne",
    category: "Recherche",
    definition: "Les sujets d'une étude modifient leur comportement simplement parce qu'ils se savent observés.",
    counter_tactic: "Tests A/B > tests utilisateurs observés. Guerilla testing. Analytics passifs.",
    level_unlocked: 3,
  },
  {
    bias_id: "survivorship_bias",
    name: "Biais du Survivant",
    category: "Analyse",
    definition: "Se concentrer sur les succès visibles en ignorant les échecs silencieux.",
    counter_tactic: "Analysez le churn autant que les utilisateurs actifs. Les départs sont des données.",
    level_unlocked: 3,
  },
  {
    bias_id: "groupthink",
    name: "Pensée de Groupe",
    category: "Organisation",
    definition: "Conformité excessive au sein d'un groupe, supprimant la pensée critique et les opinions dissidentes.",
    counter_tactic: "Encouragez le 'Red Team', l'avocat du diable. Votez anonymement avant de discuter.",
    level_unlocked: 3,
  },
  {
    bias_id: "automation_bias",
    name: "Biais d'Automatisation",
    category: "Technologie",
    definition: "Tendance à faire confiance aveuglément aux systèmes automatisés plutôt qu'à son propre jugement.",
    counter_tactic: "Gardez l'humain dans la boucle (Human-in-the-loop). Vérifiez les outputs de l'IA.",
    level_unlocked: 3,
  },
  {
    bias_id: "sludge",
    name: "Sludge",
    category: "Dark Pattern",
    definition: "Friction délibérément ajoutée pour décourager une action (désinscription, réclamation...).",
    counter_tactic: "⚠️ DARK PATTERN - Illégal dans certains pays (RGPD). Préférez des parcours fluides.",
    level_unlocked: 3,
  },
  {
    bias_id: "curse_of_knowledge",
    name: "Malédiction du Savoir",
    category: "Communication",
    definition: "Difficulté à imaginer ce que c'est que de ne pas savoir quelque chose qu'on sait.",
    counter_tactic: "Testez avec des utilisateurs novices. Évitez le jargon. Simplifiez sans cesse.",
    level_unlocked: 3,
  },
  {
    bias_id: "false_consensus",
    name: "Effet de Faux Consensus",
    category: "Projection",
    definition: "Tendance à surestimer à quel point nos opinions et comportements sont partagés par les autres.",
    counter_tactic: "Vous n'êtes pas votre utilisateur. Validez par la data, pas par l'intuition.",
    level_unlocked: 3,
  },
  {
    bias_id: "law_of_instrument",
    name: "Loi de l'Instrument",
    category: "Méthodologie",
    definition:
      "Tendance à tout résoudre avec les outils qu'on connaît ('Si j'ai un marteau, tout ressemble à un clou').",
    counter_tactic: "Diversifiez votre stack. Choisissez l'outil en fonction du problème, pas l'inverse.",
    level_unlocked: 3,
  },
  {
    bias_id: "goodharts_law",
    name: "Loi de Goodhart",
    category: "Métriques",
    definition: "Quand une mesure devient un objectif, elle cesse d'être une bonne mesure.",
    counter_tactic: "Méfiez-vous des KPIs uniques. Le temps passé n'est pas l'engagement.",
    level_unlocked: 3,
  },
  {
    bias_id: "zero_risk_bias",
    name: "Biais de Risque Zéro",
    category: "Risque",
    definition: "Préférence pour éliminer totalement un petit risque plutôt que réduire significativement un grand.",
    counter_tactic: "En sécurité UX : priorisez les risques par impact, pas par 'résolvabilité'.",
    level_unlocked: 3,
  },
  {
    bias_id: "hindsight_bias",
    name: "Biais Rétrospectif",
    category: "Mémoire",
    definition: "Après un événement, tendance à croire qu'on l'avait prévu ('Je le savais!').",
    counter_tactic: "Documentez vos hypothèses AVANT les résultats. Pre-mortems > Post-mortems.",
    level_unlocked: 3,
  },
  {
    bias_id: "planning_fallacy",
    name: "Fallace du Planning",
    category: "Estimation",
    definition: "Tendance systématique à sous-estimer le temps, les coûts et les risques des projets.",
    counter_tactic: "Reference class forecasting : basez-vous sur des projets similaires passés.",
    level_unlocked: 3,
  },
  {
    bias_id: "hippo_effect",
    name: "Effet HiPPO",
    category: "Organisation",
    definition: "Highest Paid Person's Opinion : l'avis de la personne la mieux payée l'emporte sur la data.",
    counter_tactic: "Culture data-driven. Les A/B tests ne connaissent pas les salaires.",
    level_unlocked: 3,
  },
  {
    bias_id: "fundamental_attribution_error",
    name: "Erreur Fondamentale d'Attribution",
    category: "Jugement",
    definition: "Tendance à attribuer les échecs des autres à leur personnalité plutôt qu'aux circonstances.",
    counter_tactic: "L'utilisateur n'est JAMAIS stupide. C'est votre interface qui est mal conçue.",
    level_unlocked: 3,
  },
  {
    bias_id: "reductionism",
    name: "Réductionnisme",
    category: "Analyse",
    definition: "Simplifier excessivement des problèmes complexes pour qu'ils rentrent dans des solutions connues.",
    counter_tactic: "Acceptez la complexité. Parfois 'ça dépend' est la bonne réponse.",
    level_unlocked: 3,
  },
]

// Fonction utilitaire pour mélanger un array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Récupérer les questions d'un niveau avec options mélangées
export function getQuestionsForLevel(levelId: number): Question[] {
  const levelQuestions = QUESTIONS.filter((q) => q.level_id === levelId)
  return shuffleArray(levelQuestions).map((q) => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}

// Récupérer un biais par ID
export function getBiasById(biasId: string): BiasEntry | undefined {
  return BIAS_LIBRARY.find((b) => b.bias_id === biasId)
}
