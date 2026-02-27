import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:ui';
import '../../core/constants/app_colors.dart';
import 'intelligence_provider.dart';

class IntelligenceScreen extends ConsumerStatefulWidget {
  const IntelligenceScreen({super.key});

  @override
  ConsumerState<IntelligenceScreen> createState() => _IntelligenceScreenState();
}

class _IntelligenceScreenState extends ConsumerState<IntelligenceScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );
    _controller.forward();
    
    Future.microtask(() => ref.read(intelligenceProvider.notifier).loadIntelligence());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(intelligenceProvider);
    final data = state.data;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: state.isLoading && data == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(intelligenceProvider.notifier).loadIntelligence(),
              child: CustomScrollView(
                slivers: [
                  _buildAppBar(context),
                  if (data != null)
                    SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          _buildQuickKPIs(data),
                          const SizedBox(height: 24),
                          _buildSectionTitle('PRÉVISIONS & INSIGHTS'),
                          const SizedBox(height: 12),
                          _buildProductionForecast(data['production_forecast']),
                          const SizedBox(height: 16),
                          _buildHSECorrelation(data['hse_correlation']),
                          const SizedBox(height: 16),
                          _buildCVAudit(data['cv_audit']),
                          const SizedBox(height: 24),
                          _buildSectionTitle('RECOMMANDATIONS IA'),
                          const SizedBox(height: 12),
                          ..._buildRecommendations(data['recommendations']),
                          const SizedBox(height: 100),
                        ]),
                      ),
                    ),
                  if (state.error != null && data == null)
                    SliverFillRemaining(
                      child: Center(child: Text(state.error!)),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 180,
      pinned: true,
      stretch: true,
      backgroundColor: AppColors.premiumIndigo,
      flexibleSpace: FlexibleSpaceBar(
        stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.premiumIndigo, AppColors.premiumPurple],
            ),
          ),
          child: Stack(
            children: [
              Positioned(
                right: -20,
                top: -20,
                child: Icon(Icons.psychology, size: 200, color: Colors.white.withOpacity(0.1)),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(20, 80, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      'NexusMine Intelligence',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Analyse prédictive et surveillance HSE',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
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
          icon: const Icon(Icons.refresh, color: Colors.white),
          onPressed: () => ref.read(intelligenceProvider.notifier).loadIntelligence(),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w900,
        color: AppColors.textSecondary,
        letterSpacing: 1.5,
      ),
    );
  }

  Widget _buildQuickKPIs(Map<String, dynamic> data) {
    final kpis = data['kpis'];
    final trends = data['incident_trends'];
    
    return Row(
      children: [
        Expanded(
          child: _QuickStatCard(
            label: 'Résolution',
            value: '${kpis['resolution_rate']}%',
            icon: Icons.check_circle_outline,
            color: Colors.teal,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _QuickStatCard(
            label: 'Tendance 30j',
            value: '${trends['trend_pct'] > 0 ? '+' : ''}${trends['trend_pct']}%',
            icon: trends['trend'] == 'hausse' ? Icons.trending_up : Icons.trending_down,
            color: trends['trend'] == 'hausse' ? Colors.pink : Colors.teal,
          ),
        ),
      ],
    );
  }

  Widget _buildProductionForecast(Map<String, dynamic>? forecast) {
    if (forecast == null) return const SizedBox.shrink();
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          const Row(
            children: [
              Icon(Icons.analytics, color: AppColors.premiumIndigo),
              SizedBox(width: 8),
              Text(
                'Prévision Production (30j)',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '${forecast['next_30d']}',
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: AppColors.premiumIndigo,
                  letterSpacing: -2,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'tonnes',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.premiumIndigo.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.auto_awesome, size: 16, color: Colors.amber),
                const SizedBox(width: 8),
                Text(
                  'Confiance IA : ${forecast['confidence']}%',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHSECorrelation(Map<String, dynamic>? hse) {
    if (hse == null) return const SizedBox.shrink();
    
    final bool isCritical = hse['landslide_risk'] == 'CRITIQUE';
    final Color riskColor = isCritical ? Colors.red : Colors.teal;
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isCritical ? Colors.red.shade50 : Colors.teal.shade50,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: riskColor.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.water_drop, color: riskColor),
              const SizedBox(width: 8),
              const Text(
                'Corrélation HSE : Humidité',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('HUMIDITÉ MOYENNE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
                    Text('${hse['avg_humidity']}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: riskColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${hse['landslide_risk']}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Seuil de danger IA : ${hse['dynamic_threshold']}%',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: riskColor),
          ),
        ],
      ),
    );
  }

  Widget _buildCVAudit(Map<String, dynamic>? cv) {
    if (cv == null) return const SizedBox.shrink();
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.visibility, color: Colors.teal),
              SizedBox(width: 8),
              Text(
                'Vision IA : Audit EPI',
                style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Conformité globale', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
              Text('${cv['compliance_rate']}%', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.teal)),
            ],
          ),
          const SizedBox(height: 12),
          ...((cv['ppe_details'] as List).map((ppe) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(ppe['name'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    Text('${ppe['score']}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: ppe['score'] / 100,
                    backgroundColor: Colors.grey.shade100,
                    color: ppe['status'] == 'ALERTE' ? Colors.orange : Colors.teal,
                    minHeight: 4,
                  ),
                ),
              ],
            ),
          )).toList()),
        ],
      ),
    );
  }

  List<Widget> _buildRecommendations(List<dynamic>? recs) {
    if (recs == null) return [];
    
    return recs.map((rec) => Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.blue.withOpacity(0.1)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(rec['icon'], style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        rec['title'],
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.premiumIndigo),
                      ),
                      _buildPriorityBadge(rec['priority']),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    rec['description'],
                    style: const TextStyle(fontSize: 12, color: Colors.black87, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    )).toList();
  }

  Widget _buildPriorityBadge(String priority) {
    Color color = Colors.blue;
    if (priority == 'CRITICAL') color = Colors.red;
    if (priority == 'HIGH') color = Colors.orange;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        priority,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w900),
      ),
    );
  }
}

class _QuickStatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _QuickStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -1),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
