import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/equipment_model.dart';

/// État des équipements
class EquipmentState {
  final List<EquipmentModel> equipment;
  final bool isLoading;
  final String? error;
  
  const EquipmentState({
    this.equipment = const [],
    this.isLoading = false,
    this.error,
  });
  
  EquipmentState copyWith({
    List<EquipmentModel>? equipment,
    bool? isLoading,
    String? error,
  }) {
    return EquipmentState(
      equipment: equipment ?? this.equipment,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour les équipements
final equipmentProvider = StateNotifierProvider<EquipmentNotifier, EquipmentState>((ref) {
  return EquipmentNotifier(ref);
});

class EquipmentNotifier extends StateNotifier<EquipmentState> {
  final Ref _ref;
  
  EquipmentNotifier(this._ref) : super(const EquipmentState());
  
  /// Charger tous les équipements
  Future<void> loadEquipment({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.equipment,
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
        
        final equipment = results
            .map((json) => EquipmentModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        state = state.copyWith(
          equipment: equipment,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des équipements',
      );
    }
  }
  
  /// Récupérer un équipement par ID
  Future<EquipmentModel?> getEquipment(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get('${ApiConstants.equipment}$id/');
      
      if (response.statusCode == 200) {
        return EquipmentModel.fromJson(response.data);
      }
    } catch (e) {
      debugPrint('Erreur récupération équipement: $e');
    }
    return null;
  }
  
  /// Mettre à jour le statut d'un équipement
  Future<bool> updateEquipmentStatus(int id, String status) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.patch(
        '${ApiConstants.equipment}$id/',
        data: {'status': status},
      );
      
      if (response.statusCode == 200) {
        final updatedEquipment = EquipmentModel.fromJson(response.data);
        
        final updatedList = state.equipment.map((e) {
          return e.id == id ? updatedEquipment : e;
        }).toList();
        
        state = state.copyWith(equipment: updatedList);
        return true;
      }
    } catch (e) {
      debugPrint('Erreur mise à jour statut: $e');
    }
    return false;
  }
}
