// Advanced Analytics Engine TypeScript Types
// Agent 3 - Task 51: Advanced Analytics Engine
// Phase 2 Enterprise Backend Features

import { Database } from './supabase'

// =====================================================
// ANALYTICS CORE TYPES
// =====================================================

export type PartnerAnalytics = {
  id: string
  partner_id: string
  period_start: string
  period_end: string
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  leads_generated: number
  leads_qualified: number
  leads_converted: number
  conversion_rate: number
  total_revenue: number
  total_commission: number
  average_deal_size: number
  response_time_hours: number
  client_satisfaction_score: number
  retention_rate: number
  dashboard_logins: number
  last_activity_date: string | null
  active_days_in_period: number
  ltv_estimate: number
  tier_progression_score: number
  performance_rank: number
  created_at: string
  updated_at: string
}

export type CohortAnalysis = {
  id: string
  cohort_name: string
  cohort_start_date: string
  cohort_end_date: string | null
  cohort_type: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  initial_partner_count: number
  current_active_count: number
  retention_rate: number
  period_1_active: number
  period_2_active: number
  period_3_active: number
  period_6_active: number
  period_12_active: number
  total_cohort_revenue: number
  average_revenue_per_partner: number
  ltv_cohort_average: number
  analysis_date: string
  created_at: string
  updated_at: string
}

export type LTVCalculation = {
  id: string
  partner_id: string
  calculation_date: string
  calculation_method: string
  time_horizon_months: number
  months_active: number
  total_historical_revenue: number
  total_historical_commission: number
  average_monthly_revenue: number
  predicted_ltv: number
  confidence_score: number
  ltv_tier: string
  churn_probability: number
  churn_risk_level: string
  days_since_last_activity: number
  partner_segment: string
  growth_trajectory: string
  created_at: string
  updated_at: string
}

export type PerformanceForecast = {
  id: string
  forecast_type: 'partner_performance' | 'revenue' | 'growth' | 'churn'
  forecast_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  forecast_date: string
  forecast_horizon_months: number
  partner_id: string | null
  segment: string | null
  predicted_value: number
  confidence_interval_lower: number | null
  confidence_interval_upper: number | null
  confidence_level: number
  model_name: string
  model_version: string
  training_data_points: number
  model_accuracy: number
  created_by: string
  created_at: string
  updated_at: string
}

export type AnalyticsSnapshot = {
  id: string
  snapshot_date: string
  snapshot_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  total_partners: number
  active_partners: number
  new_partners_period: number
  churned_partners_period: number
  total_leads: number
  qualified_leads: number
  converted_leads: number
  pipeline_value: number
  total_revenue: number
  total_commissions_paid: number
  average_deal_size: number
  program_conversion_rate: number
  average_time_to_close_days: number
  partner_satisfaction_avg: number
  bronze_partners: number
  silver_partners: number
  gold_partners: number
  platinum_partners: number
  created_at: string
}

// =====================================================
// ANALYTICS DASHBOARD TYPES
// =====================================================

