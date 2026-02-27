import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../shared/models/site_model.dart';
import 'sites_provider.dart';

class SiteDetailScreen extends ConsumerStatefulWidget {
  final String siteId;
  const SiteDetailScreen({super.key, required this.siteId});

  @override
  ConsumerState<SiteDetailScreen> createState() => _SiteDetailScreenState();
}

class _SiteDetailScreenState extends ConsumerState<SiteDetailScreen> {
  SiteModel? _site;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSite();
  }

  Future<void> _loadSite() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final site = await ref
          .read(sitesProvider.notifier)
          .getSite(int.parse(widget.siteId));
      if (mounted) {
        setState(() {
          _site = site;
          _isLoading = false;
          if (site == null) _error = 'Site introuvable';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Erreur: $e';
        });
      }
    }
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'ACTIVE':
        return AppColors.success;
      case 'SUSPENDED':
        return AppColors.warning;
      case 'CLOSED':
        return AppColors.error;
      case 'EXPLORATION':
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_site?.name ?? 'Détail site')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 48, color: AppColors.error),
                      const SizedBox(height: 8),
                      Text(_error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadSite,
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                )
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final site = _site!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Carte principale
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Nom + statut
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          site.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: _statusColor(site.status).withAlpha(25),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          site.statusDisplay ?? site.status ?? '—',
                          style: TextStyle(
                            color: _statusColor(site.status),
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (site.code != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Code: ${site.code}',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Informations générales
          _SectionTitle(title: 'Informations générales'),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _InfoRow(
                    icon: Icons.category,
                    label: 'Type de minerai',
                    value: site.mineralTypeDisplay ?? site.mineralType ?? '—',
                  ),
                  _InfoRow(
                    icon: Icons.terrain,
                    label: 'Type de site',
                    value: site.siteTypeDisplay ?? site.siteType ?? '—',
                  ),
                  if (site.operatorName != null &&
                      site.operatorName!.isNotEmpty)
                    _InfoRow(
                      icon: Icons.business,
                      label: 'Opérateur',
                      value: site.operatorName!,
                    ),
                  if (site.surfaceArea != null)
                    _InfoRow(
                      icon: Icons.square_foot,
                      label: 'Superficie',
                      value: '${site.surfaceArea!.toStringAsFixed(1)} ha',
                    ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Localisation
          _SectionTitle(title: 'Localisation'),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (site.region != null)
                    _InfoRow(
                      icon: Icons.map,
                      label: 'Région',
                      value: site.region!,
                    ),
                  if (site.prefecture != null)
                    _InfoRow(
                      icon: Icons.location_city,
                      label: 'Préfecture',
                      value: site.prefecture!,
                    ),
                  if (site.location != null)
                    _InfoRow(
                      icon: Icons.place,
                      label: 'Adresse',
                      value: site.location!,
                    ),
                  if (site.latitude != null && site.longitude != null)
                    _InfoRow(
                      icon: Icons.gps_fixed,
                      label: 'Coordonnées GPS',
                      value:
                          '${site.latitude!.toStringAsFixed(6)}, ${site.longitude!.toStringAsFixed(6)}',
                    ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Licence
          if (site.licenseDate != null || site.licenseExpiry != null) ...[
            _SectionTitle(title: 'Licence'),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    if (site.licenseDate != null)
                      _InfoRow(
                        icon: Icons.event,
                        label: 'Date d\'obtention',
                        value: site.licenseDate!,
                      ),
                    if (site.licenseExpiry != null)
                      _InfoRow(
                        icon: Icons.event_busy,
                        label: 'Date d\'expiration',
                        value: site.licenseExpiry!,
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Description
          if (site.description != null && site.description!.isNotEmpty) ...[
            _SectionTitle(title: 'Description'),
            const SizedBox(height: 8),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  site.description!,
                  style: const TextStyle(fontSize: 14, height: 1.5),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
