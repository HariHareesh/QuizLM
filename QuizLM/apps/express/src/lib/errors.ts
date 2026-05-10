export class ServerError extends Error {
    statusCode: number;
    override message: string;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.name = "ServerError";
        Object.defineProperty(this, 'stack', {
            value: undefined,
            writable: false
        });
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class DatabaseError extends ServerError {
    constructor(message: string, status?: number) {
        super(status || 500, message);
        this.name = "DatabaseError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class AuthError extends ServerError {
    constructor(message: string, status?: number) {
        super(status||401, message);
        this.name = "AuthError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class DuplicateActionError extends ServerError {
    constructor(message: string, status?: number) {
        super(status || 409, message);
        this.name = "DuplicateActionError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class EnvironmentError extends ServerError {
    constructor(key: string) {
        super(500, `Environment variable not set: ${key}`);
        this.name = "EnvironmentError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class ImpossibleTaskError extends ServerError {
    constructor(message: string, status?: number) {
        super(status || 500, message);
        this.name = "ImpossibleTaskError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class InvalidDataError extends ServerError {
    constructor(message: string, status?: number) {
        super(status || 400, message);
        this.name = "InvalidDataError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class InvalidInputError extends ServerError {
    constructor(message: string, status?: number) {
        super(status || 400, message);
        this.name = "InvalidInputError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}


export class NotFoundError extends ServerError {
    constructor(message: string, status?: number) {
        super(status || 404, message);
        this.name = "NotFoundError";
    }

    override toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}