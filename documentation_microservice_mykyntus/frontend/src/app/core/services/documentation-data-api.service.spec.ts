import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { DocumentationDataApiService } from './documentation-data-api.service';

describe('DocumentationDataApiService', () => {
  let service: DocumentationDataApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentationDataApiService],
    });
    service = TestBed.inject(DocumentationDataApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('createDocumentRequest posts to /api/documentation/data/document-requests', () => {
    const payload = {
      isCustomType: false,
      documentTypeId: 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee',
      reason: 'test',
    };
    const mockResponse = {
      id: '1',
      internalId: 'uuid',
      type: 'X',
      requestDate: '2026-01-01',
      status: 'pending',
      employeeName: 'A',
      employeeId: null,
      reason: 'test',
      isCustomType: false,
      allowedActions: [],
      rejectionReason: null,
      decidedAt: null,
    };

    service.createDocumentRequest(payload).subscribe((res) => {
      expect(res.id).toBe('1');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/api/documentation/data/document-requests`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(jasmine.objectContaining({ isCustomType: false }));
    req.flush(mockResponse);
  });
});
