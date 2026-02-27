import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/stock_model.dart';

/// État du stock
class StockState {
  final List<StockMovementModel> movements;
  final List<StockLocationModel> locations;
  final List<StockSummaryModel> summaries;
  final bool isLoading;
  final String? error;

  const StockState({
    this.movements = const [],
    this.locations = const [],
    this.summaries = const [],
    this.isLoading = false,
    this.error,
  });

  StockState copyWith({
    List<StockMovementModel>? movements,
    List<StockLocationModel>? locations,
    List<StockSummaryModel>? summaries,
    bool? isLoading,
    String? error,
  }) {
    return StockState(
      movements: movements ?? this.movements,
      locations: locations ?? this.locations,
      summaries: summaries ?? this.summaries,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour le stock
final stockProvider =
    StateNotifierProvider<StockNotifier, StockState>((ref) {
  return StockNotifier(ref);
});

class StockNotifier extends StateNotifier<StockState> {
  final Ref _ref;

  StockNotifier(this._ref) : super(const StockState());

  /// Charger les mouvements de stock
  Future<void> loadMovements({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.stockMovements,
        queryParameters: filters,
      );

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> results;

        if (data is Map && data.containsKey('results')) {
          results = data['results'] as List<dynamic>;
        } else if (data is List) {
          results = data;
        } else {
          results = [];
        }

        final movements = results
            .map((json) =>
                StockMovementModel.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(
          movements: movements,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des mouvements de stock',
      );
      debugPrint('Erreur loadMovements: $e');
    }
  }

  /// Charger les emplacements
  Future<void> loadLocations() async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(ApiConstants.stockLocations);

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> results;

        if (data is Map && data.containsKey('results')) {
          results = data['results'] as List<dynamic>;
        } else if (data is List) {
          results = data;
        } else {
          results = [];
        }

        final locations = results
            .map((json) =>
                StockLocationModel.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(locations: locations);
      }
    } catch (e) {
      debugPrint('Erreur loadLocations: $e');
    }
  }

  /// Charger les synthèses de stock
  Future<void> loadSummaries() async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(ApiConstants.stockSummary);

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> results;

        if (data is Map && data.containsKey('results')) {
          results = data['results'] as List<dynamic>;
        } else if (data is List) {
          results = data;
        } else {
          results = [];
        }

        final summaries = results
            .map((json) =>
                StockSummaryModel.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(summaries: summaries);
      }
    } catch (e) {
      debugPrint('Erreur loadSummaries: $e');
    }
  }

  /// Créer un mouvement de stock
  Future<StockMovementModel?> createMovement(
      Map<String, dynamic> data) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.post(
        ApiConstants.stockMovements,
        data: data,
      );

      if (response.statusCode == 201) {
        final movement = StockMovementModel.fromJson(response.data);
        state = state.copyWith(
          movements: [movement, ...state.movements],
        );
        return movement;
      }
    } catch (e) {
      debugPrint('Erreur création mouvement: $e');
    }
    return null;
  }

  /// Charger tout le stock (mouvements + emplacements + synthèses)
  Future<void> loadAll() async {
    state = state.copyWith(isLoading: true, error: null);
    await Future.wait([
      loadMovements(),
      loadLocations(),
      loadSummaries(),
    ]);
    state = state.copyWith(isLoading: false);
  }
}
