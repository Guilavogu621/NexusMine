import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../shared/models/equipment_model.dart';
import 'equipment_provider.dart';

class EquipmentDetailScreen extends ConsumerStatefulWidget {
  final int equipmentId;
  
  const EquipmentDetailScreen({super.key, required this.equipmentId});
  
  @override
  ConsumerState<EquipmentDetailScreen> createState() => _EquipmentDetailScreenState();
}

class _EquipmentDetailScreenState extends ConsumerState<EquipmentDetailScreen> {
  EquipmentModel? _equipment;
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadEquipment();
  }
  
  Future<void> _loadEquipment() async {
    final equipment = await ref.read(equipmentProvider.notifier)
        .getEquipment(widget.equipmentId);
    
    if (mounted) {
      setState(() {
        _equipment = equipment;
        _isLoading = false;
      });
    }
  }
  
  Color _getStatusColor(EquipmentStatus status) {
    switch (status) {
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
  
  Future<void> _changeStatus(EquipmentStatus newStatus) async {
    final success = await ref.read(equipmentProvider.notifier)
        .updateEquipmentStatus(widget.equipmentId, newStatus.value);
    
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Statut mis à jour'),
          backgroundColor: AppColors.success,
        ),
      );
      _loadEquipment();
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_equipment?.name ?? 'Équipement'),
        actions: [
          if (_equipment != null)
            PopupMenuButton<EquipmentStatus>(
              icon: const Icon(Icons.more_vert),
              onSelected: _changeStatus,
              itemBuilder: (context) => EquipmentStatus.values
                  .where((s) => s != _equipment!.status)
                  .map((status) => PopupMenuItem(
                        value: status,
                        child: Row(
                          children: [
                            Container(
                              width: 12,
                              height: 12,
                              decoration: BoxDecoration(
                                color: _getStatusColor(status),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text('Passer en ${status.label}'),
                          ],
                        ),
                      ))
                  .toList(),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _equipment == null
              ? const Center(child: Text('Équipement non trouvé'))
              : _buildContent(),
    );
  }
  
  Widget _buildContent() {
    final equipment = _equipment!;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Icône et statut
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: _getStatusColor(equipment.status).withAlpha(25),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.precision_manufacturing,
                      size: 40,
                      color: _getStatusColor(equipment.status),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  Text(
                    equipment.name,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  
                  const SizedBox(height: 8),
                  
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor(equipment.status).withAlpha(25),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      equipment.status.label,
                      style: TextStyle(
                        color: _getStatusColor(equipment.status),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Informations
          Text(
            'Informations',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          
          const SizedBox(height: 12),
          
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _InfoRow(label: 'Code', value: equipment.code ?? 'N/A'),
                  const Divider(),
                  _InfoRow(label: 'Type', value: equipment.type),
                  const Divider(),
                  _InfoRow(label: 'Site', value: equipment.siteName ?? 'N/A'),
                  if (equipment.manufacturer != null) ...[
                    const Divider(),
                    _InfoRow(label: 'Fabricant', value: equipment.manufacturer!),
                  ],
                  if (equipment.model != null) ...[
                    const Divider(),
                    _InfoRow(label: 'Modèle', value: equipment.model!),
                  ],
                  if (equipment.serialNumber != null) ...[
                    const Divider(),
                    _InfoRow(label: 'N° Série', value: equipment.serialNumber!),
                  ],
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Maintenance
          if (equipment.lastMaintenanceDate != null || 
              equipment.nextMaintenanceDate != null) ...[
            Text(
              'Maintenance',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            
            const SizedBox(height: 12),
            
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    if (equipment.lastMaintenanceDate != null)
                      _InfoRow(
                        label: 'Dernière maintenance',
                        value: _formatDate(equipment.lastMaintenanceDate!),
                      ),
                    if (equipment.lastMaintenanceDate != null && 
                        equipment.nextMaintenanceDate != null)
                      const Divider(),
                    if (equipment.nextMaintenanceDate != null)
                      _InfoRow(
                        label: 'Prochaine maintenance',
                        value: _formatDate(equipment.nextMaintenanceDate!),
                        valueColor: equipment.needsMaintenance 
                            ? AppColors.error 
                            : null,
                      ),
                  ],
                ),
              ),
            ),
          ],
          
          const SizedBox(height: 24),
          
          // Actions rapides
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    // TODO: Signaler un incident lié
                  },
                  icon: const Icon(Icons.warning_amber),
                  label: const Text('Signaler incident'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // TODO: Planifier maintenance
                  },
                  icon: const Icon(Icons.build),
                  label: const Text('Maintenance'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  
  const _InfoRow({
    required this.label,
    required this.value,
    this.valueColor,
  });
  
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
