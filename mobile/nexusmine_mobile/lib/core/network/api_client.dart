import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';

/// Provider pour le client API
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref);
});

/// Client API avec gestion automatique des tokens JWT
class ApiClient {
  final Ref _ref;
  late final Dio _dio;
  
  ApiClient(this._ref) {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    
    _setupInterceptors();
  }
  
  Dio get dio => _dio;
  
  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Ajouter le token d'accès à chaque requête
          final storage = _ref.read(secureStorageProvider);
          final accessToken = await storage.getAccessToken();
          
          if (accessToken != null) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          
          return handler.next(options);
        },
        onError: (error, handler) async {
          // Gérer l'expiration du token (401)
          if (error.response?.statusCode == 401) {
            final storage = _ref.read(secureStorageProvider);
            final refreshToken = await storage.getRefreshToken();
            
            if (refreshToken != null) {
              try {
                // Tenter de rafraîchir le token
                final response = await _refreshToken(refreshToken);
                
                if (response != null) {
                  // Sauvegarder le nouveau token
                  await storage.saveTokens(
                    accessToken: response['access'],
                    refreshToken: response['refresh'] ?? refreshToken,
                  );
                  
                  // Rejouer la requête originale
                  final opts = error.requestOptions;
                  opts.headers['Authorization'] = 'Bearer ${response['access']}';
                  
                  final retryResponse = await _dio.fetch(opts);
                  return handler.resolve(retryResponse);
                }
              } catch (e) {
                // Échec du refresh, déconnecter l'utilisateur
                await storage.clearAll();
              }
            }
          }
          
          return handler.next(error);
        },
      ),
    );
    
    // Logger en mode debug
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint('API: $obj'),
      ),
    );
  }
  
  /// Rafraîchir le token d'accès
  Future<Map<String, dynamic>?> _refreshToken(String refreshToken) async {
    try {
      final response = await Dio().post(
        '${ApiConstants.baseUrl}${ApiConstants.refreshToken}',
        data: {'refresh': refreshToken},
      );
      
      if (response.statusCode == 200) {
        return response.data;
      }
    } catch (e) {
      debugPrint('Erreur refresh token: $e');
    }
    return null;
  }
  
  // Méthodes HTTP génériques
  
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}
