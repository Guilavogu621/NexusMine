import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/report_model.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/api_constants.dart';
import 'reports_provider.dart';
import 'qr_scanner_screen.dart';
import 'report_detail_screen.dart';

class ReportsListScreen extends ConsumerStatefulWidget {
  const ReportsListScreen({super.key});

  @override
  ConsumerState<ReportsListScreen> createState() => _ReportsListScreenState();
}

class _ReportsListScreenState extends ConsumerState<ReportsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(reportsProvider.notifier).loadReports();
    });
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'DRAFT':
        return AppColors.textSecondary;
      case 'PENDING_APPROVAL':
        return Colors.orange;
      case 'GENERATED':
        return AppColors.info;
      case 'VALIDATED':
        return AppColors.success;
      case 'PUBLISHED':
        return AppColors.primary;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'DAILY':
        return Icons.today;
      case 'WEEKLY':
        return Icons.date_range;
      case 'MONTHLY':
        return Icons.calendar_month;
      case 'INCIDENT':
        return Icons.warning;
      case 'ENVIRONMENTAL':
        return Icons.eco;
      default:
        return Icons.description;
    }
  }

  @override
  Widget build(BuildContext context) {
    final reportsState = ref.watch(reportsProvider);

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
          reportsState.isLoading
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : reportsState.error != null
                  ? SliverFillRemaining(child: _buildErrorView(reportsState.error!))
                  : _buildSliverList(reportsState.reports),
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
                child: Icon(Icons.description_outlined, size: 160, color: Colors.white.withOpacity(0.1)),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Archives & Rapports',
                      style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: -0.5),
                    ),
                    Text(
                      'Rapports d\'activité et HSE',
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
          icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
          onPressed: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const QRScannerScreen()),
            );
            
            if (result != null && mounted) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ReportDetailScreen(reportId: result.toString()),
                ),
              );
            }
          },
        ),
        IconButton(
          icon: const Icon(Icons.refresh, color: Colors.white),
          onPressed: () => ref.read(reportsProvider.notifier).loadReports(),
        ),
      ],
    );
  }

  Widget _buildSectionHeader() {
    return const Text(
      'DOCUMENTS RÉCENTS',
      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.textSecondary, letterSpacing: 1.2),
    );
  }

  Widget _buildSliverList(List<ReportModel> reports) {
    if (reports.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text('Aucun rapport à afficher', style: TextStyle(color: Colors.grey))),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _ReportCard(
            report: reports[index],
            typeIcon: _typeIcon(reports[index].reportType),
            statusColor: _statusColor(reports[index].status),
          ),
          childCount: reports.length,
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
            onPressed: () => ref.read(reportsProvider.notifier).loadReports(),
            child: const Text('Réessayer'),
          ),
        ],
      ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  final ReportModel report;
  final IconData typeIcon;
  final Color statusColor;

  const _ReportCard({required this.report, required this.typeIcon, required this.statusColor});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ReportDetailScreen(reportId: report.id.toString()),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 8))],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            children: [
              Positioned(
                left: 0, top: 0, bottom: 0, width: 6,
                child: Container(color: statusColor),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Container(
                      width: 50, height: 50,
                      decoration: BoxDecoration(color: AppColors.premiumIndigo.withOpacity(0.05), borderRadius: BorderRadius.circular(14)),
                      child: Icon(typeIcon, color: AppColors.premiumIndigo, size: 24),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(report.title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text('${report.reportTypeDisplay ?? report.reportType} · ${report.siteName ?? "Tous sites"}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                          const SizedBox(height: 4),
                          Text('${report.periodStart} → ${report.periodEnd}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey.shade400)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                          child: Text(report.statusDisplay ?? report.status, style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.w900)),
                        ),
                        const SizedBox(height: 8),
                        if (report.status != 'PENDING_APPROVAL')
                          IconButton(
                            icon: const Icon(Icons.picture_as_pdf, size: 20, color: AppColors.premiumIndigo),
                            onPressed: () async {
                              final url = Uri.parse('${ApiConstants.baseUrl}/reports/${report.id}/export_pdf/');
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url, mode: LaunchMode.externalApplication);
                              }
                            },
                          ),
                      ],
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
