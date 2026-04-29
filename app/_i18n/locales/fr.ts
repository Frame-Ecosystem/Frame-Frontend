/**
 * ─── Français — Deep translation ─────────────────────────────────────────
 *
 * Contextual French — written for a Tunisian beauty-platform audience.
 * Translations favour natural, engaging phrasing over literal equivalents.
 *
 * Examples of "deep" choices:
 *   "Get Started"      → "Rejoindre"           (join us — warmer CTA)
 *   "Discover Styles"  → "Trouvez l'inspiration" (find inspiration)
 *   "No results found" → "Rien à afficher pour le moment"
 */

const fr: Record<string, string> = {
  // ── Navigation ──────────────────────────────────────────────────────────
  "nav.home": "Accueil",
  "nav.reels": "Reels",
  "nav.lounges": "Salons",
  "nav.queue": "File d'attente",
  "nav.queues": "Files d'attente",
  "nav.bookings": "Réservations",
  "nav.chat": "Chat",
  "nav.store": "Boutique",
  "nav.admin": "Admin",
  "nav.profile": "Profil",
  "nav.notifications": "Notifications",

  // ── Common ──────────────────────────────────────────────────────────────
  "common.getStarted": "Rejoindre",
  "common.loading": "Chargement…",
  "common.error": "Oups ! Un souci est survenu",
  "common.retry": "Réessayer",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.edit": "Modifier",
  "common.search": "Rechercher",
  "common.viewAll": "Tout voir",
  "common.noResults": "Rien à afficher pour le moment",
  "common.all": "Tout",
  "common.close": "Fermer",
  "common.confirm": "Confirmer",
  "common.back": "Retour",
  "common.next": "Suivant",
  "common.done": "Terminé",
  "common.or": "ou",
  "common.seeMore": "En savoir plus",
  "common.seeLess": "Réduire",
  "common.copiedToClipboard": "Copié !",

  // ── Settings ────────────────────────────────────────────────────────────
  "settings.title": "Paramètres",
  "settings.theme": "Thème",
  "settings.language": "Langue",
  "settings.location": "Localisation",
  "settings.gender": "Genre",
  "settings.openingHours": "Horaires d'ouverture",
  "settings.serviceManagement": "Gestion des services",
  "settings.agentManagement": "Gestion des agents",

  // ── Auth ─────────────────────────────────────────────────────────────────
  "auth.signIn": "Se connecter",
  "auth.signUp": "Créer un compte",
  "auth.signOut": "Se déconnecter",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "auth.resetPassword": "Réinitialiser le mot de passe",
  "auth.email": "Adresse e-mail",
  "auth.password": "Mot de passe",
  "auth.confirmPassword": "Confirmer le mot de passe",
  "auth.continueWithGoogle": "Continuer avec Google",
  "auth.noAccount": "Pas encore de compte ?",
  "auth.haveAccount": "Déjà inscrit ?",
  "auth.checkEmail": "Vérifiez votre boîte mail",
  "auth.verifyEmail": "Confirmez votre adresse e-mail",

  // ── Content / Feed ──────────────────────────────────────────────────────
  "content.comments": "{count} commentaires · tout voir",
  "content.comments_one": "1 commentaire · voir",
  "content.comments_zero": "Aucun commentaire pour l'instant",
  "content.likes": "{count} j'aime",
  "content.likes_one": "1 j'aime",
  "content.share": "Partager",
  "content.follow": "Suivre",
  "content.following": "Abonné",
  "content.unfollow": "Ne plus suivre",
  "content.noPosts": "Aucune publication pour l'instant",
  "content.writeComment": "Écrire un commentaire…",
  "content.reply": "Répondre",
  "content.report": "Signaler",
  "content.save": "Enregistrer",
  "content.saved": "Enregistré",
  "content.unsave": "Retirer",
  "content.deletePost": "Supprimer la publication",
  "content.editPost": "Modifier la publication",

  // ── Lounges ─────────────────────────────────────────────────────────────
  "lounges.title": "Salons",
  "lounges.serviceCategories": "Catégories de services",
  "lounges.popularServices": "Services populaires",
  "lounges.favorites": "Salons favoris",
  "lounges.nearYou": "À proximité",
  "lounges.searchPlaceholder": "Trouver un salon…",
  "lounges.noLounges": "Aucun salon trouvé",
  "lounges.suggested": "Recommandés pour vous",
  "lounges.viewProfile": "Voir le profil",
  "lounges.subtitle": "Parcourez et découvrez des salons incroyables.",
  "lounges.allLounges": "Tous les salons",
  "lounges.loungesOffering": "Salons proposant {service}",
  "lounges.sortedByDistance": "Triés par distance depuis votre position",
  "lounges.updateLocation":
    "Mettez à jour votre position pour de meilleurs résultats",
  "lounges.profileRequired":
    "Veuillez compléter votre profil pour accéder à cette page.",
  "lounges.clientAccessRequired":
    "Vous devez être un client pour accéder à cette page. Veuillez compléter votre profil.",
  "lounges.loadError":
    "Impossible de charger les salons. Veuillez réessayer plus tard.",

  // ── Bookings ────────────────────────────────────────────────────────────
  "bookings.title": "Mes réservations",
  "bookings.bookNow": "Réserver",
  "bookings.upcoming": "À venir",
  "bookings.past": "Passées",
  "bookings.cancelled": "Annulées",
  "bookings.confirmed": "Confirmée",
  "bookings.pending": "En attente",
  "bookings.completed": "Terminée",
  "bookings.noBookings": "Aucune réservation pour l'instant",
  "bookings.cancelBooking": "Annuler la réservation",
  "bookings.reschedule": "Reprogrammer",

  // ── Profile ─────────────────────────────────────────────────────────────
  "profile.editProfile": "Modifier le profil",
  "profile.posts": "Publications",
  "profile.followers": "Abonnés",
  "profile.following": "Abonnements",
  "profile.saved": "Enregistrés",
  "profile.bio": "Bio",
  "profile.website": "Site web",
  "profile.noFollowers": "Aucun abonné pour l'instant",
  "profile.noFollowing": "Aucun abonnement pour l'instant",

  // ── Notifications ───────────────────────────────────────────────────────
  "notifications.title": "Notifications",
  "notifications.empty": "Aucune notification",
  "notifications.markAllRead": "Tout marquer comme lu",
  "notifications.newFollower": "{name} vous suit désormais",
  "notifications.liked": "{name} a aimé votre publication",
  "notifications.commented": "{name} a commenté votre publication",
  "notifications.stayUpToDate": "Restez informé de votre activité",
  "notifications.new": "{count} nouvelles",
  "notifications.signInTitle": "Connectez-vous pour voir vos notifications",
  "notifications.signInDesc":
    "Vous devez être connecté pour voir vos notifications.",
  "notifications.signIn": "Se connecter",
  "notifications.markAllReadBtn": "Tout marquer lu",
  "notifications.clearAll": "Tout effacer",
  "notifications.noCategory": "Aucune notification {category}",
  "notifications.emptyHint":
    "Lorsque vous recevrez des notifications, elles apparaîtront ici.",
  "notifications.trySwitching": "Essayez de changer de catégorie.",
  "notifications.allCaughtUp": "Vous êtes à jour",
  "notifications.catAll": "Tout",
  "notifications.catBookings": "Réservations",
  "notifications.catQueue": "File d'attente",
  "notifications.catContent": "Contenu",
  "notifications.catSocial": "Social",
  "notifications.catAdmin": "Admin",

  // ── Queue ───────────────────────────────────────────────────────────────
  "queue.title": "File d'attente",
  "queue.position": "Position {position}",
  "queue.waiting": "En attente",
  "queue.yourTurn": "C'est votre tour !",
  "queue.joinQueue": "Prendre un ticket",
  "queue.leaveQueue": "Quitter la file",
  "queue.empty": "La file est vide",
  "queue.estimatedWait": "Attente estimée : {time}",
  "queue.details": "Détails de la file",
  "queue.reorderHint": "Maintenez l'icône de poignée pour réorganiser",
  "queue.positionAndStatus": "Position et statut dans la file",
  "queue.acceptBookings": "Accepter les réservations de file",
  "queue.acceptBookingsOn":
    "Les clients peuvent réserver une place dans cette file",
  "queue.acceptBookingsOff":
    "La réservation de file est actuellement désactivée",
  "queue.addClientToQueue": "Ajouter un client à la file",
  "queue.joinTheQueue": "Rejoindre la file",
  "queue.addClientDesc":
    "Créer une réservation et ajouter directement à cette file",
  "queue.joinDesc": "Choisissez vos services et rejoignez la file de cet agent",
  "queue.addToQueue": "Ajouter à la file",
  "queue.bookASpot": "Réserver une place",
  "queue.bookingUnavailable": "Réservation de file indisponible",
  "queue.bookingUnavailableDesc":
    "Cette file n'accepte pas de réservations pour le moment. Réessayez plus tard.",
  "queue.emptyQueue": "Cette file est vide",
  "queue.emptyStaffHint": "Ajoutez des clients depuis les réservations du jour",
  "queue.emptyClientHint": "Personne n'est dans cette file pour le moment…",
  "queue.start": "Démarrer",
  "queue.markAbsent": "Marquer absent",
  "queue.markCompleted": "Marquer terminé",
  "queue.backToWaiting": "Remettre en attente",
  "queue.visitor": "Visiteur",
  "queue.markAbsentConfirm":
    "Êtes-vous sûr de vouloir marquer {name} comme absent et le retirer de la file ?",
  "queue.markAbsentRemove": "Marquer absent et retirer",
  "queue.inProgress": "En cours",
  "queue.serviceDuration": "Durée du service {duration} min",
  "queue.joined": "Rejoint à {time}",
  "queue.done": "Terminé",
  "queue.absent": "Absent",
  "queue.avgWaiting": "~{time} min d'attente en moyenne",
  "queue.serviceCompleted": "Service terminé",
  "queue.addPerson": "Ajouter une personne à la file",
  "queue.addPersonDesc":
    "Entrez un ID de réservation pour ajouter le client à la file de cet agent. Seules les réservations confirmées avec le statut « inQueue » peuvent être ajoutées.",
  "queue.bookingId": "ID de réservation",
  "queue.enterBookingId": "Entrez l'ID de réservation...",
  "queue.positionLabel": "Position",
  "queue.positionOptional": "facultatif — laissez vide pour ajouter à la fin",
  "queue.addVisitorOrClient":
    "Ajouter un visiteur ou client existant à la file de {name}",
  "queue.selectServicesFor": "Sélectionnez les services pour la file de {name}",
  "queue.selectServicesJoin": "Sélectionnez les services et rejoignez la file",
  "queue.bookingType": "Type de réservation",
  "queue.existingClient": "Client existant",
  "queue.visitorName": "Nom du visiteur",
  "queue.enterVisitorName": "Entrez le nom du visiteur",
  "queue.phoneNumber": "Numéro de téléphone",
  "queue.enterPhone": "Entrez le numéro de téléphone du client",
  "queue.email": "E-mail",
  "queue.enterEmail": "Entrez l'e-mail du client",
  "queue.selectServices": "Sélectionner les services",
  "queue.optional": "facultatif",
  "queue.noServicesAvailable": "Aucun service disponible pour cet agent.",
  "queue.servicesSelected": "{count} service sélectionné",
  "queue.servicesSelected_other": "{count} services sélectionnés",
  "queue.notes": "Notes",
  "queue.specialRequests": "Demandes spéciales ou notes...",

  // ── Admin ───────────────────────────────────────────────────────────────
  "admin.dashboard": "Tableau de bord",
  "admin.dashboard.platformOverview":
    "Aperçu de la plateforme et actions rapides",
  "admin.dashboard.totalUsers": "Utilisateurs totaux",
  "admin.dashboard.totalLounges": "Salons totaux",
  "admin.dashboard.totalBookings": "Réservations totales",
  "admin.dashboard.newThisMonth": "Nouveaux ce mois",
  "admin.dashboard.systemHealth": "Santé du système",
  "admin.users": "Utilisateurs",
  "admin.lounges": "Salons",
  "admin.reports": "Signalements",
  "admin.services": "Services",
  "admin.categories": "Catégories",
  "admin.analytics": "Statistiques",

  // ── Footer ──────────────────────────────────────────────────────────────
  "footer.platform": "Plateforme",
  "footer.feed": "Fil d'actualité",
  "footer.shop": "Boutique",
  "footer.book": "Réserver",
  "footer.forClients": "Pour les clients",
  "footer.discoverStyles": "Trouvez l'inspiration",
  "footer.bookAppointments": "Prendre rendez-vous",
  "footer.savedFavorites": "Favoris & Enregistrés",
  "footer.forCenters": "Pour les centres de beauté",
  "footer.dashboard": "Tableau de bord",
  "footer.clients": "Clientèle",
  "footer.queue": "File d'attente",
  "footer.contact": "Contact",
  "footer.aboutUs": "À propos",
  "footer.helpCenter": "Centre d'aide",
  "footer.privacyPolicy": "Politique de confidentialité",
  "footer.termsOfService": "Conditions d'utilisation",

  // ── Time ────────────────────────────────────────────────────────────────
  "time.justNow": "À l'instant",
  "time.minutesAgo": "il y a {count} min",
  "time.hoursAgo": "il y a {count}h",
  "time.daysAgo": "il y a {count}j",
  "time.weeksAgo": "il y a {count} sem",
  "time.today": "Aujourd'hui",
  "time.yesterday": "Hier",

  // ── Validation ──────────────────────────────────────────────────────────
  "validation.required": "Ce champ est obligatoire",
  "validation.invalidEmail": "Adresse e-mail invalide",
  "validation.passwordTooShort":
    "Le mot de passe doit contenir au moins 8 caractères",
  "validation.passwordMismatch": "Les mots de passe ne correspondent pas",

  // ── Toast messages ──────────────────────────────────────────────────────
  "toast.saved": "Enregistré avec succès",
  "toast.deleted": "Supprimé avec succès",
  "toast.error": "Oups ! Veuillez réessayer.",
  "toast.copied": "Copié !",
  "toast.themeUpdated": "Thème mis à jour",
  "toast.languageUpdated": "Langue mise à jour",
  "toast.profileUpdated": "Profil mis à jour",
  "toast.locationUpdated": "Localisation mise à jour",
  "toast.bookingConfirmed": "Réservation confirmée !",
  "toast.bookingCancelled": "Réservation annulée",

  // ── Language selector ───────────────────────────────────────────────────
  "language.title": "Langue",
  "language.description": "Choisissez votre langue préférée",

  // ── Theme selector ──────────────────────────────────────────────────────
  "theme.title": "Thème",

  // ── Home ────────────────────────────────────────────────────────────────
  "home.title": "Accueil",
  "home.subtitle": "Échangez avec la communauté et partagez vos idées",

  // ── Content creation ────────────────────────────────────────────────────
  "content.newPost": "Nouvelle publication",
  "content.newReel": "Nouveau Reel",

  // ── Footer (extra) ─────────────────────────────────────────────────────
  "footer.description":
    "La plateforme tout-en-un pour découvrir les tendances, acheter des produits de beauté et réserver dans les meilleurs centres près de chez vous.",
  "footer.copyright": "Frame Beauty. Tous droits réservés.",
  "footer.madeIn": "Conçu avec soin en Tunisie",
  "footer.forLounges": "Pour les salons",
  "footer.registerLounge": "Inscrire votre salon",
  "footer.analytics": "Statistiques",

  // ── Landing page ────────────────────────────────────────────────────────
  "landing.heroTitle": "Votre parcours beauté\ncommence avec",
  "landing.heroBadge": "Fil · Boutique · Réserver",
  "landing.heroSubtitle":
    "Découvrez les styles tendance, achetez des produits de beauté sélectionnés et réservez dans les meilleurs salons près de chez vous — tout en un seul endroit.",
  "landing.getStartedFree": "Commencer gratuitement",
  "landing.signIn": "Se connecter",
  "landing.freeToUse": "Gratuit",
  "landing.noCreditCard": "Sans carte bancaire",
  "landing.instantBooking": "Réservation instantanée",

  "landing.thePlatform": "La Plateforme",
  "landing.everythingYouNeed": "Tout ce qu'il vous faut",
  "landing.platformSubtitle":
    "Une plateforme, trois expériences puissantes conçues pour sublimer chaque étape de votre parcours beauté.",
  "landing.pillar1Title": "Fil d'actualité",
  "landing.pillar1Tagline": "Inspirez-vous. Inspirez les autres.",
  "landing.pillar1Desc":
    "Un flux créatif vivant où styles, tendances et idées se rencontrent. Suivez des artistes, découvrez de nouveaux looks et laissez la communauté transformer votre vision de la beauté.",
  "landing.pillar1Feat1": "Découvrez les styles et techniques tendance",
  "landing.pillar1Feat2": "Suivez vos artistes et salons préférés",
  "landing.pillar1Feat3": "Enregistrez les looks qui vous inspirent",
  "landing.pillar1Feat4": "Partagez vos propres transformations",
  "landing.pillar2Title": "Boutique",
  "landing.pillar2Tagline": "Toute la beauté, au même endroit.",
  "landing.pillar2Desc":
    "Un marché sélectionné où professionnels et passionnés de beauté trouvent exactement ce dont ils ont besoin. Des soins capillaires aux essentiels skincare.",
  "landing.pillar2Feat1": "Produits sélectionnés de marques de confiance",
  "landing.pillar2Feat2": "Recommandations de professionnels",
  "landing.pillar2Feat3": "Offres exclusives et nouveautés",
  "landing.pillar2Feat4": "Vrais avis de vrais clients",
  "landing.pillar3Title": "Réserver",
  "landing.pillar3Tagline": "Votre temps, respecté.",
  "landing.pillar3Desc":
    "Trouvez les meilleurs salons, parcourez leurs services et réservez en quelques secondes. Le suivi en temps réel vous dit exactement quand c'est votre tour.",
  "landing.pillar3Feat1":
    "Réservation instantanée avec disponibilité en direct",
  "landing.pillar3Feat2": "Suivi de file d'attente en temps réel",
  "landing.pillar3Feat3": "Notes et avis vérifiés",
  "landing.pillar3Feat4": "Recommandations intelligentes à proximité",

  "landing.simpleAndFast": "Simple & Rapide",
  "landing.howItWorks": "Comment ça marche",
  "landing.stepsSubtitle":
    "De la découverte à votre rendez-vous — voici comment Frame fonctionne.",
  "landing.step1Title": "Découvrez",
  "landing.step1Desc":
    "Parcourez votre fil pour trouver l'inspiration, explorez les styles tendance et trouvez les salons et produits qui vous correspondent.",
  "landing.step2Title": "Choisissez",
  "landing.step2Desc":
    "Achetez les produits que vous aimez, choisissez un service, sélectionnez votre créneau et confirmez — en quelques taps.",
  "landing.step3Title": "Brillez",
  "landing.step3Desc":
    "Arrivez au top, profitez d'une expérience premium et partagez votre transformation avec la communauté.",

  "landing.partnerLounges": "Salons partenaires",
  "landing.happyCustomers": "Clients satisfaits",
  "landing.averageRating": "Note moyenne",

  "landing.forClients": "Pour les clients",
  "landing.clientsTitle": "Votre beauté,\nà votre façon",
  "landing.clientsSubtitle":
    "Découvrez les styles tendance, achetez des produits et réservez votre prochain rendez-vous — tout dans une seule appli.",
  "landing.clientsFeat1": "Parcourez les posts et reels des meilleurs salons",
  "landing.clientsFeat2": "Achetez des produits beauté directement",
  "landing.clientsFeat3": "Réservez et rejoignez les files d'attente",
  "landing.clientsFeat4": "Enregistrez vos salons et styles préférés",
  "landing.clientsFeat5": "Notez et évaluez vos expériences",
  "landing.clientsCardTitle": "Votre espace beauté",
  "landing.clientsCardSubtitle": "Tout au même endroit",
  "landing.trendingStyles": "Styles tendance",
  "landing.savedLounges": "Salons enregistrés",
  "landing.upcomingBooking": "Prochain rendez-vous",
  "landing.newPosts": "5 nouvelles publications",
  "landing.bookingsCount": "2 réservations",

  "landing.forLounges": "Pour les salons",
  "landing.loungesTitle": "Développez votre activité\navec",
  "landing.loungesSubtitle":
    "Publiez dans le fil, listez vos produits et gérez vos réservations — depuis un tableau de bord unique.",
  "landing.loungesFeat1": "Publiez des posts et reels dans le fil",
  "landing.loungesFeat2": "Listez et vendez vos produits en boutique",
  "landing.loungesFeat3": "Réservation en ligne et gestion de file d'attente",
  "landing.loungesFeat4": "Notes et avis pour bâtir la confiance",
  "landing.loungesFeat5": "Tableau de bord analytique et insights clients",
  "landing.registerLounge": "Inscrire votre salon",
  "landing.studioElite": "Studio Élite",
  "landing.premiumSalon": "Salon Premium — 4.9 ★",
  "landing.haircut": "Coupe",
  "landing.haircutPrice": "25 TND",
  "landing.beardTrim": "Taille barbe",
  "landing.beardTrimPrice": "15 TND",
  "landing.fullPackage": "Forfait complet",
  "landing.fullPackagePrice": "45 TND",
  "landing.bookingsToday": "12 réservations aujourd'hui",
  "landing.inQueue": "3 en attente",

  // Mobile (web maintenant / iOS & Android bientôt)
  "landing.mobileEyebrow": "Partout. Sur tous les appareils.",
  "landing.mobileTitle":
    "Disponible sur le web dès maintenant — dans votre poche demain.",
  "landing.mobileSubtitle":
    "Frame Beauty est une Progressive Web App complète que vous pouvez utiliser dès maintenant — sans installation ni attente. Les applications iOS et Android sont en cours de développement pour une expérience encore plus fluide.",
  "landing.mobileBenefit1":
    "Accédez depuis n'importe quel navigateur — aucun téléchargement requis.",
  "landing.mobileBenefit2":
    "Ajoutez à l'écran d'accueil pour une expérience app-like dès aujourd'hui.",
  "landing.mobileBenefit3":
    "Recevez une notification dès que nos apps iOS & Android sont disponibles.",
  "landing.mobileLiveNow": "Disponible",
  "landing.mobileWeb": "Web app",
  "landing.mobileAvailable": "Disponible",
  "landing.mobileSoon": "Bientôt",
  "landing.mobileNotifyLabel":
    "Soyez parmi les premiers informés du lancement mobile",
  "landing.mobileNotifyPlaceholder": "votre@email.com",
  "landing.mobileNotifyButton": "Me notifier",
  "landing.mobileNotifyDisclaimer":
    "Un seul e-mail au lancement. Jamais de spam.",
  "landing.mobileNotifyThanks":
    "Vous êtes sur la liste — nous vous contacterons dès le lancement.",

  // Testimonials
  "landing.testimonials": "Ce que les gens disent",
  "landing.testimonialsTitle": "De vraies histoires de vraies personnes",
  "landing.testimonialsSubtitle":
    "Clients et salons à travers la Tunisie partagent leur expérience avec Frame Beauty.",
  "landing.t1Name": "Fatma B.",
  "landing.t1Role": "Cliente de Tunis",
  "landing.t1Text":
    "J'appelais trois salons avant de trouver un créneau libre. Maintenant j'ouvre Frame, je choisis et je me présente. C'est tout. Vraiment révolutionnaire.",
  "landing.t2Name": "Rami K.",
  "landing.t2Role": "Propriétaire de salon, Sousse",
  "landing.t2Text":
    "Nous avons doublé nos réservations en un mois. Le système de file d'attente nous a fait gagner des heures d'appels téléphoniques chaque jour.",
  "landing.t3Name": "Yasmine H.",
  "landing.t3Role": "Cliente de Sfax",
  "landing.t3Text":
    "Le feed est tellement inspirant — j'ai trouvé ma nouvelle coiffeuse grâce à un reel qu'elle a posté. Frame c'est Instagram + une appli de réservation.",
  "landing.t4Name": "Hana M.",
  "landing.t4Role": "Centre de beauté, Ariana",
  "landing.t4Text":
    "On gagne de nouveaux clients chaque semaine grâce au marketplace. Lister nos services a pris 10 minutes et les analytics nous aident.",

  // FAQ
  "landing.faqEyebrow": "Des questions ?",
  "landing.faqTitle": "Tout ce que vous devez savoir",
  "landing.faqSubtitle":
    "Vous ne trouvez pas la réponse ? Contactez notre équipe.",
  "landing.faq1Q": "Frame Beauty est-il gratuit ?",
  "landing.faq1A":
    "Oui — Frame Beauty est entièrement gratuit pour les clients. Pour les salons, nous proposons une inscription gratuite pour commencer.",
  "landing.faq2Q": "Comment fonctionne le système de réservation ?",
  "landing.faq2A":
    "Trouvez un salon, choisissez votre service et créneau, confirmez — fait en quelques secondes. Vous pouvez suivre votre file d'attente en direct.",
  "landing.faq3Q": "Puis-je gérer mon salon sur Frame Beauty ?",
  "landing.faq3A":
    "Absolument. Inscrivez votre salon, publiez vos services, gérez les réservations, vendez des produits et postez dans le feed — tout depuis un tableau de bord.",
  "landing.faq4Q": "Y a-t-il une application mobile ?",
  "landing.faq4A":
    "Frame Beauty est une Progressive Web App complète — ajoutez-la à votre écran d'accueil dès maintenant. Les apps iOS et Android arrivent bientôt.",
  "landing.faq5Q": "Mes données sont-elles sécurisées ?",
  "landing.faq5A":
    "Oui. Nous utilisons le chiffrement standard du secteur et ne vendons jamais vos données à des tiers.",

  "landing.trustedInTunisia": "Fait confiance en Tunisie",
  "landing.fiveStarReviews": "Avis 5 étoiles",

  "landing.ctaTitle": "Prêt à découvrir",
  "landing.ctaSubtitle":
    "Rejoignez des milliers de clients et salons qui font déjà confiance à Frame Beauty. Votre prochaine expérience est à un clic.",
  "landing.createFreeAccount": "Créer un compte gratuit",
  "landing.alreadyHaveAccount": "J'ai déjà un compte",

  // ── Auth (extended) ─────────────────────────────────────────────────────
  "auth.signup.chooseAccountType": "Choisissez votre type de compte",
  "auth.signup.pickExperience": "Sélectionnez l'expérience qui vous convient",
  "auth.signup.continueAs": "Continuer en tant que",
  "auth.signup.client": "Client",
  "auth.signup.center": "Centre",
  "auth.signup.checkEmail": "Vérifiez votre e-mail",
  "auth.signup.verificationSent":
    "Nous avons envoyé un lien de vérification à {email}",
  "auth.signup.verificationEmailSent": "E-mail de vérification envoyé",
  "auth.signup.clickLink":
    "Cliquez sur le lien dans votre e-mail pour compléter la création de votre compte.",
  "auth.signup.waitingVerification": "En attente de vérification...",
  "auth.signup.didntReceive":
    "Vous n'avez pas reçu l'e-mail ? Vérifiez vos spams ou réessayez.",
  "auth.signup.tryDifferentEmail": "Essayer un autre e-mail",
  "auth.signup.createAccount": "Créer un compte",
  "auth.signup.phoneNumber": "Numéro de téléphone",
  "auth.signup.phoneHint": "Entrez 8 chiffres pour la Tunisie",
  "auth.signup.email": "E-mail",
  "auth.signup.emailPlaceholder": "vous@exemple.com",
  "auth.signup.password": "Mot de passe",
  "auth.signup.confirmPassword": "Confirmer le mot de passe",
  "auth.signup.sendingVerification": "Envoi de l'e-mail de vérification...",
  "auth.signup.creatingAccount": "Création du compte...",
  "auth.signup.submit": "S'inscrire",
  "auth.signup.hasAccount": "Vous avez déjà un compte ? Connectez-vous",
  "auth.signin.title": "Se connecter à Frame",
  "auth.signin.emailOrPhone": "E-mail ou numéro de téléphone",
  "auth.signin.emailPhonePlaceholder": "vous@exemple.com ou 50123456",
  "auth.signin.password": "Mot de passe",
  "auth.signin.submit": "Se connecter",
  "auth.signin.forgotPassword": "Mot de passe oublié ?",
  "auth.signin.noAccount": "Pas de compte ? Inscrivez-vous",
  "auth.rateLimit": "Trop de tentatives ({remainingSeconds}s)",
  "auth.orContinueWith": "Ou continuer avec",
  "auth.backToHome": "Retour à l'accueil",
  "auth.backToSignIn": "Retour à la connexion",
  "auth.forgot.title": "Mot de passe oublié ?",
  "auth.forgot.description":
    "Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.",
  "auth.forgot.emailLabel": "Adresse e-mail",
  "auth.forgot.emailRequired": "L'e-mail est requis",
  "auth.forgot.invalidEmail": "Veuillez entrer une adresse e-mail valide",
  "auth.forgot.sending": "Envoi...",
  "auth.forgot.submit": "Envoyer le lien",
  "auth.forgot.successMessage":
    "E-mail de réinitialisation envoyé ! Vérifiez votre boîte de réception.",
  "auth.forgot.failedToSend": "Échec de l'envoi de l'e-mail",
  "auth.reset.invalidToken":
    "Jeton invalide ou manquant. Veuillez demander un nouveau lien de réinitialisation.",
  "auth.reset.emailSent":
    "E-mail de réinitialisation envoyé ! Vérifiez votre boîte de réception.",
  "auth.reset.passwordRequired": "Le nouveau mot de passe est requis",
  "auth.reset.passwordMinLength":
    "Le mot de passe doit contenir au moins 8 caractères",
  "auth.reset.passwordMaxLength":
    "Le mot de passe ne doit pas dépasser 128 caractères",
  "auth.reset.confirmRequired": "La confirmation du mot de passe est requise",
  "auth.reset.passwordsMismatch": "Les mots de passe ne correspondent pas",
  "auth.reset.successRedirect":
    "Mot de passe réinitialisé ! Redirection vers la connexion...",
  "auth.reset.backToForgot": "Retour à mot de passe oublié",
  "auth.reset.invalidLink": "Lien invalide",
  "auth.reset.invalidLinkDesc":
    "Ce lien de réinitialisation est invalide ou a expiré. Veuillez en demander un nouveau.",
  "auth.reset.requestNewLink": "Demander un nouveau lien",
  "auth.reset.title": "Réinitialiser votre mot de passe",
  "auth.reset.description": "Entrez votre nouveau mot de passe ci-dessous.",
  "auth.reset.newPassword": "Nouveau mot de passe",
  "auth.reset.confirmPassword": "Confirmer le nouveau mot de passe",
  "auth.reset.resetting": "Réinitialisation...",
  "auth.reset.submit": "Réinitialiser le mot de passe",
  "auth.checkEmail.title": "Vérifiez votre e-mail",
  "auth.checkEmail.sentTo": "Nous avons envoyé un lien de vérification à",
  "auth.checkEmail.clickLink":
    "Cliquez sur le lien dans l'e-mail pour vérifier votre compte. Cela peut prendre quelques minutes.",
  "auth.checkEmail.didntReceive": "Vous n'avez pas reçu l'e-mail ?",
  "auth.checkEmail.checkSpam": "Vérifiez vos spams ou réessayez.",
  "auth.checkEmail.signUpDifferent": "S'inscrire avec un autre e-mail",

  // ── Content (extended) ──────────────────────────────────────────────────
  "content.empty.feedTitle": "Votre fil est vide",
  "content.empty.feedDesc":
    "Suivez des personnes et des salons pour voir leurs publications ici.",
  "content.empty.exploreTitle": "Rien à explorer pour le moment",
  "content.empty.exploreDesc":
    "Du contenu apparaîtra ici quand les gens commenceront à publier.",
  "content.empty.postsTitle": "Aucune publication",
  "content.empty.postsDesc":
    "Partagez votre première publication avec la communauté !",
  "content.empty.reelsTitle": "Aucun reel",
  "content.empty.reelsDesc": "Créez une courte vidéo à partager.",
  "content.empty.savedTitle": "Aucun élément enregistré",
  "content.empty.savedDesc":
    "Ajoutez des publications en favoris pour les retrouver ici.",
  "content.empty.commentsTitle": "Aucun commentaire",
  "content.empty.commentsDesc": "Soyez le premier à partager vos pensées.",
  "content.empty.hashtagTitle": "Aucune publication avec ce hashtag",
  "content.empty.hashtagDesc": "Soyez le premier à utiliser ce hashtag !",
  "content.post.create": "Créer une publication",
  "content.post.placeholder": "Qu'avez-vous en tête ?",
  "content.post.photo": "Photo",
  "content.post.posting": "Publication...",
  "content.post.share": "Partager",
  "content.post.edit": "Modifier la publication",
  "content.hashtag.placeholder": "Ajouter un hashtag...",
  "content.reel.create": "Créer un Reel",
  "content.reel.addThumbnail": "Ajouter une miniature",
  "content.reel.captionPlaceholder": "Écrire une légende...",
  "content.reel.uploading": "Téléchargement...",
  "content.reel.share": "Partager le Reel",
  "content.reel.edit": "Modifier le Reel",
  "content.comments.title": "Commentaires",
  "content.comments.replyingTo": "En réponse à",
  "content.like": "J'aime",
  "content.comment": "Commenter",
  "content.report.inappropriate": "Contenu inapproprié",
  "content.report.spam": "Spam ou trompeur",
  "content.report.harassment": "Harcèlement ou intimidation",
  "content.report.violence": "Violence ou actes dangereux",
  "content.report.hateSpeech": "Discours haineux",
  "content.report.ipViolation": "Violation de propriété intellectuelle",
  "content.report.title": "Signaler {targetType}",
  "content.report.whyReporting": "Pourquoi signalez-vous ce {targetType} ?",
  "content.report.describePlaceholder": "Décrivez le problème...",
  "content.report.submitting": "Envoi...",
  "content.report.submit": "Envoyer le signalement",
  "content.reel.selectVideo": "Sélectionner une vidéo",
  "content.reel.maxDuration": "Max {seconds} secondes",
  "content.reel.durationError":
    "La vidéo doit durer {seconds} secondes ou moins.",
  "content.reel.thumbnailOptional": "Miniature personnalisée (optionnel)",
  "content.saving": "Enregistrement...",
  "content.saveChanges": "Enregistrer les modifications",
  "content.report.other": "Autre",
  "content.comments.addComment": "Ajouter un commentaire...",
  "content.comments.replyToPlaceholder": "Répondre à {name}...",
  "content.menu.moreOptions": "Plus d'options",
  "content.menu.edit": "Modifier",
  "content.menu.delete": "Supprimer",
  "content.menu.report": "Signaler",
  "content.menu.hide": "Masquer (Admin)",
  "content.menu.unhide": "Afficher (Admin)",
  "content.menu.forceDelete": "Suppression forcée (Admin)",
  "content.latestUpdates": "Dernières actualités",

  // ── Common (extended) ───────────────────────────────────────────────────
  "common.add": "Ajouter",
  "common.saving": "Enregistrement...",
  "common.saveChanges": "Enregistrer les modifications",
  "common.other": "Autre",
  "common.report": "Signaler",
  "common.goBack": "Retour",
  "common.notNow": "Pas maintenant",
  "common.phoneNumber": "Numéro de téléphone",
  "common.email": "E-mail",
  "common.notes": "Notes",
  "common.optional": "(facultatif)",
  "common.location": "Emplacement",

  // ── Agents ──────────────────────────────────────────────────────────────
  "agents.form.updateSuccess": "Agent mis à jour avec succès",
  "agents.form.createSuccess": "Agent créé avec succès",
  "agents.form.saveFailed": "Échec de l'enregistrement de l'agent",
  "agents.form.editTitle": "Modifier l'agent",
  "agents.form.createTitle": "Créer un nouvel agent",
  "agents.form.image": "Image de l'agent",
  "agents.form.imagePlaceholder": "Sélectionner l'image de l'agent",
  "agents.form.name": "Nom de l'agent *",
  "agents.form.namePlaceholder": "Entrez le nom de l'agent",
  "agents.form.passwordPlaceholder": "Entrez le mot de passe",
  "agents.form.loungePlaceholder": "Choisir un salon",
  "agents.list.searchPlaceholder": "Rechercher des agents...",

  // ── Settings (extended) ─────────────────────────────────────────────────
  "settings.changePassword": "Changer le mot de passe",
  "settings.currentPassword": "Mot de passe actuel",
  "settings.currentPasswordPlaceholder": "Entrez votre mot de passe actuel",
  "settings.newPassword": "Nouveau mot de passe",
  "settings.newPasswordPlaceholder": "Entrez votre nouveau mot de passe",
  "settings.confirmNewPassword": "Confirmer le nouveau mot de passe",
  "settings.confirmPasswordPlaceholder": "Confirmez votre nouveau mot de passe",
  "settings.changingPassword": "Changement du mot de passe...",
  "settings.updateLoungeTitle": "Modifier le titre du salon",
  "settings.updateName": "Modifier le nom",
  "settings.loungeTitle": "Titre du salon",
  "settings.firstName": "Prénom",
  "settings.lastName": "Nom de famille",
  "settings.updateBio": "Modifier la bio",
  "settings.bio": "Bio",
  "settings.bioPlaceholderClient": "Parlez-nous de vous...",
  "settings.bioPlaceholderLounge": "Parlez-nous de vos services...",
  "settings.characters": "caractères",
  "settings.updatePhone": "Modifier le numéro de téléphone",
  "settings.phoneNumber": "Numéro de téléphone",
  "settings.loungeTitlePlaceholder": "Entrez le titre de votre salon",
  "settings.firstNamePlaceholder": "Entrez votre prénom",
  "settings.lastNamePlaceholder": "Entrez votre nom de famille",
  "settings.phoneHint": "Entrez 8 chiffres (ex : 12345678)",
  "settings.logout": "Déconnexion",
  "settings.logoutAll": "Se déconnecter de tous les appareils",

  // ── Bookings (extended) ─────────────────────────────────────────────────
  "bookings.cancel.title": "Annuler la réservation",
  "bookings.cancel.confirm":
    "Êtes-vous sûr de vouloir annuler cette réservation ?",
  "bookings.cancel.reasonLabel": "Raison de l'annulation",
  "bookings.cancel.reasonPlaceholder":
    "Ex : conflit d'horaire, plus nécessaire...",
  "bookings.cancel.cancelling": "Annulation...",
  "bookings.cancel.submit": "Annuler la réservation",
  "bookings.wizard.notesLabel": "Notes supplémentaires (Facultatif)",
  "bookings.wizard.notesPlaceholder": "Demandes spéciales ou notes...",

  // ── Push notifications ──────────────────────────────────────────────────
  "notifications.prompt.title": "Restez informé de vos réservations",
  "notifications.prompt.description":
    "Recevez des notifications pour les confirmations, mises à jour de file et rappels.",
  "notifications.prompt.enabling": "Activation…",
  "notifications.prompt.enable": "Activer les notifications",
  "notifications.prompt.notNow": "Pas maintenant",

  // ── Search ──────────────────────────────────────────────────────────────
  "search.placeholder": "Rechercher un centre par nom...",
  "search.button": "Rechercher",
  "search.validation": "Entrez quelque chose à rechercher",

  // ── Rating ──────────────────────────────────────────────────────────────
  "rating.poor": "Médiocre",
  "rating.fair": "Passable",
  "rating.good": "Bien",
  "rating.veryGood": "Très bien !",
  "rating.excellent": "Excellent !",
  "rating.updateTitle": "Modifier votre évaluation",
  "rating.rateTitle": "Évaluez votre expérience",
  "rating.howWouldYouRate": "Comment évaluez-vous {name} ?",
  "rating.tapStar": "Appuyez sur une étoile pour noter",
  "rating.commentPlaceholder": "Partagez votre expérience (facultatif)",
  "rating.saving": "Enregistrement...",
  "rating.update": "Modifier l'évaluation",
  "rating.submit": "Envoyer l'évaluation",
  "rating.remove": "Supprimer l'évaluation",

  // ── Location ────────────────────────────────────────────────────────────
  "location.label": "Emplacement",
  "location.noLocation": "Aucun emplacement défini",
  "location.updateLocation": "Modifier l'emplacement",
  "location.searchLabel": "Rechercher un emplacement",
  "location.searchPlaceholder": "Rechercher un lieu...",
  "location.selectedLocation": "Emplacement sélectionné :",
  "location.updating": "Mise à jour...",
  "location.mapHint":
    "Cliquez sur la carte ou recherchez un lieu pour le sélectionner. Faites glisser le marqueur pour ajuster la position.",
  "location.showLess": "voir moins",
  "location.seeInMap": "Voir sur la carte",

  // ── Lounge posts ────────────────────────────────────────────────────────
  "loungePosts.latestUpdates": "Dernières mises à jour",
  "loungePosts.stayConnected": "Restez connecté avec nous",
  "loungePosts.postsCount": "{count} publications",
  "loungePosts.noPosts": "Aucune publication",
  "loungePosts.checkBack": "Revenez plus tard pour les mises à jour",
  "loungePosts.like": "J'aime",
  "loungePosts.comment": "Commenter",
  "loungePosts.share": "Partager",
  "loungePosts.loadMore": "Charger plus de publications",
  "loungePosts.likes_one": "{count} j'aime",
  "loungePosts.likes_other": "{count} j'aime",
  "loungePosts.comments_one": "{count} commentaire",
  "loungePosts.comments_other": "{count} commentaires",
  "loungePosts.shares_one": "{count} partage",
  "loungePosts.shares_other": "{count} partages",

  // ── Services ────────────────────────────────────────────────────────────
  "services.suggest.button": "Suggérer un service",
  "services.suggest.title": "Suggérer un nouveau service",
  "services.suggest.myTitle": "Mes suggestions de service",
  "services.suggest.desc":
    "Soumettez une suggestion de service pour examen par les administrateurs",
  "services.suggest.myDesc": "Suivez le statut de vos suggestions de service",
  "services.suggest.suggestNew": "Suggérer un nouveau service",
  "services.suggest.noSuggestions":
    "Vous n'avez soumis aucune suggestion de service.",
  "services.suggest.suggestFirst": "Suggérez votre premier service",
  "services.suggest.viewMy": "Voir mes suggestions",
  "services.suggest.price": "Prix :",
  "services.suggest.durationLabel": "Durée :",
  "services.suggest.gender": "Genre :",
  "services.suggest.adminNote": "Note admin :",
  "services.suggest.name": "Nom *",
  "services.suggest.description": "Description *",
  "services.suggest.priceLabel": "Prix (dt) *",
  "services.suggest.duration": "Durée (minutes) *",
  "services.suggest.targetGender": "Genre cible *",
  "services.suggest.submitSuggestion": "Soumettre la suggestion",
  "services.gender.none": "Aucun",
  "services.gender.men": "Hommes",
  "services.gender.women": "Femmes",
  "services.gender.unisex": "Unisexe",
  "services.gender.kids": "Enfants",

  // ── Store ───────────────────────────────────────────────────────────────
  "store.title": "Boutique",
  "store.subtitle": "Parcourez notre collection de produits de soin premium",
  "store.searchPlaceholder": "Rechercher des produits...",
  "store.allProducts": "Tous les produits",
  "store.outOfStock": "Rupture de stock",
  "store.addToCart": "Ajouter",
  "store.noResults": "Aucun produit trouvé correspondant à votre recherche.",

  // ── Admin (extended) ────────────────────────────────────────────────────
  "admin.nav.userManagement": "Gestion des utilisateurs",
  "admin.nav.userManagementDesc":
    "Gérer les utilisateurs, bloquer/débloquer, réinitialiser les mots de passe",
  "admin.nav.contentModeration": "Modération du contenu",
  "admin.nav.contentModerationDesc":
    "Examiner les signalements et modérer le contenu",
  "admin.nav.services": "Services",
  "admin.nav.servicesDesc": "Gérer le catalogue de services",
  "admin.nav.loungeServices": "Services de salon",
  "admin.nav.loungeServicesDesc": "Attribuer des services aux salons",
  "admin.nav.queue": "File d'attente",
  "admin.nav.queueDesc": "Remplir les files quotidiennes",
  "admin.nav.system": "Système",
  "admin.nav.systemDesc": "Surveillance, journaux et outils",

  // ── Password strength ───────────────────────────────────────────────────
  "password.weak": "Faible",
  "password.fair": "Passable",
  "password.good": "Bien",
  "password.strong": "Fort",
  "password.veryStrong": "Très fort",

  // ── Bookings page ───────────────────────────────────────────────────────
  "bookings.signInTitle": "Connectez-vous pour voir vos réservations",
  "bookings.signInDesc":
    "Vous devez être connecté pour voir vos réservations et en planifier de nouvelles.",
  "bookings.signIn": "Se connecter",
  "bookings.exploreLounges": "Explorer les salons",
  "bookings.history": "Historique",
  "bookings.bookingHistory": "Historique des réservations",
  "bookings.bookingsManagement": "Gestion des réservations",
  "bookings.allBookings": "Toutes les réservations",
  "bookings.myBookings": "Mes réservations",
  "bookings.viewCompleted": "Voir vos réservations terminées",
  "bookings.manageLounge": "Gérer les réservations de votre salon",
  "bookings.viewManageAll": "Voir et gérer toutes les réservations du système",
  "bookings.viewManage": "Voir et gérer vos rendez-vous",

  // ── Book page ───────────────────────────────────────────────────────────
  "book.title": "Réservez votre rendez-vous",
  "book.subtitle":
    "Choisissez votre date, heure et finalisez votre réservation",

  // ── Lounge detail page ──────────────────────────────────────────────────
  "lounge.errorLoading": "Erreur de chargement du salon",
  "lounge.goBack": "Retour",
  "lounge.authRequired": "Authentification requise",
  "lounge.signInToView":
    "Veuillez vous connecter pour voir les détails du salon.",
  "lounge.signIn": "Se connecter",
  "lounge.notFound": "Salon introuvable",
  "lounge.notFoundDesc": "Le salon demandé est introuvable.",
  "lounge.browseLounges": "Parcourir les salons",

  // ── Saved page ──────────────────────────────────────────────────────────
  "saved.title": "Enregistrés",

  // ── Queue page ──────────────────────────────────────────────────────────
  "queue.defaultCenter": "Salon",

  // ── Clients page ────────────────────────────────────────────────────────
  "clients.profileNotFound": "Profil introuvable",
  "clients.goBack": "Retour",
  "clients.tabs.overview": "Aperçu",
  "clients.tabs.posts": "Publications",
  "clients.tabs.reels": "Reels",
  "clients.tabs.bookings": "Réservations",

  // ── Lounge agents page ──────────────────────────────────────────────────
  "loungeAgents.backToService": "← Retour à la gestion des services",
  "loungeAgents.title": "Gestion des agents",
  "loungeAgents.subtitle": "Gérer les agents de votre salon",

  // ── Admin Users ─────────────────────────────────────────────────────────
  "admin.users.title": "Gestion des utilisateurs",
  "admin.users.desc": "Gérer tous les utilisateurs de la plateforme",
  "admin.users.createUser": "Créer un utilisateur",
  "admin.users.searchPlaceholder": "Rechercher par nom ou email...",
  "admin.users.noUsers": "Aucun utilisateur trouvé",
  "admin.users.trySearch": "Essayez une autre recherche",
  "admin.users.noUsersYet": "Aucun utilisateur",
  "admin.users.headerUser": "Utilisateur",
  "admin.users.headerType": "Type",
  "admin.users.headerStatus": "Statut",
  "admin.users.headerJoined": "Inscription",
  "admin.users.blocked": "Bloqué",
  "admin.users.active": "Actif",
  "admin.users.edit": "Modifier",
  "admin.users.resetPassword": "Réinitialiser le mot de passe",
  "admin.users.unblock": "Débloquer",
  "admin.users.block": "Bloquer",
  "admin.users.deleteUser": "Supprimer l'utilisateur ?",
  "admin.users.resetPwTitle": "Réinitialiser le mot de passe — {email}",
  "admin.users.newPassword": "Nouveau mot de passe",
  "admin.users.enterNewPassword": "Entrer un nouveau mot de passe",
  "admin.users.resetting": "Réinitialisation...",
  "admin.users.reset": "Réinitialiser",
  "admin.users.creating": "Création...",
  "admin.users.create": "Créer",
  "admin.users.editUser": "Modifier l'utilisateur",
  "admin.users.email": "Email",
  "admin.users.password": "Mot de passe",
  "admin.users.type": "Type",
  "admin.users.firstName": "Prénom",
  "admin.users.lastName": "Nom",
  "admin.users.phone": "Téléphone",
  "admin.users.typeClient": "Client",
  "admin.users.typeLounge": "Salon",
  "admin.users.typeAgent": "Agent",
  "admin.users.saving": "Enregistrement...",

  // ── Admin Moderation ────────────────────────────────────────────────────
  "admin.moderation.title": "Modération du contenu",
  "admin.moderation.desc": "Examiner les signalements et modérer le contenu",
  "admin.moderation.statusLabel": "Statut :",
  "admin.moderation.filterAll": "Tous",
  "admin.moderation.filterPending": "En attente",
  "admin.moderation.filterReviewed": "Examiné",
  "admin.moderation.filterDismissed": "Rejeté",
  "admin.moderation.filterActionTaken": "Action prise",
  "admin.moderation.headerReporter": "Signaleur",
  "admin.moderation.headerTarget": "Cible",
  "admin.moderation.headerReason": "Raison",
  "admin.moderation.headerStatus": "Statut",
  "admin.moderation.headerDate": "Date",
  "admin.moderation.headerActions": "Actions",
  "admin.moderation.noReports": "Aucun signalement",
  "admin.moderation.noReportsFilter":
    "Aucun signalement ne correspond au filtre",
  "admin.moderation.review": "Examiner",
  "admin.moderation.hideContent": "Masquer le contenu",
  "admin.moderation.unhideContent": "Afficher le contenu",
  "admin.moderation.deleteContent": "Supprimer le contenu",
  "admin.moderation.deleteConfirm": "Supprimer le contenu ?",
  "admin.moderation.deleteConfirmDesc":
    "Cela supprimera définitivement le contenu signalé.",
  "admin.moderation.reviewReport": "Examiner le signalement",
  "admin.moderation.adminNote": "Note de l'administrateur",
  "admin.moderation.adminNotePlaceholder":
    "Note optionnelle sur la décision...",
  "admin.moderation.submitting": "Envoi...",
  "admin.moderation.submitReview": "Soumettre l'examen",

  // ── Admin Services ──────────────────────────────────────────────────────
  "admin.services.title": "Services",
  "admin.services.desc": "Gérer le catalogue de services de la plateforme",
  "admin.services.addService": "Ajouter un service",
  "admin.services.searchPlaceholder": "Rechercher des services...",
  "admin.services.noServices": "Aucun service",
  "admin.services.trySearch": "Essayez une autre recherche",
  "admin.services.addFirst": "Ajoutez votre premier service",
  "admin.services.headerName": "Nom",
  "admin.services.headerCategory": "Catégorie",
  "admin.services.headerDescription": "Description",
  "admin.services.deleteConfirm": "Supprimer le service ?",
  "admin.services.editService": "Modifier le service",
  "admin.services.selectCategory": "Sélectionner une catégorie",
  "admin.services.saving": "Enregistrement...",
  "admin.services.create": "Créer",

  // ── Admin Categories ────────────────────────────────────────────────────
  "admin.categories.title": "Catégories de services",
  "admin.categories.desc": "Organiser les services par catégories",
  "admin.categories.addCategory": "Ajouter une catégorie",
  "admin.categories.noCategories": "Aucune catégorie",
  "admin.categories.addFirst":
    "Ajoutez votre première catégorie pour organiser les services",
  "admin.categories.headerName": "Nom",
  "admin.categories.headerDescription": "Description",
  "admin.categories.headerIcon": "Icône",
  "admin.categories.deleteConfirm": "Supprimer la catégorie ?",
  "admin.categories.editCategory": "Modifier la catégorie",
  "admin.categories.addCategoryDesc":
    "Créer une nouvelle catégorie de service pour organiser vos services",
  "admin.categories.editCategoryDesc":
    "Mettre à jour les détails de la catégorie",
  "admin.categories.iconPlaceholder": "ex. ciseaux, spa, palette",
  "admin.categories.saving": "Enregistrement...",
  "admin.categories.create": "Créer",

  // ── Admin Agents ────────────────────────────────────────────────────────
  "admin.agents.title": "Gestion des agents",
  "admin.agents.desc": "Gérer les agents de tous les salons de la plateforme",

  // ── Admin System ────────────────────────────────────────────────────────
  "admin.system.title": "Système",
  "admin.system.desc":
    "Surveillance de la santé, journaux d'activité et outils d'administration",
  "admin.system.totalUsers": "Total utilisateurs",
  "admin.system.clients": "Clients",
  "admin.system.lounges": "Salons",
  "admin.system.agents": "Agents",
  "admin.system.systemHealth": "Santé du système",
  "admin.system.database": "Base de données",
  "admin.system.memoryHeap": "Mémoire (Heap utilisé)",
  "admin.system.uptime": "Disponibilité",
  "admin.system.adminTools": "Outils d'administration",
  "admin.system.userIdPlaceholder": "ID utilisateur",
  "admin.system.clearSessions": "Effacer les sessions",
  "admin.system.resetPassword": "Réinitialiser le mot de passe",
  "admin.system.exportData": "Exporter les données",
  "admin.system.newPassword": "Nouveau mot de passe",
  "admin.system.enterNewPassword": "Entrer un nouveau mot de passe",
  "admin.system.recentActivity": "Activité récente",
  "admin.system.loadingLogs": "Chargement des journaux...",
  "admin.system.noActivity": "Aucune activité enregistrée.",

  "admin.loungeServices.title": "Services de salon",
  "admin.loungeServices.desc":
    "Attribuer des services à des salons spécifiques",
  "admin.loungeServices.assignService": "Attribuer un service",
  "admin.suggestions.title": "Suggestions de services",
  "admin.suggestions.desc":
    "Aperçu des suggestions de services soumises par les salons",
  "admin.queue.title": "Gestion de la file d'attente",
  "admin.queue.desc":
    "Gérer la génération quotidienne de la file d'attente pour les salons",

  // ── Booking card ────────────────────────────────────────────────────────
  "booking.date": "Date :",
  "booking.time": "Heure :",
  "booking.clientNotes": "Notes du client :",
  "booking.cancellationReason": "Raison de l'annulation :",
  "booking.cancel": "Annuler",
  "booking.confirm": "Confirmer",
  "booking.markInQueue": "Mettre en file",
  "booking.deleteBooking": "Supprimer la réservation",
  "booking.deleteConfirm":
    "Êtes-vous sûr de vouloir supprimer définitivement cette réservation ? Cette action est irréversible.",
  "booking.goToQueue": "Aller à la file",
  "booking.locationNotAvailable": "Emplacement non disponible",
  "booking.location": "Emplacement :",
  "booking.bookedServices": "Services réservés :",
  "booking.noImage": "Pas d'image",
  "booking.unknownService": "Service inconnu",
  "booking.minutes": "minutes",
  "booking.noServicesInfo": "Aucune information sur les services",
  "booking.total": "Total :",
  "booking.service": "service",
  "booking.services": "services",
  "booking.dt": "dt",
  "booking.min": "min",
  "booking.handledBy": "Traité",
  "booking.by": "par {name}",
  "booking.handledByMultiple": "Traité par :",
  "booking.agentsCount": "({count} agents)",
  "booking.cancelledBy": "Par {name}",
  "booking.statusPending": "en attente",
  "booking.statusConfirmed": "confirmé",
  "booking.statusCancelled": "annulé",
  "booking.statusInQueue": "en file",
  "booking.statusCompleted": "terminé",

  // ── Cancel booking dialog ───────────────────────────────────────────────
  "booking.cancelTitle": "Annuler la réservation",
  "booking.cancelConfirm":
    "Êtes-vous sûr de vouloir annuler cette réservation ?",
  "booking.cancelReason": "Raison de l'annulation",
  "booking.cancelPlaceholder": "ex. Conflit d'horaire, plus nécessaire...",
  "booking.goBackBtn": "Retour",
  "booking.cancelling": "Annulation...",
  "booking.cancelBookingBtn": "Annuler la réservation",

  // ── Follow button ───────────────────────────────────────────────────────
  "follow.following": "Abonné",
  "follow.follow": "Suivre",
  "follow.unfollow": "Se désabonner",

  // ── Opening hours ───────────────────────────────────────────────────────
  "hours.closed": "Fermé",
  "hours.closedToday": "Fermé aujourd'hui",
  "hours.openToday": "Ouvert aujourd'hui : {from} - {to}",
  "hours.title": "Horaires d'ouverture",
  "hours.mon": "Lun",
  "hours.tue": "Mar",
  "hours.wed": "Mer",
  "hours.thu": "Jeu",
  "hours.fri": "Ven",
  "hours.sat": "Sam",
  "hours.sun": "Dim",

  // ── Profile cover ───────────────────────────────────────────────────────
  "cover.editCoverPhoto": "Modifier la photo de couverture",
  "cover.updateCoverPhoto": "Mettre à jour la photo de couverture",
  "cover.chooseCover": "Choisir une photo de couverture",
  "cover.updateProfilePhoto": "Mettre à jour la photo de profil",
  "cover.chooseProfile": "Choisir une photo de profil",

  // ── Client profile page ─────────────────────────────────────────────────
  "profile.updateName": "Mettre à jour votre nom",
  "profile.addBio": "Ajouter une bio",
  "profile.less": "moins",
  "profile.more": "plus",
  "profile.noLikedLounges": "Aucun salon aimé",
  "profile.noRatings": "Aucune évaluation",
  "profile.previous": "Précédent",
  "profile.next": "Suivant",
  "profile.tabs.account": "Compte",
  "profile.tabs.posts": "Publications",
  "profile.tabs.reels": "Reels",
  "profile.tabs.likes": "J'aime",
  "profile.tabs.ratings": "Évaluations",
  "profile.tabs.saved": "Enregistrés",
  "profile.tabs.reviews": "Avis",
  "profile.fileSizeLimit": "La taille du fichier doit être inférieure à 5 Mo",
  "profile.failedUpdateImage": "Échec de la mise à jour de l'image de profil",
  "profile.failedUpdateCover":
    "Échec de la mise à jour de l'image de couverture",

  // ── Lounge profile page ─────────────────────────────────────────────────
  "profile.updateTitle": "Mettre à jour votre titre",
  "profile.accessDenied":
    "Accès refusé. Cette page est réservée aux propriétaires de salons.",
  "profile.rating": "évaluation",
  "profile.ratings": "évaluations",

  // ── Agent list ──────────────────────────────────────────────────────────
  "agents.title": "Agents",
  "agents.manageAll": "Gérer tous les agents",
  "agents.manageYour": "Gérer vos agents",
  "agents.addAgent": "Ajouter un agent",
  "agents.searchPlaceholder": "Rechercher des agents...",
  "agents.blockSelected": "Bloquer la sélection",
  "agents.unblockSelected": "Débloquer la sélection",
  "agents.deleteSelected": "Supprimer la sélection",
  "agents.showing": "Affichage de {count} sur {total} agents",
  "agents.page": "Page {page} sur {totalPages}",
  "agents.deleteAgent": "Supprimer l'agent",
  "agents.deleteConfirm":
    "Êtes-vous sûr de vouloir supprimer {name} ? Cette action est irréversible.",
  "agents.blockAgents": "Bloquer les agents",
  "agents.unblockAgents": "Débloquer les agents",
  "agents.deleteAgents": "Supprimer les agents",
  "agents.bulkConfirm":
    "Êtes-vous sûr de vouloir {action} {count} agent sélectionné ?",
  "agents.bulkConfirm_other":
    "Êtes-vous sûr de vouloir {action} {count} agents sélectionnés ?",
  "agents.cannotBeUndone": "Cette action est irréversible.",
  "agents.tryAgain": "Réessayer",

  // ── Agent table ─────────────────────────────────────────────────────────
  "agents.headerAgent": "Agent",
  "agents.headerStatus": "Statut",
  "agents.headerCreated": "Créé",
  "agents.headerLounge": "Salon",
  "agents.noAgents": "Aucun agent trouvé",
  "agents.trySearch": "Essayez de modifier vos termes de recherche",
  "agents.unnamedAgent": "Agent sans nom",
  "agents.blocked": "Bloqué",
  "agents.active": "Actif",
  "agents.unknownLounge": "Salon inconnu",
  "agents.viewDetails": "Voir les détails",

  // ── Agent details ───────────────────────────────────────────────────────
  "agents.details.title": "Détails de l'agent",
  "agents.details.agentName": "Nom de l'agent",
  "agents.details.loungeId": "ID du salon",
  "agents.details.unknown": "Inconnu",
  "agents.details.status": "Statut",
  "agents.details.created": "Créé",
  "agents.details.lastUpdated": "Dernière mise à jour",
  "agents.details.profileImage": "Photo de profil",

  // ── Agent form ──────────────────────────────────────────────────────────
  "agents.form.editAgent": "Modifier l'agent",
  "agents.form.createAgent": "Créer un nouvel agent",
  "agents.form.agentImage": "Image de l'agent",
  "agents.form.selectImage": "Sélectionner une image",
  "agents.form.imageFormats":
    "Formats supportés : JPEG, PNG, GIF, WebP. Taille max : 5 Mo",
  "agents.form.agentName": "Nom de l'agent *",
  "agents.form.enterName": "Entrer le nom de l'agent",
  "agents.form.nameAvailable": "Le nom de l'agent est disponible",
  "agents.form.nameExists":
    "Un agent avec ce nom existe déjà. Veuillez choisir un autre nom.",
  "agents.form.password": "Mot de passe",
  "agents.form.passwordKeep":
    "Mot de passe (laisser vide pour conserver l'actuel)",
  "agents.form.enterPassword": "Entrer le mot de passe",
  "agents.form.enterNewPassword": "Entrer un nouveau mot de passe",
  "agents.form.passwordStrength": "Force du mot de passe : {strength}",
  "agents.form.selectLounge": "Sélectionner un salon *",
  "agents.form.chooseLounge": "Choisir un salon",
  "agents.form.blockedStatus": "Statut de blocage",
  "agents.form.blockDesc": "Bloquer cet agent pour empêcher la connexion",
  "agents.form.updating": "Mise à jour...",
  "agents.form.creating": "Création...",
  "agents.form.updateAgent": "Mettre à jour l'agent",
  "agents.form.createAgentBtn": "Créer l'agent",
  "agents.form.success": "Succès",
  "agents.form.agentUpdated": "Agent mis à jour avec succès",
  "agents.form.agentCreated": "Agent créé avec succès",
  "agents.form.failedSave": "Échec de l'enregistrement de l'agent",

  // ── Account settings ────────────────────────────────────────────────────
  "accountSettings.title": "Paramètres du compte",
  "accountSettings.passwordsNoMatch":
    "Les nouveaux mots de passe ne correspondent pas",
  "accountSettings.passwordTooShort":
    "Le nouveau mot de passe doit comporter au moins 6 caractères",
  "accountSettings.passwordChanged":
    "Mot de passe modifié avec succès. Veuillez vous reconnecter.",
  "accountSettings.failedPassword": "Échec du changement de mot de passe",
  "accountSettings.enterLoungeTitle": "Veuillez entrer un titre de salon",
  "accountSettings.loungeTitleUpdated": "Titre du salon mis à jour avec succès",
  "accountSettings.enterNames": "Veuillez entrer le prénom et le nom",
  "accountSettings.nameUpdated": "Nom mis à jour avec succès",
  "accountSettings.failedUpdateProfile": "Échec de la mise à jour du profil",
  "accountSettings.invalidPhone":
    "Veuillez entrer un numéro de téléphone valide à 8 chiffres",
  "accountSettings.phoneUpdated": "Numéro de téléphone mis à jour avec succès",
  "accountSettings.phoneInUse":
    "Ce numéro de téléphone est déjà utilisé. Veuillez en choisir un autre.",
  "accountSettings.failedPhone": "Échec de la mise à jour du téléphone",
  "accountSettings.enterBio": "Veuillez entrer une bio",
  "accountSettings.bioUpdated": "Bio mise à jour avec succès",
  "accountSettings.failedBio": "Échec de la mise à jour de la bio",
  "accountSettings.loggedOut": "Déconnexion réussie",
  "accountSettings.failedLogout": "Échec de la déconnexion",
  "accountSettings.failedLogoutAll":
    "Échec de la déconnexion de toutes les sessions",

  // ── Account information ─────────────────────────────────────────────────
  "accountInfo.title": "Informations du compte",
  "accountInfo.fullName": "Nom complet",
  "accountInfo.loungeTitle": "Titre",
  "accountInfo.seeInMap": "Voir sur la carte",
  "accountInfo.email": "Email",
  "accountInfo.phone": "Numéro de téléphone",
  "accountInfo.updatePhone": "Mettre à jour le téléphone",
  "accountInfo.memberSince": "Membre depuis",
  "accountInfo.accountStatus": "Statut du compte",
  "accountInfo.active": "Actif",

  // ── User info popover ───────────────────────────────────────────────────
  "userInfo.settings": "Paramètres",
  "userInfo.addAccount": "Ajouter un autre compte",
  "userInfo.logout": "Déconnexion",

  // ── Saved content tab ───────────────────────────────────────────────────
  "savedContent.posts": "Publications",
  "savedContent.reels": "Reels",

  // ── Reviews list ────────────────────────────────────────────────────────
  "reviews.anonymous": "Anonyme",
  "reviews.empty": "Aucun avis. Soyez le premier à évaluer !",
  "reviews.review": "avis",
  "reviews.reviews": "avis",
  "reviews.loadMore": "Charger plus",

  // ── Star rating ─────────────────────────────────────────────────────────
  "rating.ariaLabel": "{value} sur {max} étoiles",
  "rating.count": "évaluation",
  "rating.count_other": "évaluations",
  "rating.none": "Aucune évaluation",

  // ── Follow stats ────────────────────────────────────────────────────────
  "followStats.noFollowers": "Aucun abonné",
  "followStats.noFollowing": "Aucun abonnement",
  "followStats.loadMore": "Charger plus",
  "followStats.follower": "abonné",
  "followStats.followers": "abonnés",
  "followStats.following": "abonnements",

  // ── Common labels ───────────────────────────────────────────────────────
  "common.name": "Nom",
  "common.description": "Description",
  "common.status": "Statut",
  "common.create": "Créer",
  "common.previous": "Précédent",
  "common.active": "Actif",
  "common.inactive": "Inactif",
  "common.unknown": "Inconnu",
  "common.noImage": "Pas d'image",
  "common.reset": "Réinitialiser",
  "common.copy": "Copier",
  "common.call": "Appeler",
  "common.contact": "Contact",
  "common.about": "À propos",
  "common.refresh": "Actualiser",
  "common.apply": "Appliquer",
  "common.lounge": "Salon",
  "common.service": "Service",
  "common.price": "Prix",
  "common.duration": "Durée",
  "common.gender": "Genre",
  "common.total": "Total",
  "common.seeAll": "Voir tout",
  "common.somethingWentWrong": "Une erreur s'est produite.",
  "common.loadingDots": "Chargement...",
  "common.daysConfigured": "{count} jours configurés",
  "common.notConfigured": "Non configuré",

  // ── Auth: Verify ────────────────────────────────────────────────────────
  "auth.verify.invalidLink":
    "Lien de vérification invalide. Aucun jeton fourni.",
  "auth.verify.invalidToken": "Jeton de vérification invalide.",
  "auth.verify.emailVerified":
    "E-mail vérifié — vous pouvez fermer cet onglet.",
  "auth.verify.failed": "Échec de la vérification",
  "auth.verify.title": "Vérification",
  "auth.verify.verifying": "Vérification de votre compte…",
  "auth.verify.verified": "Vérifié. Vous pouvez fermer cet onglet.",
  "auth.verify.failedShort": "Échec de la vérification.",
  "auth.verify.closeTab": "Fermer l'onglet",
  "auth.verify.openApp": "Ouvrir l'application",

  // ── Auth: Google ────────────────────────────────────────────────────────
  "auth.google.accountExists": "Le compte existe déjà",
  "auth.google.accountNotFound": "Compte introuvable",
  "auth.google.accountExistsDesc":
    "Un compte avec cet e-mail existe déjà. Veuillez vous connecter avec votre méthode d'origine.",
  "auth.google.accountNotFoundDesc":
    "Aucun compte n'a été trouvé avec cet e-mail. Veuillez d'abord vous inscrire.",
  "auth.google.signInInstead": "Se connecter",
  "auth.google.signUpInstead": "S'inscrire",
  "auth.google.closeWindow": "Fermer la fenêtre",
  "auth.google.autoClose": "Cette fenêtre se fermera automatiquement...",
  "auth.google.loading": "Chargement...",
  "auth.google.pleaseWait": "Veuillez patienter...",
  "auth.google.authSuccess": "Authentification réussie ! Fermeture...",
  "auth.google.finalizing": "Finalisation de l'authentification...",
  "auth.google.closeAndReturn":
    "Veuillez fermer cette fenêtre et retourner à l'application.",
  "auth.google.authComplete": "Authentification terminée",
  "auth.google.success": "Succès !",
  "auth.google.completingSignIn": "Connexion en cours",
  "auth.google.finishingUp": "Finalisation…",
  "auth.google.canClose": "Vous pouvez fermer cette fenêtre.",

  // ── Admin: Queue (extended) ─────────────────────────────────────────────
  "admin.queue.populateTitle": "Remplir les files quotidiennes",
  "admin.queue.populateDesc":
    "Générer les créneaux horaires du jour pour tous les salons actifs en fonction de leurs heures d'ouverture et durées de service.",
  "admin.queue.populating": "Remplissage...",
  "admin.queue.runNow": "Exécuter maintenant",
  "admin.queue.confirmTitle": "Remplir les files quotidiennes ?",
  "admin.queue.confirmDesc":
    "Cela générera les créneaux de file d'aujourd'hui pour tous les salons actifs. Les créneaux existants ne seront pas dupliqués.",
  "admin.queue.confirmLabel": "Remplir",

  // ── Admin: Suggestions (extended) ───────────────────────────────────────
  "admin.suggestions.total": "Total",
  "admin.suggestions.pending": "En attente",
  "admin.suggestions.underReview": "En examen",
  "admin.suggestions.approved": "Approuvé",
  "admin.suggestions.rejected": "Rejeté",
  "admin.suggestions.implemented": "Implémenté",
  "admin.suggestions.howItWorks": "Comment fonctionnent les suggestions",
  "admin.suggestions.howItWorksDesc":
    "Les salons soumettent des suggestions de services via leur tableau de bord. Utilisez les endpoints de statut et d'approbation pour traiter les suggestions individuelles par ID. Lorsqu'une suggestion est approuvée et implémentée, le système crée automatiquement le service, l'attribue au salon et notifie le propriétaire.",
  "admin.suggestions.flow":
    "Flux : En attente → En examen → Approuvé / Rejeté → Implémenté",

  // ── Admin: Lounge Services (extended) ───────────────────────────────────
  "admin.loungeServices.searchPlaceholder":
    "Rechercher des services de salon...",
  "admin.loungeServices.noServices": "Aucun service de salon",
  "admin.loungeServices.noServicesDesc":
    "Attribuez des services aux salons pour commencer",
  "admin.loungeServices.tableLounge": "Salon",
  "admin.loungeServices.tableService": "Service",
  "admin.loungeServices.tablePrice": "Prix",
  "admin.loungeServices.tableDuration": "Durée",
  "admin.loungeServices.tableGender": "Genre",
  "admin.loungeServices.tableStatus": "Statut",
  "admin.loungeServices.assignTitle": "Attribuer un service à un salon",
  "admin.loungeServices.assignDesc":
    "Sélectionnez un salon et définissez le prix de ce service",
  "admin.loungeServices.selectLounge": "Sélectionner un salon",
  "admin.loungeServices.selectService": "Sélectionner un service",
  "admin.loungeServices.durationMin": "Durée (min)",
  "admin.loungeServices.assigning": "Attribution...",
  "admin.loungeServices.assign": "Attribuer",

  // ── Admin: Common ──────────────────────────────────────────────────────
  "admin.common.edit": "Modifier",
  "admin.common.delete": "Supprimer",
  "admin.common.deleteConfirmDesc": "« {name} » sera définitivement supprimé.",
  "admin.common.deleteUserConfirmDesc":
    "Cela supprimera définitivement {email}. Cette action est irréversible.",

  // ── Gender options ──────────────────────────────────────────────────────
  "gender.men": "Hommes",
  "gender.women": "Femmes",
  "gender.unisex": "Unisexe",
  "gender.kids": "Enfants",

  // ── Booking: Wizard ─────────────────────────────────────────────────────
  "booking.wizard.selectDate": "Sélectionner la date",
  "booking.wizard.pickDate": "Choisir une date",
  "booking.wizard.selectTime": "Sélectionner l'heure",
  "booking.wizard.loadingTimes": "Chargement des créneaux...",
  "booking.wizard.pickDateFirst": "Choisir une date d'abord",
  "booking.wizard.selectTime2": "Sélectionner l'heure",
  "booking.wizard.selectDateFirst": "Veuillez d'abord sélectionner une date",
  "booking.wizard.noTimes": "Aucun créneau disponible pour cette date",
  "booking.wizard.noAgents": "Aucun agent disponible",
  "booking.wizard.proceedWithout":
    "Vous pouvez continuer sans sélectionner d'agent.",
  "booking.wizard.noAgentsForServices":
    "Aucun agent disponible pour les services sélectionnés",
  "booking.wizard.noAgentsForServicesDesc":
    "Les agents disponibles ne peuvent pas effectuer tous les services sélectionnés. Vous pouvez continuer sans agent ou revenir pour modifier votre sélection.",
  "booking.wizard.additionalNotes": "Notes supplémentaires (Facultatif)",
  "booking.wizard.notesPlaceholder": "Demandes spéciales ou notes...",
  "booking.wizard.dateTime": "Date et heure :",
  "booking.wizard.agents": "Agents :",
  "booking.wizard.agent": "Agent :",
  "booking.wizard.anyAgent": "Tout agent disponible",
  "booking.wizard.services": "Services :",
  "booking.wizard.serviceCount": "{count} service",
  "booking.wizard.serviceCount_other": "{count} services",
  "booking.wizard.totalLabel": "Total :",
  "booking.wizard.minutes": "{count} minutes",

  // ── Booking: Navigation ─────────────────────────────────────────────────
  "booking.nav.cancel": "Annuler",
  "booking.nav.back": "Retour",
  "booking.nav.next": "Suivant",
  "booking.nav.creating": "Création...",
  "booking.nav.confirmBooking": "Confirmer la réservation",

  // ── Booking: Toasts ─────────────────────────────────────────────────────
  "booking.toast.statusUpdated": "Statut de réservation mis à jour",
  "booking.toast.statusFailed": "Échec de la mise à jour du statut",
  "booking.toast.cancelled": "Réservation annulée",
  "booking.toast.cancelFailed": "Échec de l'annulation",
  "booking.toast.deleted": "Réservation supprimée avec succès",
  "booking.toast.deleteFailed": "Échec de la suppression",

  // ── Booking: List & History ─────────────────────────────────────────────
  "booking.filter.upcoming": "À venir",
  "booking.filter.pending": "En attente",
  "booking.filter.confirmed": "Confirmé",
  "booking.filter.inQueue": "En file",
  "booking.filter.all": "Toutes les réservations",
  "booking.filter.completed": "Terminé",
  "booking.filter.absent": "Absent",
  "booking.filter.cancelled": "Annulé",

  // ── Booking: History ────────────────────────────────────────────────────
  "booking.history.addressNA": "Adresse non disponible",
  "booking.history.clientNotes": "Notes du client :",
  "booking.history.cancelReason": "Raison d'annulation :",
  "booking.history.deleteTitle": "Supprimer la réservation",
  "booking.history.deleteDesc":
    "Êtes-vous sûr de vouloir supprimer définitivement cette réservation ? Cette action est irréversible.",
  "booking.history.deleteBooking": "Supprimer la réservation",

  // ── Booking: CTA ────────────────────────────────────────────────────────
  "booking.cta.readyToBook": "Prêt à réserver ?",
  "booking.cta.servicesSelected":
    "{count} service sélectionné - Choisissez la date et l'heure",
  "booking.cta.servicesSelected_other":
    "{count} services sélectionnés - Choisissez la date et l'heure",
  "booking.cta.selectToContinue": "Sélectionnez des services pour continuer",
  "booking.cta.bookNow": "Réserver maintenant",
  "booking.cta.selectFirst": "Sélectionnez d'abord les services",

  // ── Opening Hours ───────────────────────────────────────────────────────
  "openingHours.title": "Heures d'ouverture",
  "openingHours.closed": "Fermé",
  "openingHours.open": "Ouvert",
  "openingHours.from": "De",
  "openingHours.to": "À",
  "openingHours.save": "Enregistrer",
  "openingHours.saving": "Enregistrement...",

  // ── Marketplace ────────────────────────────────────────────────────────
  "marketplace.title": "Marché Beauté",
  "marketplace.subtitle": "Découvrez des produits et boutiques beauté",
  "marketplace.searchPlaceholder": "Rechercher produits, boutiques...",
  "marketplace.bestSelling": "Meilleures ventes",
  "marketplace.newArrivals": "Nouveautés",
  "marketplace.featuredStores": "Boutiques en vedette",
  "marketplace.seeAll": "Voir tout",
  "marketplace.startSelling": "Commencez à vendre aujourd'hui",
  "marketplace.startSellingDesc":
    "Rejoignez des centaines de professionnels de la beauté. Ouvrez votre boutique.",
  "marketplace.openMyStore": "Ouvrir ma boutique",
  "marketplace.store.title": "Boutiques",
  "marketplace.store.search": "Rechercher des boutiques...",
  "marketplace.store.noResults": "Aucune boutique trouvée",
  "marketplace.store.pending": "En attente d'approbation",
  "marketplace.store.pendingDesc":
    "Votre boutique est en cours d'examen. Vous serez notifié une fois approuvé.",
  "marketplace.store.createTitle": "Créer votre boutique",
  "marketplace.store.editTitle": "Modifier la boutique",
  "marketplace.store.name": "Nom de la boutique",
  "marketplace.store.category": "Catégorie",
  "marketplace.store.description": "Description",
  "marketplace.store.tags": "Tags",
  "marketplace.store.logo": "Logo",
  "marketplace.store.banner": "Bannière",
  "marketplace.store.contact": "Contact",
  "marketplace.store.website": "Site web",
  "marketplace.store.follow": "Suivre",
  "marketplace.store.unfollow": "Ne plus suivre",
  "marketplace.product.title": "Produits",
  "marketplace.product.search": "Rechercher des produits...",
  "marketplace.product.noResults": "Aucun produit trouvé",
  "marketplace.product.addToCart": "Ajouter au panier",
  "marketplace.product.addedToCart": "Ajouté au panier !",
  "marketplace.product.outOfStock": "Rupture de stock",
  "marketplace.product.inStock": "En stock",
  "marketplace.product.onlyLeft": "Plus que {{count}}",
  "marketplace.product.discount": "{{percent}}% de réduction",
  "marketplace.product.newProduct": "Nouveau produit",
  "marketplace.product.editProduct": "Modifier le produit",
  "marketplace.product.saveChanges": "Enregistrer",
  "marketplace.product.description": "Description",
  "marketplace.product.reviews": "Avis",
  "marketplace.product.variants": "Options",
  "marketplace.product.quantity": "Quantité",
  "marketplace.cart.title": "Votre panier",
  "marketplace.cart.empty": "Votre panier est vide",
  "marketplace.cart.emptyDesc":
    "Découvrez des produits et ajoutez-les à votre panier.",
  "marketplace.cart.browsProducts": "Parcourir les produits",
  "marketplace.cart.total": "Total",
  "marketplace.cart.checkout": "Commander",
  "marketplace.cart.remove": "Supprimer",
  "marketplace.order.title": "Mes commandes",
  "marketplace.order.empty": "Aucune commande",
  "marketplace.order.emptyDesc": "Vos commandes apparaîtront ici.",
  "marketplace.order.detail": "Détail de la commande",
  "marketplace.order.items": "Articles",
  "marketplace.order.shipping": "Adresse de livraison",
  "marketplace.order.payment": "Paiement",
  "marketplace.order.notes": "Notes",
  "marketplace.order.status.pending": "En attente",
  "marketplace.order.status.confirmed": "Confirmée",
  "marketplace.order.status.processing": "En traitement",
  "marketplace.order.status.shipped": "Expédiée",
  "marketplace.order.status.delivered": "Livrée",
  "marketplace.order.status.cancelled": "Annulée",
  "marketplace.order.status.refunded": "Remboursée",
  "marketplace.order.status.disputed": "En litige",
  "marketplace.order.status.returned": "Retournée",
  "marketplace.wishlist.title": "Liste de souhaits",
  "marketplace.wishlist.empty": "Votre liste de souhaits est vide",
  "marketplace.wishlist.emptyDesc": "Sauvegardez les produits que vous aimez.",
  "marketplace.wishlist.add": "Sauvegarder",
  "marketplace.wishlist.remove": "Retirer",
  "marketplace.review.title": "Avis",
  "marketplace.review.write": "Écrire un avis",
  "marketplace.review.helpful": "Utile",
  "marketplace.review.verified": "Achat vérifié",
  "marketplace.review.noReviews": "Aucun avis",
  "marketplace.myStore.title": "Ma boutique",
  "marketplace.myStore.dashboard": "Tableau de bord",
  "marketplace.myStore.products": "Produits",
  "marketplace.myStore.orders": "Commandes",
  "marketplace.myStore.analytics": "Analytiques",
  "marketplace.myStore.totalRevenue": "Revenus totaux",
  "marketplace.myStore.totalOrders": "Commandes totales",
  "marketplace.myStore.pendingOrders": "En attente",
  "marketplace.myStore.noStore": "Vous n'avez pas encore de boutique",
  "marketplace.myStore.noStoreDesc":
    "Créez votre boutique pour commencer à vendre.",
  "marketplace.myStore.createStore": "Créer une boutique",
  "openingHours.userIdNotFound": "ID utilisateur introuvable",
  "openingHours.updated": "Heures d'ouverture mises à jour",
  "openingHours.updateFailed": "Échec de la mise à jour des heures d'ouverture",

  // ── Gender Selector ─────────────────────────────────────────────────────
  "genderSelector.targetAudience": "Quel est votre public cible ?",
  "genderSelector.whatGender": "Quel type de service souhaitez-vous recevoir ?",
  "genderSelector.buttonLounge": "Public cible",
  "genderSelector.buttonClient": "Préférence de genre",
  "genderSelector.updated": "Préférence de genre mise à jour",
  "genderSelector.updateFailed": "Échec de la mise à jour de la préférence",

  // ── Phone & Contact ─────────────────────────────────────────────────────
  "contact.phoneCopied": "Numéro copié avec succès !",
  "contact.copyNotSupported": "Copie non prise en charge. Tél : {phone}",
  "contact.emailCopied": "E-mail copié avec succès !",
  "contact.emailCopyFailed": "Copie non prise en charge. E-mail : {email}",

  // ── Extras / Amenities ──────────────────────────────────────────────────
  "extras.title": "Extras",
  "extras.wifi": "Wi-Fi gratuit",
  "extras.parking": "Parking",
  "extras.creditCard": "Carte bancaire",
  "extras.premium": "Produits premium",
  "extras.airCon": "Climatisation",
  "extras.qualified": "Professionnels qualifiés",

  // ── Content: Swipers ────────────────────────────────────────────────────
  "content.reelsForYou": "Reels pour vous",
  "content.loungesToExplore": "Salons à explorer",

  // ── Content: Comment Replies ────────────────────────────────────────────
  "content.hideReplies": "Masquer les réponses",
  "content.viewReplies": "Voir {count} réponse",
  "content.viewReplies_other": "Voir {count} réponses",
  "content.loadMoreReplies": "Charger plus de réponses",

  // ── Image Crop ──────────────────────────────────────────────────────────
  "imageCrop.zoomOut": "Dézoomer",
  "imageCrop.zoomIn": "Zoomer",
  "imageCrop.rotate": "Pivoter",
  "imageCrop.saving": "Enregistrement...",
  "imageCrop.reCrop": "Recadrer",

  // ── Agent Service List ──────────────────────────────────────────────────
  "agentServices.selectLabel": "Sélectionner les services du salon *",
  "agentServices.loading": "Chargement des services...",
  "agentServices.noServicesAdmin": "Aucun service actif trouvé pour ce salon",
  "agentServices.noServices": "Aucun service actif trouvé pour votre salon",
  "agentServices.unnamed": "Service sans nom",

  // ── Clients / Visitor Profile ───────────────────────────────────────────
  "clients.noBookings": "Aucune réservation",
  "clients.noPosts": "Aucune publication",
  "clients.memberSince": "Membre depuis {date}",
  "clients.back": "Retour",
  "clients.confirmed": "Confirmé",
  "clients.cancelled": "Annulé",
  "clients.absent": "Absent",

  // ── Post Feed ───────────────────────────────────────────────────────────
  "postFeed.whatsOnYourMind": "Quoi de neuf ?",
  "postFeed.post": "Publication",
  "postFeed.reel": "Reel",
  "postFeed.following": "Abonnements",
  "postFeed.explore": "Explorer",

  // ── Queue: Header & Stats ──────────────────────────────────────────────
  "queue.liveQueue": "File en direct",
  "queue.exitFullScreen": "Quitter le plein écran",
  "queue.fullScreen": "Plein écran",
  "queue.avgWait": "Attente moy.",
  "queue.inService": "En service",
  "queue.totalPeople": "Total personnes",
  "queue.completed": "Terminé",
  "queue.waitingCount": "{count} en attente",
  "queue.currentStatus": "Statut actuel",
  "queue.nameQueue": "File de {name}",
  "queue.queueTitle": "File",

  // ── Service Mgmt Toasts ────────────────────────────────────────────────
  "serviceMgmt.invalidImage": "Veuillez sélectionner un fichier image valide",
  "serviceMgmt.fileTooLarge":
    "La taille du fichier doit être inférieure à 5 Mo",
  "serviceMgmt.processFailed": "Échec du traitement de l'image",
  "serviceMgmt.updated": "Service mis à jour avec succès",
  "serviceMgmt.added": "Service de salon ajouté avec succès",
  "serviceMgmt.invalidEditId":
    "Impossible de modifier le service : ID invalide",
  "serviceMgmt.invalidDeleteId":
    "Impossible de supprimer le service : ID invalide",
  "serviceMgmt.deleteSuccess": "Service supprimé avec succès",
  "serviceMgmt.deleteFailed": "Échec de la suppression du service",

  // ── Suggest Service Toasts ─────────────────────────────────────────────
  "services.suggest.submitted":
    "Suggestion de service soumise avec succès ! Elle sera examinée par un administrateur.",
  "services.suggest.loadFailed": "Échec du chargement de vos suggestions",
  "services.suggest.submitFailed": "Échec de la soumission",

  // ── Profile: Rating Pluralization ──────────────────────────────────────
  "profile.ratingCount": "({count} avis)",
  "profile.ratingCount_other": "({count} avis)",

  // ── Follow Stats Dialog ────────────────────────────────────────────────
  "followStats.dialogFollowers": "Abonnés",
  "followStats.dialogFollowing": "Abonnements",

  // ── PWA Install ────────────────────────────────────────────────────────
  "pwa.install.title": "Installer l'app Frame Beauty",
  "pwa.install.description":
    "Installez Frame sur votre appareil pour un accès plus rapide, le mode hors ligne et une expérience plein écran.",
  "pwa.install.iosDescription":
    "Ajoutez Frame à votre écran d'accueil pour une expérience native.",
  "pwa.install.iosStep1": "Appuyez sur le bouton Partager dans Safari",
  "pwa.install.iosStep2": "Appuyez sur \"Sur l'écran d'accueil\"",
  "pwa.install.installButton": "Installer",
  "pwa.install.installing": "Installation…",
  "pwa.install.notNow": "Pas maintenant",
  "pwa.install.gotIt": "Compris",
}

export default fr
