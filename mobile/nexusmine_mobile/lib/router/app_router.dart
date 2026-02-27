import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/auth_provider.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';
import '../features/incidents/incidents_list_screen.dart';
import '../features/incidents/incident_form_screen.dart';
import '../features/equipment/equipment_list_screen.dart';
import '../features/equipment/equipment_detail_screen.dart';
import '../features/environment/environment_list_screen.dart';
import '../features/environment/environment_form_screen.dart';
import '../features/alerts/alerts_screen.dart';
import '../features/operations/operations_list_screen.dart';
import '../features/operations/operation_form_screen.dart';
import '../features/operations/operation_detail_screen.dart';
import '../features/stock/stock_list_screen.dart';
import '../features/stock/stock_form_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/chatbot/chatbot_screen.dart';
import '../features/analytics/intelligence_screen.dart';
import '../features/reports/reports_list_screen.dart';

/// Provider pour le router
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/login',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';
      
      // Rediriger vers login si non authentifié
      if (!isLoggedIn && !isLoginRoute) {
        return '/login';
      }
      
      // Rediriger vers home si déjà authentifié et sur login
      if (isLoggedIn && isLoginRoute) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      // Auth
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      
      // Home
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      
      // Incidents
      GoRoute(
        path: '/incidents',
        name: 'incidents',
        builder: (context, state) => const IncidentsListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            name: 'incident-new',
            builder: (context, state) => const IncidentFormScreen(),
          ),
          GoRoute(
            path: ':id',
            name: 'incident-detail',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return IncidentFormScreen(incidentId: id);
            },
          ),
        ],
      ),
      
      // Equipment
      GoRoute(
        path: '/equipment',
        name: 'equipment',
        builder: (context, state) => const EquipmentListScreen(),
        routes: [
          GoRoute(
            path: ':id',
            name: 'equipment-detail',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return EquipmentDetailScreen(equipmentId: id);
            },
          ),
        ],
      ),
      
      // Environment
      GoRoute(
        path: '/environment',
        name: 'environment',
        builder: (context, state) => const EnvironmentListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            name: 'environment-new',
            builder: (context, state) => const EnvironmentFormScreen(),
          ),
        ],
      ),
      
      // Alerts
      GoRoute(
        path: '/alerts',
        name: 'alerts',
        builder: (context, state) => const AlertsScreen(),
      ),
      
      // Operations
      GoRoute(
        path: '/operations',
        name: 'operations',
        builder: (context, state) => const OperationsListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            name: 'operation-new',
            builder: (context, state) => const OperationFormScreen(),
          ),
          GoRoute(
            path: ':id',
            name: 'operation-detail',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return OperationDetailScreen(operationId: id);
            },
          ),
          GoRoute(
            path: ':id/edit',
            name: 'operation-edit',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return OperationFormScreen(operationId: id);
            },
          ),
        ],
      ),
      
      // Stock
      GoRoute(
        path: '/stock',
        name: 'stock',
        builder: (context, state) => const StockListScreen(),
        routes: [
          GoRoute(
            path: 'new',
            name: 'stock-new',
            builder: (context, state) => const StockFormScreen(),
          ),
        ],
      ),
      
      // Profile (ingénieur terrain)
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      
      // Chatbot IA Copilot
      GoRoute(
        path: '/chatbot',
        name: 'chatbot',
        builder: (context, state) => const ChatbotScreen(),
      ),
      
      // Intelligence Dashboard
      GoRoute(
        path: '/intelligence',
        name: 'intelligence',
        builder: (context, state) => const IntelligenceScreen(),
      ),

      // Reports
      GoRoute(
        path: '/reports',
        name: 'reports',
        builder: (context, state) => const ReportsListScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page non trouvée',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(state.matchedLocation),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Retour à l\'accueil'),
            ),
          ],
        ),
      ),
    ),
  );
});
