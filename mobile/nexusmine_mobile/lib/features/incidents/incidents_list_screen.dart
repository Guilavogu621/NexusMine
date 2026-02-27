import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/models/incident_model.dart';
import 'incidents_provider.dart';

class IncidentsListScreen extends ConsumerStatefulWidget {
  const IncidentsListScreen({super.key});

  @override
  ConsumerState<IncidentsListScreen> createState() => _IncidentsListScreenState();
}

class _IncidentsListScreenState extends ConsumerState<IncidentsListScreen> {
  String _filterStatus = 'all';
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(incidentsProvider.notifier).loadIncidents();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final incidentsState = ref.watch(incidentsProvider);
    
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: _buildKPISummary(incidentsState.incidents),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: _buildSectionHeader(),
            ),
          ),
          incidentsState.isLoading
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : incidentsState.error != null
                  ? SliverFillRemaining(child: _buildErrorView(incidentsState.error!))
                  : _buildSliverList(incidentsState.incidents),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/incidents/new'),
        backgroundColor: AppColors.error,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('SIGNALER', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
        elevation: 10,
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
                child: Icon(Icons.warning_amber_rounded, size: 160, color: Colors.white.withOpacity(0.1)),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Rapport d\'Incidents',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    ),
                    Text(
                      'Surveillance Sécurité & HSE',
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
          onPressed: () => ref.read(incidentsProvider.notifier).loadIncidents(),
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
        const PopupMenuItem(value: 'all', child: Text('Tous les statuts')),
        const PopupMenuItem(value: 'REPORTED', child: Text('🔴 Déclarés')),
        const PopupMenuItem(value: 'INVESTIGATING', child: Text('🟠 Investigation')),
        const PopupMenuItem(value: 'RESOLVED', child: Text('🟢 Résolus')),
      ],
    );
  }

  Widget _buildKPISummary(List<IncidentModel> incidents) {
    if (incidents.isEmpty) return const SizedBox.shrink();
    
    final openCount = incidents.where((i) => i.status != IncidentStatus.closed && i.status != IncidentStatus.resolved).length;
    final criticalCount = incidents.where((i) => i.severity == SeverityLevel.critical).length;
    
    return Row(
      children: [
        Expanded(
          child: _SmallKPI(
            label: 'OUVERTS',
            value: '$openCount',
            color: Colors.orange,
            icon: Icons.hourglass_empty,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _SmallKPI(
            label: 'CRITIQUES',
            value: '$criticalCount',
            color: Colors.red,
            icon: Icons.bolt,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _SmallKPI(
            label: 'TOTAL',
            value: '${incidents.length}',
            color: AppColors.premiumIndigo,
            icon: Icons.assignment_outlined,
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Text(
          'HISTORIQUE RÉCENT',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.textSecondary, letterSpacing: 1.2),
        ),
        Text(
          _filterStatus == 'all' ? 'TOUS' : _filterStatus,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.premiumIndigo),
        ),
      ],
    );
  }

  Widget _buildSliverList(List<IncidentModel> incidents) {
    final filtered = _filterStatus == 'all'
        ? incidents
        : incidents.where((i) => i.status.value == _filterStatus).toList();

    if (filtered.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text('Aucun incident correspondant', style: TextStyle(color: Colors.grey))),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _IncidentCard(
            incident: filtered[index],
            onTap: () => context.push('/incidents/${filtered[index].id}'),
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
            onPressed: () => ref.read(incidentsProvider.notifier).loadIncidents(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

class _SmallKPI extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _SmallKPI({required this.label, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: color)),
              Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}

class _IncidentCard extends StatelessWidget {
  final IncidentModel incident;
  final VoidCallback onTap;
  
  const _IncidentCard({
    required this.incident,
    required this.onTap,
  });
  
  Color get _severityColor {
    switch (incident.severity) {
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
  
  Color get _statusColor {
    switch (incident.status) {
      case IncidentStatus.reported:
        return AppColors.error;
      case IncidentStatus.investigating:
        return AppColors.warning;
      case IncidentStatus.actionRequired:
        return Colors.deepOrange;
      case IncidentStatus.resolved:
        return AppColors.success;
      case IncidentStatus.closed:
        return AppColors.textSecondary;
    }
  }

  IconData get _typeIcon {
    switch (incident.incidentType) {
      case IncidentType.accident:
        return Icons.personal_injury;
      case IncidentType.nearMiss:
        return Icons.warning;
      case IncidentType.equipmentFailure:
        return Icons.build_circle;
      case IncidentType.environmental:
        return Icons.eco;
      case IncidentType.security:
        return Icons.security;
      case IncidentType.landslide:
        return Icons.landscape;
      case IncidentType.fire:
        return Icons.local_fire_department;
      case IncidentType.explosion:
        return Icons.flash_on;
      case IncidentType.chemicalSpill:
        return Icons.science;
      case IncidentType.other:
        return Icons.report_problem;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final bool isCritical = incident.severity == SeverityLevel.critical;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: _severityColor.withOpacity(0.08),
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
                      colors: [_severityColor, _severityColor.withOpacity(0.5)],
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Row: Icon + Code + Status
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: _severityColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(_typeIcon, color: _severityColor, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                incident.incidentCode.isNotEmpty ? incident.incidentCode : 'INC-${incident.id}',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.textPrimary),
                              ),
                              Text(
                                incident.incidentTypeDisplay ?? incident.incidentType.label,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                        _buildStatusBadge(),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Description
                    Text(
                      incident.description,
                      style: const TextStyle(fontSize: 14, color: Colors.black87, fontWeight: FontWeight.w500, height: 1.4),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 20),
                    // Bottom Row: Location + Time + Severity
                    Row(
                      children: [
                        Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade400),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            incident.siteName ?? 'Zone Indéterminée',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade500),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          _formatDate(incident.date),
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade500),
                        ),
                        if (incident.photos.isNotEmpty) ...[
                          const SizedBox(width: 12),
                          Icon(Icons.photo_library_outlined, size: 14, color: AppColors.premiumIndigo.withOpacity(0.5)),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (isCritical)
                Positioned(
                  top: 0,
                  right: 40,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.only(bottomLeft: Radius.circular(8), bottomRight: Radius.circular(8)),
                    ),
                    child: const Text('CRITIQUE', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: _statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _statusColor.withOpacity(0.2)),
      ),
      child: Text(
        incident.statusDisplay ?? incident.status.label,
        style: TextStyle(color: _statusColor, fontSize: 10, fontWeight: FontWeight.w900),
      ),
    );
  }
  
  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}j';
    return '${date.day}/${date.month}';
  }
}
