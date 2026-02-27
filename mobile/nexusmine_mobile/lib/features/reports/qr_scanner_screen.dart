import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../core/constants/app_colors.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  bool _isScanned = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scanner un Rapport', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: AppColors.premiumIndigo,
        foregroundColor: Colors.white,
      ),
      body: Stack(
        children: [
          MobileScanner(
            onDetect: (capture) {
              if (_isScanned) return;
              
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  setState(() => _isScanned = true);
                  final String code = barcode.rawValue!;
                  debugPrint('Found QR: $code');
                  
                  // Handle the scanned code (URL or ID)
                  _handleScannedCode(code);
                  break;
                }
              }
            },
          ),
          _buildOverlay(),
        ],
      ),
    );
  }

  Widget _buildOverlay() {
    return Stack(
      children: [
        ColorFiltered(
          colorFilter: ColorFilter.mode(
            Colors.black.withOpacity(0.5),
            BlendMode.srcOut,
          ),
          child: Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: Colors.black,
                  backgroundBlendMode: BlendMode.dstOut,
                ),
              ),
              Align(
                alignment: Alignment.center,
                child: Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ],
          ),
        ),
        Align(
          alignment: Alignment.center,
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: 2),
              borderRadius: BorderRadius.circular(20),
            ),
          ),
        ),
        const Positioned(
          bottom: 100,
          left: 0,
          right: 0,
          child: Center(
            child: Text(
              'Placez le code QR dans le carré',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  void _handleScannedCode(String code) {
    // Basic logic to extract report ID from URL
    // Expected: base_url/api/reports/123/verify/ or old format
    try {
      final uri = Uri.parse(code);
      
      // Trouver l'index de 'reports' dans l'URL
      final reportsIndex = uri.pathSegments.indexOf('reports');
      if (reportsIndex != -1 && reportsIndex + 1 < uri.pathSegments.length) {
        final reportId = uri.pathSegments[reportsIndex + 1];
        
        // Nettoyer si jamais il y a des paramètres ou d'autres trucs ajoutés
        if (int.tryParse(reportId) != null || reportId.isNotEmpty) {
           Navigator.pop(context, reportId);
           return;
        }
      }
      
      _showError('Format de QR Code invalide: Ce QR ne semble pas lier à un rapport NexusMine.');
    } catch (e) {
      _showError('Impossible de lire ce code QR');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
    setState(() => _isScanned = false);
  }
}
