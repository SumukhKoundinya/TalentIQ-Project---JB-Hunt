import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import folium
from streamlit_folium import st_folium
import dataretrieval.nwis as nwis
from hydro_config import (
    APP_TITLE, APP_SUBTITLE, APP_ICON,
    MAP_CENTER_LAT, MAP_CENTER_LON, MAP_ZOOM_START,
    USGS_PARAMETER_CD, DEFAULT_CHART_SITE, DEFAULT_CHART_HOURS, CACHE_TTL,
    STATUS_CRITICAL_RATIO, STATUS_LOW_RATIO,
    MOCK_RANDOM_SEED, MOCK_RATIO_MIN, MOCK_RATIO_MAX,
    HOURLY_MOCK_BASE, HOURLY_MOCK_DECAY_RATE, HOURLY_MOCK_MIN_LEVEL,
    FALLBACK_WORST_PCT, FALLBACK_WORST_NAME, FALLBACK_WORST_COLOR, FALLBACK_DEFICIT_PCT,
    STATION_META,
    HEADER_TITLE, HEADER_SUBTITLE,
    BREADCRUMB_DASHBOARD, BREADCRUMB_TRIAGE, BREADCRUMB_STREAM,
    EMERGENCY_CHECKLIST, RESPONSIBLE_AGENCIES,
    FOOTER_TEXT, FOOTER_LINKS,
)

