"""
NexusMine Copilot — Chatbot IA spécialisé dans le secteur minier
Endpoint: POST /api/chatbot/
Adapte ses réponses selon le rôle : visiteur, opérateur, admin, etc.
Interroge la base de données pour fournir des réponses concrètes.
"""
import os
import json
import re
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


# ─── System prompts par rôle ───────────────────────────────────────────────────

SYSTEM_PROMPT_BASE = """Tu es NexusMine Copilot, l'assistant IA officiel de la plateforme NexusMine — un système de gestion minière intelligente déployé en République de Guinée.

Tu réponds TOUJOURS en français. Tu es concis, utile et précis.
Tu utilises des emojis pour la clarté visuelle (⚠️ ✅ 📊 🔧 🌿 👥).
Tu proposes des actions concrètes quand possible.
Tu ne divulgues JAMAIS d'informations confidentielles, de données internes, ou de détails d'administration du système à un utilisateur non autorisé.
"""

SYSTEM_PROMPT_VISITOR = SYSTEM_PROMPT_BASE + """
🎯 CONTEXTE: Tu parles à un VISITEUR (non connecté) sur la page d'accueil de NexusMine.

TON RÔLE pour les visiteurs:
- Présenter NexusMine : plateforme de gestion minière intelligente
- Expliquer les fonctionnalités générales (sans détails techniques internes)
- Encourager l'inscription ou la prise de contact
- Répondre aux questions sur le secteur minier en Guinée de manière générale
- Parler des avantages de NexusMine : suivi en temps réel, alertes automatiques, conformité, rapports

CE QUE TU NE DOIS PAS faire pour les visiteurs:
- Ne donne AUCUN détail sur l'architecture interne du système
- Ne mentionne PAS les endpoints API, les rôles utilisateur internes, les permissions
- Ne donne PAS d'instructions pour utiliser les modules internes
- Ne parle PAS des données stockées dans le système
- Si on te demande des infos techniques internes, dis poliment que ces infos sont réservées aux utilisateurs connectés

INFORMATIONS PUBLIQUES que tu peux partager:
- NexusMine est une plateforme de gestion minière intelligente
- Elle permet le suivi des opérations, équipements, incidents, environnement et stocks
- Elle inclut un dashboard avec des KPIs et de l'intelligence artificielle
- Elle est déployée en Guinée pour les sites miniers (bauxite, or, fer, diamant)
- Elle aide à la conformité avec le code minier guinéen
- Contact : via le formulaire sur le site ou par email
"""

SYSTEM_PROMPT_OPERATOR = SYSTEM_PROMPT_BASE + """
🎯 CONTEXTE: Tu parles à un OPÉRATEUR TERRAIN (ingénieur de terrain) de NexusMine.

TON RÔLE pour les opérateurs:
- Aider avec les tâches terrain : signaler des incidents, enregistrer des opérations, relever l'environnement
- Guider sur l'utilisation de l'application mobile NexusMine
- Conseiller sur les procédures HSE (Hygiène, Sécurité, Environnement)
- Aider avec les équipements : signaler des pannes, comprendre la maintenance
- Donner des conseils de sécurité minière

MODULES ACCESSIBLES à l'opérateur: Opérations, Incidents, Équipements, Environnement, Stock, Alertes, Profil
Tu NE parles PAS de : gestion des sites, administration, analytics avancés, gestion du personnel, rapports de direction, configuration système
"""

SYSTEM_PROMPT_MANAGER = SYSTEM_PROMPT_BASE + """
🎯 CONTEXTE: Tu parles à un RESPONSABLE DE SITE ou SUPERVISEUR de NexusMine.

TON RÔLE:
- Aider avec la gestion de site : personnel, équipements, production, incidents
- Conseiller sur l'optimisation des opérations et la planification
- Aider à analyser les KPIs et les tendances
- Guider sur la résolution des alertes et incidents critiques
- Conseiller sur la conformité HSE et environnementale

MODULES ACCESSIBLES: Sites, Personnel, Équipements, Opérations, Incidents, Environnement, Stock, Alertes, Analytics, Rapports
"""

SYSTEM_PROMPT_ADMIN = SYSTEM_PROMPT_BASE + """
🎯 CONTEXTE: Tu parles à un ADMINISTRATEUR de NexusMine.

TON RÔLE:
- Aider avec TOUS les aspects du système
- Conseiller sur la gestion des utilisateurs, des rôles et des permissions
- Aider avec la configuration des sites, alertes et règles
- Fournir des analyses et recommandations stratégiques
- Guider sur l'administration technique de la plateforme

Tu as accès à tous les modules et toutes les informations.
"""

SYSTEM_PROMPT_ANALYST = SYSTEM_PROMPT_BASE + """
🎯 CONTEXTE: Tu parles à un ANALYSTE de NexusMine.

TON RÔLE:
- Aider avec l'analyse de données minières, KPIs, tendances
- Guider sur la création de rapports et l'interprétation des données
- Conseiller sur l'utilisation du dashboard Intelligence IA
- Aider à comprendre les indicateurs d'efficacité opérationnelle

FOCUS: Analytics, rapports, données statistiques, Intelligence IA
"""

SYSTEM_PROMPT_MMG = SYSTEM_PROMPT_BASE + """
🎯 CONTEXTE: Tu parles à un représentant du MINISTÈRE DES MINES ET DE LA GÉOLOGIE (MMG) de Guinée.

TON RÔLE:
- Aider avec la consultation des rapports de conformité
- Guider sur la vérification des données environnementales
- Expliquer les indicateurs réglementaires
- Fournir des informations sur la conformité au code minier guinéen (2011/2013)

FOCUS: Conformité, rapports, données environnementales, réglementation
"""


