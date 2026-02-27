import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/site_model.dart';

/// État des sites miniers
class SitesState {
  final List<SiteModel> sites;
  final bool isLoading;
  final String? error;

  SitesState({
    this.sites = const [],
    this.isLoading = false,
    this.error,
  });

  SitesState copyWith({
    List<SiteModel>? sites,
    bool? isLoading,
    String? error,
  }) {
    return SitesState(
      sites: sites ?? this.sites,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier pour gérer les sites
class SitesNotifier extends StateNotifier<SitesState> {
  final Ref ref;

  SitesNotifier(this.ref) : super(SitesState());

  Future<void> loadSites({String? status}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final client = ref.read(apiClientProvider);
      String url = ApiConstants.miningSites;
      if (status != null && status.isNotEmpty) {
        url += '?status=$status';
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

      final sites = results.map((e) => SiteModel.fromJson(e)).toList();
      state = state.copyWith(sites: sites, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur de chargement des sites: $e',
      );
    }
  }

  Future<SiteModel?> getSite(int id) async {
    try {
      final client = ref.read(apiClientProvider);
      final response = await client.get('${ApiConstants.miningSites}$id/');
      return SiteModel.fromJson(response.data);
    } catch (e) {
      return null;
    }
  }
}

/// Provider pour les sites
final sitesProvider =
    StateNotifierProvider<SitesNotifier, SitesState>((ref) {
  return SitesNotifier(ref);
});
