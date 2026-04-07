import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { DocumentationDataApiService } from '../../core/services/documentation-data-api.service';
import { DocumentationApiService } from '../services/documentation-api.service';
import { RequestDocumentPageComponent } from './request-document-page.component';

describe('RequestDocumentPageComponent', () => {
  let fixture: ComponentFixture<RequestDocumentPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestDocumentPageComponent, HttpClientTestingModule],
      providers: [DocumentationApiService, DocumentationDataApiService],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestDocumentPageComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads document types on init', () => {
    fixture.detectChanges();
    const typesReq = httpMock.expectOne(`${environment.apiBaseUrl}/api/documentation/data/document-types`);
    typesReq.flush([
      {
        id: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
        name: 'Attestation',
        code: 'ATT',
        description: '',
        department: '',
        retentionDays: 365,
        workflowId: '',
        mandatory: false,
      },
    ]);
    fixture.detectChanges();
    expect(fixture.componentInstance.docTypes.length).toBe(1);
    expect(fixture.componentInstance.documentTypeKey).toBe('aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee');
  });
});
