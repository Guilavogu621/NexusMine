import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/models/alert_model.dart';
import 'alerts_provider.dart';

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(alertsProvider.notifier).loadAlerts();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final alertsState = ref.watch(alertsProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alertes'),
        actions: [
          if (alertsState.alerts.any((a) => !a.isAcknowledged))
            TextButton.icon(
              onPressed: () => ref.read(alertsProvider.notifier).acknowledgeAll(),
              icon: const Icon(Icons.done_all, color: Colors.white),
              label: const Text(
                'Tout acquitter',
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: alertsState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : alertsState.error != null
              ? _buildErrorView(alertsState.error!)
              : _buildAlertsList(alertsState.alerts),
    );
  }
  
  Widget _buildErrorView(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(error),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => ref.read(alertsProvider.notifier).loadAlerts(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildAlertsList(List<AlertModel> alerts) {
    if (alerts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_off_outlined,
              size: 64,
              color: AppColors.success,
            ),
            const SizedBox(height: 16),
            const Text('Aucune alerte'),
            const SizedBox(height: 8),
            Text(
              'Tout fonctionne normalement',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }
    
    // Grouper par date
    final today = DateTime.now();
    final todayAlerts = alerts.where((a) => 
        a.createdAt.day == today.day && 
        a.createdAt.month == today.month &&
        a.createdAt.year == today.year).toList();
    final olderAlerts = alerts.where((a) => 
        a.createdAt.day != today.day || 
        a.createdAt.month != today.month ||
        a.createdAt.year != today.year).toList();
    
    return RefreshIndicator(
      onRefresh: () => ref.read(alertsProvider.notifier).loadAlerts(),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (todayAlerts.isNotEmpty) ...[
            Text(
              'Aujourd\'hui',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            ...todayAlerts.map((alert) => _AlertCard(
              alert: alert,
              onAcknowledge: () => ref.read(alertsProvider.notifier)
                  .acknowledgeAlert(alert.id),
            )),
            const SizedBox(height: 24),
          ],
          if (olderAlerts.isNotEmpty) ...[
            Text(
              'Précédentes',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            ...olderAlerts.map((alert) => _AlertCard(
              alert: alert,
              onAcknowledge: () => ref.read(alertsProvider.notifier)
                  .acknowledgeAlert(alert.id),
            )),
          ],
        ],
      ),
    );
  }
}

class _AlertCard extends StatelessWidget {
  final AlertModel alert;
  final VoidCallback onAcknowledge;
  
  const _AlertCard({
    required this.alert,
    required this.onAcknowledge,
  });
  
  Color get _severityColor {
    switch (alert.severity) {
      case SeverityLevel.critical:
        return AppColors.severityCritical;
      case SeverityLevel.high:
        return AppColors.severityHigh;
      case SeverityLevel.medium:
        return AppColors.severityMedium;
      case SeverityLevel.low:
        return AppColors.severityLow;
    }
  }
  
  IconData get _severityIcon {
    switch (alert.severity) {
      case SeverityLevel.critical:
        return Icons.error;
      case SeverityLevel.high:
        return Icons.warning;
      case SeverityLevel.medium:
        return Icons.info;
      case SeverityLevel.low:
        return Icons.info_outline;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: alert.isAcknowledged ? null : _severityColor.withAlpha(13),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: alert.isAcknowledged 
            ? BorderSide.none
            : BorderSide(color: _severityColor.withAlpha(76)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _severityColor.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _severityIcon,
                    color: _severityColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        alert.title,
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                          color: alert.isAcknowledged 
                              ? AppColors.textSecondary 
                              : null,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        alert.siteName ?? 'Site',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  _formatTime(alert.createdAt),
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            Text(
              alert.message,
              style: TextStyle(
                color: alert.isAcknowledged 
                    ? AppColors.textSecondary 
                    : AppColors.textPrimary,
                fontSize: 14,
              ),
            ),
            
            if (!alert.isAcknowledged) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    onPressed: onAcknowledge,
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text('Acquitter'),
                    style: TextButton.styleFrom(
                      foregroundColor: _severityColor,
                    ),
                  ),
                ],
              ),
            ] else ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 14,
                    color: AppColors.success,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Statut: ${alert.status}',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inMinutes < 60) {
      return 'Il y a ${diff.inMinutes}m';
    } else if (diff.inHours < 24) {
      return 'Il y a ${diff.inHours}h';
    } else {
      return '${date.day}/${date.month}';
    }
  }
}
