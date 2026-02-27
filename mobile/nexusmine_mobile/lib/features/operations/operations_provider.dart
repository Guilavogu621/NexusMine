import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/operation_model.dart';

/// État des opérations
class OperationsState {
  final List<OperationModel> operations;
  final bool isLoading;
  final String? error;

  const OperationsState({
    this.operations = const [],
    this.isLoading = false,
    this.error,
  });

  OperationsState copyWith({
    List<OperationModel>? operations,
    bool? isLoading,
    String? error,
  }) {
    return OperationsState(
      operations: operations ?? this.operations,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour les opérations
final operationsProvider =
    StateNotifierProvider<OperationsNotifier, OperationsState>((ref) {
  return OperationsNotifier(ref);
});

class OperationsNotifier extends StateNotifier<OperationsState> {
  final Ref _ref;

  OperationsNotifier(this._ref) : super(const OperationsState());

  /// Charger toutes les opérations
  Future<void> loadOperations({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.operations,
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

        final operations = results
            .map((json) =>
                OperationModel.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(
          operations: operations,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des opérations',
      );
      debugPrint('Erreur loadOperations: $e');
    }
  }

  /// Créer une nouvelle opération
  Future<OperationModel?> createOperation(Map<String, dynamic> data) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.post(
        ApiConstants.operations,
        data: data,
      );

      if (response.statusCode == 201) {
        final operation = OperationModel.fromJson(response.data);
        state = state.copyWith(
          operations: [operation, ...state.operations],
        );
        return operation;
      }
    } catch (e) {
      debugPrint('Erreur création opération: $e');
    }
    return null;
  }

  /// Mettre à jour une opération
  Future<bool> updateOperation(int id, Map<String, dynamic> data) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.patch(
        '${ApiConstants.operations}$id/',
        data: data,
      );

      if (response.statusCode == 200) {
        final updated = OperationModel.fromJson(response.data);
        final updatedList = state.operations.map((o) {
          return o.id == id ? updated : o;
        }).toList();
        state = state.copyWith(operations: updatedList);
        return true;
      }
    } catch (e) {
      debugPrint('Erreur mise à jour opération: $e');
    }
    return false;
  }

  /// Récupérer une opération par ID
  Future<OperationModel?> getOperation(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get('${ApiConstants.operations}$id/');

      if (response.statusCode == 200) {
        return OperationModel.fromJson(response.data);
      }
    } catch (e) {
      debugPrint('Erreur récupération opération: $e');
    }
    return null;
  }

  /// Supprimer une opération
  Future<bool> deleteOperation(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.delete('${ApiConstants.operations}$id/');

      if (response.statusCode == 204) {
        state = state.copyWith(
          operations: state.operations.where((o) => o.id != id).toList(),
        );
        return true;
      }
    } catch (e) {
      debugPrint('Erreur suppression opération: $e');
    }
    return false;
  }
}
