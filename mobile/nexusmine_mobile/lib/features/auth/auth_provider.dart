import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/secure_storage.dart';
import '../../shared/models/user_model.dart';

/// État d'authentification
class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserModel? user;
  final String? error;
  
  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.user,
    this.error,
  });
  
  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserModel? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

/// Provider pour l'état d'authentification
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});

/// Notifier pour gérer l'authentification
class AuthNotifier extends StateNotifier<AuthState> {
  final Ref _ref;
  
  AuthNotifier(this._ref) : super(const AuthState()) {
    _checkAuthStatus();
  }
  
  /// Vérifier le statut d'authentification au démarrage
  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final storage = _ref.read(secureStorageProvider);
      final isAuthenticated = await storage.isAuthenticated();
      
      if (isAuthenticated) {
        final userData = await storage.getUserData();
        if (userData != null) {
          state = AuthState(
            isAuthenticated: true,
            user: UserModel.fromJson(userData),
          );
          return;
        }
      }
    } catch (e) {
      debugPrint('Erreur vérification auth: $e');
    }
    
    state = const AuthState(isAuthenticated: false);
  }
  
  /// Connexion
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final apiClient = _ref.read(apiClientProvider);
      
      // Étape 1 : Obtenir les tokens JWT via /token/
      final response = await apiClient.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );
      
      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        
        // SimpleJWT retourne directement {access, refresh}
        final accessToken = data['access'] as String?;
        final refreshToken = data['refresh'] as String?;
        
        if (accessToken == null) {
          state = state.copyWith(
            isLoading: false,
            error: 'Réponse de connexion invalide',
          );
          return false;
        }
        
        // Sauvegarder les tokens
        final storage = _ref.read(secureStorageProvider);
        await storage.saveTokens(
          accessToken: accessToken,
          refreshToken: refreshToken ?? '',
        );
        
        // Étape 2 : Charger le profil utilisateur via /users/me/
        await _loadUserProfile();
        
        return state.isAuthenticated;
      }
    } catch (e, stackTrace) {
      String errorMessage = 'Erreur de connexion';
      final errorStr = e.toString();
      
      if (errorStr.contains('401')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (errorStr.contains('SocketException') || errorStr.contains('Connection refused')) {
        errorMessage = 'Serveur inaccessible. Vérifiez votre connexion.';
      } else if (errorStr.contains('network') || errorStr.contains('XMLHttpRequest')) {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
      } else if (errorStr.contains('OperationError') || errorStr.contains('PlatformException')) {
        errorMessage = 'Erreur de stockage local. Veuillez réessayer.';
      } else if (errorStr.contains('FormatException') || errorStr.contains('type')) {
        errorMessage = 'Erreur de format de données du serveur.';
      }
      
      debugPrint('Erreur login: $e');
      debugPrint('Stack trace: $stackTrace');
      
      state = state.copyWith(
        isLoading: false,
        error: errorMessage,
      );
    }
    
    return false;
  }
  
  /// Charger le profil utilisateur
  Future<void> _loadUserProfile() async {
    try {
      final apiClient = _ref.read(apiClientProvider);
      final response = await apiClient.get(ApiConstants.profile);
      
      if (response.statusCode == 200) {
        final userData = response.data as Map<String, dynamic>;
        
        final storage = _ref.read(secureStorageProvider);
        await storage.saveUserData(userData);
        
        state = AuthState(
          isAuthenticated: true,
          user: UserModel.fromJson(userData),
        );
      }
    } catch (e) {
      debugPrint('Erreur chargement profil: $e');
    }
  }
  
  /// Déconnexion
  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    
    // JWT est stateless — pas d'appel serveur nécessaire
    // Nettoyer le stockage local suffit
    final storage = _ref.read(secureStorageProvider);
    await storage.clearAll();
    
    state = const AuthState(isAuthenticated: false);
  }
  
  /// Mettre à jour l'utilisateur
  void updateUser(UserModel user) {
    state = state.copyWith(user: user);
  }
}
