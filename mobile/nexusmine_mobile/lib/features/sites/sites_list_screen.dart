import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/site_model.dart';
import 'sites_provider.dart';

class SitesListScreen extends ConsumerStatefulWidget {
  const SitesListScreen({super.key});

  @override
  ConsumerState<SitesListScreen> createState() => _SitesListScreenState();
}

class _SitesListScreenState extends ConsumerState<SitesListScreen> {
  String _selectedStatus = '';

  final _statuses = <String, String>{
    '': 'Tous',
    'ACTIVE': 'En exploitation',
    'SUSPENDED': 'Suspendu',
    'EXPLORATION': 'Exploration',
    'CLOSED': 'Fermé',
  };

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(sitesProvider.notifier).loadSites());
  }

  void _filterByStatus(String status) {
    setState(() => _selectedStatus = status);
    ref.read(sitesProvider.notifier).loadSites(
          status: status.isEmpty ? null : status,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(sitesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Sites miniers')),
      body: Column(
        children: [
          // Filtre par statut
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: _statuses.entries.map((entry) {
                final isSelected = _selectedStatus == entry.key;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(entry.value),
                    selected: isSelected,
                    onSelected: (_) => _filterByStatus(entry.key),
                    selectedColor: AppColors.cardSites,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontSize: 13,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Liste
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : state.error != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.error_outline,
                                size: 48, color: AppColors.error),
                            const SizedBox(height: 8),
                            Text(state.error!,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                    color: AppColors.textSecondary)),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () =>
                                  ref.read(sitesProvider.notifier).loadSites(),
                              child: const Text('Réessayer'),
                            ),
                          ],
                        ),
                      )
                    : state.sites.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.terrain,
                                    size: 64, color: AppColors.textDisabled),
                                SizedBox(height: 8),
                                Text('Aucun site',
                                    style: TextStyle(
                                        color: AppColors.textSecondary)),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () =>
                                ref.read(sitesProvider.notifier).loadSites(
                                      status: _selectedStatus.isEmpty
                                          ? null
                                          : _selectedStatus,
                                    ),
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: state.sites.length,
                              itemBuilder: (context, index) {
                                return _SiteCard(
                                  site: state.sites[index],
                                  onTap: () => context.push(
                                      '/sites/${state.sites[index].id}'),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}

/// Carte de site minier
class _SiteCard extends StatelessWidget {
  final SiteModel site;
  final VoidCallback onTap;
  const _SiteCard({required this.site, required this.onTap});

  Color get _statusColor {
    switch (site.status) {
      case 'ACTIVE':
        return AppColors.success;
      case 'SUSPENDED':
        return AppColors.warning;
      case 'CLOSED':
        return AppColors.error;
      case 'EXPLORATION':
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData get _mineralIcon {
    switch (site.mineralType) {
      case 'BAUXITE':
        return Icons.terrain;
      case 'IRON':
        return Icons.hardware;
      case 'GOLD':
        return Icons.diamond;
      case 'DIAMOND':
        return Icons.diamond;
      case 'MANGANESE':
        return Icons.science;
      default:
        return Icons.landscape;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.cardSites.withAlpha(25),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(_mineralIcon,
                        color: AppColors.cardSites, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          site.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 15,
                          ),
                        ),
                        if (site.code != null)
                          Text(
                            site.code!,
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                  ),
                  // Badge statut
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor.withAlpha(25),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      site.statusDisplay ?? site.status ?? '—',
                      style: TextStyle(
                        color: _statusColor,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),

              // Infos
              Row(
                children: [
                  if (site.mineralTypeDisplay != null) ...[
                    const Icon(Icons.category,
                        size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      site.mineralTypeDisplay!,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const SizedBox(width: 16),
                  ],
                  if (site.region != null) ...[
                    const Icon(Icons.map,
                        size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${site.region}${site.prefecture != null ? ' / ${site.prefecture}' : ''}',
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.textSecondary),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),

              if (site.operatorName != null &&
                  site.operatorName!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.business,
                        size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      site.operatorName!,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
