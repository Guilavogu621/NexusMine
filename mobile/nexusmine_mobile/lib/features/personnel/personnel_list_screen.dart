import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/personnel_model.dart';
import 'personnel_provider.dart';

class PersonnelListScreen extends ConsumerStatefulWidget {
  const PersonnelListScreen({super.key});

  @override
  ConsumerState<PersonnelListScreen> createState() =>
      _PersonnelListScreenState();
}

class _PersonnelListScreenState
    extends ConsumerState<PersonnelListScreen> {
  String _filterStatus = 'all';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(personnelProvider.notifier).loadPersonnel();
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'ACTIVE':
        return AppColors.success;
      case 'ON_LEAVE':
        return AppColors.warning;
      case 'INACTIVE':
        return AppColors.textSecondary;
      case 'TERMINATED':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _roleIcon(String role) {
    switch (role) {
      case 'ENGINEER':
        return Icons.engineering;
      case 'OPERATOR':
        return Icons.precision_manufacturing;
      case 'DRIVER':
        return Icons.drive_eta;
      case 'SUPERVISOR':
        return Icons.supervisor_account;
      case 'HSE_OFFICER':
        return Icons.health_and_safety;
      case 'MAINTENANCE':
        return Icons.build;
      case 'SECURITY':
        return Icons.security;
      default:
        return Icons.person;
    }
  }

  @override
  Widget build(BuildContext context) {
    final personnelState = ref.watch(personnelProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Personnel'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) => setState(() => _filterStatus = value),
            itemBuilder: (context) => const [
              PopupMenuItem(value: 'all', child: Text('Tous')),
              PopupMenuItem(value: 'ACTIVE', child: Text('Actifs')),
              PopupMenuItem(value: 'ON_LEAVE', child: Text('En congé')),
              PopupMenuItem(value: 'INACTIVE', child: Text('Inactifs')),
            ],
          ),
        ],
      ),
      body: personnelState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : personnelState.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 64, color: AppColors.error),
                      const SizedBox(height: 16),
                      Text(personnelState.error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref
                            .read(personnelProvider.notifier)
                            .loadPersonnel(),
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _buildList(personnelState.personnel),
    );
  }

  Widget _buildList(List<PersonnelModel> personnel) {
    final filtered = _filterStatus == 'all'
        ? personnel
        : personnel.where((p) => p.status == _filterStatus).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outline,
                size: 64, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            const Text('Aucun personnel trouvé'),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () =>
          ref.read(personnelProvider.notifier).loadPersonnel(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filtered.length,
        itemBuilder: (context, index) {
          final p = filtered[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.primary.withAlpha(25),
                child: Icon(_roleIcon(p.role),
                    color: AppColors.primary, size: 20),
              ),
              title: Text(
                p.fullName,
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 14),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${p.position} · ${p.employeeId}',
                    style: TextStyle(
                        fontSize: 12, color: AppColors.textSecondary),
                  ),
                  if (p.siteName != null)
                    Text(
                      p.siteName!,
                      style: TextStyle(
                          fontSize: 11, color: AppColors.textSecondary),
                    ),
                ],
              ),
              trailing: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _statusColor(p.status).withAlpha(25),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  p.statusDisplay ?? p.status,
                  style: TextStyle(
                    color: _statusColor(p.status),
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }
}
