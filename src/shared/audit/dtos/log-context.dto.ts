import { EventType } from "../enums/event-type.enum";

export class LogContext {

    eventType: EventType;

    userId?: number;

    targetType?: string;

    targetId?: number;

    sourceIp?: string;

    description?: string;

    original?: string;

    changes?: string;
}
