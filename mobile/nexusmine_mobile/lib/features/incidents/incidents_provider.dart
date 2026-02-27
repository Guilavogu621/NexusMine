import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/incident_model.dart';

/// État des incidents
class IncidentsState {
  final List<IncidentModel> incidents;
  final bool isLoading;
  final String? error;
  
  const IncidentsState({
    this.incidents = const [],
    this.isLoading = false,
    this.error,
  });
  
  IncidentsState copyWith({
    List<IncidentModel>? incidents,
    bool? isLoading,
    String? error,
  }) {
    return IncidentsState(
      incidents: incidents ?? this.incidents,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Provider pour les incidents
final incidentsProvider = StateNotifierProvider<IncidentsNotifier, IncidentsState>((ref) {
  return IncidentsNotifier(ref);
});

class IncidentsNotifier extends StateNotifier<IncidentsState> {
  final Ref _ref;
  
  IncidentsNotifier(this._ref) : super(const IncidentsState());
  
  /// Charger tous les incidents
  Future<void> loadIncidents({Map<String, dynamic>? filters}) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(
        ApiConstants.incidents,
        queryParameters: filters,
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> results;
        
        // Gérer la pagination DRF
        if (data is Map && data.containsKey('results')) {
          results = data['results'] as List<dynamic>;
        } else if (data is List) {
          results = data;
        } else {
          results = [];
        }
        
        final incidents = results
            .map((json) => IncidentModel.fromJson(json as Map<String, dynamic>))
            .toList();
        
        state = state.copyWith(
          incidents: incidents,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Erreur lors du chargement des incidents',
      );
    }
  }
  
  /// Créer un nouvel incident
  Future<IncidentModel?> createIncident(Map<String, dynamic> data) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.post(
        ApiConstants.incidents,
        data: data,
      );
      
      if (response.statusCode == 201) {
        final incident = IncidentModel.fromJson(response.data);
        
        // Ajouter à la liste locale
        state = state.copyWith(
          incidents: [incident, ...state.incidents],
        );
        
        return incident;
      }
    } catch (e) {
      debugPrint('Erreur création incident: $e');
    }
    return null;
  }
  
  /// Mettre à jour un incident
  Future<bool> updateIncident(int id, Map<String, dynamic> data) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.patch(
        '${ApiConstants.incidents}$id/',
        data: data,
      );
      
      if (response.statusCode == 200) {
        final updatedIncident = IncidentModel.fromJson(response.data);
        
        // Mettre à jour la liste locale
        final updatedList = state.incidents.map((i) {
          return i.id == id ? updatedIncident : i;
        }).toList();
        
        state = state.copyWith(incidents: updatedList);
        return true;
      }
    } catch (e) {
      debugPrint('Erreur mise à jour incident: $e');
    }
    return false;
  }
  
  /// Récupérer un incident par ID
  Future<IncidentModel?> getIncident(int id) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get('${ApiConstants.incidents}$id/');
      
      if (response.statusCode == 200) {
        return IncidentModel.fromJson(response.data);
      }
    } catch (e) {
      debugPrint('Erreur récupération incident: $e');
    }
    return null;
  }
  
  /// Uploader une photo pour un incident (POST /incidents/{id}/add_photo/)
  Future<IncidentPhotoModel?> uploadPhoto({
    required int incidentId,
    required File photoFile,
    String caption = '',
  }) async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(
          photoFile.path,
          filename: photoFile.path.split('/').last,
        ),
        'caption': caption,
      });
      
      final response = await apiClient.post(
        '${ApiConstants.incidents}$incidentId/add_photo/',
        data: formData,
      );
      
      if (response.statusCode == 201) {
        return IncidentPhotoModel.fromJson(response.data);
      }
    } catch (e) {
      debugPrint('Erreur upload photo incident: $e');
    }
    return null;
  }
  
  /// Uploader plusieurs photos pour un incident
  Future<List<IncidentPhotoModel>> uploadPhotos({
    required int incidentId,
    required List<File> photos,
  }) async {
    final uploaded = <IncidentPhotoModel>[];
    for (final photo in photos) {
      final result = await uploadPhoto(
        incidentId: incidentId,
        photoFile: photo,
      );
      if (result != null) {
        uploaded.add(result);
      }
    }
    return uploaded;
  }
}
