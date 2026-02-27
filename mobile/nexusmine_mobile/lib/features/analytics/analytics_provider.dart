import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/indicator_model.dart';

/// État des indicateurs analytics
class AnalyticsState {
  final List<IndicatorModel> indicators;
  final bool isLoading;
  final String? error;

  AnalyticsState({
    this.indicators = const [],
    this.isLoading = false,
    this.error,
  });

  AnalyticsState copyWith({
    List<IndicatorModel>? indicators,
    bool? isLoading,
    String? error,
  }) {
    return AnalyticsState(
      indicators: indicators ?? this.indicators,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier pour gérer les indicateurs
class AnalyticsNotifier extends StateNotifier<AnalyticsState> {
  final Ref ref;

  AnalyticsNotifier(this.ref) : super(AnalyticsState());

  Future<void> loadIndicators({String? type}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      String url = ApiConstants.analytics;
      if (type != null && type.isNotEmpty) {
        url += '?indicator_type=$type';
      }
      final response = await client.get(url);
      final data = response.data;

      List<dynamic> results;
      if (data is Map && data.containsKey('results')) {
        results = data['results'] as List;
      } else if (data is List) {
        results = data;
      } else {
        results = [];
      }

      final indicators =
          results.map((e) => IndicatorModel.fromJson(e)).toList();
      state = state.copyWith(indicators: indicators, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur de chargement des indicateurs: $e',
      );
    }
  }
}

/// Provider pour les analytics
final analyticsProvider =
    StateNotifierProvider<AnalyticsNotifier, AnalyticsState>((ref) {
  return AnalyticsNotifier(ref);
});
