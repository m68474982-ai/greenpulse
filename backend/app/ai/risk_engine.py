"""
EcoShield AI — AI Environmental Risk Engine
Transparent multi-hazard AI risk engine combining deterministic physical thresholds,
weighted anomaly scoring, dynamic AI confidence estimation, and predictive early-warning heuristics.
Designed for modular drop-in replacement with trained PyTorch/scikit-learn models.
"""
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from app.models.models import HazardType, RiskLevel, SensorStatus
from app.schemas.schemas import AIAnalysisResult, SensorReadingBase


class AIRiskEngine:
    """
    Core AI Environmental Risk Engine for EcoShield.
    Evaluates real-time sensor streams and generates:
    - Multi-hazard classification
    - Composite Risk Score (0-100)
    - Dynamic AI Confidence (0-100%)
    - Explicit detection rationale
    - Actionable early-warning protocol
    """

    @staticmethod
    def calculate_risk_level(score: float) -> RiskLevel:
        if score <= 30.0:
            return RiskLevel.LOW
        elif score <= 60.0:
            return RiskLevel.MODERATE
        elif score <= 80.0:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

    @staticmethod
    def calculate_sensor_status(risk_score: float, battery: float = 100.0, signal: int = 90) -> SensorStatus:
        if battery < 10.0 or signal < 15:
            return SensorStatus.OFFLINE
        if risk_score > 80.0:
            return SensorStatus.CRITICAL
        elif risk_score > 60.0:
            return SensorStatus.HIGH_RISK
        elif risk_score > 30.0:
            return SensorStatus.WARNING
        return SensorStatus.NORMAL

    # ---------------- FLOOD RISK CALCULATION ----------------
    @classmethod
    def evaluate_flood_risk(
        cls,
        water_level: Optional[float],
        rainfall: Optional[float],
        river_level: Optional[float] = None,
        water_flow: Optional[float] = None,
        historical_water_level: Optional[float] = None
    ) -> Tuple[float, float, List[str], str]:
        """
        Evaluate flood risk based on hydrological telemetry.
        Returns: (risk_score, ai_confidence, reasons, recommended_action)
        """
        score = 0.0
        reasons = []
        confidence_factors = []

        # Water level analysis (Safe: < 2.0m, Moderate: 2.0-3.5m, Danger: 3.5-4.5m, Critical: >4.5m)
        if water_level is not None:
            confidence_factors.append(0.95)
            if water_level >= 4.5:
                score += 55.0
                reasons.append(f"Water level reached critical threshold of {water_level:.2f} m (Threshold: 4.5m)")
            elif water_level >= 3.5:
                score += 40.0
                reasons.append(f"Water level in high danger zone at {water_level:.2f} m")
            elif water_level >= 2.5:
                score += 25.0
                reasons.append(f"Water level elevated at {water_level:.2f} m")
            elif water_level >= 1.8:
                score += 10.0

            # Delta / Rate of rise
            if historical_water_level is not None:
                delta = water_level - historical_water_level
                if delta > 0.5:
                    score += 20.0
                    reasons.append(f"Rapid water level surge detected: +{delta:.2f} m over baseline")
                elif delta > 0.2:
                    score += 10.0
                    reasons.append(f"Steady water level rise: +{delta:.2f} m over baseline")

        # Rainfall rate analysis (mm/hr)
        if rainfall is not None:
            confidence_factors.append(0.92)
            if rainfall >= 80.0:
                score += 35.0
                reasons.append(f"Torrential rainfall intensity recorded at {rainfall:.1f} mm/hr")
            elif rainfall >= 50.0:
                score += 25.0
                reasons.append(f"Heavy downpour of {rainfall:.1f} mm/hr")
            elif rainfall >= 25.0:
                score += 15.0
                reasons.append(f"Moderate persistent rainfall: {rainfall:.1f} mm/hr")

        # Water flow / River level amplification
        if water_flow is not None and water_flow > 150.0:
            score += 10.0
            reasons.append(f"High discharge velocity: {water_flow:.1f} m³/s")
            confidence_factors.append(0.90)

        risk_score = min(100.0, max(0.0, score))
        ai_confidence = sum(confidence_factors) / len(confidence_factors) * 100.0 if confidence_factors else 85.0
        # Boost confidence when multiple indicators correlate
        if len(confidence_factors) >= 2 and risk_score > 60:
            ai_confidence = min(98.0, ai_confidence + 4.0)

        # Action logic
        if risk_score >= 80.0:
            action = "CRITICAL: Issue immediate Tier-1 evacuation alerts for low-lying settlements; deploy NDRF rescue boats and open emergency spillway gates."
        elif risk_score >= 60.0:
            action = "HIGH ALERT: Pre-position disaster response teams at flood shelters, sound community sirens, and halt riverside traffic."
        elif risk_score >= 30.0:
            action = "ADVISORY: Intensify telemetry sampling interval to 30 seconds; alert regional flood control cell and monitor downstream discharge."
        else:
            action = "NORMAL: Routine hydrological baseline monitoring active."

        return risk_score, round(ai_confidence, 1), reasons, action

    # ---------------- FOREST FIRE RISK CALCULATION ----------------
    @classmethod
    def evaluate_forest_fire_risk(
        cls,
        temperature: Optional[float],
        humidity: Optional[float],
        smoke: Optional[float],
        co: Optional[float] = None,
        flame_detected: Optional[bool] = None,
        wind_speed: Optional[float] = None
    ) -> Tuple[float, float, List[str], str]:
        score = 0.0
        reasons = []
        confidence_factors = []

        # Direct optical flame detector
        if flame_detected:
            score += 65.0
            reasons.append("Active optical flame radiation detected by IR node")
            confidence_factors.append(0.98)

        # Smoke optical density (ppm or raw analog index 0-1000)
        if smoke is not None:
            confidence_factors.append(0.94)
            if smoke >= 400.0:
                score += 35.0
                reasons.append(f"Dense combustion particulates / smoke index: {smoke:.0f} ppm")
            elif smoke >= 200.0:
                score += 20.0
                reasons.append(f"Elevated atmospheric smoke concentration: {smoke:.0f} ppm")

        # Atmospheric fire weather index conditions
        if temperature is not None and humidity is not None:
            confidence_factors.append(0.91)
            if temperature >= 40.0 and humidity <= 20.0:
                score += 30.0
                reasons.append(f"Extreme fire weather conditions: Temp {temperature:.1f}°C, Relative Humidity {humidity:.1f}%")
            elif temperature >= 36.0 and humidity <= 30.0:
                score += 20.0
                reasons.append(f"High thermal dryness: Temp {temperature:.1f}°C, Relative Humidity {humidity:.1f}%")

        # Wind speed spread factor (km/h)
        if wind_speed is not None and wind_speed > 25.0:
            score += 15.0
            reasons.append(f"Strong gusting wind ({wind_speed:.1f} km/h) capable of accelerating wildfire spread")
            confidence_factors.append(0.88)

        # Toxic combustion gas CO (ppm)
        if co is not None and co > 15.0:
            score += 15.0
            reasons.append(f"High carbon monoxide byproduct ({co:.1f} ppm) detected")
            confidence_factors.append(0.90)

        risk_score = min(100.0, max(0.0, score))
        ai_confidence = sum(confidence_factors) / len(confidence_factors) * 100.0 if confidence_factors else 86.0
        if flame_detected or (smoke and smoke > 350 and temperature and temperature > 38):
            ai_confidence = min(99.0, ai_confidence + 5.0)

        if risk_score >= 80.0:
            action = "CRITICAL: Deploy aerial firefighting helicopters and forest department quick response teams; enforce immediate buffer-zone evacuation."
        elif risk_score >= 60.0:
            action = "HIGH ALERT: Dispatch ground fire tenders to sector coordinates, establish containment firebreaks, and alert wildlife rangers."
        elif risk_score >= 30.0:
            action = "ADVISORY: Issue forest dry-season advisory, suspend controlled burn permits, and increase thermal satellite monitoring."
        else:
            action = "NORMAL: Forest thermal and air metrics within benign baseline."

        return risk_score, round(ai_confidence, 1), reasons, action

    # ---------------- AIR POLLUTION RISK CALCULATION ----------------
    @classmethod
    def evaluate_air_pollution_risk(
        cls,
        pm25: Optional[float],
        pm10: Optional[float],
        co: Optional[float] = None,
        no2: Optional[float] = None,
        so2: Optional[float] = None,
        voc: Optional[float] = None
    ) -> Tuple[float, float, List[str], str]:
        score = 0.0
        reasons = []
        confidence_factors = []

        # PM2.5 calculation (µg/m³) - CPCB standards (0-30 Good, 31-60 Satisfactory, 61-90 Moderate, 91-120 Poor, 121-250 Very Poor, >250 Severe)
        if pm25 is not None:
            confidence_factors.append(0.96)
            if pm25 >= 250.0:
                score += 55.0
                reasons.append(f"Severe PM2.5 particulate toxicity: {pm25:.1f} µg/m³ (CPCB Limit: 60)")
            elif pm25 >= 150.0:
                score += 40.0
                reasons.append(f"Hazardous PM2.5 concentration: {pm25:.1f} µg/m³")
            elif pm25 >= 90.0:
                score += 25.0
                reasons.append(f"Unhealthy PM2.5 level: {pm25:.1f} µg/m³")
            elif pm25 >= 60.0:
                score += 15.0
                reasons.append(f"Elevated PM2.5: {pm25:.1f} µg/m³")

        # PM10 calculation (µg/m³)
        if pm10 is not None:
            confidence_factors.append(0.93)
            if pm10 >= 350.0:
                score += 30.0
                reasons.append(f"Critical respirable PM10 dust loading: {pm10:.1f} µg/m³")
            elif pm10 >= 200.0:
                score += 20.0
                reasons.append(f"High PM10 particulate reading: {pm10:.1f} µg/m³")

        # NO2 / SO2 industrial pollutants (ppb / µg/m³)
        if no2 is not None and no2 >= 80.0:
            score += 15.0
            reasons.append(f"Elevated Nitrogen Dioxide (NO2): {no2:.1f} µg/m³")
            confidence_factors.append(0.89)

        if so2 is not None and so2 >= 80.0:
            score += 15.0
            reasons.append(f"Sulfur Dioxide spike (SO2): {so2:.1f} µg/m³")
            confidence_factors.append(0.89)

        if voc is not None and voc >= 2.5:
            score += 10.0
            reasons.append(f"High Volatile Organic Compounds (VOC): {voc:.2f} ppm")
            confidence_factors.append(0.85)

        risk_score = min(100.0, max(0.0, score))
        ai_confidence = sum(confidence_factors) / len(confidence_factors) * 100.0 if confidence_factors else 88.0

        if risk_score >= 80.0:
            action = "CRITICAL (GRAP Stage IV): Shut down non-essential polluting industries, restrict diesel transit, issue N95 mask health advisories for all citizens."
        elif risk_score >= 60.0:
            action = "HIGH ALERT (GRAP Stage III): Enforce construction bans, deploy automated mist-cannons, advise vulnerable demographics to stay indoors."
        elif risk_score >= 30.0:
            action = "MODERATE: Intensify mechanical road sweeping and anti-smog guns; monitor industrial emission corridors."
        else:
            action = "NORMAL: Ambient air quality indices within safe national ambient standards."

        return risk_score, round(ai_confidence, 1), reasons, action

    # ---------------- EXTREME HEAT & WEATHER RISK ----------------
    @classmethod
    def evaluate_extreme_heat_risk(
        cls,
        temperature: Optional[float],
        humidity: Optional[float],
        wind_speed: Optional[float] = None
    ) -> Tuple[float, float, List[str], str]:
        score = 0.0
        reasons = []
        confidence_factors = [0.93]

        if temperature is not None:
            if temperature >= 45.0:
                score += 60.0
                reasons.append(f"Extreme heatwave threshold breached: {temperature:.1f}°C")
            elif temperature >= 42.0:
                score += 45.0
                reasons.append(f"Severe heatwave conditions: {temperature:.1f}°C")
            elif temperature >= 38.0:
                score += 25.0
                reasons.append(f"Elevated thermal stress: {temperature:.1f}°C")

        # Heat Index amplification if high humidity
        if temperature is not None and humidity is not None:
            confidence_factors.append(0.95)
            if temperature >= 36.0 and humidity >= 65.0:
                score += 25.0
                reasons.append(f"High wet-bulb thermal discomfort (Temp {temperature:.1f}°C + Humidity {humidity:.1f}%)")

        risk_score = min(100.0, max(0.0, score))
        ai_confidence = sum(confidence_factors) / len(confidence_factors) * 100.0

        if risk_score >= 80.0:
            action = "CRITICAL: Trigger municipal Red Heat Code; open air-conditioned cooling centers and mandate midday outdoor labor suspension."
        elif risk_score >= 60.0:
            action = "ORANGE ALERT: Stock emergency ORS distribution booths, issue heatstroke warnings, ensure power grid cooling resilience."
        elif risk_score >= 30.0:
            action = "YELLOW ADVISORY: Public hydration guidance broadcast across local civic channels."
        else:
            action = "NORMAL: Ambient thermal metrics within normal seasonal range."

        return risk_score, round(ai_confidence, 1), reasons, action

    # ---------------- COMPOSITE MULTI-MODAL EVALUATOR ----------------
    @classmethod
    def analyze_sensor_reading(
        cls,
        reading: SensorReadingBase,
        battery: float = 100.0,
        signal_strength: int = 90,
        historical_baseline: Optional[Dict[str, float]] = None
    ) -> AIAnalysisResult:
        """
        Evaluates a sensor reading across all environmental vectors
        and determines primary hazard, risk score, and status.
        """
        # 1. Evaluate individual hazard domains
        flood_score, flood_conf, flood_reasons, flood_action = cls.evaluate_flood_risk(
            water_level=reading.water_level,
            rainfall=reading.rainfall,
            river_level=reading.river_level,
            water_flow=reading.water_flow,
            historical_water_level=historical_baseline.get("water_level") if historical_baseline else None
        )

        fire_score, fire_conf, fire_reasons, fire_action = cls.evaluate_forest_fire_risk(
            temperature=reading.temperature,
            humidity=reading.humidity,
            smoke=reading.smoke,
            co=reading.co,
            flame_detected=reading.flame_detected,
            wind_speed=reading.wind_speed
        )

        pollution_score, pol_conf, pol_reasons, pol_action = cls.evaluate_air_pollution_risk(
            pm25=reading.pm25,
            pm10=reading.pm10,
            co=reading.co,
            no2=reading.no2,
            so2=reading.so2,
            voc=reading.voc
        )

        heat_score, heat_conf, heat_reasons, heat_action = cls.evaluate_extreme_heat_risk(
            temperature=reading.temperature,
            humidity=reading.humidity,
            wind_speed=reading.wind_speed
        )

        # 2. Pick dominant hazard
        scores = [
            (flood_score, HazardType.FLOOD, flood_conf, flood_reasons, flood_action),
            (fire_score, HazardType.FOREST_FIRE, fire_conf, fire_reasons, fire_action),
            (pollution_score, HazardType.AIR_POLLUTION, pol_conf, pol_reasons, pol_action),
            (heat_score, HazardType.EXTREME_HEAT, heat_conf, heat_reasons, heat_action),
        ]
        dominant = max(scores, key=lambda x: x[0])
        max_score, hazard_type, ai_conf, reasons, action = dominant

        # Default reasons if benign
        if not reasons:
            reasons = ["All parameters currently operating within normal environmental baselines."]

        risk_level = cls.calculate_risk_level(max_score)
        sensor_status = cls.calculate_sensor_status(max_score, battery, signal_strength)
        anomaly_detected = max_score > 50.0

        return AIAnalysisResult(
            hazard_type=hazard_type,
            risk_score=round(max_score, 1),
            risk_level=risk_level,
            ai_confidence=round(ai_conf, 1),
            detection_reasons=reasons,
            recommended_action=action,
            anomaly_detected=anomaly_detected,
            sensor_status=sensor_status
        )
