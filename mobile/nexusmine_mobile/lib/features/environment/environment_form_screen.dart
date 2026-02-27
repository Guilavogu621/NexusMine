import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import 'environment_provider.dart';

class EnvironmentFormScreen extends ConsumerStatefulWidget {
  const EnvironmentFormScreen({super.key});

  @override
  ConsumerState<EnvironmentFormScreen> createState() => _EnvironmentFormScreenState();
}

class _EnvironmentFormScreenState extends ConsumerState<EnvironmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Qualité de l'air
  final _pm25Controller = TextEditingController();
  final _pm10Controller = TextEditingController();
  final _co2Controller = TextEditingController();
  
  // Qualité de l'eau
  final _phController = TextEditingController();
  final _turbidityController = TextEditingController();
  
  // Bruit
  final _noiseLevelController = TextEditingController();
  
  // Météo
  final _temperatureController = TextEditingController();
  final _humidityController = TextEditingController();
  final _windSpeedController = TextEditingController();
  
  // Notes
  final _notesController = TextEditingController();
  
  bool _isLoading = false;
  final int _selectedSiteId = 1; // TODO: Sélection dynamique
  
  @override
  void dispose() {
    _pm25Controller.dispose();
    _pm10Controller.dispose();
    _co2Controller.dispose();
    _phController.dispose();
    _turbidityController.dispose();
    _noiseLevelController.dispose();
    _temperatureController.dispose();
    _humidityController.dispose();
    _windSpeedController.dispose();
    _notesController.dispose();
    super.dispose();
  }
  
  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    
    final data = {
      'site': _selectedSiteId,
      if (_pm25Controller.text.isNotEmpty) 
        'pm25': double.tryParse(_pm25Controller.text),
      if (_pm10Controller.text.isNotEmpty) 
        'pm10': double.tryParse(_pm10Controller.text),
      if (_co2Controller.text.isNotEmpty) 
        'co2': double.tryParse(_co2Controller.text),
      if (_phController.text.isNotEmpty) 
        'ph': double.tryParse(_phController.text),
      if (_turbidityController.text.isNotEmpty) 
        'turbidity': double.tryParse(_turbidityController.text),
      if (_noiseLevelController.text.isNotEmpty) 
        'noise_level': double.tryParse(_noiseLevelController.text),
      if (_temperatureController.text.isNotEmpty) 
        'ambient_temperature': double.tryParse(_temperatureController.text),
      if (_humidityController.text.isNotEmpty) 
        'humidity': double.tryParse(_humidityController.text),
      if (_windSpeedController.text.isNotEmpty) 
        'wind_speed': double.tryParse(_windSpeedController.text),
      if (_notesController.text.isNotEmpty) 
        'notes': _notesController.text.trim(),
    };
    
    final result = await ref.read(environmentProvider.notifier)
        .createEnvironmentData(data);
    
    setState(() => _isLoading = false);
    
    if (result != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Relevé enregistré avec succès'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de l\'enregistrement'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouveau relevé'),
        backgroundColor: AppColors.cardEnvironment,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Section Qualité de l'air
              _SectionHeader(
                title: 'Qualité de l\'air',
                icon: Icons.air,
                color: AppColors.info,
              ),
              
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: _NumberField(
                      controller: _pm25Controller,
                      label: 'PM2.5',
                      suffix: 'µg/m³',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _NumberField(
                      controller: _pm10Controller,
                      label: 'PM10',
                      suffix: 'µg/m³',
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              _NumberField(
                controller: _co2Controller,
                label: 'CO2',
                suffix: 'ppm',
              ),
              
              const SizedBox(height: 24),
              
              // Section Qualité de l'eau
              _SectionHeader(
                title: 'Qualité de l\'eau',
                icon: Icons.water_drop,
                color: Colors.blue,
              ),
              
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: _NumberField(
                      controller: _phController,
                      label: 'pH',
                      hint: '0-14',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _NumberField(
                      controller: _turbidityController,
                      label: 'Turbidité',
                      suffix: 'NTU',
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Section Bruit
              _SectionHeader(
                title: 'Niveau sonore',
                icon: Icons.volume_up,
                color: AppColors.warning,
              ),
              
              const SizedBox(height: 12),
              
              _NumberField(
                controller: _noiseLevelController,
                label: 'Niveau de bruit',
                suffix: 'dB',
              ),
              
              const SizedBox(height: 24),
              
              // Section Météo
              _SectionHeader(
                title: 'Conditions météo',
                icon: Icons.wb_sunny,
                color: AppColors.secondary,
              ),
              
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(
                    child: _NumberField(
                      controller: _temperatureController,
                      label: 'Température',
                      suffix: '°C',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _NumberField(
                      controller: _humidityController,
                      label: 'Humidité',
                      suffix: '%',
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              _NumberField(
                controller: _windSpeedController,
                label: 'Vitesse du vent',
                suffix: 'km/h',
              ),
              
              const SizedBox(height: 24),
              
              // Notes
              _SectionHeader(
                title: 'Notes',
                icon: Icons.note,
                color: AppColors.textSecondary,
              ),
              
              const SizedBox(height: 12),
              
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  hintText: 'Observations, remarques...',
                  alignLabelWithHint: true,
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Bouton soumettre
              SizedBox(
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.cardEnvironment,
                  ),
                  icon: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.save),
                  label: Text(
                    _isLoading ? 'Enregistrement...' : 'Enregistrer le relevé',
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

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  
  const _SectionHeader({
    required this.title,
    required this.icon,
    required this.color,
  });
  
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withAlpha(25),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _NumberField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? suffix;
  final String? hint;
  
  const _NumberField({
    required this.controller,
    required this.label,
    this.suffix,
    this.hint,
  });
  
  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        suffixText: suffix,
      ),
      validator: (value) {
        if (value != null && value.isNotEmpty) {
          if (double.tryParse(value) == null) {
            return 'Nombre invalide';
          }
        }
        return null;
      },
    );
  }
}
