/// Constantes API pour NexusMine
class ApiConstants {
  ApiConstants._();
  
  // Base URL - Utilise --dart-define=BASE_URL=... lors du build
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'http://localhost:8000/api',
  );
  
  static const String wsUrl = String.fromEnvironment(
    'WS_URL',
    defaultValue: 'ws://localhost:8000/ws/notifications/',
  );

  // Exemple de build production :
  // flutter build web --dart-define=BASE_URL=https://votre-app.onrender.com/api --dart-define=WS_URL=wss://votre-app.onrender.com/ws/notifications/
  
  // Timeouts (réduits pour un chargement plus rapide)
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  
  // Auth endpoints (SimpleJWT)
  static const String login = '/token/';
  static const String refreshToken = '/token/refresh/';
  static const String profile = '/users/me/';
  
  // Mining sites
  static const String miningSites = '/sites/';
  
  // Personnel
  static const String personnel = '/personnel/';
  
  // Equipment
  static const String equipment = '/equipment/';
  
  // Operations
  static const String operations = '/operations/';
  
  // Incidents
  static const String incidents = '/incidents/';
  
  // Environment
  static const String environmentData = '/environmental-data/';
  
  // Alerts
  static const String alerts = '/alerts/';
  
  // Reports
  static const String reports = '/reports/';
  
  // Analytics
  static const String analytics = '/indicators/';
  static const String intelligence = '/indicators/intelligence/';
  
  // Stock
  static const String stockLocations = '/stock-locations/';
  static const String stockMovements = '/stock-movements/';
  static const String stockSummary = '/stock-summary/';
  
  // Chatbot IA
  static const String chatbot = '/chatbot/';
}
