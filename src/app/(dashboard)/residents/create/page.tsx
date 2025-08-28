'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { ResidentForm } from '@/components';
import { RATE_LIMITS } from '@/constants/resident-form';
import { useAuth } from '@/contexts';
import { useResidentOperations } from '@/hooks/crud/useResidentOperations';
import { useResidentFormURLParameters } from '@/hooks/useURLParameters';
import { useCSRFToken } from '@/lib/auth';
import {
  philippineCompliantLogger,
  auditLogger,
  npcComplianceLogger,
  generateSecureSessionId,
} from '@/lib/security/philippine-logging';
import { checkRateLimit, clearRateLimit, getRateLimitStatus } from '@/utils/input-sanitizer';
import { validateFormData, prepareFormSubmission } from '@/utils/resident-form-utils';

export const dynamic = 'force-dynamic';

const sessionId = generateSecureSessionId();

// Expose rate limit utilities in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).clearRateLimit = clearRateLimit;
  (window as any).getRateLimitStatus = getRateLimitStatus;
}

function CreateResidentForm() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { getToken: getCSRFToken } = useCSRFToken();

  const { createResident, validationErrors } = useResidentOperations({
    onSuccess: () => {
      auditLogger.info('Resident creation successful', {
        eventType: 'RESIDENT_CREATE_SUCCESS',
        userId: user?.id || 'anonymous',
        action: 'RESIDENT_CREATED',
        timestamp: new Date().toISOString(),
        sessionId,
        barangayOfficial: user?.role === 'barangay_official',
        complianceFramework: 'RA_10173_BSP_808',
        retentionPeriod: '7_YEARS',
      });

      npcComplianceLogger.info('Data processing completed', {
        dataCategory: 'PERSONAL_INFORMATION',
        processingPurpose: 'BARANGAY_RESIDENT_REGISTRATION',
        legalBasis: 'PERFORMANCE_OF_TASK_PUBLIC_INTEREST',
        dataSubjectCount: 1,
        sensitiveDataProcessed: false, // Never log if sensitive data was processed
        consentStatus: 'OBTAINED',
        timestamp: new Date().toISOString(),
        npcRegistrationRef: process.env.NPC_REGISTRATION_NUMBER,
      });

      toast.success('Resident created successfully!');
      router.push('/residents');
    },
    onError: error => {
      auditLogger.info('Resident creation failed', {
        eventType: 'RESIDENT_CREATE_FAILED',
        userId: user?.id || 'anonymous',
        action: 'RESIDENT_CREATE_ERROR',
        timestamp: new Date().toISOString(),
        sessionId,
        complianceFramework: 'RA_10173_BSP_808',
        retentionPeriod: '7_YEARS',
      });

      toast.error(error || 'Failed to create resident');
    },
  });

  const handleSubmit = useCallback(
    async (formData: any) => {
      try {
        const userIdentifier = user?.id || 'anonymous';

        // Check rate limit and provide helpful feedback
        if (
          !checkRateLimit(
            userIdentifier,
            RATE_LIMITS.FORM_SUBMISSION.MAX_ATTEMPTS,
            RATE_LIMITS.FORM_SUBMISSION.WINDOW_MS
          )
        ) {
          const status = getRateLimitStatus(userIdentifier);
          const waitTime = status.remainingTime ? Math.ceil(status.remainingTime / 1000 / 60) : 5;

          toast.error(
            `Too many submission attempts (${status.count}/5). Please wait ${waitTime} minutes before trying again.` +
              (process.env.NODE_ENV === 'development' ? ' Check console for reset option.' : '')
          );

          // In development, provide a way to reset the rate limit
          if (process.env.NODE_ENV === 'development') {
            philippineCompliantLogger.warn('Rate limit exceeded in development', {
              userIdentifier,
              attempts: status.count,
              waitTimeMinutes: waitTime,
              timestamp: new Date().toISOString(),
              complianceNote: 'DEV_RATE_LIMIT_WARNING',
            });

            // Auto-clear rate limit after 30 seconds in development to help with testing
            setTimeout(() => {
              philippineCompliantLogger.info(
                'Development mode: Auto-clearing rate limit after 30 seconds'
              );
              clearRateLimit(userIdentifier);
              toast.success('Rate limit cleared. You can now try submitting again.');
            }, 30000);
          }

          return;
        }

        philippineCompliantLogger.debug('Form processing initiated', {
          userId: user?.id || 'anonymous',
          timestamp: new Date().toISOString(),
          formFieldCount: Object.keys(formData).length,
          barangayCode: userProfile?.barangay_code?.substring(0, 3) + '***',
          hasPhilSysData: !!formData.philsys_card_number,
          hasVoterData: !!(formData.is_voter || formData.is_resident_voter),
          sessionId,
          complianceNote: 'RA_10173_COMPLIANT_DEV_LOG',
        });

        const validation = validateFormData(formData);
        if (!validation.isValid) {
          auditLogger.info('Form validation failed', {
            eventType: 'VALIDATION_FAILED',
            userId: user?.id || 'anonymous',
            action: 'FORM_VALIDATION',
            timestamp: new Date().toISOString(),
            sessionId,
            complianceFramework: 'RA_10173_BSP_808',
            retentionPeriod: '7_YEARS',
          });

          toast.error(validation.errors._form || 'Please correct the form errors');
          return;
        }

        const { transformedData, auditInfo } = prepareFormSubmission(
          formData,
          user?.id || 'anonymous',
          sessionId,
          userProfile?.barangay_code || ''
        );

        auditLogger.info('Resident registration attempt', {
          eventType: 'RESIDENT_FORM_PROCESSING',
          userId: auditInfo.userId,
          action: 'CREATE_RESIDENT_ATTEMPT',
          timestamp: auditInfo.timestamp,
          sessionId: auditInfo.sessionId,
          barangayOfficial: user?.role === 'barangay_official',
          complianceFramework: 'RA_10173_BSP_808',
          retentionPeriod: '7_YEARS',
        });

        npcComplianceLogger.info('Data processing event', {
          dataCategory: 'PERSONAL_INFORMATION',
          processingPurpose: 'BARANGAY_RESIDENT_REGISTRATION',
          legalBasis: 'PERFORMANCE_OF_TASK_PUBLIC_INTEREST',
          dataSubjectCount: 1,
          sensitiveDataProcessed: auditInfo.hasPhilSys,
          consentStatus: 'OBTAINED',
          timestamp: auditInfo.timestamp,
          npcRegistrationRef: process.env.NPC_REGISTRATION_NUMBER,
        });

        // Get CSRF token separately
        getCSRFToken();
        const result = await createResident(transformedData);

        if (!result?.success) {
          auditLogger.info('Form submission processing completed', {
            eventType: 'FORM_PROCESSING_STATUS',
            userId: user?.id || 'anonymous',
            action: 'PROCESSING_RESULT',
            timestamp: new Date().toISOString(),
            sessionId,
            complianceFramework: 'RA_10173_BSP_808',
            retentionPeriod: '7_YEARS',
          });
        }
      } catch {
        auditLogger.info('Form submission error', {
          eventType: 'FORM_SUBMISSION_ERROR',
          userId: user?.id || 'anonymous',
          action: 'SUBMISSION_EXCEPTION',
          timestamp: new Date().toISOString(),
          sessionId,
          complianceFramework: 'RA_10173_BSP_808',
          retentionPeriod: '7_YEARS',
        });

        toast.error('An unexpected error occurred. Please try again.');
      }
    },
    [user, userProfile, sessionId, createResident, getCSRFToken]
  );

  const { suggestedName, suggestedId, isPreFilled } = useResidentFormURLParameters();

  const initialData = useMemo(() => {
    const data: any = {};

    // Handle suggested ID with validation
    if (suggestedId && suggestedId.length > 0) {
      // Log ID parameter usage (for audit purposes)
      auditLogger.info('URL parameter processing', {
        eventType: 'URL_PARAM_PROCESSING',
        userId: user?.id || 'anonymous',
        action: 'ID_PREFILL',
        timestamp: new Date().toISOString(),
        sessionId,
        complianceFramework: 'RA_10173_BSP_808',
        retentionPeriod: '7_YEARS',
      });
    }

    return Object.keys(data).length > 0 ? data : undefined;
  }, [suggestedName, suggestedId, user?.id, sessionId]);

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/residents"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm/6 font-medium text-gray-600 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl/8 font-semibold text-gray-600 dark:text-gray-400">
            Add New Resident
          </h1>
          <p className="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">
            Complete the form to register a new resident in the system
          </p>

          {isPreFilled && suggestedName && (
            <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Form pre-filled:</strong> The name fields have been populated with "
                    {suggestedName}". You can edit these values as needed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {Object.keys(validationErrors).length > 0 && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                There were errors with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc space-y-1 pl-5">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <ResidentForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/residents')}
        hidePhysicalDetails={false}
        hideSectoralInfo={false}
      />
    </div>
  );
}

export default function CreateResidentPage() {
  return <CreateResidentForm />;
}
