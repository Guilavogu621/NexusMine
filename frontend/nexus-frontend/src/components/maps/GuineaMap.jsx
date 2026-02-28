import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, Circle, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* --- Icônes personnalisées avec animation pulse --- */
const createCustomIcon = (color, type, isSelected = false) => {
  const icons = {
    OPEN_PIT: '⛏',
    UNDERGROUND: '🔨',
    ALLUVIAL: '💧',
    MIXED: '⚙',
  };
  const size = isSelected ? 48 : 40;
  const pulseRing = isSelected
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:3px solid ${color};opacity:.4;animation:marker-pulse 1.5s ease-out infinite;"></div>`
    : '';

  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulseRing}
        <div style="
          background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
          width:${size}px; height:${size}px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 4px 14px ${color}66;
          border:3px solid white;
          transition: all .2s;
        ">
          <span style="transform:rotate(45deg);font-size:${isSelected ? 22 : 18}px;line-height:1;">${icons[type] || '📍'}</span>
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size + 5],
  });
};

const createAssetIcon = (type, speed) => {
  const icons = {
    TRUCK: '🚚',
    TRAIN: '🚆',
    CONVEYOR: '📠',
    OTHER: '📦'
  };
  const size = 32;
  const isMoving = speed > 0;

  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${isMoving ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid #6366F1;opacity:.6;animation:marker-pulse 1s ease-out infinite;"></div>` : ''}
        <div style="
          background: white;
          width:${size}px; height:${size}px;
          border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.2);
          border:2px solid #6366F1;
          font-size: 16px;
        ">
          ${icons[type] || '📦'}
        </div>
      </div>
    `,
    className: 'asset-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

/* --- Couleurs par statut --- */
const statusColors = {
  ACTIVE: '#10B981',
  SUSPENDED: '#F59E0B',
  CLOSED: '#EF4444',
  EXPLORATION: '#3B82F6',
};

const statusLabels = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  CLOSED: 'Fermé',
  EXPLORATION: 'Exploration',
};

/* --- Frontières de la Guinée (GeoJSON) --- */
const guineaBorder = {
  type: 'Feature',
  properties: { name: 'Guinée' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-15.13, 10.83], [-14.67, 11.11], [-14.38, 11.51], [-14.12, 11.65],
      [-13.72, 11.83], [-13.25, 11.91], [-12.93, 11.65], [-12.30, 11.37],
      [-12.01, 11.08], [-11.47, 10.64], [-11.15, 10.05], [-10.67, 9.31],
      [-10.27, 8.41], [-9.78, 8.08], [-9.34, 7.53], [-9.12, 7.37],
      [-8.60, 7.69], [-8.39, 7.62], [-8.22, 8.12], [-7.95, 8.39],
      [-7.65, 8.42], [-7.54, 8.78], [-8.01, 9.17], [-8.13, 9.50],
      [-8.03, 9.99], [-7.89, 10.30], [-8.00, 10.50], [-8.31, 10.61],
      [-8.50, 10.95], [-8.68, 11.01], [-8.82, 10.82], [-9.04, 10.87],
      [-9.23, 11.11], [-9.38, 11.17], [-9.49, 11.49], [-9.69, 11.65],
      [-10.05, 11.88], [-10.30, 12.02], [-10.65, 11.90], [-10.87, 12.18],
      [-11.24, 12.08], [-11.49, 12.19], [-11.73, 12.08], [-12.04, 12.21],
      [-12.19, 12.39], [-12.47, 12.33], [-13.05, 12.07], [-13.23, 12.00],
      [-13.70, 12.51], [-13.95, 12.68], [-14.27, 12.55], [-14.57, 12.22],
      [-14.76, 12.00], [-15.05, 11.68], [-15.08, 11.21], [-15.13, 10.83],
    ]],
  },
};

/* --- Régions --- */
const guineaRegions = [
  { name: 'Conakry', center: [-13.6773, 9.6412], type: 'capitale' },
  { name: 'Boké', center: [-14.2916, 10.9407], type: 'region' },
  { name: 'Kindia', center: [-12.8624, 10.0601], type: 'region' },
  { name: 'Labé', center: [-12.2940, 11.3186], type: 'region' },
  { name: 'Faranah', center: [-10.7499, 10.0404], type: 'region' },
  { name: 'Kankan', center: [-9.3057, 10.3854], type: 'region' },
  { name: 'Mamou', center: [-12.0833, 10.3738], type: 'region' },
  { name: 'Nzérékoré', center: [-8.8179, 7.7562], type: 'region' },
];

/* --- Composant interne : centrage --- */
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

/* --- Loader --- */
function MapLoader() {
  return (
    <div className="absolute inset-0 z-1100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-white font-medium text-sm">Chargement de la carte…</p>
      </div>
    </div>
  );
}

/* ================================================================
   COMPOSANT PRINCIPAL
   ================================================================ */
export default function GuineaMap({
  sites = [],
  height = '500px',
  showRegions = true,
  showBorder = true,
  showZones = true,
  onSiteClick,
  selectedSite = null,
  assets = [],
  interactive = true,
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const guineaCenter = [10.8, -11.0];
  const defaultZoom = 7;

  /* --- Styles --- */
  const borderStyle = {
    color: '#1e293b', // Sombre pour bien délimiter la frontière
    weight: 3,
    opacity: 0.85,
    fillColor: 'transparent', // Transparent pour voir le relief
    fillOpacity: 0,
    dashArray: '8, 8',
  };

  /* --- Itinéraire Principal (Exemple: Transguinéen) --- */
  const simandouRoute = [
    [9.33, -13.25],  // Port de Moribaya
    [9.50, -13.00],  // Forécariah
    [10.06, -12.86], // Kindia
    [10.40, -12.10], // Mamou (contournement)
    [10.10, -10.85], // Faranah
    [9.55, -9.60],   // Kissidougou
    [8.85, -8.90],   // Simandou / Kérouané
  ];

  const getMarkerIcon = (site) => {
    let color = statusColors[site.status] || statusColors.ACTIVE;

    // Logique intelligente: Rouge si incident ouvert
    if (site.incidents_count > 0) {
      color = '#ef4444'; // Red-500
    }

    const isSelected = selectedSite?.id === site.id;
    return createCustomIcon(color, site.site_type, isSelected);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 guinea-map-container">
      {/* Loader */}
      {!mapReady && <MapLoader />}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-1000 bg-linear-to-r from-slate-900/95 via-slate-800/95 to-indigo-900/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Carte de la Guinée</h3>
              <p className="text-indigo-300 text-xs sm:text-sm hidden sm:block">Sites miniers géolocalisés</p>
            </div>
          </div>

          {/* Légende */}
          <div className="hidden md:flex items-center gap-3">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20" style={{ backgroundColor: color }} />
                <span className="text-xs text-white/70">{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carte Leaflet */}
      <MapContainer
        ref={mapRef}
        center={guineaCenter}
        zoom={defaultZoom}
        style={{ height, width: '100%', paddingTop: '64px' }}
        className="z-0"
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        whenReady={() => setMapReady(true)}
      >
        {/* Zoom controls — bottom-right */}
        {interactive && <ZoomControl position="bottomright" />}

        {/* Fond de carte — Topographique (Esri World Topo Map) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Frontière de la Guinée */}
        {showBorder && <GeoJSON data={guineaBorder} style={() => borderStyle} />}

        {/* Itinéraire Principal (Rail Simandou) */}
        {showBorder && (
          <>
            <Polyline
              positions={simandouRoute}
              pathOptions={{ color: '#1e293b', weight: 4, opacity: 0.9 }}
            />
            <Polyline
              positions={simandouRoute}
              pathOptions={{ color: '#ffffff', weight: 4, dashArray: '6, 8', opacity: 0.9 }}
            />
          </>
        )}

        {/* Zones d'exploitation (cercles) autour de chaque site actif */}
        {showZones && sites
          .filter(s => s.latitude && s.longitude && s.status === 'ACTIVE')
          .map((site) => (
            <Circle
              key={`zone-${site.id}`}
              center={[parseFloat(site.latitude), parseFloat(site.longitude)]}
              radius={8000}
              pathOptions={{
                color: statusColors.ACTIVE,
                fillColor: statusColors.ACTIVE,
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
          ))
        }

        {/* Labels des régions */}
        {showRegions && guineaRegions.map((region) => (
          <Marker
            key={region.name}
            position={[region.center[1], region.center[0]]}
            icon={L.divIcon({
              html: `
                <div style="
                  background:${region.type === 'capitale' ? 'linear-gradient(135deg,#DC2626,#B91C1C)' : 'linear-gradient(135deg,#6366F1,#4F46E5)'};
                  color:white;
                  padding:3px 10px;
                  border-radius:9999px;
                  font-size:10px;
                  font-weight:600;
                  white-space:nowrap;
                  box-shadow:0 2px 10px rgba(0,0,0,.25);
                  border:2px solid rgba(255,255,255,.8);
                  letter-spacing:.3px;
                ">
                  ${region.type === 'capitale' ? '⭐ ' : ''}${region.name}
                </div>
              `,
              className: 'region-label',
              iconSize: [80, 24],
              iconAnchor: [40, 12],
            })}
          />
        ))}

        {/* Marqueurs des sites */}
        {sites.filter(s => s.latitude && s.longitude).map((site) => (
          <Marker
            key={site.id}
            position={[parseFloat(site.latitude), parseFloat(site.longitude)]}
            icon={getMarkerIcon(site)}
            eventHandlers={{ click: () => onSiteClick?.(site) }}
          >
            <Popup className="custom-popup" maxWidth={320}>
              <div className="p-3">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${site.status === 'ACTIVE' ? 'bg-emerald-100' :
                    site.status === 'SUSPENDED' ? 'bg-amber-100' :
                      site.status === 'CLOSED' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                    <span className="text-2xl">
                      {site.site_type === 'OPEN_PIT' ? '⛏' :
                        site.site_type === 'UNDERGROUND' ? '🔨' :
                          site.site_type === 'ALLUVIAL' ? '💧' : '⚙'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base leading-snug">{site.name}</h4>
                    <p className="text-xs text-gray-500">{site.location}</p>
                  </div>
                </div>

                {/* Infos */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between py-1.5 px-2.5 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">Type</span>
                    <span className="text-xs font-medium text-gray-800">
                      {site.site_type === 'OPEN_PIT' ? 'Ciel ouvert' :
                        site.site_type === 'UNDERGROUND' ? 'Souterrain' :
                          site.site_type === 'ALLUVIAL' ? 'Alluvionnaire' : 'Mixte'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2.5 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">Statut</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${site.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      site.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' :
                        site.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {statusLabels[site.status] || site.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2.5 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500">Coordonnées</span>
                    <span className="text-xs font-mono text-gray-600">
                      {parseFloat(site.latitude).toFixed(4)}°, {parseFloat(site.longitude).toFixed(4)}°
                    </span>
                  </div>
                </div>

                {/* Stats */}
                {(site.personnel_count || site.equipment_count || site.incidents_count) && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {site.personnel_count !== undefined && (
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <UserGroupIcon className="h-4 w-4 mx-auto text-purple-600" />
                        <p className="text-xs font-bold text-purple-700 mt-1">{site.personnel_count}</p>
                        <p className="text-[10px] text-purple-500">Personnel</p>
                      </div>
                    )}
                    {site.equipment_count !== undefined && (
                      <div className="text-center p-2 bg-amber-50 rounded-lg">
                        <CubeIcon className="h-4 w-4 mx-auto text-amber-600" />
                        <p className="text-xs font-bold text-amber-700 mt-1">{site.equipment_count}</p>
                        <p className="text-[10px] text-amber-500">Équipements</p>
                      </div>
                    )}
                    {site.incidents_count !== undefined && (
                      <div className="text-center p-2 bg-red-50 rounded-lg">
                        <ExclamationTriangleIcon className="h-4 w-4 mx-auto text-red-600" />
                        <p className="text-xs font-bold text-red-700 mt-1">{site.incidents_count}</p>
                        <p className="text-[10px] text-red-500">Incidents</p>
                      </div>
                    )}
                  </div>
                )}

                <Link
                  to={`/sites/${site.id}`}
                  className="block w-full text-center py-2.5 px-4 bg-linear-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm"
                >
                  Voir les détails →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marqueurs des Équipements (Tracking Temps Réel) */}
        {assets.filter(a => a.last_latitude && a.last_longitude).map((asset) => (
          <Marker
            key={`asset-${asset.id}`}
            position={[parseFloat(asset.last_latitude), parseFloat(asset.last_longitude)]}
            icon={createAssetIcon(asset.equipment_type, asset.current_speed)}
          >
            <Popup className="custom-popup" maxWidth={250}>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{asset.equipment_type === 'TRUCK' ? '🚚' : '🚆'}</span>
                  <div>
                    <h5 className="font-bold text-xs">{asset.equipment_code}</h5>
                    <p className="text-[10px] text-gray-500">{asset.name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400 uppercase font-black">Vitesse</span>
                    <span className="font-bold text-indigo-600">{asset.current_speed.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400 uppercase font-black">Mis à jour</span>
                    <span className="text-gray-600">{new Date(asset.last_position_update).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedSite && (
          <MapController
            center={[parseFloat(selectedSite.latitude), parseFloat(selectedSite.longitude)]}
            zoom={12}
          />
        )}
      </MapContainer>

      {/* Overlay infos en bas */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-12 sm:right-16 z-1000">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-3 sm:px-5 py-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                <BuildingOffice2Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900">{sites.length}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Sites</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                {sites.filter(s => s.status === 'ACTIVE').length}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">actifs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-xs sm:text-sm font-semibold text-gray-800">
                {sites.filter(s => s.status === 'EXPLORATION').length}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">exploration</span>
            </div>
          </div>

          <Link
            to="/sites"
            className="hidden sm:inline-flex px-4 py-2 bg-linear-to-r from-indigo-600 to-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
          >
            Voir tous →
          </Link>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes marker-pulse {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .custom-marker { background: transparent !important; border: none !important; }
        .region-label  { background: transparent !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,.15); }
        .leaflet-popup-content { margin: 0; min-width: 280px; }
        .leaflet-popup-tip { background: white; }
        .leaflet-container { font-family: inherit; background: #f1f5f9; }
        .leaflet-control-zoom a {
          background: rgba(255,255,255,.95) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0,0,0,.08) !important;
          color: #334155 !important;
          font-weight: 600 !important;
          width: 36px !important; height: 36px !important;
          line-height: 36px !important;
          border-radius: 10px !important;
        }
        .leaflet-control-zoom a:hover { background: white !important; color: #4F46E5 !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,.1) !important; border-radius: 12px !important; overflow: hidden; }

        /* Responsive */
        @media (max-width: 640px) {
          .guinea-map-container { border-radius: 12px; }
          .leaflet-popup-content { min-width: 240px; }
        }
      `}</style>
    </div>
  );
}
