import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/stock_model.dart';
import 'stock_provider.dart';

class StockFormScreen extends ConsumerStatefulWidget {
  const StockFormScreen({super.key});

  @override
  ConsumerState<StockFormScreen> createState() => _StockFormScreenState();
}

class _StockFormScreenState extends ConsumerState<StockFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isSaving = false;

  final _codeController = TextEditingController();
  final _quantityController = TextEditingController();
  final _gradeController = TextEditingController();
  final _dateController = TextEditingController();
  final _destinationController = TextEditingController();
  final _transportRefController = TextEditingController();
  final _notesController = TextEditingController();

  String _movementType = 'EXTRACTION';
  String _mineralType = 'BAUXITE';
  int? _locationId;

  @override
  void initState() {
    super.initState();
    _codeController.text =
        'MV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    _dateController.text =
        '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}-${DateTime.now().day.toString().padLeft(2, '0')}';

    // Charger les emplacements si pas déjà chargés
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final locations = ref.read(stockProvider).locations;
      if (locations.isEmpty) {
        ref.read(stockProvider.notifier).loadLocations();
      }
    });
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

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_locationId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner un emplacement')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final data = {
      'movement_code': _codeController.text.trim(),
      'movement_type': _movementType,
      'location': _locationId,
      'mineral_type': _mineralType,
      'quantity': _quantityController.text.trim(),
      'date': _dateController.text.trim(),
      'notes': _notesController.text.trim(),
    };

    if (_gradeController.text.isNotEmpty) {
      data['grade'] = _gradeController.text.trim();
    }
    if (_destinationController.text.isNotEmpty) {
      data['destination'] = _destinationController.text.trim();
    }
    if (_transportRefController.text.isNotEmpty) {
      data['transport_reference'] = _transportRefController.text.trim();
    }

    final result =
        await ref.read(stockProvider.notifier).createMovement(data);

    setState(() => _isSaving = false);

    if (result != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Mouvement de stock créé'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la création'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    _quantityController.dispose();
    _gradeController.dispose();
    _dateController.dispose();
    _destinationController.dispose();
    _transportRefController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final stockState = ref.watch(stockProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouveau mouvement'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _codeController,
                decoration: const InputDecoration(
                  labelText: 'Code mouvement *',
                  prefixIcon: Icon(Icons.tag),
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    v == null || v.isEmpty ? 'Champ requis' : null,
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                value: _movementType,
                decoration: const InputDecoration(
                  labelText: 'Type de mouvement *',
                  prefixIcon: Icon(Icons.swap_vert),
                  border: OutlineInputBorder(),
                ),
                items: MovementType.values
                    .map((t) => DropdownMenuItem(
                          value: t.value,
                          child: Text(t.label),
                        ))
                    .toList(),
                onChanged: (v) =>
                    setState(() => _movementType = v ?? 'EXTRACTION'),
              ),
              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                value: _mineralType,
                decoration: const InputDecoration(
                  labelText: 'Type de minerai *',
                  prefixIcon: Icon(Icons.diamond),
                  border: OutlineInputBorder(),
                ),
                items: MineralType.values
                    .map((t) => DropdownMenuItem(
                          value: t.value,
                          child: Text(t.label),
                        ))
                    .toList(),
                onChanged: (v) =>
                    setState(() => _mineralType = v ?? 'BAUXITE'),
              ),
              const SizedBox(height: 16),

              // Emplacement
              DropdownButtonFormField<int>(
                value: _locationId,
                decoration: const InputDecoration(
                  labelText: 'Emplacement *',
                  prefixIcon: Icon(Icons.warehouse),
                  border: OutlineInputBorder(),
                ),
                items: stockState.locations
                    .map((loc) => DropdownMenuItem(
                          value: loc.id,
                          child: Text('${loc.code} — ${loc.name}'),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _locationId = v),
                validator: (v) => v == null ? 'Champ requis' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _quantityController,
                decoration: const InputDecoration(
                  labelText: 'Quantité (tonnes) *',
                  prefixIcon: Icon(Icons.scale),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (v) =>
                    v == null || v.isEmpty ? 'Champ requis' : null,
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _gradeController,
                decoration: const InputDecoration(
                  labelText: 'Teneur / Grade (%)',
                  prefixIcon: Icon(Icons.percent),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),

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

              if (_movementType == 'EXPEDITION') ...[
                TextFormField(
                  controller: _destinationController,
                  decoration: const InputDecoration(
                    labelText: 'Destination (client/port)',
                    prefixIcon: Icon(Icons.place),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _transportRefController,
                  decoration: const InputDecoration(
                    labelText: 'Référence transport',
                    prefixIcon: Icon(Icons.local_shipping),
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Notes',
                  prefixIcon: Icon(Icons.notes),
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 24),

              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondary,
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
                      : const Text(
                          'Enregistrer le mouvement',
                          style: TextStyle(fontSize: 16),
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
