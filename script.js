/* =========================================================================
   script.js · Tire une carte
   -------------------------------------------------------------------------
   SOMMAIRE
   1. CONFIG ............. TOUT ce qui se personnalise (textes, cadeaux, bonus)
   2. Outils ............. petites fonctions utilitaires
   3. Mémoire ............ sauvegarde du choix dans le téléphone
   4. Rendu .............. remplissage des textes et des cartes
   5. Navigation ......... passage d'un écran à l'autre
   6. Carte détaillée .... ouverture, retournement, fermeture, bouton retour
   7. Maintien ........... bouton « maintenir pour choisir »
   8. Révélation ......... bon officiel + tampon
   9. Grattage ........... ticket à gratter
   10. Partage ........... envoi du choix
   11. Démarrage

   ASTUCE POUR TESTER : ajoute ?reset à la fin de l'adresse
   (ex. https://toncompte.github.io/tire-une-carte/?reset) pour effacer
   le choix mémorisé et recommencer depuis le début.
   ========================================================================= */

'use strict';


/* =========================================================================
   1. CONFIG · Modifie librement les valeurs entre guillemets.
   Dans les textes, ces repères sont remplacés automatiquement :
     {partenaire} → son prénom      {moi} → ton prénom
   (d'autres repères, comme {numero} ou {titre}, sont indiqués là où ils servent)
   ========================================================================= */
