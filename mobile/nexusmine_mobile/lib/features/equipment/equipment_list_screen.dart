import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/models/equipment_model.dart';
import 'equipment_provider.dart';

class EquipmentListScreen extends ConsumerStatefulWidget {
  const EquipmentListScreen({super.key});

  @override
  ConsumerState<EquipmentListScreen> createState() => _EquipmentListScreenState();
}

class _EquipmentListScreenState extends ConsumerState<EquipmentListScreen> {
  String _filterStatus = 'all';
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(equipmentProvider.notifier).loadEquipment();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final equipmentState = ref.watch(equipmentProvider);
    
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
          equipmentState.isLoading
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : equipmentState.error != null
                  ? SliverFillRemaining(child: _buildErrorView(equipmentState.error!))
                  : _buildSliverList(equipmentState.equipment),
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
        stretchModes: const [StretchMode.zoomBackground],
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
                child: Icon(Icons.settings_suggest_outlined, size: 160, color: Colors.white.withOpacity(0.1)),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Parc Équipement',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    ),
                    Text(
                      'Gestion & Maintenance Préventive',
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
          onPressed: () => ref.read(equipmentProvider.notifier).loadEquipment(),
        ),
        _buildFilterMenu(),
      ],
    );
  }

  Widget _buildFilterMenu() {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.tune, color: Colors.white),
      onSelected: (value) => setState(() => _filterStatus = value),
      itemBuilder: (context) => [
        const PopupMenuItem(value: 'all', child: Text('Tous les équipements')),
        const PopupMenuItem(value: 'operational', child: Text('✅ Opérationnels')),
        const PopupMenuItem(value: 'maintenance', child: Text('🛠️ Maintenance')),
        const PopupMenuItem(value: 'repair', child: Text('🔧 Réparation')),
        const PopupMenuItem(value: 'out_of_service', child: Text('❌ Hors service')),
      ],
    );
  }

  Widget _buildSectionHeader() {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'INVENTAIRE ACTIF',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.textSecondary, letterSpacing: 1.2),
        ),
      ],
    );
  }

  Widget _buildSliverList(List<EquipmentModel> equipment) {
    final filtered = _filterStatus == 'all'
        ? equipment
        : equipment.where((e) => e.status.value == _filterStatus).toList();

    if (filtered.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text('Aucun équipement correspondant', style: TextStyle(color: Colors.grey))),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _EquipmentCard(
            equipment: filtered[index],
            onTap: () => context.push('/equipment/${filtered[index].id}'),
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
            onPressed: () => ref.read(equipmentProvider.notifier).loadEquipment(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

class _EquipmentCard extends StatelessWidget {
  final EquipmentModel equipment;
  final VoidCallback onTap;
  
  const _EquipmentCard({
    required this.equipment,
    required this.onTap,
  });
  
  Color get _statusColor {
    switch (equipment.status) {
      case EquipmentStatus.operational:
        return AppColors.statusOperational;
      case EquipmentStatus.maintenance:
        return AppColors.statusMaintenance;
      case EquipmentStatus.repair:
        return AppColors.statusRepair;
      case EquipmentStatus.outOfService:
        return AppColors.statusOutOfService;
    }
  }
  
  IconData get _statusIcon {
    switch (equipment.status) {
      case EquipmentStatus.operational:
        return Icons.auto_awesome;
      case EquipmentStatus.maintenance:
        return Icons.build_circle_outlined;
      case EquipmentStatus.repair:
        return Icons.engineering_outlined;
      case EquipmentStatus.outOfService:
        return Icons.report_off_outlined;
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
              // Left accent bar
              Positioned(
                left: 0,
                top: 0,
                bottom: 0,
                width: 6,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [_statusColor, _statusColor.withOpacity(0.5)],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    // Icon Container
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: _statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(_statusIcon, color: _statusColor, size: 28),
                    ),
                    const SizedBox(width: 16),
                    // Information
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            equipment.name,
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.textPrimary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${equipment.type} • ${equipment.code ?? "N/A"}',
                            style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade400),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  equipment.siteName ?? 'Zone non définie',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade500),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Status Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: _statusColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        equipment.status.label.toUpperCase(),
                        style: TextStyle(color: _statusColor, fontSize: 9, fontWeight: FontWeight.w900),
                      ),
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