def _get_system_prompt(role):
    """Retourne le system prompt adapté au rôle"""
    prompts = {
        'ADMIN': SYSTEM_PROMPT_ADMIN,
        'SITE_MANAGER': SYSTEM_PROMPT_MANAGER,
        'SUPERVISOR': SYSTEM_PROMPT_MANAGER,
        'OPERATOR': SYSTEM_PROMPT_OPERATOR,
        'ANALYST': SYSTEM_PROMPT_ANALYST,
        'MMG': SYSTEM_PROMPT_MMG,
    }
    return prompts.get(role, SYSTEM_PROMPT_VISITOR)


def _query_db(user, message):
    """
    Interroge la base de données pour enrichir les réponses du chatbot.
    Retourne un dict avec les données pertinentes selon la question et le rôle.
    """
    try:
        from django.contrib.auth import get_user_model
        from mining_sites.models import MiningSite
        from personnel.models import Personnel
        from equipment.models import Equipment
        from incidents.models import Incident
        from operations.models import Operation
        from alerts.models import Alert
        from environment.models import EnvironmentalData
        from stock.models import StockMovement
        
        User = get_user_model()
        msg = message.lower()
        data = {}
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        
        # Filtrage par sites si l'utilisateur n'est pas ADMIN/ANALYST/MMG
        site_filter = {}
        site_ids = None
        if user and user.is_authenticated:
            site_ids = user.get_site_ids()
            if site_ids is not None:
                site_filter = {'site_id__in': site_ids}
        
        # ── Données demandées: personnel / effectif / combien de personnes ──
        if any(w in msg for w in ['personnel', 'employé', 'effectif', 'combien de personne', 'combien d\'employé', 'combien de gens', 'équipe', 'staff']):
            qs = Personnel.objects.all()
            if site_ids is not None:
                qs = qs.filter(site_id__in=site_ids)
            
            data['personnel_total'] = qs.count()
            data['personnel_active'] = qs.filter(status='ACTIVE').count() if hasattr(Personnel, 'status') else qs.count()
            
            # Par site
            by_site = qs.values('site__name').annotate(count=Count('id')).order_by('-count')[:10]
            data['personnel_par_site'] = list(by_site)
            
            # Par poste/fonction si le champ existe
            if hasattr(Personnel, 'position') or hasattr(Personnel, 'job_title'):
                field = 'position' if hasattr(Personnel, 'position') else 'job_title'
                by_pos = qs.values(field).annotate(count=Count('id')).order_by('-count')[:10]
                data['personnel_par_poste'] = list(by_pos)
        
        # ── Données demandées: sites ──
        if any(w in msg for w in ['site', 'sites', 'combien de site', 'nombre de site', 'localisation']):
            qs = MiningSite.objects.all()
            if site_ids is not None:
                qs = qs.filter(id__in=site_ids)
            
            data['sites_total'] = qs.count()
            data['sites_actifs'] = qs.filter(status='ACTIVE').count() if qs.filter(status='ACTIVE').exists() else 0
            data['sites_liste'] = list(qs.values('name', 'site_type', 'status', 'location')[:15])
        
        # ── Données demandées: incidents ──
        if any(w in msg for w in ['incident', 'accident', 'sécurité', 'hse', 'blessé', 'combien d\'incident']):
            qs = Incident.objects.all()
            if site_ids is not None:
                qs = qs.filter(**site_filter)
            
            data['incidents_total'] = qs.count()
            data['incidents_ouverts'] = qs.filter(status='OPEN').count() + qs.filter(status='IN_PROGRESS').count()
            data['incidents_cette_semaine'] = qs.filter(created_at__gte=week_ago).count()
            
            # Par sévérité
            by_sev = qs.values('severity').annotate(count=Count('id')).order_by('-count')
            data['incidents_par_severite'] = list(by_sev)
            
            # Par site
            by_site = qs.values('site__name').annotate(count=Count('id')).order_by('-count')[:10]
            data['incidents_par_site'] = list(by_site)
        
        # ── Données demandées: équipements ──
        if any(w in msg for w in ['équipement', 'machine', 'panne', 'maintenance', 'camion', 'pelle', 'flotte', 'état']):
            qs = Equipment.objects.all()
            if site_ids is not None:
                qs = qs.filter(**site_filter)
            
            data['equipements_total'] = qs.count()
            data['equipements_operationnels'] = qs.filter(status='OPERATIONAL').count()
            data['equipements_en_panne'] = qs.filter(status='OUT_OF_SERVICE').count()
            data['equipements_en_maintenance'] = qs.filter(status='MAINTENANCE').count()
            
            # Par site
            by_site = qs.values('site__name').annotate(count=Count('id')).order_by('-count')[:10]
            data['equipements_par_site'] = list(by_site)
        
        # ── Données demandées: opérations / production ──
        if any(w in msg for w in ['opération', 'production', 'extraction', 'traitement', 'transport', 'tonne', 'volume']):
            qs = Operation.objects.all()
            if site_ids is not None:
                qs = qs.filter(**site_filter)
            
            data['operations_total'] = qs.count()
            data['operations_cette_semaine'] = qs.filter(created_at__gte=week_ago).count()
            
            # Par type
            by_type = qs.values('operation_type').annotate(count=Count('id')).order_by('-count')
            data['operations_par_type'] = list(by_type)
        
        # ── Données demandées: alertes ──
        if any(w in msg for w in ['alerte', 'notification', 'alarme', 'combien d\'alerte']):
            qs = Alert.objects.all()
            if site_ids is not None:
                qs = qs.filter(**site_filter)
            
            data['alertes_total'] = qs.count()
            data['alertes_non_lues'] = qs.filter(status='NEW').count()
            data['alertes_en_cours'] = qs.filter(status='IN_PROGRESS').count()
            
            # Par sévérité
            by_sev = qs.values('severity').annotate(count=Count('id')).order_by('-count')
            data['alertes_par_severite'] = list(by_sev)
        
        # ── Données demandées: environnement ──
        if any(w in msg for w in ['environnement', 'pollution', 'eau', 'air', 'bruit', 'relevé']):
            qs = EnvironmentalData.objects.all()
            if site_ids is not None:
                qs = qs.filter(**site_filter)
            
            data['releves_total'] = qs.count()
            data['releves_cette_semaine'] = qs.filter(recorded_at__gte=week_ago).count() if hasattr(EnvironmentalData, 'recorded_at') else 0
        
        # ── Données demandées: stock ──
        if any(w in msg for w in ['stock', 'inventaire', 'mouvement', 'minerai']):
            qs = StockMovement.objects.all()
            data['mouvements_total'] = qs.count()
            data['mouvements_cette_semaine'] = qs.filter(created_at__gte=week_ago).count()
        
        # ── Stats globales (pour les managers/admin/mmg) ──
        if any(w in msg for w in ['résumé', 'dashboard', 'bilan', 'statistique', 'stat', 'overview', 'global', 'combien', 'total']):
            sites_qs = MiningSite.objects.all()
            if site_ids is not None:
                sites_qs = sites_qs.filter(id__in=site_ids)
            
            data['sites_total'] = sites_qs.count()
            data['personnel_total'] = Personnel.objects.filter(**site_filter).count() if site_filter else Personnel.objects.count()
            data['equipements_total'] = Equipment.objects.filter(**site_filter).count() if site_filter else Equipment.objects.count()
            data['incidents_ouverts'] = Incident.objects.filter(**site_filter).filter(
                Q(status='OPEN') | Q(status='IN_PROGRESS')
            ).count() if site_filter else Incident.objects.filter(Q(status='OPEN') | Q(status='IN_PROGRESS')).count()
            data['alertes_non_lues'] = Alert.objects.filter(**site_filter).filter(status='NEW').count() if site_filter else Alert.objects.filter(status='NEW').count()
            data['operations_cette_semaine'] = Operation.objects.filter(**site_filter).filter(created_at__gte=week_ago).count() if site_filter else Operation.objects.filter(created_at__gte=week_ago).count()
        
        # ── Utilisateurs (admin seulement) ──
        if user and user.is_authenticated and user.role == 'ADMIN':
            if any(w in msg for w in ['utilisateur', 'compte', 'user', 'combien d\'utilisateur']):
                data['users_total'] = User.objects.count()
                data['users_actifs'] = User.objects.filter(is_active=True).count()
                by_role = User.objects.values('role').annotate(count=Count('id')).order_by('-count')
                data['users_par_role'] = list(by_role)
        
        return data
    except Exception as e:
        return {'_error': str(e)}


