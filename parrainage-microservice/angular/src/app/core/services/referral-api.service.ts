import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type {
  Referral,
  ReferralHistoryEntry,
  ReferralNotification,
  ReferralRule,
  NotificationPreferences,
  RoleFilter,
} from '../../shared/models/parrainage.models';

export interface UpdateReferralStatusRequest {
  status: string;
  actorId?: string;
  actorLabel?: string;
  comment?: string;
}

export interface UpdateReferralManualRequest {
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  position?: string;
  projectName?: string;
  status?: string;
  rewardAmount?: number;
}

export interface AssignRewardRequest {
  amount: number;
  actorId?: string;
  actorLabel?: string;
}

export interface UpsertReferralRuleRequest {
  id?: string;
  name: string;
  type: string;
  value: number;
  target?: string;
  status: string;
}

export interface SubmitReferralRequest {
  referrerId: string;
  referrerName: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  position: string;
  project?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class ReferralApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/parrainage`;

  constructor(private readonly http: HttpClient) {}

  getAllReferrals(): Observable<Referral[]> {
    return this.http.get<Referral[]>(`${this.baseUrl}/referrals`);
  }

  getReferralById(id: string): Observable<Referral> {
    return this.http.get<Referral>(`${this.baseUrl}/referrals/${id}`);
  }

  submitReferral(payload: SubmitReferralRequest): Observable<Referral> {
    return this.http.post<Referral>(`${this.baseUrl}/referrals/submit`, payload);
  }

  updateStatus(id: string, payload: UpdateReferralStatusRequest): Observable<Referral> {
    return this.http.put<Referral>(`${this.baseUrl}/referrals/${id}/status`, payload);
  }

  updateManual(id: string, payload: UpdateReferralManualRequest): Observable<Referral> {
    return this.http.put<Referral>(`${this.baseUrl}/referrals/${id}/manual`, payload);
  }

  assignReward(id: string, payload: AssignRewardRequest): Observable<Referral> {
    return this.http.put<Referral>(`${this.baseUrl}/referrals/${id}/reward`, payload);
  }

  getSuggestedReward(referralId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/referrals/${referralId}/suggested-reward`);
  }

  getHistory(): Observable<ReferralHistoryEntry[]> {
    return this.http.get<ReferralHistoryEntry[]>(`${this.baseUrl}/history`);
  }

  getRules(): Observable<ReferralRule[]> {
    return this.http.get<ReferralRule[]>(`${this.baseUrl}/rules`);
  }

  upsertRule(payload: UpsertReferralRuleRequest): Observable<ReferralRule> {
    return this.http.put<ReferralRule>(`${this.baseUrl}/rules`, payload);
  }

  deleteRule(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/rules/${id}`);
  }

  getNotifications(role?: RoleFilter, userId?: string, projectId?: string): Observable<ReferralNotification[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    if (userId) params = params.set('userId', userId);
    if (projectId) params = params.set('projectId', projectId);
    const hasAny = !!role || !!userId || !!projectId;
    return this.http.get<ReferralNotification[]>(`${this.baseUrl}/notifications`, { params: hasAny ? params : undefined });
  }

  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.baseUrl}/notifications/preferences`);
  }

  updateNotificationPreferences(payload: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.baseUrl}/notifications/preferences`, payload);
  }

  markNotificationAsRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/notifications/read-all`, {});
  }
}

