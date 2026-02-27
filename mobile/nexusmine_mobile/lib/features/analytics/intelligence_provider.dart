import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';

class IntelligenceState {
  final Map<String, dynamic>? data;
  final bool isLoading;
  final String? error;

  IntelligenceState({
    this.data,
    this.isLoading = false,
    this.error,
  });

  IntelligenceState copyWith({
    Map<String, dynamic>? data,
    bool? isLoading,
    String? error,
  }) {
    return IntelligenceState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class IntelligenceNotifier extends StateNotifier<IntelligenceState> {
  final Ref ref;

  IntelligenceNotifier(this.ref) : super(IntelligenceState());

  Future<void> loadIntelligence() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      final response = await client.get(ApiConstants.intelligence);
      state = state.copyWith(data: response.data, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur de chargement de l\'intelligence: $e',
      );
    }
  }
}

final intelligenceProvider =
    StateNotifierProvider<IntelligenceNotifier, IntelligenceState>((ref) {
  return IntelligenceNotifier(ref);
});
