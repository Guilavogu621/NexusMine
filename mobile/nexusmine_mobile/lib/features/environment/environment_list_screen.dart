import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/environment_model.dart';
import 'environment_provider.dart';

class EnvironmentListScreen extends ConsumerStatefulWidget {
  const EnvironmentListScreen({super.key});

  @override
  ConsumerState<EnvironmentListScreen> createState() => _EnvironmentListScreenState();
}

class _EnvironmentListScreenState extends ConsumerState<EnvironmentListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(environmentProvider.notifier).loadEnvironmentData();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    final environmentState = ref.watch(environmentProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Relevés environnementaux'),
      ),
      body: environmentState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : environmentState.error != null
              ? _buildErrorView(environmentState.error!)
              : _buildDataList(environmentState.data),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/environment/new'),
        backgroundColor: AppColors.cardEnvironment,
        icon: const Icon(Icons.add),
        label: const Text('Nouveau relevé'),
      ),
    );
  }
  
  Widget _buildErrorView(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(error),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => ref.read(environmentProvider.notifier).loadEnvironmentData(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildDataList(List<EnvironmentDataModel> data) {
    if (data.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.eco, size: 64, color: AppColors.cardEnvironment),
            const SizedBox(height: 16),
            const Text('Aucun relevé trouvé'),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: () => context.push('/environment/new'),
              child: const Text('Créer un relevé'),
            ),
          ],
        ),
      );
    }
    
    return RefreshIndicator(
      onRefresh: () => ref.read(environmentProvider.notifier).loadEnvironmentData(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: data.length,
        itemBuilder: (context, index) {
          final item = data[index];
          return _EnvironmentCard(data: item);
        },
      ),
    );
  }
}

class _EnvironmentCard extends StatelessWidget {
  final EnvironmentDataModel data;
  
  const _EnvironmentCard({required this.data});
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.eco, color: AppColors.cardEnvironment),
                    const SizedBox(width: 8),
                    Text(
                      data.siteName ?? 'Site',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                Text(
                  _formatDateTime(data.recordedAt),
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Données
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                if (data.pm25 != null)
                  _DataChip(
                    label: 'PM2.5',
                    value: '${data.pm25!.toStringAsFixed(1)} µg/m³',
                    icon: Icons.air,
                    color: _getAirQualityColor(data.pm25!),
                  ),
                if (data.pm10 != null)
                  _DataChip(
                    label: 'PM10',
                    value: '${data.pm10!.toStringAsFixed(1)} µg/m³',
                    icon: Icons.air,
                    color: _getAirQualityColor(data.pm10! / 2),
                  ),
                if (data.ph != null)
                  _DataChip(
                    label: 'pH',
                    value: data.ph!.toStringAsFixed(1),
                    icon: Icons.water_drop,
                    color: _getPhColor(data.ph!),
                  ),
                if (data.noiseLevel != null)
                  _DataChip(
                    label: 'Bruit',
                    value: '${data.noiseLevel!.toStringAsFixed(0)} dB',
                    icon: Icons.volume_up,
                    color: _getNoiseColor(data.noiseLevel!),
                  ),
                if (data.ambientTemperature != null)
                  _DataChip(
                    label: 'Temp.',
                    value: '${data.ambientTemperature!.toStringAsFixed(1)} °C',
                    icon: Icons.thermostat,
                    color: AppColors.info,
                  ),
                if (data.humidity != null)
                  _DataChip(
                    label: 'Humidité',
                    value: '${data.humidity!.toStringAsFixed(0)}%',
                    icon: Icons.water,
                    color: AppColors.info,
                  ),
              ],
            ),
            
            if (data.notes != null && data.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              Text(
                data.notes!,
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 13,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
  
  String _formatDateTime(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
  
  Color _getAirQualityColor(double pm25) {
    if (pm25 <= 12) return AppColors.success;
    if (pm25 <= 35) return AppColors.warning;
    return AppColors.error;
  }
  
  Color _getPhColor(double ph) {
    if (ph >= 6.5 && ph <= 8.5) return AppColors.success;
    if (ph >= 6 && ph <= 9) return AppColors.warning;
    return AppColors.error;
  }
  
  Color _getNoiseColor(double db) {
    if (db <= 70) return AppColors.success;
    if (db <= 85) return AppColors.warning;
    return AppColors.error;
  }
}

class _DataChip extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  
  const _DataChip({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });
  
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withAlpha(76)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.textSecondary,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
