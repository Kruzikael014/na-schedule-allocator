
export class ErrorBase extends Error {
  data: any
  status = 500
  constructor(data: any) {
    super();
    this.data = data
  }
}

export class NotFoundError extends ErrorBase {
  status = 404
  constructor(additionalContext?: any) {
    super({
      message: "Cannot find the data you're looking for!",
      ...additionalContext
    })
  }
}

export class ForbiddenError extends ErrorBase {
  status = 403
  constructor(additionalContext?: any) {
    super({
      message: "You're not allowed to access this resource!",
      ...additionalContext
    })
  }
}

export class InternalError extends ErrorBase {
  status = 500
  constructor(additionalContext?: any) {
    super({
      message: "The server running to an internal problem, please ask the developer for further information!",
      ...additionalContext
    })
  }
}

export class BadRequestError extends ErrorBase {
  status = 400
  constructor(additionalContext?: any) {
    super({
      message: "Request cannot be processed, please provide valid data by refering to documentation (if exists)!",
      ...additionalContext
    })
  }
}