import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/environment_model.dart';

/// État des données environnementales
class EnvironmentState {
  final List<EnvironmentDataModel> data;
  final bool isLoading;
  final String? error;
  
  const EnvironmentState({
    this.data = const [],
    this.isLoading = false,
    this.error,
  });
  
  EnvironmentState copyWith({
    List<EnvironmentDataModel>? data,
    bool? isLoading,
    String? error,
  }) {
    return EnvironmentState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour les données environnementales
final environmentProvider = StateNotifierProvider<EnvironmentNotifier, EnvironmentState>((ref) {
  return EnvironmentNotifier(ref);
});

class EnvironmentNotifier extends StateNotifier<EnvironmentState> {
  final Ref _ref;
  
  EnvironmentNotifier(this._ref) : super(const EnvironmentState());
  
  /// Charger toutes les données environnementales
  Future<void> loadEnvironmentData({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.environmentData,
        queryParameters: filters,
      );
      
      if (response.statusCode == 200) {
        final responseData = response.data;
        List<dynamic> results;
        
        if (responseData is Map && responseData.containsKey('results')) {
          results = responseData['results'] as List<dynamic>;
        } else if (responseData is List) {
          results = responseData;
        } else {
          results = [];
        }
        
        final data = results
            .map((json) => EnvironmentDataModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        state = state.copyWith(
          data: data,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des données',
      );
    }
  }
  
  /// Créer un nouveau relevé environnemental
  Future<EnvironmentDataModel?> createEnvironmentData(Map<String, dynamic> data) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.post(
        ApiConstants.environmentData,
        data: data,
      );
      
      if (response.statusCode == 201) {
        final newData = EnvironmentDataModel.fromJson(response.data);
        
        state = state.copyWith(
          data: [newData, ...state.data],
        );
        
        return newData;
      }
    } catch (e) {
      debugPrint('Erreur création données environnement: $e');
    }
    return null;
  }
}