const CONFIG = {

  /* --- Prénoms --- */
  prenomPartenaire: '🐙',   // ← son prénom
  monPrenom: '🐯',         // ← ton prénom (signature de la lettre, bon)
  initialeSceau: 'S',        // ← lettre gravée dans le sceau de cire

  /* --- Réglages --- */
  verrouillerChoix: true,    // true : une fois scellé, le site rouvre directement sur le bon
  dureeMaintienMs: 1500,     // durée d'appui pour confirmer, en millisecondes
  vibrations: true,          // retours haptiques (Android uniquement)
  delaiInvitationMs: 4500,   // délai avant que la 1re carte se secoue si rien n'est touché

  /* --- Les cartes ---
     titre      : nom court affiché dans le cartouche (2 lignes max sur la grille)
     icone      : nom d'une icône de index.html (montre, soin, valise, diner,
                  couronne, mystere, cadeau, coeur, avion, fleur) OU un emoji
     accroche   : phrase affichée au recto de la carte agrandie
     regles     : liste des règles (ajoute ou retire des lignes librement)
     bonASavoir : paragraphe facultatif sous les règles ('' pour le masquer)
     secret     : facultatif, révélé SEULEMENT sur le bon, après le choix
                  (parfait pour une carte mystère ; '' sinon)
     Tu peux mettre plus ou moins de 6 cartes : la grille et le compteur s'adaptent. */
  cadeaux: [
    {
      titre: 'Edging',
      icone: 'montre',
      accroche: 'Pour bruler de desir.',
      regles: [
        "Pendant 1 semaine, tu devras faires des petites betises tous les jours",
        'Sans jamais jouir !',
      ],
      bonASavoir: 'Je pourrais ajouter des petits gages aléatoirement <3',
      secret: '',
    },
    {
      titre: 'Au petit soin',
      icone: 'couronne',
      accroche: 'Sept jours où je deviens ton roi',
      regles: [
        "7 jours d'affilée, qui démarrent quand tu veux",
        '7 jours où tu seras a mon service',
        'Pour des massages et plus...',
      ],
      bonASavoir: '<3',
      secret: '',
    },

    /* ↓↓↓ CARTES 3 À 6 : SUGGESTIONS, remplace-les par tes propres idées ↓↓↓ */
    {
      titre: 'Tes paupieres sont lourdes',
      icone: 'valise',
      accroche: 'Un voyage immaginaire',
      regles: [
        'On essayera ensemble quelques lhypnose.',
        'Le progamme est connu davance, je serai irresistible !',
      ],
      bonASavoir: 'Si tu le souhaites, tu peux savoir exactement ce que je ferrai faire en avance',
      secret: '',
    },
    {
      titre: "🍑",
      icone: 'soin',
      accroche: 'Le fruit defendu',
      regles: [
        'Jaime tes petites 🍑',
        '<3',
      ],
      bonASavoir: "Miam !",
      secret: '',
    },
    {
      titre: 'De nouvelles compétences',
      icone: 'couronne',
      accroche: '',
      regles: [
        'Tu as 2 semaines pour apprendre une nouvelle competence:',
        'le deepthroat',
        'Ou alors, le squiting',
         'Nhesite pas a lire des tuto et a essayer <3',
      ],
      bonASavoir: "Tu peux t'entrainer avec des jouets... ou avec moi",
      secret: '',
    },
    {
      titre: 'La carte mystère',
      icone: 'mystere',
      accroche: 'Je ne dirai rien. Tu me fais confiance ?',
      regles: [
        "Son contenu n'est révélé qu'une fois la carte choisie",
        'Je sais comme tu es joueuse...',
        '',
      ],
      bonASavoir: '<3',
      secret: 'Tu as un budeget de 300$ pour acheter une tenu à laquelle je ne pourrais pas te resister. Bonne chance !',
    },
  ],

  /* --- Bonus du ticket à gratter (pour ELLE, tiré au hasard) ---
     Laisse la liste vide [] pour supprimer le ticket à gratter. */
  bonus: [
    'Un bouquet de fleurs dans les 7 jours',
    'Un massage de 20 minutes, quand tu veux',
    'Un bouquet de fleurs dans les 7 jours',
    'Un bouquet de fleurs dans les 7 jours',
    'Un bouquet de fleurs dans les 7 jours',
    'Un bouquet de fleurs dans les 7 jours',
  ],

  /* --- Envoi du choix ---
     numeroWhatsApp : ton numéro au format international, sans + ni espaces
                      (ex. '33612345678' pour 06 12 34 56 78 en France).
                      Laisse '' pour utiliser le menu de partage d'Android. */
partage: {
  discordWebhookUrl: 'https://discord.com/api/webhooks/1567688505583210523/Es-kZFaqyLW2AKdljOBjxPWommrbl1Jc1vvyVu00jXeUlscUYf5jnR59UD33UVGHT-v-', // Colle ton URL entre guillemets
  message: '✦ {partenaire} a tiré la carte {numero} : {titre}\nBonus gagné : {bonus}{mot}',
  formatMot: '\nSon petit mot : « {mot} »',
},

  /* --- Tous les textes de l'interface --- */
  textes: {
    intro: {
      pour: 'Pour {partenaire}',
      invite: 'Touche le sceau pour ouvrir',
      sceauAria: 'Briser le sceau et ouvrir la lettre',
      titre: "C'est bientôt mon anniversaire",
      sousTitre: "Et cette année, c'est moi qui choisi les cadeaux !!",
      paragraphes: [
        "J'ai préparé six cartes. Chacune cache un cadeau que tu pourrais m'offrir, avec ses propres règles.",
        "Retourne-les, compare, hésite autant que tu veux. Tu n'en choisiras qu'une, et une fois scellé, ton choix sera définitif.",
      ],
      signature: '{moi}',
      bouton: 'Découvrir les cartes',
    },
    tirage: {
      titre: 'Choisis mon cadeau',
      consigne: 'Touche une carte pour lire ses règles.',
      progression: '{n} sur {total} cartes explorées',    // {n} et {total} automatiques
      toutVu: 'Tu les as toutes vues. À toi de choisir.',
      ariaTuile: 'Carte {numero} : {titre}. Voir les règles',
    },
    carte: {
      fermer: 'Fermer la carte',
      ariaRecto: 'Retourner la carte pour lire les règles',
      indiceRecto: 'Touche la carte pour la retourner',
      titreRegles: 'Les règles',
      titreBonASavoir: 'Bon à savoir',
      maintien: 'Maintenir pour choisir',
      maintienEnCours: 'Garde le doigt appuyé…',
      aide: 'Garde le doigt appuyé {secondes} s pour sceller ce choix.', // {secondes} automatique
      aideRelache: "Pas encore scellé : maintiens jusqu'au bout.",
      revoirRecto: 'Revoir le recto',
    },
    revelation: {
      titre: "C'est Validé",
      intro: 'Voici ton bon officiel.',
      etiquette: 'Bon pour',
      numero: 'Carte {numero}',
      secret: 'Ce que cachait la carte',
      offertPar: 'Offert par {partenaire} à {moi}',
      scelleLe: 'Validé le {date}',
      code: 'N° {code}',
      validite: "Dès que je le decide",
      tampon: 'Scellé',
      note: 'Rouvre ce lien quand tu veux pour retrouver ton bon.',
    },
    bonus: {
      titre: "Pour te remercier d'avoir joué",
      consigne: 'Gratte le ticket avec ton doigt.',
      couche: 'Gratte ici',
      reveler: 'Révéler sans gratter',
    },
    mot: {
      label: 'Un petit mot à joindre ?',
      placeholder: "J'ai longtemps hésité avec la carte…",
    },
    envoi: {
      bouton: 'Envoie-moi ton choix',
      copie: 'Message copié. Colle-le-moi dans une conversation.',
      copieManuelle: 'Copie ce message et envoie-le-moi :',
    },
  },
};


/* =========================================================================
   2. OUTILS
   ========================================================================= */

/** Raccourci pour sélectionner un élément. */
const $ = (selecteur, parent = document) => parent.querySelector(selecteur);

