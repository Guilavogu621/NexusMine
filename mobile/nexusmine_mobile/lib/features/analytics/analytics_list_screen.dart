import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/indicator_model.dart';
import 'analytics_provider.dart';

class AnalyticsListScreen extends ConsumerStatefulWidget {
  const AnalyticsListScreen({super.key});

  @override
  ConsumerState<AnalyticsListScreen> createState() =>
      _AnalyticsListScreenState();
}

class _AnalyticsListScreenState extends ConsumerState<AnalyticsListScreen> {
  String _selectedType = '';

  final _types = <String, String>{
    '': 'Tous',
    'PRODUCTION': 'Production',
    'EFFICIENCY': 'Efficacité',
    'SAFETY': 'Sécurité',
    'ENVIRONMENTAL': 'Environnement',
    'EQUIPMENT': 'Équipement',
    'FINANCIAL': 'Financier',
  };

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        ref.read(analyticsProvider.notifier).loadIndicators());
  }

  void _filterByType(String type) {
    setState(() => _selectedType = type);
    ref.read(analyticsProvider.notifier).loadIndicators(
          type: type.isEmpty ? null : type,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(analyticsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: _buildFilterChips(),
          ),
          state.isLoading
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : state.error != null
                  ? SliverFillRemaining(child: _buildErrorView(state.error!))
                  : _buildSliverList(state.indicators),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 140,
      pinned: true,
      stretch: true,
      backgroundColor: AppColors.premiumIndigo,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.premiumIndigo, AppColors.premiumBlue, AppColors.premiumPurple],
            ),
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20,
                bottom: -20,
                child: Icon(Icons.bar_chart_rounded, size: 160, color: Colors.white.withOpacity(0.1)),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Indicateurs / KPI',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    ),
                    Text(
                      'Performance & Métriques Clés',
                      style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh, color: Colors.white),
          onPressed: () => ref.read(analyticsProvider.notifier).loadIndicators(type: _selectedType.isEmpty ? null : _selectedType),
        ),
      ],
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 70,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        children: _types.entries.map((entry) {
          final isSelected = _selectedType == entry.key;
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: InkWell(
              onTap: () => _filterByType(entry.key),
              borderRadius: BorderRadius.circular(20),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.premiumIndigo : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [if (isSelected) BoxShadow(color: AppColors.premiumIndigo.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
                ),
                child: Center(
                  child: Text(
                    entry.value.toUpperCase(),
                    style: TextStyle(color: isSelected ? Colors.white : AppColors.textSecondary, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSliverList(List<IndicatorModel> indicators) {
    if (indicators.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text('Aucun indicateur trouvé', style: TextStyle(color: Colors.grey))),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _IndicatorCard(indicator: indicators[index]),
          childCount: indicators.length,
        ),
      ),
    );
  }

  Widget _buildErrorView(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off, size: 48, color: Colors.grey),
          const SizedBox(height: 12),
          Text(error, style: const TextStyle(color: Colors.grey)),
          TextButton(
            onPressed: () => ref.read(analyticsProvider.notifier).loadIndicators(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

class _IndicatorCard extends StatelessWidget {
  final IndicatorModel indicator;
  const _IndicatorCard({required this.indicator});

  Color get _statusColor {
    switch (indicator.performanceStatus) {
      case 'critical': return Colors.red;
      case 'warning': return Colors.orange;
      case 'good': return Colors.emerald;
      default: return Colors.grey;
    }
  }

  IconData get _typeIcon {
    switch (indicator.indicatorType) {
      case 'PRODUCTION': return Icons.factory_outlined;
      case 'EFFICIENCY': return Icons.speed_outlined;
      case 'SAFETY': return Icons.health_and_safety_outlined;
      case 'ENVIRONMENTAL': return Icons.eco_outlined;
      case 'EQUIPMENT': return Icons.settings_input_component_outlined;
      default: return Icons.analytics_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final progress = indicator.progressPercent ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            Positioned(
              left: 0, top: 0, bottom: 0, width: 6,
              child: Container(color: _statusColor),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: AppColors.premiumIndigo.withOpacity(0.05), borderRadius: BorderRadius.circular(10)),
                        child: Icon(_typeIcon, color: AppColors.premiumIndigo, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(indicator.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.textPrimary)),
                      ),
                      _buildStatusDot(),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        indicator.calculatedValue != null ? '${indicator.calculatedValue!.toStringAsFixed(1)}' : '—',
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -1),
                      ),
                      const SizedBox(width: 4),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(indicator.unit ?? '', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                      ),
                      const Spacer(),
                      if (indicator.targetValue != null)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text('OBJECTIF', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.grey)),
                            Text('${indicator.targetValue!.toStringAsFixed(1)} ${indicator.unit ?? ''}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _buildProgressBar(progress),
                  const SizedBox(height: 12),
                  if (indicator.siteName != null)
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 12, color: Colors.grey.shade400),
                        const SizedBox(width: 4),
                        Text(indicator.siteName!, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade500)),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusDot() {
    return Container(
      width: 8, height: 8,
      decoration: BoxDecoration(color: _statusColor, shape: BoxShape.circle, boxShadow: [BoxShadow(color: _statusColor.withOpacity(0.4), blurRadius: 4, spreadRadius: 1)]),
    );
  }

  Widget _buildProgressBar(double progress) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Stack(
          children: [
            Container(height: 6, decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(3))),
            AnimatedContainer(
              duration: const Duration(seconds: 1),
              height: 6,
              width: (progress.clamp(0, 100) / 100) * 200, // Fixed width for simplicity or use LayoutBuilder
              decoration: BoxDecoration(color: _statusColor, borderRadius: BorderRadius.circular(3), boxShadow: [BoxShadow(color: _statusColor.withOpacity(0.3), blurRadius: 4, offset: const Offset(0, 2))]),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text('${progress.toStringAsFixed(1)}% de l\'objectif atteint', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
      ],
    );
  }
}