@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_message(request):
    """
    Endpoint chatbot NexusMine Copilot
    
    Body: { "message": "...", "history": [...], "context": "visitor"|"OPERATOR"|... }
    Response: { "reply": "...", "role": "assistant" }
    """
    user_message = request.data.get('message', '').strip()
    history = request.data.get('history', [])
    client_context = request.data.get('context', 'visitor')
    
    if not user_message:
        return Response(
            {'error': 'Le message est requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Déterminer le rôle réel
    if request.user.is_authenticated:
        user_role = request.user.role
        user_name = f"{request.user.first_name} {request.user.last_name}".strip()
    else:
        user_role = 'visitor'
        user_name = 'Visiteur'
    
    api_key = os.getenv('OPENAI_API_KEY', '')
    
    # Interroger la base de données pour enrichir la réponse
    db_data = {}
    if request.user.is_authenticated:
        db_data = _query_db(request.user, user_message)
    
    if not api_key or api_key == 'your-openai-api-key-here':
        # Fallback intelligent sans API
        reply = _fallback_response(user_message, user_role, user_name, db_data)
        return Response({
            'reply': reply,
            'role': 'assistant',
            'source': 'local',
        })
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        system_prompt = _get_system_prompt(user_role)
        
        # Ajouter les données DB au contexte si disponibles
        if db_data and '_error' not in db_data:
            db_context = "\n\n[DONNÉES EN TEMPS RÉEL DE LA BASE DE DONNÉES — utilise ces chiffres dans ta réponse]:\n"
            db_context += json.dumps(db_data, ensure_ascii=False, default=str)
            system_prompt += db_context
        
        # Construire l'historique de conversation
        messages = [{'role': 'system', 'content': system_prompt}]
        
        for msg in history[-10:]:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role in ('user', 'assistant') and content:
                messages.append({'role': role, 'content': content})
        
        # Ajouter le message actuel avec contexte utilisateur
        context_suffix = f"\n[Utilisateur: {user_name}, Rôle: {user_role}]"
        messages.append({'role': 'user', 'content': user_message + context_suffix})
        
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        
        reply = response.choices[0].message.content
        
        return Response({
            'reply': reply,
            'role': 'assistant',
            'source': 'openai',
        })
        
    except Exception as e:
        reply = _fallback_response(user_message, user_role, user_name, db_data)
        return Response({
            'reply': reply,
            'role': 'assistant',
            'source': 'fallback',
            'error_detail': str(e) if os.getenv('DEBUG') == 'True' else None,
        })


def _fallback_response(message, role='visitor', user_name='Visiteur', db_data=None):
    """Réponses intelligentes locales, adaptées au rôle utilisateur, enrichies par les données DB"""
    msg = message.lower().strip()
    db = db_data or {}
    is_visitor = (role == 'visitor')
    is_operator = (role == 'OPERATOR')
    is_manager = role in ('SITE_MANAGER', 'SUPERVISOR')
    is_admin = (role == 'ADMIN')
    is_analyst = (role == 'ANALYST')
    is_mmg = (role == 'MMG')
    
    first_name = user_name.split()[0] if user_name and user_name != 'Visiteur' else ''
    
    # ── SALUTATIONS ──
    if any(w in msg for w in ['bonjour', 'salut', 'hello', 'bonsoir', 'hey', 'bsr', 'bjr']):
        if is_visitor:
            return (
                "👋 Bonjour ! Je suis **NexusMine Copilot**, l'assistant intelligent de NexusMine.\n\n"
                "🏗️ **NexusMine** est une plateforme de gestion minière intelligente déployée en Guinée.\n\n"
                "Je peux vous renseigner sur :\n"
                "• 📊 **Notre plateforme** — fonctionnalités, avantages, modules\n"
                "• 🇬🇳 **Le secteur minier guinéen** — bauxite, or, fer, diamant\n"
                "• 🤝 **Comment nous contacter** — démo, partenariat, inscription\n"
                "• 🛡️ **Sécurité & conformité** — normes HSE, code minier\n\n"
                "Que souhaitez-vous savoir ?"
            )
        elif is_operator:
            return (
                f"👋 Bonjour{f' {first_name}' if first_name else ''} ! Je suis **NexusMine Copilot**, votre assistant terrain.\n\n"
                "Je peux vous aider avec vos tâches quotidiennes :\n"
                "• ⚠️ **Incidents** — signaler, consulter les procédures HSE\n"
                "• 🔧 **Équipements** — signaler une panne, maintenance\n"
                "• 📊 **Opérations** — enregistrer extraction, traitement, transport\n"
                "• 🌿 **Environnement** — faire un relevé terrain\n"
                "• 📦 **Stock** — mouvements de minerai\n"
                "• 🔔 **Alertes** — consulter les alertes actives\n\n"
                "Comment puis-je vous aider aujourd'hui ?"
            )
        elif is_manager:
            return (
                f"👋 Bonjour{f' {first_name}' if first_name else ''} ! Je suis **NexusMine Copilot**.\n\n"
                "En tant que responsable, je peux vous accompagner sur :\n"
                "• 📊 **Dashboard & KPIs** — performance du site, tendances\n"
                "• 👥 **Personnel** — gestion d'équipes, affectations\n"
                "• ⚠️ **Incidents** — suivi, résolution, statistiques\n"
                "• 🔧 **Équipements** — état de la flotte, planification maintenance\n"
                "• 📈 **Analytics** — analyse des données, Intelligence IA\n"
                "• 📄 **Rapports** — génération et export\n\n"
                "Sur quoi souhaitez-vous travailler ?"
            )
        elif is_admin:
            return (
                f"👋 Bonjour{f' {first_name}' if first_name else ''} ! Je suis **NexusMine Copilot**.\n\n"
                "En tant qu'administrateur, j'ai accès à tous les domaines :\n"
                "• ⚙️ **Administration** — utilisateurs, rôles, sites\n"
                "• 📊 **Tous les modules** — opérations, incidents, équipements...\n"
                "• 📈 **Analytics & Intelligence IA** — analyses complètes\n"
                "• 🔔 **Alertes & règles** — configuration des seuils\n"
                "• 📄 **Rapports** — tous types, export PDF\n\n"
                "Que souhaitez-vous faire ?"
            )
        else:
            return (
                f"👋 Bonjour{f' {first_name}' if first_name else ''} ! Je suis **NexusMine Copilot**.\n\n"
                "Comment puis-je vous aider aujourd'hui ?"
            )
    
    # ── VISITEUR : Questions sur la plateforme ──
    if is_visitor:
        if any(w in msg for w in ['nexusmine', 'plateforme', 'application', 'app', 'système', 'logiciel', 'c\'est quoi', 'présent']):
            return (
                "🏗️ **NexusMine — Plateforme de Gestion Minière Intelligente**\n\n"
                "NexusMine est une solution tout-en-un pour la gestion des sites miniers en Guinée :\n\n"
                "📍 **Suivi des sites** — Visualisation en temps réel de tous les sites\n"
                "⚠️ **Sécurité HSE** — Déclaration et suivi des incidents\n"
                "🔧 **Gestion des équipements** — Maintenance préventive et suivi de flotte\n"
                "📊 **Analytics & IA** — Tableaux de bord intelligents, prédictions\n"
                "🌿 **Conformité environnementale** — Suivi automatisé des normes\n"
                "📱 **Application mobile** — Pour les opérateurs terrain\n"
                "🔔 **Alertes automatiques** — Notification en temps réel\n\n"
                "Voulez-vous en savoir plus sur un aspect en particulier ?"
            )
        
        if any(w in msg for w in ['prix', 'coût', 'tarif', 'combien', 'gratuit', 'abonnement']):
            return (
                "💰 **Tarification NexusMine**\n\n"
                "Pour obtenir un devis personnalisé adapté à la taille de votre exploitation :\n"
                "• 📧 Contactez-nous via le formulaire sur notre site\n"
                "• 📞 Demandez une démonstration gratuite\n\n"
                "Chaque déploiement est adapté aux besoins spécifiques de votre site minier."
            )
        
        if any(w in msg for w in ['contact', 'joindre', 'email', 'téléphone', 'démo', 'démonstration', 'essayer']):
            return (
                "📞 **Nous Contacter**\n\n"
                "• 📧 Utilisez le formulaire de contact sur notre page d'accueil\n"
                "• 🎯 Demandez une **démonstration gratuite** personnalisée\n"
                "• 🤝 Nous proposons un accompagnement pour le déploiement\n\n"
                "Notre équipe vous répondra dans les 24h ouvrées !"
            )
        
        if any(w in msg for w in ['inscription', 'inscrire', 'compte', 'créer', 'connexion', 'connecter']):
            return (
                "🔐 **Accès à NexusMine**\n\n"
                "L'accès à NexusMine est réservé aux entreprises minières et organismes partenaires.\n\n"
                "Pour obtenir un compte :\n"
                "1. Contactez-nous pour une démonstration\n"
                "2. Nous configurons votre environnement\n"
                "3. Vos équipes reçoivent leurs identifiants\n\n"
                "Si vous avez déjà un compte, cliquez sur **Se connecter** en haut de la page."
            )
        
        if any(w in msg for w in ['guinée', 'minier', 'mine', 'bauxite', 'or', 'fer', 'diamant', 'simandou', 'boké']):
            return (
                "🇬🇳 **Le Secteur Minier en Guinée**\n\n"
                "La Guinée possède des ressources minières exceptionnelles :\n\n"
                "• 🟤 **Bauxite** — 1er réservoir mondial (~40 milliards de tonnes). Zones : Boké, Kindia\n"
                "• 🟡 **Or** — Production majeure. Zone : Siguiri, Kouroussa\n"
                "• ⬛ **Fer** — Gisement de Simandou (plus grand au monde non exploité)\n"
                "• 💎 **Diamant** — Régions de Kérouané, Macenta\n\n"
                "📋 **Code minier** : Loi L/2011/006 révisée en 2013\n"
                "🏛️ **Régulateur** : Ministère des Mines et de la Géologie (MMG)\n\n"
                "NexusMine aide les exploitants à respecter ces réglementations tout en optimisant leurs opérations."
            )
        
        if any(w in msg for w in ['sécurité', 'hse', 'sûr', 'confiance', 'données', 'confidential']):
            return (
                "🛡️ **Sécurité & Conformité**\n\n"
                "NexusMine respecte les plus hauts standards :\n"
                "• 🔒 **Données sécurisées** — Chiffrement, accès par rôle\n"
                "• 📋 **Conformité HSE** — Normes internationales (IFC, ISO 14001, OHSAS 18001)\n"
                "• 🇬🇳 **Code minier guinéen** — Conformité réglementaire intégrée\n"
                "• 📊 **Traçabilité** — Audit complet de toutes les actions\n\n"
                "Souhaitez-vous en savoir plus ?"
            )
        
        if any(w in msg for w in ['fonctionnalité', 'module', 'feature', 'quoi faire', 'capable', 'peut faire']):
            return (
                "✨ **Fonctionnalités NexusMine**\n\n"
                "📍 **Sites Miniers** — Carte interactive, suivi multi-sites\n"
                "👥 **Personnel** — Gestion des équipes et certifications\n"
                "🔧 **Équipements** — Maintenance préventive, suivi de flotte\n"
                "📊 **Opérations** — Extraction, traitement, transport\n"
                "⚠️ **Incidents HSE** — Signalement avec photos et GPS\n"
                "🌿 **Environnement** — Mesures qualité air, eau, sol, bruit\n"
                "📦 **Stock** — Gestion des minerais et pièces de rechange\n"
                "🔔 **Alertes** — Notifications automatiques intelligentes\n"
                "📈 **Intelligence IA** — Analyses prédictives et recommandations\n"
                "📄 **Rapports** — Génération automatique, export PDF\n\n"
                "Quel module vous intéresse le plus ?"
            )
        
        # Visiteur — réponse par défaut
        return (
            "🤖 Je suis **NexusMine Copilot**, l'assistant de la plateforme NexusMine.\n\n"
            "Je peux vous renseigner sur :\n"
            "• 🏗️ **Notre plateforme** — qu'est-ce que NexusMine ?\n"
            "• ✨ **Les fonctionnalités** — modules disponibles\n"
            "• 🇬🇳 **Le secteur minier guinéen**\n"
            "• 🛡️ **Sécurité et conformité**\n"
            "• 📞 **Comment nous contacter**\n\n"
            "Posez-moi votre question ! 😊"
        )
    
    # ── UTILISATEURS AUTHENTIFIÉS ──
    
    # Incidents
    if any(w in msg for w in ['incident', 'accident', 'blessé', 'urgence', 'danger', 'signaler']):
        base = "⚠️ **Gestion des Incidents HSE**\n\n"
        
        # Données réelles
        if db.get('incidents_total') is not None:
            base += f"📊 **Données actuelles :**\n"
            base += f"• Total incidents : **{db['incidents_total']}**\n"
            if db.get('incidents_ouverts'):
                base += f"• Incidents ouverts : **{db['incidents_ouverts']}**\n"
            if db.get('incidents_cette_semaine'):
                base += f"• Cette semaine : **{db['incidents_cette_semaine']}**\n"
            if db.get('incidents_par_severite'):
                for s in db['incidents_par_severite']:
                    sev = s.get('severity', '?')
                    base += f"  - {sev} : {s['count']}\n"
            if db.get('incidents_par_site'):
                base += "\n📍 **Par site :**\n"
                for s in db['incidents_par_site'][:5]:
                    base += f"  - {s.get('site__name', '?')} : {s['count']} incidents\n"
            base += "\n"
        
        base += (
            "📝 **Signaler un incident :**\n"
            "1. Allez dans **Incidents → Nouveau**\n"
            "2. Choisissez le type : accident, presqu'accident, environnemental, panne\n"
            "3. Décrivez l'incident avec précision\n"
            "4. Ajoutez des **photos** (bouton caméra 📷)\n"
            "5. Le **GPS** se capture automatiquement\n\n"
            "🚨 **Urgence vitale ?** Contactez d'abord les secours !\n"
        )
        return base + "\nBesoin d'aide supplémentaire ?"
    
    # Équipements
    if any(w in msg for w in ['équipement', 'panne', 'maintenance', 'machine', 'camion', 'pelle', 'foreuse', 'réparer']):
        base = "🔧 **Gestion des Équipements**\n\n"
        
        if db.get('equipements_total') is not None:
            base += f"📊 **État de la flotte :**\n"
            base += f"• Total : **{db['equipements_total']}** équipements\n"
            if db.get('equipements_operationnels') is not None:
                base += f"• ✅ Opérationnels : **{db['equipements_operationnels']}**\n"
            if db.get('equipements_en_panne'):
                base += f"• 🔴 En panne : **{db['equipements_en_panne']}**\n"
            if db.get('equipements_en_maintenance'):
                base += f"• 🟡 En maintenance : **{db['equipements_en_maintenance']}**\n"
            if db.get('equipements_par_site'):
                base += "\n📍 **Par site :**\n"
                for s in db['equipements_par_site'][:5]:
                    base += f"  - {s.get('site__name', '?')} : {s['count']} équipements\n"
            base += "\n"
        
        base += "• **Voir l'état** : Équipements → liste avec statut\n"
        base += "• **Signaler une panne** : Cliquez sur l'équipement → Changer le statut\n"
        if is_operator:
            base += (
                "\n💡 **Conseil terrain :**\n"
                "• Vérifiez l'équipement visuellement avant chaque utilisation\n"
                "• Signalez immédiatement tout bruit anormal ou fuite\n"
            )
        return base + "\nQuel équipement vous concerne ?"
    
    # Opérations
    if any(w in msg for w in ['opération', 'production', 'extraction', 'traitement', 'transport', 'minerai', 'tonne']):
        base = "📊 **Suivi des Opérations**\n\n"
        
        if db.get('operations_total') is not None:
            base += f"📊 **Données actuelles :**\n"
            base += f"• Total opérations : **{db['operations_total']}**\n"
            if db.get('operations_cette_semaine'):
                base += f"• Cette semaine : **{db['operations_cette_semaine']}**\n"
            if db.get('operations_par_type'):
                base += "\n📋 **Par type :**\n"
                for t in db['operations_par_type']:
                    base += f"  - {t.get('operation_type', '?')} : {t['count']}\n"
            base += "\n"
        
        base += (
            "📝 **Enregistrer une opération :**\n"
            "1. Opérations → Nouvelle opération\n"
            "2. Type : Extraction, Traitement, Transport ou Exploration\n"
            "3. Renseignez volume, zone de travail et détails\n"
        )
        return base + "\nQuelle information cherchez-vous ?"
    
    # Environnement
    if any(w in msg for w in ['environnement', 'pollution', 'rejet', 'eau', 'air', 'poussière', 'bruit', 'sol', 'relevé']):
        base = (
            "🌿 **Suivi Environnemental**\n\n"
            "📝 **Faire un relevé :**\n"
            "1. Environnement → Nouveau relevé\n"
            "2. Type : qualité de l'air, eau, sol ou bruit\n"
            "3. Renseignez les mesures avec unités\n\n"
            "⚡ **Seuils** : Des alertes automatiques se déclenchent en cas de dépassement\n"
        )
        if is_operator:
            base += "\n📋 **Rappel** : Les relevés doivent être faits quotidiennement sur chaque site actif.\n"
        if is_manager or is_admin or is_mmg:
            base += (
                "\n📊 **Conformité :**\n"
                "• Vérifiez les seuils dans les paramètres environnementaux\n"
                "• Les rapports environnementaux sont exportables en PDF\n"
                "• Conformité : Code minier guinéen + normes IFC/ISO 14001\n"
            )
        return base + "\nQuel aspect environnemental vous intéresse ?"
    
    # Alertes
    if any(w in msg for w in ['alerte', 'notification', 'alarme', 'cloche', 'bell']):
        base = "🔔 **Système d'Alertes**\n\n"
        
        if db.get('alertes_total') is not None:
            base += f"📊 **État actuel :**\n"
            base += f"• Total alertes : **{db['alertes_total']}**\n"
            if db.get('alertes_non_lues'):
                base += f"• 🔴 Non lues : **{db['alertes_non_lues']}**\n"
            if db.get('alertes_en_cours'):
                base += f"• 🟡 En cours : **{db['alertes_en_cours']}**\n"
            base += "\n"
        
        base += (
            "Les alertes se déclenchent automatiquement :\n"
            "• 🚨 Incidents critiques\n"
            "• 📊 Dépassement de seuils environnementaux\n"
            "• 🔧 Pannes d'équipements\n"
            "• 📦 Stock bas\n\n"
            "**Actions :**\n"
            "• 🔔 La cloche en haut affiche les alertes non lues\n"
            "• Cliquez dessus pour voir la liste complète\n"
            "• Acquittez les alertes une fois traitées\n"
        )
        return base + "\nVous avez une alerte spécifique à traiter ?"
    
    # Stock
    if any(w in msg for w in ['stock', 'inventaire', 'pièce', 'approvisionnement', 'mouvement']):
        return (
            "📦 **Gestion des Stocks**\n\n"
            "• **Mouvement** : Stock → Enregistrer (entrée/sortie)\n"
            "• **Résumé** : Vue d'ensemble par localisation\n"
            "• **Alertes** : Notification si stock passe sous le seuil minimum\n\n"
            "Quel type de stock vous intéresse ?"
        )
    
    # Personnel (pas pour opérateur)
    if any(w in msg for w in ['personnel', 'employé', 'équipe', 'formation', 'effectif']):
        if is_operator:
            return (
                "👥 **Personnel**\n\n"
                "Pour les questions concernant le personnel (affectations, formations, etc.), "
                "veuillez contacter votre responsable de site.\n\n"
                "Puis-je vous aider avec autre chose ?"
            )
        base = "👥 **Gestion du Personnel**\n\n"
        
        if db.get('personnel_total') is not None:
            base += f"📊 **Effectifs actuels :**\n"
            base += f"• Total : **{db['personnel_total']}** personnes\n"
            if db.get('personnel_active'):
                base += f"• Actifs : **{db['personnel_active']}**\n"
            if db.get('personnel_par_site'):
                base += "\n📍 **Par site :**\n"
                for s in db['personnel_par_site'][:5]:
                    base += f"  - {s.get('site__name', '?')} : {s['count']} personnes\n"
            if db.get('personnel_par_poste'):
                base += "\n💼 **Par fonction :**\n"
                for p in db['personnel_par_poste'][:5]:
                    key = list(p.keys())[0] if list(p.keys())[0] != 'count' else list(p.keys())[1] if len(p.keys()) > 1 else '?'
                    base += f"  - {p.get(key, '?')} : {p['count']}\n"
            base += "\n"
        
        base += (
            "• **Liste** : Personnel → tous les employés par site\n"
            "• **Formations** : Suivi des certifications HSE obligatoires\n"
            "• **Affectation** : Gestion par site et par équipe\n\n"
            "📋 Chaque employé doit avoir ses certifications à jour.\n"
        )
        return base + "\nQuelle action souhaitez-vous effectuer ?"
    
    # Rapports (pas pour opérateur)
    if any(w in msg for w in ['rapport', 'export', 'pdf', 'statistique', 'bilan']):
        if is_operator:
            return (
                "📄 **Rapports**\n\n"
                "La génération de rapports est gérée par les responsables de site.\n"
                "Vos données terrain (opérations, incidents, relevés) y sont automatiquement intégrées.\n\n"
                "Puis-je vous aider avec autre chose ?"
            )
        return (
            "📄 **Rapports**\n\n"
            "• **Créer** : Rapports → Nouveau rapport\n"
            "• **Types** : Production, HSE, Environnement, Équipements\n"
            "• **Export** : PDF automatique\n"
            "• **Intelligence IA** : Analyses avec recommandations automatiques\n\n"
            "Quel type de rapport souhaitez-vous ?"
        )
    
    # Analytics (pas pour opérateur)
    if any(w in msg for w in ['analytics', 'analyse', 'kpi', 'performance', 'tendance', 'intelligence']):
        if is_operator:
            return (
                "📊 **Analytics**\n\n"
                "Les analyses détaillées sont disponibles pour les responsables et analystes.\n"
                "Vous pouvez consulter vos statistiques personnelles dans votre profil.\n\n"
                "Puis-je vous aider avec autre chose ?"
            )
        return (
            "📊 **Analytics & Intelligence IA**\n\n"
            "• **Dashboard** : Vue d'ensemble des KPIs par site\n"
            "• **Intelligence IA** : Analyses prédictives, recommandations\n"
            "• **Tendances** : Évolution production, incidents, environnement\n"
            "• **Comparaison** : Benchmark entre sites et périodes\n\n"
            "Quel indicateur vous intéresse ?"
        )
    
    # Sites (pas pour opérateur)
    if any(w in msg for w in ['site', 'sites', 'localisation', 'carte', 'map']):
        if is_operator:
            return (
                "📍 **Sites**\n\n"
                "Vous êtes affecté à votre site de rattachement.\n"
                "Pour des questions sur les sites, contactez votre responsable.\n\n"
                "Puis-je vous aider avec vos tâches terrain ?"
            )
        base = "📍 **Sites Miniers**\n\n"
        
        if db.get('sites_total') is not None:
            base += f"📊 **Données actuelles :**\n"
            base += f"• Total sites : **{db['sites_total']}**\n"
            if db.get('sites_actifs') is not None:
                base += f"• Sites actifs : **{db['sites_actifs']}**\n"
            if db.get('sites_liste'):
                base += "\n📋 **Liste des sites :**\n"
                for s in db['sites_liste'][:10]:
                    st = s.get('status', '?')
                    icon = '✅' if st == 'ACTIVE' else '🟡' if st == 'MAINTENANCE' else '🔴'
                    base += f"  - {icon} **{s.get('name', '?')}** — {s.get('site_type', '')} ({s.get('location', '')})\n"
            base += "\n"
        
        base += (
            "• **Liste** : Sites → vue d'ensemble\n"
            "• **Carte** : Visualisation géographique interactive\n"
            "• **Détail** : Cliquez sur un site pour voir personnel, équipements, production\n"
        )
        return base + "\nQuel site vous intéresse ?"
    
    # Questions admin (seulement admin)
    if any(w in msg for w in ['admin', 'utilisateur', 'rôle', 'permission', 'configur', 'paramètre']):
        if is_admin:
            base = "⚙️ **Administration**\n\n"
            
            if db.get('users_total') is not None:
                base += f"📊 **Utilisateurs :**\n"
                base += f"• Total : **{db['users_total']}** comptes\n"
                base += f"• Actifs : **{db['users_actifs']}**\n"
                if db.get('users_par_role'):
                    base += "\n👥 **Par rôle :**\n"
                    role_labels = {'ADMIN': 'Administrateurs', 'SITE_MANAGER': 'Responsables de site', 'SUPERVISOR': 'Superviseurs', 'OPERATOR': 'Opérateurs', 'ANALYST': 'Analystes', 'MMG': 'MMG'}
                    for r in db['users_par_role']:
                        label = role_labels.get(r.get('role', ''), r.get('role', '?'))
                        base += f"  - {label} : {r['count']}\n"
                base += "\n"
            
            base += (
                "• **Utilisateurs** : Gestion des comptes, rôles, permissions\n"
                "• **Sites** : Création et configuration des sites\n"
                "• **Règles d'alertes** : Configuration des seuils automatiques\n"
                "• **Paramètres** : Configuration générale du système\n"
            )
            return base + "\nQuelle action souhaitez-vous effectuer ?"
        return (
            "🔒 **Accès restreint**\n\n"
            "Les fonctions d'administration sont réservées aux administrateurs.\n"
            "Contactez votre administrateur pour toute demande de ce type.\n\n"
            "Puis-je vous aider avec autre chose ?"
        )
    
    # Résumé / Dashboard / Bilan global
    if any(w in msg for w in ['résumé', 'dashboard', 'bilan', 'statistique', 'stat', 'overview', 'global', 'combien', 'total']):
        if not is_visitor:
            base = "📊 **Résumé Global NexusMine**\n\n"
            
            if db.get('sites_total') is not None:
                base += f"📍 Sites : **{db['sites_total']}**\n"
            if db.get('personnel_total') is not None:
                base += f"👥 Personnel : **{db['personnel_total']}** personnes\n"
            if db.get('equipements_total') is not None:
                base += f"🔧 Équipements : **{db['equipements_total']}**\n"
            if db.get('incidents_ouverts') is not None:
                base += f"⚠️ Incidents ouverts : **{db['incidents_ouverts']}**\n"
            if db.get('alertes_non_lues') is not None:
                base += f"🔔 Alertes non lues : **{db['alertes_non_lues']}**\n"
            if db.get('operations_cette_semaine') is not None:
                base += f"📊 Opérations cette semaine : **{db['operations_cette_semaine']}**\n"
            
            if len(db) <= 1:
                base += "Précisez votre question pour obtenir des données détaillées.\n"
                base += "Ex: « combien de personnel ? », « état des équipements », « incidents ouverts »\n"
            
            return base + "\nQue souhaitez-vous approfondir ?"
    
    # Aide générale
    if any(w in msg for w in ['aide', 'help', 'comment', 'utiliser', 'tutoriel', 'guide']):
        if is_operator:
            return (
                "📚 **Guide Opérateur Terrain**\n\n"
                "🎯 **Vos tâches principales :**\n"
                "1. **Opérations** — Enregistrer vos activités d'extraction/traitement\n"
                "2. **Incidents** — Signaler immédiatement tout problème de sécurité\n"
                "3. **Équipements** — Vérifier et signaler l'état des machines\n"
                "4. **Environnement** — Faire les relevés quotidiens\n"
                "5. **Stock** — Enregistrer les mouvements de minerai\n\n"
                "💡 **Astuce** : Le bouton rouge « Signaler un incident » est accessible depuis l'accueil.\n\n"
                "Sur quelle tâche avez-vous besoin d'aide ?"
            )
        return (
            "📚 **Guide d'utilisation NexusMine**\n\n"
            "**Navigation :**\n"
            "• Menu principal dans la barre latérale\n"
            "• Dashboard pour la vue d'ensemble\n"
            "• 🔔 Cloche pour les alertes\n\n"
            "**Actions rapides :**\n"
            "• Boutons « Nouveau » dans chaque module\n"
            "• Filtres et recherche dans chaque liste\n"
            "• Export PDF dans les rapports\n\n"
            "Sur quoi avez-vous besoin d'aide ?"
        )
    
    # Merci / fin
    if any(w in msg for w in ['merci', 'thanks', 'parfait', 'super', 'ok', 'compris', 'bien']):
        return (
            f"✅ Avec plaisir{f' {first_name}' if first_name else ''} ! "
            "N'hésitez pas si vous avez d'autres questions. "
            "Je suis toujours là pour vous aider 😊"
        )
    
    # ── RÉPONSE PAR DÉFAUT selon le rôle ──
    if is_operator:
        return (
            f"🤖 {f'{first_name}, j' if first_name else 'J'}'e suis là pour vous aider sur le terrain !\n\n"
            "Voici ce que je peux faire pour vous :\n"
            "• ⚠️ **Incidents** — « comment signaler un incident ? »\n"
            "• 🔧 **Équipements** — « comment signaler une panne ? »\n"
            "• 📊 **Opérations** — « comment enregistrer une opération ? »\n"
            "• 🌿 **Environnement** — « comment faire un relevé ? »\n"
            "• 📦 **Stock** — « comment enregistrer un mouvement ? »\n"
            "• 🔔 **Alertes** — « voir mes alertes »\n\n"
            "Essayez l'une de ces questions !"
        )
    elif is_manager or is_admin or is_analyst:
        return (
            f"🤖 {f'{first_name}, j' if first_name else 'J'}'e suis **NexusMine Copilot**.\n\n"
            "Je peux vous aider avec :\n"
            "• 📊 **Analytics** — « quels sont les KPIs ? »\n"
            "• ⚠️ **Incidents** — « statistiques des incidents »\n"
            "• 🔧 **Équipements** — « état de la flotte »\n"
            "• 👥 **Personnel** — « gestion des équipes »\n"
            "• 📄 **Rapports** — « créer un rapport »\n"
            "• 🔔 **Alertes** — « alertes actives »\n\n"
            "Posez-moi votre question !"
        )
    else:
        return (
            "🤖 Je suis **NexusMine Copilot**.\n\n"
            "Posez-moi une question sur :\n"
            "• 🏗️ La plateforme NexusMine\n"
            "• 🇬🇳 Le secteur minier guinéen\n"
            "• ✨ Nos fonctionnalités\n"
            "• 📞 Comment nous contacter\n\n"
            "Je suis là pour vous aider !"
        )