/** true si l'utilisateur a demandé à réduire les animations (réglage Android). */
const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Remplace les repères {xxx} d'un texte par leurs valeurs. */
function remplir(modele, valeurs = {}) {
  const base = { partenaire: CONFIG.prenomPartenaire, moi: CONFIG.monPrenom, ...valeurs };
  return String(modele).replace(/\{(\w+)\}/g, (repere, cle) => (cle in base ? base[cle] : repere));
}

/** Protège un texte avant de l'insérer en HTML. */
function echapper(texte) {
  const table = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texte).replace(/[&<>"']/g, (c) => table[c]);
}

/** Convertit 1, 2, 3… en I, II, III… */
function romain(n) {
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let resultat = '';
  for (const [valeur, symbole] of table) {
    while (n >= valeur) { resultat += symbole; n -= valeur; }
  }
  return resultat;
}

/** HTML d'une icône : symbole SVG s'il existe, sinon le texte tel quel (emoji). */
function iconeHTML(nom) {
  if (document.getElementById('ico-' + nom)) {
    return `<svg class="ico" aria-hidden="true"><use href="#ico-${nom}"></use></svg>`;
  }
  return `<span class="ico ico--emoji" aria-hidden="true">${echapper(nom)}</span>`;
}

/** Vibration courte (Android). motif = durée en ms ou tableau [vibre, pause, vibre…]. */
function vibrer(motif) {
  if (!CONFIG.vibrations || !('vibrate' in navigator)) return;
  try { navigator.vibrate(motif); } catch (e) { /* ignoré */ }
}

/** Attend un délai (raccourci à 0 si les animations sont réduites). */
function attendre(ms) {
  return new Promise((resolve) => setTimeout(resolve, reduireAnimations ? 0 : ms));
}

/** Date lisible en français : « 2 novembre 2026 à 21:14 ». */
function formaterDate(iso) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));
  } catch (e) {
    return new Date(iso).toLocaleString('fr-FR');
  }
}

