import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/personnel_model.dart';

/// État du personnel
class PersonnelState {
  final List<PersonnelModel> personnel;
  final bool isLoading;
  final String? error;

  const PersonnelState({
    this.personnel = const [],
    this.isLoading = false,
    this.error,
  });

  PersonnelState copyWith({
    List<PersonnelModel>? personnel,
    bool? isLoading,
    String? error,
  }) {
    return PersonnelState(
      personnel: personnel ?? this.personnel,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour le personnel
final personnelProvider =
    StateNotifierProvider<PersonnelNotifier, PersonnelState>((ref) {
  return PersonnelNotifier(ref);
});

class PersonnelNotifier extends StateNotifier<PersonnelState> {
  final Ref _ref;

  PersonnelNotifier(this._ref) : super(const PersonnelState());

  /// Charger tout le personnel
  Future<void> loadPersonnel({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.personnel,
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

        final personnel = results
            .map((json) =>
                PersonnelModel.fromJson(json as Map<String, dynamic>))
            .toList();

        state = state.copyWith(
          personnel: personnel,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement du personnel',
      );
      debugPrint('Erreur loadPersonnel: $e');
    }
  }

  /// Récupérer un membre du personnel par ID
  Future<PersonnelModel?> getPersonnel(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get('${ApiConstants.personnel}$id/');

      if (response.statusCode == 200) {
        return PersonnelModel.fromJson(response.data);
      }
    } catch (e) {
      debugPrint('Erreur récupération personnel: $e');
    }
    return null;
  }
}
