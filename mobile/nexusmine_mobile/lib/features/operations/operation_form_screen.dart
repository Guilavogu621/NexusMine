import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/operation_model.dart';
import '../auth/auth_provider.dart';
import 'operations_provider.dart';

class OperationFormScreen extends ConsumerStatefulWidget {
  final int? operationId;

  const OperationFormScreen({super.key, this.operationId});

  @override
  ConsumerState<OperationFormScreen> createState() =>
      _OperationFormScreenState();
}

class _OperationFormScreenState
    extends ConsumerState<OperationFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isSaving = false;

  final _codeController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _dateController = TextEditingController();
  final _startTimeController = TextEditingController();
  final _endTimeController = TextEditingController();
  final _qtyExtractedController = TextEditingController();
  final _qtyTransportedController = TextEditingController();
  final _qtyProcessedController = TextEditingController();

  String _operationType = 'EXTRACTION';
  String _status = 'PLANNED';
  String _validationStatus = 'PENDING';
  int? _siteId;

  bool get isEditing => widget.operationId != null;

  @override
  void initState() {
    super.initState();
    if (isEditing) {
      _loadOperation();
    } else {
      // Générer un code par défaut
      _codeController.text =
          'OP-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
      _dateController.text =
          '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().day.toString().padLeft(2, '0')}';

      // Utiliser le premier site assigné de l'utilisateur
      final user = ref.read(authStateProvider).user;
      if (user != null && user.assignedSites.isNotEmpty) {
        _siteId = user.assignedSites.first;
      }
    }
  }

  Future<void> _loadOperation() async {
    setState(() => _isLoading = true);
    final op = await ref
        .read(operationsProvider.notifier)
        .getOperation(widget.operationId!);

    if (op != null) {
      _codeController.text = op.operationCode;
      _descriptionController.text = op.description;
      _dateController.text = op.date;
      _startTimeController.text = op.startTime ?? '';
      _endTimeController.text = op.endTime ?? '';
      _qtyExtractedController.text =
          op.quantityExtracted?.toString() ?? '';
      _qtyTransportedController.text =
          op.quantityTransported?.toString() ?? '';
      _qtyProcessedController.text =
          op.quantityProcessed?.toString() ?? '';
      _operationType = op.operationType;
      _status = op.status;
      _validationStatus = op.validationStatus;
      _siteId = op.siteId;
    }

    setState(() => _isLoading = false);
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      _dateController.text =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    }
  }

  Future<void> _selectTime(TextEditingController controller) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (picked != null) {
      controller.text =
          '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_siteId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner un site')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final data = {
      'operation_code': _codeController.text.trim(),
      'operation_type': _operationType,
      'site': _siteId,
      'date': _dateController.text.trim(),
      'status': _status,
      'description': _descriptionController.text.trim(),
    };

    if (_startTimeController.text.isNotEmpty) {
      data['start_time'] = _startTimeController.text.trim();
    }
    if (_endTimeController.text.isNotEmpty) {
      data['end_time'] = _endTimeController.text.trim();
    }
    if (_qtyExtractedController.text.isNotEmpty) {
      data['quantity_extracted'] = _qtyExtractedController.text.trim();
    }
    if (_qtyTransportedController.text.isNotEmpty) {
      data['quantity_transported'] = _qtyTransportedController.text.trim();
    }
    if (_qtyProcessedController.text.isNotEmpty) {
      data['quantity_processed'] = _qtyProcessedController.text.trim();
    }

    bool success;
    if (isEditing) {
      success = await ref
          .read(operationsProvider.notifier)
          .updateOperation(widget.operationId!, data);
    } else {
      final result =
          await ref.read(operationsProvider.notifier).createOperation(data);
      success = result != null;
    }

    setState(() => _isSaving = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEditing
              ? 'Opération mise à jour'
              : 'Opération créée avec succès'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la sauvegarde'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    _descriptionController.dispose();
    _dateController.dispose();
    _startTimeController.dispose();
    _endTimeController.dispose();
    _qtyExtractedController.dispose();
    _qtyTransportedController.dispose();
    _qtyProcessedController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Modifier l\'opération' : 'Nouvelle opération'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Code opération
                    TextFormField(
                      controller: _codeController,
                      decoration: const InputDecoration(
                        labelText: 'Code opération *',
                        prefixIcon: Icon(Icons.tag),
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Champ requis' : null,
                    ),
                    const SizedBox(height: 16),

                    // Type d'opération
                    DropdownButtonFormField<String>(
                      value: _operationType,
                      decoration: const InputDecoration(
                        labelText: 'Type d\'opération *',
                        prefixIcon: Icon(Icons.category),
                        border: OutlineInputBorder(),
                      ),
                      items: OperationType.values
                          .map((t) => DropdownMenuItem(
                                value: t.value,
                                child: Text(t.label),
                              ))
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _operationType = v ?? 'EXTRACTION'),
                    ),
                    const SizedBox(height: 16),

                    // Statut
                    DropdownButtonFormField<String>(
                      value: _status,
                      decoration: const InputDecoration(
                        labelText: 'Statut *',
                        prefixIcon: Icon(Icons.flag),
                        border: OutlineInputBorder(),
                      ),
                      items: OperationStatus.values
                          .where((s) {
                            final userRole = ref.read(authStateProvider).user?.role;
                            if (userRole == 'TECHNICIEN' && _validationStatus != 'APPROVED') {
                              return s.value == 'PLANNED' || s.value == 'CANCELLED';
                            }
                            return true;
                          })
                          .map((s) => DropdownMenuItem(
                                value: s.value,
                                child: Text(s.label),
                              ))
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _status = v ?? 'PLANNED'),
                    ),
                    const SizedBox(height: 16),

                    // Date
                    TextFormField(
                      controller: _dateController,
                      decoration: InputDecoration(
                        labelText: 'Date *',
                        prefixIcon: const Icon(Icons.calendar_today),
                        border: const OutlineInputBorder(),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.date_range),
                          onPressed: _selectDate,
                        ),
                      ),
                      readOnly: true,
                      onTap: _selectDate,
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Champ requis' : null,
                    ),
                    const SizedBox(height: 16),

                    // Heures début/fin
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _startTimeController,
                            decoration: InputDecoration(
                              labelText: 'Début',
                              prefixIcon:
                                  const Icon(Icons.access_time),
                              border: const OutlineInputBorder(),
                              suffixIcon: IconButton(
                                icon: const Icon(Icons.schedule),
                                onPressed: () =>
                                    _selectTime(_startTimeController),
                              ),
                            ),
                            readOnly: true,
                            onTap: () =>
                                _selectTime(_startTimeController),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _endTimeController,
                            decoration: InputDecoration(
                              labelText: 'Fin',
                              prefixIcon:
                                  const Icon(Icons.access_time),
                              border: const OutlineInputBorder(),
                              suffixIcon: IconButton(
                                icon: const Icon(Icons.schedule),
                                onPressed: () =>
                                    _selectTime(_endTimeController),
                              ),
                            ),
                            readOnly: true,
                            onTap: () =>
                                _selectTime(_endTimeController),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Section Quantités
                    Text(
                      'Quantités (tonnes)',
                      style:
                          Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: _qtyExtractedController,
                      decoration: const InputDecoration(
                        labelText: 'Quantité extraite',
                        prefixIcon: Icon(Icons.terrain),
                        suffixText: 't',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: _qtyTransportedController,
                      decoration: const InputDecoration(
                        labelText: 'Quantité transportée',
                        prefixIcon: Icon(Icons.local_shipping),
                        suffixText: 't',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 12),

                    TextFormField(
                      controller: _qtyProcessedController,
                      decoration: const InputDecoration(
                        labelText: 'Quantité traitée',
                        prefixIcon: Icon(Icons.settings),
                        suffixText: 't',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 16),

                    // Description
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        prefixIcon: Icon(Icons.notes),
                        border: OutlineInputBorder(),
                        alignLabelWithHint: true,
                      ),
                      maxLines: 4,
                    ),
                    const SizedBox(height: 24),

                    // Bouton sauvegarder
                    SizedBox(
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.cardOperations,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                isEditing ? 'Mettre à jour' : 'Créer l\'opération',
                                style: const TextStyle(fontSize: 16),
                              ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