export interface AnalyticsDashboardData {
  overview: {
    total_partners: number
    active_partners: number
    total_revenue: number
    total_commissions: number
    conversion_rate: number
    average_deal_size: number
    growth_rate: number
    churn_rate: number
  }
  performance_trends: {
    revenue_trend: TimeSeriesData[]
    partner_growth_trend: TimeSeriesData[]
    conversion_trend: TimeSeriesData[]
    commission_trend: TimeSeriesData[]
  }
  top_performers: PartnerPerformanceData[]
  cohort_retention: CohortRetentionData[]
  ltv_distribution: LTVDistributionData[]
  forecasts: ForecastData[]
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface PartnerPerformanceData {
  partner_id: string
  partner_name: string
  partner_email: string
  tier: string
  total_revenue: number
  total_commission: number
  conversion_rate: number
  leads_generated: number
  ltv_estimate: number
  performance_rank: number
  growth_trajectory: string
}

export interface CohortRetentionData {
  cohort_name: string
  cohort_start_date: string
  initial_size: number
  retention_rates: {
    period_1: number
    period_2: number
    period_3: number
    period_6: number
    period_12: number
  }
  revenue_per_partner: number
  ltv_average: number
}

export interface LTVDistributionData {
  ltv_tier: string
  partner_count: number
  average_ltv: number
  total_ltv: number
  percentage: number
}

export interface ForecastData {
  forecast_type: string
  forecast_period: string
  predicted_value: number
  confidence_level: number
  trend_direction: 'up' | 'down' | 'stable'
  forecast_date: string
}

// =====================================================
// ANALYTICS API TYPES
// =====================================================

export interface AnalyticsFilters {
  date_range?: {
    start: string
    end: string
  }
  partner_ids?: string[]
  tiers?: string[]
  segments?: string[]
  cohorts?: string[]
  period_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  metrics?: string[]
}

export interface AnalyticsQuery {
  filters: AnalyticsFilters
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min'
  group_by?: string[]
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface AnalyticsResponse<T> {
  data: T
  metadata: {
    total_count: number
    filtered_count: number
    aggregations?: Record<string, number>
    query_time_ms: number
  }
  filters_applied: AnalyticsFilters
  success: boolean
  message?: string
}

// =====================================================
// COHORT ANALYSIS TYPES
// =====================================================

export interface CohortDefinition {
  name: string
  start_date: string
  end_date?: string
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  criteria: {
    partner_tier?: string[]
    signup_source?: string[]
    initial_revenue_range?: {
      min: number
      max: number
    }
  }
}

export interface CohortMetrics {
  cohort_id: string
  cohort_name: string
  size: number
  retention_by_period: Record<string, number>
  revenue_by_period: Record<string, number>
  ltv_progression: Record<string, number>
  churn_events: {
    period: string
    churned_count: number
    churn_rate: number
  }[]
}

// =====================================================
// LTV PREDICTION TYPES
// =====================================================

export interface LTVPredictionInput {
  partner_id: string
  historical_months?: number
  prediction_horizon?: number
  include_seasonality?: boolean
  model_type?: 'simple' | 'regression' | 'ml'
}

export interface LTVPredictionResult {
  partner_id: string
  predicted_ltv: number
  confidence_score: number
  prediction_breakdown: {
    base_value: number
    growth_factor: number
    churn_adjustment: number
    seasonality_factor: number
  }
  risk_factors: {
    churn_probability: number
    revenue_volatility: number
    engagement_score: number
  }
  recommendations: string[]
}

// =====================================================
// PERFORMANCE FORECASTING TYPES
// =====================================================

export interface ForecastModel {
  name: string
  version: string
  type: 'linear' | 'exponential' | 'seasonal' | 'ml'
  accuracy: number
  training_period: {
    start: string
    end: string
  }
  parameters: Record<string, any>
}

export interface ForecastRequest {
  forecast_type: 'partner_performance' | 'revenue' | 'growth' | 'churn'
  target_id?: string
  forecast_horizon: number
  confidence_level: number
  model_preference?: string
  include_scenarios?: boolean
}

export interface ForecastResult {
  forecast_id: string
  forecast_type: string
  target_id?: string
  predictions: {
    period: string
    predicted_value: number
    confidence_interval: {
      lower: number
      upper: number
    }
    probability_distribution?: Record<string, number>
  }[]
  model_used: ForecastModel
  scenarios?: {
    optimistic: number
    realistic: number
    pessimistic: number
  }
  key_drivers: {
    factor: string
    impact: number
    confidence: number
  }[]
}

// =====================================================
// ANALYTICS REPORTING TYPES
// =====================================================

export interface AnalyticsReport {
  id: string
  name: string
  description: string
  report_type: 'dashboard' | 'export' | 'scheduled'
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  recipients?: string[]
  filters: AnalyticsFilters
  visualizations: ReportVisualization[]
  created_at: string
  last_generated: string | null
  next_generation: string | null
}

export interface ReportVisualization {
  id: string
  type: 'chart' | 'table' | 'metric' | 'heatmap' | 'funnel'
  title: string
  data_source: string
  configuration: Record<string, any>
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

// =====================================================
// ANALYTICS ALERTS TYPES
// =====================================================

export interface AnalyticsAlert {
  id: string
  name: string
  description: string
  metric: string
  condition: 'above' | 'below' | 'equals' | 'change'
  threshold: number
  comparison_period?: string
  is_active: boolean
  recipients: string[]
  last_triggered: string | null
  trigger_count: number
  created_at: string
}

export interface AlertTrigger {
  alert_id: string
  triggered_at: string
  metric_value: number
  threshold_value: number
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
}

// =====================================================
// ANALYTICS UTILITIES
// =====================================================

export type AnalyticsMetric = 
  | 'revenue'
  | 'commission'
  | 'conversion_rate'
  | 'ltv'
  | 'churn_rate'
  | 'partner_count'
  | 'lead_count'
  | 'deal_size'
  | 'response_time'
  | 'satisfaction'

export type AnalyticsPeriod = 
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

export type AnalyticsAggregation = 
  | 'sum'
  | 'avg'
  | 'count'
  | 'max'
  | 'min'
  | 'median'
  | 'percentile'

export interface AnalyticsCalculation {
  metric: AnalyticsMetric
  aggregation: AnalyticsAggregation
  period: AnalyticsPeriod
  filters?: AnalyticsFilters
  comparison?: {
    type: 'previous_period' | 'same_period_last_year' | 'baseline'
    value?: number
  }
}

// =====================================================
// EXPORT ALL ANALYTICS TYPES
// =====================================================

export type {
  PartnerAnalytics,
  CohortAnalysis,
  LTVCalculation,
  PerformanceForecast,
  AnalyticsSnapshot,
  AnalyticsDashboardData,
  TimeSeriesData,
  PartnerPerformanceData,
  CohortRetentionData,
  LTVDistributionData,
  ForecastData,
  AnalyticsFilters,
  AnalyticsQuery,
  AnalyticsResponse,
  CohortDefinition,
  CohortMetrics,
  LTVPredictionInput,
  LTVPredictionResult,
  ForecastModel,
  ForecastRequest,
  ForecastResult,
  AnalyticsReport,
  ReportVisualization,
  AnalyticsAlert,
  AlertTrigger,
  AnalyticsCalculation
} 