/** Code unique du bon, ex. « III-7K2F ». */
function genererCode(index) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O ni 1/I, pour éviter les confusions
  let suffixe = '';
  for (let i = 0; i < 4; i++) suffixe += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${romain(index + 1)}-${suffixe}`;
}

/** Petit message temporaire en bas de l'écran. */
let minuteurToast;
function afficherToast(texte) {
  const toast = $('#toast');
  toast.textContent = texte;
  toast.classList.add('is-visible');
  clearTimeout(minuteurToast);
  minuteurToast = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}


/* =========================================================================
   3. MÉMOIRE
   Le choix est gardé dans le navigateur du téléphone (localStorage).
   Il reste en place si elle ferme puis rouvre le lien dans le même navigateur.
   ========================================================================= */
const CLE_CHOIX = 'tire-une-carte:choix';
const CLE_VUES = 'tire-une-carte:vues';

function lire(cle) {
  try {
    const valeur = localStorage.getItem(cle);
    return valeur ? JSON.parse(valeur) : null;
  } catch (e) {
    return null; // navigation privée ou stockage bloqué : on continue sans mémoire
  }
}
function ecrire(cle, valeur) {
  try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch (e) { /* ignoré */ }
}
function toutEffacer() {
  try { localStorage.removeItem(CLE_CHOIX); localStorage.removeItem(CLE_VUES); } catch (e) { /* ignoré */ }
}

/** État de l'application pendant la visite. */
const etat = {
  vues: new Set(),     // index des cartes déjà ouvertes
  indexOuvert: null,   // carte actuellement agrandie
  choix: null,         // { index, bonusIndex, date, code, gratte, mot } une fois scellé
};


/* =========================================================================
   4. RENDU · Remplit l'interface avec les textes de CONFIG
   ========================================================================= */
function rendreIntro() {
  const t = CONFIG.textes.intro;
  $('#intro-pour').textContent = remplir(t.pour);
  $('#sceau-lettre').textContent = CONFIG.initialeSceau;
  $('#sceau').setAttribute('aria-label', t.sceauAria);
  $('#intro-invite').textContent = t.invite;
  $('#intro-titre').textContent = remplir(t.titre);
  $('#intro-sous-titre').textContent = remplir(t.sousTitre);
  $('#intro-texte').innerHTML = t.paragraphes.map((p) => `<p>${echapper(remplir(p))}</p>`).join('');
  $('#intro-signature').textContent = remplir(t.signature);
  $('#btn-decouvrir').textContent = t.bouton;

  // Décalage d'apparition ligne par ligne
  [...$('#lettre').children].forEach((el, i) => el.style.setProperty('--n', i));
}

function rendreTirage() {
  const t = CONFIG.textes.tirage;
  $('#cartes-titre').textContent = remplir(t.titre);
  $('#cartes-consigne').textContent = remplir(t.consigne);

  // Angles et décalages de départ pour l'effet « distribution »
  const rotations = [-9, 7, -5, 8, -7, 5];

  $('#grille').innerHTML = CONFIG.cadeaux.map((cadeau, i) => {
    const numero = romain(i + 1);
    const dx = i % 2 === 0 ? '30%' : '-30%'; // les cartes partent du centre
    const aria = remplir(t.ariaTuile, { numero, titre: cadeau.titre });
    return `
      <button class="tuile" type="button" data-index="${i}"
              style="--i:${i};--rot:${rotations[i % rotations.length]}deg;--dx:${dx}"
              aria-label="${echapper(aria)}">
        <span class="tuile__numero" aria-hidden="true">${numero}</span>
        <span class="tuile__icone">${iconeHTML(cadeau.icone)}</span>
        <span class="tuile__cartouche" aria-hidden="true">${echapper(cadeau.titre)}</span>
        <span class="tuile__vue" aria-hidden="true"></span>
      </button>`;
  }).join('');

  majProgression();
}

/** Met à jour les losanges et le texte « x sur 6 cartes explorées ». */
function majProgression() {
  const t = CONFIG.textes.tirage;
  const total = CONFIG.cadeaux.length;
  const n = etat.vues.size;

  $('#progression-losanges').innerHTML = CONFIG.cadeaux
    .map((_, i) => `<span class="losange${etat.vues.has(i) ? ' is-plein' : ''}"></span>`)
    .join('');
  $('#progression-texte').textContent = n >= total ? t.toutVu : remplir(t.progression, { n, total });
  $('#progression').classList.toggle('is-complete', n >= total);

  document.querySelectorAll('.tuile').forEach((tuile) => {
    tuile.classList.toggle('is-vue', etat.vues.has(Number(tuile.dataset.index)));
  });
}

/** Textes fixes de la carte détaillée, du bonus, du mot et du bouton d'envoi. */
function rendreTextesFixes() {
  const c = CONFIG.textes.carte;
  $('#detail-fermer').setAttribute('aria-label', c.fermer);
  $('#detail-recto').setAttribute('aria-label', c.ariaRecto);
  $('#verso-regles-titre').textContent = c.titreRegles;
  $('#verso-bas-titre').textContent = c.titreBonASavoir;
  $('#btn-recto').textContent = c.revoirRecto;

  const b = CONFIG.textes.bonus;
  $('#bonus-titre').textContent = b.titre;
  $('#bonus-consigne').textContent = b.consigne;
  $('#btn-reveler').textContent = b.reveler;

  const m = CONFIG.textes.mot;
  $('#mot-label').textContent = m.label;
  $('#mot-texte').placeholder = m.placeholder;

  $('#btn-partager').textContent = CONFIG.textes.envoi.bouton;
}


/* =========================================================================
   5. NAVIGATION ENTRE ÉCRANS
   ========================================================================= */
let ecranActuel = $('#ecran-intro');

/**
 * Affiche l'écran demandé (id) avec une transition.
 * instantane = true : pas d'animation (utilisé à la réouverture du site).
 */
async function allerA(id, instantane = false) {
  const suivant = document.getElementById(id);
  if (!suivant || suivant === ecranActuel) return;

  if (ecranActuel && !instantane) {
    ecranActuel.classList.add('is-sortie');
    await attendre(320); // = --d-moyen dans style.css
  }
  if (ecranActuel) ecranActuel.classList.remove('is-active', 'is-sortie');

  suivant.classList.add('is-active');
  if (!instantane) {
    suivant.classList.add('is-entree');
    const finEntree = (e) => {
      if (e.target !== suivant) return; // ignore les animations des enfants
      suivant.classList.remove('is-entree');
      suivant.removeEventListener('animationend', finEntree);
    };
    suivant.addEventListener('animationend', finEntree);
  }

  window.scrollTo(0, 0);
  ecranActuel = suivant;

  // Place le focus sur le titre (lecteurs d'écran)
  const titre = suivant.querySelector('h1');
  if (titre) titre.focus({ preventScroll: true });
}

/** Briser le sceau : animation, vibration, puis apparition de la lettre. */
async function briserSceau() {
  const sceau = $('#sceau');
  if (sceau.classList.contains('is-brise')) return;
  sceau.classList.add('is-brise');
  vibrer([15, 30, 25]);
  await attendre(600);
  sceau.hidden = true;
  $('#intro-invite').hidden = true;
  $('#lettre').hidden = false;
  $('#intro-titre').focus({ preventScroll: true });
}

/** Passage au tirage, avec invitation si aucune carte n'est touchée. */
function decouvrirCartes() {
  allerA('ecran-cartes');
  setTimeout(() => {
    const premiere = $('.tuile');
    if (etat.vues.size === 0 && !detailOuvert() && premiere) premiere.classList.add('is-invite');
  }, CONFIG.delaiInvitationMs);
}


/* =========================================================================
   6. CARTE DÉTAILLÉE
   Toucher une tuile agrandit la carte, puis elle se retourne toute seule.
   Le bouton « retour » d'Android ferme la carte au lieu de quitter le site.
   ========================================================================= */
const detail = $('#detail');
const carte3d = $('#detail-carte');
let declencheur = null;          // tuile à l'origine de l'ouverture (pour lui rendre le focus)
let apresFermeture = null;       // action à lancer une fois la carte fermée
let minuteurRetournement;
let idOuverture = 0;             // numéro de l'ouverture en cours (évite de fermer la mauvaise carte)

const detailOuvert = () => detail.classList.contains('is-open');

/** Remplit le recto et le verso avec les infos du cadeau. */
function remplirCarte(cadeau, index) {
  const c = CONFIG.textes.carte;
  const numero = romain(index + 1);

  $('#detail-recto').innerHTML = `
    <span class="recto__numero" aria-hidden="true">${numero}</span>
    <span class="recto__icone">${iconeHTML(cadeau.icone)}</span>
    <span class="recto__cartouche">${echapper(cadeau.titre)}</span>
    <span class="recto__accroche">${echapper(remplir(cadeau.accroche))}</span>
    <span class="recto__indice">${echapper(c.indiceRecto)}</span>`;

  $('#verso-numero').textContent = numero;
  $('#verso-titre').textContent = cadeau.titre;
  $('#verso-regles').innerHTML = cadeau.regles.map((r) => `<li>${echapper(remplir(r))}</li>`).join('');

  const bas = $('#verso-bas');
  bas.hidden = !cadeau.bonASavoir;
  $('#verso-bas-texte').textContent = cadeau.bonASavoir ? remplir(cadeau.bonASavoir) : '';

  $('#verso-corps').scrollTop = 0;
  reinitialiserMaintien();
}

function ouvrirCarte(index, tuile) {
  if (etat.choix) return; // déjà choisi
  const cadeau = CONFIG.cadeaux[index];
  etat.indexOuvert = index;
  declencheur = tuile;
  idOuverture++;

  // Arrête l'invitation si elle est en cours
  document.querySelectorAll('.tuile.is-invite').forEach((t) => t.classList.remove('is-invite'));

  remplirCarte(cadeau, index);

  // Remet la carte côté recto sans animation
  carte3d.style.transition = 'none';
  carte3d.classList.remove('is-retournee');
  void carte3d.offsetWidth; // force le navigateur à appliquer le changement
  carte3d.style.transition = '';
  $('#detail-recto').inert = false;
  $('#detail-verso').inert = true;

  detail.classList.add('is-open');
  document.body.classList.add('sans-defilement');
  $('#app').inert = true; // empêche d'atteindre la grille derrière

  // Une entrée d'historique : le bouton retour d'Android fermera la carte
  try { history.pushState({ carteOuverte: true }, ''); } catch (e) { /* ignoré */ }

  vibrer(10);
  marquerVue(index);
  $('#detail-recto').focus({ preventScroll: true });

  // Retournement automatique, le temps que la carte finisse de grandir
  clearTimeout(minuteurRetournement);
  minuteurRetournement = setTimeout(() => retourner(true), reduireAnimations ? 0 : 650);
}

/** versVerso = true : montre les règles ; false : revient au recto. */
function retourner(versVerso) {
  clearTimeout(minuteurRetournement);
  if (!detailOuvert()) return;
  carte3d.classList.toggle('is-retournee', versVerso);
  $('#detail-recto').inert = versVerso;
  $('#detail-verso').inert = !versVerso;
  vibrer(8);
  (versVerso ? $('#verso-titre') : $('#detail-recto')).focus({ preventScroll: true });
}

/** Demande la fermeture (passe par l'historique pour rester cohérent avec « retour »). */
function fermerCarte(action) {
  apresFermeture = action || null;
  if (history.state && history.state.carteOuverte) {
    const id = idOuverture;
    history.back(); // déclenche « popstate » → fermerVraiment()
    // Filet de sécurité si « popstate » ne vient pas
    setTimeout(() => { if (detailOuvert() && id === idOuverture) fermerVraiment(); }, 500);
  } else {
    fermerVraiment();
  }
}

function fermerVraiment() {
  clearTimeout(minuteurRetournement);
  annulerMaintien();
  detail.classList.remove('is-open');
  document.body.classList.remove('sans-defilement');
  $('#app').inert = false;

  const action = apresFermeture;
  apresFermeture = null;
  if (action) action();
  else if (declencheur) declencheur.focus({ preventScroll: true });
}

/** Ajoute une carte aux « explorées » et fête la dernière découverte. */
function marquerVue(index) {
  const total = CONFIG.cadeaux.length;
  const avant = etat.vues.size;
  etat.vues.add(index);
  ecrire(CLE_VUES, [...etat.vues]);
  majProgression();
  if (avant < total && etat.vues.size === total) setTimeout(() => vibrer([15, 40, 15]), 300);
}


/* =========================================================================
   7. BOUTON « MAINTENIR POUR CHOISIR »
   Le remplissage avance tant que le doigt reste posé (variable CSS --p).
   Relâcher trop tôt annule ; aller au bout scelle le choix.
   ========================================================================= */
const boutonMaintien = $('#btn-maintien');
const maintien = { actif: false, debut: 0, progression: 0, raf: 0, palier: 0 };

function reinitialiserMaintien() {
  const c = CONFIG.textes.carte;
  annulerMaintien();
  boutonMaintien.classList.remove('is-valide', 'is-relache');
  boutonMaintien.style.setProperty('--p', 0);
  $('#maintien-label').textContent = c.maintien;
  const secondes = (CONFIG.dureeMaintienMs / 1000).toLocaleString('fr-FR');
  $('#maintien-aide').textContent = remplir(c.aide, { secondes });
}

function demarrerMaintien(e) {
  if (e.type === 'pointerdown' && e.button !== 0) return;
  if (e.type === 'keydown' && ((e.key !== ' ' && e.key !== 'Enter') || e.repeat)) return;
  e.preventDefault();
  if (maintien.actif || etat.choix) return;

  maintien.actif = true;
  maintien.debut = performance.now();
  maintien.palier = 0;
  boutonMaintien.classList.remove('is-relache');
  boutonMaintien.classList.add('is-actif');
  if (e.pointerId !== undefined) {
    try { boutonMaintien.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
  }
  $('#maintien-label').textContent = CONFIG.textes.carte.maintienEnCours;
  vibrer(12);
  maintien.raf = requestAnimationFrame(boucleMaintien);
}

function boucleMaintien(maintenant) {
  if (!maintien.actif) return;
  const p = Math.min(1, Math.max(0, (maintenant - maintien.debut) / CONFIG.dureeMaintienMs));
  maintien.progression = p;
  boutonMaintien.style.setProperty('--p', p.toFixed(3));

  // Petite vibration à chaque quart : la tension monte
  const palier = Math.floor(p * 4);
  if (palier > maintien.palier && palier < 4) {
    maintien.palier = palier;
    vibrer(8 + palier * 6);
  }

  if (p >= 1) { validerChoix(); return; }
  maintien.raf = requestAnimationFrame(boucleMaintien);
}

function relacherMaintien() {
  if (!maintien.actif) return;
  const c = CONFIG.textes.carte;
  const assezLong = maintien.progression > 0.05;
  annulerMaintien();
  boutonMaintien.classList.add('is-relache'); // le remplissage recule en douceur
  if (assezLong) $('#maintien-aide').textContent = c.aideRelache;
}

function annulerMaintien() {
  maintien.actif = false;
  maintien.progression = 0;
  cancelAnimationFrame(maintien.raf);
  boutonMaintien.classList.remove('is-actif');
  boutonMaintien.style.setProperty('--p', 0);
  if (!etat.choix) $('#maintien-label').textContent = CONFIG.textes.carte.maintien;
}

function validerChoix() {
  maintien.actif = false;
  boutonMaintien.classList.remove('is-actif');
  boutonMaintien.classList.add('is-valide');
  vibrer([30, 60, 90]);

  const index = etat.indexOuvert;
  etat.choix = {
    index,
    bonusIndex: CONFIG.bonus.length ? Math.floor(Math.random() * CONFIG.bonus.length) : -1,
    date: new Date().toISOString(),
    code: genererCode(index),
    gratte: false,
    mot: '',
  };
  ecrire(CLE_CHOIX, etat.choix);

  setTimeout(() => fermerCarte(() => afficherRevelation(true)), reduireAnimations ? 0 : 450);
}


/* =========================================================================
   8. RÉVÉLATION · Bon officiel et tampon
   ========================================================================= */
function rendreRevelation() {
  const t = CONFIG.textes.revelation;
  const cadeau = CONFIG.cadeaux[etat.choix.index];
  const numero = romain(etat.choix.index + 1);

  $('#revelation-titre').textContent = remplir(t.titre);
  $('#revelation-intro').textContent = remplir(t.intro);
  $('#bon-etiquette').textContent = t.etiquette;
  $('#bon-numero').textContent = remplir(t.numero, { numero });
  $('#bon-titre').textContent = cadeau.titre;

  // Détail : le secret s'il existe (carte mystère), sinon l'accroche
  const detailBon = $('#bon-detail');
  detailBon.textContent = '';
  if (cadeau.secret) {
    const label = document.createElement('span');
    label.className = 'bon__secret-label';
    label.textContent = t.secret;
    detailBon.append(label, remplir(cadeau.secret));
  } else {
    detailBon.textContent = remplir(cadeau.accroche);
  }

  $('#bon-de').textContent = remplir(t.offertPar);
  $('#bon-date').textContent = remplir(t.scelleLe, { date: formaterDate(etat.choix.date) });
  $('#bon-code').textContent = remplir(t.code, { code: etat.choix.code });
  $('#bon-validite').textContent = remplir(t.validite);
  $('#tampon-texte').textContent = t.tampon;
  $('#revelation-note').textContent = CONFIG.verrouillerChoix ? remplir(t.note) : '';

  // Bonus (masqué si la liste est vide)
  const aBonus = etat.choix.bonusIndex >= 0 && CONFIG.bonus[etat.choix.bonusIndex];
  $('#bonus').hidden = !aBonus;
  if (aBonus) $('#bonus-resultat').textContent = CONFIG.bonus[etat.choix.bonusIndex];

  $('#mot-texte').value = etat.choix.mot || '';
}

async function afficherRevelation(premiereFois) {
  rendreRevelation();
  await allerA('ecran-revelation', !premiereFois);

  const tampon = $('#tampon');
  if (premiereFois) {
    tampon.classList.add('is-pose');
    setTimeout(() => vibrer(40), reduireAnimations ? 0 : 750); // au moment où il s'abat
  } else {
    tampon.classList.add('is-pose-direct');
  }

  if (!$('#bonus').hidden) initialiserGrattage();
}


/* =========================================================================
   9. TICKET À GRATTER
   Un <canvas> doré recouvre le bonus ; le doigt l'efface.
   Au-delà de 50 % gratté, tout se révèle.
   ========================================================================= */
async function initialiserGrattage() {
  const zone = $('#grattage');
  const canvas = $('#grattage-couche');
  const boutonReveler = $('#btn-reveler');

  if (etat.choix.gratte) {
    zone.classList.add('is-revele');
    boutonReveler.hidden = true;
    return;
  }

  // Attend la police pour écrire « Gratte ici » avec la bonne typo
  try { await document.fonts.load('500 18px Jost'); } catch (e) { /* police de secours */ }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const largeur = zone.offsetWidth;
  const hauteur = zone.offsetHeight;
  canvas.width = Math.round(largeur * dpr);
  canvas.height = Math.round(hauteur * dpr);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Couche dorée
  const degrade = ctx.createLinearGradient(0, 0, largeur, hauteur);
  degrade.addColorStop(0, '#E7BE6C');
  degrade.addColorStop(0.5, '#D6A24E');
  degrade.addColorStop(1, '#B07F2E');
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 0, largeur, hauteur);

  // Petits losanges scintillants
  ctx.fillStyle = 'rgba(255, 248, 230, .35)';
  for (let i = 0; i < 28; i++) {
    const x = Math.random() * largeur;
    const y = Math.random() * hauteur;
    const r = 1.5 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y);
    ctx.fill();
  }

  // Texte d'invitation
  ctx.fillStyle = 'rgba(58, 42, 18, .85)';
  ctx.font = '500 18px Jost, Futura, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CONFIG.textes.bonus.couche, largeur / 2, hauteur / 2);

  // À partir d'ici, dessiner = effacer
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 38;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let dernierPoint = null;
  let compteur = 0;
  let fini = false;

  const position = (e) => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const gratter = (a, b) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x + 0.01, b.y);
    ctx.stroke();
  };
  const verifier = () => {
    if (fini) return;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparents = 0;
    let total = 0;
    for (let i = 3; i < pixels.length; i += 4 * 16) { // échantillonne 1 pixel sur 16
      total++;
      if (pixels[i] === 0) transparents++;
    }
    if (transparents / total > 0.5) { fini = true; revelerBonus(); }
  };

  canvas.onpointerdown = (e) => {
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
    dernierPoint = position(e);
    gratter(dernierPoint, dernierPoint);
    vibrer(5);
  };
  canvas.onpointermove = (e) => {
    if (!dernierPoint || fini) return;
    const point = position(e);
    gratter(dernierPoint, point);
    dernierPoint = point;
    if (++compteur % 6 === 0) verifier();
  };
  canvas.onpointerup = canvas.onpointercancel = () => {
    dernierPoint = null;
    verifier();
  };
}

function revelerBonus() {
  if (etat.choix.gratte) return;
  $('#grattage').classList.add('is-revele');
  $('#btn-reveler').hidden = true;
  etat.choix.gratte = true;
  ecrire(CLE_CHOIX, etat.choix);
  vibrer([20, 40, 60]);
}


/* =========================================================================
   10. PARTAGE · Envoie le choix (WhatsApp, menu de partage, ou copie)
   ========================================================================= */
async function partager() {
  const p = CONFIG.partage;
  const cadeau = CONFIG.cadeaux[etat.choix.index];
  const mot = (etat.choix.mot || '').trim();
  const bonus = CONFIG.bonus[etat.choix.bonusIndex] || '—';

  const message = remplir(p.message, {
    numero: romain(etat.choix.index + 1),
    titre: cadeau.titre,
    bonus,
    mot: mot ? remplir(p.formatMot, { mot }) : '',
  });

  vibrer(10);

  // Si aucun webhook n'est configuré ou si c'est la valeur par défaut, repli sur le presse-papier
  if (!p.discordWebhookUrl || p.discordWebhookUrl.includes('VOTRE_URL')) {
    try {
      await navigator.clipboard.writeText(message);
      afficherToast(CONFIG.textes.envoi.copie);
    } catch (err) {
      window.prompt(CONFIG.textes.envoi.copieManuelle, message);
    }
    return;
  }

  // Envoi direct vers Discord via le Webhook
  try {
    const reponse = await fetch(p.discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });

    if (reponse.ok) {
      afficherToast('Réponse bien reçue sur Discord !');
    } else {
      throw new Error('Erreur lors de l\'envoi Discord');
    }
  } catch (err) {
    // En cas de problème réseau, on copie le message par sécurité
    try {
      await navigator.clipboard.writeText(message);
      afficherToast('Erreur Discord. Message copié dans le presse-papier.');
    } catch (e) {
      window.prompt(CONFIG.textes.envoi.copieManuelle, message);
    }
  }
}


/* =========================================================================
   11. DÉMARRAGE
   ========================================================================= */
function brancherEvenements() {
  // Écran 1
  $('#sceau').addEventListener('click', briserSceau);
  $('#btn-decouvrir').addEventListener('click', decouvrirCartes);

  // Écran 2 : un seul écouteur pour toutes les tuiles
  const grille = $('#grille');
  grille.addEventListener('click', (e) => {
    const tuile = e.target.closest('.tuile');
    if (tuile) ouvrirCarte(Number(tuile.dataset.index), tuile);
  });
  grille.addEventListener('animationend', (e) => {
    if (!e.target.classList.contains('tuile')) return;
    if (e.animationName === 'distribuer') e.target.classList.add('is-posee');
    if (e.animationName === 'inviter') e.target.classList.remove('is-invite');
  });

  // Carte détaillée
  $('#detail-recto').addEventListener('click', () => retourner(true));
  $('#btn-recto').addEventListener('click', () => retourner(false));
  $('#detail-fermer').addEventListener('click', () => fermerCarte());
  detail.addEventListener('click', (e) => { if (e.target === detail) fermerCarte(); }); // clic sur le fond
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detailOuvert()) fermerCarte(); });
  window.addEventListener('popstate', () => { if (detailOuvert()) fermerVraiment(); });

  // Bouton maintenir (doigt, souris et clavier)
  boutonMaintien.addEventListener('pointerdown', demarrerMaintien);
  boutonMaintien.addEventListener('pointerup', relacherMaintien);
  boutonMaintien.addEventListener('pointercancel', relacherMaintien);
  boutonMaintien.addEventListener('lostpointercapture', relacherMaintien);
  boutonMaintien.addEventListener('keydown', demarrerMaintien);
  boutonMaintien.addEventListener('keyup', relacherMaintien);
  boutonMaintien.addEventListener('blur', relacherMaintien);
  boutonMaintien.addEventListener('contextmenu', (e) => e.preventDefault()); // appui long Android

  // Écran 3
  $('#btn-reveler').addEventListener('click', revelerBonus);
  $('#mot-texte').addEventListener('input', (e) => {
    etat.choix.mot = e.target.value;
    ecrire(CLE_CHOIX, etat.choix);
  });
  $('#btn-partager').addEventListener('click', partager);
}

function demarrer() {
  // ?reset dans l'adresse : efface tout (pratique pour tester avant de l'envoyer)
  const params = new URLSearchParams(window.location.search);
  if (params.has('reset')) {
    toutEffacer();
    history.replaceState(null, '', window.location.pathname + window.location.hash);
  } else if (history.state && history.state.carteOuverte) {
    history.replaceState(null, ''); // nettoie un état laissé par un rechargement
  }

  rendreIntro();
  rendreTextesFixes();

  // Cartes déjà explorées lors d'une visite précédente
  const vues = lire(CLE_VUES);
  if (Array.isArray(vues)) {
    vues.filter((i) => Number.isInteger(i) && i >= 0 && i < CONFIG.cadeaux.length)
      .forEach((i) => etat.vues.add(i));
  }
  rendreTirage();
  brancherEvenements();

  // Choix déjà scellé : on rouvre directement sur le bon
  const choix = lire(CLE_CHOIX);
  if (CONFIG.verrouillerChoix && choix && CONFIG.cadeaux[choix.index]) {
    if (!(choix.bonusIndex >= 0 && choix.bonusIndex < CONFIG.bonus.length)) {
      choix.bonusIndex = CONFIG.bonus.length ? 0 : -1;
    }
    etat.choix = choix;
    afficherRevelation(false);
  }
}

demarrer();
