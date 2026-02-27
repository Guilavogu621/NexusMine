import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/operation_model.dart';
import 'operations_provider.dart';

class OperationDetailScreen extends ConsumerStatefulWidget {
  final int operationId;

  const OperationDetailScreen({super.key, required this.operationId});

  @override
  ConsumerState<OperationDetailScreen> createState() =>
      _OperationDetailScreenState();
}

class _OperationDetailScreenState
    extends ConsumerState<OperationDetailScreen> {
  OperationModel? _operation;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOperation();
  }

  Future<void> _loadOperation() async {
    setState(() => _isLoading = true);
    final op = await ref
        .read(operationsProvider.notifier)
        .getOperation(widget.operationId);
    setState(() {
      _operation = op;
      _isLoading = false;
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'PLANNED':
        return AppColors.info;
      case 'IN_PROGRESS':
        return AppColors.warning;
      case 'COMPLETED':
        return AppColors.success;
      case 'CANCELLED':
        return AppColors.textSecondary;
      default:
        return AppColors.textSecondary;
    }
  }

  Color _validationColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppColors.warning;
      case 'APPROVED':
        return AppColors.success;
      case 'REJECTED':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_operation?.operationCode ?? 'Opération'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _operation == null
              ? const Center(child: Text('Opération non trouvée'))
              : RefreshIndicator(
                  onRefresh: _loadOperation,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildStatusBadges(),
                        const SizedBox(height: 20),
                        _buildInfoSection(),
                        const SizedBox(height: 16),
                        _buildQuantitiesSection(),
                        if (_operation!.description.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          _buildDescriptionSection(),
                        ],
                        if (_operation!.rejectionReason != null &&
                            _operation!.rejectionReason!.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          _buildRejectionSection(),
                        ],
                        const SizedBox(height: 16),
                        _buildMetadataSection(),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildStatusBadges() {
    final op = _operation!;
    return Row(
      children: [
        _Badge(
          label: op.statusDisplay ?? op.status,
          color: _statusColor(op.status),
          icon: Icons.circle,
        ),
        const SizedBox(width: 8),
        _Badge(
          label: op.validationStatusDisplay ?? op.validationStatus,
          color: _validationColor(op.validationStatus),
          icon: Icons.verified,
        ),
      ],
    );
  }

  Widget _buildInfoSection() {
    final op = _operation!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Informations',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const Divider(),
            _InfoRow(
                label: 'Type',
                value: op.operationTypeDisplay ?? op.operationType),
            _InfoRow(label: 'Site', value: op.siteName ?? '-'),
            if (op.workZoneName != null)
              _InfoRow(label: 'Zone', value: op.workZoneName!),
            _InfoRow(label: 'Date', value: op.date),
            if (op.startTime != null)
              _InfoRow(label: 'Début', value: op.startTime!),
            if (op.endTime != null)
              _InfoRow(label: 'Fin', value: op.endTime!),
            if (op.shiftInfo != null)
              _InfoRow(label: 'Rotation', value: op.shiftInfo!),
          ],
        ),
      ),
    );
  }

  Widget _buildQuantitiesSection() {
    final op = _operation!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Quantités (tonnes)',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const Divider(),
            Row(
              children: [
                Expanded(
                  child: _QuantityTile(
                    label: 'Extraite',
                    value: op.quantityExtracted,
                    icon: Icons.terrain,
                    color: AppColors.cardOperations,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuantityTile(
                    label: 'Transportée',
                    value: op.quantityTransported,
                    icon: Icons.local_shipping,
                    color: AppColors.secondary,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuantityTile(
                    label: 'Traitée',
                    value: op.quantityProcessed,
                    icon: Icons.settings,
                    color: AppColors.success,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDescriptionSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Description',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const Divider(),
            Text(
              _operation!.description,
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRejectionSection() {
    return Card(
      color: AppColors.error.withAlpha(15),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.cancel, color: AppColors.error, size: 20),
                const SizedBox(width: 8),
                const Text(
                  'Motif de rejet',
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                      color: AppColors.error),
                ),
              ],
            ),
            const Divider(),
            Text(
              _operation!.rejectionReason!,
              style: TextStyle(color: AppColors.textPrimary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataSection() {
    final op = _operation!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Métadonnées',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
            const Divider(),
            if (op.createdByName != null)
              _InfoRow(label: 'Créé par', value: op.createdByName!),
            if (op.validatedByName != null)
              _InfoRow(label: 'Validé par', value: op.validatedByName!),
            if (op.validationDate != null)
              _InfoRow(label: 'Date validation', value: op.validationDate!),
            if (op.createdAt != null)
              _InfoRow(
                  label: 'Créé le',
                  value:
                      '${op.createdAt!.day}/${op.createdAt!.month}/${op.createdAt!.year}'),
          ],
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icon;

  const _Badge(
      {required this.label, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuantityTile extends StatelessWidget {
  final String label;
  final double? value;
  final IconData icon;
  final Color color;

  const _QuantityTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(
            value != null ? value!.toStringAsFixed(1) : '-',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
