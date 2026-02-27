import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/operation_model.dart';
import 'operations_provider.dart';

class OperationsListScreen extends ConsumerStatefulWidget {
  const OperationsListScreen({super.key});

  @override
  ConsumerState<OperationsListScreen> createState() =>
      _OperationsListScreenState();
}

class _OperationsListScreenState
    extends ConsumerState<OperationsListScreen> {
  String _filterStatus = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(operationsProvider.notifier).loadOperations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final opsState = ref.watch(operationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: _buildSectionHeader(),
            ),
          ),
          opsState.isLoading
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : opsState.error != null
                  ? SliverFillRemaining(child: _buildErrorView(opsState.error!))
                  : _buildSliverList(opsState.operations),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/operations/new'),
        backgroundColor: AppColors.premiumIndigo,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('NOUVELLE OPÉRTATION', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
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
                right: -30,
                bottom: -30,
                child: Icon(Icons.precision_manufacturing_outlined, size: 180, color: Colors.white.withOpacity(0.1)),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Opérations Minières',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    ),
                    Text(
                      'Suivi en temps réel de la production',
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
          onPressed: () => ref.read(operationsProvider.notifier).loadOperations(),
        ),
        _buildFilterMenu(),
      ],
    );
  }

  Widget _buildFilterMenu() {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.tune, color: Colors.white),
      onSelected: (value) => setState(() => _filterStatus = value),
      itemBuilder: (context) => const [
        PopupMenuItem(value: 'all', child: Text('Toutes les opérations')),
        PopupMenuItem(value: 'PLANNED', child: Text('📅 Planifiées')),
        PopupMenuItem(value: 'IN_PROGRESS', child: Text('⚙️ En cours')),
        PopupMenuItem(value: 'COMPLETED', child: Text('✅ Terminées')),
      ],
    );
  }

  Widget _buildSectionHeader() {
    return const Text(
      'FLUX OPÉRATIONNEL',
      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.textSecondary, letterSpacing: 1.2),
    );
  }

  Widget _buildSliverList(List<OperationModel> operations) {
    final filtered = _filterStatus == 'all'
        ? operations
        : operations.where((o) => o.status == _filterStatus).toList();

    if (filtered.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text('Aucune opération à afficher', style: TextStyle(color: Colors.grey))),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _OperationCard(
            operation: filtered[index],
            onTap: () => context.push('/operations/${filtered[index].id}'),
          ),
          childCount: filtered.length,
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
            onPressed: () => ref.read(operationsProvider.notifier).loadOperations(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

class _OperationCard extends StatelessWidget {
  final OperationModel operation;
  final VoidCallback onTap;

  const _OperationCard({required this.operation, required this.onTap});

  Color get _statusColor {
    switch (operation.status) {
      case 'PLANNED': return Colors.blue;
      case 'IN_PROGRESS': return Colors.orange;
      case 'COMPLETED': return AppColors.success;
      case 'CANCELLED': return Colors.red;
      default: return Colors.grey;
    }
  }

  IconData get _typeIcon {
    switch (operation.operationType) {
      case 'EXTRACTION': return Icons.terrain_rounded;
      case 'DRILLING': return Icons.hardware_rounded;
      case 'BLASTING': return Icons.flash_on_rounded;
      case 'TRANSPORT': return Icons.local_shipping_rounded;
      default: return Icons.engineering_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: _statusColor.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: onTap,
          child: Stack(
            children: [
              // Side accent bar
              Positioned(
                left: 0, top: 0, bottom: 0, width: 6,
                child: Container(color: _statusColor),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: _statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(_typeIcon, color: _statusColor, size: 24),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(operation.operationCode, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.textPrimary)),
                              Text(operation.operationTypeDisplay ?? operation.operationType, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: _statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(operation.statusDisplay ?? operation.status, style: TextStyle(color: _statusColor, fontSize: 9, fontWeight: FontWeight.w900)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade400),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(operation.siteName ?? 'Zone non définie', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade500)),
                        ),
                        if (operation.quantityExtracted != null)
                          Text('${operation.quantityExtracted!.toStringAsFixed(1)} Tones', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
