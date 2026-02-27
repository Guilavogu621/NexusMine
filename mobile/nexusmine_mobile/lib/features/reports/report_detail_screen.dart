import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/report_model.dart';
import 'reports_provider.dart';

class ReportDetailScreen extends ConsumerWidget {
  final String reportId;

  const ReportDetailScreen({super.key, required this.reportId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Ideally we would have a provider for a single report, but let's find it in the list for now
    final reportsState = ref.watch(reportsProvider);
    final report = reportsState.reports.firstWhere(
      (r) => r.id.toString() == reportId,
      orElse: () => ReportModel(
        id: int.tryParse(reportId) ?? 0,
        title: 'Chargement...',
        reportType: '',
        status: '',
        periodStart: '',
        periodEnd: '',
      ),
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Détails du Rapport', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.premiumIndigo,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(report),
            const SizedBox(height: 24),
            _buildInfoGrid(report),
            const SizedBox(height: 24),
            if (report.summary != null) ...[
              const Text('RÉSUMÉ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textSecondary, letterSpacing: 1)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                child: Text(report.summary!, style: const TextStyle(height: 1.5)),
              ),
              const SizedBox(height: 24),
            ],
            if (report.content != null) ...[
              const Text('CONTENU', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textSecondary, letterSpacing: 1)),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                child: Text(report.content!, style: const TextStyle(height: 1.5)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ReportModel report) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppColors.premiumIndigo, AppColors.premiumBlue]),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
            child: Text(
              report.reportTypeDisplay ?? report.reportType,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10),
            ),
          ),
          const SizedBox(height: 12),
          Text(report.title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildInfoGrid(ReportModel report) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildInfoRow(Icons.location_on, 'Site', report.siteName ?? 'Tous sites'),
            const Divider(height: 24),
            _buildInfoRow(Icons.calendar_today, 'Période', '${report.periodStart} au ${report.periodEnd}'),
            const Divider(height: 24),
            _buildInfoRow(Icons.person, 'Généré par', report.generatedByName ?? 'Inconnu'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.premiumIndigo, size: 20),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }
}
