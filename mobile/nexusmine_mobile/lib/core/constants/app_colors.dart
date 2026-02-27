import 'package:flutter/material.dart';

/// Couleurs de l'application NexusMine
class AppColors {
  AppColors._();
  
  // Couleurs principales
  static const Color primary = Color(0xFF1E40AF); // Bleu mining
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1E3A8A);
  
  // Couleurs secondaires
  static const Color secondary = Color(0xFFF59E0B); // Orange/Amber
  static const Color secondaryLight = Color(0xFFFBBF24);
  static const Color secondaryDark = Color(0xFFD97706);
  
  // Couleurs d'état
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Niveaux de sévérité (incidents/alertes)
  static const Color severityLow = Color(0xFF10B981);
  static const Color severityMedium = Color(0xFFF59E0B);
  static const Color severityHigh = Color(0xFFF97316);
  static const Color severityCritical = Color(0xFFEF4444);
  
  // Statuts équipement
  static const Color statusOperational = Color(0xFF10B981);
  static const Color statusMaintenance = Color(0xFFF59E0B);
  static const Color statusRepair = Color(0xFFF97316);
  static const Color statusOutOfService = Color(0xFFEF4444);
  
  // Neutres
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textDisabled = Color(0xFF94A3B8);
  static const Color divider = Color(0xFFE2E8F0);
  
  // Couleurs de carte par module
  static const Color cardSites = Color(0xFF8B5CF6);
  static const Color cardEquipment = Color(0xFF06B6D4);
  static const Color cardIncidents = Color(0xFFEF4444);
  static const Color cardEnvironment = Color(0xFF22C55E);
  static const Color cardAlerts = Color(0xFFF59E0B);
  static const Color cardOperations = Color(0xFF3B82F6);
  static const Color cardStock = Color(0xFFF59E0B);
  static const Color cardReports = Color(0xFF8B5CF6);
  static const Color cardPersonnel = Color(0xFF06B6D4);
  static const Color cardAnalytics = Color(0xFF14B8A6);
  
  // Couleurs Premium (Intelligence)
  static const Color premiumIndigo = Color(0xFF4F46E5);
  static const Color premiumBlue = Color(0xFF2563EB);
  static const Color premiumPurple = Color(0xFF7C3AED);
  static const Color premiumSlate = Color(0xFF0F172A);
  
  // Gradients Premium
  static const List<Color> premiumGradient = [Color(0xFF4F46E5), Color(0xFF2563EB)];
  static const List<Color> darkGradient = [Color(0xFF0F172A), Color(0xFF1E293B)];
}
