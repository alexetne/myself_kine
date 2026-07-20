import { ArgumentsHost, BadRequestException } from "@nestjs/common";
import { ApiExceptionFilter } from "../src/common/api-exception.filter";

describe("ApiExceptionFilter", () => {
  it("returns a stable, non-sensitive validation contract", () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ requestId: "req_test_123" }),
        getResponse: () => ({ status, json }),
      }),
    } as unknown as ArgumentsHost;
    new ApiExceptionFilter().catch(
      new BadRequestException({
        message: ["fatigue must not be greater than 10"],
      }),
      host,
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: "VALIDATION_FAILED",
          request_id: "req_test_123",
        }),
      }),
    );
    expect(JSON.stringify(json.mock.calls)).not.toContain("stack");
  });
});
