interface IResponseMetadata {
  statusCode: number;
  timestamp: string;
}

/** Base for all responses, contains shared metadata */
export interface ISuccessResponse<T> extends IResponseMetadata {
  success: true;
  data: T | null; // T is the payload, null for 204 responses
  message?: string; // Optional success message
}

/** Standardized structure for all error API responses */
export interface IErrorResponse extends IResponseMetadata {
  success: false;
  errorType: string; // e.g., 'NotFoundException', 'BadRequestException'
  messages: string[];
}
