import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      error: {
        code: typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).code || 'INTERNAL_ERROR',
        message: exception.message,
        details: (exceptionResponse as any).details || [],
      },
    });
  }
}
