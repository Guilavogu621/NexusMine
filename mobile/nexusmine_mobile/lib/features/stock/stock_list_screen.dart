import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/stock_model.dart';
import 'stock_provider.dart';

class StockListScreen extends ConsumerStatefulWidget {
  const StockListScreen({super.key});

  @override
  ConsumerState<StockListScreen> createState() => _StockListScreenState();
}

class _StockListScreenState extends ConsumerState<StockListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(stockProvider.notifier).loadAll();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stockState = ref.watch(stockProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stock'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Synthèse'),
            Tab(text: 'Mouvements'),
            Tab(text: 'Emplacements'),
          ],
        ),
      ),
      body: stockState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : stockState.error != null
              ? _buildErrorView(stockState.error!)
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _SummaryTab(summaries: stockState.summaries),
                    _MovementsTab(movements: stockState.movements),
                    _LocationsTab(locations: stockState.locations),
                  ],
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/stock/new'),
        backgroundColor: AppColors.secondary,
        child: const Icon(Icons.add),
      ),
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
            onPressed: () => ref.read(stockProvider.notifier).loadAll(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

/// Onglet Synthèse
class _SummaryTab extends StatelessWidget {
  final List<StockSummaryModel> summaries;

  const _SummaryTab({required this.summaries});

  @override
  Widget build(BuildContext context) {
    if (summaries.isEmpty) {
      return const Center(child: Text('Aucune synthèse disponible'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: summaries.length,
      itemBuilder: (context, index) {
        final s = summaries[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.inventory_2,
                        color: AppColors.secondary, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${s.siteName ?? 'Site'} — ${s.mineralTypeDisplay ?? s.mineralType}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _MiniStat(
                        label: 'Stock actuel',
                        value: '${s.currentStock.toStringAsFixed(0)} t',
                        color: AppColors.success),
                    _MiniStat(
                        label: 'Extrait',
                        value: '${s.totalExtracted.toStringAsFixed(0)} t',
                        color: AppColors.info),
                    _MiniStat(
                        label: 'Expédié',
                        value: '${s.totalExpedited.toStringAsFixed(0)} t',
                        color: AppColors.warning),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Onglet Mouvements
class _MovementsTab extends StatelessWidget {
  final List<StockMovementModel> movements;

  const _MovementsTab({required this.movements});

  Color _typeColor(String type) {
    switch (type) {
      case 'EXTRACTION':
        return AppColors.success;
      case 'EXPEDITION':
        return AppColors.warning;
      case 'TRANSFER_IN':
        return AppColors.info;
      case 'TRANSFER_OUT':
        return AppColors.secondary;
      case 'LOSS':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (movements.isEmpty) {
      return const Center(child: Text('Aucun mouvement de stock'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: movements.length,
      itemBuilder: (context, index) {
        final m = movements[index];
        final color = _typeColor(m.movementType);
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: color.withAlpha(25),
              child: Icon(
                m.movementType.contains('EXPEDITION')
                    ? Icons.arrow_upward
                    : Icons.arrow_downward,
                color: color,
                size: 20,
              ),
            ),
            title: Text(
              m.movementCode,
              style:
                  const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
            ),
            subtitle: Text(
              '${m.movementTypeDisplay ?? m.movementType} · ${m.quantity.toStringAsFixed(1)} t',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(m.date,
                    style: TextStyle(
                        fontSize: 11, color: AppColors.textSecondary)),
                Text(m.mineralTypeDisplay ?? m.mineralType,
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textPrimary)),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Onglet Emplacements
class _LocationsTab extends StatelessWidget {
  final List<StockLocationModel> locations;

  const _LocationsTab({required this.locations});

  @override
  Widget build(BuildContext context) {
    if (locations.isEmpty) {
      return const Center(child: Text('Aucun emplacement de stock'));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: locations.length,
      itemBuilder: (context, index) {
        final loc = locations[index];
        final fillPct = loc.fillPercentage;

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.warehouse,
                        color: AppColors.cardOperations, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${loc.code} — ${loc.name}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: loc.isActive
                            ? AppColors.success.withAlpha(25)
                            : AppColors.error.withAlpha(25),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        loc.isActive ? 'Actif' : 'Inactif',
                        style: TextStyle(
                          color: loc.isActive
                              ? AppColors.success
                              : AppColors.error,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  '${loc.siteName ?? 'Site'} · ${loc.locationTypeDisplay ?? loc.locationType}',
                  style:
                      TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
                if (loc.capacity != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: fillPct / 100,
                            backgroundColor: AppColors.divider,
                            color: fillPct > 90
                                ? AppColors.error
                                : fillPct > 70
                                    ? AppColors.warning
                                    : AppColors.success,
                            minHeight: 6,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${fillPct.toStringAsFixed(0)}%',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${loc.currentStock?.toStringAsFixed(0) ?? 0} / ${loc.capacity!.toStringAsFixed(0)} t',
                    style:
                        TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniStat(
      {required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