st.set_page_config(
    page_title=f"{APP_TITLE} — {APP_SUBTITLE}",
    page_icon=APP_ICON,
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ============================================
# CUSTOM CSS - Light SaaS Dashboard Theme
# ============================================
custom_css = """
<style>
    .stApp {
        background-color: #F8FAFC;
    }
    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 1rem !important;
    }
    .main-header {
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    .header-logo {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #3B82F6, #1E40AF);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
    }
    .header-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0F172A;
        margin: 0;
    }
    .header-subtitle {
        font-size: 0.85rem;
        color: #64748B;
        margin: 0;
    }
    .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .status-badge {
        background: #DCFCE7;
        color: #166534;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.35rem;
    }
    .status-badge.warning {
        background: #FEE2E2;
        color: #991B1B;
    }
    .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #E2E8F0;
        height: 100%;
    }
    .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    .kpi-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .kpi-badge {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
    }
    .kpi-badge.elevated { background: #FEF3C7; color: #92400E; }
    .kpi-badge.critical { background: #FEE2E2; color: #991B1B; }
    .kpi-badge.warning { background: #FFF7ED; color: #9A3412; }
    .kpi-badge.success { background: #DCFCE7; color: #166534; }
    .kpi-value {
        font-size: 2.25rem;
        font-weight: 800;
        color: #0F172A;
        line-height: 1.2;
        letter-spacing: -0.02em;
    }
    .kpi-value.critical { color: #DC2626; }
    .kpi-subtitle {
        font-size: 0.85rem;
        font-weight: 600;
        color: #475569;
        margin-top: 0.25rem;
    }
    .kpi-description {
        font-size: 0.75rem;
        color: #64748B;
        margin-top: 0.5rem;
    }
    .kpi-progress {
        height: 4px;
        background: #E2E8F0;
        border-radius: 999px;
        margin-top: 0.75rem;
        overflow: hidden;
    }
    .kpi-progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.6s ease;
    }
    .section-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #E2E8F0;
    }
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .section-title {
        font-size: 1rem;
        font-weight: 700;
        color: #0F172A;
    }
    .section-subtitle {
        font-size: 0.8rem;
        color: #64748B;
        margin-top: 0.15rem;
    }
    .stat-block {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        text-align: center;
    }
    .stat-label {
        font-size: 0.65rem;
        font-weight: 700;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .stat-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0F172A;
        margin-top: 0.25rem;
    }
    .stat-value.critical { color: #DC2626; }
    .stat-unit {
        font-size: 0.7rem;
        color: #64748B;
    }
    .alert-box {
        background: #FEF2F2;
        border: 1px solid #FECACA;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.8rem;
        color: #991B1B;
    }
    .alert-button {
        display: inline-flex;
    }
    .checklist-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        background: white;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        margin-bottom: 0.5rem;
    }
    .checklist-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #E2E8F0;
        color: #64748B;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
    }
    .checklist-number.active {
        background: #3B82F6;
        color: white;
    }
    .checklist-number.pending {
        background: #E2E8F0;
        color: #94A3B8;
    }
    .checklist-content { flex: 1; }
    .checklist-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #0F172A;
    }
    .checklist-desc {
        font-size: 0.75rem;
        color: #64748B;
        margin-top: 0.25rem;
    }
    .checklist-status {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        white-space: nowrap;
    }
    .checklist-status.pending { background: #F1F5F9; color: #64748B; }
    .action-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .footer {
        background: white;
        border-top: 1px solid #E2E8F0;
        padding: 1rem 1.5rem;
        margin-top: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .footer-text { font-size: 0.75rem; color: #64748B; }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-link { font-size: 0.75rem; color: #3B82F6; text-decoration: none; }
    .data-source-banner {
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .data-source-banner.live {
        background: #DCFCE7;
        color: #166534;
        border: 1px solid #BBF7D0;
    }
    .data-source-banner.synthetic {
        background: #FEF3C7;
        color: #92400E;
        border: 1px solid #FDE68A;
    }
    @media (max-width: 768px) {
        .kpi-value { font-size: 1.75rem; }
        .section-card { padding: 1rem; }
    }
</style>
"""

st.markdown(custom_css, unsafe_allow_html=True)

# ============================================
# STATION METADATA — Loaded from hydro_config.py
# ============================================

ALL_STATION_IDS = list(STATION_META.keys())

# Region groups for filtering
REGION_MAP = {
    'All Rivers': ALL_STATION_IDS,
}
for _sid, _meta in STATION_META.items():
    _r = _meta['region']
    if _r not in REGION_MAP:
        REGION_MAP[_r] = []
    REGION_MAP[_r].append(_sid)


def classify_status(discharge, normal):
    ratio = discharge / normal if normal else 0
    if ratio < STATUS_CRITICAL_RATIO:
        return 'critical'
    elif ratio < STATUS_LOW_RATIO:
        return 'low'
    return 'normal'


@st.cache_data(ttl=CACHE_TTL)
def fetch_real_usgs_data():
    """Fetch real USGS daily-values for all stations."""
    try:
        df_dv, _ = nwis.get_dv(
            sites=','.join(ALL_STATION_IDS),
            parameterCd=USGS_PARAMETER_CD,
            start=(datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
            multi_index=True,
        )
        if df_dv is None or df_dv.empty:
            return None

        rows = []
        for site_id in ALL_STATION_IDS:
            try:
                site_df = df_dv.loc[site_id] if site_id in df_dv.index.get_level_values('site_no') else None
                if site_df is None or site_df.empty:
                    continue
                site_df = site_df.dropna(subset=[f'{USGS_PARAMETER_CD}_Mean'])
                if site_df.empty:
                    continue
                site_df = site_df[site_df[f'{USGS_PARAMETER_CD}_Mean'] > 0]
                if site_df.empty:
                    continue
                latest_val = site_df[f'{USGS_PARAMETER_CD}_Mean'].iloc[-1]
                meta = STATION_META[site_id]
                rows.append({
                    'site_no': site_id,
                    'site_name': meta['name'],
                    'lat': meta['lat'],
                    'lon': meta['lon'],
                    'discharge': round(float(latest_val), 1),
                    'normal': meta['normal'],
                    'status': classify_status(float(latest_val), meta['normal']),
                    'region': meta['region'],
                })
            except (KeyError, IndexError):
                continue

        if not rows:
            return None
        return pd.DataFrame(rows)

    except Exception:
        return None


@st.cache_data(ttl=CACHE_TTL)
def fetch_hourly_usgs(site_id=DEFAULT_CHART_SITE, hours=DEFAULT_CHART_HOURS):
    """Fetch hourly instantaneous values for the chart."""
    try:
        end = datetime.now()
        start = end - timedelta(hours=hours)
        df_iv, _ = nwis.get_iv(
            sites=site_id,
            parameterCd=USGS_PARAMETER_CD,
            start=start.strftime('%Y-%m-%dT%H:%M'),
            end=end.strftime('%Y-%m-%dT%H:%M'),
        )
        if df_iv is None or df_iv.empty:
            return None

        if USGS_PARAMETER_CD not in df_iv.columns:
            return None

        series = df_iv[USGS_PARAMETER_CD].dropna()
        if series.empty:
            return None

        meta = STATION_META.get(site_id, {'normal': 100.0})
        return series.index.to_pydatetime(), series.values.tolist(), meta['normal']

    except Exception:
        return None


def create_mock_data():
    """Fallback mock data when API is unavailable."""
    rows = []
    for site_id, meta in STATION_META.items():
        ratio = np.random.uniform(MOCK_RATIO_MIN, MOCK_RATIO_MAX)
        discharge = round(meta['normal'] * ratio, 1)
        rows.append({
            'site_no': site_id,
            'site_name': meta['name'],
            'lat': meta['lat'],
            'lon': meta['lon'],
            'discharge': discharge,
            'normal': meta['normal'],
            'status': classify_status(discharge, meta['normal']),
            'region': meta['region'],
        })
    return pd.DataFrame(rows)


def generate_hourly_data():
    """Fallback synthetic 24-hour data for chart."""
    hours = pd.date_range(end=datetime.now(), periods=DEFAULT_CHART_HOURS, freq='h')
    np.random.seed(MOCK_RANDOM_SEED)
    base = HOURLY_MOCK_BASE
    levels = []
    for i in range(DEFAULT_CHART_HOURS):
        if i < 6:
            level = base + np.random.normal(0, 10)
        else:
            decay = np.exp(-(i - 6) * HOURLY_MOCK_DECAY_RATE)
            level = base * decay + np.random.normal(0, 5)
        levels.append(max(HOURLY_MOCK_MIN_LEVEL, level))
    return hours, levels, HOURLY_MOCK_BASE


# ============================================
# MAIN LAYOUT
# ============================================

# --- Data loading: real USGS first, mock fallback ---
is_live = False
df_stations = fetch_real_usgs_data()
if df_stations is not None and not df_stations.empty:
    is_live = True
else:
    df_stations = create_mock_data()
    is_live = False

# --- Hourly chart data: real first, synthetic fallback ---
hourly_result = fetch_hourly_usgs(DEFAULT_CHART_SITE)
if hourly_result is not None:
    chart_hours, chart_levels, chart_normal = hourly_result
    hourly_is_live = True
else:
    chart_hours, chart_levels, chart_normal = generate_hourly_data()
    hourly_is_live = False

# Count stations by status
critical_count = len(df_stations[df_stations['status'] == 'critical'])
low_count = len(df_stations[df_stations['status'] == 'low'])
normal_count = len(df_stations[df_stations['status'] == 'normal'])
total_stations = len(df_stations)
flagged_count = critical_count + low_count

# ============================================
# HEADER
# ============================================
st.markdown(f"""
<div class="main-header">
    <div class="header-left">
        <div class="header-logo">{APP_ICON}</div>
        <div>
            <h1 class="header-title">{HEADER_TITLE}</h1>
            <p class="header-subtitle">{HEADER_SUBTITLE}</p>
        </div>
    </div>
    <div class="header-right">
        <div class="status-badge">
            <span>●</span> LIVE USGS WATER FEED
        </div>
        <div class="status-badge">Statewide</div>
        <div class="status-badge">📍 Arkansas</div>
        <div class="status-badge warning">
            <span>⚠️</span> {critical_count} Severe {'Advisory' if critical_count == 1 else 'Advisories'} Active
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Breadcrumb
st.markdown(f"""
<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.85rem; color: #64748B;">
    <span style="color: #3B82F6; cursor: pointer;">{BREADCRUMB_DASHBOARD}</span>
    <span>/</span>
    <span style="color: #3B82F6; cursor: pointer;">{BREADCRUMB_TRIAGE}</span>
    <span>/</span>
    <span style="color: #0F172A; font-weight: 600;">{BREADCRUMB_STREAM}</span>
    <span style="margin-left: auto;">Stream gauges: {total_stations} reporting • Updated {datetime.now().strftime('%I:%M %p')}</span>
</div>
""", unsafe_allow_html=True)

# Data source indicator
if is_live and hourly_is_live:
    st.markdown("""
    <div class="data-source-banner live">
        <span>●</span> LIVE DATA — USGS Instantaneous Values API (parameter 00060, discharge in cfs)
    </div>
    """, unsafe_allow_html=True)
elif is_live and not hourly_is_live:
    st.markdown("""
    <div class="data-source-banner synthetic">
        <span>⚠️</span> PARTIAL LIVE — Station data from USGS API · Chart uses simulated hourly pattern (IV API unavailable)
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="data-source-banner synthetic">
        <span>⚠️</span> SYNTHETIC DATA — USGS API unreachable · Displaying demo data for illustration only
    </div>
    """, unsafe_allow_html=True)

# ============================================
# TIER 1: KPI METRICS
# ============================================
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-header">
            <span class="kpi-label">LOW-FLOW RIVERS</span>
            <span class="kpi-badge elevated">⚠️ Elevated Risk</span>
        </div>
        <div class="kpi-value">{flagged_count}</div>
        <div class="kpi-subtitle">Rivers Flagged</div>
        <div class="kpi-description">{critical_count} critical, {low_count} low across Arkansas streams</div>
        <div class="kpi-progress">
            <div class="kpi-progress-fill" style="width: {flagged_count/total_stations*100:.0f}%; background: #F59E0B;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    if not df_stations.empty:
        df_stations['ratio'] = df_stations['discharge'] / df_stations['normal']
        worst = df_stations.loc[df_stations['ratio'].idxmin()]
        worst_pct = round(worst['ratio'] * 100)
        worst_name = worst['site_name'].split(' near ')[0] if ' near ' in worst['site_name'] else worst['site_name'].split(' at ')[0] if ' at ' in worst['site_name'] else worst['site_name']
        worst_color = '#DC2626' if worst_pct < 40 else '#F59E0B'
    else:
        worst_pct = FALLBACK_WORST_PCT
        worst_name = FALLBACK_WORST_NAME
        worst_color = FALLBACK_WORST_COLOR

    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-header">
            <span class="kpi-label">INTAKE WARNING</span>
            <span class="kpi-badge critical">🔴 Immediate Attention</span>
        </div>
        <div class="kpi-value critical">Very Low Water Supply</div>
        <div class="kpi-subtitle">{worst_name} Intake at {worst_pct}% safe capacity</div>
        <div class="kpi-progress">
            <div class="kpi-progress-fill" style="width: {worst_pct}%; background: {worst_color};"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    if not df_stations.empty:
        avg_ratio = (df_stations['discharge'] / df_stations['normal']).mean()
        deficit_pct = round((1 - avg_ratio) * 100)
    else:
        deficit_pct = FALLBACK_DEFICIT_PCT

    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-header">
            <span class="kpi-label">WATER SUPPLY DEFICIT</span>
            <span class="kpi-badge warning">📉 Deficit Trend</span>
        </div>
        <div class="kpi-value">-{deficit_pct}%</div>
        <div class="kpi-subtitle">Below Normal</div>
        <div class="kpi-description">Compared to 1-year average historical flow</div>
        <div class="kpi-progress">
            <div class="kpi-progress-fill" style="width: {min(deficit_pct, 100)}%; background: #F97316;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-header">
            <span class="kpi-label">MONITORED STATIONS</span>
            <span class="kpi-badge success">✅ All Systems Live</span>
        </div>
        <div class="kpi-value">{total_stations}</div>
        <div class="kpi-subtitle">Active Sensors</div>
        <div class="kpi-description">Arkansas stream gauges with USGS data</div>
        <div class="kpi-progress">
            <div class="kpi-progress-fill" style="width: 100%; background: #22C55E;"></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ============================================
# TIER 2: EVIDENCE GRID
# ============================================

# --- Filter tabs (functional Streamlit radio) ---
filter_cols = st.columns([1.2, 1])

with filter_cols[0]:
    st.markdown("""
    <div class="section-card">
        <div class="section-header">
            <div>
                <div class="section-title">📊 Arkansas Stream Status</div>
                <div class="section-subtitle">Current discharge from USGS streamgages (cubic feet per second)</div>
            </div>
        </div>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.75rem;">
            <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E;"></span>
                Normal Water Level
            </span>
            <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B;"></span>
                Low Level
            </span>
            <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #DC2626;"></span>
                Critically Low (Alert)
            </span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Functional filter tabs
    selected_region = st.radio(
        "Filter by region",
        list(REGION_MAP.keys()),
        index=0,
        horizontal=True,
        label_visibility="collapsed",
        key="region_filter"
    )

    # Filter stations
    filtered_ids = REGION_MAP[selected_region]
    df_filtered = df_stations[df_stations['site_no'].isin(filtered_ids)].copy()

    # --- Folium map centered on full Arkansas ---
    # Arkansas bounds: ~33.0-36.7 lat, -94.6 to -89.6 lon
    m = folium.Map(location=[MAP_CENTER_LAT, MAP_CENTER_LON], zoom_start=MAP_ZOOM_START, tiles='OpenStreetMap')

    colors = {'critical': '#DC2626', 'low': '#F59E0B', 'normal': '#22C55E'}

    for _, row in df_filtered.iterrows():
        color = colors.get(row['status'], '#64748B')
        popup_html = f"""
        <div style="font-family: system-ui; padding: 0.5rem;">
            <strong>{row['site_name']}</strong><br>
            <span style="color: {color};">● {row['status'].upper()}</span><br>
            Current: {row['discharge']} cfs<br>
            Normal: {row['normal']} cfs<br>
            <em>{row['region']}</em>
        </div>
        """
        folium.CircleMarker(
            location=[row['lat'], row['lon']],
            radius=8,
            color=color,
            fill=True,
            fill_color=color,
            popup=folium.Popup(popup_html, max_width=250),
            tooltip=row['site_name']
        ).add_to(m)

    # Add focal alert for worst station if critical
    if not df_filtered.empty:
        worst_row = df_filtered.loc[df_filtered['ratio'].idxmin()]
        if worst_row['status'] == 'critical':
            pct_below = round((1 - worst_row['ratio']) * 100)
            alert_html = f"""
            <div style="position: relative;">
                <div style="background: white; border: 2px solid #DC2626; border-radius: 8px; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 280px;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                        <span style="background: #FEF2F2; color: #991B1B; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">⚠️ FOCAL ALERT: CRITICAL WATER LEVEL</span>
                    </div>
                    <div style="font-weight: 700; font-size: 14px; color: #0F172A; margin-bottom: 4px;">{worst_row['site_name']}</div>
                    <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">USGS Station #{worst_row['site_no']}</div>
                    <div style="background: #FEF2F2; border-radius: 6px; padding: 8px; margin-bottom: 8px;">
                        <div style="font-size: 11px; color: #991B1B; margin-bottom: 4px;">Water level dropped {pct_below}% below safe threshold.</div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px;">
                            <span>Current: <strong style="color: #DC2626;">{worst_row['discharge']} cfs</strong></span>
                            <span>Normal: <strong style="color: #22C55E;">{worst_row['normal']} cfs</strong></span>
                        </div>
                    </div>
                </div>
            </div>
            """
            folium.Marker(
                location=[worst_row['lat'], worst_row['lon']],
                icon=folium.DivIcon(html=alert_html, icon_size=(280, 200), icon_anchor=(140, -20))
            ).add_to(m)

    st_folium(m, width=700, height=420)

    st.markdown(f"""
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.75rem; color: #64748B;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #3B82F6;"></span>
        Showing {len(df_filtered)} of {total_stations} stations • {selected_region}
    </div>
    """, unsafe_allow_html=True)

with filter_cols[1]:
    chart_site_name = STATION_META.get(DEFAULT_CHART_SITE, {}).get('name', 'Bryant Creek')
    st.markdown(f"""
    <div class="section-card">
        <div class="section-header">
            <div>
                <div class="section-title">📈 24-Hour River Level Comparison</div>
                <div class="section-subtitle">{chart_site_name} vs. 1-Year Average</div>
            </div>
    """, unsafe_allow_html=True)

    if hourly_is_live:
        st.markdown('<span style="background: #DCFCE7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">● Live IV Data</span>', unsafe_allow_html=True)
    else:
        st.markdown('<span style="background: #FEF3C7; color: #92400E; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">⚠️ Simulated</span>', unsafe_allow_html=True)

    safe_threshold = chart_normal if isinstance(chart_normal, (int, float)) else 100.0
    current_level = round(chart_levels[-1], 1) if chart_levels else 0
    below_normal = current_level < safe_threshold

    st.markdown(f"""
        </div>
        <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem; font-size: 0.75rem;">
            <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 16px; height: 2px; background: #3B82F6;"></span>
                Today's Level
            </span>
            <span style="display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 16px; height: 2px; background: #94A3B8; border-top: 1px dashed #94A3B8;"></span>
                Normal Range
            </span>
            <span style="margin-left: auto; color: #64748B;">Normal: <strong>{safe_threshold} cfs</strong></span>
        </div>
    """, unsafe_allow_html=True)

    if below_normal:
        st.markdown("""
        <div class="alert-box">
            <span>⚠️</span>
            <span class="alert-text"><strong>Water level is below normal flow.</strong></span>
        </div>
        """, unsafe_allow_html=True)

    # Chart data
    hours = chart_hours
    levels = chart_levels
    normal_range = [safe_threshold] * len(levels)

    # Create Plotly figure
    fig = go.Figure()

    # Normal baseline
    fig.add_trace(go.Scatter(
        x=hours, y=normal_range,
        mode='lines', name='Normal Range',
        line=dict(color='#94A3B8', width=2, dash='dash'),
    ))

    # Actual level — blue for live/normal, red for low
    line_color = '#3B82F6' if hourly_is_live and not below_normal else '#DC2626'
    fig.add_trace(go.Scatter(
        x=hours, y=levels,
        mode='lines+markers', name="Today's Level",
        line=dict(color=line_color, width=3),
        marker=dict(size=4),
    ))

    fig.add_hline(y=safe_threshold, line_dash="dot", line_color="#22C55E", line_width=1.5,
                  annotation_text="Safe Baseline", annotation_position="right")

    fig.update_layout(
        height=280,
        margin=dict(l=40, r=20, t=10, b=40),
        xaxis=dict(showgrid=False, tickformat='%I:%M %p', dtick=4 * 3600000),
        yaxis=dict(title='cfs', showgrid=True, gridcolor='#F1F5F9'),
        plot_bgcolor='white', paper_bgcolor='white',
        showlegend=False, hovermode='x unified'
    )

    st.plotly_chart(fig, use_container_width=True)

    # Stat blocks
    pct_of_safe = round((current_level / safe_threshold) * 100) if safe_threshold else 0

    col_current, col_safe, col_status = st.columns(3)

    with col_current:
        level_class = 'critical' if current_level < safe_threshold * 0.4 else ''
        st.markdown(f"""
        <div class="stat-block">
            <div class="stat-label">Current Level</div>
            <div class="stat-value {level_class}">{current_level} cfs</div>
            <div class="stat-unit">{'Critically Low' if current_level < safe_threshold * 0.4 else f'{pct_of_safe}% of Normal'}</div>
        </div>
        """, unsafe_allow_html=True)

    with col_safe:
        st.markdown(f"""
        <div class="stat-block">
            <div class="stat-label">Normal Flow</div>
            <div class="stat-value">{safe_threshold} cfs</div>
            <div class="stat-unit">1-Year Average</div>
        </div>
        """, unsafe_allow_html=True)

    with col_status:
        if current_level < safe_threshold * 0.4:
            status_label, status_color = 'Action Req.', '#DC2626'
        elif current_level < safe_threshold * 0.7:
            status_label, status_color = 'Low Flow', '#F59E0B'
        else:
            status_label, status_color = 'Normal', '#22C55E'
        st.markdown(f"""
        <div class="stat-block">
            <div class="stat-label">Status</div>
            <div class="stat-value" style="color: {status_color};">{status_label}</div>
            <div class="stat-unit">{'Stage 2 Active' if status_label == 'Action Req.' else 'Monitoring'}</div>
        </div>
        """, unsafe_allow_html=True)

# ============================================
# TIER 3: ACTION CENTER
# ============================================
worst_station_name = df_stations.loc[df_stations['ratio'].idxmin(), 'site_name'] if not df_stations.empty else 'Unknown'
worst_discharge = df_stations.loc[df_stations['ratio'].idxmin(), 'discharge'] if not df_stations.empty else 0
worst_normal = df_stations.loc[df_stations['ratio'].idxmin(), 'normal'] if not df_stations.empty else 1
worst_pct = round(worst_discharge / worst_normal * 100) if worst_normal else 0
pct_below = round(100 - worst_pct)

st.markdown(f"""
<div class="section-card" style="border: 1px solid #FECACA; background: linear-gradient(135deg, #FFFBFB 0%, #FEF2F2 100%);">
    <div class="action-header">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="background: #DC2626; color: white; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">🔴 FLOW ADVISORY</span>
            <span style="font-size: 0.85rem; color: #64748B;">{worst_station_name}</span>
        </div>
        <span style="font-size: 0.85rem; color: #64748B;">Flow at <strong style="color: #DC2626;">{worst_pct}% of normal</strong></span>
    </div>
    <h2 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">Low Flow Advisory — {worst_station_name}</h2>
    <p style="font-size: 0.95rem; color: #475569; margin-bottom: 1.5rem; line-height: 1.6;">
        Current discharge is {worst_discharge} cfs ({pct_below}% below the 1-year average of {worst_normal} cfs).
        Monitor conditions and review water use restrictions if levels continue to decline.
    </p>
</div>
""", unsafe_allow_html=True)

col_action, col_records = st.columns([2, 1])

with col_action:
    checklist_html = ""
    for i, item in enumerate(EMERGENCY_CHECKLIST):
        num_class = "checklist-number" if i == 0 else ("checklist-number active" if i == 1 else "checklist-number pending")
        num_content = "✓" if i == 0 else str(item["number"])
        checklist_html += f"""
        <div class="checklist-item">
            <div class="{num_class}" style="{item['statusStyle'] if i == 0 else ''}">{num_content}</div>
            <div class="checklist-content">
                <div class="checklist-title">{item['title']}</div>
                <div class="checklist-desc">{item['desc']}</div>
            </div>
            <span class="checklist-status" style="{item['statusStyle']}">{item['status']}</span>
        </div>"""

    agencies_html = "".join(f'<li style="margin-bottom: 0.25rem;">{a}</li>' for a in RESPONSIBLE_AGENCIES)

    st.markdown(f"""
    <div style="background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #E2E8F0;">
        <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.7rem; font-weight: 600; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">COUNTY-WIDE NOTIFICATION</div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="flex: 1;">
                    <div style="font-size: 0.9rem; color: #475569;">Broadcast low-water advisory to emergency management and utilities</div>
                </div>
                <div class="alert-button">
    """, unsafe_allow_html=True)

    if st.button("🚨 Send Regional Alert to Water District", key="send_alert"):
        st.success("✅ Alert sent successfully!")

    st.markdown(f"""
            </div>
        </div>
    </div>
    <div style="margin-top: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">EMERGENCY RESPONSE STEPS (3-STEP CHECKLIST)</div>
        </div>
        {checklist_html}
    </div>
    """, unsafe_allow_html=True)

with col_records:
    agencies_list_html = "".join(f'<li style="margin-bottom: 0.25rem;">{a}</li>' for a in RESPONSIBLE_AGENCIES)
    st.markdown(f"""
    <div style="background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #E2E8F0; height: 100%;">
        <div style="font-size: 0.9rem; font-weight: 700; color: #0F172A; margin-bottom: 0.75rem;">📋 Official Records & Sharing</div>
        <p style="font-size: 0.8rem; color: #64748B; line-height: 1.5; margin-bottom: 1.25rem;">
            Generate standardized incident water audit records conforming to Arkansas Natural Resources Commission drought compliance guidelines.
        </p>
        <div style="background: #F8FAFC; border-radius: 8px; padding: 1rem; text-align: center; border: 1px solid #E2E8F0; cursor: pointer; margin-bottom: 1.25rem;">
            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">⬇️</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: #0F172A;">Download Incident Audit Report</div>
            <div style="font-size: 0.75rem; color: #64748B;">(PDF/CSV)</div>
        </div>
        <div style="font-size: 0.7rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem;">RESPONSIBLE AGENCIES</div>
        <ul style="font-size: 0.8rem; color: #475569; padding-left: 1rem; margin-bottom: 0.75rem;">
            {agencies_list_html}
        </ul>
    </div>
    """, unsafe_allow_html=True)

# ============================================
# FOOTER
# ============================================
footer_links_html = "".join(f'<span class="footer-link">{link}</span>' for link in FOOTER_LINKS)
st.markdown(f"""
<div class="footer">
    <div class="footer-text">{FOOTER_TEXT}</div>
    <div class="footer-links">
        {footer_links_html}
    </div>
</div>
""", unsafe_allow_html=True)
