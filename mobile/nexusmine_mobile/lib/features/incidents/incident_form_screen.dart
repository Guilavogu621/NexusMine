import 'dart:io';
import 'dart:math';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import 'incidents_provider.dart';

class IncidentFormScreen extends ConsumerStatefulWidget {
  final int? incidentId;
  
  const IncidentFormScreen({super.key, this.incidentId});
  
  @override
  ConsumerState<IncidentFormScreen> createState() => _IncidentFormScreenState();
}

class _IncidentFormScreenState extends ConsumerState<IncidentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _actionsTakenController = TextEditingController();
  
  IncidentType _incidentType = IncidentType.other;
  SeverityLevel _severity = SeverityLevel.medium;
  IncidentStatus _status = IncidentStatus.reported;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.now();
  int? _selectedSiteId;
  
  // GPS
  double? _latitude;
  double? _longitude;
  bool _gpsLoading = false;
  
  // Photos
  final List<File> _photos = [];
  final ImagePicker _picker = ImagePicker();
  
  bool _isLoading = false;
  bool _isEditing = false;
  
  @override
  void initState() {
    super.initState();
    if (widget.incidentId != null) {
      _isEditing = true;
      _loadIncident();
    } else {
      // Auto-capture GPS pour un nouvel incident
      _captureGPS();
    }
  }
  
  Future<void> _loadIncident() async {
    setState(() => _isLoading = true);
    
    final incident = await ref.read(incidentsProvider.notifier)
        .getIncident(widget.incidentId!);
    
    if (incident != null && mounted) {
      setState(() {
        _descriptionController.text = incident.description;
        _locationController.text = incident.locationDescription;
        _actionsTakenController.text = incident.actionsTaken;
        _incidentType = incident.incidentType;
        _severity = incident.severity;
        _status = incident.status;
        _selectedDate = incident.date;
        if (incident.time != null && incident.time!.isNotEmpty) {
          final parts = incident.time!.split(':');
          if (parts.length >= 2) {
            _selectedTime = TimeOfDay(
              hour: int.tryParse(parts[0]) ?? 0,
              minute: int.tryParse(parts[1]) ?? 0,
            );
          }
        }
        _selectedSiteId = incident.siteId;
        _latitude = incident.gpsLatitude;
        _longitude = incident.gpsLongitude;
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }
  
  @override
  void dispose() {
    _descriptionController.dispose();
    _locationController.dispose();
    _actionsTakenController.dispose();
    super.dispose();
  }
  
  /// Capture GPS automatique
  Future<void> _captureGPS() async {
    setState(() => _gpsLoading = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied || 
          permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Permission GPS refusée')),
          );
        }
        setState(() => _gpsLoading = false);
        return;
      }
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      if (mounted) {
        setState(() {
          _latitude = position.latitude;
          _longitude = position.longitude;
          _gpsLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Erreur GPS: $e');
      if (mounted) setState(() => _gpsLoading = false);
    }
  }
  
  /// Prendre une photo avec la caméra
  Future<void> _takePhoto() async {
    try {
      // Sur le web, ImageSource.camera ouvre un file picker.
      // On utilise pickImage avec preferredCameraDevice pour forcer la caméra arrière
      // sur les plateformes natives.
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.rear,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (image != null && mounted) {
        setState(() => _photos.add(File(image.path)));
      }
    } catch (e) {
      debugPrint('Erreur caméra: $e');
      if (mounted) {
        // Si la caméra n'est pas disponible (ex: web sans HTTPS), fallback galerie
        final shouldPickFromGallery = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Caméra indisponible'),
            content: const Text(
              'La caméra n\'est pas accessible sur cette plateforme.\nVoulez-vous choisir une photo depuis la galerie ?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Annuler'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Galerie'),
              ),
            ],
          ),
        );
        if (shouldPickFromGallery == true) {
          _pickFromGallery();
        }
      }
    }
  }
  
  /// Choisir une photo depuis la galerie
  Future<void> _pickFromGallery() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (images.isNotEmpty && mounted) {
        setState(() {
          _photos.addAll(images.map((img) => File(img.path)));
        });
      }
    } catch (e) {
      debugPrint('Erreur galerie: $e');
    }
  }
  
  /// Générer un code incident unique
  String _generateIncidentCode() {
    final now = DateTime.now();
    final rand = Random().nextInt(999).toString().padLeft(3, '0');
    return 'INC-${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}-$rand';
  }
  
  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    
    final timeStr = '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}';
    
    final data = {
      if (!_isEditing) 'incident_code': _generateIncidentCode(),
      'incident_type': _incidentType.value,
      'description': _descriptionController.text.trim(),
      'severity': _severity.value,
      'status': _status.value,
      'site': _selectedSiteId ?? 1,
      'date': '${_selectedDate.year.toString().padLeft(4, '0')}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
      'time': timeStr,
      if (_locationController.text.isNotEmpty)
        'location_description': _locationController.text.trim(),
      if (_latitude != null) 'gps_latitude': _latitude,
      if (_longitude != null) 'gps_longitude': _longitude,
      if (_actionsTakenController.text.isNotEmpty)
        'actions_taken': _actionsTakenController.text.trim(),
    };
    
    bool success = false;
    int? createdId;
    
    if (_isEditing) {
      success = await ref.read(incidentsProvider.notifier)
          .updateIncident(widget.incidentId!, data);
      createdId = widget.incidentId;
    } else {
      final incident = await ref.read(incidentsProvider.notifier)
          .createIncident(data);
      success = incident != null;
      createdId = incident?.id;
    }
    
    // Upload photos après création
    if (success && createdId != null && _photos.isNotEmpty) {
      await ref.read(incidentsProvider.notifier).uploadPhotos(
        incidentId: createdId,
        photos: _photos,
      );
    }
    
    setState(() => _isLoading = false);
    
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEditing ? 'Incident mis à jour' : 'Incident signalé avec succès'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de l\'enregistrement'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
  
  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (date != null) setState(() => _selectedDate = date);
  }
  
  Future<void> _selectTime() async {
    final time = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
    );
    if (time != null) setState(() => _selectedTime = time);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _isLoading && _isEditing
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                _buildSliverAppBar(),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _buildSectionTitle('DÉTAILS DE L\'INCIDENT'),
                          _buildMainInfoSection(),
                          const SizedBox(height: 24),
                          _buildSectionTitle('SÉVÉRITÉ & STATUT'),
                          _buildSeveritySection(),
                          const SizedBox(height: 24),
                          _buildSectionTitle('LOCALISATION & GPS'),
                          _buildLocationSection(),
                          const SizedBox(height: 24),
                          _buildSectionTitle('DOCUMENTS PHOTOGRAPHIQUES'),
                          _buildPhotoSection(),
                          const SizedBox(height: 40),
                          _buildSubmitButton(),
                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      pinned: true,
      backgroundColor: AppColors.premiumIndigo,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          _isEditing ? 'ÉDITION RAPPORT' : 'NOUVEAU RAPPORT',
          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.premiumIndigo, AppColors.premiumPurple],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: AppColors.textSecondary, letterSpacing: 1.2),
      ),
    );
  }

  Widget _buildMainInfoSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          DropdownButtonFormField<IncidentType>(
            value: _incidentType,
            decoration: _inputDecoration('Type d\'incident', Icons.category_outlined),
            items: IncidentType.values.map((type) => DropdownMenuItem(value: type, child: Text(type.label))).toList(),
            onChanged: (value) => setState(() => _incidentType = value!),
          ),
          const SizedBox(height: 20),
          TextFormField(
            controller: _descriptionController,
            maxLines: 4,
            decoration: _inputDecoration('Description détaillée', Icons.description_outlined).copyWith(alignLabelWithHint: true),
            validator: (value) => (value == null || value.isEmpty) ? 'Description requise' : null,
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: _selectDate,
                  child: InputDecorator(
                    decoration: _inputDecoration('Date', Icons.calendar_today_outlined),
                    child: Text('${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}'),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: InkWell(
                  onTap: _selectTime,
                  child: InputDecorator(
                    decoration: _inputDecoration('Heure', Icons.access_time_outlined),
                    child: Text('${_selectedTime.hour}:${_selectedTime.minute.toString().padLeft(2, '0')}'),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSeveritySection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          DropdownButtonFormField<SeverityLevel>(
            value: _severity,
            decoration: _inputDecoration('Gravité du risque', Icons.speed_outlined),
            items: SeverityLevel.values.map((level) => DropdownMenuItem(
              value: level,
              child: Row(
                children: [
                  Container(width: 8, height: 8, decoration: BoxDecoration(color: _getSeverityColor(level), shape: BoxShape.circle)),
                  const SizedBox(width: 10),
                  Text(level.label),
                ],
              ),
            )).toList(),
            onChanged: (value) => setState(() => _severity = value!),
          ),
          if (_isEditing) ...[
            const SizedBox(height: 20),
            DropdownButtonFormField<IncidentStatus>(
              value: _status,
              decoration: _inputDecoration('Statut actuel', Icons.flag_outlined),
              items: IncidentStatus.values.map((s) => DropdownMenuItem(value: s, child: Text(s.label))).toList(),
              onChanged: (value) => setState(() => _status = value!),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLocationSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
          TextFormField(
            controller: _locationController,
            decoration: _inputDecoration('Zone / Emplacement', Icons.place_outlined),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                Icon(Icons.gps_fixed, color: _latitude != null ? Colors.blue : Colors.grey, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _latitude != null ? '${_latitude?.toStringAsFixed(6)}, ${_longitude?.toStringAsFixed(6)}' : 'Position GPS non requise',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _latitude != null ? Colors.black87 : Colors.grey),
                  ),
                ),
                if (_gpsLoading)
                  const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                else
                  IconButton(onPressed: _captureGPS, icon: const Icon(Icons.refresh, size: 20, color: Colors.blue)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_photos.isNotEmpty) ...[
            SizedBox(
              height: 100,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _photos.length,
                itemBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: kIsWeb ? Image.network(_photos[index].path, width: 100, height: 100, fit: BoxFit.cover) : Image.file(_photos[index], width: 100, height: 100, fit: BoxFit.cover),
                      ),
                      Positioned(
                        top: 4, right: 4,
                        child: GestureDetector(
                          onTap: () => setState(() => _photos.removeAt(index)),
                          child: Container(padding: const EdgeInsets.all(4), decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle), child: const Icon(Icons.close, color: Colors.white, size: 14)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
          Row(
            children: [
              Expanded(
                child: _buildPhotoButton('CAMÉRA', Icons.camera_alt_outlined, _takePhoto),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildPhotoButton('GALERIE', Icons.photo_library_outlined, _pickFromGallery),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoButton(String label, IconData icon, VoidCallback onPressed) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(16)),
        child: Column(
          children: [
            Icon(icon, color: AppColors.premiumIndigo, size: 20),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.premiumIndigo)),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      height: 60,
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: _isEditing ? [AppColors.premiumIndigo, AppColors.premiumBlue] : [AppColors.error, const Color(0xFFD32F2F)]),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: (_isEditing ? AppColors.premiumIndigo : AppColors.error).withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 8))],
      ),
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleSubmit,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        child: _isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Text(
                _isEditing ? 'METTRE À JOUR LE RAPPORT' : 'TRANSMETTRE LE RAPPORT',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 13),
      prefixIcon: Icon(icon, color: AppColors.premiumIndigo, size: 20),
      filled: true,
      fillColor: Colors.grey.shade50,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide(color: Colors.grey.shade100)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: AppColors.premiumIndigo, width: 1.5)),
    );
  }
  
  Color _getSeverityColor(SeverityLevel level) {
    switch (level) {
      case SeverityLevel.critical:
        return AppColors.severityCritical;
      case SeverityLevel.high:
        return AppColors.severityHigh;
      case SeverityLevel.medium:
        return AppColors.severityMedium;
      case SeverityLevel.low:
        return AppColors.severityLow;
    }
  }
}
