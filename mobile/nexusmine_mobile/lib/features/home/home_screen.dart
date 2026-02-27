import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../auth/auth_provider.dart';
import '../alerts/alerts_provider.dart';
import '../alerts/alerts_websocket_provider.dart';
import 'home_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.user;
    final homeStats = ref.watch(homeStatsProvider);

    // Auto-load stats on first build
    if (!homeStats.isLoading && homeStats.openIncidents == 0 && homeStats.error == null) {
      Future.microtask(() => ref.read(homeStatsProvider.notifier).loadStats());
    }

    // Auto-load alerts for badge
    final alertsState = ref.watch(alertsProvider);
    if (!alertsState.isLoading && alertsState.alerts.isEmpty && alertsState.error == null) {
      Future.microtask(() => ref.read(alertsProvider.notifier).loadAlerts());
    }
    final unreadAlerts = alertsState.unreadCount;
    
    // Initialize WebSocket listener
    ref.read(alertsWebSocketProvider).connect();
    
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipOval(
              child: Image.asset(
                'assets/images/logo.png',
                width: 32,
                height: 32,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 10),
            const Text('NexusMine'),
          ],
        ),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: unreadAlerts > 0,
              label: Text(
                unreadAlerts > 99 ? '99+' : '$unreadAlerts',
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
              ),
              backgroundColor: AppColors.error,
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: () => context.push('/alerts'),
          ),
          PopupMenuButton<String>(
            icon: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                user?.initials ?? 'U',
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            onSelected: (value) async {
              if (value == 'profile') {
                context.push('/profile');
              } else if (value == 'logout') {
                await ref.read(authStateProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user?.fullName ?? 'Utilisateur',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      user?.email ?? '',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person, color: AppColors.primary),
                    SizedBox(width: 12),
                    Text('Mon profil'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, color: AppColors.error),
                    SizedBox(width: 12),
                    Text('Déconnexion'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(homeStatsProvider.notifier).loadStats();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Premium Header Profile
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.premiumIndigo, AppColors.premiumBlue],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.premiumIndigo.withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          child: Text(
                            user?.initials ?? 'U',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bonjour, ${user?.firstName ?? 'Utilisateur'} 👋',
                              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              user?.primarySiteName ?? 'Opérateur NexusMine',
                              style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),
              
              // Actions terrain
              Text(
                'Actions terrain',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              const SizedBox(height: 12),
              
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.3,
                children: [
                  _QuickActionCard(
                    title: 'Intelligence',
                    subtitle: 'IA & Prédictions',
                    icon: Icons.psychology,
                    color: AppColors.premiumIndigo,
                    onTap: () => context.push('/intelligence'),
                  ),
                  _QuickActionCard(
                    title: 'Opérations',
                    subtitle: 'Extraction & suivi',
                    icon: Icons.engineering,
                    color: AppColors.cardOperations,
                    onTap: () => context.push('/operations'),
                  ),
                  _QuickActionCard(
                    title: 'Incidents',
                    subtitle: 'Signaler / Consulter',
                    icon: Icons.warning_amber_rounded,
                    color: AppColors.cardIncidents,
                    onTap: () => context.push('/incidents'),
                  ),
                  _QuickActionCard(
                    title: 'Équipements',
                    subtitle: 'État & Maintenance',
                    icon: Icons.precision_manufacturing,
                    color: AppColors.cardEquipment,
                    onTap: () => context.push('/equipment'),
                  ),
                  _QuickActionCard(
                    title: 'Environnement',
                    subtitle: 'Relevés terrain',
                    icon: Icons.eco,
                    color: AppColors.cardEnvironment,
                    onTap: () => context.push('/environment'),
                  ),
                  _QuickActionCard(
                    title: 'Stock',
                    subtitle: 'Minerai & Flux',
                    icon: Icons.inventory_2,
                    color: AppColors.cardStock,
                    onTap: () => context.push('/stock'),
                  ),
                  _QuickActionCard(
                    title: 'Alertes',
                    subtitle: 'Notifications',
                    icon: Icons.notifications_active,
                    color: AppColors.cardAlerts,
                    onTap: () => context.push('/alerts'),
                  ),
                   _QuickActionCard(
                    title: 'Rapports',
                    subtitle: 'HSE & Production',
                    icon: Icons.description,
                    color: AppColors.cardReports,
                    onTap: () => context.push('/reports'),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Section statistiques rapides
              Text(
                'Résumé du jour',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      title: 'Incidents ouverts',
                      value: homeStats.isLoading ? '...' : '${homeStats.openIncidents}',
                      icon: Icons.warning,
                      color: AppColors.warning,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      title: 'Équip. en panne',
                      value: homeStats.isLoading ? '...' : '${homeStats.brokenEquipment}',
                      icon: Icons.build,
                      color: AppColors.error,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      title: 'Alertes actives',
                      value: homeStats.isLoading ? '...' : '${homeStats.activeAlerts}',
                      icon: Icons.notifications,
                      color: AppColors.info,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      title: 'Opérations récentes',
                      value: homeStats.isLoading ? '...' : '${homeStats.todayOperations}',
                      icon: Icons.engineering,
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      // Boutons flottants
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Chatbot IA
          FloatingActionButton(
            heroTag: 'chatbot',
            onPressed: () => context.push('/chatbot'),
            backgroundColor: AppColors.primary,
            child: ClipOval(
              child: Image.asset(
                'assets/images/logo.png',
                width: 32,
                height: 32,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(
                  Icons.smart_toy,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Signalement incident
          FloatingActionButton.extended(
            heroTag: 'incident',
            onPressed: () => context.push('/incidents/new'),
            backgroundColor: AppColors.error,
            icon: const Icon(Icons.add),
            label: const Text('Signaler un incident'),
          ),
        ],
      ),
    );
  }
}

/// Carte d'action rapide
class _QuickActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  
  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const Spacer(),
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Carte de statistique
class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  
  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
