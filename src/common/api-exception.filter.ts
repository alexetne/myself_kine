import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request & { requestId?: string }>();
    const response = http.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : undefined;
    const detail = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
    const validationMessages = Array.isArray(detail.message) ? detail.message.map(String) : [];
    const stableCode = typeof detail.code === 'string' ? detail.code : status === 400 ? 'VALIDATION_FAILED' : status === 401 ? 'AUTHENTICATION_REQUIRED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'RESOURCE_NOT_FOUND' : status === 409 ? 'VERSION_CONFLICT' : status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR';
    response.status(status).json({
      error: {
        code: stableCode,
        user_message: status >= 500 ? 'Une erreur est survenue.' : typeof detail.user_message === 'string' ? detail.user_message : 'La demande ne peut pas être traitée.',
        technical_message: status >= 500 ? 'Internal server error.' : typeof detail.technical_message === 'string' ? detail.technical_message : exception instanceof Error ? exception.message : 'Request failed.',
        invalid_fields: validationMessages.map((message) => ({ field: message.split(' ')[0], code: 'INVALID' })),
        request_id: request.requestId ?? 'unknown'
      }
    });
  }
}
